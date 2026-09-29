import type {
  AuthorWithStats,
  PublishedPost,
  PublicAuthor,
  PublicLegalSettings,
  PublicTenantSeoSettings,
} from "@/lib/domain/entities"
import {
  categoryRepository,
  postRepository,
  userRepository,
} from "@/lib/infrastructure/repositories"

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
  const author = await getTenantBySlug(tenantSlug)
  if (!author) return null

  const [posts, categories] = await Promise.all([
    postRepository.findPublishedByTenantSlug(tenantSlug),
    categoryRepository.findAll(),
  ])
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return {
    author: {
      ...author,
      totalViews: posts.reduce((total, post) => total + post.views, 0),
      totalLikes: posts.reduce((total, post) => total + post.likes, 0),
    },
    posts: posts
      .map((post) => ({
        ...post,
        category: post.categoryId ? categoryById.get(post.categoryId) ?? null : null,
      }))
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
  }
}

export async function getTenantAuthorProfile(tenantSlug: string, authorUsername: string): Promise<{
  tenant: PublicAuthor
  author: AuthorWithStats
  posts: PublishedPost[]
} | null> {
  const [tenant, author] = await Promise.all([
    getTenantBySlug(tenantSlug),
    userRepository.findPublicByUsername(authorUsername),
  ])
  if (!tenant || !author) return null

  const [tenantPosts, categories] = await Promise.all([
    postRepository.findPublishedByTenantSlug(tenantSlug),
    categoryRepository.findAll(),
  ])
  const authorPosts = tenantPosts.filter((post) => post.author.username === authorUsername)
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return {
    tenant,
    author: {
      ...author,
      totalViews: authorPosts.reduce((total, post) => total + post.views, 0),
      totalLikes: authorPosts.reduce((total, post) => total + post.likes, 0),
    },
    posts: authorPosts
      .map((post) => ({
        ...post,
        category: post.categoryId ? categoryById.get(post.categoryId) ?? null : null,
      }))
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
  }
}
