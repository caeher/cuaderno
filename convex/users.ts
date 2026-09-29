import { v, type Infer } from "convex/values"
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server"
import { requireTenantAuth } from "./lib/auth"
import { findDocById, getCurrentIsoDate } from "./lib/helpers"
import type { Doc } from "./_generated/dataModel"
import {
  socialLinksValidator,
  tenantLegalSettingsValidator,
  tenantSeoSettingsValidator,
} from "./schema"

const publicAuthorValidator = v.object({
  username: v.string(),
  name: v.string(),
  avatarUrl: v.string(),
  coverUrl: v.string(),
  bio: v.string(),
  tagline: v.string(),
  location: v.optional(v.string()),
  socials: socialLinksValidator,
  joinedAt: v.string(),
  postCount: v.number(),
  followerCount: v.number(),
  subdomainEnabled: v.optional(v.boolean()),
  customDomain: v.optional(v.string()),
})

const publicLegalSettingsValidator = tenantLegalSettingsValidator
const publicSeoSettingsValidator = v.object({
  metaTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
  keywords: v.optional(v.array(v.string())),
  geoCountry: v.optional(v.string()),
  geoRegion: v.optional(v.string()),
  geoCity: v.optional(v.string()),
  geoCoordinates: v.optional(v.string()),
  socialSharingImage: v.optional(v.string()),
})

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  legacyId: v.optional(v.string()),
  clerkUserId: v.optional(v.string()),
  publicTenantId: v.optional(v.string()),
  tokenIdentifier: v.optional(v.string()),
  username: v.string(),
  name: v.string(),
  email: v.string(),
  avatarUrl: v.string(),
  coverUrl: v.string(),
  bio: v.string(),
  tagline: v.string(),
  location: v.optional(v.string()),
  socials: socialLinksValidator,
  role: v.union(v.literal("owner"), v.literal("admin")),
  joinedAt: v.string(),
  postCount: v.number(),
  followerCount: v.number(),
  timezone: v.optional(v.string()),
  subdomainEnabled: v.optional(v.boolean()),
  customDomain: v.optional(v.string()),
  legacyCustomDomain: v.optional(v.string()),
  legalSettings: v.optional(tenantLegalSettingsValidator),
  seoSettings: v.optional(tenantSeoSettingsValidator),
})
const nullableUserValidator = v.union(userValidator, v.null())
const publicTenantOrganizationStatusValidator = v.union(
  v.object({ username: v.string(), isMappedToCurrentOrganization: v.boolean(), mappedElsewhere: v.boolean() }),
  v.null()
)

export function toPublicAuthor(user: {
  username: string
  name: string
  avatarUrl: string
  coverUrl: string
  bio: string
  tagline: string
  location?: string
  socials: { website?: string; twitter?: string; github?: string; linkedin?: string; instagram?: string }
  joinedAt: string
  postCount: number
  followerCount: number
  subdomainEnabled?: boolean
  verifiedCustomDomain?: string
}) {
  return {
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    bio: user.bio,
    tagline: user.tagline,
    ...(user.location !== undefined ? { location: user.location } : {}),
    socials: user.socials,
    joinedAt: user.joinedAt,
    postCount: user.postCount,
    followerCount: user.followerCount,
    ...(user.subdomainEnabled !== undefined ? { subdomainEnabled: user.subdomainEnabled } : {}),
    ...(user.verifiedCustomDomain ? { customDomain: user.verifiedCustomDomain } : {}),
  }
}

export async function listPublicHandler(ctx: QueryCtx) {
  const users = await ctx.db.query("users").collect()
  return users.map(toPublicAuthor)
}

export const listPublic = query({
  args: {},
  returns: v.array(publicAuthorValidator),
  handler: listPublicHandler,
})

export async function getPrivateByIdHandler(ctx: QueryCtx, args: { id: string }) {
  const identity = await requireTenantAuth(ctx)
  const user = await findDocById(ctx.db, "users", args.id)
  if (!user) return null

  if (user.clerkUserId !== identity.userId) {
    throw new Error("Acceso denegado: solo el propietario puede consultar su perfil privado.")
  }
  return toPrivateUserWithVerifiedDomain(user)
}

