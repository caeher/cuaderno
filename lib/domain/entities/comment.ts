export interface Comment {
  authorName: string
  authorAvatarUrl?: string
  content: string
  createdAt: string
}

/** Datos privados visibles únicamente en el panel del tenant autorizado. */
export interface EditorialComment extends Comment {
  id: string
  postId: string
  authorEmail?: string
  authorUserId?: string
}

export interface CreateCommentInput {
  postId: string
  authorName: string
  authorAvatarUrl?: string
  content: string
}
