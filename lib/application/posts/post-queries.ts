import type { Post } from "@/lib/domain/entities"
import {
  categoryRepository,
  commentRepository,
  narrationRepository,
  postRepository,
  userRepository,
} from "@/lib/infrastructure/repositories"
import { isNarrationPlaybackEnabled } from "@/lib/server/audio-config"

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const [featured, categories] = await Promise.all([
    postRepository.findFeatured(),
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
}): Promise<Post[]> {
  let posts: Post[] = []

  if (options?.tag) {
    posts = await postRepository.findByTag(options.tag)
  } else if (options?.category) {
    const cat = await categoryRepository.findBySlug(options.category)
    const catId = cat ? cat.id : options.category
    posts = await postRepository.findByCategory(catId)
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
  const post = await postRepository.findBySlug(slug)
  if (!post || post.status !== "published") return null

  let author = await userRepository.findById(post.authorId)
  if (!author) {
    author = await userRepository.findByClerkUserId(post.authorId)
  }
  if (!author) {
    author = await userRepository.findByUsername(post.authorId)
  }
  if (!author) {
    const allUsers = await userRepository.findAll()
    author = allUsers.find(
      (u) =>
        u.id === post.authorId ||
        u.clerkUserId === post.authorId ||
        u.legacyId === post.authorId ||
        u.username === post.authorId
    ) ?? null
  }

  if (!author) {
    author = {
      id: post.authorId,
      username: "autor",
      name: "Autor",
      email: "",
      avatarUrl: "",
      coverUrl: "",
      bio: "",
      tagline: "",
      role: "owner",
      joinedAt: new Date().toISOString(),
      postCount: 1,
      followerCount: 0,
    }
  }

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
  let author = await userRepository.findByUsername(tenantSlug)
  if (!author) {
    author = await userRepository.findByClerkUserId(tenantSlug)
  }
  if (!author) {
    author = await userRepository.findById(tenantSlug)
  }
  if (!author) {
    const allUsers = await userRepository.findAll()
    author = allUsers.find(
      (u) =>
        u.username.toLowerCase() === tenantSlug.toLowerCase() ||
        u.clerkUserId === tenantSlug ||
        u.legacyId === tenantSlug ||
        u.id === tenantSlug
    ) ?? null
  }

  const post = await postRepository.findBySlug(postSlug)
  if (!post || post.status !== "published") return null

  if (!author) {
    author = await userRepository.findById(post.authorId)
    if (!author) {
      author = await userRepository.findByClerkUserId(post.authorId)
    }
  }

  if (!author) {
    author = {
      id: post.authorId,
      username: tenantSlug || "autor",
      name: "Autor",
      email: "",
      avatarUrl: "",
      coverUrl: "",
      bio: "",
      tagline: "",
      role: "owner",
      joinedAt: new Date().toISOString(),
      postCount: 1,
      followerCount: 0,
    }
  }

  const authorKey = author.clerkUserId ?? author.legacyId ?? author.id

  const [comments, allAuthorPosts, postCategory, narration] = await Promise.all([
    commentRepository.findByPostId(post.id),
    postRepository.findByAuthorId(authorKey, "published").catch(() => []),
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
  return postRepository.findById(postId)
}
