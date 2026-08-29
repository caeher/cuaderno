/**
 * Pruebas unitarias para la máquina de estados de Composer (issue #15).
 *
 * Usage:
 *   pnpm tsx scratch/test-composer-state.ts
 */

import {
  assertTransition,
  canTransition,
  isBriefReady,
  isTerminalStatus,
  nextAfterDrafting,
  type ComposerSessionStatus,
} from "../convex/lib/composerState"

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

async function runStateTests() {
  console.log("===================================================================")
  console.log("SUITE: Máquina de Estados de Composer (Lógica Pura)")
  console.log("===================================================================\n")

  // 1. Estados Terminales
  console.log("▶ Verificación de Estados Terminales")
  assert(isTerminalStatus("awaiting_review") === true, "awaiting_review es terminal")
  assert(isTerminalStatus("failed") === true, "failed es terminal")
  assert(isTerminalStatus("cancelled") === true, "cancelled es terminal")
  assert(isTerminalStatus("collecting") === false, "collecting no es terminal")
  assert(isTerminalStatus("researching") === false, "researching no es terminal")
  assert(isTerminalStatus("drafting") === false, "drafting no es terminal")
  assert(isTerminalStatus("imaging") === false, "imaging no es terminal")

  // 2. Transiciones Legales
  console.log("\n▶ Transiciones Legales")
  assert(canTransition("collecting", "awaiting_confirmation"), "collecting -> awaiting_confirmation")
  assert(canTransition("collecting", "cancelled"), "collecting -> cancelled")
  assert(canTransition("collecting", "failed"), "collecting -> failed")

  assert(canTransition("awaiting_confirmation", "researching"), "awaiting_confirmation -> researching")
  assert(canTransition("awaiting_confirmation", "collecting"), "awaiting_confirmation -> collecting")
  assert(canTransition("awaiting_confirmation", "cancelled"), "awaiting_confirmation -> cancelled")

  assert(canTransition("researching", "drafting"), "researching -> drafting")
  assert(canTransition("researching", "failed"), "researching -> failed")
  assert(canTransition("researching", "cancelled"), "researching -> cancelled")

  assert(canTransition("drafting", "imaging"), "drafting -> imaging")
  assert(canTransition("drafting", "awaiting_review"), "drafting -> awaiting_review")
  assert(canTransition("drafting", "failed"), "drafting -> failed")

  assert(canTransition("imaging", "awaiting_review"), "imaging -> awaiting_review")
  assert(canTransition("imaging", "failed"), "imaging -> failed")

  // No-op transition (mismo estado)
  assertTransition("collecting", "collecting")
  assert(true, "assertTransition permite transiciones no-op (from === to)")

  // 3. Transiciones Ilegales
  console.log("\n▶ Transiciones Ilegales y Bloqueo")
  assert(!canTransition("collecting", "drafting"), "collecting -> drafting es ilegal")
  assert(!canTransition("collecting", "awaiting_review"), "collecting -> awaiting_review es ilegal")
  assert(!canTransition("researching", "imaging"), "researching -> imaging es ilegal")
  assert(!canTransition("awaiting_review", "collecting"), "awaiting_review -> collecting es ilegal")
  assert(!canTransition("failed", "collecting"), "failed -> collecting es ilegal")
  assert(!canTransition("cancelled", "researching"), "cancelled -> researching es ilegal")

  let threwExpected = false
  try {
    assertTransition("collecting", "drafting")
  } catch (error) {
    threwExpected = error instanceof Error && error.message.includes("Transición de Composer inválida")
  }
  assert(threwExpected, "assertTransition lanza error descriptivo ante transición inválida")

  let terminalThrew = false
  try {
    assertTransition("failed", "researching")
  } catch (error) {
    terminalThrew = error instanceof Error && error.message.includes("es un estado terminal")
  }
  assert(terminalThrew, "assertTransition indica que es un estado terminal en el error")

  // 4. Salto condicional de imágenes
  console.log("\n▶ Salto condicional de imágenes (nextAfterDrafting)")
  assert(nextAfterDrafting(true) === "imaging", "nextAfterDrafting(true) va a imaging")
  assert(nextAfterDrafting(false) === "awaiting_review", "nextAfterDrafting(false) va a awaiting_review")
  assert(nextAfterDrafting(undefined) === "awaiting_review", "nextAfterDrafting(undefined) va a awaiting_review")

  // 5. Validación de Brief Mínimo
  console.log("\n▶ Validación de completitud de Brief (isBriefReady)")
  assert(isBriefReady({ topic: "Inteligencia Artificial", language: "es" }) === true, "Brief con tema e idioma es válido")
  assert(isBriefReady({ topic: "   ", language: "es" }) === false, "Brief con tema en blanco es inválido")
  assert(isBriefReady({ topic: "IA", language: "" }) === false, "Brief sin idioma es inválido")
  assert(isBriefReady({}) === false, "Brief vacío es inválido")

  console.log("\n===================================================================")
  console.log(`Resultado: ${totalPassed} pass, ${totalFailed} fail`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    console.error("Fallos:", failures.join(", "))
    process.exit(1)
  }
}

runStateTests().catch((err) => {
  console.error(err)
  process.exit(1)
})
