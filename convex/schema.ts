import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Reusable typed validators for nested objects
 */

export const socialLinksValidator = v.object({
  website: v.optional(v.string()),
  twitter: v.optional(v.string()),
  github: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  instagram: v.optional(v.string()),
});

export const tenantLegalSettingsValidator = v.object({
  companyName: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  taxId: v.optional(v.string()),
  address: v.optional(v.string()),
  jurisdiction: v.optional(v.string()),
  customPrivacyPolicy: v.optional(v.string()),
  customTerms: v.optional(v.string()),
  customCookiePolicy: v.optional(v.string()),
  customLegalNotice: v.optional(v.string()),
  dpoContact: v.optional(v.string()),
});

export const tenantSeoSettingsValidator = v.object({
  metaTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
  keywords: v.optional(v.array(v.string())),
  geoCountry: v.optional(v.string()),
  geoRegion: v.optional(v.string()),
  geoCity: v.optional(v.string()),
  geoCoordinates: v.optional(v.string()),
  allowAiCrawlers: v.optional(v.boolean()),
  enableLlmsTxt: v.optional(v.boolean()),
  socialSharingImage: v.optional(v.string()),
  canonicalDomain: v.optional(v.string()),
});

export const tenantTemplateSettingsValidator = v.object({
  primaryColor: v.optional(v.string()),
  accentColor: v.optional(v.string()),
  fontHeading: v.optional(v.string()),
  fontBody: v.optional(v.string()),
  customCss: v.optional(v.string()),
  containerMaxWidth: v.optional(v.string()),
});

export default defineSchema({
  /**
   * Colección: Users (Autores, Perfiles y Tenants individuales)
   */
  users: defineTable({
    legacyId: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    username: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
    coverUrl: v.string(),
    bio: v.string(),
    tagline: v.string(),
    location: v.optional(v.string()),
    socials: socialLinksValidator,
    role: v.union(v.literal("owner"), v.literal("admin")),
    joinedAt: v.string(),
    postCount: v.number(),
    followerCount: v.number(),
    timezone: v.optional(v.string()),
    subdomainEnabled: v.optional(v.boolean()),
    customDomain: v.optional(v.string()),
    legalSettings: v.optional(tenantLegalSettingsValidator),
    seoSettings: v.optional(tenantSeoSettingsValidator),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_token_identifier", ["tokenIdentifier"])
    .index("by_legacy_id", ["legacyId"])
    .index("by_custom_domain", ["customDomain"]),

  /**
   * Colección: Categories (Categorías taxonómicas por tenant / autor / organización)
   */
  categories: defineTable({
    legacyId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    authorId: v.optional(v.string()),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.optional(v.string()),
    postCount: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_tenant", ["tenantId"])
    .index("by_org", ["organizationId"])
    .index("by_author", ["authorId"])
    .index("by_slug_and_org", ["slug", "organizationId"])
    .index("by_slug_and_tenant", ["slug", "tenantId"])
    .index("by_legacy_id", ["legacyId"]),

  /**
   * Colección: Tags (Etiquetas taxonómicas por tenant / autor / organización)
   */
  tags: defineTable({
    legacyId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    authorId: v.optional(v.string()),
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
    postCount: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_tenant", ["tenantId"])
    .index("by_org", ["organizationId"])
    .index("by_author", ["authorId"])
    .index("by_slug_and_org", ["slug", "organizationId"])
    .index("by_slug_and_tenant", ["slug", "tenantId"])
    .index("by_legacy_id", ["legacyId"]),

  /**
   * Colección: Posts (Artículos y publicaciones con soporte multi-tenant)
   */
  posts: defineTable({
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
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("scheduled")),
    publishedAt: v.optional(v.string()),
    updatedAt: v.string(),
    scheduledFor: v.optional(v.string()),
    readingTimeMinutes: v.number(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    featured: v.boolean(),
    // @deprecated - Mantenido para retrocompatibilidad/auditoría
    designData: v.optional(v.string()),
    // @deprecated - Mantenido para retrocompatibilidad/auditoría
    editorMode: v.optional(v.union(v.literal("notion"), v.literal("elementor"))),
    // Desbordamiento a almacenamiento de archivos si el contenido supera 500 KB
    contentStorageId: v.optional(v.id("_storage")),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_status_and_publishedAt", ["status", "publishedAt"])
    .index("by_status_and_featured", ["status", "featured", "publishedAt"])
    .index("by_author", ["authorId"])
    .index("by_author_and_status", ["authorId", "status", "updatedAt"])
    .index("by_org_and_status", ["organizationId", "status", "updatedAt"])
    .index("by_tenant_and_status", ["tenantId", "status", "publishedAt"])
    .index("by_category_and_status", ["categoryId", "status"])
    .index("by_legacy_id", ["legacyId"]),

  /**
   * Colección: Comments (Comentarios asociados a publicaciones)
   */
  comments: defineTable({
    legacyId: v.optional(v.string()),
    postId: v.string(),
    postDocId: v.optional(v.id("posts")),
    authorName: v.string(),
    authorAvatarUrl: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    authorUserId: v.optional(v.string()),
    content: v.string(),
    createdAt: v.string(),
  })
    .index("by_post", ["postId", "createdAt"])
    .index("by_post_doc", ["postDocId", "createdAt"])
    .index("by_legacy_id", ["legacyId"]),

  /**
   * Colección: TenantTemplates (Plantillas visuales activas a nivel de tenant)
   */
  tenantTemplates: defineTable({
    legacyId: v.optional(v.string()),
    tenantId: v.string(),
    tenantType: v.union(v.literal("organization"), v.literal("user")),
    name: v.string(),
    schemaVersion: v.string(),
    version: v.number(),
    draftSlots: v.record(v.string(), v.any()),
    publishedSlots: v.record(v.string(), v.any()),
    settings: tenantTemplateSettingsValidator,
    isPublished: v.boolean(),
    publishedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    storageDraftId: v.optional(v.id("_storage")),
    storagePublishedId: v.optional(v.id("_storage")),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_published", ["tenantId", "isPublished"])
    .index("by_legacy_id", ["legacyId"]),

  /**
   * Colección: TenantTemplateRevisions (Historial inmutable de versiones de plantilla publicadas)
   */
  tenantTemplateRevisions: defineTable({
    legacyId: v.optional(v.string()),
    templateId: v.string(),
    templateDocId: v.optional(v.id("tenantTemplates")),
    tenantId: v.string(),
    version: v.number(),
    slotsSnapshot: v.record(v.string(), v.any()),
    settingsSnapshot: tenantTemplateSettingsValidator,
    publishedBy: v.optional(v.string()),
    createdAt: v.string(),
    changeSummary: v.optional(v.string()),
    storageSnapshotId: v.optional(v.id("_storage")),
  })
    .index("by_tenant_and_version", ["tenantId", "version"])
    .index("by_template_and_version", ["templateId", "version"])
    .index("by_legacy_id", ["legacyId"]),
});
