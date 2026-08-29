"use server"

import {
  appendComposerMessage,
  cancelComposerSession,
  createComposerSession,
  createDraftFromComposerSession,
  enqueueComposerDraftJob,
  enqueueComposerImageJob,
  enqueueComposerOutlineJob,
  enqueueComposerResearchJob,
  getComposerSession,
  getComposerSessionUsage,
  requireCurrentUser,
  toggleComposerSourceExclusion,
  updateComposerBrief,
} from "@/lib/application"
import type { ComposerBrief, ComposerMessageRole } from "@/lib/domain/entities"
import { revalidateAllPostPaths } from "./utils"

/**
 * Server action para inicializar una nueva sesión de investigación y redacción en Composer.
 */
export async function startComposerSessionAction(brief?: Partial<ComposerBrief>) {
  try {
    await requireCurrentUser()
    const session = await createComposerSession(brief)
    return { success: true, session, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al iniciar la sesión de Composer."
    return { success: false, session: null, error: message }
  }
}

/**
 * Server action para actualizar las preferencias editoriales de la sesión.
 */
export async function updateComposerBriefAction(
  sessionId: string,
  brief: Partial<ComposerBrief>
) {
  try {
    await requireCurrentUser()
    await updateComposerBrief(sessionId, brief)
    return { success: true, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar las preferencias editoriales."
    return { success: false, error: message }
  }
}

/**
 * Server action para enviar un mensaje en la conversación guiada.
 */
export async function appendComposerMessageAction(
  sessionId: string,
  role: ComposerMessageRole,
  content: string
) {
  try {
    await requireCurrentUser()
    const messageId = await appendComposerMessage(sessionId, role, content)
    return { success: true, messageId, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al enviar el mensaje."
    return { success: false, messageId: null, error: message }
  }
}

/**
 * Server action para lanzar la investigación web.
 */
export async function launchResearchJobAction(sessionId: string) {
  try {
    await requireCurrentUser()
    const jobId = await enqueueComposerResearchJob(sessionId)
    return { success: true, jobId, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al iniciar la investigación."
    return { success: false, jobId: null, error: message }
  }
}

/**
 * Server action para lanzar la generación del esquema editorial (Outline).
 */
export async function launchOutlineJobAction(sessionId: string) {
  try {
    await requireCurrentUser()
    const jobId = await enqueueComposerOutlineJob(sessionId)
    return { success: true, jobId, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al generar el esquema."
    return { success: false, jobId: null, error: message }
  }
}

/**
 * Server action para lanzar la redacción del borrador completo.
 */
export async function launchDraftingJobAction(sessionId: string) {
  try {
    await requireCurrentUser()
    const jobId = await enqueueComposerDraftJob(sessionId)
    return { success: true, jobId, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al iniciar la redacción del borrador."
    return { success: false, jobId: null, error: message }
  }
}

/**
 * Server action para lanzar la generación de imagen de portada.
 */
export async function launchImageJobAction(sessionId: string) {
  try {
    await requireCurrentUser()
    const jobId = await enqueueComposerImageJob(sessionId)
    return { success: true, jobId, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al iniciar la generación de la portada."
    return { success: false, jobId: null, error: message }
  }
}

/**
 * Server action para excluir o incluir una fuente en la sesión.
 */
export async function toggleSourceExclusionAction(
  sessionId: string,
  sourceId: string,
  isExcluded: boolean
) {
  try {
    await requireCurrentUser()
    await toggleComposerSourceExclusion(sessionId, sourceId, isExcluded)
    return { success: true, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al modificar la fuente."
    return { success: false, error: message }
  }
}

/**
 * Server action para cancelar una sesión activa y sus trabajos en curso.
 */
export async function cancelComposerSessionAction(sessionId: string) {
  try {
    await requireCurrentUser()
    await cancelComposerSession(sessionId)
    return { success: true, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cancelar la sesión."
    return { success: false, error: message }
  }
}

/**
 * Server action para realizar el handoff de Composer creando un post estrictamente en estado 'draft'.
 */
export async function createDraftFromComposerSessionAction(sessionId: string) {
  try {
    await requireCurrentUser()
    const postId = await createDraftFromComposerSession(sessionId)
    revalidateAllPostPaths()
    return { success: true, postId, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear el borrador en el editor."
    return { success: false, postId: null, error: message }
  }
}

/**
 * Server action para consultar la telemetría y costes de la sesión.
 */
export async function getComposerSessionUsageAction(sessionId: string) {
  try {
    await requireCurrentUser()
    const usage = await getComposerSessionUsage(sessionId)
    return { success: true, usage, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al consultar el consumo."
    return { success: false, usage: null, error: message }
  }
}

/**
 * Server action para recuperar detalles de la sesión.
 */
export async function getComposerSessionAction(sessionId: string) {
  try {
    await requireCurrentUser()
    const session = await getComposerSession(sessionId)
    return { success: true, session, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al recuperar la sesión."
    return { success: false, session: null, error: message }
  }
}
