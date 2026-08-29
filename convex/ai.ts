/**
 * Superficie pública de la plataforma de IA — issue #14.
 *
 * El health check no gasta tokens. Las llamadas al proveedor viven en `aiNode.ts`.
 */

import { v } from "convex/values"

import { query } from "./_generated/server"
import { getTenantIdentity } from "./lib/auth"
import { isComposerEnabledForTenant, validateAiConfig } from "./lib/ai/config"

const aiConfigReportValidator = v.object({
  ok: v.boolean(),
  hasApiKey: v.boolean(),
  composerEnabled: v.boolean(),
  killSwitchActive: v.boolean(),
  allowedTenants: v.array(v.string()),
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
  searchContextSize: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high")
  ),
  maxResearchQueries: v.number(),
  availableForCurrentTenant: v.boolean(),
  problems: v.array(v.string()),
})

/**
 * Reporta si la plataforma de IA está bien configurada.
 *
 * Si no hay sesión activa, devuelve availableForCurrentTenant: false de forma segura sin lanzar error.
 * Nunca devuelve la clave — `validateAiConfig` solo informa si
 * existe. No confirma conectividad con el proveedor: eso lo hace `aiNode.runSmokeTest`.
 */
export const getConfigHealth = query({
  args: {},
  returns: aiConfigReportValidator,
  handler: async (ctx) => {
    const identity = await getTenantIdentity(ctx)
    const report = validateAiConfig()
    return {
      ...report,
      availableForCurrentTenant:
        identity.isAuthenticated && identity.tenantId
          ? isComposerEnabledForTenant(identity.tenantId)
          : false,
    }
  },
})
