import type { Comment, CreateCommentInput, EditorialComment } from "../entities"

export interface CommentRepository {
  findByPostId(postId: string): Promise<Comment[]>
  findEditorialByPostId(postId: string): Promise<EditorialComment[]>
  create(input: CreateCommentInput): Promise<Comment>
  delete(id: string): Promise<boolean>
}