export const getPrivateById = query({
  args: { id: v.string() },
  returns: nullableUserValidator,
  handler: getPrivateByIdHandler,
})

export async function getCurrentHandler(ctx: QueryCtx) {
  const identity = await requireTenantAuth(ctx)
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.userId))
    .first()
  return user ? toPrivateUserWithVerifiedDomain(user) : null
}

function toPrivateUserWithVerifiedDomain(user: Doc<"users">) {
  const { verifiedCustomDomain, customDomain: legacyCustomDomain, ...privateProfile } = user
  return {
    ...privateProfile,
    customDomain: verifiedCustomDomain,
    ...(!verifiedCustomDomain && legacyCustomDomain ? { legacyCustomDomain } : {}),
  }
}

export const getCurrent = query({
  args: {},
  returns: nullableUserValidator,
  handler: getCurrentHandler,
})

export async function getPublicByUsernameHandler(ctx: QueryCtx, args: { username: string }) {
  const users = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", args.username))
    .collect()
  if (users.length !== 1) return null
  const user = users[0]!
  if (!user) return null
  return toPublicAuthor(user)
}

export const getPublicByUsername = query({
  args: { username: v.string() },
  returns: v.union(publicAuthorValidator, v.null()),
  handler: getPublicByUsernameHandler,
})

export async function getPublicLegalSettingsByUsernameHandler(ctx: QueryCtx, args: { username: string }) {
  const users = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", args.username))
    .collect()
  if (users.length !== 1) return null
  const user = users[0]!
  return user?.legalSettings ?? null
}

export const getPublicLegalSettingsByUsername = query({
  args: { username: v.string() },
  returns: v.union(publicLegalSettingsValidator, v.null()),
  handler: getPublicLegalSettingsByUsernameHandler,
})

export async function getPublicSeoSettingsByUsernameHandler(ctx: QueryCtx, args: { username: string }) {
  const users = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", args.username))
    .collect()
  if (users.length !== 1) return null
  const user = users[0]!
  const seo = user?.seoSettings
  if (!seo) return null

  return {
    ...(seo.metaTitle !== undefined ? { metaTitle: seo.metaTitle } : {}),
    ...(seo.metaDescription !== undefined ? { metaDescription: seo.metaDescription } : {}),
    ...(seo.keywords !== undefined ? { keywords: seo.keywords } : {}),
    ...(seo.geoCountry !== undefined ? { geoCountry: seo.geoCountry } : {}),
    ...(seo.geoRegion !== undefined ? { geoRegion: seo.geoRegion } : {}),
    ...(seo.geoCity !== undefined ? { geoCity: seo.geoCity } : {}),
    ...(seo.geoCoordinates !== undefined ? { geoCoordinates: seo.geoCoordinates } : {}),
    ...(seo.socialSharingImage !== undefined ? { socialSharingImage: seo.socialSharingImage } : {}),
  }
}

export const getPublicSeoSettingsByUsername = query({
  args: { username: v.string() },
  returns: v.union(publicSeoSettingsValidator, v.null()),
  handler: getPublicSeoSettingsByUsernameHandler,
})

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
  returns: v.union(v.object({ username: v.string(), customDomain: v.union(v.string(), v.null()) }), v.null()),
  handler: getByCustomDomainHandler,
})

export async function getByCustomDomainHandler(ctx: QueryCtx, args: { customDomain: string }) {
  const domain = args.customDomain.trim().toLowerCase()
  const claims = await ctx.db
    .query("customDomainClaims")
    .withIndex("by_hostname", (q) => q.eq("hostname", domain))
    .take(2)
  if (claims.length !== 1 || claims[0]?.status !== "verified") return null

  const claim = claims[0]
  const owner = await ctx.db.get(claim.userId)
  if (!owner || owner.verifiedCustomDomain !== claim.hostname) return null
  const tenantId = owner.publicTenantId ?? owner.clerkUserId ?? owner.legacyId ?? (owner._id as string)
  if (claim.tenantId !== tenantId) return null

  return {
    username: owner.username,
    customDomain: claim.hostname,
  }
}

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
    legalSettings: v.optional(tenantLegalSettingsValidator),
    seoSettings: v.optional(tenantSeoSettingsValidator),
  },
  returns: nullableUserValidator,
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
      if (existing.clerkUserId !== identity.userId) {
        throw new Error("Ese nombre de usuario ya está en uso.")
      }
      return toPrivateUserWithVerifiedDomain(existing)
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
      legalSettings: args.legalSettings,
      seoSettings: args.seoSettings,
    })

    const created = await ctx.db.get(docId)
    return created ? toPrivateUserWithVerifiedDomain(created) : null
  },
})

