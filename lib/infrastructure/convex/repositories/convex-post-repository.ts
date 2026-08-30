import { api } from "@/convex/_generated/api"
import type {
  CreatePostInput,
  Post,
  PostStatus,
  UpdatePostInput,
} from "@/lib/domain/entities"
import type { PostRepository } from "@/lib/domain/repositories"
import { convexMutation, convexQuery } from "../client"
import { convexDocToPost } from "../mappers"

/**
 * Solo envía a Convex los campos que el caso de uso realmente cambió.
 * Coercer `undefined` a `null` (p. ej. categoryId) borraba la categoría
 * al publicar, destacar o duplicar un artículo.
 */
export function toConvexPostUpdateArgs(id: string, input: UpdatePostInput) {
  const args: {
    id: string
    organizationId?: string
    categoryId?: string | null
    title?: string
    slug?: string
    excerpt?: string
    content?: string
    coverUrl?: string | null
    tags?: string[]
    status?: PostStatus
    readingTimeMinutes?: number
    featured?: boolean
    views?: number
    likes?: number
    comments?: number
    designData?: string | null
    editorMode?: "notion" | "elementor"
  } = { id }

  if (input.organizationId !== undefined) args.organizationId = input.organizationId
  if (input.categoryId !== undefined) args.categoryId = input.categoryId
  if (input.title !== undefined) args.title = input.title
  if (input.slug !== undefined) args.slug = input.slug
  if (input.excerpt !== undefined) args.excerpt = input.excerpt
  if (input.content !== undefined) args.content = input.content
  if (input.coverUrl !== undefined) args.coverUrl = input.coverUrl
  if (input.tags !== undefined) args.tags = input.tags
  if (input.status !== undefined) args.status = input.status
  if (input.readingTimeMinutes !== undefined) args.readingTimeMinutes = input.readingTimeMinutes
  if (input.featured !== undefined) args.featured = input.featured
  if (input.views !== undefined) args.views = input.views
  if (input.likes !== undefined) args.likes = input.likes
  if (input.comments !== undefined) args.comments = input.comments
  if (input.designData !== undefined) args.designData = input.designData
  if (input.editorMode !== undefined) args.editorMode = input.editorMode

  return args
}

export class ConvexPostRepository implements PostRepository {
  async findAll(): Promise<Post[]> {
    const docs = await convexQuery(api.posts.list)
    return (docs || []).map(convexDocToPost)
  }

  async findById(id: string): Promise<Post | null> {
    const doc = await convexQuery(api.posts.getById, { id })
    return doc ? convexDocToPost(doc) : null
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const doc = await convexQuery(api.posts.getBySlug, { slug })
    return doc ? convexDocToPost(doc) : null
  }

  async findByAuthorId(authorId: string, status?: PostStatus): Promise<Post[]> {
    const docs = await convexQuery(api.posts.getByAuthorId, {
      authorId,
      status,
    })
    return (docs || []).map(convexDocToPost)
  }

  async findByOrganization(organizationId: string, status?: PostStatus): Promise<Post[]> {
    const docs = await convexQuery(api.posts.getByOrganization, {
      organizationId,
      status,
    })
    return (docs || []).map(convexDocToPost)
  }

  async findPublished(): Promise<Post[]> {
    const docs = await convexQuery(api.posts.getPublished)
    return (docs || []).map(convexDocToPost)
  }

  async findFeatured(): Promise<Post[]> {
    const docs = await convexQuery(api.posts.getFeatured)
    return (docs || []).map(convexDocToPost)
  }

  async findByTag(tagSlug: string): Promise<Post[]> {
    const docs = await convexQuery(api.posts.getByTag, { tagSlug })
    return (docs || []).map(convexDocToPost)
  }

  async findByCategory(categoryIdOrSlug: string): Promise<Post[]> {
    const docs = await convexQuery(api.posts.getByCategory, {
      categoryIdOrSlug,
    })
    return (docs || []).map(convexDocToPost)
  }

  async create(input: CreatePostInput): Promise<Post> {
    const doc = await convexMutation(api.posts.create, {
      authorId: input.authorId,
      organizationId: input.organizationId,
      categoryId: input.categoryId ?? null,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      coverUrl: input.coverUrl ?? null,
      tags: input.tags,
      status: input.status,
      readingTimeMinutes: input.readingTimeMinutes,
      featured: input.featured,
      designData: input.designData ?? null,
      editorMode: input.editorMode,
    })
    return convexDocToPost(doc)
  }

  async update(id: string, input: UpdatePostInput): Promise<Post | null> {
    const doc = await convexMutation(api.posts.update, toConvexPostUpdateArgs(id, input))
    return doc ? convexDocToPost(doc) : null
  }

  async delete(id: string): Promise<boolean> {
    const success = await convexMutation(api.posts.remove, { id })
    return Boolean(success)
  }
}
