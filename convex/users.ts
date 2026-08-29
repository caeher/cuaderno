import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getTenantIdentity, requireTenantAuth } from "./lib/auth"
import { findDocById, getCurrentIsoDate } from "./lib/helpers"
import {
  socialLinksValidator,
  tenantLegalSettingsValidator,
  tenantSeoSettingsValidator,
} from "./schema"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect()
  },
})

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await findDocById(ctx.db, "users", args.id)
  },
})

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first()
  },
})

export const getByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()
  },
})

/**
 * Normaliza un dominio personalizado a su forma canónica de almacenamiento.
 *
 * Se aplica en la ESCRITURA además de en la lectura: si el usuario guarda
 * "https://www.blog.com/" y el middleware busca por el host "blog.com", el índice
 * `by_custom_domain` no encuentra nada. Normalizar solo al leer no alcanza porque
 * el índice se construye sobre el valor almacenado.
 */
function normalizeCustomDomainValue(value: string | undefined | null): string | undefined {
  if (value === undefined || value === null) return undefined

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    .split(":")[0]
    .replace(/^www\./, "")

  if (!normalized || !normalized.includes(".")) return undefined

  return normalized
}

/**
 * Resuelve el tenant dueño de un dominio personalizado (issue #12).
 *
 * La consume el middleware (`proxy.ts`) para mapear host -> tenant cuando el blog
 * no vive en un subdominio de la plataforma sino en su propio dominio.
 *
 * Devuelve una proyección mínima a propósito: la llamada llega sin sesión desde el
 * borde, así que no debe exponer el documento completo del usuario.
 */
export const getByCustomDomain = query({
  args: { customDomain: v.string() },
  handler: async (ctx, args) => {
    const domain = normalizeCustomDomainValue(args.customDomain)
    if (!domain) return null

    const owner = await ctx.db
      .query("users")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", domain))
      .first()

    if (!owner) return null

    return {
      username: owner.username,
      customDomain: owner.customDomain ?? null,
    }
  },
})

export const create = mutation({
  args: {
    id: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)

    if (args.clerkUserId && args.clerkUserId !== identity.userId) {
      throw new Error("Acceso denegado: No puedes crear un usuario para otro perfil de Clerk.")
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first()

    if (existing) {
      return existing
    }

    const now = getCurrentIsoDate()
    const docId = await ctx.db.insert("users", {
      legacyId: args.id,
      clerkUserId: args.clerkUserId ?? identity.userId,
      tokenIdentifier: identity.tokenIdentifier ?? undefined,
      username: args.username,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl || "/placeholder.svg?height=200&width=200",
      coverUrl: args.coverUrl || "/placeholder.svg?height=400&width=1200",
      bio: args.bio || "",
      tagline: args.tagline || "",
      location: args.location,
      socials: args.socials || {},
      role: args.role || "owner",
      joinedAt: args.joinedAt || now,
      postCount: args.postCount || 0,
      followerCount: args.followerCount || 0,
      timezone: args.timezone || "UTC",
      subdomainEnabled: args.subdomainEnabled ?? true,
      customDomain: normalizeCustomDomainValue(args.customDomain),
      legalSettings: args.legalSettings,
      seoSettings: args.seoSettings,
    })

    return await ctx.db.get(docId)
  },
})

export const update = mutation({
  args: {
    id: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    tagline: v.optional(v.string()),
    location: v.optional(v.string()),
    socials: v.optional(socialLinksValidator),
    timezone: v.optional(v.string()),
    subdomainEnabled: v.optional(v.boolean()),
    customDomain: v.optional(v.string()),
    legalSettings: v.optional(tenantLegalSettingsValidator),
    seoSettings: v.optional(tenantSeoSettingsValidator),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    const user = await findDocById(ctx.db, "users", args.id)
    if (!user) return null

    const isSelf =
      identity.userId === user.clerkUserId ||
      identity.userId === user.legacyId ||
      identity.userId === (user._id as string) ||
      identity.username === user.username
    const isOrgAdmin = identity.tenantType === "organization" && identity.orgRole === "org:admin"
    if (!isSelf && !isOrgAdmin) {
      throw new Error("Acceso denegado: No tienes autorización para modificar este usuario.")
    }

    const updates: Partial<typeof user> = {}
    if (args.username !== undefined) updates.username = args.username
    if (args.name !== undefined) updates.name = args.name
    if (args.email !== undefined) updates.email = args.email
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl
    if (args.coverUrl !== undefined) updates.coverUrl = args.coverUrl
    if (args.bio !== undefined) updates.bio = args.bio
    if (args.tagline !== undefined) updates.tagline = args.tagline
    if (args.location !== undefined) updates.location = args.location
    if (args.socials !== undefined) updates.socials = args.socials
    if (args.timezone !== undefined) updates.timezone = args.timezone
    if (args.subdomainEnabled !== undefined) updates.subdomainEnabled = args.subdomainEnabled
    if (args.customDomain !== undefined)
      updates.customDomain = normalizeCustomDomainValue(args.customDomain)
    if (args.legalSettings !== undefined) updates.legalSettings = args.legalSettings
    if (args.seoSettings !== undefined) updates.seoSettings = args.seoSettings

    await ctx.db.patch(user._id, updates)
    return await ctx.db.get(user._id)
  },
})

export const syncFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    if (identity.userId !== args.clerkUserId) {
      throw new Error("Acceso denegado: Solo puedes sincronizar tu propio perfil de Clerk.")
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl || existing.avatarUrl,
        username: args.username || existing.username,
        tokenIdentifier: identity.tokenIdentifier ?? existing.tokenIdentifier,
      })
      return await ctx.db.get(existing._id)
    }

    const fallbackUsername =
      args.username ||
      args.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "") ||
      `user_${Math.random().toString(36).substring(2, 8)}`

    const docId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      tokenIdentifier: identity.tokenIdentifier ?? undefined,
      username: fallbackUsername,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl || "/placeholder.svg?height=200&width=200",
      coverUrl: "/placeholder.svg?height=400&width=1200",
      bio: "",
      tagline: "",
      socials: {},
      role: "owner",
      joinedAt: getCurrentIsoDate(),
      postCount: 0,
      followerCount: 0,
      timezone: "UTC",
      subdomainEnabled: true,
    })

    return await ctx.db.get(docId)
  },
})
