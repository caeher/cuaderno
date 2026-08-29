import { api } from "@/convex/_generated/api"
import type { Comment, CreateCommentInput } from "@/lib/domain/entities"
import type { CommentRepository } from "@/lib/domain/repositories"
import { convexMutation, convexQuery } from "../client"
import { convexDocToComment } from "../mappers"

export class ConvexCommentRepository implements CommentRepository {
  async findByPostId(postId: string): Promise<Comment[]> {
    const docs = await convexQuery(api.comments.getByPostId, { postId })
    return (docs || []).map(convexDocToComment)
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const doc = await convexMutation(api.comments.create, {
      postId: input.postId,
      authorName: input.authorName,
      authorAvatarUrl: input.authorAvatarUrl,
      content: input.content,
    })
    return convexDocToComment(doc)
  }

  async delete(id: string): Promise<boolean> {
    const success = await convexMutation(api.comments.remove, { id })
    return Boolean(success)
  }
}
