export type MigrationSource = "mock" | "sqlite" | "json"

export interface ExportedUser {
  legacyId: string
  clerkUserId?: string
  username: string
  name: string
  email: string
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  tagline?: string
  location?: string
  socials?: Record<string, string>
  role?: "owner" | "admin"
  joinedAt?: string
  postCount?: number
  followerCount?: number
  timezone?: string
  subdomainEnabled?: boolean
  customDomain?: string
}

export interface ExportedCategory {
  legacyId: string
  tenantId?: string
  organizationId?: string
  authorId?: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  postCount?: number
}

export interface ExportedTag {
  legacyId: string
  tenantId?: string
  organizationId?: string
  authorId?: string
  name: string
  slug: string
  color?: string
  postCount?: number
}

export interface ExportedPost {
  legacyId: string
  authorId: string
  organizationId?: string
  tenantId?: string
  categoryId?: string | null
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl?: string | null
  tags: string[]
  status: "draft" | "published" | "scheduled"
  publishedAt?: string | null
  updatedAt: string
  scheduledFor?: string | null
  readingTimeMinutes: number
  views: number
  likes: number
  comments: number
  featured: boolean
  designData?: string | null
  editorMode?: "notion" | "elementor"
}

export interface ExportedComment {
  legacyId: string
  postId: string
  authorName: string
  authorAvatarUrl?: string
  authorEmail?: string
  authorUserId?: string
  content: string
  createdAt: string
}

export interface ExportedTemplate {
  legacyId: string
  tenantId: string
  tenantType: "organization" | "user"
  name: string
  schemaVersion: string
  version: number
  draftSlots: Record<string, unknown>
  publishedSlots: Record<string, unknown>
  settings: Record<string, unknown>
  isPublished: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ExportedTemplateRevision {
  legacyId: string
  templateId: string
  tenantId: string
  version: number
  slotsSnapshot: Record<string, unknown>
  settingsSnapshot: Record<string, unknown>
  publishedBy?: string | null
  createdAt: string
  changeSummary?: string | null
}

export interface MigrationExportBundle {
  source: MigrationSource
  exportedAt: string
  users: ExportedUser[]
  categories: ExportedCategory[]
  tags: ExportedTag[]
  posts: ExportedPost[]
  comments: ExportedComment[]
  templates: ExportedTemplate[]
  revisions: ExportedTemplateRevision[]
}
