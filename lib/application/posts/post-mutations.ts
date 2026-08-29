import type { CreatePostInput, Post, PostStatus, UpdatePostInput } from "@/lib/domain/entities"
import { postRepository } from "@/lib/infrastructure/repositories"

export async function createPost(input: CreatePostInput): Promise<Post> {
  return postRepository.create(input)
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
  return postRepository.update(id, input)
}

export async function deletePost(id: string): Promise<boolean> {
  return postRepository.delete(id)
}

export async function togglePostStatus(id: string, newStatus: PostStatus): Promise<Post | null> {
  return postRepository.update(id, { status: newStatus })
}

export async function togglePostFeatured(id: string): Promise<Post | null> {
  const post = await postRepository.findById(id)
  if (!post) return null
  return postRepository.update(id, { featured: !post.featured })
}

export async function duplicatePost(id: string): Promise<Post | null> {
  const original = await postRepository.findById(id)
  if (!original) return null

  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const newSlug = `${original.slug}-copia-${randomSuffix}`

  return postRepository.create({
    authorId: original.authorId,
    organizationId: original.organizationId,
    categoryId: original.categoryId,
    title: `${original.title} (Copia)`,
    slug: newSlug,
    excerpt: original.excerpt,
    content: original.content,
    coverUrl: original.coverUrl,
    tags: original.tags,
    status: "draft",
    readingTimeMinutes: original.readingTimeMinutes,
    featured: false,
    designData: original.designData,
    editorMode: original.editorMode,
  })
}

export async function batchDeletePosts(ids: string[]): Promise<boolean> {
  await Promise.all(ids.map((id) => postRepository.delete(id)))
  return true
}

export async function batchUpdatePostStatus(ids: string[], status: PostStatus): Promise<boolean> {
  await Promise.all(ids.map((id) => postRepository.update(id, { status })))
  return true
}
