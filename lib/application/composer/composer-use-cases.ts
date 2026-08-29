/**
 * Casos de uso de aplicación para Composer (issue #15).
 *
 * Orquesta la interacción con el repositorio de Composer siguiendo la Clean Architecture.
 */

import type {
  ComposerArtifact,
  ComposerArtifactKind,
  ComposerBrief,
  ComposerJob,
  ComposerJobKind,
  ComposerMessage,
  ComposerMessageRole,
  ComposerSession,
  ComposerSessionStatus,
  ComposerSource,
} from "@/lib/domain/entities"
import { computeComposerJobIdempotencyKey } from "@/lib/domain/entities"
import { composerRepository } from "@/lib/infrastructure/repositories"

/**
 * Obtiene los detalles de una sesión de Composer por su identificador.
 */
export async function getComposerSession(
  sessionId: string
): Promise<ComposerSession | null> {
  return composerRepository.findSessionById(sessionId)
}

/**
 * Lista las sesiones de Composer del tenant activo, opcionalmente filtradas por estado.
 */
export async function listTenantComposerSessions(
  tenantId: string,
  status?: ComposerSessionStatus
): Promise<ComposerSession[]> {
  return composerRepository.listSessionsByTenant(tenantId, status)
}

/**
 * Crea una nueva sesión de investigación y redacción en Composer.
 */
export async function createComposerSession(
  brief?: Partial<ComposerBrief>
): Promise<ComposerSession> {
  return composerRepository.createSession(brief)
}

/**
 * Actualiza las preferencias editoriales (brief) de una sesión en curso.
 */
export async function updateComposerBrief(
  sessionId: string,
  brief: Partial<ComposerBrief>
): Promise<void> {
  return composerRepository.updateBrief(sessionId, brief)
}

/**
 * Cancela una sesión activa y propaga la cancelación a todos sus jobs en curso o encolados.
 */
export async function cancelComposerSession(sessionId: string): Promise<void> {
  return composerRepository.cancelSession(sessionId)
}

/**
 * Obtiene el historial de mensajes de una sesión de Composer.
 */
export async function getComposerSessionMessages(
  sessionId: string
): Promise<ComposerMessage[]> {
  return composerRepository.listMessagesBySession(sessionId)
}

/**
 * Registra un nuevo mensaje en la conversación de Composer.
 */
export async function appendComposerMessage(
  sessionId: string,
  role: ComposerMessageRole,
  content: string
): Promise<string> {
  return composerRepository.appendMessage(sessionId, role, content)
}

/**
 * Obtiene los trabajos asíncronos asociados a la sesión.
 */
export async function getComposerSessionJobs(
  sessionId: string
): Promise<ComposerJob[]> {
  return composerRepository.listJobsBySession(sessionId)
}

/**
 * Encola un nuevo trabajo de Composer asegurando idempotencia.
 */
export async function enqueueComposerJob(
  sessionId: string,
  kind: ComposerJobKind,
  customIdempotencyKey?: string
): Promise<string> {
  const idempotencyKey =
    customIdempotencyKey || computeComposerJobIdempotencyKey(sessionId, kind)
  return composerRepository.enqueueJob(sessionId, kind, idempotencyKey)
}

/**
 * Encola la investigación web de Composer.
 */
export async function enqueueComposerResearchJob(
  sessionId: string,
  customIdempotencyKey?: string
): Promise<string> {
  return enqueueComposerJob(sessionId, "research", customIdempotencyKey)
}

/**
 * Encola la generación del esquema editorial (Outline).
 */
export async function enqueueComposerOutlineJob(
  sessionId: string,
  customIdempotencyKey?: string
): Promise<string> {
  return enqueueComposerJob(sessionId, "outline", customIdempotencyKey)
}

/**
 * Encola la redacción del borrador del artículo de blog.
 */
export async function enqueueComposerDraftJob(
  sessionId: string,
  customIdempotencyKey?: string
): Promise<string> {
  return enqueueComposerJob(sessionId, "article", customIdempotencyKey)
}

/**
 * Encola la generación de imagen de portada para el artículo.
 */
export async function enqueueComposerImageJob(
  sessionId: string,
  customIdempotencyKey?: string
): Promise<string> {
  return enqueueComposerJob(sessionId, "image", customIdempotencyKey)
}

/**
 * Obtiene las fuentes consultadas y verificadas de la sesión.
 */
export async function getComposerSessionSources(
  sessionId: string
): Promise<ComposerSource[]> {
  return composerRepository.listSourcesBySession(sessionId)
}

/**
 * Marca una fuente como excluida o incluida en la sesión para el brief.
 */
export async function toggleComposerSourceExclusion(
  sessionId: string,
  sourceId: string,
  isExcluded: boolean
): Promise<void> {
  return composerRepository.toggleSourceExclusion(sessionId, sourceId, isExcluded)
}

/**
 * Obtiene los artefactos vigentes generados en la sesión.
 */
export async function getComposerSessionArtifacts(
  sessionId: string,
  kind?: ComposerArtifactKind
): Promise<ComposerArtifact[]> {
  return composerRepository.listArtifactsBySession(sessionId, kind)
}

/**
 * Transfiere los artefactos de la sesión a un post en estado 'draft' en la tabla posts.
 */
export async function createDraftFromComposerSession(
  sessionId: string
): Promise<string> {
  return composerRepository.createDraftFromSession(sessionId)
}

/**
 * Obtiene la telemetría y coste acumulado de una sesión de Composer.
 */
export async function getComposerSessionUsage(
  sessionId: string
): Promise<{
  events: any[]
  totalEstimatedCostUsd: number
  totalInputTokens: number
  totalOutputTokens: number
  totalImageCount: number
  totalToolCalls: number
}> {
  return composerRepository.getSessionUsage(sessionId)
}

