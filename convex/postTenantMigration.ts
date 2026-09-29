import { v } from "convex/values"
import { internalMutation, type MutationCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"

type OwnerResolution =
  | { tenantId: string; ambiguous: false }
  | {
      tenantId: null
      ambiguous: true
      reason: "author_not_found" | "author_mismatch" | "author_identity_ambiguous"
    }

async function resolveUserByAuthorId(
  ctx: MutationCtx,
  authorId: string
): Promise<{ user: Doc<"users"> | null; ambiguous: boolean }> {
  const normalizedId = ctx.db.normalizeId("users", authorId)
  if (normalizedId) {
    const user = await ctx.db.get(normalizedId)
    if (user) return { user, ambiguous: false }
  }

  const candidates = new Map<string, Doc<"users">>()
  const byLegacyId = await ctx.db
    .query("users")
    .withIndex("by_legacy_id", (q) => q.eq("legacyId", authorId))
    .collect()
  const byClerkUserId = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", authorId))
    .collect()
  const byUsername = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", authorId))
    .collect()

  if (byLegacyId.length > 1 || byClerkUserId.length > 1 || byUsername.length > 1) {
    return { user: null, ambiguous: true }
  }
  for (const user of [byLegacyId[0], byClerkUserId[0], byUsername[0]]) {
    if (user) candidates.set(user._id, user)
  }
  if (candidates.size > 1) return { user: null, ambiguous: true }
  return { user: candidates.values().next().value ?? null, ambiguous: false }
}

async function resolveLegacyPostTenant(ctx: MutationCtx, post: Doc<"posts">): Promise<OwnerResolution> {
  // organizationId es un identificador explícito del propietario del tenant.
  if (post.organizationId) return { tenantId: post.organizationId, ambiguous: false }

  const authorFromDoc = post.authorDocId ? await ctx.db.get(post.authorDocId) : null
  const authorResolution = await resolveUserByAuthorId(ctx, post.authorId)
  if (authorResolution.ambiguous) {
    return { tenantId: null, ambiguous: true, reason: "author_identity_ambiguous" }
  }
  const authorFromId = authorResolution.user

  if (authorFromDoc && authorFromId && authorFromDoc._id !== authorFromId._id) {
    return { tenantId: null, ambiguous: true, reason: "author_mismatch" }
  }

  const owner = authorFromDoc ?? authorFromId
  if (!owner) return { tenantId: null, ambiguous: true, reason: "author_not_found" }

  return {
    tenantId: owner.clerkUserId ?? owner.legacyId ?? (owner._id as string),
    ambiguous: false,
  }
}

export async function normalizePostTenantBatchHandler(
  ctx: MutationCtx,
  args: { cursor: string | null; numItems?: number }
) {
  const numItems = Math.min(Math.max(args.numItems ?? 100, 1), 250)
  const page = await ctx.db.query("posts").paginate({
    cursor: args.cursor,
    numItems,
  })

  const normalizedIds = new Set<string>()
  const ambiguous: Array<{ id: Doc<"posts">["_id"]; slug: string; reason: string }> = []
  let normalized = 0

  for (const post of page.page) {
    let tenantId = post.tenantId

    if (tenantId && post.organizationId && tenantId !== post.organizationId) {
      ambiguous.push({ id: post._id, slug: post.slug, reason: "tenant_mismatch" })
      continue
    }

    if (!tenantId) {
      const owner = await resolveLegacyPostTenant(ctx, post)
      if (owner.ambiguous) {
        ambiguous.push({ id: post._id, slug: post.slug, reason: owner.reason })
        continue
      }

      tenantId = owner.tenantId
      await ctx.db.patch(post._id, { tenantId })
      normalized++
    }

    normalizedIds.add(post._id)
  }

  const collisionsByKey = new Map<
    string,
    { tenantId: string; slug: string; postIds: Array<Doc<"posts">["_id"]> }
  >()

  for (const post of page.page) {
    const tenantId = post.tenantId
      ? post.tenantId
      : normalizedIds.has(post._id)
        ? (await ctx.db.get(post._id))?.tenantId
        : undefined
    if (!tenantId) continue

    const matching = await ctx.db
      .query("posts")
      .withIndex("by_tenant_and_slug", (q) => q.eq("tenantId", tenantId).eq("slug", post.slug))
      .collect()
    if (matching.length < 2) continue

    const key = `${tenantId}\u0000${post.slug}`
    collisionsByKey.set(key, {
      tenantId,
      slug: post.slug,
      postIds: matching.map((candidate) => candidate._id),
    })
  }

  return {
    continueCursor: page.continueCursor,
    isDone: page.isDone,
    scanned: page.page.length,
    normalized,
    ambiguous,
    collisions: [...collisionsByKey.values()],
  }
}

export const normalizePostTenantBatch = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.optional(v.number()),
  },
  returns: v.object({
    continueCursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
    scanned: v.number(),
    normalized: v.number(),
    ambiguous: v.array(
      v.object({
        id: v.id("posts"),
        slug: v.string(),
        reason: v.string(),
      })
    ),
    collisions: v.array(
      v.object({
        tenantId: v.string(),
        slug: v.string(),
        postIds: v.array(v.id("posts")),
      })
    ),
  }),
  handler: normalizePostTenantBatchHandler,
})
