/**
 * Server-Side Narration Metrics & Instrumentation
 *
 * Provides lightweight, structured telemetry for tracking:
 * 1. Narration job execution duration (ms)
 * 2. Generated audio size (bytes) & duration (seconds)
 * 3. Categorized provider errors (AUTH, TIMEOUT, ARTIFACT_EMPTY, CORRUPTED, STORAGE, CANCELLED)
 * 4. Cache/Idempotency reuse rate
 * 5. Player playback interactions
 */

export type NarrationErrorCategory =
  | "AUTH_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "EMPTY_ARTIFACT"
  | "INVALID_FORMAT"
  | "STORAGE_ERROR"
  | "CLIENT_ABORT"
  | "KILL_SWITCH"
  | "UNKNOWN_ERROR"

export interface NarrationJobMetric {
  postId: string
  tenantId?: string
  action: "create" | "reuse" | "retry" | "delete"
  status: "success" | "failed" | "aborted"
  durationMs: number
  audioSizeBytes?: number
  audioDurationSec?: number
  wordCount?: number
  costUsd?: number
  errorCategory?: NarrationErrorCategory
  errorMessage?: string
  timestamp: string
}

export interface NarrationPlaybackMetric {
  postId: string
  tenantId?: string
  event: "play" | "pause" | "complete" | "seek" | "rate_change"
  playedSeconds: number
  totalDurationSeconds: number
  playbackRate: number
  timestamp: string
}

/**
 * Categorizes an unknown error into a structured NarrationErrorCategory.
 */
export function categorizeNarrationError(error: unknown): NarrationErrorCategory {
  if (!error) return "UNKNOWN_ERROR"

  const message = (error instanceof Error ? error.message : String(error)).toLowerCase()

  if (message.includes("kill switch") || message.includes("deshabilitado")) {
    return "KILL_SWITCH"
  }
  if (message.includes("401") || message.includes("unauthorized") || message.includes("clave privada")) {
    return "AUTH_ERROR"
  }
  if (message.includes("timed out") || message.includes("timeout") || message.includes("tiempo máximo")) {
    return "TIMEOUT"
  }
  if (message.includes("429") || message.includes("rate limit") || message.includes("límite de solicitudes")) {
    return "RATE_LIMIT"
  }
  if (message.includes("vacío") || message.includes("0 bytes") || message.includes("sin artefacto")) {
    return "EMPTY_ARTIFACT"
  }
  if (message.includes("firma válida") || message.includes("content-type") || message.includes("demasiado pequeño")) {
    return "INVALID_FORMAT"
  }
  if (message.includes("storage") || message.includes("almacenamiento")) {
    return "STORAGE_ERROR"
  }
  if (message.includes("abort") || message.includes("cancelada") || message.includes("cancelado")) {
    return "CLIENT_ABORT"
  }

  return "UNKNOWN_ERROR"
}

// In-memory ring buffer for recent metrics (accessible during runtime / test inspection)
const MAX_METRICS_BUFFER = 100
const recentJobMetrics: NarrationJobMetric[] = []
const recentPlaybackMetrics: NarrationPlaybackMetric[] = []

/**
 * Records a narration job execution metric.
 */
export function recordNarrationJobMetric(metric: NarrationJobMetric): void {
  recentJobMetrics.unshift(metric)
  if (recentJobMetrics.length > MAX_METRICS_BUFFER) {
    recentJobMetrics.pop()
  }

  // Structured logging (clean JSON without sensitive tokens)
  const logPrefix = `[NARRATION_METRIC:${metric.action.toUpperCase()}:${metric.status.toUpperCase()}]`
  if (metric.status === "failed") {
    console.warn(logPrefix, JSON.stringify(metric))
  } else {
    console.info(logPrefix, JSON.stringify(metric))
  }
}

/**
 * Records an audio player playback interaction metric.
 */
export function recordPlaybackMetric(metric: NarrationPlaybackMetric): void {
  recentPlaybackMetrics.unshift(metric)
  if (recentPlaybackMetrics.length > MAX_METRICS_BUFFER) {
    recentPlaybackMetrics.pop()
  }
}

/**
 * Retrieves a snapshot of recorded metrics for observability and testing.
 */
export function getNarrationMetricsSnapshot() {
  return {
    recentJobs: [...recentJobMetrics],
    recentPlaybacks: [...recentPlaybackMetrics],
    summary: {
      totalJobsRecorded: recentJobMetrics.length,
      successCount: recentJobMetrics.filter((m) => m.status === "success").length,
      failedCount: recentJobMetrics.filter((m) => m.status === "failed").length,
      reuseCount: recentJobMetrics.filter((m) => m.action === "reuse").length,
    },
  }
}

/**
 * Clears recorded metrics (useful between test runs).
 */
export function clearNarrationMetrics(): void {
  recentJobMetrics.length = 0
  recentPlaybackMetrics.length = 0
}