const updateArgsValidator = v.object({
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
  legalSettings: v.optional(tenantLegalSettingsValidator),
  seoSettings: v.optional(tenantSeoSettingsValidator),
})

export async function updateUserHandler(
  ctx: MutationCtx,
  args: Infer<typeof updateArgsValidator>
) {
  const identity = await requireTenantAuth(ctx)
  const user = await findDocById(ctx.db, "users", args.id)
  if (!user) return null

  // Profile fields are personal. Organization roles grant no access to a member's profile.
  // Legacy profiles are linked to this subject by syncFromClerk before they can be edited.
  if (user.clerkUserId !== identity.userId) {
    throw new Error("Acceso denegado: No tienes autorización para modificar este usuario.")
  }

  if (args.username !== undefined && args.username !== user.username) {
    const matches = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username!))
      .collect()
    if (matches.some((candidate) => candidate._id !== user._id)) {
      throw new Error("Ese nombre de usuario ya está en uso.")
    }
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
  if (args.legalSettings !== undefined) updates.legalSettings = args.legalSettings
  if (args.seoSettings !== undefined) updates.seoSettings = args.seoSettings

  await ctx.db.patch(user._id, updates)
  const updated = await ctx.db.get(user._id)
  return updated ? toPrivateUserWithVerifiedDomain(updated) : null
}

export const update = mutation({
  args: updateArgsValidator,
  returns: nullableUserValidator,
  handler: updateUserHandler,
})

/** Asocia el perfil público del administrador con el tenant de su organización activa. */
export const getPublicTenantOrganizationStatus = query({
  args: {},
  returns: publicTenantOrganizationStatusValidator,
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx)
    const profiles = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.userId))
      .collect()
    if (profiles.length !== 1) return null

    const profile = profiles[0]!
    const isMappedToCurrentOrganization =
      identity.tenantType === "organization" && profile.publicTenantId === identity.tenantId
    return {
      username: profile.username,
      isMappedToCurrentOrganization,
      mappedElsewhere: Boolean(profile.publicTenantId && !isMappedToCurrentOrganization),
    }
  },
})

async function revokeProfileDomainClaims(
  ctx: MutationCtx,
  profile: Doc<"users">,
  previousTenantId: string,
  now: number
) {
  const [pending, verified] = await Promise.all([
    ctx.db
      .query("customDomainClaims")
      .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", previousTenantId).eq("status", "pending"))
      .take(2),
    ctx.db
      .query("customDomainClaims")
      .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", previousTenantId).eq("status", "verified"))
      .take(2),
  ])

  if (pending.length > 1 || verified.length > 1 || pending.length + verified.length > 1) {
    throw new Error("El perfil tiene reclamaciones de dominio activas ambiguas; requiere revisión operativa.")
  }

  for (const claim of [...pending, ...verified]) {
    if (claim.userId === profile._id) {
      await ctx.db.patch(claim._id, { status: "revoked", revokedAt: now, updatedAt: now })
    }
  }
  if (profile.customDomain || profile.verifiedCustomDomain) {
    await ctx.db.patch(profile._id, { customDomain: undefined, verifiedCustomDomain: undefined })
  }
}

