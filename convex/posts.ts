import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { assertCanManageResource, requireTenantAuth } from "./lib/auth"
import { calculateReadingTime, findDocById, getCurrentIsoDate } from "./lib/helpers"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect()
    return posts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
})

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await findDocById(ctx.db, "posts", args.id)
  },
})

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
  },
})

export const getByAuthorId = query({
  args: {
    authorId: v.string(),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))
    ),
  },
  handler: async (ctx, args) => {
    const author = await findDocById(ctx.db, "users", args.authorId)
    const authorKeys = new Set<string>([args.authorId])
    if (author?.legacyId) authorKeys.add(author.legacyId)
    if (author?.clerkUserId) authorKeys.add(author.clerkUserId)
    if (author?._id) authorKeys.add(author._id as string)

    const postsById = new Map<string, Doc<"posts">>()

    const collectPosts = (batch: Doc<"posts">[]) => {
      for (const post of batch) {
        postsById.set(post._id, post)
      }
    }

    for (const authorKey of authorKeys) {
      if (args.status) {
        const batch = await ctx.db
          .query("posts")
          .withIndex("by_author_and_status", (q) =>
            q.eq("authorId", authorKey).eq("status", args.status!)
          )
          .collect()
        collectPosts(batch)
      } else {
        const batch = await ctx.db
          .query("posts")
          .withIndex("by_author", (q) => q.eq("authorId", authorKey))
          .collect()
        collectPosts(batch)
      }
    }

    if (author?._id) {
      const byDoc = await ctx.db
        .query("posts")
        .withIndex("by_author_doc", (q) => q.eq("authorDocId", author._id))
        .collect()
      await collectPosts(byDoc)
    }

    const posts = Array.from(postsById.values()).filter(Boolean)
    return posts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
})

export const getByOrganization = query({
  args: {
    organizationId: v.string(),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))
    ),
  },
  handler: async (ctx, args) => {
    const statuses = args.status
      ? [args.status]
      : (["draft", "published", "scheduled"] as const)

    const postsById = new Map<string, { _id: { toString(): string }; updatedAt: string }>()

    const collectUnique = (
      batch: Array<{ _id: { toString(): string }; updatedAt: string }>
    ) => {
      for (const post of batch) {
        postsById.set(post._id.toString(), post)
      }
    }

    for (const status of statuses) {
      const byOrg = await ctx.db
        .query("posts")
        .withIndex("by_org_and_status", (q) =>
          q.eq("organizationId", args.organizationId).eq("status", status)
        )
        .collect()
      collectUnique(byOrg)

      const byTenant = await ctx.db
        .query("posts")
        .withIndex("by_tenant_and_status", (q) =>
          q.eq("tenantId", args.organizationId).eq("status", status)
        )
        .collect()
      collectUnique(byTenant)

      const byAuthor = await ctx.db
        .query("posts")
        .withIndex("by_author_and_status", (q) =>
          q.eq("authorId", args.organizationId).eq("status", status)
        )
        .collect()
      collectUnique(byAuthor)
    }

    return Array.from(postsById.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    )
  },
})

export const getPublished = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect()

    return posts.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
  },
})

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status_and_featured", (q) =>
        q.eq("status", "published").eq("featured", true)
      )
      .collect()

    return posts.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
  },
})

export const getByTag = query({
  args: { tagSlug: v.string() },
  handler: async (ctx, args) => {
    const published = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect()

    return published
      .filter((p) => p.tags && p.tags.includes(args.tagSlug))
      .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
  },
})

export const getByCategory = query({
  args: { categoryIdOrSlug: v.string() },
  handler: async (ctx, args) => {
    const published = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect()

    // Búsqueda directa por categoryId
    let matching = published.filter(
      (p) => p.categoryId === args.categoryIdOrSlug || (p.categoryDocId as string) === args.categoryIdOrSlug
    )

    if (matching.length === 0) {
      // Intentar resolver slug de categoría
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categoryIdOrSlug))
        .first()

      if (category) {
        matching = published.filter(
          (p) =>
            p.categoryId === category.legacyId ||
            p.categoryId === (category._id as string) ||
            p.categoryDocId === category._id
        )
      }
    }

    return matching.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
  },
})

