/**
 * Server-Side Post Narration Job Runner
 *
 * Orchestrates the full lifecycle of turning approved blog post content into
 * an authenticated, persistent, and validated Vapi voice narration.
 *
 * Guarantees:
 * 1. Post Immutability: The source post in `posts` table is STRICTLY READ-ONLY.
 *    No failure, timeout, or success alters the post content, status, or timestamps.
 * 2. Idempotency & Concurrency: Retrying or parallel calls with the same text snapshot
 *    reuse existing ready/generating jobs without spawning duplicate Vapi calls.
 * 3. Security & Isolation: Vapi private credentials and temporary signed URLs remain
 *    strictly on the server. Audio files are validated and stored in own Convex Storage.
 * 4. Privacy: Only validated "ready" audio is exposed publicly. Errors and debug IDs
 *    are sanitized for the author only.
 */

import { api } from "@/convex/_generated/api"
import type { PostNarration } from "@/lib/domain/entities"
import {
  computeNarrationIdempotencyKey,
  computePostContentHash,
} from "@/lib/domain/entities"
import {
  narrationRepository,
  postRepository,
} from "@/lib/infrastructure/repositories"
import { convexMutation } from "@/lib/infrastructure/convex/client"
import { checkNarrationServiceStatus, getAudioServerConfig } from "./audio-config"
import { cleanPostToSpeechScript } from "./speech-script-sanitizer"
import { validateAudioBuffer } from "./audio-validator"
import {
  categorizeNarrationError,
  recordNarrationJobMetric,
} from "./narration-metrics"
import { sanitizeVapiErrorMessage, synthesizeNarrationWithVapi } from "./vapi-client"

export interface ExecuteNarrationJobOptions {
  language?: string
  voice?: string
  includeExcerpt?: boolean
  systemPrompt?: string
  signal?: AbortSignal
  forceRegenerate?: boolean
}

export interface NarrationJobExecutionResult {
  success: boolean
  narration: PostNarration | null
  reusedExisting: boolean
  isOutdated: boolean
  error?: string
}

/**
 * Uploads an ArrayBuffer of audio to Convex Storage via an authorized upload URL.
 */
async function uploadAudioBufferToConvexStorage(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  // 1. Obtain authorized upload URL from Convex
  const uploadUrl = await convexMutation(api.narrations.generateUploadUrl, {})
  if (!uploadUrl) {
    throw new Error("No se pudo obtener la URL de subida para Convex Storage.")
  }

  // 2. Upload the binary blob to Convex Storage
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": mimeType,
    },
    body: buffer,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(
      `Fallo al subir el archivo de audio a Convex Storage (HTTP ${response.status}): ${errorText}`
    )
  }

  const { storageId } = (await response.json()) as { storageId: string }
  if (!storageId) {
    throw new Error("Convex Storage no retornó un storageId válido.")
  }

  return storageId
}

/**
 * Executes the complete server-side job to synthesize, validate, and persist post narration.
 */
