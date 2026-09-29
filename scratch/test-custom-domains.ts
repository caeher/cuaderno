import assert from "node:assert/strict"
import type { MutationCtx, QueryCtx } from "../convex/_generated/server"
import {
  completeVerificationHandler,
  removeClaimForTenantHandler,
  startClaimHandler,
} from "../convex/customDomains"
import { hasExpectedTxtRecord } from "../convex/lib/customDomainVerification"
import { getByCustomDomainHandler } from "../convex/users"
import { createCustomDomainResolver } from "../lib/custom-domain"
import {
  normalizeCustomDomainHostHeader,
  normalizeCustomDomainHostname,
  validateCustomDomainHostname,
} from "../lib/custom-domain-policy"

type Row = Record<string, unknown> & { _id: string; _creationTime: number }

class FakeDatabase {
  readonly users = new Map<string, Row>()
  readonly claims = new Map<string, Row>()
  private nextId = 1

  addUser(id: string, clerkUserId: string, publicTenantId?: string) {
    this.users.set(id, {
      _id: id,
      _creationTime: 1,
      clerkUserId,
      username: clerkUserId.replace(/^(user_|user-)/, "tenant-"),
      ...(publicTenantId ? { publicTenantId } : {}),
    })
  }

  private rows(table: string): Map<string, Row> {
    return table === "users" ? this.users : this.claims
  }

  async get(id: string) {
    const row = this.users.get(id) ?? this.claims.get(id)
    return row ? structuredClone(row) : null
  }

  async insert(table: string, document: Record<string, unknown>) {
    const id = `${table}_${this.nextId++}`
    this.rows(table).set(id, { ...structuredClone(document), _id: id, _creationTime: Date.now() })
    return id
  }

  async patch(id: string, fields: Record<string, unknown>) {
    const row = this.users.get(id) ?? this.claims.get(id)
    if (!row) throw new Error(`Missing fake row ${id}`)
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined) delete row[field]
      else row[field] = value
    }
  }

  query(table: string) {
    const database = this
    return {
      withIndex(_index: string, buildRange: (query: { eq: (field: string, value: unknown) => unknown }) => unknown) {
        const filters: Array<[string, unknown]> = []
        const query = {
          eq(field: string, value: unknown) {
            filters.push([field, value])
            return query
          },
        }
        buildRange(query)
        const matches = () =>
          [...database.rows(table).values()].filter((row) =>
            filters.every(([field, value]) => row[field] === value)
          )
        return {
          first: async () => structuredClone(matches()[0] ?? null),
          take: async (count: number) => structuredClone(matches().slice(0, count)),
          collect: async () => structuredClone(matches()),
        }
      },
    }
  }
}

function mutationContext(database: FakeDatabase) {
  return { db: database } as unknown as MutationCtx
}

function queryContext(database: FakeDatabase) {
  return { db: database } as unknown as QueryCtx
}

function claimArgs(options: {
  tenantId: string
  clerkUserId: string
  hostname: string
  challenge: string
  now: number
  expiresAt?: number
}) {
  return {
    tenantId: options.tenantId,
    clerkUserId: options.clerkUserId,
    hostname: options.hostname,
    challenge: options.challenge,
    now: options.now,
    expiresAt: options.expiresAt ?? options.now + 60 * 60 * 1000,
  }
}

