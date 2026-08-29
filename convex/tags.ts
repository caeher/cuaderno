import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { assertCanManageResource, requireTenantAuth } from "./lib/auth"
import { findDocById } from "./lib/helpers"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tags").collect()
  },
})

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await findDocById(ctx.db, "tags", args.id)
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
        .query("tags")
        .withIndex("by_slug_and_org", (q) =>
          q.eq("slug", args.slug).eq("organizationId", args.organizationId)
        )
        .first()
      if (match) return match
    }

    return await ctx.db
      .query("tags")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
  },
})

export const getByOrganization = query({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const byOrg = await ctx.db
      .query("tags")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect()

    if (byOrg.length > 0) return byOrg

    const byAuthor = await ctx.db
      .query("tags")
      .withIndex("by_author", (q) => q.eq("authorId", args.organizationId))
      .collect()

    if (byAuthor.length > 0) return byAuthor

    return await ctx.db
      .query("tags")
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
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, {
      authorId: args.authorId,
      organizationId: args.organizationId,
      tenantId: args.tenantId,
    })

    const effectiveTenantId = args.tenantId || args.organizationId || identity.tenantId || undefined
    const effectiveAuthorId = args.authorId || identity.userId || undefined

    const docId = await ctx.db.insert("tags", {
      legacyId: args.id,
      tenantId: effectiveTenantId,
      organizationId: args.organizationId || (identity.tenantType === "organization" ? identity.orgId ?? undefined : undefined),
      authorId: effectiveAuthorId,
      name: args.name,
      slug: args.slug,
      color: args.color || "#64748b",
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
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tag = await findDocById(ctx.db, "tags", args.id)
    if (!tag) return null

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, tag)

    const updates: Partial<typeof tag> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.slug !== undefined) updates.slug = args.slug
    if (args.color !== undefined) updates.color = args.color

    await ctx.db.patch(tag._id, updates)
    return await ctx.db.get(tag._id)
  },
})

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const tag = await findDocById(ctx.db, "tags", args.id)
    if (!tag) return true

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, tag)

    await ctx.db.delete(tag._id)
    return true
  },
})
