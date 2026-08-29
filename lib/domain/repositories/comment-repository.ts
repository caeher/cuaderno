import type { Comment, CreateCommentInput } from "../entities"

export interface CommentRepository {
  findByPostId(postId: string): Promise<Comment[]>
  create(input: CreateCommentInput): Promise<Comment>
  delete(id: string): Promise<boolean>
}