async function run() {
  process.env.PLATFORM_ROOT_DOMAIN = "platform.example"

  // Host parsing is strict and www/apex remain distinct.
  assert.equal(normalizeCustomDomainHostname(" Blog.Example.com. "), "blog.example.com")
  assert.equal(normalizeCustomDomainHostname("www.blog.example.com"), "www.blog.example.com")
  assert.notEqual(
    normalizeCustomDomainHostname("blog.example.com"),
    normalizeCustomDomainHostname("www.blog.example.com")
  )
  assert.equal(normalizeCustomDomainHostHeader("BLOG.EXAMPLE.COM:443"), "blog.example.com")
  for (const invalid of [
    "https://blog.example.com",
    "blog.example.com/path",
    "user@blog.example.com",
    "blog.example.com:8443",
    "127.0.0.1",
    "blog..example.com",
    "-blog.example.com",
  ]) {
    assert.equal(normalizeCustomDomainHostname(invalid), null, `${invalid} debe rechazarse`)
  }
  assert.throws(() => validateCustomDomainHostname("platform.example", "platform.example"), /plataforma/)
  assert.throws(() => validateCustomDomainHostname("tenant.platform.example", "platform.example"), /plataforma/)
  assert.throws(() => validateCustomDomainHostname("site.localhost", "localhost:3000"), /plataforma/)
  assert.throws(() => validateCustomDomainHostname("customer.vercel.app", "platform.example"), /plataforma/)
  assert.throws(() => validateCustomDomainHostname("blog.example.com", undefined), /no está configurado/)

  // DNS/provider behavior is simulated: chunked TXT values join, invalid values fail, network errors propagate.
  const challengeValue = "cuaderno-domain-verification=challenge-token"
  assert.equal(
    await hasExpectedTxtRecord("_cuaderno-verification.blog.example.com", challengeValue, async () => [
      ["cuaderno-domain-verification=challenge-", "token"],
    ]),
    true
  )
  assert.equal(
    await hasExpectedTxtRecord("_cuaderno-verification.blog.example.com", challengeValue, async () => [
      ["cuaderno-domain-verification=wrong"],
    ]),
    false
  )
  await assert.rejects(
    hasExpectedTxtRecord("_cuaderno-verification.blog.example.com", challengeValue, async () => {
      throw new Error("simulated DNS SERVFAIL")
    }),
    /SERVFAIL/
  )

  const database = new FakeDatabase()
  database.addUser("user_doc_a", "user_a")
  database.addUser("user_doc_b", "user_b")
  database.addUser("user_doc_org", "user_admin", "org_a")
  const ctx = mutationContext(database)
  const tokenA = "A".repeat(43)
  const tokenB = "B".repeat(43)

  // Two overlapping tenants serialize through the transaction boundary; one hostname has one pending owner.
  let transactionTail = Promise.resolve()
  const serialStart = (args: ReturnType<typeof claimArgs>) => {
    const next = transactionTail.then(() => startClaimHandler(ctx, args))
    transactionTail = next.then(() => undefined, () => undefined)
    return next
  }
  const concurrent = await Promise.allSettled([
    serialStart(claimArgs({ tenantId: "user_a", clerkUserId: "user_a", hostname: "race.example.net", challenge: tokenA, now: 1000 })),
    serialStart(claimArgs({ tenantId: "user_b", clerkUserId: "user_b", hostname: "race.example.net", challenge: tokenB, now: 1000 })),
  ])
  assert.equal(concurrent.filter((result) => result.status === "fulfilled").length, 1)
  assert.equal(concurrent.filter((result) => result.status === "rejected").length, 1)
  assert.equal(database.claims.size, 1)
  assert.equal(
    await getByCustomDomainHandler(queryContext(database), { customDomain: "race.example.net" }),
    null,
    "una reclamación pendiente no enruta"
  )

  // Invalid TXT and DNS errors do not activate a claim; old challenges cannot verify a rotated challenge.
  const pending = await startClaimHandler(ctx, claimArgs({
    tenantId: "user_a",
    clerkUserId: "user_a",
    hostname: "verify.example.net",
    challenge: tokenA,
    now: 10_000,
  }))
  assert.equal(
    await hasExpectedTxtRecord(pending.verificationHost, `cuaderno-domain-verification=${pending.challenge}`, async () => []),
    false
  )
  await assert.rejects(
    hasExpectedTxtRecord(pending.verificationHost, `cuaderno-domain-verification=${pending.challenge}`, async () => {
      throw new Error("simulated DNS timeout")
    }),
    /timeout/
  )
  assert.equal((await database.get(pending._id))?.status, "pending")
  assert.equal(await getByCustomDomainHandler(queryContext(database), { customDomain: pending.hostname }), null)

  const rotated = await startClaimHandler(ctx, claimArgs({
    tenantId: "user_a",
    clerkUserId: "user_a",
    hostname: "verify.example.net",
    challenge: tokenB,
    now: 11_000,
  }))
  assert.equal(rotated.challengeVersion, pending.challengeVersion + 1)
  await assert.rejects(
    completeVerificationHandler(ctx, {
      claimId: pending._id,
      tenantId: "user_a",
      clerkUserId: "user_a",
      challenge: pending.challenge,
      challengeVersion: pending.challengeVersion,
      checkedAt: 12_000,
    }),
    /cambió/
  )
  const verified = await completeVerificationHandler(ctx, {
    claimId: rotated._id,
    tenantId: "user_a",
    clerkUserId: "user_a",
    challenge: rotated.challenge,
    challengeVersion: rotated.challengeVersion,
    checkedAt: 12_000,
  }, 12_000)
  assert.equal(verified.status, "verified")
  assert.deepEqual(await getByCustomDomainHandler(queryContext(database), { customDomain: rotated.hostname }), {
    username: "tenant-a",
    customDomain: "verify.example.net",
  })

  // Expired challenges cannot verify; after expiry another tenant can reclaim, and the old result stays stale.
  const expiresAt = 100_000
  const expiring = await startClaimHandler(ctx, claimArgs({
    tenantId: "user_a",
    clerkUserId: "user_a",
    hostname: "reassign.example.net",
    challenge: tokenA,
    now: 50_000,
    expiresAt,
  }))
  assert.equal(
    await getByCustomDomainHandler(queryContext(database), { customDomain: "verify.example.net" }),
    null,
    "iniciar otro hostname revoca la asociación verificada anterior"
  )
  await assert.rejects(
    completeVerificationHandler(ctx, {
      claimId: expiring._id,
      tenantId: "user_a",
      clerkUserId: "user_a",
      challenge: expiring.challenge,
      challengeVersion: expiring.challengeVersion,
      checkedAt: expiresAt,
    }, expiresAt),
    /caducó/
  )
  assert.equal(await getByCustomDomainHandler(queryContext(database), { customDomain: expiring.hostname }), null)
  const reassigned = await startClaimHandler(ctx, claimArgs({
    tenantId: "user_b",
    clerkUserId: "user_b",
    hostname: "reassign.example.net",
    challenge: tokenB,
    now: expiresAt + 1,
  }))
  assert.equal((await database.get(reassigned._id))?.tenantId, "user_b")
  await assert.rejects(
    completeVerificationHandler(ctx, {
      claimId: expiring._id,
      tenantId: "user_a",
      clerkUserId: "user_a",
      challenge: expiring.challenge,
      challengeVersion: expiring.challengeVersion,
      checkedAt: expiresAt + 2,
    }),
    /cambió/
  )

  const writeExpiry = 500_000
  const finishingAt = await startClaimHandler(ctx, claimArgs({
    tenantId: "user_b",
    clerkUserId: "user_b",
    hostname: "write-expiry.example.net",
    challenge: tokenA,
    now: 200_000,
    expiresAt: writeExpiry,
  }))
  await assert.rejects(
    completeVerificationHandler(ctx, {
      claimId: finishingAt._id,
      tenantId: "user_b",
      clerkUserId: "user_b",
      challenge: finishingAt.challenge,
      challengeVersion: finishingAt.challengeVersion,
      checkedAt: writeExpiry - 1,
    }, writeExpiry),
    /caducó/
  )
  assert.equal((await database.get(finishingAt._id))?.status, "pending")

  // Organization admins manage the mapped profile; explicit removal revokes routing state atomically.
  const orgClaim = await startClaimHandler(ctx, claimArgs({
    tenantId: "org_a",
    clerkUserId: "org_admin_other",
    hostname: "org.example.net",
    challenge: tokenA,
    now: 200_000,
  }))
  const orgVerified = await completeVerificationHandler(ctx, {
    claimId: orgClaim._id,
    tenantId: "org_a",
    clerkUserId: "org_admin_other",
    challenge: orgClaim.challenge,
    challengeVersion: orgClaim.challengeVersion,
    checkedAt: 201_000,
  }, 201_000)
  assert.equal(orgVerified.status, "verified")
  assert.deepEqual(
    await removeClaimForTenantHandler(ctx, "org_a", "org_admin_other", 202_000),
    { removed: true }
  )
  assert.equal((await database.get(orgClaim._id))?.status, "revoked")
  assert.equal(await getByCustomDomainHandler(queryContext(database), { customDomain: orgClaim.hostname }), null)

  // Routing cache expiry is deterministic: withdrawal can stay cached only for its positive TTL.
  let clock = 0
  let owner: string | null = "tenant-a"
  let lookupCount = 0
  const resolver = createCustomDomainResolver({
    lookup: async () => {
      lookupCount += 1
      return owner ? { username: owner } : null
    },
    now: () => clock,
    positiveTtlMs: 30_000,
    negativeTtlMs: 15_000,
    errorTtlMs: 5_000,
  })
  assert.equal(await resolver.resolve("blog.example.com:443"), "tenant-a")
  owner = null
  clock = 29_999
  assert.equal(await resolver.resolve("BLOG.EXAMPLE.COM"), "tenant-a")
  assert.equal(lookupCount, 1)
  clock = 30_000
  assert.equal(await resolver.resolve("blog.example.com"), null)
  assert.equal(lookupCount, 2)
  assert.equal(await resolver.resolve("www.blog.example.com"), null)
  assert.equal(lookupCount, 3, "www tiene caché y reclamación independientes")
  clock = 45_000
  assert.equal(await resolver.resolve("blog.example.com"), null)
  assert.equal(lookupCount, 4, "el TTL negativo también caduca")
  resolver.clear()

  let errorClock = 0
  let shouldFail = true
  let errorLookupCount = 0
  const errorResolver = createCustomDomainResolver({
    lookup: async () => {
      errorLookupCount += 1
      if (shouldFail) throw new Error("Convex unavailable")
      return { username: "tenant-recovered" }
    },
    now: () => errorClock,
    errorTtlMs: 5_000,
  })
  assert.equal(await errorResolver.resolve("error.example.com"), null)
  shouldFail = false
  errorClock = 4_999
  assert.equal(await errorResolver.resolve("error.example.com"), null)
  assert.equal(errorLookupCount, 1, "los errores se cachean solo por el TTL corto")
  errorClock = 5_000
  assert.equal(await errorResolver.resolve("error.example.com"), "tenant-recovered")
  assert.equal(errorLookupCount, 2)
  errorResolver.clear()

  console.log("custom domain claims, DNS simulation, concurrency and cache checks passed")
}

void run().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