export async function executePostNarrationJob(
  postId: string,
  options?: ExecuteNarrationJobOptions
): Promise<NarrationJobExecutionResult> {
  const startTime = Date.now()

  // 0. STEP: Verify Global Feature Flag & Kill Switch Status
  const serviceStatus = checkNarrationServiceStatus()
  if (!serviceStatus.enabled) {
    const errorMsg =
      serviceStatus.reason ||
      "El servicio de narración no está disponible en este momento."

    recordNarrationJobMetric({
      postId,
      action: options?.forceRegenerate ? "retry" : "create",
      status: "failed",
      durationMs: Date.now() - startTime,
      errorCategory: serviceStatus.isKillSwitchActive ? "KILL_SWITCH" : "AUTH_ERROR",
      errorMessage: errorMsg,
      timestamp: new Date().toISOString(),
    })

    return {
      success: false,
      narration: null,
      reusedExisting: false,
      isOutdated: false,
      error: errorMsg,
    }
  }

  const config = getAudioServerConfig()

  // 1. STEP: Load and validate source post (READ-ONLY)
  const post = await postRepository.findById(postId)
  if (!post) {
    return {
      success: false,
      narration: null,
      reusedExisting: false,
      isOutdated: false,
      error: `La publicación con ID "${postId}" no existe.`,
    }
  }

  // 2. STEP: Sanitize editorial content into a clean voice script
  const language = options?.language || config.defaultLanguage || "es"
  const scriptResult = cleanPostToSpeechScript(
    post.title,
    post.content,
    options?.includeExcerpt !== false ? post.excerpt : undefined,
    { language }
  )

  if (!scriptResult.speechScript || scriptResult.wordCount === 0) {
    return {
      success: false,
      narration: null,
      reusedExisting: false,
      isOutdated: false,
      error: "La publicación no contiene texto editorial suficiente para generar una narración.",
    }
  }

  // 3. STEP: Calculate deterministic content hash & idempotency key
  const contentHash = computePostContentHash(post.title, scriptResult.speechScript, language)
  const idempotencyKey = computeNarrationIdempotencyKey(post.id, contentHash)

  // 4. STEP: Idempotency & Deduplication Check
  const existingNarration =
    (await narrationRepository.findByIdempotencyKey(idempotencyKey)) ||
    (await narrationRepository.findByPostId(post.id))

  if (existingNarration && !options?.forceRegenerate) {
    const isMatchingHash = existingNarration.contentHash === contentHash

    // If already generated and ready with valid storage -> reuse immediately
    if (isMatchingHash && existingNarration.status === "ready" && existingNarration.storageId) {
      recordNarrationJobMetric({
        postId: post.id,
        tenantId: post.organizationId || post.authorId,
        action: "reuse",
        status: "success",
        durationMs: Date.now() - startTime,
        audioSizeBytes: existingNarration.fileSizeBytes,
        audioDurationSec: existingNarration.duration,
        wordCount: scriptResult.wordCount,
        timestamp: new Date().toISOString(),
      })

      return {
        success: true,
        narration: existingNarration,
        reusedExisting: true,
        isOutdated: false,
      }
    }

    // If already generating in progress within last 2 minutes -> avoid duplicate Vapi call
    if (isMatchingHash && existingNarration.status === "generating") {
      const lastUpdate = new Date(existingNarration.updatedAt).getTime()
      const isRecentlyStarted = Date.now() - lastUpdate < 120000 // 2 minutes lock window
      if (isRecentlyStarted) {
        recordNarrationJobMetric({
          postId: post.id,
          tenantId: post.organizationId || post.authorId,
          action: "reuse",
          status: "success",
          durationMs: Date.now() - startTime,
          wordCount: scriptResult.wordCount,
          timestamp: new Date().toISOString(),
        })

        return {
          success: true,
          narration: existingNarration,
          reusedExisting: true,
          isOutdated: false,
        }
      }
    }
  }

  // 5. STEP: Persist/Lock Job in "generating" state
  let narrationRecord: PostNarration

  if (existingNarration) {
    const updated = await narrationRepository.update(existingNarration.id, {
      status: "generating",
      transcript: scriptResult.speechScript,
      contentHash,
      idempotencyKey,
      language,
      voice: config.defaultVoiceId,
      format: config.defaultFormat,
      error: undefined,
    })
    narrationRecord = updated || existingNarration
  } else {
    narrationRecord = await narrationRepository.create({
      postId: post.id,
      authorId: post.authorId,
      tenantId: post.organizationId || post.authorId,
      organizationId: post.organizationId,
      transcript: scriptResult.speechScript,
      contentHash,
      idempotencyKey,
      language,
      voice: config.defaultVoiceId,
      format: config.defaultFormat,
      status: "generating",
    })
  }

  // 6. STEP: Execute Vapi Call & Artifact Download Pipeline
  let uploadedStorageId: string | undefined = undefined

  try {
    // 6a. Verify configuration
    if (!config.isConfigured || !config.vapiApiKey) {
      throw new Error(
        "VAPI_PRIVATE_API_KEY no está configurada en las variables de entorno del servidor."
      )
    }

    // Check for early abort before starting call
    if (options?.signal?.aborted) {
      throw new Error("La operación de generación de audio fue cancelada antes de iniciar.")
    }

    // 6b. Synthesize via Vapi WebSocket transport (fallback: assistant-recording)
    const synthesis = await synthesizeNarrationWithVapi(scriptResult.speechScript, config, {
      systemPrompt: options?.systemPrompt,
      signal: options?.signal,
    })

    await narrationRepository.update(narrationRecord.id, {
      vapiCallId: synthesis.callId,
    })

    // 6c. Validate audio buffer (size, MIME, magic bytes, container)
    const validation = validateAudioBuffer(synthesis.buffer, {
      declaredContentType: synthesis.contentType,
      minSizeBytes: config.minSizeBytes,
      maxSizeBytes: config.maxSizeBytes,
      reportedDurationSeconds: synthesis.durationSeconds,
    })

    if (!validation.isValid) {
      throw new Error(validation.error || "El archivo de audio descargado no superó la validación.")
    }

    // 6d. Ingest verified audio buffer into Convex Storage
    uploadedStorageId = await uploadAudioBufferToConvexStorage(
      synthesis.buffer,
      validation.mimeType
    )

    // 6e. Atomically update narration to "ready"
    const readyNarration = await narrationRepository.update(narrationRecord.id, {
      status: "ready",
      storageId: uploadedStorageId,
      duration: validation.estimatedDurationSeconds || synthesis.durationSeconds || 1,
      fileSizeBytes: validation.sizeBytes,
      mimeType: validation.mimeType,
      format: validation.format,
      endedReason: synthesis.endedReason,
      generationMetadata: {
        provider: config.defaultVoiceProvider,
        voiceId: config.defaultVoiceId,
        costUsd: synthesis.cost,
        durationSeconds: synthesis.durationSeconds,
        wordCount: scriptResult.wordCount,
        vapiCallId: synthesis.callId,
        source: synthesis.source,
      },
      error: undefined,
      approvedAt: new Date().toISOString(),
    })

    recordNarrationJobMetric({
      postId: post.id,
      tenantId: post.organizationId || post.authorId,
      action: options?.forceRegenerate ? "retry" : "create",
      status: "success",
      durationMs: Date.now() - startTime,
      audioSizeBytes: validation.sizeBytes,
      audioDurationSec: validation.estimatedDurationSeconds || synthesis.durationSeconds,
      wordCount: scriptResult.wordCount,
      costUsd: synthesis.cost,
      timestamp: new Date().toISOString(),
    })

    return {
      success: true,
      narration: readyNarration,
      reusedExisting: false,
      isOutdated: false,
    }
  } catch (error) {
    // 7. STEP: Error Handling & Failure Isolation
    const sanitizedError = sanitizeVapiErrorMessage(error)
    const errorCategory = categorizeNarrationError(error)

    // Clean up partial storage upload if it occurred before failure
    if (uploadedStorageId) {
      try {
        await narrationRepository.deleteStorageBlob(uploadedStorageId)
      } catch {
        // ignore storage cleanup failure on error path
      }
    }

    // Mark narration status as failed with clean user-facing error message
    const failedNarration = await narrationRepository.update(narrationRecord.id, {
      status: "failed",
      error: sanitizedError,
    })

    // Record Failure Metric
    recordNarrationJobMetric({
      postId: post.id,
      tenantId: post.organizationId || post.authorId,
      action: options?.forceRegenerate ? "retry" : "create",
      status: errorCategory === "CLIENT_ABORT" ? "aborted" : "failed",
      durationMs: Date.now() - startTime,
      errorCategory,
      errorMessage: sanitizedError,
      timestamp: new Date().toISOString(),
    })

    // INVARIANT: Source post is NEVER touched or modified
    return {
      success: false,
      narration: failedNarration,
      reusedExisting: false,
      isOutdated: false,
      error: sanitizedError,
    }
  }
}
