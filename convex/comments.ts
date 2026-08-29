import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { assertCanManageResource, requireTenantAuth } from "./lib/auth"
import { findDocById, getCurrentIsoDate } from "./lib/helpers"

export const getByPostId = query({
  args: { postId: v.string() },
  handler: async (ctx, args) => {
    // 1. Buscar por postId indexado
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect()

    if (comments.length > 0) {
      return comments.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }

    // 2. Si args.postId es un Id nativo o legacyId, resolver el post correspondiente
    const post = await findDocById(ctx.db, "posts", args.postId)
    if (post) {
      const allComments = await ctx.db.query("comments").collect()
      const matching = allComments.filter(
        (c) =>
          c.postId === post.legacyId ||
          c.postId === (post._id as string) ||
          c.postDocId === post._id
      )
      return matching.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }

    return []
  },
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

    const docId = await ctx.db.insert("comments", {
      legacyId: args.id || "c_" + Math.random().toString(36).substring(2, 9),
      postId: args.postId,
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
    assertCanManageResource(identity, post)

    // Decrementar comentarios en el post correspondiente
    await ctx.db.patch(post._id, {
      comments: Math.max(0, (post.comments || 1) - 1),
    })

    await ctx.db.delete(comment._id)
    return true
  },
})
