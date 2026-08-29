"use node"

/**
 * Actions Node de la plataforma IA — issue #14.
 *
 * Único archivo que habla con OpenAI. El navegador no puede elegir modelo,
 * calidad ni esfuerzo: esas decisiones viven en `convex/lib/ai/config.ts`.
 */

import { v } from "convex/values"

import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { action, internalAction, type ActionCtx } from "./_generated/server"
import { requireUsableAiConfig } from "./lib/ai/config"
import {
  generateImage,
  runResearchResponse,
  runSmokeGeneration,
  runWritingResponse,
} from "./lib/ai/client"
import { AiModerationError, AiRefusalError, presentOpenAiError } from "./lib/ai/errors"
import { moderateText as moderateTextInternal } from "./lib/ai/moderation"
import {
  buildResearchSystemPrompt,
  buildResearchUserPrompt,
  checkBriefAmbiguity,
} from "./lib/ai/researchPrompts"
import {
  buildOutlineSystemPrompt,
  buildOutlineUserPrompt,
  buildWritingSystemPrompt,
  buildWritingUserPrompt,
  type OutlineStructure,
} from "./lib/ai/writingPrompts"
import {
  parseRawModelJson,
  validateStructuredDraft,
} from "./lib/ai/writingValidation"
import {
  buildVisualImagePrompt,
  generateSuggestedAltText,
} from "./lib/ai/imagePrompts"
import type { UsageSnapshot } from "./lib/ai/usage"
import { requireTenantAuth } from "./lib/auth"

const smokeResultValidator = v.object({
  ok: v.literal(true),
  model: v.string(),
  requestId: v.optional(v.string()),
  phase: v.literal("writing"),
})

const moderationResultValidator = v.union(
  v.object({ allowed: v.literal(true) }),
  v.object({
    allowed: v.literal(false),
    reason: v.string(),
    categories: v.array(v.string()),
  })
)

const textPhaseResultValidator = v.object({
  text: v.string(),
  sources: v.array(
    v.object({
      url: v.string(),
      title: v.optional(v.string()),
      domain: v.optional(v.string()),
      publisher: v.optional(v.string()),
      publishedAt: v.optional(v.string()),
      snippet: v.optional(v.string()),
      isExcluded: v.optional(v.boolean()),
      claims: v.optional(
        v.array(
          v.object({
            text: v.string(),
            offset: v.optional(v.number()),
            status: v.optional(
              v.union(
                v.literal("confirmed"),
                v.literal("inferred"),
                v.literal("unverified")
              )
            ),
          })
        )
      ),
    })
  ),
  model: v.string(),
  requestId: v.optional(v.string()),
  status: v.string(),
})

async function persistUsage(
  ctx: ActionCtx,
  tenantId: string,
  usage: UsageSnapshot,
  meta?: { sessionId?: Id<"composerSessions">; jobId?: Id<"composerJobs"> }
): Promise<void> {
  await ctx.runMutation(internal.composer.recordUsage, {
    tenantId,
    sessionId: meta?.sessionId,
    jobId: meta?.jobId,
    phase: usage.phase,
    model: usage.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    imageCount: usage.imageCount,
    toolCalls: usage.toolCalls,
    estimatedCostUsd: usage.estimatedCostUsd,
    actualCostUsd: usage.actualCostUsd,
    status: usage.status,
    requestId: usage.requestId,
  })
}

async function runAuthenticatedSmoke(ctx: ActionCtx, tenantId: string) {
  requireUsableAiConfig(tenantId)

  try {
    const result = await runSmokeGeneration()
    await persistUsage(ctx, tenantId, {
      phase: result.phase,
      model: result.model,
      status: "succeeded",
      requestId: result.requestId,
    })
    return result
  } catch (error) {
    const status =
      error instanceof AiModerationError
        ? "moderated"
        : error instanceof AiRefusalError
          ? "refused"
          : "failed"

    await persistUsage(ctx, tenantId, {
      phase: "writing",
      model: "unknown",
      status,
    })

    throw presentOpenAiError(error)
  }
}

/**
 * Prueba autenticada de integración. No acepta modelo ni calidad.
 * Devuelve solo metadatos: nunca la clave ni el texto generado.
 */
export const runSmokeTest = action({
  args: {},
  returns: smokeResultValidator,
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx)
    return await runAuthenticatedSmoke(ctx, identity.tenantId)
  },
})

