/**
 * Composer — persistencia de sesiones, jobs y artefactos (issue #15).
 *
 * Tres decisiones que cumplen los criterios de aceptación del issue y que conviene
 * no deshacer sin entender por qué están:
 *
 * 1. **El `tenantId` NUNCA llega del cliente.** Se deriva de la identidad de Clerk en
 *    cada mutation. `posts.ts` usa otra estrategia igual de segura — acepta
 *    `args.tenantId` y lo valida con `assertCanManageResource` antes de usarlo —, pero
 *    #15 pide explícitamente no aceptarlo como autorización, y derivarlo deja menos
 *    superficie: no hay un camino donde olvidarse del assert abra un agujero.
 *
 * 2. **Los jobs son idempotentes por `idempotencyKey`.** Encolar dos veces la misma
 *    operación devuelve el job existente en vez de crear uno nuevo. Sin esto, un
 *    refresh del navegador paga dos veces la misma llamada al proveedor o crea dos
 *    posts — el criterio de aceptación explícito de #15.
 *
 * 3. **El ciclo de vida de un job se escribe con `internalMutation`.** Las acciones que
 *    hablan con el proveedor (issues #16 a #18) las llaman; el navegador no puede
 *    declarar un job exitoso ni inyectar fuentes o artefactos falsos.
 */

import { v } from "convex/values"

import { internalMutation, mutation, query } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"
import { requireTenantAuth } from "./lib/auth"
import {
  assertTransition,
  isTerminalStatus,
  type ComposerSessionStatus,
} from "./lib/composer-state"
import { calculateReadingTime, getCurrentIsoTimestamp } from "./lib/helpers"
import { composerBriefValidator, composerSessionStatusValidator } from "./schema"

// ─────────────────────────────────────────────────────────────────────────────
// Acceso
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga una sesión verificando que pertenece al tenant activo.
 *
 * Devuelve el mismo error tanto si la sesión no existe como si es de otro tenant:
 * distinguirlos le confirmaría a un atacante qué ids existen.
 */
async function requireOwnedSession(
  ctx: { db: any; auth: any },
  sessionId: Id<"composerSessions">
): Promise<{ session: Doc<"composerSessions">; tenantId: string }> {
  const identity = await requireTenantAuth(ctx)
  const session = await ctx.db.get(sessionId)

  if (!session || session.tenantId !== identity.tenantId) {
    throw new Error("Sesión de Composer no encontrada.")
  }

  return { session, tenantId: identity.tenantId }
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

export const listSessions = query({
  args: { status: v.optional(composerSessionStatusValidator) },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)

    if (args.status) {
      return await ctx.db
        .query("composerSessions")
        .withIndex("by_tenant_and_status", (q) =>
          q.eq("tenantId", identity.tenantId).eq("status", args.status!)
        )
        .order("desc")
        .collect()
    }

    return await ctx.db
      .query("composerSessions")
      .withIndex("by_tenant", (q) => q.eq("tenantId", identity.tenantId))
      .order("desc")
      .collect()
  },
})

export const getSession = query({
  args: { sessionId: v.id("composerSessions") },
  handler: async (ctx, args) => {
    const { session } = await requireOwnedSession(ctx, args.sessionId)
    return session
  },
})

export const getSessionMessages = query({
  args: { sessionId: v.id("composerSessions") },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId)
    return await ctx.db
      .query("composerMessages")
      .withIndex("by_session_and_created", (q) => q.eq("sessionId", args.sessionId))
      .collect()
  },
})

export const getSessionJobs = query({
  args: { sessionId: v.id("composerSessions") },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId)
    return await ctx.db
      .query("composerJobs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()
  },
})

export const getSessionSources = query({
  args: { sessionId: v.id("composerSessions") },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId)
    return await ctx.db
      .query("composerSources")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()
  },
})

