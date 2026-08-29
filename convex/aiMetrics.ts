/**
 * Agregación y telemetría de observabilidad de Composer — Issue #20.
 *
 * Proporciona consultas de soporte, auditoría de costes y métricas operativas:
 * - Tasas de éxito, fallo, moderación y rechazos por fase.
 * - Atribución de costes por tenant, sesión y job.
 * - Duración y latencia por fase.
 * - Tasas de conversión a borrador (draft).
 * - Desglose de errores del proveedor.
 *
 * Invariante: El acceso a métricas globales requiere autenticación de tenant.
 */

import { v } from "convex/values"
import { query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { requireTenantAuth } from "./lib/auth"

export interface PhaseMetrics {
  totalEvents: number
  succeeded: number
  failed: number
  moderated: number
  refused: number
  totalCostUsd: number
  totalInputTokens: number
  totalOutputTokens: number
  totalImageCount: number
  totalToolCalls: number
}

/**
 * Resumen consolidado de métricas operativas de IA.
 * Permite filtrar por tenant o consultar los del tenant activo.
 */
export const getMetricsSummary = query({
  args: {
    tenantId: v.optional(v.string()),
    sinceIso: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)
    const targetTenantId = args.tenantId || identity.tenantId

    // Consulta de eventos de uso indexados por tenant
    const events = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_tenant", (q) => q.eq("tenantId", targetTenantId))
      .collect()

    const filteredEvents = args.sinceIso
      ? events.filter((e: Doc<"aiUsageEvents">) => e.createdAt >= args.sinceIso!)
      : events

    const phaseStats: Record<string, PhaseMetrics> = {
      research: createEmptyPhaseMetrics(),
      outline: createEmptyPhaseMetrics(),
      writing: createEmptyPhaseMetrics(),
      image: createEmptyPhaseMetrics(),
    }

    let totalCostUsd = 0
    let totalInputTokens = 0
    let totalOutputTokens = 0
    let totalImageCount = 0
    let totalToolCalls = 0
    let succeededCount = 0
    let failedCount = 0
    let moderatedCount = 0
    let refusedCount = 0

    for (const e of filteredEvents) {
      const phase = e.phase || "writing"
      if (!phaseStats[phase]) {
        phaseStats[phase] = createEmptyPhaseMetrics()
      }

      const cost = e.actualCostUsd ?? e.estimatedCostUsd ?? 0
      const inTokens = e.inputTokens ?? 0
      const outTokens = e.outputTokens ?? 0
      const imgCount = e.imageCount ?? 0
      const tools = e.toolCalls ?? 0

      totalCostUsd += cost
      totalInputTokens += inTokens
      totalOutputTokens += outTokens
      totalImageCount += imgCount
      totalToolCalls += tools

      phaseStats[phase].totalEvents += 1
      phaseStats[phase].totalCostUsd += cost
      phaseStats[phase].totalInputTokens += inTokens
      phaseStats[phase].totalOutputTokens += outTokens
      phaseStats[phase].totalImageCount += imgCount
      phaseStats[phase].totalToolCalls += tools

      if (e.status === "succeeded") {
        succeededCount += 1
        phaseStats[phase].succeeded += 1
      } else if (e.status === "moderated") {
        moderatedCount += 1
        phaseStats[phase].moderated += 1
      } else if (e.status === "refused") {
        refusedCount += 1
        phaseStats[phase].refused += 1
      } else {
        failedCount += 1
        phaseStats[phase].failed += 1
      }
    }

    const totalEvents = filteredEvents.length
    const successRate = totalEvents > 0 ? (succeededCount / totalEvents) * 100 : 100
    const failureRate = totalEvents > 0 ? (failedCount / totalEvents) * 100 : 0

    return {
      tenantId: targetTenantId,
      totalEvents,
      successRate: Math.round(successRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      succeededCount,
      failedCount,
      moderatedCount,
      refusedCount,
      totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
      totalInputTokens,
      totalOutputTokens,
      totalImageCount,
      totalToolCalls,
      phaseBreakdown: phaseStats,
    }
  },
})

/**
 * Atribución detallada de costes por sesión y job para auditoría.
 */
export const getCostAttribution = query({
  args: {
    sessionId: v.optional(v.id("composerSessions")),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx)

    const events = args.sessionId
      ? await ctx.db
          .query("aiUsageEvents")
          .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
          .collect()
      : await ctx.db
          .query("aiUsageEvents")
          .withIndex("by_tenant", (q) => q.eq("tenantId", identity.tenantId))
          .collect()

    const tenantEvents = events.filter((e: Doc<"aiUsageEvents">) => e.tenantId === identity.tenantId)

    const sessionCostMap: Record<string, { totalCostUsd: number; phases: Record<string, number>; eventCount: number }> = {}

    for (const e of tenantEvents) {
      const sId = e.sessionId ? String(e.sessionId) : "unassigned"
      if (!sessionCostMap[sId]) {
        sessionCostMap[sId] = { totalCostUsd: 0, phases: {}, eventCount: 0 }
      }

      const cost = e.actualCostUsd ?? e.estimatedCostUsd ?? 0
      sessionCostMap[sId].totalCostUsd += cost
      sessionCostMap[sId].eventCount += 1
      sessionCostMap[sId].phases[e.phase] = (sessionCostMap[sId].phases[e.phase] || 0) + cost
    }

    return {
      tenantId: identity.tenantId,
      totalAttributedCostUsd:
        Math.round(
          tenantEvents.reduce((acc, e) => acc + (e.actualCostUsd ?? e.estimatedCostUsd ?? 0), 0) *
            1_000_000
        ) / 1_000_000,
      sessions: sessionCostMap,
      eventCount: tenantEvents.length,
    }
  },
})

