import type {
  AuthorWithStats,
  PublishedPost,
  PublicAuthor,
  PublicLegalSettings,
  PublicTenantSeoSettings,
} from "@/lib/domain/entities"
import { userRepository } from "@/lib/infrastructure/repositories"
import { getAuthorProfile } from "../users/user-use-cases"

export async function getTenantBySlug(tenantSlug: string): Promise<PublicAuthor | null> {
  return userRepository.findPublicByUsername(tenantSlug)
}

export async function getPublicTenantLegalSettings(tenantSlug: string): Promise<PublicLegalSettings | null> {
  return userRepository.findPublicLegalSettings(tenantSlug)
}

export async function getPublicTenantSeoSettings(
  tenantSlug: string
): Promise<PublicTenantSeoSettings | null> {
  return userRepository.findPublicSeoSettings(tenantSlug)
}

export async function getTenantProfile(tenantSlug: string): Promise<{
  author: AuthorWithStats
  posts: PublishedPost[]
} | null> {
  return getAuthorProfile(tenantSlug)
}
