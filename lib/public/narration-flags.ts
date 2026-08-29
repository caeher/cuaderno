/**
 * Client-safe narration visibility flags.
 * Only reads NEXT_PUBLIC_* variables so this module can run in the browser.
 * Server-side generation still uses checkNarrationServiceStatus() in audio-config.
 */

function isTruthyFlag(value: string | undefined): boolean {
  const normalized = (value || "").toLowerCase().trim()
  return normalized === "true" || normalized === "1"
}

function isFalsyFlag(value: string | undefined): boolean {
  const normalized = (value || "").toLowerCase().trim()
  return normalized === "false" || normalized === "0"
}

export function isPublicNarrationPlaybackEnabled(): boolean {
  if (isTruthyFlag(process.env.NEXT_PUBLIC_AUDIO_NARRATION_KILL_SWITCH)) {
    return false
  }
  if (isFalsyFlag(process.env.NEXT_PUBLIC_ENABLE_AUDIO_NARRATION)) {
    return false
  }
  return true
}