export const runIntegrationSmoke = internalAction({
  args: {
    tenantId: v.optional(v.string()),
  },
  returns: smokeResultValidator,
  handler: async (ctx, args) => {
    return await runAuthenticatedSmoke(ctx, args.tenantId ?? "system-smoke")
  },
})

export const moderateText = internalAction({
  args: { text: v.string() },
  returns: moderationResultValidator,
  handler: async (_ctx, args) => {
    requireUsableAiConfig()
    return await moderateTextInternal(args.text)
  },
})

/**
 * Punto de extensión para #16 y #17. El modelo efectivo lo resuelve el entorno.
 * No persiste artefactos: un refusal o contenido moderado no crea posts.
 */
export const executeTextPhase = internalAction({
  args: {
    tenantId: v.string(),
    phase: v.union(v.literal("research"), v.literal("writing")),
    input: v.string(),
    instructions: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
    maxOutputTokens: v.optional(v.number()),
  },
  returns: textPhaseResultValidator,
  handler: async (ctx, args) => {
    requireUsableAiConfig(args.tenantId)

    try {
      const result =
        args.phase === "research"
          ? await runResearchResponse({
              input: args.input,
              instructions: args.instructions,
              idempotencyKey: args.idempotencyKey,
              maxOutputTokens: args.maxOutputTokens,
            })
          : await runWritingResponse({
              input: args.input,
              instructions: args.instructions,
              idempotencyKey: args.idempotencyKey,
              maxOutputTokens: args.maxOutputTokens,
            })

      await persistUsage(ctx, args.tenantId, result.usage)

      return {
        text: result.text,
        sources: result.sources,
        model: result.usage.model,
        requestId: result.usage.requestId,
        status: result.usage.status,
      }
    } catch (error) {
      const status =
        error instanceof AiModerationError
          ? "moderated"
          : error instanceof AiRefusalError
            ? "refused"
            : "failed"

      await persistUsage(ctx, args.tenantId, {
        phase: args.phase,
        model: "unknown",
        status,
      })

      throw presentOpenAiError(error)
    }
  },
})

/**
 * Generación de imagen para #18. El modelo y la calidad salen del entorno.
 * No persiste el binario: #18 decide si guardarlo. Un bloqueo no crea assets.
 */
export const executeImagePhase = internalAction({
  args: {
    tenantId: v.string(),
    prompt: v.string(),
  },
  returns: v.object({
    model: v.string(),
    imageCount: v.number(),
    requestId: v.optional(v.string()),
    status: v.string(),
  }),
  handler: async (ctx, args) => {
    requireUsableAiConfig(args.tenantId)

    try {
      const result = await generateImage(args.prompt)
      await persistUsage(ctx, args.tenantId, result.usage)

      return {
        model: result.model,
        imageCount: result.imageCount,
        requestId: result.usage.requestId,
        status: result.usage.status,
      }
    } catch (error) {
      const status =
        error instanceof AiModerationError
          ? "moderated"
          : error instanceof AiRefusalError
            ? "refused"
            : "failed"

      await persistUsage(ctx, args.tenantId, {
        phase: "image",
        model: "unknown",
        status,
      })

      throw presentOpenAiError(error)
    }
  },
})

/**
 * Consulta de estimación de coste para generación o regeneración de imagen.
 */
export const estimateImageCost = internalAction({
  args: {
    quality: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("auto"))
    ),
  },
  returns: v.object({
    quality: v.string(),
    estimatedCostUsd: v.number(),
    imageCount: v.number(),
  }),
  handler: async (_ctx, args) => {
    const quality = args.quality || "low"
    const estimatedCostUsd = quality === "low" ? 0.01 : quality === "high" ? 0.08 : 0.04
    return {
      quality,
      estimatedCostUsd,
      imageCount: 1,
    }
  },
})

/**
 * Orquestador de la fase de generación de imágenes de portada — Issue #18.
 *
 * Flujo:
 * 1. Verifica configuración y arranca el job de forma idempotente.
 * 2. Carga la sesión, brief y el esquema/borrador para construir el brief visual.
 * 3. Genera un prompt visual optimizado y alt text para accesibilidad (WCAG/SEO).
 * 4. Genera la imagen vía OpenAI Images API con 'quality: low' (o quality configurada/solicitada).
 * 5. Persiste el binario de la imagen directamente en Convex Storage (ctx.storage.store).
 * 6. Registra los artefactos de tipo 'cover' (storageId) y 'altText' (content).
 * 7. Registra consumo en aiUsageEvents y transiciona la sesión a 'awaiting_review'.
 */
