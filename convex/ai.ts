/**
 * Superficie pública de la plataforma de IA — issue #14.
 *
 * El health check no gasta tokens. Las llamadas al proveedor viven en `aiNode.ts`.
 */

import { v } from "convex/values"

import { query } from "./_generated/server"
import { requireTenantAuth } from "./lib/auth"
import { validateAiConfig } from "./lib/ai/config"

const aiConfigReportValidator = v.object({
  ok: v.boolean(),
  hasApiKey: v.boolean(),
  composerEnabled: v.boolean(),
  researchModel: v.string(),
  writingModel: v.string(),
  imageModel: v.string(),
  reasoningEffort: v.union(
    v.literal("minimal"),
    v.literal("low"),
    v.literal("medium"),
    v.literal("high")
  ),
  imageQuality: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("auto")
  ),
  problems: v.array(v.string()),
})

/**
 * Reporta si la plataforma de IA está bien configurada.
 *
 * Requiere sesión. Nunca devuelve la clave — `validateAiConfig` solo informa si
 * existe. No confirma conectividad con el proveedor: eso lo hace `aiNode.runSmokeTest`.
 */
export const getConfigHealth = query({
  args: {},
  returns: aiConfigReportValidator,
  handler: async (ctx) => {
    await requireTenantAuth(ctx)
    return validateAiConfig()
  },
})