export const getSessionArtifacts = query({
  args: {
    sessionId: v.id("composerSessions"),
    kind: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId)

    const artifacts = await ctx.db
      .query("composerArtifacts")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()

    const vigentes = artifacts.filter((a: Doc<"composerArtifacts">) => !a.supersededBy)
    return args.kind
      ? vigentes.filter((a: Doc<"composerArtifacts">) => a.kind === args.kind)
      : vigentes
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Sesión
// ─────────────────────────────────────────────────────────────────────────────

export const createSession = mutation({
  args: { brief: v.optional(composerBriefValidator) },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    const now = getCurrentIsoTimestamp()

    return await ctx.db.insert("composerSessions", {
      tenantId: identity.tenantId,
      authorId: identity.userId,
      brief: args.brief ?? {},
      status: "collecting",
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateBrief = mutation({
  args: {
    sessionId: v.id("composerSessions"),
    brief: composerBriefValidator,
  },
  handler: async (ctx, args) => {
    const { session } = await requireOwnedSession(ctx, args.sessionId)

    if (isTerminalStatus(session.status as ComposerSessionStatus)) {
      throw new Error(
        `La sesión está en estado "${session.status}" y ya no admite cambios en el brief.`
      )
    }

    await ctx.db.patch(args.sessionId, {
      brief: { ...session.brief, ...args.brief },
      updatedAt: getCurrentIsoTimestamp(),
    })
  },
})

export const appendMessage = mutation({
  args: {
    sessionId: v.id("composerSessions"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { session, tenantId } = await requireOwnedSession(ctx, args.sessionId)
    const now = getCurrentIsoTimestamp()

    const messageId = await ctx.db.insert("composerMessages", {
      sessionId: args.sessionId,
      tenantId,
      role: args.role,
      content: args.content,
      createdAt: now,
    })

    await ctx.db.patch(session._id, { updatedAt: now })
    return messageId
  },
})

/**
 * Cambia el estado de la sesión validando que la transición sea legal.
 *
 * Es la única puerta de escritura de `status`: cualquier otro camino permitiría
 * estados imposibles cuando dos jobs terminan a destiempo.
 */
export const transitionSession = internalMutation({
  args: {
    sessionId: v.id("composerSessions"),
    to: composerSessionStatusValidator,
    failureReason: v.optional(v.string()),
    postId: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error("Sesión de Composer no encontrada.")

    assertTransition(session.status as ComposerSessionStatus, args.to as ComposerSessionStatus)

    await ctx.db.patch(args.sessionId, {
      status: args.to,
      failureReason: args.failureReason,
      postId: args.postId ?? session.postId,
      updatedAt: getCurrentIsoTimestamp(),
    })
  },
})

/** Cancelar es la única transición que el usuario dispara sobre una sesión en curso. */
export const cancelSession = mutation({
  args: { sessionId: v.id("composerSessions") },
  handler: async (ctx, args) => {
    const { session } = await requireOwnedSession(ctx, args.sessionId)

    if (isTerminalStatus(session.status as ComposerSessionStatus)) return

    assertTransition(session.status as ComposerSessionStatus, "cancelled")
    const now = getCurrentIsoTimestamp()

    await ctx.db.patch(args.sessionId, { status: "cancelled", updatedAt: now })

    // Cancelar la sesión cancela sus jobs vivos: dejarlos corriendo seguiría gastando.
    const jobs = await ctx.db
      .query("composerJobs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()

    for (const job of jobs) {
      if (job.status === "queued" || job.status === "running") {
        await ctx.db.patch(job._id, { status: "cancelled", finishedAt: now })
      }
    }
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Jobs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encola un job de forma idempotente.
 *
 * Si ya existe un job del tenant con la misma `idempotencyKey`, lo devuelve en vez de
 * crear otro. Es lo que hace que un refresh o un reintento no dupliquen una llamada
 * de pago ni generen dos posts.
 */
export const enqueueJob = mutation({
  args: {
    sessionId: v.id("composerSessions"),
    kind: v.union(
      v.literal("research"),
      v.literal("outline"),
      v.literal("article"),
      v.literal("image"),
      v.literal("moderation")
    ),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { session, tenantId } = await requireOwnedSession(ctx, args.sessionId)

    if (isTerminalStatus(session.status as ComposerSessionStatus)) {
      throw new Error(
        `La sesión está en estado "${session.status}" y no admite nuevos trabajos.`
      )
    }

    const existing = await ctx.db
      .query("composerJobs")
      .withIndex("by_tenant_and_idempotency_key", (q) =>
        q.eq("tenantId", tenantId).eq("idempotencyKey", args.idempotencyKey)
      )
      .first()

    if (existing) return existing._id

    return await ctx.db.insert("composerJobs", {
      sessionId: args.sessionId,
      tenantId,
      kind: args.kind,
      status: "queued",
      idempotencyKey: args.idempotencyKey,
      attempt: 0,
      createdAt: getCurrentIsoTimestamp(),
    })
  },
})

export const startJob = internalMutation({
  args: { jobId: v.id("composerJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new Error("Job de Composer no encontrado.")

    if (job.status === "cancelled") {
      // La sesión se canceló mientras el job esperaba: no se arranca.
      return false
    }

    await ctx.db.patch(args.jobId, {
      status: "running",
      attempt: job.attempt + 1,
      startedAt: getCurrentIsoTimestamp(),
      error: undefined,
    })

    return true
  },
})

export const updateJobProgress = internalMutation({
  args: { jobId: v.id("composerJobs"), progress: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      progress: Math.max(0, Math.min(1, args.progress)),
    })
  },
})

export const finishJob = internalMutation({
  args: {
    jobId: v.id("composerJobs"),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      error: args.error,
      finishedAt: getCurrentIsoTimestamp(),
      progress: args.status === "succeeded" ? 1 : undefined,
    })
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Fuentes y artefactos — escritura solo desde acciones internas
// ─────────────────────────────────────────────────────────────────────────────

export const recordSources = internalMutation({
  args: {
    sessionId: v.id("composerSessions"),
    sources: v.array(
      v.object({
        url: v.string(),
        title: v.optional(v.string()),
        publisher: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
        snippet: v.optional(v.string()),
        claims: v.array(v.object({ text: v.string(), offset: v.optional(v.number()) })),
      })
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error("Sesión de Composer no encontrada.")

    const now = getCurrentIsoTimestamp()

    for (const source of args.sources) {
      // Deduplicar por URL dentro de la sesión: un reintento de research no debe
      // multiplicar las mismas fuentes.
      const existing = await ctx.db
        .query("composerSources")
        .withIndex("by_session_and_url", (q) =>
          q.eq("sessionId", args.sessionId).eq("url", source.url)
        )
        .first()

      if (existing) {
        await ctx.db.patch(existing._id, { claims: source.claims, fetchedAt: now })
        continue
      }

      await ctx.db.insert("composerSources", {
        sessionId: args.sessionId,
        tenantId: session.tenantId,
        fetchedAt: now,
        ...source,
      })
    }
  },
})

/**
 * Guarda un artefacto como nueva versión y marca la anterior como superada.
 *
 * No se sobrescribe: el historial es lo que permite mostrarle al usuario qué cambió
 * cuando pide regenerar, y volver atrás si la nueva versión es peor.
 */
export const recordArtifact = internalMutation({
  args: {
    sessionId: v.id("composerSessions"),
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
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error("Sesión de Composer no encontrada.")

    const previos = await ctx.db
      .query("composerArtifacts")
      .withIndex("by_session_and_kind", (q) =>
        q.eq("sessionId", args.sessionId).eq("kind", args.kind)
      )
      .collect()

    const vigente = previos.find((a: Doc<"composerArtifacts">) => !a.supersededBy)
    const version = previos.reduce(
      (max: number, a: Doc<"composerArtifacts">) => Math.max(max, a.version),
      0
    )

    const nuevoId = await ctx.db.insert("composerArtifacts", {
      sessionId: args.sessionId,
      tenantId: session.tenantId,
      kind: args.kind,
      content: args.content,
      storageId: args.storageId,
      version: version + 1,
      createdAt: getCurrentIsoTimestamp(),
    })

    if (vigente) {
      await ctx.db.patch(vigente._id, { supersededBy: nuevoId })
    }

    return nuevoId
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Observabilidad
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra el consumo de una fase. SOLO observabilidad: en esta fase no hay cuotas,
 * presupuestos ni límites por tenant (#14 y #15 lo dicen explícitamente). Los campos
 * de modelo, tokens y coste los llena la capa de IA del issue #14.
 */
export const recordUsage = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiUsageEvents", {
      ...args,
      createdAt: getCurrentIsoTimestamp(),
    })
  },
})


// ─────────────────────────────────────────────────────────────────────────────
// Handoff al editor — issue #17
// ─────────────────────────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/**
 * Crea el post en estado `draft` a partir de los artefactos de la sesión.
 *
 * **`status: "draft"` es un literal, no un parámetro.** Es el invariante que define la
 * épica: Composer nunca publica. Convertirlo en argumento para "dar flexibilidad" sería
 * abrir el camino que el criterio de aceptación prohíbe.
 *
 * **Es idempotente:** si la sesión ya tiene `postId` y ese post existe, lo devuelve sin
 * crear otro. Es el criterio de #15 — un refresh o un reintento no puede generar dos
 * posts.
 *
 * Inserta directo en `posts` en vez de llamar a `posts.create` porque una mutation no
 * puede invocar otra mutation. Los campos replican los de `posts.create`, incluido el
 * incremento de `postCount` del autor; si aquella cambia de forma, esta debe seguirla.
 */
export const createDraftFromSession = mutation({
  args: { sessionId: v.id("composerSessions") },
  handler: async (ctx, args) => {
    const { session, tenantId } = await requireOwnedSession(ctx, args.sessionId)

    if (session.postId) {
      const existing = await ctx.db.get(session.postId)
      if (existing) return session.postId
    }

    if (session.status !== "awaiting_review") {
      throw new Error(
        `La sesión está en estado "${session.status}". Solo se puede crear el borrador desde "awaiting_review".`
      )
    }

    const artifacts = await ctx.db
      .query("composerArtifacts")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()

    const vigentes = artifacts.filter((a: Doc<"composerArtifacts">) => !a.supersededBy)
    const porTipo = (kind: string) =>
      vigentes.find((a: Doc<"composerArtifacts">) => a.kind === kind)

    const article = porTipo("article")
    if (!article?.content) {
      throw new Error("La sesión no tiene un artículo generado; no hay nada que convertir en borrador.")
    }

    // Las etiquetas llegan como JSON del modelo: si viene mal formado se ignora en vez
    // de tumbar el handoff. Perder etiquetas es recuperable; perder el artículo no.
    let tags: string[] = []
    const taxonomy = porTipo("taxonomy")
    if (taxonomy?.content) {
      try {
        const parsed = JSON.parse(taxonomy.content)
        if (Array.isArray(parsed)) {
          tags = parsed.filter((x: unknown): x is string => typeof x === "string")
        } else if (parsed && Array.isArray(parsed.tags)) {
          tags = parsed.tags.filter((x: unknown): x is string => typeof x === "string")
        }
      } catch {
        tags = []
      }
    }

    const cover = porTipo("cover")
    const coverUrl = cover?.storageId ? await ctx.storage.getUrl(cover.storageId) : undefined

    const title =
      session.title?.trim() ||
      session.brief.topic?.trim() ||
      "Borrador sin título"

    // Slug único dentro del tenant: se sufija hasta encontrar uno libre.
    const base = slugify(title) || "borrador"
    let slug = base
    let intento = 1
    while (
      await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first()
    ) {
      intento += 1
      slug = `${base}-${intento}`
    }

    const authorDoc = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", session.authorId))
      .first()

    const now = getCurrentIsoTimestamp()

    const postId = await ctx.db.insert("posts", {
      authorId: authorDoc?.clerkUserId || authorDoc?.legacyId || session.authorId,
      authorDocId: authorDoc?._id,
      tenantId,
      title,
      slug,
      excerpt: porTipo("excerpt")?.content ?? "",
      content: article.content,
      coverUrl: coverUrl ?? undefined,
      tags,
      status: "draft",
      updatedAt: now,
      readingTimeMinutes: calculateReadingTime(article.content),
      views: 0,
      likes: 0,
      comments: 0,
      featured: false,
      editorMode: "notion",
    })

    if (authorDoc) {
      await ctx.db.patch(authorDoc._id, { postCount: (authorDoc.postCount || 0) + 1 })
    }

    await ctx.db.patch(args.sessionId, { postId, updatedAt: now })

    return postId
  },
})
