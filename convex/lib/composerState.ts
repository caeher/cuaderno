/**
 * Máquina de estados de Composer — issue #15.
 *
 * Vive dentro de `convex/lib/` a propósito: las transiciones se validan en las
 * mutations, no en las actions. Una action reporta lo que consiguió; la mutation
 * decide si esa transición es legal. Sin esa separación, dos jobs que terminan a
 * destiempo pueden dejar la sesión en un estado imposible — por ejemplo el job de
 * imágenes cerrando la sesión mientras el de research todavía escribe fuentes.
 *
 * Es lógica pura y sin I/O: se puede razonar y probar sin base de datos.
 *
 * El archivo se llama `composerState` (sin guion) porque Convex solo admite
 * componentes de ruta alfanuméricos, guiones bajos o puntos.
 */

export type ComposerSessionStatus =
  | "collecting"
  | "awaiting_confirmation"
  | "researching"
  | "drafting"
  | "imaging"
  | "awaiting_review"
  | "failed"
  | "cancelled"

/** Estados desde los que ya no sale ninguna transición. */
export const TERMINAL_STATUSES: readonly ComposerSessionStatus[] = [
  "awaiting_review",
  "failed",
  "cancelled",
]

export type ComposerJobKind =
  | "research"
  | "outline"
  | "article"
  | "image"
  | "moderation"

/**
 * Transiciones legales.
 *
 * Tras research la sesión vuelve a `awaiting_confirmation` para que el usuario
 * revise fuentes antes de pagar la redacción. `awaiting_confirmation -> drafting`
 * es esa confirmación. `drafting -> awaiting_review` existe además de
 * `drafting -> imaging` porque la portada es opcional.
 */
const TRANSITIONS: Record<ComposerSessionStatus, readonly ComposerSessionStatus[]> = {
  collecting: ["awaiting_confirmation", "cancelled", "failed"],
  awaiting_confirmation: ["collecting", "researching", "drafting", "cancelled", "failed"],
  researching: ["awaiting_confirmation", "drafting", "failed", "cancelled"],
  drafting: ["imaging", "awaiting_review", "failed", "cancelled"],
  imaging: ["awaiting_review", "failed", "cancelled"],
  awaiting_review: [],
  failed: [],
  cancelled: [],
}

export function isTerminalStatus(status: ComposerSessionStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

export function canTransition(
  from: ComposerSessionStatus,
  to: ComposerSessionStatus
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Valida una transición y lanza con un mensaje accionable si es ilegal.
 *
 * El mensaje nombra los estados concretos porque este error puede llegar a un log de
 * producción sin más contexto que su texto.
 */
export function assertTransition(
  from: ComposerSessionStatus,
  to: ComposerSessionStatus
): void {
  if (from === to) return

  if (!canTransition(from, to)) {
    const permitidos = TRANSITIONS[from]
    const detalle = permitidos?.length
      ? `Desde "${from}" solo se permite: ${permitidos.join(", ")}.`
      : `"${from}" es un estado terminal y no admite transiciones.`

    throw new Error(`Transición de Composer inválida: "${from}" -> "${to}". ${detalle}`)
  }
}

/** Estado al que debe pasar `drafting` según si el usuario pidió portada. */
export function nextAfterDrafting(wantsCoverImage: boolean | undefined): ComposerSessionStatus {
  return wantsCoverImage === false ? "awaiting_review" : "imaging"
}

/** Tras research con fuentes: el usuario revisa y confirma antes de redactar. */
export function nextAfterSuccessfulResearch(): ComposerSessionStatus {
  return "awaiting_confirmation"
}

/**
 * Cadena de transiciones que aplica `enqueueJob` al lanzar un trabajo de pago.
 * Vacía si el estado actual ya admite ese job (reintento o outline).
 */
export function enqueueStatusChain(
  from: ComposerSessionStatus,
  kind: ComposerJobKind
): ComposerSessionStatus[] {
  if (kind === "research") {
    if (from === "collecting") return ["awaiting_confirmation", "researching"]
    if (from === "awaiting_confirmation") return ["researching"]
    return []
  }

  if (kind === "article") {
    if (from === "awaiting_confirmation" || from === "researching") return ["drafting"]
    return []
  }

  if (kind === "image") {
    if (from === "drafting") return ["imaging"]
    return []
  }

  return []
}

/**
 * Un brief está listo para confirmarse cuando tiene lo mínimo para investigar y escribir.
 * Sin tema no hay nada que investigar; sin idioma el modelo elige por su cuenta y el
 * resultado es impredecible en un producto que es español por defecto.
 */
export function isBriefReady(brief: {
  topic?: string
  language?: string
}): boolean {
  return Boolean(brief.topic && brief.topic.trim().length > 0 && brief.language)
}
