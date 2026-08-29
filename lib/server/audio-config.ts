/**
 * Server-Side Audio & TTS Configuration
 *
 * This module manages server-only environment variables and global defaults
 * for post audio narration (Vapi AI / TTS).
 *
 * SECURITY NOTICE:
 * All variables here are strictly server-side and must never be exposed
 * to client components or bundled into client JavaScript.
 */

export const ALLOWED_AUDIO_MIME_TYPES = ["audio/mpeg", "audio/wav"] as const
export type AllowedAudioMimeType = (typeof ALLOWED_AUDIO_MIME_TYPES)[number]

export const ALLOWED_AUDIO_FORMATS = ["mp3", "wav"] as const
export type AllowedAudioFormat = (typeof ALLOWED_AUDIO_FORMATS)[number]

export const DEFAULT_AUDIO_CONFIG = {
  vapiBaseUrl: "https://api.vapi.ai",
  defaultVoiceId: "sarah",
  defaultVoiceProvider: "11labs",
  defaultFormat: "mp3" as AllowedAudioFormat,
  assistantName: "Blog Narration Voice",
  defaultLanguage: "es",
  maxCallDurationSeconds: 120,
  silenceTimeoutSeconds: 15,
  pollIntervalMs: 2500,
  maxPollWaitMs: 90000, // 90 seconds max wait for call termination
  maxSizeBytes: 50 * 1024 * 1024, // 50MB
  minSizeBytes: 1024, // 1KB
} as const

export interface AudioServerConfig {
  vapiApiKey?: string
  vapiBaseUrl: string
  defaultVoiceId: string
  defaultVoiceProvider: string
  defaultFormat: AllowedAudioFormat
  assistantName: string
  defaultLanguage: string
  maxCallDurationSeconds: number
  silenceTimeoutSeconds: number
  pollIntervalMs: number
  maxPollWaitMs: number
  maxSizeBytes: number
  minSizeBytes: number
  allowedMimeTypes: readonly string[]
  isConfigured: boolean
  isFeatureEnabled: boolean
  isKillSwitchActive: boolean
}

/**
 * Resolves and validates the global audio server configuration from environment variables.
 * Safe for server runtime and test environments.
 */
export function getAudioServerConfig(): AudioServerConfig {
  // Ensure we are in a server/Node environment
  const isServer = typeof window === "undefined"
  if (!isServer) {
    throw new Error(
      "[SECURITY VIOLATION] getAudioServerConfig() was called in a client-side environment. Audio keys must remain server-side only."
    )
  }

  const apiKey = process.env.VAPI_PRIVATE_API_KEY?.trim() || undefined
  const baseUrl =
    process.env.VAPI_API_BASE_URL?.trim() || DEFAULT_AUDIO_CONFIG.vapiBaseUrl
  const voiceId =
    process.env.VAPI_DEFAULT_VOICE_ID?.trim() || DEFAULT_AUDIO_CONFIG.defaultVoiceId
  const voiceProvider =
    process.env.VAPI_DEFAULT_VOICE_PROVIDER?.trim() ||
    DEFAULT_AUDIO_CONFIG.defaultVoiceProvider
  const formatRaw = (
    process.env.VAPI_DEFAULT_AUDIO_FORMAT?.trim() ||
    DEFAULT_AUDIO_CONFIG.defaultFormat
  ).toLowerCase()
  const format: AllowedAudioFormat = ALLOWED_AUDIO_FORMATS.includes(
    formatRaw as AllowedAudioFormat
  )
    ? (formatRaw as AllowedAudioFormat)
    : "mp3"
  const assistantName =
    process.env.VAPI_ASSISTANT_NAME?.trim() || DEFAULT_AUDIO_CONFIG.assistantName
  const defaultLanguage =
    process.env.VAPI_DEFAULT_LANGUAGE?.trim() ||
    DEFAULT_AUDIO_CONFIG.defaultLanguage

  // Kill Switch & Feature Flag checks
  const killSwitchRaw = (
    process.env.AUDIO_NARRATION_KILL_SWITCH ||
    process.env.NEXT_PUBLIC_AUDIO_NARRATION_KILL_SWITCH ||
    ""
  ).toLowerCase().trim()
  const isKillSwitchActive = killSwitchRaw === "true" || killSwitchRaw === "1"

  const featureFlagRaw = (
    process.env.ENABLE_VAPI_NARRATIONS ||
    process.env.NEXT_PUBLIC_ENABLE_AUDIO_NARRATION ||
    "true"
  ).toLowerCase().trim()
  const isFeatureEnabled =
    (featureFlagRaw === "true" || featureFlagRaw === "1") && !isKillSwitchActive

  return {
    vapiApiKey: apiKey,
    vapiBaseUrl: baseUrl,
    defaultVoiceId: voiceId,
    defaultVoiceProvider: voiceProvider,
    defaultFormat: format,
    assistantName,
    defaultLanguage,
    maxCallDurationSeconds: DEFAULT_AUDIO_CONFIG.maxCallDurationSeconds,
    silenceTimeoutSeconds: DEFAULT_AUDIO_CONFIG.silenceTimeoutSeconds,
    pollIntervalMs: DEFAULT_AUDIO_CONFIG.pollIntervalMs,
    maxPollWaitMs: DEFAULT_AUDIO_CONFIG.maxPollWaitMs,
    maxSizeBytes: DEFAULT_AUDIO_CONFIG.maxSizeBytes,
    minSizeBytes: DEFAULT_AUDIO_CONFIG.minSizeBytes,
    allowedMimeTypes: ALLOWED_AUDIO_MIME_TYPES,
    isConfigured: Boolean(apiKey),
    isFeatureEnabled,
    isKillSwitchActive,
  }
}

/**
 * Checks whether the narration service is currently enabled and operational.
 * Returns an actionable diagnostic status.
 */
export function checkNarrationServiceStatus(): {
  enabled: boolean
  isKillSwitchActive: boolean
  isConfigured: boolean
  reason?: string
} {
  const config = getAudioServerConfig()

  if (config.isKillSwitchActive) {
    return {
      enabled: false,
      isKillSwitchActive: true,
      isConfigured: config.isConfigured,
      reason: "El servicio de narración de audio está temporalmente deshabilitado por Kill Switch operativo.",
    }
  }

  if (!config.isFeatureEnabled) {
    return {
      enabled: false,
      isKillSwitchActive: false,
      isConfigured: config.isConfigured,
      reason: "La función de narración de audio no está habilitada en este entorno.",
    }
  }

  if (!config.isConfigured) {
    return {
      enabled: false,
      isKillSwitchActive: false,
      isConfigured: false,
      reason: "VAPI_PRIVATE_API_KEY no está configurada en las variables de entorno del servidor.",
    }
  }

  return {
    enabled: true,
    isKillSwitchActive: false,
    isConfigured: true,
  }
}

/**
 * Playback visibility for published posts.
 * Independent of VAPI_PRIVATE_API_KEY: existing ready audio stays playable
 * unless the feature flag or kill switch is off.
 */
export function isNarrationPlaybackEnabled(): boolean {
  const config = getAudioServerConfig()
  return config.isFeatureEnabled && !config.isKillSwitchActive
}

/**
 * Validates whether a given MIME type is supported for narration storage.
 */
export function isValidAudioMimeType(mimeType: string): mimeType is AllowedAudioMimeType {
  return (ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(mimeType)
}

