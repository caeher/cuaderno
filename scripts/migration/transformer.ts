import type { MigrationExportBundle } from "./types"

const BATCH_SIZE = 50

export function normalizeMigrationBundle(bundle: MigrationExportBundle): MigrationExportBundle {
  return {
    ...bundle,
    users: bundle.users.map((user) => ({
      ...user,
      legacyId: user.legacyId,
      joinedAt: user.joinedAt || new Date().toISOString().split("T")[0],
      postCount: user.postCount ?? 0,
      followerCount: user.followerCount ?? 0,
      timezone: user.timezone || "UTC",
      subdomainEnabled: user.subdomainEnabled ?? true,
    })),
    categories: bundle.categories.map((category) => ({
      ...category,
      tenantId: category.tenantId || category.authorId,
      color: category.color || "#3b82f6",
      postCount: category.postCount ?? 0,
    })),
    tags: bundle.tags.map((tag) => ({
      ...tag,
      tenantId: tag.tenantId || tag.authorId,
      color: tag.color || "#64748b",
      postCount: tag.postCount ?? 0,
    })),
    posts: bundle.posts.map((post) => ({
      ...post,
      tenantId: post.tenantId || post.organizationId || post.authorId,
      tags: post.tags || [],
      readingTimeMinutes: post.readingTimeMinutes || 1,
      views: post.views ?? 0,
      likes: post.likes ?? 0,
      comments: post.comments ?? 0,
      featured: post.featured ?? false,
      editorMode: post.editorMode || "notion",
      updatedAt: post.updatedAt || new Date().toISOString(),
    })),
    comments: bundle.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt || new Date().toISOString(),
    })),
    templates: bundle.templates.map((template) => ({
      ...template,
      schemaVersion: template.schemaVersion || "1.0",
      draftSlots: template.draftSlots || {},
      publishedSlots: template.publishedSlots || {},
      settings: template.settings || {},
      version: template.version || 1,
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: template.updatedAt || new Date().toISOString(),
    })),
    revisions: bundle.revisions.map((revision) => ({
      ...revision,
      slotsSnapshot: revision.slotsSnapshot || {},
      settingsSnapshot: revision.settingsSnapshot || {},
    })),
  }
}

export function chunkArray<T>(items: T[], size = BATCH_SIZE): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}
