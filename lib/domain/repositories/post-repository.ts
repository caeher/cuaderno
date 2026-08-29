import type { CreatePostInput, Post, PostStatus, UpdatePostInput } from "../entities"

export interface PostRepository {
  findAll(): Promise<Post[]>
  findById(id: string): Promise<Post | null>
  findBySlug(slug: string): Promise<Post | null>
  findByAuthorId(authorId: string, status?: PostStatus): Promise<Post[]>
  findByOrganization(organizationId: string, status?: PostStatus): Promise<Post[]>
  findPublished(): Promise<Post[]>
  findFeatured(): Promise<Post[]>
  findByTag(tagSlug: string): Promise<Post[]>
  findByCategory(categoryIdOrSlug: string): Promise<Post[]>
  create(input: CreatePostInput): Promise<Post>
  update(id: string, input: UpdatePostInput): Promise<Post | null>
  delete(id: string): Promise<boolean>
}
