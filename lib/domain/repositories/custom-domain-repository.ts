import type { CustomDomainClaim } from "../entities"

export interface CustomDomainRepository {
  getCurrent(): Promise<CustomDomainClaim | null>
  claim(hostname: string): Promise<CustomDomainClaim>
  verify(): Promise<CustomDomainClaim>
  remove(): Promise<boolean>
}
