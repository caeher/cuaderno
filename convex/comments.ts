import { v } from "convex/values"
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { getTenantIdentity, requireTenantAuth } from "./lib/auth"
import { findDocById, getCurrentIsoTimestamp } from "./lib/helpers"
import { assertCanReadEditorialPost } from "./lib/post-access"

const publicCommentValidator = v.object({
  authorName: v.string(),
  authorAvatarUrl: v.optional(v.string()),
  content: v.string(),
  createdAt: v.string(),
})

const editorialCommentValidator = v.object({
  id: v.id("comments"),
  postId: v.string(),
  authorName: v.string(),
  authorAvatarUrl: v.optional(v.string()),
  authorEmail: v.optional(v.string()),
  authorUserId: v.optional(v.string()),
  content: v.string(),
  createdAt: v.string(),
})

const COMMENT_MAX_LENGTH = 5_000
const COMMENTER_NAME_MAX_LENGTH = 80
const COMMENT_AVATAR_MAX_LENGTH = 512
const COMMENT_RATE_WINDOW_MS = 10 * 60 * 1_000
const AUTHENTICATED_COMMENT_LIMIT = 5
const ANONYMOUS_COMMENT_LIMIT = 8
const DEFAULT_COMMENT_AVATAR = "/placeholder.svg?height=200&width=200"

type CreateCommentArgs = {
  postId: string
  authorName: string
  authorAvatarUrl?: string
  content: string
}

function isAllowedAvatarUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

async function resolvePostTenantId(ctx: MutationCtx, post: Doc<"posts">): Promise<string> {
  if (post.tenantId) return post.tenantId
  if (post.organizationId) return post.organizationId
  const author = post.authorDocId
    ? await ctx.db.get(post.authorDocId)
    : await findDocById(ctx.db, "users", post.authorId)
  return author?.clerkUserId || post.authorId
}

async function enforceCommentRateLimit(
  ctx: MutationCtx,
  tenantId: string,
  actorId: string,
  limit: number,
  now: number
) {
  const existing = await ctx.db
    .query("commentRateLimits")
    .withIndex("by_tenant_actor", (q) => q.eq("tenantId", tenantId).eq("actorId", actorId))
    .first()
  const recentTimestamps = (existing?.timestamps ?? []).filter(
    (timestamp) => timestamp > now - COMMENT_RATE_WINDOW_MS
  )

  if (recentTimestamps.length >= limit) {
    throw new Error("Has alcanzado el límite de comentarios de los últimos 10 minutos. Inténtalo más tarde.")
  }
  recentTimestamps.push(now)

  if (existing) {
    await ctx.db.patch(existing._id, { timestamps: recentTimestamps })
  } else {
    await ctx.db.insert("commentRateLimits", { tenantId, actorId, timestamps: recentTimestamps })
  }
}

function toPublicComment(comment: Doc<"comments">) {
  return {
    authorName: comment.authorName,
    ...(comment.authorAvatarUrl ? { authorAvatarUrl: comment.authorAvatarUrl } : {}),
    content: comment.content,
    createdAt: comment.createdAt,
  }
}

export async function getCommentsForPostHandler(ctx: QueryCtx, args: { postId: string }) {
  const post = await findDocById(ctx.db, "posts", args.postId)
  if (!post || post.status !== "published") return []

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
    .map(toPublicComment)
}

export const getByPostId = query({
  args: { postId: v.string() },
  returns: v.array(publicCommentValidator),
  handler: getCommentsForPostHandler,
})

export async function getEditorialCommentsForPostHandler(ctx: QueryCtx, args: { postId: string }) {
  const post = await findDocById(ctx.db, "posts", args.postId)
  if (!post) return []

  const identity = await requireTenantAuth(ctx)
  await assertCanReadEditorialPost(ctx, identity, post)

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
      id: comment._id,
      postId: comment.postId,
      authorName: comment.authorName,
      ...(comment.authorAvatarUrl ? { authorAvatarUrl: comment.authorAvatarUrl } : {}),
      ...(comment.authorEmail ? { authorEmail: comment.authorEmail } : {}),
      ...(comment.authorUserId ? { authorUserId: comment.authorUserId } : {}),
      content: comment.content,
      createdAt: comment.createdAt,
    }))
}

export const getEditorialByPostId = query({
  args: { postId: v.string() },
  returns: v.array(editorialCommentValidator),
  handler: getEditorialCommentsForPostHandler,
})

export const create = mutation({
  args: {
    postId: v.string(),
    authorName: v.string(),
    authorAvatarUrl: v.optional(v.string()),
    content: v.string(),
  },
  returns: publicCommentValidator,
  handler: async (ctx, args) => createCommentHandler(ctx, args),
})

