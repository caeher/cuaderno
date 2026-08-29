"use server"

import type { PostStatus } from "@/lib/domain/entities"
import {
  batchDeletePosts,
  batchUpdatePostStatus,
  createPost,
  deletePost,
  duplicatePost,
  getCurrentUser,
  togglePostFeatured,
  togglePostStatus,
  updatePost,
} from "@/lib/application"
import { revalidateAllPostPaths, slugify } from "./utils"

export async function savePostAction(data: {
  id?: string
  organizationId?: string
  categoryId?: string | null
  title: string
  slug?: string
  excerpt: string
  content: string
  coverUrl?: string | null
  tags: string[]
  status: PostStatus
  featured?: boolean
  designData?: string | null
  editorMode?: "notion" | "elementor"
}) {
  const user = await getCurrentUser()
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.title) || `post-${Date.now()}`

  if (data.id) {
    const updated = await updatePost(data.id, {
      organizationId: data.organizationId,
      categoryId: data.categoryId,
      title: data.title,
      slug: generatedSlug,
      excerpt: data.excerpt,
      content: data.content,
      coverUrl: data.coverUrl || null,
      tags: data.tags,
      status: data.status,
      featured: data.featured,
      designData: data.designData !== undefined ? data.designData : undefined,
      editorMode: data.editorMode !== undefined ? data.editorMode : undefined,
    })
    revalidateAllPostPaths(updated?.slug)
    return { success: true, post: updated }
  } else {
    const newPost = await createPost({
      authorId: user.id,
      organizationId: data.organizationId,
      categoryId: data.categoryId || null,
      title: data.title || "Sin título",
      slug: generatedSlug,
      excerpt: data.excerpt,
      content: data.content,
      coverUrl: data.coverUrl || null,
      tags: data.tags,
      status: data.status,
      featured: data.featured ?? false,
      designData: data.designData ?? null,
      editorMode: data.editorMode ?? "notion",
    })
    revalidateAllPostPaths(newPost.slug)
    return { success: true, post: newPost }
  }
}

export async function deletePostAction(id: string) {
  await deletePost(id)
  revalidateAllPostPaths()
  return { success: true }
}

export async function togglePostStatusAction(id: string, status: PostStatus) {
  const updated = await togglePostStatus(id, status)
  revalidateAllPostPaths(updated?.slug)
  return { success: true, post: updated }
}

export async function togglePostFeaturedAction(id: string) {
  const updated = await togglePostFeatured(id)
  revalidateAllPostPaths(updated?.slug)
  return { success: true, post: updated }
}

export async function duplicatePostAction(id: string) {
  const duplicated = await duplicatePost(id)
  revalidateAllPostPaths(duplicated?.slug)
  return { success: true, post: duplicated }
}

export async function batchDeletePostsAction(ids: string[]) {
  await batchDeletePosts(ids)
  revalidateAllPostPaths()
  return { success: true }
}

export async function batchUpdatePostStatusAction(ids: string[], status: PostStatus) {
  await batchUpdatePostStatus(ids, status)
  revalidateAllPostPaths()
  return { success: true }
}
