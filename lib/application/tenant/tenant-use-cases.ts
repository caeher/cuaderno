import type { AuthorWithStats, Post, User } from "@/lib/domain/entities"
import { userRepository } from "@/lib/infrastructure/repositories"
import { getAuthorProfile } from "../users/user-use-cases"

export async function getTenantBySlug(tenantSlug: string): Promise<User | null> {
  return userRepository.findByUsername(tenantSlug)
}

export async function getTenantProfile(tenantSlug: string): Promise<{
  author: AuthorWithStats
  posts: Post[]
} | null> {
  return getAuthorProfile(tenantSlug)
}