export const executeImageJob = internalAction({
  args: {
    sessionId: v.id("composerSessions"),
    jobId: v.id("composerJobs"),
    customPrompt: v.optional(v.string()),
    quality: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("auto"))
    ),
  },
  returns: v.object({
    ok: v.boolean(),
    model: v.string(),
    storageId: v.optional(v.id("_storage")),
    altText: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.composer.getSessionInternal, {
      sessionId: args.sessionId,
    })
    if (!session) {
      throw new Error("Sesión de Composer no encontrada.")
    }

    requireUsableAiConfig(session.tenantId)

    const job = await ctx.runQuery(internal.composer.getJobInternal, {
      jobId: args.jobId,
    })
    if (!job) {
      throw new Error("Job de Composer no encontrado.")
    }

    const started = await ctx.runMutation(internal.composer.startJob, {
      jobId: args.jobId,
    })
    if (!started) {
      return { ok: false, model: "none", error: "Job cancelado." }
    }

    // Asegurar que la sesión esté en 'imaging' si venía de drafting
    if (session.status === "drafting") {
      try {
        await ctx.runMutation(internal.composer.transitionSession, {
          sessionId: args.sessionId,
          to: "imaging",
        })
      } catch {
        // Continuar si ya estaba en imaging o awaiting_review
      }
    }

    await ctx.runMutation(internal.composer.updateJobProgress, {
      jobId: args.jobId,
      progress: 0.15,
    })

    // 1. Obtener contexto del borrador/outline para el brief visual
    const artifacts = await ctx.runQuery(internal.composer.getSessionArtifactsInternal, {
      sessionId: args.sessionId,
    })
    const excerptArtifact = artifacts?.find((a) => a.kind === "excerpt")
    const articleArtifact = artifacts?.find((a) => a.kind === "article")

    const visualBrief = buildVisualImagePrompt({
      topic: session.brief.topic,
      title: session.title,
      excerpt: excerptArtifact?.content || articleArtifact?.content?.slice(0, 300),
      tone: session.brief.tone,
      constraints: session.brief.constraints,
    })

    const finalPrompt = args.customPrompt?.trim() || visualBrief.prompt
    const finalAltText = visualBrief.altText

    await ctx.runMutation(internal.composer.updateJobProgress, {
      jobId: args.jobId,
      progress: 0.35,
    })

    try {
      const result = await generateImage(finalPrompt, {
        quality: args.quality,
      })

      if (!result.b64Json) {
        throw new Error("El proveedor no devolvió una imagen en base64.")
      }

      await ctx.runMutation(internal.composer.updateJobProgress, {
        jobId: args.jobId,
        progress: 0.75,
      })

      // 2. Persistir imagen en Convex Storage
      const imageBuffer = Buffer.from(result.b64Json, "base64")
      const blob = new Blob([imageBuffer], { type: "image/png" })
      const storageId = await ctx.storage.store(blob)

      // 3. Registrar artefactos (cover con storageId, altText con content)
      await ctx.runMutation(internal.composer.recordArtifact, {
        sessionId: args.sessionId,
        kind: "cover",
        storageId,
      })

      await ctx.runMutation(internal.composer.recordArtifact, {
        sessionId: args.sessionId,
        kind: "altText",
        content: finalAltText,
      })

      // 4. Observabilidad de uso
      await persistUsage(ctx, session.tenantId, result.usage, {
        sessionId: args.sessionId,
        jobId: args.jobId,
      })

      // 5. Finalizar job
      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "succeeded",
      })

      // 6. Mensaje en la conversación
      await ctx.runMutation(internal.composer.appendMessageInternal, {
        sessionId: args.sessionId,
        role: "assistant",
        content: `He generado una propuesta de imagen de portada para tu artículo con el texto alternativo: "${finalAltText}". Puedes previsualizarla, editar su descripción o aprobarla para tu publicación.`,
      })

      // 7. Transición a awaiting_review
      if (session.status === "imaging" || session.status === "drafting") {
        await ctx.runMutation(internal.composer.transitionSession, {
          sessionId: args.sessionId,
          to: "awaiting_review",
        })
      }

      return {
        ok: true,
        model: result.usage.model,
        storageId,
        altText: finalAltText,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      const status =
        error instanceof AiModerationError
          ? "moderated"
          : error instanceof AiRefusalError
            ? "refused"
            : "failed"

      await persistUsage(
        ctx,
        session.tenantId,
        {
          phase: "image",
          model: "unknown",
          status,
        },
        { sessionId: args.sessionId, jobId: args.jobId }
      )

      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "failed",
        error: errorMsg,
      })

      // Informar al usuario en el chat
      await ctx.runMutation(internal.composer.appendMessageInternal, {
        sessionId: args.sessionId,
        role: "assistant",
        content: `No fue posible generar la portada automática: ${errorMsg}. Puedes continuar con la revisión del artículo o solicitar una regeneración más adelante.`,
      })

      // Si la sesión estaba en imaging, permitirle avanzar a awaiting_review para no bloquear el borrador
      try {
        if (session.status === "imaging") {
          await ctx.runMutation(internal.composer.transitionSession, {
            sessionId: args.sessionId,
            to: "awaiting_review",
          })
        }
      } catch {
        // Ignorar si la transición ya se realizó
      }

      throw presentOpenAiError(error)
    }
  },
})

