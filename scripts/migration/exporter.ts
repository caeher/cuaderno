import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  MOCK_CATEGORIES,
  MOCK_COMMENTS,
  MOCK_POSTS,
  MOCK_TAGS,
  MOCK_USERS,
} from "../../lib/infrastructure/mock-db"
import type { MigrationExportBundle, MigrationSource } from "./types"

function querySqliteJson(dbPath: string, sql: string): Record<string, unknown>[] {
  const output = execSync(`sqlite3 "${dbPath}" -json "${sql.replace(/"/g, '""')}"`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim()

  if (!output) return []
  return JSON.parse(output) as Record<string, unknown>[]
}

function exportFromSqlite(dbPath: string): MigrationExportBundle {
  if (!existsSync(dbPath)) {
    throw new Error(`No se encontró la base SQLite en ${dbPath}`)
  }

  try {
    execSync("sqlite3 --version", { stdio: "ignore" })
  } catch {
    throw new Error(
      "sqlite3 CLI no está disponible. Instálalo o usa --source mock|json."
    )
  }

  const users = querySqliteJson(dbPath, "SELECT * FROM users")
  const categories = querySqliteJson(dbPath, "SELECT * FROM categories")
  const tags = querySqliteJson(dbPath, "SELECT * FROM tags")
  const posts = querySqliteJson(dbPath, "SELECT * FROM posts")
  const comments = querySqliteJson(dbPath, "SELECT * FROM comments")

  let templates: Record<string, unknown>[] = []
  let revisions: Record<string, unknown>[] = []
  try {
    templates = querySqliteJson(dbPath, "SELECT * FROM tenant_templates")
    revisions = querySqliteJson(dbPath, "SELECT * FROM tenant_template_revisions")
  } catch {
    // Tablas de templates opcionales en orígenes antiguos
  }

  return {
    source: "sqlite",
    exportedAt: new Date().toISOString(),
    users: users.map((row) => ({
      legacyId: String(row.id),
      clerkUserId: row.clerk_user_id ? String(row.clerk_user_id) : undefined,
      username: String(row.username),
      name: String(row.name),
      email: String(row.email),
      avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
      coverUrl: row.cover_url ? String(row.cover_url) : undefined,
      bio: row.bio ? String(row.bio) : undefined,
      tagline: row.tagline ? String(row.tagline) : undefined,
      location: row.location ? String(row.location) : undefined,
      socials: row.socials ? JSON.parse(String(row.socials)) : undefined,
      role: row.role === "admin" ? "admin" : "owner",
      joinedAt: row.joined_at ? String(row.joined_at) : undefined,
      postCount: Number(row.post_count ?? 0),
      followerCount: Number(row.follower_count ?? 0),
      timezone: row.timezone ? String(row.timezone) : undefined,
      subdomainEnabled: row.subdomain_enabled !== 0,
      customDomain: row.custom_domain ? String(row.custom_domain) : undefined,
    })),
    categories: categories.map((row) => ({
      legacyId: String(row.id),
      tenantId: row.tenant_id ? String(row.tenant_id) : undefined,
      organizationId: row.organization_id ? String(row.organization_id) : undefined,
      authorId: row.author_id ? String(row.author_id) : undefined,
      name: String(row.name),
      slug: String(row.slug),
      description: row.description ? String(row.description) : undefined,
      color: row.color ? String(row.color) : undefined,
      icon: row.icon ? String(row.icon) : undefined,
      postCount: Number(row.post_count ?? 0),
    })),
    tags: tags.map((row) => ({
      legacyId: String(row.id),
      tenantId: row.tenant_id ? String(row.tenant_id) : undefined,
      organizationId: row.organization_id ? String(row.organization_id) : undefined,
      authorId: row.author_id ? String(row.author_id) : undefined,
      name: String(row.name),
      slug: String(row.slug),
      color: row.color ? String(row.color) : undefined,
      postCount: Number(row.post_count ?? 0),
    })),
    posts: posts.map((row) => ({
      legacyId: String(row.id),
      authorId: String(row.author_id),
      organizationId: row.organization_id ? String(row.organization_id) : undefined,
      tenantId: row.tenant_id ? String(row.tenant_id) : undefined,
      categoryId: row.category_id ? String(row.category_id) : null,
      title: String(row.title),
      slug: String(row.slug),
      excerpt: String(row.excerpt ?? ""),
      content: String(row.content ?? ""),
      coverUrl: row.cover_url ? String(row.cover_url) : null,
      tags: row.tags ? JSON.parse(String(row.tags)) : [],
      status: String(row.status) as "draft" | "published" | "scheduled",
      publishedAt: row.published_at ? String(row.published_at) : null,
      updatedAt: String(row.updated_at ?? new Date().toISOString()),
      scheduledFor: row.scheduled_for ? String(row.scheduled_for) : null,
      readingTimeMinutes: Number(row.reading_time_minutes ?? 1),
      views: Number(row.views ?? 0),
      likes: Number(row.likes ?? 0),
      comments: Number(row.comments ?? 0),
      featured: Boolean(row.featured),
      designData: row.design_data ? String(row.design_data) : null,
      editorMode: row.editor_mode === "elementor" ? "elementor" : "notion",
    })),
    comments: comments.map((row) => ({
      legacyId: String(row.id),
      postId: String(row.post_id),
      authorName: String(row.author_name),
      authorAvatarUrl: row.author_avatar_url ? String(row.author_avatar_url) : undefined,
      authorEmail: row.author_email ? String(row.author_email) : undefined,
      authorUserId: row.author_user_id ? String(row.author_user_id) : undefined,
      content: String(row.content),
      createdAt: String(row.created_at),
    })),
    templates: templates.map((row) => ({
      legacyId: String(row.id),
      tenantId: String(row.tenant_id),
      tenantType: String(row.tenant_type) === "organization" ? "organization" : "user",
      name: String(row.name ?? "Plantilla Predeterminada"),
      schemaVersion: String(row.schema_version ?? "1.0"),
      version: Number(row.version ?? 1),
      draftSlots: row.draft_slots ? JSON.parse(String(row.draft_slots)) : {},
      publishedSlots: row.published_slots ? JSON.parse(String(row.published_slots)) : {},
      settings: row.settings ? JSON.parse(String(row.settings)) : {},
      isPublished: Boolean(row.is_published),
      publishedAt: row.published_at ? String(row.published_at) : null,
      createdAt: String(row.created_at ?? new Date().toISOString()),
      updatedAt: String(row.updated_at ?? new Date().toISOString()),
    })),
    revisions: revisions.map((row) => ({
      legacyId: String(row.id),
      templateId: String(row.template_id),
      tenantId: String(row.tenant_id),
      version: Number(row.version),
      slotsSnapshot: row.slots_snapshot ? JSON.parse(String(row.slots_snapshot)) : {},
      settingsSnapshot: row.settings_snapshot ? JSON.parse(String(row.settings_snapshot)) : {},
      publishedBy: row.published_by ? String(row.published_by) : null,
      createdAt: String(row.created_at),
      changeSummary: row.change_summary ? String(row.change_summary) : null,
    })),
  }
}

function exportFromMock(): MigrationExportBundle {
  return {
    source: "mock",
    exportedAt: new Date().toISOString(),
    users: MOCK_USERS.map((user) => ({
      legacyId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      tagline: user.tagline,
      location: user.location,
      socials: user.socials as any,
      role: user.role,
      joinedAt: user.joinedAt,
      postCount: user.postCount,
      followerCount: user.followerCount,
      timezone: user.timezone,
      subdomainEnabled: user.subdomainEnabled,
      customDomain: user.customDomain,
    })),
    categories: MOCK_CATEGORIES.map((category) => ({
      legacyId: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
    })),
    tags: MOCK_TAGS.map((tag) => ({
      legacyId: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
    })),
    posts: MOCK_POSTS.map((post) => ({
      legacyId: post.id,
      authorId: post.authorId,
      categoryId: post.categoryId ?? null,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverUrl: post.coverUrl ?? null,
      tags: post.tags,
      status: post.status,
      publishedAt: post.publishedAt ?? null,
      updatedAt: post.updatedAt,
      scheduledFor: (post as any).scheduledFor ?? null,
      readingTimeMinutes: post.readingTimeMinutes,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
      featured: post.featured,
      designData: post.designData ?? null,
      editorMode: post.editorMode,
    })),
    comments: MOCK_COMMENTS.map((comment) => ({
      legacyId: comment.id,
      postId: comment.postId,
      authorName: comment.authorName,
      authorAvatarUrl: comment.authorAvatarUrl,
      authorEmail: (comment as any).authorEmail,
      authorUserId: (comment as any).authorUserId,
      content: comment.content,
      createdAt: comment.createdAt,
    })),
    templates: [],
    revisions: [],
  }
}

export function exportMigrationData(options: {
  source: MigrationSource
  sqlitePath?: string
  jsonPath?: string
}): MigrationExportBundle {
  if (options.source === "json") {
    if (!options.jsonPath) {
      throw new Error("Se requiere --json-path para --source json")
    }
    const raw = readFileSync(resolve(options.jsonPath), "utf8")
    return JSON.parse(raw) as MigrationExportBundle
  }

  if (options.source === "sqlite") {
    const dbPath = resolve(options.sqlitePath || ".data/blog.db")
    return exportFromSqlite(dbPath)
  }

  return exportFromMock()
}