/**
 * Medición de latencia y duración media de los jobs por fase.
 */
export const getPerformanceLatency = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx)

    const sessions = await ctx.db
      .query("composerSessions")
      .withIndex("by_tenant", (q) => q.eq("tenantId", identity.tenantId))
      .collect()

    const sessionIds = new Set(sessions.map((s: Doc<"composerSessions">) => s._id))

    const phaseLatencies: Record<string, { totalSeconds: number; count: number; avgSeconds: number; minSeconds: number; maxSeconds: number }> = {
      research: { totalSeconds: 0, count: 0, avgSeconds: 0, minSeconds: Infinity, maxSeconds: 0 },
      outline: { totalSeconds: 0, count: 0, avgSeconds: 0, minSeconds: Infinity, maxSeconds: 0 },
      article: { totalSeconds: 0, count: 0, avgSeconds: 0, minSeconds: Infinity, maxSeconds: 0 },
      image: { totalSeconds: 0, count: 0, avgSeconds: 0, minSeconds: Infinity, maxSeconds: 0 },
    }

    for (const sessionId of sessionIds) {
      const jobs = await ctx.db
        .query("composerJobs")
        .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
        .collect()

      for (const job of jobs) {
        if (job.startedAt && job.finishedAt && job.status === "succeeded") {
          const startMs = new Date(job.startedAt).getTime()
          const finishMs = new Date(job.finishedAt).getTime()
          const durationSec = Math.max(0, (finishMs - startMs) / 1000)

          const kind = job.kind || "article"
          if (!phaseLatencies[kind]) {
            phaseLatencies[kind] = { totalSeconds: 0, count: 0, avgSeconds: 0, minSeconds: Infinity, maxSeconds: 0 }
          }

          phaseLatencies[kind].totalSeconds += durationSec
          phaseLatencies[kind].count += 1
          phaseLatencies[kind].minSeconds = Math.min(phaseLatencies[kind].minSeconds, durationSec)
          phaseLatencies[kind].maxSeconds = Math.max(phaseLatencies[kind].maxSeconds, durationSec)
        }
      }
    }

    for (const key of Object.keys(phaseLatencies)) {
      const p = phaseLatencies[key]
      if (p.count > 0) {
        p.avgSeconds = Math.round((p.totalSeconds / p.count) * 10) / 10
        if (p.minSeconds === Infinity) p.minSeconds = 0
      } else {
        p.minSeconds = 0
      }
    }

    return phaseLatencies
  },
})

/**
 * Tasa de conversión de sesiones de Composer a posts en estado 'draft'.
 */
export const getConversionStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx)

    const sessions = await ctx.db
      .query("composerSessions")
      .withIndex("by_tenant", (q) => q.eq("tenantId", identity.tenantId))
      .collect()

    const totalSessions = sessions.length
    const terminalSessions = sessions.filter(
      (s: Doc<"composerSessions">) => s.status === "awaiting_review" || s.status === "failed" || s.status === "cancelled"
    ).length
    const convertedToDraft = sessions.filter((s: Doc<"composerSessions">) => Boolean(s.postId)).length
    const awaitingReviewCount = sessions.filter((s: Doc<"composerSessions">) => s.status === "awaiting_review").length

    const conversionRate =
      awaitingReviewCount + convertedToDraft > 0
        ? (convertedToDraft / (awaitingReviewCount + convertedToDraft)) * 100
        : 0

    return {
      totalSessions,
      terminalSessions,
      convertedToDraft,
      awaitingReviewCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
    }
  },
})

function createEmptyPhaseMetrics(): PhaseMetrics {
  return {
    totalEvents: 0,
    succeeded: 0,
    failed: 0,
    moderated: 0,
    refused: 0,
    totalCostUsd: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalImageCount: 0,
    totalToolCalls: 0,
  }
}