/**
 * Orquestador de la fase de investigación (Research) — Issue #16.
 *
 * Flujo:
 * 1. Verifica configuración y arranca el job de forma idempotente.
 * 2. Comprueba ambigüedad en el brief antes de ejecutar búsquedas web.
 * 3. Ejecuta Web Search con OpenAI Responses API con presupuesto y contexto controlado.
 * 4. Extrae y persiste fuentes en composerSources con URLs canónicas, dominios, snippets y claims clasificados.
 * 5. Genera y persiste el artefacto 'outline' con hechos, inferencias y lagunas.
 * 6. Registra observabilidad en aiUsageEvents y actualiza el estado de la sesión.
 */
export const executeResearchJob = internalAction({
  args: {
    sessionId: v.id("composerSessions"),
    jobId: v.id("composerJobs"),
  },
  returns: v.object({
    ok: v.boolean(),
    sourceCount: v.number(),
    model: v.string(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.composer.getSessionInternal, {
      sessionId: args.sessionId,
    })
    if (!session) {
      throw new Error("Sesión de Composer no encontrada.")
    }

    requireUsableAiConfig(session.tenantId)

    const job = await ctx.runQuery(internal.composer.getJobInternal, {
      jobId: args.jobId,
    })
    if (!job) {
      throw new Error("Job de Composer no encontrado.")
    }

    const started = await ctx.runMutation(internal.composer.startJob, {
      jobId: args.jobId,
    })
    if (!started) {
      return { ok: false, sourceCount: 0, model: "none", error: "Job cancelado." }
    }

    // 1. Detección de ambigüedad en el brief antes de gastar presupuesto de búsqueda
    const ambiguity = checkBriefAmbiguity(session.brief)
    if (ambiguity.isAmbiguous) {
      const errorMsg = `El brief requiere aclaración:\n- ${ambiguity.reasons.join("\n- ")}`
      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "failed",
        error: errorMsg,
      })
      await ctx.runMutation(internal.composer.appendMessageInternal, {
        sessionId: args.sessionId,
        role: "assistant",
        content: `Para investigar adecuadamente necesito que aclaremos algunos puntos:\n- ${ambiguity.reasons.join("\n- ")}`,
      })
      return { ok: false, sourceCount: 0, model: "none", error: errorMsg }
    }

    await ctx.runMutation(internal.composer.updateJobProgress, {
      jobId: args.jobId,
      progress: 0.2,
    })

    const instructions = buildResearchSystemPrompt()
    const input = buildResearchUserPrompt(session.brief)

    try {
      const result = await runResearchResponse({
        input,
        instructions,
        idempotencyKey: job.idempotencyKey,
      })

      await ctx.runMutation(internal.composer.updateJobProgress, {
        jobId: args.jobId,
        progress: 0.7,
      })

      await persistUsage(ctx, session.tenantId, result.usage, {
        sessionId: args.sessionId,
        jobId: args.jobId,
      })

      // Guardar fuentes recolectadas en composerSources
      if (result.sources.length > 0) {
        await ctx.runMutation(internal.composer.recordSources, {
          sessionId: args.sessionId,
          sources: result.sources.map((s) => ({
            url: s.url,
            title: s.title,
            domain: s.domain,
            publisher: s.publisher,
            publishedAt: s.publishedAt,
            snippet: s.snippet,
            isExcluded: false,
            claims: (s.claims ?? []).map((c) => ({
              text: c.text,
              offset: c.offset,
              status: c.status ?? "confirmed",
            })),
          })),
        })
      }

      // Guardar artefacto de esquema / brief de investigación
      await ctx.runMutation(internal.composer.recordArtifact, {
        sessionId: args.sessionId,
        kind: "outline",
        content: result.text,
      })

      if (result.sources.length === 0) {
        const noSourcesMsg = "No se encontraron fuentes confiables sobre el tema investigado."
        await ctx.runMutation(internal.composer.finishJob, {
          jobId: args.jobId,
          status: "failed",
          error: noSourcesMsg,
        })
        await ctx.runMutation(internal.composer.transitionSession, {
          sessionId: args.sessionId,
          to: "failed",
          failureReason: noSourcesMsg,
        })
        return { ok: false, sourceCount: 0, model: result.usage.model, error: noSourcesMsg }
      }

      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "succeeded",
      })

      // Notificar al usuario en el chat
      await ctx.runMutation(internal.composer.appendMessageInternal, {
        sessionId: args.sessionId,
        role: "assistant",
        content: `Investigación completada con éxito. Se han analizado y guardado ${result.sources.length} fuentes. Puedes revisar las fuentes y el esquema antes de continuar con la redacción del borrador.`,
      })

      // Transición legal de estado
      const nextStatus = session.status === "researching" ? "drafting" : "awaiting_confirmation"
      if (session.status !== nextStatus) {
        await ctx.runMutation(internal.composer.transitionSession, {
          sessionId: args.sessionId,
          to: nextStatus,
        })
      }

      return {
        ok: true,
        sourceCount: result.sources.length,
        model: result.usage.model,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      const status =
        error instanceof AiModerationError
          ? "moderated"
          : error instanceof AiRefusalError
            ? "refused"
            : "failed"

      await persistUsage(
        ctx,
        session.tenantId,
        {
          phase: "research",
          model: "unknown",
          status,
        },
        { sessionId: args.sessionId, jobId: args.jobId }
      )

      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "failed",
        error: errorMsg,
      })

      try {
        await ctx.runMutation(internal.composer.transitionSession, {
          sessionId: args.sessionId,
          to: "failed",
          failureReason: errorMsg,
        })
      } catch {
        // Ignorar si la transición a failed ya no era legal desde un estado terminal
      }

      throw presentOpenAiError(error)
    }
  },
})

