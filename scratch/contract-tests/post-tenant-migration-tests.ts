import type { MutationCtx } from "@/convex/_generated/server"
import { normalizePostTenantBatchHandler } from "@/convex/postTenantMigration"

type TestDoc = Record<string, unknown> & { _id: string; _creationTime: number }
type IndexBuilder = { eq(field: string, value: unknown): IndexBuilder }

function makeContext() {
  const users: TestDoc[] = [
    {
      _id: "users:author-a",
      _creationTime: 1,
      legacyId: "legacy-a",
      clerkUserId: "user-a",
      username: "a",
    },
    {
      _id: "users:author-b",
      _creationTime: 2,
      legacyId: "legacy-b",
      clerkUserId: "user-b",
      username: "b",
    },
    {
      _id: "users:duplicate-a",
      _creationTime: 3,
      legacyId: "legacy-duplicate-a",
      clerkUserId: "user-duplicate-a",
      username: "duplicated",
    },
    {
      _id: "users:duplicate-b",
      _creationTime: 4,
      legacyId: "legacy-duplicate-b",
      clerkUserId: "user-duplicate-b",
      username: "duplicated",
    },
    {
      _id: "users:legacy-identity-collision",
      _creationTime: 5,
      legacyId: "shared-identity",
      clerkUserId: "user-legacy-collision",
      username: "legacy-collision",
    },
    {
      _id: "users:clerk-identity-collision",
      _creationTime: 6,
      legacyId: "legacy-clerk-collision",
      clerkUserId: "shared-identity",
      username: "clerk-collision",
    },
  ]
  const posts: TestDoc[] = [
    {
      _id: "posts:legacy-a",
      _creationTime: 1,
      authorId: "legacy-a",
      authorDocId: "users:author-a",
      slug: "a-legacy",
      status: "published",
    },
    {
      _id: "posts:org-a",
      _creationTime: 2,
      authorId: "user-a",
      organizationId: "org-a",
      slug: "org-legacy",
      status: "draft",
    },
    {
      _id: "posts:mismatch",
      _creationTime: 3,
      authorId: "legacy-a",
      authorDocId: "users:author-b",
      slug: "ambiguous",
      status: "published",
    },
    {
      _id: "posts:collision-existing",
      _creationTime: 4,
      authorId: "user-a",
      tenantId: "user-a",
      slug: "collision",
      status: "published",
    },
    {
      _id: "posts:collision-legacy",
      _creationTime: 5,
      authorId: "legacy-a",
      authorDocId: "users:author-a",
      slug: "collision",
      status: "draft",
    },
    {
      _id: "posts:duplicate-username",
      _creationTime: 7,
      authorId: "duplicated",
      authorDocId: "users:author-a",
      slug: "ambiguous-username",
      status: "published",
    },
    {
      _id: "posts:cross-identity-collision",
      _creationTime: 8,
      authorId: "shared-identity",
      slug: "ambiguous-identity",
      status: "published",
    },
    {
      _id: "posts:tenant-org-mismatch",
      _creationTime: 9,
      authorId: "user-a",
      tenantId: "user-a",
      organizationId: "org-a",
      slug: "tenant-org-mismatch",
      status: "published",
    },
  ]
  const tables = { users, posts }

  const db = {
    query(table: "users" | "posts") {
      return {
        withIndex(_index: string, build: (q: IndexBuilder) => IndexBuilder) {
          const filters: Array<[string, unknown]> = []
          const builder: IndexBuilder = {
            eq(field, value) {
              filters.push([field, value])
              return builder
            },
          }
          build(builder)
          const matching = () =>
            tables[table].filter((doc) => filters.every(([field, value]) => doc[field] === value))
          return {
            collect: async () => matching(),
            first: async () => matching()[0] ?? null,
          }
        },
        paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
          const start = cursor ? Number(cursor) : 0
          const page = posts.slice(start, start + numItems)
          const next = start + page.length
          return {
            page,
            continueCursor: next < posts.length ? String(next) : null,
            isDone: next >= posts.length,
          }
        },
      }
    },
    normalizeId(table: "users" | "posts", id: string) {
      return tables[table].some((doc) => doc._id === id) ? id : null
    },
    async get(id: string) {
      return [...users, ...posts].find((doc) => doc._id === id) ?? null
    },
    async patch(id: string, updates: Record<string, unknown>) {
      const doc = posts.find((candidate) => candidate._id === id)
      if (doc) Object.assign(doc, updates)
    },
  }

  return { ctx: { db } as unknown as MutationCtx, posts }
}

export async function runPostTenantMigrationTests(): Promise<{ totalPassed: number; totalFailed: number }> {
  let totalPassed = 0
  let totalFailed = 0
  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`  ✅ [Post Tenant Migration] PASS: ${message}`)
      totalPassed++
    } else {
      console.error(`  ❌ [Post Tenant Migration] FAIL: ${message}`)
      totalFailed++
    }
  }

  const { ctx, posts } = makeContext()
  const firstRun = await normalizePostTenantBatchHandler(ctx, { cursor: null, numItems: 100 })
  assert(
    posts.find((post) => post._id === "posts:legacy-a")?.tenantId === "user-a" &&
      posts.find((post) => post._id === "posts:org-a")?.tenantId === "org-a",
    "normaliza posts personales y organizacionales usando referencias explícitas"
  )
  assert(
    firstRun.ambiguous.some((item) => item.id === "posts:mismatch" && item.reason === "author_mismatch") &&
      !posts.find((post) => post._id === "posts:mismatch")?.tenantId,
    "informa y deja intactas las identidades de autor que discrepan"
  )
  assert(
    firstRun.ambiguous.some(
      (item) => item.id === "posts:duplicate-username" && item.reason === "author_identity_ambiguous"
    ) && !posts.find((post) => post._id === "posts:duplicate-username")?.tenantId,
    "no elige un perfil cuando un identificador heredado coincide con varios usuarios"
  )
  assert(
    firstRun.ambiguous.some(
      (item) => item.id === "posts:cross-identity-collision" && item.reason === "author_identity_ambiguous"
    ) && !posts.find((post) => post._id === "posts:cross-identity-collision")?.tenantId,
    "no elige entre perfiles cuando una cadena coincide con campos de identidad distintos"
  )
  assert(
    firstRun.ambiguous.some(
      (item) => item.id === "posts:tenant-org-mismatch" && item.reason === "tenant_mismatch"
    ) && posts.find((post) => post._id === "posts:tenant-org-mismatch")?.tenantId === "user-a",
    "reporta tenantId y organizationId discrepantes sin reescribir el propietario"
  )
  assert(
    firstRun.collisions.some(
      (item) => item.tenantId === "user-a" && item.slug === "collision" && item.postIds.length === 2
    ),
    "reporta colisiones incluyendo posts existentes publicados o privados"
  )

  const secondRun = await normalizePostTenantBatchHandler(ctx, { cursor: null, numItems: 100 })
  assert(
    secondRun.normalized === 0 && posts.length === 8,
    "repetir la migración no vuelve a modificar ni elimina registros"
  )

  console.log(`  📊 Post tenant migration: ${totalPassed} pasaron | ${totalFailed} fallaron`)
  return { totalPassed, totalFailed }
}
