import { api } from "@/convex/_generated/api"
import type { CustomDomainClaim } from "@/lib/domain/entities"
import type { CustomDomainRepository } from "@/lib/domain/repositories"
import { convexAction, convexMutation, convexQuery } from "../client"

function toClaim(doc: {
  _id: string
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
}): CustomDomainClaim {
  return {
    id: doc._id,
    hostname: doc.hostname,
    verificationHost: doc.verificationHost,
    challenge: doc.challenge,
    challengeVersion: doc.challengeVersion,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    expiresAt: doc.expiresAt,
    verifiedAt: doc.verifiedAt,
    lastCheckedAt: doc.lastCheckedAt,
  }
}

export class ConvexCustomDomainRepository implements CustomDomainRepository {
  async getCurrent(): Promise<CustomDomainClaim | null> {
    const doc = await convexQuery(api.customDomains.current)
    return doc ? toClaim(doc) : null
  }

  async claim(hostname: string): Promise<CustomDomainClaim> {
    return toClaim(await convexAction(api.customDomainActions.claim, { hostname }))
  }

  async verify(): Promise<CustomDomainClaim> {
    return toClaim(await convexAction(api.customDomainActions.verify, {}))
  }

  async remove(): Promise<boolean> {
    const result = await convexMutation(api.customDomains.remove, {})
    return result.removed
  }
}
