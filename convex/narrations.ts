import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import {
  assertCanManageResource,
  getTenantIdentity,
  requireTenantAuth,
} from "./lib/auth"
import { findDocById, getCurrentIsoDate } from "./lib/helpers"
import { cleanPostToSpeechScript } from "../lib/server/speech-script-sanitizer"

/**
 * Deterministic hash of post content, title, and language.
 */
function computeContentHash(
  title: string,
  content: string,
  language: string = "es"
): string {
  const normalized = `${(title || "").trim()}:::${(content || "").trim()}:::${(language || "es").trim().toLowerCase()}`
  let h1 = 0x811c9dc5
  let h2 = 0x1000193

  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i)
    h1 ^= code
    h1 = Math.imul(h1, 16777619)
    h2 ^= code
    h2 = Math.imul(h2, 2166136261)
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0")
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0")
  return `hash_${hex1}${hex2}`
}

/**
 * Consulta la narración activa para una publicación.
 * - Lectores anónimos / públicos: solo reciben la narración si status === "ready"
 *   con su URL resuelta de Convex Storage y sin datos de error internos.
 * - Autor / Admin propietario: recibe todos los estados, snapshot de texto, error
 *   y la bandera de obsolescencia (isOutdated) comparada con el post actual.
 */
export const getForPost = query({
  args: { postId: v.string() },
  handler: async (ctx, args) => {
    const post = await findDocById(ctx.db, "posts", args.postId)
    if (!post) return null

    // Buscar narraciones asociadas al post (por postId o por postDocId)
    const postKey = (post._id as string)
    const postLegacyKey = post.legacyId || postKey

    const byPost = await ctx.db
      .query("postNarrations")
      .withIndex("by_post", (q) => q.eq("postId", postKey))
      .collect()

    const byLegacy =
      postLegacyKey !== postKey
        ? await ctx.db
            .query("postNarrations")
            .withIndex("by_post", (q) => q.eq("postId", postLegacyKey))
            .collect()
        : []

    const byDocId = await ctx.db
      .query("postNarrations")
      .withIndex("by_post_doc", (q) => q.eq("postDocId", post._id))
      .collect()

    const allNarrations = [...byPost, ...byLegacy, ...byDocId]
      .filter((n) => n.status !== "deleted")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    if (allNarrations.length === 0) return null

    const activeNarration = allNarrations[0]

    // Resolver URL de audio estable desde Convex Storage
    let audioUrl: string | null = null
    if (activeNarration.storageId) {
      audioUrl = await ctx.storage.getUrl(activeNarration.storageId)
    }

    // Verificar si el llamador es el autor/administrador del post
    const identity = await getTenantIdentity(ctx)
    let isOwner = false
    if (identity.isAuthenticated && identity.userId && identity.tenantId) {
      try {
        assertCanManageResource(identity as any, post)
        isOwner = true
      } catch {
        isOwner = false
      }
    }

    // Vista de Autor/Admin: datos completos y verificación de obsolescencia
    if (isOwner) {
      const script = cleanPostToSpeechScript(
        post.title,
        post.content,
        post.excerpt,
        { language: activeNarration.language || "es" }
      )
      const currentHash = computeContentHash(
        post.title,
        script.speechScript,
        activeNarration.language || "es"
      )
      const isOutdated = activeNarration.contentHash !== currentHash

      return {
        ...activeNarration,
        audioUrl,
        isOutdated,
      }
    }

    // Vista Pública: únicamente narraciones listas ("ready")
    if (activeNarration.status !== "ready") {
      return null
    }

    return {
      _id: activeNarration._id,
      postId: activeNarration.postId,
      status: activeNarration.status,
      language: activeNarration.language,
      voice: activeNarration.voice,
      duration: activeNarration.duration,
      format: activeNarration.format,
      audioUrl,
      transcript: activeNarration.transcript,
      approvedAt: activeNarration.approvedAt,
      createdAt: activeNarration.createdAt,
    }
  },
})

/**
 * Consulta una narración por su clave de idempotencia.
 */
