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

type PublishedPostRecord = {
  id: Doc<"posts">["_id"]
  author: {
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

type PublicAuthorProjection = PublishedPostRecord["author"]
type PublicAuthorResolver = (post: Doc<"posts">) => Promise<PublicAuthorProjection>

async function getPublicAuthorForPost(ctx: QueryCtx, post: Doc<"posts">): Promise<PublicAuthorProjection> {
  let author = post.authorDocId ? await ctx.db.get(post.authorDocId) : null
  if (!author) {
    const normalizedAuthorId = ctx.db.normalizeId("users", post.authorId)
    if (normalizedAuthorId) author = await ctx.db.get(normalizedAuthorId)
  }
  if (!author) {
    author = await ctx.db
      .query("users")
      .withIndex("by_legacy_id", (q) => q.eq("legacyId", post.authorId))
      .first()
  }
  if (!author) {
    author = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", post.authorId))
      .first()
  }
  if (!author) {
    author = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", post.authorId))
      .first()
  }

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
  resolveAuthor: PublicAuthorResolver = (record) => getPublicAuthorForPost(ctx, record)
): Promise<PublishedPostRecord> {
  return {
    id: post._id,
    author: await resolveAuthor(post),
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
  return await Promise.all(posts.map((post) => toPublishedPost(ctx, post, resolveAuthor)))
}

function sortByPublishedDate(posts: Doc<"posts">[]) {
  return posts.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
}

function sortByUpdatedDate(posts: Doc<"posts">[]) {
  return posts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

async function getTenantAuthor(ctx: QueryCtx, tenantId: string) {
  return findDocById(ctx.db, "users", tenantId)
}

function authorKeys(authorId: string, author: Doc<"users"> | null) {
  return new Set<string>([
    authorId,
    ...(author?.legacyId ? [author.legacyId] : []),
    ...(author?.clerkUserId ? [author.clerkUserId] : []),
    ...(author?._id ? [author._id as string] : [])
  ])
}

function isPostForTenant(post: Doc<"posts">, tenantId: string, author: Doc<"users"> | null) {
  if (post.tenantId) return post.tenantId === tenantId
  if (post.organizationId) return post.organizationId === tenantId

  const keys = authorKeys(tenantId, author)
  return keys.has(post.authorId) || Boolean(author && post.authorDocId === author._id)
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

async function collectPublishedByTenant(ctx: QueryCtx, tenantId: string) {
  const author = await getTenantAuthor(ctx, tenantId)
  const keys = authorKeys(tenantId, author)
  const postsById = new Map<string, Doc<"posts">>()
  const add = (posts: Doc<"posts">[]) => {
    for (const post of posts) postsById.set(post._id, post)
  }

  add(
    await ctx.db
      .query("posts")
      .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", tenantId).eq("status", "published"))
      .collect()
  )
  add(
    await ctx.db
      .query("posts")
      .withIndex("by_org_and_status", (q) => q.eq("organizationId", tenantId).eq("status", "published"))
      .collect()
  )

  for (const key of keys) {
    add(
      await ctx.db
        .query("posts")
        .withIndex("by_author_and_status", (q) => q.eq("authorId", key).eq("status", "published"))
        .collect()
    )
  }

  if (author?._id) {
    const byDoc = await ctx.db
      .query("posts")
      .withIndex("by_author_doc", (q) => q.eq("authorDocId", author._id))
      .collect()
    add(byDoc.filter((post) => post.status === "published"))
  }

  const matching: Doc<"posts">[] = []
  for (const post of postsById.values()) {
    if (post.status === "published" && isPostForTenant(post, tenantId, author)) {
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
    const author = await getTenantAuthor(ctx, args.tenantId)
    if (!isPostForTenant(post, args.tenantId, author)) return null
  }
  return await toPublishedPost(ctx, post)
}

export const getById = query({
  args: { id: v.string(), tenantId: v.optional(v.string()) },
  returns: nullablePublishedPostValidator,
  handler: getPublishedByIdHandler
})

export async function getPublishedBySlugHandler(ctx: QueryCtx, args: { slug: string; tenantId?: string }) {
  const candidates = await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", args.slug))
    .collect()
  let matching = candidates.filter((post) => post.status === "published")
  if (args.tenantId) {
    const author = await getTenantAuthor(ctx, args.tenantId)
    const tenantMatches: Doc<"posts">[] = []
    for (const post of matching) {
      if (isPostForTenant(post, args.tenantId, author)) tenantMatches.push(post)
    }
    matching = tenantMatches
  }
  matching.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
  return matching[0] ? await toPublishedPost(ctx, matching[0]) : null
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
    const author = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first()
    if (!author) return []
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
    const author = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first()
    if (!author) return []
    const tenantId = author.clerkUserId ?? author.legacyId ?? (author._id as string)
    const posts = await collectPublishedByTenant(ctx, tenantId)
    return await toPublishedPosts(ctx, posts)
  },
})

export const getBySlugAndTenantSlug = query({
  args: { slug: v.string(), username: v.string() },
  returns: nullablePublishedPostValidator,
  handler: async (ctx, args) => {
    const author = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first()
    if (!author) return null

    const tenantId = author.clerkUserId ?? author.legacyId ?? (author._id as string)
    const candidates = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect()
    const matching = candidates
      .filter((post) => post.status === "published" && isPostForTenant(post, tenantId, author))
      .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))[0]
    return matching ? await toPublishedPost(ctx, matching) : null
  },
})

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