/**
 * Orquestador de la generación de Outline (Esquema) — Issue #17.
 *
 * Genera un esquema editorial estructurado a partir del brief y las fuentes aprobadas.
 * Se ejecuta con `gpt-5.6-luna` sin Web Search.
 */
export const executeOutlineJob = internalAction({
  args: {
    sessionId: v.id("composerSessions"),
    jobId: v.id("composerJobs"),
  },
  returns: v.object({
    ok: v.boolean(),
    model: v.string(),
    error: v.optional(stringOrUndefinedValidator()),
  }),
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.composer.getSessionInternal, {
      sessionId: args.sessionId,
    })
    if (!session) {
      throw new Error("Sesión de Composer no encontrada.")
    }

    requireUsableAiConfig(session.tenantId)

    const job = await ctx.runQuery(internal.composer.getJobInternal, {
      jobId: args.jobId,
    })
    if (!job) {
      throw new Error("Job de Composer no encontrado.")
    }

    const started = await ctx.runMutation(internal.composer.startJob, {
      jobId: args.jobId,
    })
    if (!started) {
      return { ok: false, model: "none", error: "Job cancelado." }
    }

    // Cargar fuentes aprobadas
    const rawSources = await ctx.runQuery(internal.composer.getSessionSourcesInternal, {
      sessionId: args.sessionId,
    })
    const activeSources = (rawSources || []).filter((s) => !s.isExcluded)

    await ctx.runMutation(internal.composer.updateJobProgress, {
      jobId: args.jobId,
      progress: 0.2,
    })

    const instructions = buildOutlineSystemPrompt()
    const input = buildOutlineUserPrompt(session.brief, activeSources)

    try {
      const result = await runWritingResponse({
        input,
        instructions,
        idempotencyKey: job.idempotencyKey,
      })

      await ctx.runMutation(internal.composer.updateJobProgress, {
        jobId: args.jobId,
        progress: 0.8,
      })

      await persistUsage(ctx, session.tenantId, result.usage, {
        sessionId: args.sessionId,
        jobId: args.jobId,
      })

      // Guardar artefacto de esquema
      await ctx.runMutation(internal.composer.recordArtifact, {
        sessionId: args.sessionId,
        kind: "outline",
        content: result.text,
      })

      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "succeeded",
      })

      await ctx.runMutation(internal.composer.appendMessageInternal, {
        sessionId: args.sessionId,
        role: "assistant",
        content: "He preparado el esquema editorial (Outline) para tu artículo. Puedes revisarlo antes de comenzar la redacción completa.",
      })

      return {
        ok: true,
        model: result.usage.model,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      const status =
        error instanceof AiModerationError
          ? "moderated"
          : error instanceof AiRefusalError
            ? "refused"
            : "failed"

      await persistUsage(
        ctx,
        session.tenantId,
        {
          phase: "writing",
          model: "unknown",
          status,
        },
        { sessionId: args.sessionId, jobId: args.jobId }
      )

      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "failed",
        error: errorMsg,
      })

      throw presentOpenAiError(error)
    }
  },
})

