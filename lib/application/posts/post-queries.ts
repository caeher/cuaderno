import type { Post } from "@/lib/domain/entities"
import { categoryRepository, commentRepository, postRepository, userRepository } from "@/lib/infrastructure/repositories"

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

  const [author, comments, allPublished, postCategory] = await Promise.all([
    userRepository.findById(post.authorId),
    commentRepository.findByPostId(post.id),
    postRepository.findPublished(),
    post.categoryId ? categoryRepository.findById(post.categoryId) : Promise.resolve(null),
  ])

  if (!author) return null

  const categories = await categoryRepository.findAll()
  const catMap = new Map(categories.map((c) => [c.id, c]))

  post.category = postCategory

  const relatedPosts = allPublished
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
  const author = await userRepository.findByUsername(tenantSlug)
  if (!author) return null

  const post = await postRepository.findBySlug(postSlug)
  const authorKey = author.clerkUserId ?? author.legacyId ?? author.id
  const postBelongsToAuthor =
    post &&
    (post.authorId === authorKey ||
      post.authorId === author.id ||
      post.authorId === author.legacyId)

  if (!post || post.status !== "published" || !postBelongsToAuthor) return null

  const [comments, allAuthorPosts, postCategory] = await Promise.all([
    commentRepository.findByPostId(post.id),
    postRepository.findByAuthorId(authorKey, "published"),
    post.categoryId ? categoryRepository.findById(post.categoryId) : Promise.resolve(null),
  ])

  const categories = await categoryRepository.findAll()
  const catMap = new Map(categories.map((c) => [c.id, c]))

  post.category = postCategory

  const relatedPosts = allAuthorPosts
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
