import type { CreatePostInput, Post, PostStatus, PublishedPost, UpdatePostInput } from "../entities"

export interface PostRepository {
  findPublishedById(id: string, tenantId?: string): Promise<PublishedPost | null>
  findPublishedBySlug(slug: string, tenantId?: string): Promise<PublishedPost | null>
  findPublishedByTenantSlug(tenantSlug: string): Promise<PublishedPost[]>
  findPublishedBySlugAndTenantSlug(slug: string, tenantSlug: string): Promise<PublishedPost | null>
  findPublishedByAuthorUsername(username: string): Promise<PublishedPost[]>
  findPublishedByTenant(tenantId: string): Promise<PublishedPost[]>
  findPublished(): Promise<PublishedPost[]>
  findFeaturedPublished(): Promise<PublishedPost[]>
  findPublishedByTag(tagSlug: string): Promise<PublishedPost[]>
  findPublishedByCategory(categoryIdOrSlug: string): Promise<PublishedPost[]>
  findEditorialById(id: string): Promise<Post | null>
  findEditorialByAuthorId(authorId: string, status?: PostStatus): Promise<Post[]>
  findEditorialByOrganization(organizationId: string, status?: PostStatus): Promise<Post[]>
  create(input: CreatePostInput): Promise<Post>
  update(id: string, input: UpdatePostInput): Promise<Post | null>
  delete(id: string): Promise<boolean>
}
