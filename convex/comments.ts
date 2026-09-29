import { v } from "convex/values"
import { mutation, query, type QueryCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { requireTenantAuth } from "./lib/auth"
import { findDocById, getCurrentIsoDate } from "./lib/helpers"
import { assertCanReadEditorialPost, canReadEditorialPost } from "./lib/post-access"

const publicCommentValidator = v.object({
  _id: v.id("comments"),
  postId: v.string(),
  authorName: v.string(),
  authorAvatarUrl: v.optional(v.string()),
  content: v.string(),
  createdAt: v.string(),
})

export async function getCommentsForPostHandler(ctx: QueryCtx, args: { postId: string }) {
  const post = await findDocById(ctx.db, "posts", args.postId)
  if (!post) return []

  if (post.status !== "published") {
    try {
      const identity = await requireTenantAuth(ctx)
      if (!await canReadEditorialPost(ctx, identity, post)) return []
    } catch {
      return []
    }
  }

  const keys = new Set([post._id as string, ...(post.legacyId ? [post.legacyId] : [])])
  const commentsById = new Map<string, Doc<"comments">>()
  for (const key of keys) {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", key))
      .collect()
    for (const comment of comments) commentsById.set(comment._id, comment)
  }

  const commentsByDoc = await ctx.db
    .query("comments")
    .withIndex("by_post_doc", (q) => q.eq("postDocId", post._id))
    .collect()
  for (const comment of commentsByDoc) commentsById.set(comment._id, comment)

  return Array.from(commentsById.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((comment) => ({
      _id: comment._id,
      postId: comment.postId,
      authorName: comment.authorName,
      ...(comment.authorAvatarUrl ? { authorAvatarUrl: comment.authorAvatarUrl } : {}),
      content: comment.content,
      createdAt: comment.createdAt,
    }))
}

export const getByPostId = query({
  args: { postId: v.string() },
  returns: v.array(publicCommentValidator),
  handler: getCommentsForPostHandler,
})

export const create = mutation({
  args: {
    id: v.optional(v.string()),
    postId: v.string(),
    authorName: v.string(),
    authorAvatarUrl: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    authorUserId: v.optional(v.string()),
    content: v.string(),
    createdAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = args.createdAt || getCurrentIsoDate()
    const post = await findDocById(ctx.db, "posts", args.postId)
    if (!post || post.status !== "published") {
      throw new Error("Solo se puede comentar en publicaciones disponibles.")
    }

    const docId = await ctx.db.insert("comments", {
      legacyId: args.id,
      postId: post ? (post.legacyId || (post._id as string)) : args.postId,
      postDocId: post ? post._id : undefined,
      authorName: args.authorName,
      authorAvatarUrl:
        args.authorAvatarUrl || "/placeholder.svg?height=200&width=200",
      authorEmail: args.authorEmail,
      authorUserId: args.authorUserId,
      content: args.content,
      createdAt: now,
    })

    // Actualizar atómicamente el contador de comentarios en la publicación
    if (post) {
      await ctx.db.patch(post._id, {
        comments: (post.comments || 0) + 1,
      })
    }

    return await ctx.db.get(docId)
  },
})

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const comment = await findDocById(ctx.db, "comments", args.id)
    if (!comment) return true

    const post = await findDocById(ctx.db, "posts", comment.postId)
    if (!post) {
      await ctx.db.delete(comment._id)
      return true
    }

    const identity = await requireTenantAuth(ctx)
    await assertCanReadEditorialPost(ctx, identity, post)

    // Decrementar comentarios en el post correspondiente
    await ctx.db.patch(post._id, {
      comments: Math.max(0, (post.comments || 1) - 1),
    })

    await ctx.db.delete(comment._id)
    return true
  },
})
