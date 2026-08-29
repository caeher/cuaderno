import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { assertCanManageTenant, getTenantIdentity, requireTenantAuth } from "./lib/auth"
import { findDocById, getCurrentIsoTimestamp } from "./lib/helpers"
import { tenantTemplateSettingsValidator } from "./schema"

function sanitizeTemplateForPublic<T extends { draftSlots?: unknown }>(template: T) {
  const { draftSlots: _draftSlots, ...rest } = template
  return rest
}

export const getByTenantId = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("tenantTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (!template) return null

    const identity = await getTenantIdentity(ctx)
    if (!identity.isAuthenticated) {
      return sanitizeTemplateForPublic(template)
    }

    try {
      assertCanManageTenant(identity as Parameters<typeof assertCanManageTenant>[0], args.tenantId)
      return template
    } catch {
      return sanitizeTemplateForPublic(template)
    }
  },
})

export const getPublishedForTenant = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("tenantTemplates")
      .withIndex("by_tenant_and_published", (q) =>
        q.eq("tenantId", args.tenantId).eq("isPublished", true)
      )
      .first()

    if (!template) return null

    return sanitizeTemplateForPublic(template)
  },
})

export const getRevisions = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.tenantId)

    const revisions = await ctx.db
      .query("tenantTemplateRevisions")
      .withIndex("by_tenant_and_version", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    return revisions.sort((a, b) => b.version - a.version)
  },
})

export const create = mutation({
  args: {
    id: v.optional(v.string()),
    tenantId: v.string(),
    tenantType: v.optional(v.union(v.literal("organization"), v.literal("user"))),
    name: v.optional(v.string()),
    draftSlots: v.optional(v.record(v.string(), v.any())),
    settings: v.optional(tenantTemplateSettingsValidator),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.tenantId)
    assertCanManageTenant(identity, args.tenantId)

    const existing = await ctx.db
      .query("tenantTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (existing) {
      return existing
    }

    const now = getCurrentIsoTimestamp()
    const isOrg = args.tenantId.startsWith("org_")
    const tenantType = args.tenantType || (isOrg ? "organization" : "user")

    const docId = await ctx.db.insert("tenantTemplates", {
      legacyId: args.id,
      tenantId: args.tenantId,
      tenantType,
      name: args.name || "Plantilla Predeterminada",
      schemaVersion: "1.0",
      version: 1,
      draftSlots: args.draftSlots || {},
      publishedSlots: {},
      settings: args.settings || {},
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(docId)
  },
})

export const saveDraft = mutation({
  args: {
    tenantId: v.string(),
    name: v.optional(v.string()),
    draftSlots: v.optional(v.record(v.string(), v.any())),
    settings: v.optional(tenantTemplateSettingsValidator),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.tenantId)
    assertCanManageTenant(identity, args.tenantId)

    let template = await ctx.db
      .query("tenantTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first()

    const now = getCurrentIsoTimestamp()

    if (!template) {
      const isOrg = args.tenantId.startsWith("org_")
      const docId = await ctx.db.insert("tenantTemplates", {
        tenantId: args.tenantId,
        tenantType: isOrg ? "organization" : "user",
        name: args.name || "Plantilla Predeterminada",
        schemaVersion: "1.0",
        version: 1,
        draftSlots: args.draftSlots || {},
        publishedSlots: {},
        settings: args.settings || {},
        isPublished: false,
        createdAt: now,
        updatedAt: now,
      })
      return await ctx.db.get(docId)
    }

    const updates: Partial<typeof template> = {
      updatedAt: now,
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.draftSlots !== undefined) updates.draftSlots = args.draftSlots
    if (args.settings !== undefined) updates.settings = args.settings

    await ctx.db.patch(template._id, updates)
    return await ctx.db.get(template._id)
  },
})

export const publish = mutation({
  args: {
    tenantId: v.string(),
    publishedBy: v.optional(v.string()),
    changeSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.tenantId)
    assertCanManageTenant(identity, args.tenantId)

    let template = await ctx.db
      .query("tenantTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first()

    const now = getCurrentIsoTimestamp()

    if (!template) {
      const isOrg = args.tenantId.startsWith("org_")
      const docId = await ctx.db.insert("tenantTemplates", {
        tenantId: args.tenantId,
        tenantType: isOrg ? "organization" : "user",
        name: "Plantilla Predeterminada",
        schemaVersion: "1.0",
        version: 1,
        draftSlots: {},
        publishedSlots: {},
        settings: {},
        isPublished: false,
        createdAt: now,
        updatedAt: now,
      })
      template = (await ctx.db.get(docId))!
    }

    const nextVersion = template.version + 1
    const publishedSlots = { ...template.draftSlots }

    // 1. Actualizar template principal
    await ctx.db.patch(template._id, {
      publishedSlots,
      isPublished: true,
      publishedAt: now,
      version: nextVersion,
      updatedAt: now,
    })

    // 2. Insertar revisión inmutable
    await ctx.db.insert("tenantTemplateRevisions", {
      templateId: template.legacyId || (template._id as string),
      templateDocId: template._id,
      tenantId: args.tenantId,
      version: nextVersion,
      slotsSnapshot: publishedSlots,
      settingsSnapshot: template.settings || {},
      publishedBy: args.publishedBy || identity.name || identity.userId || undefined,
      createdAt: now,
      changeSummary: args.changeSummary || `Publicación de versión ${nextVersion}`,
    })

    return await ctx.db.get(template._id)
  },
})

export const rollback = mutation({
  args: {
    tenantId: v.string(),
    revisionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.tenantId)
    assertCanManageTenant(identity, args.tenantId)

    const template = await ctx.db
      .query("tenantTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (!template) return null

    const revision = await findDocById(ctx.db, "tenantTemplateRevisions", args.revisionId)
    if (!revision) return null

    const now = getCurrentIsoTimestamp()

    await ctx.db.patch(template._id, {
      draftSlots: revision.slotsSnapshot,
      settings: revision.settingsSnapshot,
      updatedAt: now,
    })

    return await ctx.db.get(template._id)
  },
})
