import type { Post, PublishedPost } from "@/lib/domain/entities"
import {
  categoryRepository,
  commentRepository,
  narrationRepository,
  postRepository,
} from "@/lib/infrastructure/repositories"
import { isNarrationPlaybackEnabled } from "@/lib/server/audio-config"

export async function getFeaturedPosts(limit = 3): Promise<PublishedPost[]> {
  const [featured, categories] = await Promise.all([
    postRepository.findFeaturedPublished(),
    categoryRepository.findAll(),
  ])
  const catMap = new Map(categories.map((c) => [c.id, c]))
  return featured.slice(0, limit).map((p) => ({
    ...p,
    category: p.categoryId ? catMap.get(p.categoryId) ?? null : null,
  }))
}

export async function getPublishedFeed(options?: {
  tag?: string
  category?: string
  query?: string
}): Promise<PublishedPost[]> {
  let posts: PublishedPost[] = []

  if (options?.tag) {
    posts = await postRepository.findPublishedByTag(options.tag)
  } else if (options?.category) {
    const cat = await categoryRepository.findBySlug(options.category)
    const catId = cat ? cat.id : options.category
    posts = await postRepository.findPublishedByCategory(catId)
  } else {
    posts = await postRepository.findPublished()
  }

  if (options?.query) {
    const q = options.query.toLowerCase()
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  const categories = await categoryRepository.findAll()
  const catMap = new Map(categories.map((c) => [c.id, c]))

  return posts.map((p) => ({
    ...p,
    category: p.categoryId ? catMap.get(p.categoryId) ?? null : null,
  }))
}

export async function getPostForReading(slug: string) {
  const post = await postRepository.findPublishedBySlug(slug)
  if (!post) return null

  const author = post.author

  const [comments, allPublished, postCategory, narration] = await Promise.all([
    commentRepository.findByPostId(post.id),
    postRepository.findPublished().catch(() => []),
    post.categoryId ? categoryRepository.findById(post.categoryId) : Promise.resolve(null),
    narrationRepository.findByPostId(post.id),
  ])

  const categories = await categoryRepository.findAll().catch(() => [])
  const catMap = new Map(categories.map((c) => [c.id, c]))

  post.category = postCategory
  post.narration = isNarrationPlaybackEnabled() ? narration : null

  const relatedPosts = (allPublished || [])
    .filter(
      (p) =>
        p.id !== post.id &&
        (p.tags.some((t) => post.tags.includes(t)) || (post.categoryId && p.categoryId === post.categoryId))
    )
    .slice(0, 3)
    .map((p) => ({
      ...p,
      category: p.categoryId ? catMap.get(p.categoryId) ?? null : null,
    }))

  return { post, author, comments, relatedPosts }
}

export async function getPostForReadingByTenant(tenantSlug: string, postSlug: string) {
  const post = await postRepository.findPublishedBySlugAndTenantSlug(postSlug, tenantSlug)
  if (!post) return null
  const author = post.author

  const [comments, allAuthorPosts, postCategory, narration] = await Promise.all([
    commentRepository.findByPostId(post.id),
    postRepository.findPublishedByTenantSlug(tenantSlug).catch(() => []),
    post.categoryId ? categoryRepository.findById(post.categoryId) : Promise.resolve(null),
    narrationRepository.findByPostId(post.id),
  ])

  const categories = await categoryRepository.findAll().catch(() => [])
  const catMap = new Map(categories.map((c) => [c.id, c]))

  post.category = postCategory
  post.narration = isNarrationPlaybackEnabled() ? narration : null

  const relatedPosts = (allAuthorPosts || [])
    .filter(
      (p) =>
        p.id !== post.id &&
        (p.tags.some((t) => post.tags.includes(t)) || (post.categoryId && p.categoryId === post.categoryId))
    )
    .slice(0, 3)
    .map((p) => ({
      ...p,
      category: p.categoryId ? catMap.get(p.categoryId) ?? null : null,
    }))

  return { post, author, comments, relatedPosts }
}

export async function getPostForEditing(postId: string): Promise<Post | null> {
  return postRepository.findEditorialById(postId)
}
