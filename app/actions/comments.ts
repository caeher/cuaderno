"use server"

import { revalidatePath } from "next/cache"
import { addComment, deleteComment } from "@/lib/application"

export async function deleteCommentAction(commentId: string, slug?: string) {
  await deleteComment(commentId)
  revalidatePath("/panel/comentarios")
  revalidatePath("/panel")
  if (slug) {
    revalidatePath(`/post/${slug}`)
  }
  return { success: true }
}

export async function addCommentAction(data: {
  postId: string
  authorName: string
  authorAvatarUrl?: string
  content: string
  postSlug?: string
}) {
  const comment = await addComment({
    postId: data.postId,
    authorName: data.authorName,
    authorAvatarUrl: data.authorAvatarUrl,
    content: data.content,
  })
  revalidatePath("/panel/comentarios")
  revalidatePath("/panel")
  if (data.postSlug) {
    revalidatePath(`/post/${data.postSlug}`)
  }
  return { success: true, comment }
}
