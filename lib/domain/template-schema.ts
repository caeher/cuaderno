/**
 * Domain Layer — Tenant Template Schema & Slot Definitions
 *
 * Defines the contract, versioning, slots, and dynamic execution
 * contexts for the tenant-level visual blog templates.
 */

import type { BlockNode } from "./block-schema"
import type { Category, Post, User, Comment } from "./entities"

export type TemplateSlotType = "home" | "post" | "header" | "footer"
export type TemplateStatus = "draft" | "published"

export const CURRENT_TEMPLATE_SCHEMA_VERSION = "1.0" as const
export type TemplateSchemaVersion = typeof CURRENT_TEMPLATE_SCHEMA_VERSION

export interface TenantTemplateSettings {
  primaryColor?: string
  accentColor?: string
  fontHeading?: string
  fontBody?: string
  customCss?: string
  containerMaxWidth?: string
}

export type SlotBlocksMap = Partial<Record<TemplateSlotType, BlockNode[]>>

export interface TenantTemplate {
  id: string
  tenantId: string // Organization ID (org_xxx) or User ID (user_xxx)
  tenantType: "organization" | "user"
  schemaVersion: TemplateSchemaVersion
  version: number // Monotonically increasing revision counter
  name: string
  draftSlots: SlotBlocksMap
  publishedSlots: SlotBlocksMap
  settings: TenantTemplateSettings
  isPublished: boolean
  publishedAt?: string | null
  updatedAt: string
  createdAt: string
}

/**
 * Domain alias for TenantTemplate
 */
export type BlogTemplate = TenantTemplate

export interface TemplateRevision {
  id: string
  templateId: string
  tenantId: string
  version: number
  slotsSnapshot: SlotBlocksMap
  settingsSnapshot: TenantTemplateSettings
  publishedBy?: string | null
  createdAt: string
  changeSummary?: string
}

export interface CreateTemplateInput {
  tenantId: string
  tenantType: "organization" | "user"
  name?: string
  draftSlots?: SlotBlocksMap
  settings?: TenantTemplateSettings
}

export interface UpdateTemplateDraftInput {
  name?: string
  draftSlots?: SlotBlocksMap
  settings?: TenantTemplateSettings
}

/**
 * Dynamic Render Contexts
 * Injected at runtime into the template renderer depending on the active slot.
 */

export interface GlobalTemplateContext {
  tenant: User
  homeUrl: string
  isSubdomain: boolean
  siteTitle?: string
  siteDescription?: string
}

export interface HomeSlotContext extends GlobalTemplateContext {
  posts: Post[]
  featuredPost?: Post | null
  categories: Category[]
  totalPosts: number
}

export interface PostSlotContext extends GlobalTemplateContext {
  post: Post
  author: User
  comments: Comment[]
  relatedPosts: Post[]
  authorMap?: Map<string, User>
}

export function serializeSlotMap(slots: SlotBlocksMap): string {
  try {
    return JSON.stringify(slots)
  } catch {
    return "{}"
  }
}

export function deserializeSlotMap(raw?: string | null): SlotBlocksMap {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}
