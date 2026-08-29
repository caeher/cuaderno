"use node"

/**
 * Actions Node de la plataforma IA — issue #14.
 *
 * Único archivo que habla con OpenAI. El navegador no puede elegir modelo,
 * calidad ni esfuerzo: esas decisiones viven en `convex/lib/ai/config.ts`.
 */

import { v } from "convex/values"

import { internal } from "./_generated/api"
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
    })
  ),
  model: v.string(),
  requestId: v.optional(v.string()),
  status: v.string(),
})

async function persistUsage(
  ctx: ActionCtx,
  tenantId: string,
  usage: UsageSnapshot
): Promise<void> {
  await ctx.runMutation(internal.composer.recordUsage, {
    tenantId,
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
  requireUsableAiConfig()

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
    requireUsableAiConfig()

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
    requireUsableAiConfig()

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
