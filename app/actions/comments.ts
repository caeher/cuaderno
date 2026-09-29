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
  content: string
  postSlug?: string
}) {
  try {
    const comment = await addComment({
      postId: data.postId,
      authorName: data.authorName,
      content: data.content,
    })
    revalidatePath("/panel/comentarios")
    revalidatePath("/panel")
    if (data.postSlug) {
      revalidatePath(`/post/${data.postSlug}`)
    }
    return { success: true as const, comment }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const knownErrors = [
      "No se encontró la publicación.",
      "Solo puedes comentar en publicaciones publicadas.",
      "El comentario no puede estar vacío.",
      "El comentario no puede superar los 5000 caracteres.",
      "El nombre debe tener entre 1 y 80 caracteres.",
      "El avatar debe ser una URL HTTPS de hasta 512 caracteres.",
      "Has alcanzado el límite de comentarios de los últimos 10 minutos. Inténtalo más tarde.",
    ]
    const safeMessage = knownErrors.find((knownError) => message.includes(knownError))
    return {
      success: false as const,
      error: safeMessage ?? "No se pudo publicar el comentario. Inténtalo de nuevo.",
    }
  }
}