function stringOrUndefinedValidator() {
  return v.optional(v.string())
}

/**
 * Orquestador de la redacción del borrador de blog (Drafting) — Issue #17.
 *
 * Flujo:
 * 1. Carga el brief, fuentes aprobadas y el esquema vigente.
 * 2. Redacta el artículo completo con `gpt-5.6-luna` (Web Search desactivado).
 * 3. Ejecuta moderación y validación rigurosa (HTML TipTap, enlaces seguros, sin placeholders, longitud).
 * 4. Persiste los artefactos (article, excerpt, taxonomy).
 * 5. Actualiza el título y transiciona la sesión a `imaging` o `awaiting_review`.
 * 6. NO PUBLICA. El handoff a post en estado `draft` se realiza por el usuario o al finalizar.
 */
export const executeDraftingJob = internalAction({
  args: {
    sessionId: v.id("composerSessions"),
    jobId: v.id("composerJobs"),
  },
  returns: v.object({
    ok: v.boolean(),
    model: v.string(),
    error: v.optional(v.string()),
    validationWarnings: v.optional(v.array(v.string())),
  }),
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.composer.getSessionInternal, {
      sessionId: args.sessionId,
    })
    if (!session) {
      throw new Error("Sesión de Composer no encontrada.")
    }

    requireUsableAiConfig(session.tenantId)

    const job = await ctx.runQuery(internal.composer.getJobInternal, {
      jobId: args.jobId,
    })
    if (!job) {
      throw new Error("Job de Composer no encontrado.")
    }

    const started = await ctx.runMutation(internal.composer.startJob, {
      jobId: args.jobId,
    })
    if (!started) {
      return { ok: false, model: "none", error: "Job cancelado." }
    }

    // Asegurar que la sesión esté en estado "drafting"
    if (session.status !== "drafting" && session.status !== "awaiting_review") {
      try {
        await ctx.runMutation(internal.composer.transitionSession, {
          sessionId: args.sessionId,
          to: "drafting",
        })
      } catch {
        // Continuar si ya estaba en drafting o transición intermedia
      }
    }

    // 1. Cargar fuentes aprobadas
    const rawSources = await ctx.runQuery(internal.composer.getSessionSourcesInternal, {
      sessionId: args.sessionId,
    })
    const activeSources = (rawSources || []).filter((s) => !s.isExcluded)

    // 2. Cargar esquema vigente si existe
    const outlineArtifacts = await ctx.runQuery(internal.composer.getSessionArtifactsInternal, {
      sessionId: args.sessionId,
      kind: "outline",
    })
    let outlineStructure: OutlineStructure | undefined
    if (outlineArtifacts && outlineArtifacts.length > 0 && outlineArtifacts[0].content) {
      try {
        outlineStructure = parseRawModelJson<OutlineStructure>(outlineArtifacts[0].content)
      } catch {
        // Si el esquema previo no era JSON estructurado, se continúa sin outline formal
      }
    }

    await ctx.runMutation(internal.composer.updateJobProgress, {
      jobId: args.jobId,
      progress: 0.2,
    })

    const instructions = buildWritingSystemPrompt()
    const input = buildWritingUserPrompt(session.brief, activeSources, outlineStructure)

    try {
      const result = await runWritingResponse({
        input,
        instructions,
        idempotencyKey: job.idempotencyKey,
      })

      await ctx.runMutation(internal.composer.updateJobProgress, {
        jobId: args.jobId,
        progress: 0.7,
      })

      await persistUsage(ctx, session.tenantId, result.usage, {
        sessionId: args.sessionId,
        jobId: args.jobId,
      })

      // 3. Parsear y Validar el borrador generado
      let parsedRaw: any
      try {
        parsedRaw = parseRawModelJson(result.text)
      } catch (parseErr) {
        const errorMsg = `Error al procesar la salida del modelo: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`
        await ctx.runMutation(internal.composer.finishJob, {
          jobId: args.jobId,
          status: "failed",
          error: errorMsg,
        })
        return { ok: false, model: result.usage.model, error: errorMsg }
      }

      const validation = validateStructuredDraft(parsedRaw, session.brief)
      if (!validation.valid || !validation.parsedDraft) {
        const validationErrorMsg = `El borrador no superó los guardarraíles de calidad:\n- ${validation.errors.join("\n- ")}`
        await ctx.runMutation(internal.composer.finishJob, {
          jobId: args.jobId,
          status: "failed",
          error: validationErrorMsg,
        })
        await ctx.runMutation(internal.composer.appendMessageInternal, {
          sessionId: args.sessionId,
          role: "assistant",
          content: `Hubo un inconveniente al generar el borrador:\n- ${validation.errors.join("\n- ")}\nPor favor, intenta regenerar el artículo.`,
        })
        return { ok: false, model: result.usage.model, error: validationErrorMsg }
      }

      const draft = validation.parsedDraft

      // 4. Persistir artefactos estructurados
      await ctx.runMutation(internal.composer.recordArtifact, {
        sessionId: args.sessionId,
        kind: "article",
        content: draft.content,
      })

      await ctx.runMutation(internal.composer.recordArtifact, {
        sessionId: args.sessionId,
        kind: "excerpt",
        content: draft.excerpt,
      })

      const taxonomyPayload = JSON.stringify({
        suggestedCategories: draft.suggestedCategories,
        suggestedTags: draft.suggestedTags,
        tags: draft.suggestedTags,
        metaDescription: draft.metaDescription,
        suggestedSlug: draft.suggestedSlug,
        headings: draft.headings,
        callToAction: draft.callToAction,
      })

      await ctx.runMutation(internal.composer.recordArtifact, {
        sessionId: args.sessionId,
        kind: "taxonomy",
        content: taxonomyPayload,
      })

      // Actualizar título de la sesión si no tenía uno asignado
      if (!session.title && draft.title) {
        await ctx.runMutation(internal.composer.updateSessionTitleInternal, {
          sessionId: args.sessionId,
          title: draft.title,
        })
      }

      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "succeeded",
      })

      // 5. Transición de estado: a 'imaging' si pidió portada, o directo a 'awaiting_review'
      const nextStatus = session.brief.wantsCoverImage ? "imaging" : "awaiting_review"
      await ctx.runMutation(internal.composer.transitionSession, {
        sessionId: args.sessionId,
        to: nextStatus,
      })

      // Mensaje de confirmación al usuario
      await ctx.runMutation(internal.composer.appendMessageInternal, {
        sessionId: args.sessionId,
        role: "assistant",
        content: `¡El borrador "${draft.title}" ha sido redactado con éxito! El contenido incluye enlaces a fuentes verificadas y está formateado para el editor TipTap. Puedes revisarlo y crear el borrador cuando gustes.`,
      })

      return {
        ok: true,
        model: result.usage.model,
        validationWarnings: validation.warnings.length > 0 ? validation.warnings : undefined,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      const status =
        error instanceof AiModerationError
          ? "moderated"
          : error instanceof AiRefusalError
            ? "refused"
            : "failed"

      await persistUsage(
        ctx,
        session.tenantId,
        {
          phase: "writing",
          model: "unknown",
          status,
        },
        { sessionId: args.sessionId, jobId: args.jobId }
      )

      await ctx.runMutation(internal.composer.finishJob, {
        jobId: args.jobId,
        status: "failed",
        error: errorMsg,
      })

      try {
        await ctx.runMutation(internal.composer.transitionSession, {
          sessionId: args.sessionId,
          to: "failed",
          failureReason: errorMsg,
        })
      } catch {
        // Ignorar si ya estaba en estado terminal
      }

      throw presentOpenAiError(error)
    }
  },
})

