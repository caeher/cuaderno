import { v } from "convex/values"
import { mutation, query, type QueryCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { assertCanManageResource, requireTenantAuth, type AuthenticatedTenantIdentity } from "./lib/auth"
import { calculateReadingTime, findDocById, getCurrentIsoDate } from "./lib/helpers"
import { assertCanReadEditorialPost, canReadEditorialPost } from "./lib/post-access"
import {
  adjustCategoryPostCount,
  adjustTagPostCounts,
  categoryAssignmentChanged,
  tagSlugsDiffer
} from "./lib/taxonomyCounts"
import { socialLinksValidator } from "./schema"

const postStatusValidator = v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))

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

const publishedPostValidator = v.object({
  id: v.id("posts"),
  author: publicAuthorValidator,
  tenant: v.union(publicAuthorValidator, v.null()),
  categoryId: v.union(v.string(), v.null()),
  title: v.string(),
  slug: v.string(),
  excerpt: v.string(),
  content: v.string(),
  coverUrl: v.union(v.string(), v.null()),
  tags: v.array(v.string()),
  status: v.literal("published"),
  publishedAt: v.union(v.string(), v.null()),
  updatedAt: v.string(),
  readingTimeMinutes: v.number(),
  views: v.number(),
  likes: v.number(),
  comments: v.number(),
  featured: v.boolean()
})

const postDocValidator = v.object({
  _id: v.id("posts"),
  _creationTime: v.number(),
  legacyId: v.optional(v.string()),
  authorId: v.string(),
  authorDocId: v.optional(v.id("users")),
  organizationId: v.optional(v.string()),
  tenantId: v.optional(v.string()),
  categoryId: v.optional(v.string()),
  categoryDocId: v.optional(v.id("categories")),
  title: v.string(),
  slug: v.string(),
  excerpt: v.string(),
  content: v.string(),
  coverUrl: v.optional(v.string()),
  tags: v.array(v.string()),
  status: postStatusValidator,
  publishedAt: v.optional(v.string()),
  updatedAt: v.string(),
  scheduledFor: v.optional(v.string()),
  readingTimeMinutes: v.number(),
  views: v.number(),
  likes: v.number(),
  comments: v.number(),
  featured: v.boolean(),
  designData: v.optional(v.string()),
  editorMode: v.optional(v.union(v.literal("notion"), v.literal("elementor"))),
  contentStorageId: v.optional(v.id("_storage"))
})

const publishedPostListValidator = v.array(publishedPostValidator)
const postDocListValidator = v.array(postDocValidator)
const nullablePublishedPostValidator = v.union(publishedPostValidator, v.null())
const nullablePostDocValidator = v.union(postDocValidator, v.null())

type PublicAuthorProjection = {
  username: string
  name: string
  avatarUrl: string
  coverUrl: string
  bio: string
  tagline: string
  location?: string
  socials: Doc<"users">["socials"]
  joinedAt: string
  postCount: number
  followerCount: number
  subdomainEnabled?: boolean
  customDomain?: string
}

type PublishedPostRecord = {
  id: Doc<"posts">["_id"]
  author: PublicAuthorProjection
  tenant: PublicAuthorProjection | null
  categoryId: string | null
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl: string | null
  tags: string[]
  status: "published"
  publishedAt: string | null
  updatedAt: string
  readingTimeMinutes: number
  views: number
  likes: number
  comments: number
  featured: boolean
}

type PublicAuthorResolver = (post: Doc<"posts">) => Promise<PublicAuthorProjection>

async function getUniqueUserByIdentity(ctx: QueryCtx, identity: string): Promise<Doc<"users"> | null> {
  const normalizedId = ctx.db.normalizeId("users", identity)
  if (normalizedId) return await ctx.db.get(normalizedId)

  const candidates = new Map<string, Doc<"users">>()
  const byLegacyId = await ctx.db
    .query("users")
    .withIndex("by_legacy_id", (q) => q.eq("legacyId", identity))
    .collect()
  if (byLegacyId.length > 1) return null
  if (byLegacyId[0]) candidates.set(byLegacyId[0]._id, byLegacyId[0])

  const byClerkUserId = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity))
    .collect()
  if (byClerkUserId.length > 1) return null
  if (byClerkUserId[0]) candidates.set(byClerkUserId[0]._id, byClerkUserId[0])

  const byUsername = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", identity))
    .collect()
  if (byUsername.length > 1) return null
  if (byUsername[0]) candidates.set(byUsername[0]._id, byUsername[0])
  return candidates.size === 1 ? candidates.values().next().value! : null
}

