/**
 * Parseo y materialización de taxonomías sugeridas por Composer.
 *
 * El artefacto `taxonomy` llega como JSON del modelo. Si viene mal formado se
 * ignora: perder etiquetas es recuperable; tumbar el handoff del artículo no.
 */

import type { MutationCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"

export interface ParsedComposerTaxonomy {
  tags: string[]
  categories: string[]
  suggestedSlug?: string
}

export function slugifyTaxonomyLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function uniqueLabels(values: unknown[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    if (typeof value !== "string") continue
    const trimmed = value.replace(/^#/, "").trim()
    if (!trimmed) continue
    const key = slugifyTaxonomyLabel(trimmed) || trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }

  return result
}

/**
 * Extrae categorías, etiquetas y slug sugerido del artefacto de taxonomía.
 */
export function parseComposerTaxonomyArtifact(
  content: string | undefined | null
): ParsedComposerTaxonomy {
  if (!content || !content.trim()) {
    return { tags: [], categories: [] }
  }

  try {
    const parsed: unknown = JSON.parse(content)

    if (Array.isArray(parsed)) {
      return { tags: uniqueLabels(parsed), categories: [] }
    }

    if (!parsed || typeof parsed !== "object") {
      return { tags: [], categories: [] }
    }

    const record = parsed as Record<string, unknown>
    const tagSource = Array.isArray(record.tags)
      ? record.tags
      : Array.isArray(record.suggestedTags)
        ? record.suggestedTags
        : []
    const categorySource = Array.isArray(record.suggestedCategories)
      ? record.suggestedCategories
      : Array.isArray(record.categories)
        ? record.categories
        : typeof record.suggestedCategory === "string"
          ? [record.suggestedCategory]
          : []

    const suggestedSlug =
      typeof record.suggestedSlug === "string" && record.suggestedSlug.trim()
        ? record.suggestedSlug.trim()
        : undefined

    return {
      tags: uniqueLabels(tagSource),
      categories: uniqueLabels(categorySource),
      suggestedSlug,
    }
  } catch {
    return { tags: [], categories: [] }
  }
}

export interface TenantTaxonomyOwner {
  tenantId: string
  authorId: string
  organizationId?: string
}

export async function findOrCreateTenantCategory(
  ctx: MutationCtx,
  owner: TenantTaxonomyOwner,
  name: string
): Promise<Doc<"categories">> {
  const trimmed = name.trim()
  const slug = slugifyTaxonomyLabel(trimmed) || `cat-${Date.now()}`

  const existing = await ctx.db
    .query("categories")
    .withIndex("by_slug_and_tenant", (q) =>
      q.eq("slug", slug).eq("tenantId", owner.tenantId)
    )
    .first()

  if (existing) return existing

  const docId = await ctx.db.insert("categories", {
    tenantId: owner.tenantId,
    organizationId: owner.organizationId,
    authorId: owner.authorId,
    name: trimmed,
    slug,
    color: "#3b82f6",
    postCount: 0,
  })

  const created = await ctx.db.get(docId)
  if (!created) {
    throw new Error("No se pudo persistir la categoría sugerida por Composer.")
  }
  return created
}

export async function findOrCreateTenantTag(
  ctx: MutationCtx,
  owner: TenantTaxonomyOwner,
  name: string
): Promise<Doc<"tags">> {
  const trimmed = name.replace(/^#/, "").trim()
  const slug = slugifyTaxonomyLabel(trimmed) || `tag-${Date.now()}`

  const existing = await ctx.db
    .query("tags")
    .withIndex("by_slug_and_tenant", (q) =>
      q.eq("slug", slug).eq("tenantId", owner.tenantId)
    )
    .first()

  if (existing) return existing

  const docId = await ctx.db.insert("tags", {
    tenantId: owner.tenantId,
    organizationId: owner.organizationId,
    authorId: owner.authorId,
    name: trimmed,
    slug,
    color: "#64748b",
    postCount: 0,
  })

  const created = await ctx.db.get(docId)
  if (!created) {
    throw new Error("No se pudo persistir la etiqueta sugerida por Composer.")
  }
  return created
}

export function resolveComposerOrganizationId(
  tenantId: string,
  authorId: string
): string | undefined {
  return tenantId !== authorId ? tenantId : undefined
}
