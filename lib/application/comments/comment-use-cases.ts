import type { Comment, CreateCommentInput, Post } from "@/lib/domain/entities"
import { commentRepository, postRepository } from "@/lib/infrastructure/repositories"

export async function addComment(input: CreateCommentInput) {
  return commentRepository.create(input)
}

export async function deleteComment(id: string) {
  return commentRepository.delete(id)
}

export async function getAllCommentsForAdmin(userId: string): Promise<{
  comments: Comment[]
  postMap: Map<string, Post>
  posts: Post[]
}> {
  const posts = await postRepository.findByAuthorId(userId)
  const postMap = new Map(posts.map((p) => [p.id, p]))
  const commentLists = await Promise.all(posts.map((p) => commentRepository.findByPostId(p.id)))
  const comments = commentLists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return { comments, postMap, posts }
}
