import { customDomainRepository } from "@/lib/infrastructure/repositories"

export async function getCurrentCustomDomainClaim() {
  return customDomainRepository.getCurrent()
}

export async function claimCustomDomain(hostname: string) {
  return customDomainRepository.claim(hostname)
}

export async function verifyCustomDomain() {
  return customDomainRepository.verify()
}

export async function removeCustomDomain() {
  return customDomainRepository.remove()
}