async function getPublicAuthorForPost(ctx: QueryCtx, post: Doc<"posts">): Promise<PublicAuthorProjection> {
  const authorFromDoc = post.authorDocId ? await ctx.db.get(post.authorDocId) : null
  const authorFromId = await getUniqueUserByIdentity(ctx, post.authorId)
  const author = authorFromDoc && authorFromId && authorFromDoc._id !== authorFromId._id
    ? null
    : authorFromDoc ?? authorFromId

  if (!author) {
    return {
      username: "autor",
      name: "Autor",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      coverUrl: "/placeholder.svg?height=400&width=1200",
      bio: "",
      tagline: "",
      socials: {},
      joinedAt: post.publishedAt ?? post.updatedAt,
      postCount: 0,
      followerCount: 0,
      subdomainEnabled: false,
    }
  }

  return toPublicAuthorProjection(author)
}

function toPublicAuthorProjection(author: Doc<"users">): PublicAuthorProjection {
  return {
    username: author.username,
    name: author.name,
    avatarUrl: author.avatarUrl,
    coverUrl: author.coverUrl,
    bio: author.bio,
    tagline: author.tagline,
    ...(author.location !== undefined ? { location: author.location } : {}),
    socials: author.socials,
    joinedAt: author.joinedAt,
    postCount: author.postCount,
    followerCount: author.followerCount,
    ...(author.subdomainEnabled !== undefined ? { subdomainEnabled: author.subdomainEnabled } : {}),
    ...(author.customDomain !== undefined ? { customDomain: author.customDomain } : {}),
  }
}

function getCanonicalPublicTenantId(author: Doc<"users">) {
  return author.publicTenantId ?? author.clerkUserId ?? author.legacyId ?? (author._id as string)
}

function getPublicTenantKeys(tenantId: string, author: Doc<"users"> | null) {
  return author?.publicTenantId ? new Set([author.publicTenantId]) : authorKeys(tenantId, author)
}

async function getPublicTenantForPost(ctx: QueryCtx, post: Doc<"posts">): Promise<PublicAuthorProjection | null> {
  const tenantId = post.tenantId || post.organizationId

  if (tenantId) {
    const mappedProfiles = await ctx.db
      .query("users")
      .withIndex("by_public_tenant_id", (q) => q.eq("publicTenantId", tenantId))
      .collect()
    if (mappedProfiles.length > 1) return null
    if (mappedProfiles[0]) return toPublicAuthorProjection(mappedProfiles[0])

    const profile = await getUniqueTenantProfileByIdentity(ctx, tenantId)
    if (!profile || (profile.publicTenantId && profile.publicTenantId !== tenantId)) return null
    return toPublicAuthorProjection(profile)
  }

  const authorFromDoc = post.authorDocId ? await ctx.db.get(post.authorDocId) : null
  const authorFromId = await getUniqueUserByIdentity(ctx, post.authorId)
  if (!authorFromDoc || !authorFromId || authorFromDoc._id !== authorFromId._id) return null
  const author = authorFromDoc
  if (!author || author.publicTenantId) return null
  return toPublicAuthorProjection(author)
}

function createPublicTenantResolver(ctx: QueryCtx) {
  const cache = new Map<string, Promise<PublicAuthorProjection | null>>()
  return (post: Doc<"posts">) => {
    const key = post.tenantId || post.organizationId || `legacy:${post.authorDocId ?? post.authorId}`
    let tenant = cache.get(key)
    if (!tenant) {
      tenant = getPublicTenantForPost(ctx, post)
      cache.set(key, tenant)
    }
    return tenant
  }
}

function createPublicAuthorResolver(ctx: QueryCtx): PublicAuthorResolver {
  const cache = new Map<string, Promise<PublicAuthorProjection>>()
  return (post) => {
    const key = (post.authorDocId as string | undefined) ?? post.authorId
    let author = cache.get(key)
    if (!author) {
      author = getPublicAuthorForPost(ctx, post)
      cache.set(key, author)
    }
    return author
  }
}

async function toPublishedPost(
  ctx: QueryCtx,
  post: Doc<"posts">,
  resolveAuthor: PublicAuthorResolver = (record) => getPublicAuthorForPost(ctx, record),
  resolveTenant: (record: Doc<"posts">) => Promise<PublicAuthorProjection | null> = (record) =>
    getPublicTenantForPost(ctx, record)
): Promise<PublishedPostRecord> {
  return {
    id: post._id,
    author: await resolveAuthor(post),
    tenant: await resolveTenant(post),
    categoryId: post.categoryId ?? null,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverUrl: post.coverUrl ?? null,
    tags: post.tags,
    status: "published",
    publishedAt: post.publishedAt ?? null,
    updatedAt: post.updatedAt,
    readingTimeMinutes: post.readingTimeMinutes,
    views: post.views,
    likes: post.likes,
    comments: post.comments,
    featured: post.featured
  }
}

