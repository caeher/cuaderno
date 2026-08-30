import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { assertCanManageResource, requireTenantAuth } from "./lib/auth"
import { findDocById } from "./lib/helpers"

const POST_STATUSES = ["draft", "published", "scheduled"] as const

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect()
  },
})

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await findDocById(ctx.db, "categories", args.id)
  },
})

export const getBySlug = query({
  args: {
    slug: v.string(),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.organizationId) {
      const match = await ctx.db
        .query("categories")
        .withIndex("by_slug_and_org", (q) =>
          q.eq("slug", args.slug).eq("organizationId", args.organizationId)
        )
        .first()
      if (match) return match
    }

    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
  },
})

export const getByOrganization = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const byOrg = await ctx.db
      .query("categories")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect()

    if (byOrg.length > 0) return byOrg

    const byAuthor = await ctx.db
      .query("categories")
      .withIndex("by_author", (q) => q.eq("authorId", args.organizationId))
      .collect()

    if (byAuthor.length > 0) return byAuthor

    return await ctx.db
      .query("categories")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.organizationId))
      .collect()
  },
})

export const create = mutation({
  args: {
    id: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    authorId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, {
      authorId: args.authorId || identity.userId,
      organizationId: args.organizationId,
      tenantId: args.tenantId || identity.tenantId,
    })

    const effectiveTenantId = identity.tenantId
    const effectiveAuthorId = args.authorId || identity.userId
    const effectiveOrgId =
      identity.tenantType === "organization"
        ? identity.orgId ?? undefined
        : args.organizationId === identity.tenantId
          ? args.organizationId
          : undefined

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug_and_tenant", (q) =>
        q.eq("slug", args.slug).eq("tenantId", effectiveTenantId)
      )
      .first()
    if (existing) {
      throw new Error(`Ya existe una categoría con el slug "${args.slug}".`)
    }

    const docId = await ctx.db.insert("categories", {
      legacyId: args.id,
      tenantId: effectiveTenantId,
      organizationId: effectiveOrgId,
      authorId: effectiveAuthorId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      color: args.color || "#3b82f6",
      icon: args.icon,
      postCount: 0,
    })

    return await ctx.db.get(docId)
  },
})

export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await findDocById(ctx.db, "categories", args.id)
    if (!category) return null

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, category)

    const updates: Partial<typeof category> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.slug !== undefined) updates.slug = args.slug
    if (args.description !== undefined) updates.description = args.description
    if (args.color !== undefined) updates.color = args.color
    if (args.icon !== undefined) updates.icon = args.icon

    await ctx.db.patch(category._id, updates)
    return await ctx.db.get(category._id)
  },
})

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const category = await findDocById(ctx.db, "categories", args.id)
    if (!category) return true

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, category)

    const tenantKey = category.tenantId || category.organizationId || category.authorId
    const categoryKeys = [category._id as string, category.legacyId].filter(
      (value): value is string => Boolean(value)
    )

    if (tenantKey) {
      for (const status of POST_STATUSES) {
        const posts = await ctx.db
          .query("posts")
          .withIndex("by_tenant_and_status", (q) =>
            q.eq("tenantId", tenantKey).eq("status", status)
          )
          .collect()
        for (const post of posts) {
          if (
            post.categoryDocId === category._id ||
            categoryKeys.includes(post.categoryId || "")
          ) {
            await ctx.db.patch(post._id, {
              categoryId: undefined,
              categoryDocId: undefined,
            })
          }
        }
      }
    } else {
      for (const status of POST_STATUSES) {
        for (const key of categoryKeys) {
          const posts = await ctx.db
            .query("posts")
            .withIndex("by_category_and_status", (q) =>
              q.eq("categoryId", key).eq("status", status)
            )
            .collect()
          for (const post of posts) {
            await ctx.db.patch(post._id, {
              categoryId: undefined,
              categoryDocId: undefined,
            })
          }
        }
      }
    }

    await ctx.db.delete(category._id)
    return true
  },
})