export const getByIdempotencyKey = query({
  args: { idempotencyKey: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)

    const narration = await ctx.db
      .query("postNarrations")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", args.idempotencyKey))
      .first()

    if (!narration || narration.status === "deleted") return null

    assertCanManageResource(identity, narration)

    let audioUrl: string | null = null
    if (narration.storageId) {
      audioUrl = await ctx.storage.getUrl(narration.storageId)
    }

    return {
      ...narration,
      audioUrl,
    }
  },
})

/**
 * Consulta una narración por su ID.
 */
export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    const narration = await findDocById(ctx.db, "postNarrations", args.id)
    if (!narration || narration.status === "deleted") return null

    assertCanManageResource(identity, narration)

    let audioUrl: string | null = null
    if (narration.storageId) {
      audioUrl = await ctx.storage.getUrl(narration.storageId)
    }

    return {
      ...narration,
      audioUrl,
    }
  },
})

/**
 * Lista las narraciones correspondientes al tenant autenticado.
 */
export const listByTenant = query({
  args: {
    tenantId: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("failed"),
        v.literal("deleted")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.tenantId)
    const targetTenantId = args.tenantId || identity.tenantId

    let narrations: Doc<"postNarrations">[] = []

    if (args.status) {
      narrations = await ctx.db
        .query("postNarrations")
        .withIndex("by_tenant_and_status", (q) =>
          q.eq("tenantId", targetTenantId).eq("status", args.status!)
        )
        .collect()
    } else {
      narrations = await ctx.db
        .query("postNarrations")
        .withIndex("by_tenant", (q) => q.eq("tenantId", targetTenantId))
        .collect()
    }

    // Filtrar eliminados si no se pidió explícitamente
    if (!args.status) {
      narrations = narrations.filter((n) => n.status !== "deleted")
    }

    // Resolver URLs de audio
    const withUrls = await Promise.all(
      narrations.map(async (n) => {
        let audioUrl: string | null = null
        if (n.storageId) {
          audioUrl = await ctx.storage.getUrl(n.storageId)
        }
        return {
          ...n,
          audioUrl,
        }
      })
    )

    return withUrls.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
})

/**
 * Crea una nueva solicitud de narración en estado pending/generating.
 * Requiere autorización sobre el post correspondiente.
 */
export const create = mutation({
  args: {
    id: v.optional(v.string()),
    postId: v.string(),
    transcript: v.string(),
    contentHash: v.string(),
    idempotencyKey: v.optional(v.string()),
    language: v.optional(v.string()),
    voice: v.optional(v.string()),
    format: v.optional(v.union(v.literal("mp3"), v.literal("wav"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("generating"))),
  },
  handler: async (ctx, args) => {
    const post = await findDocById(ctx.db, "posts", args.postId)
    if (!post) {
      throw new Error(`Post con ID "${args.postId}" no encontrado.`)
    }

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, post)

    const now = getCurrentIsoDate()
    const effectiveTenantId =
      post.tenantId || post.organizationId || identity.tenantId || undefined

    const docId = await ctx.db.insert("postNarrations", {
      legacyId: args.id,
      postId: (post._id as string),
      postDocId: post._id,
      authorId: post.authorId,
      tenantId: effectiveTenantId,
      organizationId: post.organizationId,
      status: args.status || "pending",
      transcript: args.transcript,
      contentHash: args.contentHash,
      idempotencyKey: args.idempotencyKey,
      language: args.language || "es",
      voice: args.voice || "sarah",
      format: args.format || "mp3",
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(docId)
  },
})

/**
 * Actualiza el estado y metadatos del archivo de una narración.
 */
export const updateStatus = mutation({
  args: {
    id: v.string(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("failed"),
        v.literal("deleted")
      )
    ),
    storageId: v.optional(v.id("_storage")),
    vapiCallId: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
    fileSizeBytes: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    endedReason: v.optional(v.string()),
    generationMetadata: v.optional(v.any()),
    duration: v.optional(v.number()),
    error: v.optional(v.string()),
    transcript: v.optional(v.string()),
    contentHash: v.optional(v.string()),
    format: v.optional(v.union(v.literal("mp3"), v.literal("wav"))),
  },
  handler: async (ctx, args) => {
    const narration = await findDocById(ctx.db, "postNarrations", args.id)
    if (!narration) {
      throw new Error(`Narración con ID "${args.id}" no encontrada.`)
    }

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, narration)

    const now = getCurrentIsoDate()
    const patch: Partial<Doc<"postNarrations">> = {
      updatedAt: now,
    }
    if (args.status !== undefined) patch.status = args.status

    if (args.storageId !== undefined) patch.storageId = args.storageId
    if (args.vapiCallId !== undefined) patch.vapiCallId = args.vapiCallId
    if (args.idempotencyKey !== undefined) patch.idempotencyKey = args.idempotencyKey
    if (args.fileSizeBytes !== undefined) patch.fileSizeBytes = args.fileSizeBytes
    if (args.mimeType !== undefined) patch.mimeType = args.mimeType
    if (args.endedReason !== undefined) patch.endedReason = args.endedReason
    if (args.generationMetadata !== undefined) patch.generationMetadata = args.generationMetadata
    if (args.duration !== undefined) patch.duration = args.duration
    if (args.error !== undefined) patch.error = args.error
    if (args.transcript !== undefined) patch.transcript = args.transcript
    if (args.contentHash !== undefined) patch.contentHash = args.contentHash
    if (args.format !== undefined) patch.format = args.format

    if (args.status === "ready" && !narration.approvedAt) {
      patch.approvedAt = now
    }

    await ctx.db.patch(narration._id, patch)
    return await ctx.db.get(narration._id)
  },
})

