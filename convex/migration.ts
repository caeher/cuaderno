import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"
import { findDocById } from "./lib/helpers"
import {
  socialLinksValidator,
  tenantLegalSettingsValidator,
  tenantSeoSettingsValidator,
  tenantTemplateSettingsValidator,
} from "./schema"

/**
 * 1. Importación por lotes de Usuarios / Tenants (Idempotente)
 */
export const importUsersBatch = internalMutation({
  args: {
    users: v.array(
      v.object({
        legacyId: v.string(),
        clerkUserId: v.optional(v.string()),
        tokenIdentifier: v.optional(v.string()),
        username: v.string(),
        name: v.string(),
        email: v.string(),
        avatarUrl: v.optional(v.string()),
        coverUrl: v.optional(v.string()),
        bio: v.optional(v.string()),
        tagline: v.optional(v.string()),
        location: v.optional(v.string()),
        socials: v.optional(socialLinksValidator),
        role: v.optional(v.union(v.literal("owner"), v.literal("admin"))),
        joinedAt: v.optional(v.string()),
        postCount: v.optional(v.number()),
        followerCount: v.optional(v.number()),
        timezone: v.optional(v.string()),
        subdomainEnabled: v.optional(v.boolean()),
        customDomain: v.optional(v.string()),
        legalSettings: v.optional(tenantLegalSettingsValidator),
        seoSettings: v.optional(tenantSeoSettingsValidator),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: { legacyId: string; docId: string; status: "inserted" | "updated" }[] = []

    for (const u of args.users) {
      // Buscar si ya existe por legacyId, username o email
      let existing = await ctx.db
        .query("users")
        .withIndex("by_legacy_id", (q) => q.eq("legacyId", u.legacyId))
        .first()

      if (!existing) {
        existing = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", u.username))
          .first()
      }

      if (!existing) {
        existing = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", u.email))
          .first()
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          legacyId: u.legacyId,
          clerkUserId: u.clerkUserId ?? existing.clerkUserId,
          name: u.name,
          username: u.username,
          email: u.email,
          avatarUrl: u.avatarUrl || existing.avatarUrl,
          coverUrl: u.coverUrl || existing.coverUrl,
          bio: u.bio ?? existing.bio,
          tagline: u.tagline ?? existing.tagline,
          location: u.location ?? existing.location,
          socials: u.socials ?? existing.socials,
          role: u.role ?? existing.role,
          joinedAt: u.joinedAt ?? existing.joinedAt,
          postCount: u.postCount ?? existing.postCount,
          followerCount: u.followerCount ?? existing.followerCount,
          timezone: u.timezone ?? existing.timezone,
          subdomainEnabled: u.subdomainEnabled ?? existing.subdomainEnabled,
          customDomain: u.customDomain ?? existing.customDomain,
          legalSettings: u.legalSettings ?? existing.legalSettings,
          seoSettings: u.seoSettings ?? existing.seoSettings,
        })
        results.push({ legacyId: u.legacyId, docId: existing._id, status: "updated" })
      } else {
        const docId = await ctx.db.insert("users", {
          legacyId: u.legacyId,
          clerkUserId: u.clerkUserId,
          tokenIdentifier: u.tokenIdentifier,
          username: u.username,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatarUrl || "/placeholder.svg?height=200&width=200",
          coverUrl: u.coverUrl || "/placeholder.svg?height=400&width=1200",
          bio: u.bio || "",
          tagline: u.tagline || "",
          location: u.location,
          socials: u.socials || {},
          role: u.role || "owner",
          joinedAt: u.joinedAt || new Date().toISOString().split("T")[0],
          postCount: u.postCount || 0,
          followerCount: u.followerCount || 0,
          timezone: u.timezone || "UTC",
          subdomainEnabled: u.subdomainEnabled ?? true,
          customDomain: u.customDomain,
          legalSettings: u.legalSettings,
          seoSettings: u.seoSettings,
        })
        results.push({ legacyId: u.legacyId, docId, status: "inserted" })
      }
    }

    return results
  },
})

/**
 * 2. Importación por lotes de Categorías (Idempotente)
 */
export const importCategoriesBatch = internalMutation({
  args: {
    categories: v.array(
      v.object({
        legacyId: v.string(),
        tenantId: v.optional(v.string()),
        organizationId: v.optional(v.string()),
        authorId: v.optional(v.string()),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
        postCount: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: { legacyId: string; docId: string; status: "inserted" | "updated" }[] = []

    for (const c of args.categories) {
      let existing = await ctx.db
        .query("categories")
        .withIndex("by_legacy_id", (q) => q.eq("legacyId", c.legacyId))
        .first()

      if (!existing && c.organizationId) {
        existing = await ctx.db
          .query("categories")
          .withIndex("by_slug_and_org", (q) =>
            q.eq("slug", c.slug).eq("organizationId", c.organizationId!)
          )
          .first()
      }

      if (!existing && c.tenantId) {
        existing = await ctx.db
          .query("categories")
          .withIndex("by_slug_and_tenant", (q) =>
            q.eq("slug", c.slug).eq("tenantId", c.tenantId!)
          )
          .first()
      }

      if (!existing) {
        existing = await ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", c.slug))
          .first()
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          legacyId: c.legacyId,
          tenantId: c.tenantId ?? existing.tenantId,
          organizationId: c.organizationId ?? existing.organizationId,
          authorId: c.authorId ?? existing.authorId,
          name: c.name,
          slug: c.slug,
          description: c.description ?? existing.description,
          color: c.color ?? existing.color,
          icon: c.icon ?? existing.icon,
          postCount: c.postCount ?? existing.postCount,
        })
        results.push({ legacyId: c.legacyId, docId: existing._id, status: "updated" })
      } else {
        const docId = await ctx.db.insert("categories", {
          legacyId: c.legacyId,
          tenantId: c.tenantId,
          organizationId: c.organizationId,
          authorId: c.authorId,
          name: c.name,
          slug: c.slug,
          description: c.description,
          color: c.color || "#3b82f6",
          icon: c.icon,
          postCount: c.postCount || 0,
        })
        results.push({ legacyId: c.legacyId, docId, status: "inserted" })
      }
    }

    return results
  },
})

/**
 * 3. Importación por lotes de Tags (Idempotente)
 */
export const importTagsBatch = internalMutation({
  args: {
    tags: v.array(
      v.object({
        legacyId: v.string(),
        tenantId: v.optional(v.string()),
        organizationId: v.optional(v.string()),
        authorId: v.optional(v.string()),
        name: v.string(),
        slug: v.string(),
        color: v.optional(v.string()),
        postCount: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: { legacyId: string; docId: string; status: "inserted" | "updated" }[] = []

    for (const t of args.tags) {
      let existing = await ctx.db
        .query("tags")
        .withIndex("by_legacy_id", (q) => q.eq("legacyId", t.legacyId))
        .first()

      if (!existing && t.organizationId) {
        existing = await ctx.db
          .query("tags")
          .withIndex("by_slug_and_org", (q) =>
            q.eq("slug", t.slug).eq("organizationId", t.organizationId!)
          )
          .first()
      }

      if (!existing && t.tenantId) {
        existing = await ctx.db
          .query("tags")
          .withIndex("by_slug_and_tenant", (q) =>
            q.eq("slug", t.slug).eq("tenantId", t.tenantId!)
          )
          .first()
      }

      if (!existing) {
        existing = await ctx.db
          .query("tags")
          .withIndex("by_slug", (q) => q.eq("slug", t.slug))
          .first()
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          legacyId: t.legacyId,
          tenantId: t.tenantId ?? existing.tenantId,
          organizationId: t.organizationId ?? existing.organizationId,
          authorId: t.authorId ?? existing.authorId,
          name: t.name,
          slug: t.slug,
          color: t.color ?? existing.color,
          postCount: t.postCount ?? existing.postCount,
        })
        results.push({ legacyId: t.legacyId, docId: existing._id, status: "updated" })
      } else {
        const docId = await ctx.db.insert("tags", {
          legacyId: t.legacyId,
          tenantId: t.tenantId,
          organizationId: t.organizationId,
          authorId: t.authorId,
          name: t.name,
          slug: t.slug,
          color: t.color || "#64748b",
          postCount: t.postCount || 0,
        })
        results.push({ legacyId: t.legacyId, docId, status: "inserted" })
      }
    }

    return results
  },
})

/**
 * 4. Importación por lotes de Publicaciones (Idempotente y resolución de relaciones)
 */
export const importPostsBatch = internalMutation({
  args: {
    posts: v.array(
      v.object({
        legacyId: v.string(),
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
        publishedAt: v.optional(v.union(v.string(), v.null())),
        updatedAt: v.string(),
        scheduledFor: v.optional(v.union(v.string(), v.null())),
        readingTimeMinutes: v.number(),
        views: v.number(),
        likes: v.number(),
        comments: v.number(),
        featured: v.boolean(),
        designData: v.optional(v.union(v.string(), v.null())),
        editorMode: v.optional(v.union(v.literal("notion"), v.literal("elementor"))),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: { legacyId: string; docId: string; status: "inserted" | "updated" }[] = []

    for (const p of args.posts) {
      // 1. Resolver autor (authorDocId)
      const authorDoc = await findDocById(ctx.db, "users", p.authorId)

      // 2. Resolver categoría (categoryDocId)
      let categoryDoc = null
      if (p.categoryId) {
        categoryDoc = await findDocById(ctx.db, "categories", p.categoryId)
      }

      // 3. Buscar si el post ya existe por legacyId o slug
      let existing = await ctx.db
        .query("posts")
        .withIndex("by_legacy_id", (q) => q.eq("legacyId", p.legacyId))
        .first()

      if (!existing) {
        existing = await ctx.db
          .query("posts")
          .withIndex("by_slug", (q) => q.eq("slug", p.slug))
          .first()
      }

      const postData = {
        legacyId: p.legacyId,
        authorId: p.authorId,
        authorDocId: authorDoc ? authorDoc._id : undefined,
        organizationId: p.organizationId || undefined,
        tenantId: p.tenantId || p.organizationId || (authorDoc ? authorDoc.username : undefined),
        categoryId: p.categoryId || undefined,
        categoryDocId: categoryDoc ? categoryDoc._id : undefined,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverUrl: p.coverUrl || undefined,
        tags: p.tags,
        status: p.status,
        publishedAt: p.publishedAt || undefined,
        updatedAt: p.updatedAt,
        scheduledFor: p.scheduledFor || undefined,
        readingTimeMinutes: p.readingTimeMinutes,
        views: p.views,
        likes: p.likes,
        comments: p.comments,
        featured: p.featured,
        designData: p.designData || undefined,
        editorMode: p.editorMode || "notion",
      }

      if (existing) {
        await ctx.db.patch(existing._id, postData)
        results.push({ legacyId: p.legacyId, docId: existing._id, status: "updated" })
      } else {
        const docId = await ctx.db.insert("posts", postData)
        results.push({ legacyId: p.legacyId, docId, status: "inserted" })
      }
    }

    return results
  },
})

/**
 * 5. Importación por lotes de Templates y Revisiones (Idempotente)
 */
export const importTemplatesBatch = internalMutation({
  args: {
    templates: v.array(
      v.object({
        legacyId: v.string(),
        tenantId: v.string(),
        tenantType: v.union(v.literal("organization"), v.literal("user")),
        name: v.string(),
        schemaVersion: v.string(),
        version: v.number(),
        draftSlots: v.record(v.string(), v.any()),
        publishedSlots: v.record(v.string(), v.any()),
        settings: tenantTemplateSettingsValidator,
        isPublished: v.boolean(),
        publishedAt: v.optional(v.union(v.string(), v.null())),
        createdAt: v.string(),
        updatedAt: v.string(),
      })
    ),
    revisions: v.array(
      v.object({
        legacyId: v.string(),
        templateId: v.string(),
        tenantId: v.string(),
        version: v.number(),
        slotsSnapshot: v.record(v.string(), v.any()),
        settingsSnapshot: tenantTemplateSettingsValidator,
        publishedBy: v.optional(v.union(v.string(), v.null())),
        createdAt: v.string(),
        changeSummary: v.optional(v.union(v.string(), v.null())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const templateResults: { legacyId: string; docId: string; status: "inserted" | "updated" }[] = []
    const revisionResults: { legacyId: string; docId: string; status: "inserted" | "updated" }[] = []

    // 1. Templates
    for (const t of args.templates) {
      let existing = await ctx.db
        .query("tenantTemplates")
        .withIndex("by_legacy_id", (q) => q.eq("legacyId", t.legacyId))
        .first()

      if (!existing) {
        existing = await ctx.db
          .query("tenantTemplates")
          .withIndex("by_tenant", (q) => q.eq("tenantId", t.tenantId))
          .first()
      }

      const tplData = {
        legacyId: t.legacyId,
        tenantId: t.tenantId,
        tenantType: t.tenantType,
        name: t.name,
        schemaVersion: t.schemaVersion || "1.0",
        version: t.version,
        draftSlots: t.draftSlots,
        publishedSlots: t.publishedSlots,
        settings: t.settings,
        isPublished: t.isPublished,
        publishedAt: t.publishedAt || undefined,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }

      if (existing) {
        await ctx.db.patch(existing._id, tplData)
        templateResults.push({ legacyId: t.legacyId, docId: existing._id, status: "updated" })
      } else {
        const docId = await ctx.db.insert("tenantTemplates", tplData)
        templateResults.push({ legacyId: t.legacyId, docId, status: "inserted" })
      }
    }

    // 2. Revisions
    for (const r of args.revisions) {
      let existing = await ctx.db
        .query("tenantTemplateRevisions")
        .withIndex("by_legacy_id", (q) => q.eq("legacyId", r.legacyId))
        .first()

      if (!existing) {
        existing = await ctx.db
          .query("tenantTemplateRevisions")
          .withIndex("by_tenant_and_version", (q) =>
            q.eq("tenantId", r.tenantId).eq("version", r.version)
          )
          .first()
      }

      const parentTemplate = await findDocById(ctx.db, "tenantTemplates", r.templateId)

      const revData = {
        legacyId: r.legacyId,
        templateId: r.templateId,
        templateDocId: parentTemplate ? parentTemplate._id : undefined,
        tenantId: r.tenantId,
        version: r.version,
        slotsSnapshot: r.slotsSnapshot,
        settingsSnapshot: r.settingsSnapshot,
        publishedBy: r.publishedBy || undefined,
        createdAt: r.createdAt,
        changeSummary: r.changeSummary || undefined,
      }

      if (existing) {
        await ctx.db.patch(existing._id, revData)
        revisionResults.push({ legacyId: r.legacyId, docId: existing._id, status: "updated" })
      } else {
        const docId = await ctx.db.insert("tenantTemplateRevisions", revData)
        revisionResults.push({ legacyId: r.legacyId, docId, status: "inserted" })
      }
    }

    return { templates: templateResults, revisions: revisionResults }
  },
})

/**
 * 6. Importación por lotes de Comentarios (Idempotente y resolución de post)
 */
export const importCommentsBatch = internalMutation({
  args: {
    comments: v.array(
      v.object({
        legacyId: v.string(),
        postId: v.string(),
        authorName: v.string(),
        authorAvatarUrl: v.optional(v.string()),
        authorEmail: v.optional(v.string()),
        authorUserId: v.optional(v.string()),
        content: v.string(),
        createdAt: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: { legacyId: string; docId: string; status: "inserted" | "updated" }[] = []

    for (const c of args.comments) {
      const post = await findDocById(ctx.db, "posts", c.postId)

      let existing = await ctx.db
        .query("comments")
        .withIndex("by_legacy_id", (q) => q.eq("legacyId", c.legacyId))
        .first()

      const commentData = {
        legacyId: c.legacyId,
        postId: c.postId,
        postDocId: post ? post._id : undefined,
        authorName: c.authorName,
        authorAvatarUrl: c.authorAvatarUrl || "/placeholder.svg?height=200&width=200",
        authorEmail: c.authorEmail,
        authorUserId: c.authorUserId,
        content: c.content,
        createdAt: c.createdAt,
      }

      if (existing) {
        await ctx.db.patch(existing._id, commentData)
        results.push({ legacyId: c.legacyId, docId: existing._id, status: "updated" })
      } else {
        const docId = await ctx.db.insert("comments", commentData)
        results.push({ legacyId: c.legacyId, docId, status: "inserted" })
      }
    }

    return results
  },
})

/**
 * 7. Conciliación Atómica de Contadores Derivados
 */
export const reconcileCounters = internalMutation({
  args: {},
  handler: async (ctx) => {
    const stats = {
      reconciledUsers: 0,
      reconciledPosts: 0,
      reconciledCategories: 0,
      reconciledTags: 0,
    }

    const allUsers = await ctx.db.query("users").collect()
    const allPosts = await ctx.db.query("posts").collect()
    const allComments = await ctx.db.query("comments").collect()
    const allCategories = await ctx.db.query("categories").collect()
    const allTags = await ctx.db.query("tags").collect()

    // 1. Recalcular comments por post
    for (const post of allPosts) {
      const postCommentsCount = allComments.filter(
        (c) =>
          c.postId === post.legacyId ||
          c.postId === (post._id as string) ||
          c.postDocId === post._id
      ).length

      if (post.comments !== postCommentsCount) {
        await ctx.db.patch(post._id, { comments: postCommentsCount })
        stats.reconciledPosts++
      }
    }

    // 2. Recalcular postCount por usuario/autor
    for (const user of allUsers) {
      const userPostsCount = allPosts.filter(
        (p) =>
          p.authorId === user.legacyId ||
          p.authorId === (user._id as string) ||
          p.authorId === user.clerkUserId ||
          p.authorId === user.username ||
          p.authorDocId === user._id
      ).length

      if (user.postCount !== userPostsCount) {
        await ctx.db.patch(user._id, { postCount: userPostsCount })
        stats.reconciledUsers++
      }
    }

    // 3. Recalcular postCount por categoría
    for (const cat of allCategories) {
      const catPostsCount = allPosts.filter(
        (p) =>
          p.categoryId === cat.legacyId ||
          p.categoryId === (cat._id as string) ||
          p.categoryId === cat.slug ||
          p.categoryDocId === cat._id
      ).length

      if (cat.postCount !== catPostsCount) {
        await ctx.db.patch(cat._id, { postCount: catPostsCount })
        stats.reconciledCategories++
      }
    }

    // 4. Recalcular postCount por tag
    for (const tag of allTags) {
      const tagPostsCount = allPosts.filter(
        (p) => p.tags && p.tags.includes(tag.slug)
      ).length

      if (tag.postCount !== tagPostsCount) {
        await ctx.db.patch(tag._id, { postCount: tagPostsCount })
        stats.reconciledTags++
      }
    }

    return stats
  },
})

/**
 * 8. Resumen Cuantitativo de Migración
 */
export const getMigrationStats = query({
  args: {},
  handler: async (ctx) => {
    const [users, categories, tags, posts, comments, tenantTemplates, tenantTemplateRevisions] =
      await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db.query("categories").collect(),
        ctx.db.query("tags").collect(),
        ctx.db.query("posts").collect(),
        ctx.db.query("comments").collect(),
        ctx.db.query("tenantTemplates").collect(),
        ctx.db.query("tenantTemplateRevisions").collect(),
      ])

    return {
      totals: {
        users: users.length,
        categories: categories.length,
        tags: tags.length,
        posts: posts.length,
        comments: comments.length,
        tenantTemplates: tenantTemplates.length,
        tenantTemplateRevisions: tenantTemplateRevisions.length,
      },
      tenants: Array.from(
        new Set([
          ...users.map((u) => u.username),
          ...posts.map((p) => p.tenantId || p.organizationId || p.authorId),
          ...tenantTemplates.map((t) => t.tenantId),
        ].filter(Boolean))
      ),
      orphans: {
        postsWithoutAuthor: posts.filter((p) => !p.authorDocId).length,
        postsWithoutCategory: posts.filter((p) => p.categoryId && !p.categoryDocId).length,
        commentsWithoutPost: comments.filter((c) => !c.postDocId).length,
        revisionsWithoutTemplate: tenantTemplateRevisions.filter((r) => !r.templateDocId).length,
      },
    }
  },
})

/**
 * 9. Reset de seguridad (para staging / rollback en desarrollo)
 */
export const resetMigratedData = internalMutation({
  args: { confirmationKey: v.string() },
  handler: async (ctx, args) => {
    if (args.confirmationKey !== "CONFIRM_RESET_MIGRATION_DATA") {
      throw new Error("Clave de confirmación inválida para resetear datos de Convex.")
    }

    const tables = [
      "comments",
      "tenantTemplateRevisions",
      "tenantTemplates",
      "posts",
      "tags",
      "categories",
      "users",
    ] as const

    const deletedCounts: Record<string, number> = {}

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect()
      for (const doc of docs) {
        await ctx.db.delete(doc._id)
      }
      deletedCounts[table] = docs.length
    }

    return deletedCounts
  },
})
