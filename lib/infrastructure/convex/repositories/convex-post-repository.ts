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
    const doc = await convexMutation(api.posts.update, {
      id,
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
      views: input.views,
      likes: input.likes,
      comments: input.comments,
      designData: input.designData ?? null,
      editorMode: input.editorMode,
    })
    return doc ? convexDocToPost(doc) : null
  }

  async delete(id: string): Promise<boolean> {
    const success = await convexMutation(api.posts.remove, { id })
    return Boolean(success)
  }
}