async function toPublishedPosts(ctx: QueryCtx, posts: Doc<"posts">[]): Promise<PublishedPostRecord[]> {
  const resolveAuthor = createPublicAuthorResolver(ctx)
  const resolveTenant = createPublicTenantResolver(ctx)
  return await Promise.all(posts.map((post) => toPublishedPost(ctx, post, resolveAuthor, resolveTenant)))
}

function sortByPublishedDate(posts: Doc<"posts">[]) {
  return posts.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
}

function sortByUpdatedDate(posts: Doc<"posts">[]) {
  return posts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

async function getTenantAuthor(ctx: QueryCtx, tenantId: string) {
  return getPublicTenantAuthorById(ctx, tenantId)
}

async function getPublicTenantAuthorById(ctx: QueryCtx, tenantId: string) {
  const mappedProfiles = await ctx.db
    .query("users")
    .withIndex("by_public_tenant_id", (q) => q.eq("publicTenantId", tenantId))
    .collect()
  if (mappedProfiles.length > 1) return null
  if (mappedProfiles[0]) return mappedProfiles[0]
  return getUniqueTenantProfileByIdentity(ctx, tenantId)
}

async function getUniqueTenantProfileByIdentity(ctx: QueryCtx, tenantId: string) {
  const profile = await getUniqueUserByIdentity(ctx, tenantId)
  if (!profile || (profile.publicTenantId && profile.publicTenantId !== tenantId)) return null
  return profile
}

async function getUniquePublicTenantByUsername(ctx: QueryCtx, username: string) {
  const authors = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", username))
    .collect()
  if (authors.length !== 1) return null
  const author = authors[0]!
  if (author.publicTenantId) {
    const mappedProfiles = await ctx.db
      .query("users")
      .withIndex("by_public_tenant_id", (q) => q.eq("publicTenantId", author.publicTenantId!))
      .collect()
    if (mappedProfiles.length !== 1 || mappedProfiles[0]?._id !== author._id) return null
  }
  return author
}

function authorKeys(authorId: string, author: Doc<"users"> | null) {
  return new Set<string>([
    authorId,
    ...(author?.legacyId ? [author.legacyId] : []),
    ...(author?.clerkUserId ? [author.clerkUserId] : []),
    ...(author?._id ? [author._id as string] : [])
  ])
}

async function isPostForTenant(
  ctx: QueryCtx,
  post: Doc<"posts">,
  tenantId: string,
  author: Doc<"users"> | null
) {
  const keys = getPublicTenantKeys(tenantId, author)
  if (post.tenantId) return keys.has(post.tenantId)
  if (post.organizationId) return keys.has(post.organizationId)
  if (!author?.publicTenantId && author) {
    return await isUnambiguousLegacyPostForTenant(ctx, post, author)
  }
  return false
}

async function isUnambiguousLegacyPostForTenant(
  ctx: QueryCtx,
  post: Doc<"posts">,
  tenantAuthor: Doc<"users">
) {
  if (post.tenantId || post.organizationId) return false

  const authorFromDoc = post.authorDocId ? await ctx.db.get(post.authorDocId) : null
  const authorFromId = await getUniqueUserByIdentity(ctx, post.authorId)
  return Boolean(authorFromDoc && authorFromId && authorFromDoc._id === authorFromId._id && authorFromDoc._id === tenantAuthor._id)
}

async function collectPublishedByAuthor(ctx: QueryCtx, authorId: string) {
  const author = await findDocById(ctx.db, "users", authorId)
  const keys = authorKeys(authorId, author)
  const postsById = new Map<string, Doc<"posts">>()

  for (const key of keys) {
    const batch = await ctx.db
      .query("posts")
      .withIndex("by_author_and_status", (q) => q.eq("authorId", key).eq("status", "published"))
      .collect()
    for (const post of batch) postsById.set(post._id, post)
  }

  if (author?._id) {
    const legacyBatch = await ctx.db
      .query("posts")
      .withIndex("by_author_doc", (q) => q.eq("authorDocId", author._id))
      .collect()
    for (const post of legacyBatch) {
      if (post.status === "published") postsById.set(post._id, post)
    }
  }

  return sortByPublishedDate(Array.from(postsById.values()))
}

async function collectPublishedByTenant(
  ctx: QueryCtx,
  tenantId: string,
  publicTenantAuthor?: Doc<"users">
) {
  const author = publicTenantAuthor ?? (await getPublicTenantAuthorById(ctx, tenantId))
  const keys = getPublicTenantKeys(tenantId, author)
  const postsById = new Map<string, Doc<"posts">>()
  const add = (posts: Doc<"posts">[]) => {
    for (const post of posts) postsById.set(post._id, post)
  }

  for (const key of keys) {
    add(
      await ctx.db
        .query("posts")
        .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", key).eq("status", "published"))
        .collect()
    )
    add(
      await ctx.db
        .query("posts")
        .withIndex("by_org_and_status", (q) => q.eq("organizationId", key).eq("status", "published"))
        .collect()
    )
    if (!author?.publicTenantId) {
      add(
        await ctx.db
          .query("posts")
          .withIndex("by_author_and_status", (q) => q.eq("authorId", key).eq("status", "published"))
          .collect()
      )
    }
  }

  if (author?._id && !author.publicTenantId) {
    const byDoc = await ctx.db
      .query("posts")
      .withIndex("by_author_doc", (q) => q.eq("authorDocId", author._id))
      .collect()
    add(byDoc.filter((post) => post.status === "published"))
  }

  const matching: Doc<"posts">[] = []
  for (const post of postsById.values()) {
    if (post.status === "published" && (await isPostForTenant(ctx, post, tenantId, author))) {
      matching.push(post)
    }
  }
  return sortByPublishedDate(matching)
}

async function collectEditorialByAuthor(ctx: QueryCtx, authorId: string, status: Doc<"posts">["status"] | undefined) {
  const author = await findDocById(ctx.db, "users", authorId)
  const keys = authorKeys(authorId, author)
  const postsById = new Map<string, Doc<"posts">>()

  for (const key of keys) {
    const batch = status
      ? await ctx.db
          .query("posts")
          .withIndex("by_author_and_status", (q) => q.eq("authorId", key).eq("status", status))
          .collect()
      : await ctx.db
          .query("posts")
          .withIndex("by_author", (q) => q.eq("authorId", key))
          .collect()
    for (const post of batch) postsById.set(post._id, post)
  }

  if (author?._id) {
    const byDoc = await ctx.db
      .query("posts")
      .withIndex("by_author_doc", (q) => q.eq("authorDocId", author._id))
      .collect()
    for (const post of byDoc) {
      if (!status || post.status === status) postsById.set(post._id, post)
    }
  }

  return sortByUpdatedDate(Array.from(postsById.values()))
}

async function assertEditorialAuthorAccess(ctx: QueryCtx, identity: AuthenticatedTenantIdentity, authorId: string) {
  const author = await findDocById(ctx.db, "users", authorId)
  if (identity.tenantType !== "user" || (author?.clerkUserId !== identity.userId && authorId !== identity.userId)) {
    throw new Error("Acceso denegado: no puedes consultar publicaciones de este autor.")
  }
}

export async function listPublishedHandler(ctx: QueryCtx) {
  const posts = await ctx.db
    .query("posts")
    .withIndex("by_status", (q) => q.eq("status", "published"))
    .collect()
  return await toPublishedPosts(ctx, sortByPublishedDate(posts))
}

export const list = query({
  args: {},
  returns: publishedPostListValidator,
  handler: listPublishedHandler
})

export async function getPublishedByIdHandler(ctx: QueryCtx, args: { id: string; tenantId?: string }) {
  const post = await findDocById(ctx.db, "posts", args.id)
  if (!post || post.status !== "published") return null
  if (args.tenantId) {
    const author = await getPublicTenantAuthorById(ctx, args.tenantId)
    if (!(await isPostForTenant(ctx, post, args.tenantId, author))) return null
  }
  return await toPublishedPost(ctx, post)
}

export const getById = query({
  args: { id: v.string(), tenantId: v.optional(v.string()) },
  returns: nullablePublishedPostValidator,
  handler: getPublishedByIdHandler
})

export async function getPublishedBySlugHandler(ctx: QueryCtx, args: { slug: string; tenantId?: string }) {
  if (args.tenantId) {
    const author = await getTenantAuthor(ctx, args.tenantId)
    if (!author) return null

    const tenantKeys = getPublicTenantKeys(args.tenantId, author)
    const candidates = new Map<string, Doc<"posts">>()
    for (const tenantId of tenantKeys) {
      const tenantPosts = await ctx.db
        .query("posts")
        .withIndex("by_tenant_and_slug", (q) => q.eq("tenantId", tenantId).eq("slug", args.slug))
        .collect()
      for (const post of tenantPosts) {
        if (post.status === "published") candidates.set(post._id, post)
      }

      const organizationPosts = await ctx.db
        .query("posts")
        .withIndex("by_org_and_slug", (q) => q.eq("organizationId", tenantId).eq("slug", args.slug))
        .collect()
      for (const post of organizationPosts) {
        if (post.status === "published") candidates.set(post._id, post)
      }

      if (!author.publicTenantId) {
        const legacyPosts = await ctx.db
          .query("posts")
          .withIndex("by_author_and_slug", (q) => q.eq("authorId", tenantId).eq("slug", args.slug))
          .collect()
        for (const post of legacyPosts) {
          if (
            post.status === "published" &&
            post.slug === args.slug &&
            await isUnambiguousLegacyPostForTenant(ctx, post, author)
          ) {
            candidates.set(post._id, post)
          }
        }
      }
    }

    if (!author.publicTenantId) {
      const legacyAuthorDocs = await ctx.db
        .query("posts")
        .withIndex("by_author_doc_and_slug", (q) => q.eq("authorDocId", author._id).eq("slug", args.slug))
        .collect()
      for (const post of legacyAuthorDocs) {
        if (
          post.status === "published" &&
          post.slug === args.slug &&
          await isUnambiguousLegacyPostForTenant(ctx, post, author)
        ) {
          candidates.set(post._id, post)
        }
      }
    }

    if (candidates.size !== 1) return null
    const post = candidates.values().next().value as Doc<"posts"> | undefined
    return post ? await toPublishedPost(ctx, post) : null
  }

  const matching = (await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", args.slug))
    .collect()).filter((post) => post.status === "published")

  // Las URLs históricas /post/[slug] solo sobreviven si identifican un único post.
  if (matching.length !== 1) return null
  return await toPublishedPost(ctx, matching[0]!)
}

export const getBySlug = query({
  args: { slug: v.string(), tenantId: v.optional(v.string()) },
  returns: nullablePublishedPostValidator,
  handler: getPublishedBySlugHandler
})

export async function getPublishedByAuthorIdHandler(ctx: QueryCtx, args: { authorId: string }) {
  return await toPublishedPosts(ctx, await collectPublishedByAuthor(ctx, args.authorId))
}

export const getByAuthorId = query({
  args: { authorId: v.string() },
  returns: publishedPostListValidator,
  handler: getPublishedByAuthorIdHandler
})

export const getByAuthorUsername = query({
  args: { username: v.string() },
  returns: publishedPostListValidator,
  handler: async (ctx, args) => {
    const authors = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .collect()
    if (authors.length !== 1) return []
    const author = authors[0]!
    const posts = await collectPublishedByAuthor(ctx, author._id as string)
    return await toPublishedPosts(ctx, posts)
  },
})

export async function getPublishedByTenantHandler(ctx: QueryCtx, args: { tenantId: string }) {
  return await toPublishedPosts(ctx, await collectPublishedByTenant(ctx, args.tenantId))
}

export const getPublishedByTenant = query({
  args: { tenantId: v.string() },
  returns: publishedPostListValidator,
  handler: getPublishedByTenantHandler
})

export const getPublishedByTenantSlug = query({
  args: { username: v.string() },
  returns: publishedPostListValidator,
  handler: async (ctx, args) => {
    const author = await getUniquePublicTenantByUsername(ctx, args.username)
    if (!author) return []
    const tenantId = getCanonicalPublicTenantId(author)
    const posts = await collectPublishedByTenant(ctx, tenantId, author)
    return await toPublishedPosts(ctx, posts)
  },
})

export async function getPublishedBySlugAndTenantSlugHandler(
  ctx: QueryCtx,
  args: { slug: string; username: string }
) {
  // Primero se resuelve el blog público. Un slug de post nunca puede decidir qué
  // identidad de tenant usar como alternativa.
  const author = await getUniquePublicTenantByUsername(ctx, args.username)
  if (!author) return null

  const tenantId = getCanonicalPublicTenantId(author)
  const keys = getPublicTenantKeys(tenantId, author)
  const candidates = new Map<string, Doc<"posts">>()

  // Consulta compuesta para las filas normalizadas. Se prueban los identificadores
  // históricos del mismo perfil mientras termina la migración, sin mezclar tenants.
  for (const key of keys) {
    const tenantPosts = await ctx.db
      .query("posts")
      .withIndex("by_tenant_and_slug", (q) => q.eq("tenantId", key).eq("slug", args.slug))
      .collect()
    for (const post of tenantPosts) {
      if (post.status === "published") candidates.set(post._id, post)
    }

    const organizationPosts = await ctx.db
      .query("posts")
      .withIndex("by_org_and_slug", (q) => q.eq("organizationId", key).eq("slug", args.slug))
      .collect()
    for (const post of organizationPosts) {
      if (post.status === "published") candidates.set(post._id, post)
    }

    if (!author.publicTenantId) {
      const legacyAuthorPosts = await ctx.db
        .query("posts")
        .withIndex("by_author_and_slug", (q) => q.eq("authorId", key).eq("slug", args.slug))
        .collect()
      for (const post of legacyAuthorPosts) {
        if (
          post.status === "published" &&
          post.slug === args.slug &&
          !post.tenantId &&
          !post.organizationId &&
          await isUnambiguousLegacyPostForTenant(ctx, post, author)
        ) {
          candidates.set(post._id, post)
        }
      }
    }
  }

  if (!author.publicTenantId) {
    const legacyAuthorDocPosts = await ctx.db
      .query("posts")
      .withIndex("by_author_doc_and_slug", (q) => q.eq("authorDocId", author._id).eq("slug", args.slug))
      .collect()
    for (const post of legacyAuthorDocPosts) {
      if (
        post.status === "published" &&
        post.slug === args.slug &&
        !post.tenantId &&
        !post.organizationId &&
        await isUnambiguousLegacyPostForTenant(ctx, post, author)
      ) {
        candidates.set(post._id, post)
      }
    }
  }

  // Una colisión heredada tampoco se resuelve escogiendo el primero.
  if (candidates.size !== 1) return null
  const post = candidates.values().next().value as Doc<"posts"> | undefined
  return post ? await toPublishedPost(ctx, post) : null
}

export const getBySlugAndTenantSlug = query({
  args: { slug: v.string(), username: v.string() },
  returns: nullablePublishedPostValidator,
  handler: getPublishedBySlugAndTenantSlugHandler,
})

type PostSlugAvailabilityArgs = {
  tenantId: string
  slug: string
  organizationId?: string
  excludePostId?: string
  authorId?: string
  authorDocId?: Doc<"users">["_id"]
}

/** Valida unicidad por tenant e incorpora candidatos legacy mientras se normalizan. */
export async function assertPostSlugAvailable(ctx: QueryCtx, args: PostSlugAvailabilityArgs) {
  const candidates = new Map<string, Doc<"posts">>()
  const tenant = await getTenantAuthor(ctx, args.tenantId)
  const tenantKeys = getPublicTenantKeys(args.tenantId, tenant)

  for (const tenantId of tenantKeys) {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_tenant_and_slug", (q) => q.eq("tenantId", tenantId).eq("slug", args.slug))
      .collect()
    for (const post of posts) candidates.set(post._id, post)
  }

  if (args.organizationId) {
    const orgPosts = await ctx.db
      .query("posts")
      .withIndex("by_org_and_slug", (q) => q.eq("organizationId", args.organizationId!).eq("slug", args.slug))
      .collect()
    for (const post of orgPosts) candidates.set(post._id, post)
  }

  for (const authorId of new Set([...tenantKeys, ...(args.authorId ? [args.authorId] : [])])) {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author_and_slug", (q) => q.eq("authorId", authorId).eq("slug", args.slug))
      .collect()
    for (const post of posts) {
      if (!post.tenantId && !post.organizationId) {
        candidates.set(post._id, post)
      }
    }
  }

  const authorDocIds = new Set<Doc<"users">["_id"]>([
    ...(tenant?._id ? [tenant._id] : []),
    ...(args.authorDocId ? [args.authorDocId] : []),
  ])
  for (const authorDocId of authorDocIds) {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author_doc_and_slug", (q) => q.eq("authorDocId", authorDocId).eq("slug", args.slug))
      .collect()
    for (const post of posts) {
      if (!post.tenantId && !post.organizationId) {
        candidates.set(post._id, post)
      }
    }
  }

  for (const post of candidates.values()) {
    if (post._id === args.excludePostId) continue
    if (post.tenantId && tenantKeys.has(post.tenantId)) {
      throw new Error("Ya existe un artículo con ese slug en este blog.")
    }
    if (args.organizationId && post.organizationId === args.organizationId) {
      throw new Error("Ya existe un artículo con ese slug en este blog.")
    }
    if (!post.tenantId && !post.organizationId) {
      const matchesTenant = await isPostForTenant(ctx, post, args.tenantId, tenant)
      if (matchesTenant) {
        throw new Error("Ya existe un artículo con ese slug en este blog.")
      }
    }
  }
}

export async function getEditorialByIdHandler(ctx: QueryCtx, args: { id: string }) {
  const identity = await requireTenantAuth(ctx)
  const post = await findDocById(ctx.db, "posts", args.id)
  if (!post) return null
  await assertCanReadEditorialPost(ctx, identity, post)
  return post
}

export const getEditorialById = query({
  args: { id: v.string() },
  returns: nullablePostDocValidator,
  handler: getEditorialByIdHandler
})

export async function getEditorialByAuthorIdHandler(
  ctx: QueryCtx,
  args: { authorId: string; status?: "draft" | "published" | "scheduled" }
) {
  const identity = await requireTenantAuth(ctx)
  await assertEditorialAuthorAccess(ctx, identity, args.authorId)
  const posts = await collectEditorialByAuthor(ctx, args.authorId, args.status)
  const matching: Doc<"posts">[] = []
  for (const post of posts) {
    if (await canReadEditorialPost(ctx, identity, post)) matching.push(post)
  }
  return matching
}

export const getEditorialByAuthorId = query({
  args: { authorId: v.string(), status: v.optional(postStatusValidator) },
  returns: postDocListValidator,
  handler: getEditorialByAuthorIdHandler
})

export async function getEditorialByOrganizationHandler(
  ctx: QueryCtx,
  args: {
    organizationId: string
    status?: "draft" | "published" | "scheduled"
  }
) {
  const identity = await requireTenantAuth(ctx, args.organizationId)
  const statuses = args.status ? [args.status] : (["draft", "published", "scheduled"] as const)
  const postsById = new Map<string, Doc<"posts">>()

  for (const status of statuses) {
    const byOrganization = await ctx.db
      .query("posts")
      .withIndex("by_org_and_status", (q) => q.eq("organizationId", args.organizationId).eq("status", status))
      .collect()
    const byTenant = await ctx.db
      .query("posts")
      .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", args.organizationId).eq("status", status))
      .collect()
    for (const post of [...byOrganization, ...byTenant]) postsById.set(post._id, post)
  }

  const matching: Doc<"posts">[] = []
  for (const post of postsById.values()) {
    if (await canReadEditorialPost(ctx, identity, post)) matching.push(post)
  }
  return sortByUpdatedDate(matching)
}

export const getEditorialByOrganization = query({
  args: { organizationId: v.string(), status: v.optional(postStatusValidator) },
  returns: postDocListValidator,
  handler: getEditorialByOrganizationHandler
})

export const getPublished = query({
  args: {},
  returns: publishedPostListValidator,
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect()

    return await toPublishedPosts(ctx, sortByPublishedDate(posts))
  }
})

