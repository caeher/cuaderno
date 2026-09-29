export interface CustomDomainClaim {
  id: string
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
