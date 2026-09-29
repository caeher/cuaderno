import { paginationOptsValidator, paginationResultValidator } from "convex/server"
import { v } from "convex/values"

import type { Id } from "./_generated/dataModel"
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import { requireTenantAuth } from "./lib/auth"
import { validateCustomDomainHostname } from "../lib/custom-domain-policy"

const statusValidator = v.union(v.literal("pending"), v.literal("verified"), v.literal("revoked"))
export const claimViewValidator = v.object({
  _id: v.id("customDomainClaims"),
  hostname: v.string(),
  verificationHost: v.string(),
  challenge: v.string(),
  challengeVersion: v.number(),
  status: statusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
  expiresAt: v.number(),
  verifiedAt: v.union(v.number(), v.null()),
  lastCheckedAt: v.union(v.number(), v.null()),
})
const nullableClaimViewValidator = v.union(claimViewValidator, v.null())

function configuredPlatformRoot(): string | undefined {
  return (
    process.env.PLATFORM_ROOT_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  )
}

function assertCanManageDomain(identity: {
  tenantType: "organization" | "user"
  orgRole: string | null
}) {
  if (identity.tenantType === "organization" && !["org:admin", "org:owner"].includes(identity.orgRole ?? "")) {
    throw new Error("Solo un administrador de la organización puede gestionar el dominio.")
  }
}

async function getManagedProfile(
  ctx: QueryCtx | MutationCtx,
  tenantId: string,
  clerkUserId: string
) {
  const isPersonalTenant = tenantId === clerkUserId
  const profiles = isPersonalTenant
    ? await ctx.db
        .query("users")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
        .take(2)
    : await ctx.db
        .query("users")
        .withIndex("by_public_tenant_id", (q) => q.eq("publicTenantId", tenantId))
        .take(2)

  if (profiles.length !== 1) {
    throw new Error("No se encontró un perfil público único para esta cuenta.")
  }

  const profile = profiles[0]!
  if (
    (isPersonalTenant && profile.publicTenantId && profile.publicTenantId !== tenantId) ||
    (!isPersonalTenant && profile.publicTenantId !== tenantId)
  ) {
    throw new Error("El blog no está asociado al tenant activo. Cambia al tenant correcto para gestionar su dominio.")
  }

  return profile
}

async function getActiveClaimsForTenant(ctx: QueryCtx | MutationCtx, tenantId: string) {
  const [pending, verified] = await Promise.all([
    ctx.db
      .query("customDomainClaims")
      .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", tenantId).eq("status", "pending"))
      .take(2),
    ctx.db
      .query("customDomainClaims")
      .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", tenantId).eq("status", "verified"))
      .take(2),
  ])

  if (pending.length > 1 || verified.length > 1 || pending.length + verified.length > 1) {
    throw new Error("El tenant tiene reclamaciones activas ambiguas; requiere revisión operativa.")
  }
  return [...pending, ...verified]
}

function toClaimView(claim: NonNullable<Awaited<ReturnType<typeof getActiveClaimsForTenant>>[number]>) {
  return {
    _id: claim._id,
    hostname: claim.hostname,
    verificationHost: claim.verificationHost,
    challenge: claim.challenge,
    challengeVersion: claim.challengeVersion,
    status: claim.status,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
    expiresAt: claim.expiresAt,
    verifiedAt: claim.verifiedAt ?? null,
    lastCheckedAt: claim.lastCheckedAt ?? null,
  }
}

async function getClaimOwnedByIdentity(
  ctx: QueryCtx | MutationCtx,
  tenantId: string,
  clerkUserId: string
) {
  const profile = await getManagedProfile(ctx, tenantId, clerkUserId)
  const claims = await getActiveClaimsForTenant(ctx, tenantId)
  const claim = claims[0]
  return claim?.userId === profile._id ? claim : null
}

export const current = query({
  args: {},
  returns: nullableClaimViewValidator,
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx)
    assertCanManageDomain(identity)
    const claim = await getClaimOwnedByIdentity(ctx, identity.tenantId, identity.userId)
    return claim ? toClaimView(claim) : null
  },
})