/**
 * Aprueba una narración para su publicación activa.
 */
export const approve = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const narration = await findDocById(ctx.db, "postNarrations", args.id)
    if (!narration) {
      throw new Error(`Narración con ID "${args.id}" no encontrada.`)
    }

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, narration)

    const now = getCurrentIsoDate()
    await ctx.db.patch(narration._id, {
      approvedAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(narration._id)
  },
})

/**
 * Reemplaza una narración obsoleta iniciando un nuevo registro limpio.
 */
export const replace = mutation({
  args: {
    id: v.string(),
    transcript: v.string(),
    contentHash: v.string(),
    idempotencyKey: v.optional(v.string()),
    vapiCallId: v.optional(v.string()),
    language: v.optional(v.string()),
    voice: v.optional(v.string()),
    format: v.optional(v.union(v.literal("mp3"), v.literal("wav"))),
  },
  handler: async (ctx, args) => {
    const oldNarration = await findDocById(ctx.db, "postNarrations", args.id)
    if (!oldNarration) {
      throw new Error(`Narración anterior con ID "${args.id}" no encontrada.`)
    }

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, oldNarration)

    const now = getCurrentIsoDate()

    // Crear la nueva narración en estado pending
    const newDocId = await ctx.db.insert("postNarrations", {
      postId: oldNarration.postId,
      postDocId: oldNarration.postDocId,
      authorId: oldNarration.authorId,
      tenantId: oldNarration.tenantId,
      organizationId: oldNarration.organizationId,
      status: "pending",
      transcript: args.transcript,
      contentHash: args.contentHash,
      idempotencyKey: args.idempotencyKey,
      vapiCallId: args.vapiCallId,
      language: args.language || oldNarration.language,
      voice: args.voice || oldNarration.voice,
      format: args.format || oldNarration.format,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(newDocId)
  },
})

/**
 * Elimina una narración de forma segura y limpia el archivo en Convex Storage si existe.
 */
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const narration = await findDocById(ctx.db, "postNarrations", args.id)
    if (!narration) return true

    const identity = await requireTenantAuth(ctx)
    assertCanManageResource(identity, narration)

    // Si tiene archivo en Convex Storage, eliminarlo físicamente
    if (narration.storageId) {
      try {
        await ctx.storage.delete(narration.storageId)
      } catch (err) {
        console.warn(`[Storage Warning] Error al eliminar archivo ${narration.storageId}:`, err)
      }
    }

    await ctx.db.delete(narration._id)
    return true
  },
})

/**
 * Genera una URL de subida para Convex Storage autorizada.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireTenantAuth(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Deletes an orphan Convex Storage blob after a failed narration upload.
 */
export const deleteStorageBlob = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await requireTenantAuth(ctx)
    try {
      await ctx.storage.delete(args.storageId)
      return true
    } catch {
      return false
    }
  },
})