export const getFeatured = query({
  args: {},
  returns: publishedPostListValidator,
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status_and_featured", (q) => q.eq("status", "published").eq("featured", true))
      .collect()

    return await toPublishedPosts(ctx, sortByPublishedDate(posts))
  }
})

export const getByTag = query({
  args: { tagSlug: v.string() },
  returns: publishedPostListValidator,
  handler: async (ctx, args) => {
    const published = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect()

    return await toPublishedPosts(ctx, published
      .filter((p) => p.tags && p.tags.includes(args.tagSlug))
      .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "")))
  }
})

export const getByCategory = query({
  args: { categoryIdOrSlug: v.string() },
  returns: publishedPostListValidator,
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

    return await toPublishedPosts(
      ctx,
      matching.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
    )
  }
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
    editorMode: v.optional(v.union(v.literal("notion"), v.literal("elementor")))
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, {
      authorId: args.authorId || identity.userId,
      organizationId: args.organizationId,
      tenantId: args.tenantId || identity.tenantId
    })

    const now = getCurrentIsoDate()
    const readingTime = args.readingTimeMinutes || calculateReadingTime(args.content)
    const effectiveTenantId = identity.tenantId
    const effectiveOrgId =
      identity.tenantType === "organization"
        ? (identity.orgId ?? undefined)
        : args.organizationId === identity.tenantId
          ? args.organizationId
          : args.organizationId && args.organizationId === identity.orgId
            ? args.organizationId
            : undefined

    const authorDoc = await findDocById(ctx.db, "users", args.authorId)
    const resolvedAuthorId = authorDoc?.clerkUserId || authorDoc?.legacyId || args.authorId
    const authorDocId = authorDoc?._id

    await assertPostSlugAvailable(ctx, {
      tenantId: effectiveTenantId,
      organizationId: effectiveOrgId ?? args.organizationId,
      slug: args.slug,
      authorId: resolvedAuthorId,
      authorDocId,
    })

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
      organizationId: effectiveOrgId ?? args.organizationId,
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
      editorMode: args.editorMode || "notion"
    })

    if (authorDoc) {
      await ctx.db.patch(authorDoc._id, {
        postCount: (authorDoc.postCount || 0) + 1
      })
    }

    await adjustCategoryPostCount(ctx, categoryDocId ?? args.categoryId, 1)
    await adjustTagPostCounts(ctx, effectiveTenantId, args.tags, 1)

    return await ctx.db.get(docId)
  }
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
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled"))),
    scheduledFor: v.optional(v.string()),
    readingTimeMinutes: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    designData: v.optional(v.union(v.string(), v.null())),
    editorMode: v.optional(v.union(v.literal("notion"), v.literal("elementor")))
  },
  handler: async (ctx, args) => {
    const post = await findDocById(ctx.db, "posts", args.id)
    if (!post) return null

    const identity = await requireTenantAuth(ctx)
    await assertCanReadEditorialPost(ctx, identity, post)

    const now = getCurrentIsoDate()
    const updates: Partial<typeof post> = {
      updatedAt: now
    }

    if (args.slug !== undefined && args.slug !== post.slug) {
      const tenantId = post.tenantId || post.organizationId || identity.tenantId
      await assertPostSlugAvailable(ctx, {
        tenantId,
        organizationId: post.organizationId,
        slug: args.slug,
        excludePostId: post._id,
        authorId: post.authorId,
        authorDocId: post.authorDocId,
      })
      if (!post.tenantId && !post.organizationId) updates.tenantId = identity.tenantId
    }

    if (args.title !== undefined) updates.title = args.title
    if (args.slug !== undefined) updates.slug = args.slug
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt
    if (args.content !== undefined) {
      updates.content = args.content
      updates.readingTimeMinutes =
        args.readingTimeMinutes !== undefined ? args.readingTimeMinutes : calculateReadingTime(args.content)
    } else if (args.readingTimeMinutes !== undefined) {
      updates.readingTimeMinutes = args.readingTimeMinutes
    }
    if (args.coverUrl !== undefined) updates.coverUrl = args.coverUrl || undefined
    if (args.categoryId !== undefined) {
      updates.categoryId = args.categoryId || undefined
      if (args.categoryId) {
        const category = await findDocById(ctx.db, "categories", args.categoryId)
        updates.categoryDocId = category?._id
      } else {
        updates.categoryDocId = undefined
      }
    }
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

    if (args.categoryId !== undefined) {
      const nextCategoryId = args.categoryId || undefined
      const nextCategoryDocId = updates.categoryDocId
      if (
        categoryAssignmentChanged(
          {
            categoryId: post.categoryId,
            categoryDocId: post.categoryDocId as string | undefined
          },
          {
            categoryId: nextCategoryId,
            categoryDocId: nextCategoryDocId as string | undefined
          }
        )
      ) {
        await adjustCategoryPostCount(ctx, post.categoryDocId ?? post.categoryId, -1)
        await adjustCategoryPostCount(ctx, nextCategoryDocId ?? nextCategoryId, 1)
      }
    }

    if (args.tags !== undefined && tagSlugsDiffer(post.tags, args.tags)) {
      const tenantKey = post.tenantId || post.organizationId || identity.tenantId
      await adjustTagPostCounts(ctx, tenantKey, post.tags, -1)
      await adjustTagPostCounts(ctx, tenantKey, args.tags, 1)
    }

    return await ctx.db.get(post._id)
  }
})

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const post = await findDocById(ctx.db, "posts", args.id)
    if (!post) return true

    const identity = await requireTenantAuth(ctx)
    await assertCanReadEditorialPost(ctx, identity, post)

    const postKeys = [post._id as string, post.legacyId].filter((value): value is string => Boolean(value))
    const commentsByDoc = await ctx.db
      .query("comments")
      .withIndex("by_post_doc", (q) => q.eq("postDocId", post._id))
      .collect()
    const commentsById: Doc<"comments">[] = []
    for (const key of postKeys) {
      const batch = await ctx.db
        .query("comments")
        .withIndex("by_post", (q) => q.eq("postId", key))
        .collect()
      commentsById.push(...batch)
    }

    const seenComments = new Set<string>()
    for (const comment of [...commentsByDoc, ...commentsById]) {
      if (seenComments.has(comment._id)) continue
      seenComments.add(comment._id)
      await ctx.db.delete(comment._id)
    }

    const author = await findDocById(ctx.db, "users", post.authorId)
    if (author) {
      await ctx.db.patch(author._id, {
        postCount: Math.max(0, (author.postCount || 1) - 1)
      })
    }

    const tenantKey = post.tenantId || post.organizationId || identity.tenantId
    await adjustCategoryPostCount(ctx, post.categoryDocId ?? post.categoryId, -1)
    await adjustTagPostCounts(ctx, tenantKey, post.tags, -1)

    await ctx.db.delete(post._id)
    return true
  }
})
