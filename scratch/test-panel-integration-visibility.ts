/**
 * Contratos de visibilidad de Composer y Vapi en el panel.
 *
 * Usage:
 *   pnpm tsx scratch/test-panel-integration-visibility.ts
 */

import {
  getComposerUnavailableReason,
  getNarrationUnavailableMessage,
  isComposerNavItemVisible,
  isComposerReadyForUse,
  type ComposerHealthSnapshot,
} from "../lib/application/panel/integration-visibility"

let totalPassed = 0
let totalFailed = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  PASS: ${testName}`)
    totalPassed++
  } else {
    console.error(`  FAIL: ${testName}${detail ? ` (${detail})` : ""}`)
    totalFailed++
    failures.push(testName)
  }
}

function baseHealth(overrides: Partial<ComposerHealthSnapshot> = {}): ComposerHealthSnapshot {
  return {
    composerEnabled: false,
    killSwitchActive: false,
    availableForCurrentTenant: false,
    isAuthenticated: true,
    hasApiKey: false,
    problems: [],
    ...overrides,
  }
}

async function runTests() {
  console.log("===================================================================")
  console.log("SUITE: visibilidad de Composer y Vapi en el panel")
  console.log("===================================================================\n")

  console.log("▶ Composer permanece visible en la nav aunque el flag esté apagado")
  assert(
    isComposerNavItemVisible() === true,
    "La entrada de Composer no se oculta por feature flag"
  )

  console.log("\n▶ Composer no está listo con el default de COMPOSER_ENABLED")
  assert(
    isComposerReadyForUse(baseHealth()) === false,
    "Default apagado: availableForCurrentTenant=false y sin clave"
  )
  const flagOff = getComposerUnavailableReason(baseHealth())
  assert(flagOff?.kind === "flag_off", "Diagnóstico: flag_off", flagOff?.kind)
  assert(
    Boolean(flagOff?.message.includes("COMPOSER_ENABLED")),
    "El mensaje menciona COMPOSER_ENABLED"
  )

  console.log("\n▶ Kill switch gana al flag")
  const kill = getComposerUnavailableReason(
    baseHealth({ composerEnabled: true, killSwitchActive: true })
  )
  assert(kill?.kind === "kill_switch", "Diagnóstico: kill_switch", kill?.kind)

  console.log("\n▶ Flag on pero sin OPENAI_API_KEY")
  const missingKey = getComposerUnavailableReason(
    baseHealth({
      composerEnabled: true,
      availableForCurrentTenant: true,
      hasApiKey: false,
    })
  )
  assert(missingKey?.kind === "missing_key", "Diagnóstico: missing_key", missingKey?.kind)

  console.log("\n▶ Flag on, clave presente, pero JWT de Clerk no llega a Convex")
  const unauth = getComposerUnavailableReason(
    baseHealth({
      composerEnabled: true,
      hasApiKey: true,
      isAuthenticated: false,
      availableForCurrentTenant: false,
    })
  )
  assert(unauth?.kind === "unauthenticated", "Diagnóstico: unauthenticated", unauth?.kind)

  console.log("\n▶ Flag on, clave y sesión, tenant fuera del canary")
  const tenant = getComposerUnavailableReason(
    baseHealth({
      composerEnabled: true,
      hasApiKey: true,
      isAuthenticated: true,
      availableForCurrentTenant: false,
    })
  )
  assert(tenant?.kind === "tenant_not_allowed", "Diagnóstico: tenant_not_allowed", tenant?.kind)

  console.log("\n▶ Listo para usar")
  const readyHealth = baseHealth({
    composerEnabled: true,
    hasApiKey: true,
    isAuthenticated: true,
    availableForCurrentTenant: true,
  })
  assert(isComposerReadyForUse(readyHealth) === true, "isComposerReadyForUse es true")
  assert(getComposerUnavailableReason(readyHealth) === null, "Sin motivo de bloqueo")

  console.log("\n▶ Vapi: mensajes accionables")
  assert(
    getNarrationUnavailableMessage({
      enabled: true,
      isConfigured: true,
      isKillSwitchActive: false,
    }) === null,
    "Sin mensaje cuando el servicio está listo"
  )
  const vapiKey = getNarrationUnavailableMessage({
    enabled: false,
    isConfigured: false,
    isKillSwitchActive: false,
  })
  assert(
    Boolean(vapiKey?.includes("VAPI_PRIVATE_API_KEY")),
    "Sin clave: menciona VAPI_PRIVATE_API_KEY",
    vapiKey ?? undefined
  )
  const vapiKill = getNarrationUnavailableMessage({
    enabled: false,
    isConfigured: true,
    isKillSwitchActive: true,
  })
  assert(
    Boolean(vapiKill?.includes("AUDIO_NARRATION_KILL_SWITCH")),
    "Kill switch: menciona AUDIO_NARRATION_KILL_SWITCH",
    vapiKill ?? undefined
  )

  console.log("\n===================================================================")
  console.log(`RESULTADO: ${totalPassed} ok, ${totalFailed} fallos`)
  if (failures.length > 0) {
    console.error("Fallos:", failures.join(", "))
    process.exit(1)
  }
}

void runTests()
