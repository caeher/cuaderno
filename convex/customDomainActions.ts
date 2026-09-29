"use node"

import { randomBytes } from "node:crypto"
import { Resolver } from "node:dns/promises"
import { v } from "convex/values"

import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { action, type ActionCtx } from "./_generated/server"
import { requireTenantAuth } from "./lib/auth"
import { hasExpectedTxtRecord } from "./lib/customDomainVerification"
import { validateCustomDomainHostname } from "../lib/custom-domain-policy"

const claimArgsValidator = v.object({ hostname: v.string() })
const claimViewValidator = v.object({
  _id: v.id("customDomainClaims"),
  hostname: v.string(),
  verificationHost: v.string(),
  challenge: v.string(),
  challengeVersion: v.number(),
  status: v.union(v.literal("pending"), v.literal("verified"), v.literal("revoked")),
  createdAt: v.number(),
  updatedAt: v.number(),
  expiresAt: v.number(),
  verifiedAt: v.union(v.number(), v.null()),
  lastCheckedAt: v.union(v.number(), v.null()),
})
type ClaimView = {
  _id: Id<"customDomainClaims">
  hostname: string
  verificationHost: string
  challenge: string
  challengeVersion: number
  status: "pending" | "verified" | "revoked"
  createdAt: number
  updatedAt: number
  expiresAt: number
  verifiedAt: number | null
  lastCheckedAt: number | null
}
const dnsChallengeLifetimeMs = 24 * 60 * 60 * 1000

function configuredPlatformRoot(): string | undefined {
  return (
    process.env.PLATFORM_ROOT_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  )
}

async function requireDomainManager(ctx: ActionCtx) {
  const identity = await requireTenantAuth(ctx)
  if (identity.tenantType === "organization" && !["org:admin", "org:owner"].includes(identity.orgRole ?? "")) {
    throw new Error("Solo un administrador de la organización puede gestionar el dominio.")
  }
  return identity
}

export const claim = action({
  args: claimArgsValidator,
  returns: claimViewValidator,
  handler: async (ctx: ActionCtx, args: { hostname: string }): Promise<ClaimView> => {
    const identity = await requireDomainManager(ctx)
    const hostname = validateCustomDomainHostname(args.hostname, configuredPlatformRoot())
    const now = Date.now()
    const challenge = randomBytes(32).toString("base64url")
    return await ctx.runMutation(internal.customDomains.beginClaimInternal, {
      tenantId: identity.tenantId,
      clerkUserId: identity.userId,
      hostname,
      challenge,
      now,
      expiresAt: now + dnsChallengeLifetimeMs,
    })
  },
})

function isNoTxtRecordError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code
  return code === "ENODATA" || code === "ENOTFOUND"
}

async function resolveTxt(hostname: string): Promise<string[][]> {
  const resolver = new Resolver({ timeout: 5000, tries: 1 })
  try {
    return await resolver.resolveTxt(hostname)
  } catch (error) {
    if (isNoTxtRecordError(error)) return []
    throw error
  }
}

export const verify = action({
  args: {},
  returns: claimViewValidator,
  handler: async (ctx: ActionCtx): Promise<ClaimView> => {
    const identity = await requireDomainManager(ctx)
    const currentClaim = await ctx.runQuery(internal.customDomains.getClaimForVerificationInternal, {
      tenantId: identity.tenantId,
      clerkUserId: identity.userId,
    })

    if (!currentClaim || currentClaim.status !== "pending") {
      throw new Error("No hay un dominio pendiente de verificación.")
    }

    const startedAt = Date.now()
    if (currentClaim.expiresAt <= startedAt) {
      throw new Error("El desafío DNS caducó. Genera uno nuevo y vuelve a publicarlo.")
    }

    const expectedValue = `cuaderno-domain-verification=${currentClaim.challenge}`
    let isVerified: boolean
    try {
      isVerified = await hasExpectedTxtRecord(currentClaim.verificationHost, expectedValue, resolveTxt)
    } catch {
      const checkedAt = Date.now()
      await recordAttempt(ctx, identity, currentClaim, checkedAt)
      throw new Error("No se pudo consultar DNS. Revisa la conexión e inténtalo de nuevo.")
    }

    const checkedAt = Date.now()
    if (currentClaim.expiresAt <= checkedAt) {
      throw new Error("El desafío DNS caducó durante la consulta. Genera uno nuevo y vuelve a publicarlo.")
    }

    if (!isVerified) {
      await recordAttempt(ctx, identity, currentClaim, checkedAt)
      throw new Error("Aún no encontramos el registro TXT exacto. Revisa el host y el valor, espera la propagación DNS e inténtalo de nuevo.")
    }

    return await ctx.runMutation(internal.customDomains.completeVerificationInternal, {
      claimId: currentClaim._id,
      tenantId: identity.tenantId,
      clerkUserId: identity.userId,
      challenge: currentClaim.challenge,
      challengeVersion: currentClaim.challengeVersion,
      checkedAt,
    })
  },
})

async function recordAttempt(
  ctx: ActionCtx,
  identity: Awaited<ReturnType<typeof requireDomainManager>>,
  claim: { _id: Id<"customDomainClaims">; challenge: string; challengeVersion: number },
  checkedAt: number
) {
  await ctx.runMutation(internal.customDomains.recordVerificationAttemptInternal, {
    claimId: claim._id,
    tenantId: identity.tenantId,
    clerkUserId: identity.userId,
    challenge: claim.challenge,
    challengeVersion: claim.challengeVersion,
    checkedAt,
  })
}
