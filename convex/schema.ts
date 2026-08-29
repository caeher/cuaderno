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

/**
 * Estados de una sesión de Composer (issue #15).
 *
 * El orden feliz es collecting -> awaiting_confirmation -> researching -> drafting
 * -> imaging -> awaiting_review. `imaging` se salta si el usuario no pidió portada.
 * Las transiciones legales viven en lib/domain/composer/state-machine.ts y se validan
 * en la mutation, nunca en la action: así dos jobs que terminan a destiempo no pueden
 * dejar la sesión en un estado imposible.
 */
export const composerSessionStatusValidator = v.union(
  v.literal("collecting"),
  v.literal("awaiting_confirmation"),
  v.literal("researching"),
  v.literal("drafting"),
  v.literal("imaging"),
  v.literal("awaiting_review"),
  v.literal("failed"),
  v.literal("cancelled")
);

/** Preferencias editoriales que el usuario fija en la conversación. */
export const composerBriefValidator = v.object({
  topic: v.optional(v.string()),
  audience: v.optional(v.string()),
  tone: v.optional(v.string()),
  language: v.optional(v.string()),
  targetLength: v.optional(v.number()),
  seoKeywords: v.optional(v.array(v.string())),
  constraints: v.optional(v.string()),
  wantsCoverImage: v.optional(v.boolean()),
  wantsExtraImages: v.optional(v.boolean()),
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
    .index("by_author_doc", ["authorDocId"])
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

  /**
   * Colección: ComposerSessions (una conversación de Composer por tenant)
   *
   * `tenantId` NUNCA se acepta del cliente: se deriva de la identidad de Clerk en cada
   * mutation. Es el criterio de aceptación de #15 — dos tenants no pueden verse entre sí.
   */
  composerSessions: defineTable({
    tenantId: v.string(),
    authorId: v.string(),
    title: v.optional(v.string()),
    brief: composerBriefValidator,
    status: composerSessionStatusValidator,
    failureReason: v.optional(v.string()),
    postId: v.optional(v.id("posts")),
    createdAt: v.string(),
    updatedAt: v.string(),
    expiresAt: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_status", ["tenantId", "status"])
    .index("by_tenant_and_updated", ["tenantId", "updatedAt"]),

  /**
   * Colección: ComposerMessages (turnos de la conversación)
   */
  composerMessages: defineTable({
    sessionId: v.id("composerSessions"),
    tenantId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.string(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_created", ["sessionId", "createdAt"]),

  /**
   * Colección: ComposerJobs (unidad de trabajo asíncrono, reanudable y cancelable)
   *
   * Existe separada de la sesión porque research e imágenes tardan decenas de segundos:
   * sin una tabla de jobs, cerrar la pestaña pierde el trabajo y no hay dónde registrar
   * reintentos. `idempotencyKey` es lo que impide que un refresh pague dos veces la misma
   * llamada o cree dos posts.
   */
  composerJobs: defineTable({
    sessionId: v.id("composerSessions"),
    tenantId: v.string(),
    kind: v.union(
      v.literal("research"),
      v.literal("outline"),
      v.literal("article"),
      v.literal("image"),
      v.literal("moderation")
    ),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    idempotencyKey: v.string(),
    progress: v.optional(v.number()),
    attempt: v.number(),
    error: v.optional(v.string()),
    startedAt: v.optional(v.string()),
    finishedAt: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_session", ["sessionId"])
    .index("by_tenant_and_status", ["tenantId", "status"])
    .index("by_tenant_and_idempotency_key", ["tenantId", "idempotencyKey"]),

  /**
   * Colección: ComposerSources (trazabilidad de la investigación)
   *
   * Es tabla y no un campo JSON dentro del artefacto porque el criterio de aceptación
   * del epic exige rastrear cada afirmación a su fuente: embebidas no se pueden consultar,
   * deduplicar ni mostrar sin parsear texto.
   */
  composerSources: defineTable({
    sessionId: v.id("composerSessions"),
    tenantId: v.string(),
    url: v.string(),
    title: v.optional(v.string()),
    publisher: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    fetchedAt: v.string(),
    snippet: v.optional(v.string()),
    claims: v.array(v.object({ text: v.string(), offset: v.optional(v.number()) })),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_url", ["sessionId", "url"]),

  /**
   * Colección: ComposerArtifacts (toda salida del modelo, versionada)
   */
  composerArtifacts: defineTable({
    sessionId: v.id("composerSessions"),
    tenantId: v.string(),
    kind: v.union(
      v.literal("outline"),
      v.literal("article"),
      v.literal("excerpt"),
      v.literal("taxonomy"),
      v.literal("altText"),
      v.literal("cover")
    ),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    version: v.number(),
    supersededBy: v.optional(v.id("composerArtifacts")),
    createdAt: v.string(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_kind", ["sessionId", "kind"]),

  /**
   * Colección: AiUsageEvents (observabilidad de consumo)
   *
   * Solo observabilidad: en esta fase NO hay cuotas, presupuestos ni límites por tenant
   * (#14 y #15 lo dicen explícitamente). Los campos de modelo y coste los llena #14.
   */
  aiUsageEvents: defineTable({
    tenantId: v.string(),
    sessionId: v.optional(v.id("composerSessions")),
    jobId: v.optional(v.id("composerJobs")),
    phase: v.string(),
    model: v.optional(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    imageCount: v.optional(v.number()),
    toolCalls: v.optional(v.number()),
    estimatedCostUsd: v.optional(v.number()),
    status: v.string(),
    requestId: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_session", ["sessionId"])
    .index("by_tenant_and_created", ["tenantId", "createdAt"]),
});