export const create = mutation({
  args: {
    id: v.optional(v.string()),
    authorId: v.string(),
    organizationId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    categoryId: v.optional(v.union(v.string(), v.null())),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverUrl: v.optional(v.union(v.string(), v.null())),
    tags: v.array(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled")),
    scheduledFor: v.optional(v.string()),
    readingTimeMinutes: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    designData: v.optional(v.union(v.string(), v.null())),
    editorMode: v.optional(v.union(v.literal("notion"), v.literal("elementor"))),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, {
      authorId: args.authorId,
      organizationId: args.organizationId,
      tenantId: args.tenantId,
    })

    const now = getCurrentIsoDate()
    const readingTime = args.readingTimeMinutes || calculateReadingTime(args.content)
    const effectiveTenantId = args.tenantId || args.organizationId || identity.tenantId || undefined

    const authorDoc = await findDocById(ctx.db, "users", args.authorId)
    const resolvedAuthorId =
      authorDoc?.clerkUserId || authorDoc?.legacyId || args.authorId
    const authorDocId = authorDoc?._id

    let categoryDocId = undefined
    if (args.categoryId) {
      const category = await findDocById(ctx.db, "categories", args.categoryId)
      if (category) {
        categoryDocId = category._id
      }
    }

    const docId = await ctx.db.insert("posts", {
      legacyId: args.id,
      authorId: resolvedAuthorId,
      authorDocId,
      organizationId: args.organizationId,
      tenantId: effectiveTenantId,
      categoryId: args.categoryId || undefined,
      categoryDocId,
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      coverUrl: args.coverUrl || undefined,
      tags: args.tags,
      status: args.status,
      publishedAt: args.status === "published" ? now : undefined,
      updatedAt: now,
      scheduledFor: args.scheduledFor,
      readingTimeMinutes: readingTime,
      views: 0,
      likes: 0,
      comments: 0,
      featured: args.featured ?? false,
      designData: args.designData || undefined,
      editorMode: args.editorMode || "notion",
    })

    // Actualizar atómicamente el contador postCount del autor en users
    if (authorDoc) {
      await ctx.db.patch(authorDoc._id, {
        postCount: (authorDoc.postCount || 0) + 1,
      })
    }

    return await ctx.db.get(docId)
  },
})

export const update = mutation({
  args: {
    id: v.string(),
    organizationId: v.optional(v.string()),
    categoryId: v.optional(v.union(v.string(), v.null())),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverUrl: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))
    ),
    scheduledFor: v.optional(v.string()),
    readingTimeMinutes: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    designData: v.optional(v.union(v.string(), v.null())),
    editorMode: v.optional(v.union(v.literal("notion"), v.literal("elementor"))),
  },
  handler: async (ctx, args) => {
    const post = await findDocById(ctx.db, "posts", args.id)
    if (!post) return null

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, post)

    const now = getCurrentIsoDate()
    const updates: Partial<typeof post> = {
      updatedAt: now,
    }

    if (args.title !== undefined) updates.title = args.title
    if (args.slug !== undefined) updates.slug = args.slug
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt
    if (args.content !== undefined) {
      updates.content = args.content
      updates.readingTimeMinutes =
        args.readingTimeMinutes !== undefined
          ? args.readingTimeMinutes
          : calculateReadingTime(args.content)
    } else if (args.readingTimeMinutes !== undefined) {
      updates.readingTimeMinutes = args.readingTimeMinutes
    }
    if (args.coverUrl !== undefined) updates.coverUrl = args.coverUrl || undefined
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId || undefined
    if (args.organizationId !== undefined) updates.organizationId = args.organizationId
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.status !== undefined) {
      updates.status = args.status
      if (args.status === "published" && !post.publishedAt) {
        updates.publishedAt = now
      }
    }
    if (args.scheduledFor !== undefined) updates.scheduledFor = args.scheduledFor
    if (args.featured !== undefined) updates.featured = args.featured
    if (args.views !== undefined) updates.views = args.views
    if (args.likes !== undefined) updates.likes = args.likes
    if (args.comments !== undefined) updates.comments = args.comments
    if (args.designData !== undefined) updates.designData = args.designData || undefined
    if (args.editorMode !== undefined) updates.editorMode = args.editorMode

    await ctx.db.patch(post._id, updates)
    return await ctx.db.get(post._id)
  },
})

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const post = await findDocById(ctx.db, "posts", args.id)
    if (!post) return true

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, post)

    // 1. Eliminar comentarios asociados a esta publicación
    const comments = await ctx.db.query("comments").collect()
    for (const comment of comments) {
      if (
        comment.postId === post.legacyId ||
        comment.postId === (post._id as string) ||
        comment.postDocId === post._id
      ) {
        await ctx.db.delete(comment._id)
      }
    }

    // 2. Decrementar postCount en el autor
    const author = await findDocById(ctx.db, "users", post.authorId)
    if (author) {
      await ctx.db.patch(author._id, {
        postCount: Math.max(0, (author.postCount || 1) - 1),
      })
    }

    // 3. Eliminar post
    await ctx.db.delete(post._id)
    return true
  },
})