export const remove = mutation({
  args: {},
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx)
    assertCanManageDomain(identity)
    return await removeClaimForTenantHandler(ctx, identity.tenantId, identity.userId, Date.now())
  },
})

export async function removeClaimForTenantHandler(
  ctx: MutationCtx,
  tenantId: string,
  clerkUserId: string,
  now: number
) {
  const claim = await getClaimOwnedByIdentity(ctx, tenantId, clerkUserId)
  if (!claim) return { removed: false }

  await ctx.db.patch(claim._id, { status: "revoked", revokedAt: now, updatedAt: now })
  const profile = await ctx.db.get(claim.userId)
  if (profile && (profile.customDomain || profile.verifiedCustomDomain)) {
    await ctx.db.patch(profile._id, { customDomain: undefined, verifiedCustomDomain: undefined })
  }
  return { removed: true }
}

const startClaimArgs = {
  tenantId: v.string(),
  clerkUserId: v.string(),
  hostname: v.string(),
  challenge: v.string(),
  now: v.number(),
  expiresAt: v.number(),
}

export async function startClaimHandler(
  ctx: MutationCtx,
  args: {
    tenantId: string
    clerkUserId: string
    hostname: string
    challenge: string
    now: number
    expiresAt: number
  }
) {
  const profile = await getManagedProfile(ctx, args.tenantId, args.clerkUserId)
  const hostname = validateCustomDomainHostname(args.hostname, configuredPlatformRoot())
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(args.challenge)) {
    throw new Error("No se pudo generar un desafío de verificación válido.")
  }
  if (args.expiresAt <= args.now || args.expiresAt - args.now > 24 * 60 * 60 * 1000) {
    throw new Error("La vigencia del desafío no es válida.")
  }

  const matches = await ctx.db
    .query("customDomainClaims")
    .withIndex("by_hostname", (q) => q.eq("hostname", hostname))
    .take(2)
  if (matches.length > 1) {
    throw new Error("Hay más de una reclamación para este host; requiere revisión operativa.")
  }

  const existing = matches[0]
  if (existing && existing.tenantId !== args.tenantId) {
    const isUnexpiredPending = existing.status === "pending" && existing.expiresAt > args.now
    if (existing.status === "verified" || isUnexpiredPending) {
      throw new Error("Ese host ya está reclamado por otro tenant.")
    }
  }

  const activeClaims = await getActiveClaimsForTenant(ctx, args.tenantId)
  if (existing?.status === "verified" && existing.tenantId === args.tenantId) {
    return toClaimView(existing)
  }

  for (const activeClaim of activeClaims) {
    if (activeClaim._id !== existing?._id) {
      await ctx.db.patch(activeClaim._id, {
        status: "revoked",
        revokedAt: args.now,
        updatedAt: args.now,
      })
    }
  }

  const claimFields = {
    tenantId: args.tenantId,
    userId: profile._id,
    hostname,
    verificationHost: `_cuaderno-verification.${hostname}`,
    challenge: args.challenge,
    challengeVersion: (existing?.challengeVersion ?? 0) + 1,
    status: "pending" as const,
    createdAt: existing?.tenantId === args.tenantId ? existing.createdAt : args.now,
    updatedAt: args.now,
    expiresAt: args.expiresAt,
    verifiedAt: undefined,
    revokedAt: undefined,
    lastCheckedAt: undefined,
  }

  const claimId = existing
    ? existing._id
    : await ctx.db.insert("customDomainClaims", claimFields)
  if (existing) await ctx.db.patch(existing._id, claimFields)

  if (profile.customDomain || profile.verifiedCustomDomain) {
    await ctx.db.patch(profile._id, { customDomain: undefined, verifiedCustomDomain: undefined })
  }
  const claim = await ctx.db.get(claimId)
  if (!claim) throw new Error("No se pudo guardar la reclamación del dominio.")
  return toClaimView(claim)
}

