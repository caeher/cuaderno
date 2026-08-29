export interface Comment {
  id: string
  postId: string
  authorName: string
  authorAvatarUrl: string
  content: string
  createdAt: string
}

export interface CreateCommentInput {
  postId: string
  authorName: string
  authorAvatarUrl?: string
  content: string
}
