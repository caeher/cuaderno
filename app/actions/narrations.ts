"use server"

import {
  deleteNarration,
  generatePostNarration,
  getNarrationForPost,
  requireCurrentUser,
  retryPostNarration,
  updateNarrationTranscript,
} from "@/lib/application"
import { checkNarrationServiceStatus } from "@/lib/server/audio-config"
import { recordPlaybackMetric } from "@/lib/server/narration-metrics"
import { revalidateAllPostPaths } from "./utils"

/**
 * Diagnóstico de narración Vapi para el panel. Nunca expone la clave.
 */
export async function getNarrationServiceHealthAction() {
  await requireCurrentUser()
  const status = checkNarrationServiceStatus()
  return {
    enabled: status.enabled,
    isConfigured: status.isConfigured,
    isKillSwitchActive: status.isKillSwitchActive,
    reason: status.reason ?? null,
  }
}

/**
 * Server action to generate or fetch the voice narration for a post.
 * Requires authenticated author session.
 */
export async function generatePostNarrationAction(
  postId: string,
  options?: {
    language?: string
    includeExcerpt?: boolean
  }
) {
  try {
    await requireCurrentUser()

    const result = await generatePostNarration(postId, options)

    if (result.narration) {
      revalidateAllPostPaths()
    }

    return {
      success: result.success,
      narration: result.narration,
      reusedExisting: result.reusedExisting,
      error: result.error,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al iniciar la narración del post."
    return {
      success: false,
      narration: null,
      reusedExisting: false,
      error: message,
    }
  }
}

/**
 * Server action to retry or force regeneration of a failed or outdated narration.
 */
export async function retryPostNarrationAction(
  postId: string,
  options?: {
    language?: string
    includeExcerpt?: boolean
  }
) {
  try {
    await requireCurrentUser()

    const result = await retryPostNarration(postId, options)

    if (result.narration) {
      revalidateAllPostPaths()
    }

    return {
      success: result.success,
      narration: result.narration,
      reusedExisting: result.reusedExisting,
      error: result.error,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al reintentar la narración del post."
    return {
      success: false,
      narration: null,
      reusedExisting: false,
      error: message,
    }
  }
}

/**
 * Server action to update the editable transcript of a narration.
 */
export async function updateNarrationTranscriptAction(
  narrationId: string,
  transcript: string,
  postSlug?: string
) {
  try {
    await requireCurrentUser()
    const updated = await updateNarrationTranscript(narrationId, transcript)

    if (updated) {
      revalidateAllPostPaths(postSlug)
    }

    return { success: true, narration: updated }
  } catch (error) {
    return {
      success: false,
      narration: null,
      error: error instanceof Error ? error.message : "Error al actualizar la transcripción.",
    }
  }
}

/**
 * Server action to fetch the current narration state for a post.
 */
export async function getPostNarrationAction(postId: string) {
  try {
    const narration = await getNarrationForPost(postId)
    return { success: true, narration }
  } catch (error) {
    return {
      success: false,
      narration: null,
      error: error instanceof Error ? error.message : "Error al consultar la narración.",
    }
  }
}

/**
 * Server action to delete a narration and its physical storage file.
 */
export async function deletePostNarrationAction(narrationId: string, postSlug?: string) {
  try {
    await requireCurrentUser()
    const deleted = await deleteNarration(narrationId)

    if (deleted) {
      revalidateAllPostPaths(postSlug)
    }

    return { success: deleted }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar la narración.",
    }
  }
}

/**
 * Records a public playback interaction. No Vapi identifiers are accepted.
 */
export async function recordNarrationPlaybackAction(input: {
  postId: string
  event: "play" | "pause" | "complete" | "seek" | "rate_change"
  playedSeconds: number
  totalDurationSeconds: number
  playbackRate: number
}) {
  if (!input.postId) return { success: false }

  recordPlaybackMetric({
    postId: input.postId,
    event: input.event,
    playedSeconds: Math.max(0, input.playedSeconds),
    totalDurationSeconds: Math.max(0, input.totalDurationSeconds),
    playbackRate: input.playbackRate,
    timestamp: new Date().toISOString(),
  })

  return { success: true }
}

