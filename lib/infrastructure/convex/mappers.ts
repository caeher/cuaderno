import type {
  AudioFormat,
  Category,
  Comment,
  NarrationStatus,
  Post,
  PostNarration,
  PostStatus,
  Tag,
  User,
} from "@/lib/domain/entities"
import type {
  TemplateRevision,
  TenantTemplate,
  TenantTemplateSettings,
} from "@/lib/domain/template-schema"


export function convexDocToUser(doc: any): User {
  return {
    id: doc._id,
    clerkUserId: doc.clerkUserId || undefined,
    legacyId: doc.legacyId || undefined,
    username: doc.username,
    name: doc.name,
    email: doc.email,
    avatarUrl: doc.avatarUrl,
    coverUrl: doc.coverUrl,
    bio: doc.bio || "",
    tagline: doc.tagline || "",
    location: doc.location || undefined,
    socials: doc.socials || {},
    role: doc.role || "owner",
    joinedAt: doc.joinedAt,
    postCount: doc.postCount || 0,
    followerCount: doc.followerCount || 0,
    timezone: doc.timezone || "UTC",
    subdomainEnabled: doc.subdomainEnabled ?? true,
    customDomain: doc.customDomain || undefined,
    legalSettings: doc.legalSettings || {},
    seoSettings: doc.seoSettings || {},
  }
}

export function convexDocToCategory(doc: any): Category {
  return {
    id: doc._id,
    organizationId: doc.organizationId || undefined,
    authorId: doc.authorId || undefined,
    name: doc.name,
    slug: doc.slug,
    description: doc.description || undefined,
    color: doc.color || "#3b82f6",
    icon: doc.icon || undefined,
    postCount: doc.postCount || 0,
  }
}

export function convexDocToTag(doc: any): Tag {
  return {
    id: doc._id,
    organizationId: doc.organizationId || undefined,
    authorId: doc.authorId || undefined,
    name: doc.name,
    slug: doc.slug,
    color: doc.color || "#64748b",
    postCount: doc.postCount || 0,
  }
}

export function convexDocToPost(doc: any): Post {
  return {
    id: doc._id,
    authorId: doc.authorId,
    organizationId: doc.organizationId || undefined,
    categoryId: doc.categoryId || null,
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt || "",
    content: doc.content || "",
    coverUrl: doc.coverUrl || null,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    status: (doc.status as PostStatus) || "draft",
    publishedAt: doc.publishedAt || null,
    updatedAt: doc.updatedAt,
    readingTimeMinutes: doc.readingTimeMinutes || 1,
    views: doc.views || 0,
    likes: doc.likes || 0,
    comments: doc.comments || 0,
    featured: Boolean(doc.featured),
    designData: doc.designData || null,
    editorMode: doc.editorMode || "notion",
  }
}

export function convexDocToComment(doc: any): Comment {
  return {
    id: doc._id,
    postId: doc.postId,
    authorName: doc.authorName,
    authorAvatarUrl: doc.authorAvatarUrl || "/placeholder.svg?height=200&width=200",
    content: doc.content,
    createdAt: doc.createdAt,
  }
}

export function convexDocToTenantTemplate(doc: any): TenantTemplate {
  return {
    id: doc._id,
    tenantId: doc.tenantId,
    tenantType: doc.tenantType || "user",
    schemaVersion: "1.0",
    version: doc.version || 1,
    name: doc.name || "Plantilla Predeterminada",
    draftSlots: doc.draftSlots || {},
    publishedSlots: doc.publishedSlots || {},
    settings: (doc.settings as TenantTemplateSettings) || {},
    isPublished: Boolean(doc.isPublished),
    publishedAt: doc.publishedAt || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function convexDocToTemplateRevision(doc: any): TemplateRevision {
  return {
    id: doc._id,
    templateId: doc.templateId,
    tenantId: doc.tenantId,
    version: doc.version,
    slotsSnapshot: doc.slotsSnapshot || {},
    settingsSnapshot: (doc.settingsSnapshot as TenantTemplateSettings) || {},
    publishedBy: doc.publishedBy || null,
    createdAt: doc.createdAt,
    changeSummary: doc.changeSummary || undefined,
  }
}

export function convexDocToNarration(doc: any, audioUrl?: string | null): PostNarration {
  return {
    id: doc._id || doc.id,
    postId: doc.postId,
    authorId: doc.authorId,
    tenantId: doc.tenantId || undefined,
    organizationId: doc.organizationId || undefined,
    status: (doc.status as NarrationStatus) || "pending",
    transcript: doc.transcript || "",
    contentHash: doc.contentHash || "",
    idempotencyKey: doc.idempotencyKey || undefined,
    vapiCallId: doc.vapiCallId || undefined,
    fileSizeBytes: doc.fileSizeBytes !== undefined ? Number(doc.fileSizeBytes) : undefined,
    mimeType: doc.mimeType || undefined,
    endedReason: doc.endedReason || undefined,
    generationMetadata: doc.generationMetadata || undefined,
    language: doc.language || "es",
    voice: doc.voice || "sarah",
    duration: doc.duration,
    format: (doc.format as AudioFormat) || "mp3",
    storageId: doc.storageId ? (doc.storageId as string) : undefined,
    audioUrl: audioUrl !== undefined ? audioUrl : doc.audioUrl || null,
    isOutdated: doc.isOutdated !== undefined ? Boolean(doc.isOutdated) : undefined,
    error: doc.error || undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    approvedAt: doc.approvedAt || null,
  }
}