export async function createCommentHandler(ctx: MutationCtx, args: CreateCommentArgs) {
  const authorName = args.authorName.trim()
  const content = args.content.trim()
  if (!authorName || authorName.length > COMMENTER_NAME_MAX_LENGTH) {
    throw new Error("El nombre debe tener entre 1 y 80 caracteres.")
  }
  if (!content) {
    throw new Error("El comentario no puede estar vacío.")
  }
  if (content.length > COMMENT_MAX_LENGTH) {
    throw new Error("El comentario no puede superar los 5000 caracteres.")
  }
  if (
    args.authorAvatarUrl !== undefined &&
    (args.authorAvatarUrl.length > COMMENT_AVATAR_MAX_LENGTH || !isAllowedAvatarUrl(args.authorAvatarUrl))
  ) {
    throw new Error("El avatar debe ser una URL HTTPS de hasta 512 caracteres.")
  }

  const identity = await getTenantIdentity(ctx)
  const post = await findDocById(ctx.db, "posts", args.postId)
  if (!post) {
    throw new Error("No se encontró la publicación.")
  }
  if (post.status !== "published") {
    throw new Error("Solo puedes comentar en publicaciones publicadas.")
  }

  const tenantId = await resolvePostTenantId(ctx, post)
  const now = Date.now()
  await enforceCommentRateLimit(
    ctx,
    tenantId,
    identity.isAuthenticated ? `user:${identity.userId}` : "anonymous",
    identity.isAuthenticated ? AUTHENTICATED_COMMENT_LIMIT : ANONYMOUS_COMMENT_LIMIT,
    now
  )
  const createdAt = getCurrentIsoTimestamp()
  const authorAvatarUrl = identity.isAuthenticated
    ? identity.avatarUrl && isAllowedAvatarUrl(identity.avatarUrl)
      ? identity.avatarUrl
      : DEFAULT_COMMENT_AVATAR
    : args.authorAvatarUrl || DEFAULT_COMMENT_AVATAR

  await ctx.db.insert("comments", {
    postId: post.legacyId || (post._id as string),
    postDocId: post._id,
    tenantId,
    authorName,
    authorAvatarUrl,
    ...(identity.isAuthenticated && identity.email ? { authorEmail: identity.email } : {}),
    ...(identity.isAuthenticated && identity.userId ? { authorUserId: identity.userId } : {}),
    content,
    createdAt,
  })

  await ctx.db.patch(post._id, {
    comments: (post.comments || 0) + 1,
  })

  return {
    authorName,
    authorAvatarUrl,
    content,
    createdAt,
  }
}

export const remove = mutation({
  args: { id: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => removeCommentHandler(ctx, args),
})

export async function removeCommentHandler(ctx: MutationCtx, args: { id: string }) {
  const identity = await requireTenantAuth(ctx)
  const comment = await findDocById(ctx.db, "comments", args.id)
  if (!comment) return true

  const post = comment.postDocId
    ? await ctx.db.get(comment.postDocId)
    : await findDocById(ctx.db, "posts", comment.postId)

  if (post) {
    const postTenantId = await resolvePostTenantId(ctx, post)
    if (comment.tenantId && comment.tenantId !== postTenantId) {
      throw new Error("Acceso denegado: el comentario no coincide con el tenant de la publicación.")
    }
    await assertCanReadEditorialPost(ctx, identity, post)
    await ctx.db.patch(post._id, {
      comments: Math.max(0, (post.comments || 1) - 1),
    })
  } else if (!comment.tenantId) {
    throw new Error("Comentario huérfano legacy: debe repararse mediante la operación interna controlada.")
  } else if (identity.tenantId !== comment.tenantId) {
    throw new Error("Acceso denegado: no tienes permiso para moderar comentarios de este tenant.")
  }

  await ctx.db.delete(comment._id)
  return true
}

/** Solo operaciones internas pueden reparar comentarios legacy sin tenant demostrable. */
export const removeOrphanedLegacyInternal = internalMutation({
  args: { id: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => removeOrphanedLegacyInternalHandler(ctx, args),
})

export async function removeOrphanedLegacyInternalHandler(ctx: MutationCtx, args: { id: string }) {
  const comment = await findDocById(ctx.db, "comments", args.id)
  if (!comment) return true
  if (comment.tenantId) {
    throw new Error("El comentario tiene tenant asociado y no requiere reparación legacy.")
  }

  const post = comment.postDocId
    ? await ctx.db.get(comment.postDocId)
    : await findDocById(ctx.db, "posts", comment.postId)
  if (post) {
    throw new Error("El comentario todavía tiene una publicación asociada y no es huérfano.")
  }

  await ctx.db.delete(comment._id)
  return true
}
