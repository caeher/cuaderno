/**
 * Visibilidad y diagnóstico de integraciones del panel (Composer / Vapi).
 *
 * La UI debe poder mostrar estas superficies aunque el feature flag esté apagado:
 * ocultarlas por completo hace imposible saber por qué no aparecen.
 * El bloqueo de uso (actions / gate) sigue siendo la fuente de verdad.
 */

export interface ComposerHealthSnapshot {
  composerEnabled: boolean
  killSwitchActive: boolean
  availableForCurrentTenant: boolean
  isAuthenticated: boolean
  hasApiKey: boolean
  problems: string[]
}

export interface NarrationHealthSnapshot {
  enabled: boolean
  isConfigured: boolean
  isKillSwitchActive: boolean
  reason?: string | null
}

export type ComposerUnavailableKind =
  | "kill_switch"
  | "flag_off"
  | "missing_key"
  | "unauthenticated"
  | "tenant_not_allowed"

export interface ComposerUnavailableReason {
  kind: ComposerUnavailableKind
  title: string
  message: string
}

/** Composer siempre aparece en la nav del panel para poder diagnosticarlo. */
export function isComposerNavItemVisible(): boolean {
  return true
}

export function isComposerReadyForUse(health?: ComposerHealthSnapshot | null): boolean {
  return health?.availableForCurrentTenant === true && health.hasApiKey === true
}

export function getComposerUnavailableReason(
  health: ComposerHealthSnapshot
): ComposerUnavailableReason | null {
  if (isComposerReadyForUse(health)) return null

  if (health.killSwitchActive) {
    return {
      kind: "kill_switch",
      title: "Composer no está disponible",
      message:
        "Composer está desactivado de emergencia en este entorno (COMPOSER_KILL_SWITCH).",
    }
  }

  if (!health.composerEnabled) {
    return {
      kind: "flag_off",
      title: "Composer no está disponible",
      message:
        "Composer está apagado en Convex (COMPOSER_ENABLED no es true). Actívalo con: pnpm convex env set COMPOSER_ENABLED true",
    }
  }

  if (!health.hasApiKey) {
    return {
      kind: "missing_key",
      title: "Composer no está disponible",
      message:
        "Falta OPENAI_API_KEY en las variables de Convex. Configúrala con: pnpm convex env set OPENAI_API_KEY <valor>",
    }
  }

  if (!health.isAuthenticated) {
    return {
      kind: "unauthenticated",
      title: "Composer no está disponible",
      message:
        "Tu sesión de Clerk no llega a Convex. Composer está encendido, pero falta el JWT template «convex» o CLERK_JWT_ISSUER_DOMAIN.",
    }
  }

  return {
    kind: "tenant_not_allowed",
    title: "Composer no está disponible",
    message:
      "Composer no está habilitado para este espacio de trabajo en el rollout actual (COMPOSER_ALLOWED_TENANTS).",
  }
}

export function getNarrationUnavailableMessage(
  health: NarrationHealthSnapshot
): string | null {
  if (health.enabled) return null
  if (health.reason) return health.reason
  if (health.isKillSwitchActive) {
    return "La narración de audio está desactivada por kill switch (AUDIO_NARRATION_KILL_SWITCH)."
  }
  if (!health.isConfigured) {
    return "Falta VAPI_PRIVATE_API_KEY en las variables del servidor Next.js."
  }
  return "La narración de audio no está habilitada en este entorno (ENABLE_VAPI_NARRATIONS)."
}
