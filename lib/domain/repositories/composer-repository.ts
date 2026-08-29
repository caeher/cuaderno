/**
 * Interfaz de repositorio de dominio para Composer (issue #15).
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
} from "../entities"

export interface ComposerRepository {
  /**
   * Obtiene una sesión por su ID.
   */
  findSessionById(id: string): Promise<ComposerSession | null>

  /**
   * Lista sesiones de Composer pertenecientes al tenant activo.
   */
  listSessionsByTenant(
    tenantId: string,
    status?: ComposerSessionStatus
  ): Promise<ComposerSession[]>

  /**
   * Crea una nueva sesión de Composer en estado "collecting".
   */
  createSession(brief?: Partial<ComposerBrief>): Promise<ComposerSession>

  /**
   * Actualiza el brief editorial de una sesión en curso.
   */
  updateBrief(sessionId: string, brief: Partial<ComposerBrief>): Promise<void>

  /**
   * Cancela una sesión activa y propaga la cancelación a sus jobs en ejecución.
   */
  cancelSession(sessionId: string): Promise<void>

  /**
   * Obtiene los mensajes ordenados cronológicamente de una sesión.
   */
  listMessagesBySession(sessionId: string): Promise<ComposerMessage[]>

  /**
   * Agrega un nuevo turno de mensaje a la sesión.
   */
  appendMessage(
    sessionId: string,
    role: ComposerMessageRole,
    content: string
  ): Promise<string>

  /**
   * Lista todos los jobs asociados a una sesión.
   */
  listJobsBySession(sessionId: string): Promise<ComposerJob[]>

  /**
   * Encola un nuevo job de forma idempotente por su idempotencyKey.
   */
  enqueueJob(
    sessionId: string,
    kind: ComposerJobKind,
    idempotencyKey: string
  ): Promise<string>

  /**
   * Lista las fuentes verificadas de una sesión.
   */
  listSourcesBySession(sessionId: string): Promise<ComposerSource[]>

  /**
   * Marca una fuente como excluida o incluida para la sesión actual.
   */
  toggleSourceExclusion(
    sessionId: string,
    sourceId: string,
    isExcluded: boolean
  ): Promise<void>

  /**
   * Lista los artefactos vigentes (no superados) o filtrados por tipo de una sesión.
   */
  listArtifactsBySession(
    sessionId: string,
    kind?: ComposerArtifactKind
  ): Promise<ComposerArtifact[]>

  /**
   * Realiza el handoff convirtiendo los artefactos vigentes en un post en estado 'draft'.
   */
  createDraftFromSession(sessionId: string): Promise<string>

  /**
   * Obtiene la telemetría y coste acumulado de una sesión de Composer.
   */
  getSessionUsage(sessionId: string): Promise<{
    events: any[]
    totalEstimatedCostUsd: number
    totalInputTokens: number
    totalOutputTokens: number
    totalImageCount: number
    totalToolCalls: number
  }>
}
