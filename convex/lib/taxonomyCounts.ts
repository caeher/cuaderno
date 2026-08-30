import type { MutationCtx } from "../_generated/server"
import type { Id } from "../_generated/dataModel"
import { findDocById } from "./helpers"

export async function adjustCategoryPostCount(
  ctx: MutationCtx,
  categoryId: string | Id<"categories"> | undefined | null,
  delta: number
): Promise<void> {
  if (!categoryId || delta === 0) return

  const category = await findDocById(ctx.db, "categories", String(categoryId))
  if (!category) return

  await ctx.db.patch(category._id, {
    postCount: Math.max(0, (category.postCount || 0) + delta),
  })
}

export async function adjustTagPostCounts(
  ctx: MutationCtx,
  tenantId: string | undefined,
  slugs: string[] | undefined,
  delta: number
): Promise<void> {
  if (!tenantId || !slugs?.length || delta === 0) return

  const unique = Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)))

  for (const slug of unique) {
    const tag = await ctx.db
      .query("tags")
      .withIndex("by_slug_and_tenant", (q) => q.eq("slug", slug).eq("tenantId", tenantId))
      .first()

    if (!tag) continue

    await ctx.db.patch(tag._id, {
      postCount: Math.max(0, (tag.postCount || 0) + delta),
    })
  }
}

function sameId(left?: string | null, right?: string | null): boolean {
  return Boolean(left) && left === right
}

export function tagSlugsDiffer(before: string[] | undefined, after: string[] | undefined): boolean {
  const a = [...(before ?? [])].map((s) => s.trim()).filter(Boolean).sort()
  const b = [...(after ?? [])].map((s) => s.trim()).filter(Boolean).sort()
  if (a.length !== b.length) return true
  return a.some((value, index) => value !== b[index])
}

export function categoryAssignmentChanged(
  before: { categoryId?: string; categoryDocId?: string },
  after: { categoryId?: string; categoryDocId?: string }
): boolean {
  if (sameId(before.categoryDocId, after.categoryDocId)) return false
  if (sameId(before.categoryId, after.categoryId) && !after.categoryDocId && !before.categoryDocId) {
    return false
  }
  return (
    (before.categoryDocId || before.categoryId || undefined) !==
    (after.categoryDocId || after.categoryId || undefined)
  )
}
