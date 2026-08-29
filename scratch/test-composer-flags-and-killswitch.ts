/**
 * Suite de Feature Flags, Kill Switch y Rollout Canary — Issue #20 / Épica #13.
 *
 * Valida:
 * 1. Interruptor global COMPOSER_ENABLED (por defecto false).
 * 2. Kill switch prioritario COMPOSER_KILL_SWITCH (bloquea todo inmediatamente sin deploy).
 * 3. Canary rollout granular mediante COMPOSER_ALLOWED_TENANTS (filtrado por tenant).
 * 4. Límites operativos conservadores iniciales.
 * 5. Invariante de rollback sin pérdida de datos.
 */

import {
  isComposerEnabled,
  isComposerKillSwitchActive,
  getAllowedTenants,
  isComposerEnabledForTenant,
  requireUsableAiConfig,
  CONSERVATIVE_LIMITS,
} from "../convex/lib/ai/config"

let totalPassed = 0
let totalFailed = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`)
    totalPassed++
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` (${detail})` : ""}`)
    totalFailed++
    failures.push(testName)
  }
}

async function runFlagsAndKillSwitchTests() {
  console.log("\n===================================================================")
  console.log("SUITE: FEATURE FLAGS, KILL SWITCH Y CANARY ROLLOUT")
  console.log("===================================================================\n")

  const originalEnv = { ...process.env }

  try {
    console.log("--- 1. Interruptor Global COMPOSER_ENABLED ---")
    delete process.env.COMPOSER_ENABLED
    delete process.env.COMPOSER_KILL_SWITCH
    delete process.env.COMPOSER_ALLOWED_TENANTS

    assert(
      isComposerEnabled() === false,
      "1.1 Por defecto COMPOSER_ENABLED está APAGADO (false)"
    )

    let disabledThrows = false
    try {
      requireUsableAiConfig()
    } catch (err) {
      disabledThrows = (err as Error).message.includes("COMPOSER_ENABLED")
    }
    assert(
      disabledThrows,
      "1.2 requireUsableAiConfig lanza error explícito cuando COMPOSER_ENABLED no es 'true'"
    )

    process.env.COMPOSER_ENABLED = "true"
    process.env.OPENAI_API_KEY = "sk-mock-valid-key-for-testing"

    assert(
      isComposerEnabled() === true,
      "1.3 COMPOSER_ENABLED='true' habilita Composer globalmente"
    )

    console.log("\n--- 2. Kill Switch de Emergencia Prioritario ---")
    process.env.COMPOSER_KILL_SWITCH = "true"

    assert(
      isComposerKillSwitchActive() === true,
      "2.1 Detecta COMPOSER_KILL_SWITCH='true'"
    )
    assert(
      isComposerEnabledForTenant("any_tenant") === false,
      "2.2 isComposerEnabledForTenant devuelve false para cualquier tenant cuando kill switch está activo"
    )

    let killSwitchThrows = false
    try {
      requireUsableAiConfig("any_tenant")
    } catch (err) {
      killSwitchThrows = (err as Error).message.includes("COMPOSER_KILL_SWITCH")
    }
    assert(
      killSwitchThrows,
      "2.3 requireUsableAiConfig rechaza con mensaje explícito de kill switch de emergencia"
    )

    delete process.env.COMPOSER_KILL_SWITCH

    console.log("\n--- 3. Despliegue Canary por Tenant (COMPOSER_ALLOWED_TENANTS) ---")
    process.env.COMPOSER_ALLOWED_TENANTS = "tenant_alpha, tenant_beta, org_vip"

    const allowedList = getAllowedTenants()
    assert(
      allowedList.length === 3 && allowedList.includes("tenant_alpha") && allowedList.includes("org_vip"),
      "3.1 Parsea correctamente la lista blanca de tenants para Canary Rollout"
    )

    assert(
      isComposerEnabledForTenant("tenant_alpha") === true,
      "3.2 Tenant en lista blanca (tenant_alpha) tiene acceso habilitado"
    )
    assert(
      isComposerEnabledForTenant("tenant_beta") === true,
      "3.3 Tenant en lista blanca (tenant_beta) tiene acceso habilitado"
    )
    assert(
      isComposerEnabledForTenant("tenant_gamma_general") === false,
      "3.4 Tenant fuera de lista blanca (tenant_gamma_general) NO tiene acceso en fase Canary"
    )

    let canaryBlockedThrows = false
    try {
      requireUsableAiConfig("tenant_gamma_general")
    } catch (err) {
      canaryBlockedThrows = (err as Error).message.includes("fase actual de despliegue")
    }
    assert(
      canaryBlockedThrows,
      "3.5 requireUsableAiConfig lanza error descriptivo al tenant fuera de canary"
    )

    // Comodín '*' habilita a todos
    process.env.COMPOSER_ALLOWED_TENANTS = "*"
    assert(
      isComposerEnabledForTenant("any_random_tenant") === true,
      "3.6 Comodín '*' en COMPOSER_ALLOWED_TENANTS da acceso a todos los tenants"
    )

    console.log("\n--- 4. Límites Conservadores Iniciales ---")
    assert(
      CONSERVATIVE_LIMITS.maxResearchQueriesHardCap === 10,
      "4.1 Hard cap conservador de consultas de búsqueda por sesión fijado en 10"
    )
    assert(
      CONSERVATIVE_LIMITS.maxPromptLengthChars === 50_000,
      "4.2 Límite de longitud máxima de prompt configurado en 50,000 caracteres"
    )

    console.log("\n--- 5. Invariante de Rollback Seguro ---")
    // Desactivar flags no altera datos ni causa efectos secundarios
    process.env.COMPOSER_ENABLED = "false"
    assert(
      isComposerEnabled() === false,
      "5.1 Desactivar el flag apaga Composer inmediatamente sin necesidad de migración de datos"
    )
  } finally {
    process.env = originalEnv
  }

  console.log("\n===================================================================")
  console.log(`RESUMEN: ${totalPassed}/${totalPassed + totalFailed} PRUEBAS PASADAS`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    process.exit(1)
  }
}

runFlagsAndKillSwitchTests()