export const setPublicTenantOrganization = mutation({
  args: {},
  returns: v.union(v.object({ username: v.string(), isMapped: v.boolean() }), v.null()),
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx)
    if (
      identity.tenantType !== "organization" ||
      !["org:admin", "org:owner"].includes(identity.orgRole ?? "")
    ) {
      throw new Error("Solo un administrador de la organización activa puede asociar el blog público.")
    }

    const profiles = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.userId))
      .collect()
    if (profiles.length !== 1) return null

    const profile = profiles[0]!
    if (profile.publicTenantId && profile.publicTenantId !== identity.tenantId) {
      throw new Error("Este perfil público ya está asociado a otro tenant.")
    }

    const mappedProfiles = await ctx.db
      .query("users")
      .withIndex("by_public_tenant_id", (q) => q.eq("publicTenantId", identity.tenantId))
      .collect()
    if (mappedProfiles.some((candidate) => candidate._id !== profile._id)) {
      throw new Error("Este tenant ya está asociado a otro perfil público.")
    }

    if (profile.publicTenantId !== identity.tenantId) {
      const previousTenantId = profile.publicTenantId ?? profile.clerkUserId ?? profile.legacyId ?? (profile._id as string)
      await revokeProfileDomainClaims(ctx, profile, previousTenantId, Date.now())
      await ctx.db.patch(profile._id, { publicTenantId: identity.tenantId })
    }

    return { username: profile.username, isMapped: true }
  },
})

const syncFromClerkArgsValidator = v.object({
  clerkUserId: v.string(),
  name: v.string(),
  email: v.string(),
  username: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
})

export async function syncFromClerkHandler(
  ctx: MutationCtx,
  args: Infer<typeof syncFromClerkArgsValidator>
) {
  const identity = await requireTenantAuth(ctx)
  if (identity.userId !== args.clerkUserId) {
    throw new Error("Acceso denegado: Solo puedes sincronizar tu propio perfil de Clerk.")
  }

  const profiles = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
    .take(2)
  if (profiles.length > 1) {
    throw new Error("No se puede sincronizar: hay varios perfiles asociados a esta cuenta de Clerk.")
  }

  let existing = profiles[0]
  if (!existing && identity.tokenIdentifier) {
    const legacyProfiles = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier!))
      .take(2)
    if (legacyProfiles.length > 1) {
      throw new Error("No se puede migrar el perfil: la identidad heredada es ambigua.")
    }

    const legacyProfile = legacyProfiles[0]
    if (legacyProfile) {
      if (legacyProfile.clerkUserId && legacyProfile.clerkUserId !== identity.userId) {
        throw new Error("No se puede migrar el perfil: ya está asociado a otra cuenta de Clerk.")
      }
      existing = legacyProfile
    }
  }

  if (existing) {
    let username = args.username || existing.username
    if (username !== existing.username) {
      const matches = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .collect()
      if (matches.some((candidate) => candidate._id !== existing!._id)) {
        // Clerk usernames are mutable profile data, not proof of identity or ownership.
        // Keep the stored handle and let the owner choose another one in profile settings.
        username = existing.username
      }
    }

    await ctx.db.patch(existing._id, {
      clerkUserId: identity.userId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl || existing.avatarUrl,
      username,
      tokenIdentifier: identity.tokenIdentifier ?? existing.tokenIdentifier,
    })
    return await ctx.db.get(existing._id)
  }

  const requestedUsername =
    args.username ||
    args.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "") ||
    `user_${Math.random().toString(36).substring(2, 8)}`
  const usernameMatches = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", requestedUsername))
    .take(1)
  let fallbackUsername = requestedUsername
  if (usernameMatches.length) {
    const baseUsername = `user_${args.clerkUserId.replace(/[^a-zA-Z0-9_-]/g, "")}`
    let hasAvailableUsername = false
    for (let suffix = 0; suffix < 20; suffix += 1) {
      const candidate = suffix === 0 ? baseUsername : `${baseUsername}_${suffix}`
      const matches = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", candidate))
        .take(1)
      if (matches.length === 0) {
        fallbackUsername = candidate
        hasAvailableUsername = true
        break
      }
    }
    if (!hasAvailableUsername) {
      throw new Error("No se pudo asignar un nombre de usuario único al perfil.")
    }
  }

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
}

export const syncFromClerk = mutation({
  args: syncFromClerkArgsValidator,
  returns: nullableUserValidator,
  handler: syncFromClerkHandler,
})