export const beginClaimInternal = internalMutation({
  args: startClaimArgs,
  returns: claimViewValidator,
  handler: startClaimHandler,
})

export const getClaimForVerificationInternal = internalQuery({
  args: { tenantId: v.string(), clerkUserId: v.string() },
  returns: nullableClaimViewValidator,
  handler: async (ctx, args) => {
    const claim = await getClaimOwnedByIdentity(ctx, args.tenantId, args.clerkUserId)
    return claim ? toClaimView(claim) : null
  },
})

const verificationAttemptArgs = {
  claimId: v.id("customDomainClaims"),
  tenantId: v.string(),
  clerkUserId: v.string(),
  challenge: v.string(),
  challengeVersion: v.number(),
  checkedAt: v.number(),
}

export const recordVerificationAttemptInternal = internalMutation({
  args: verificationAttemptArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await getManagedProfile(ctx, args.tenantId, args.clerkUserId)
    const claim = await ctx.db.get(args.claimId)
    if (
      claim?.tenantId === args.tenantId &&
      claim.userId === profile._id &&
      claim.status === "pending" &&
      claim.challenge === args.challenge &&
      claim.challengeVersion === args.challengeVersion
    ) {
      await ctx.db.patch(claim._id, { lastCheckedAt: args.checkedAt, updatedAt: args.checkedAt })
    }
    return null
  },
})

export async function completeVerificationHandler(
  ctx: MutationCtx,
  args: {
    claimId: Id<"customDomainClaims">
    tenantId: string
    clerkUserId: string
    challenge: string
    challengeVersion: number
    checkedAt: number
  },
  persistedAt = Date.now()
) {
  const profile = await getManagedProfile(ctx, args.tenantId, args.clerkUserId)
  const claim = await ctx.db.get(args.claimId)
  if (
    !claim ||
    claim.tenantId !== args.tenantId ||
    claim.userId !== profile._id ||
    claim.status !== "pending" ||
    claim.challenge !== args.challenge ||
    claim.challengeVersion !== args.challengeVersion
  ) {
    throw new Error("La reclamación cambió mientras se verificaba. Actualiza el estado e inténtalo de nuevo.")
  }
  if (claim.expiresAt <= args.checkedAt || claim.expiresAt <= persistedAt) {
    throw new Error("El desafío DNS caducó. Genera uno nuevo y vuelve a publicarlo.")
  }

  const hostnameClaims = await ctx.db
    .query("customDomainClaims")
    .withIndex("by_hostname", (q) => q.eq("hostname", claim.hostname))
    .take(2)
  if (hostnameClaims.length !== 1 || hostnameClaims[0]?._id !== claim._id) {
    throw new Error("La reclamación dejó de ser exclusiva antes de completar la verificación.")
  }

  await ctx.db.patch(claim._id, {
    status: "verified",
    verifiedAt: persistedAt,
    lastCheckedAt: args.checkedAt,
    updatedAt: persistedAt,
  })
  await ctx.db.patch(profile._id, { verifiedCustomDomain: claim.hostname })
  const verified = await ctx.db.get(claim._id)
  if (!verified) throw new Error("No se pudo guardar la verificación DNS.")
  return toClaimView(verified)
}

export const completeVerificationInternal = internalMutation({
  args: { ...verificationAttemptArgs },
  returns: claimViewValidator,
  handler: completeVerificationHandler,
})

/** Legacy inventory is intentionally paginated and never marks domains as verified. */
export const legacyDomainInventoryInternal = internalQuery({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(
    v.object({
      userId: v.id("users"),
      tenantId: v.string(),
      username: v.string(),
      customDomain: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("users").order("asc").paginate(args.paginationOpts)
    return {
      ...page,
      page: page.page
        .filter((user) => Boolean(user.customDomain))
        .map((user) => ({
          userId: user._id,
          tenantId: user.publicTenantId ?? user.clerkUserId ?? user.legacyId ?? (user._id as string),
          username: user.username,
          customDomain: user.customDomain ?? null,
        })),
    }
  },
})
