/**
 * Contratos del resolvedor de configuración IA (issue #14).
 *
 * Usage:
 *   pnpm tsx scratch/test-ai-config.ts
 */

import {
  getImagePhaseConfig,
  getTextPhaseConfig,
  hasApiKey,
  isComposerEnabled,
  requireUsableAiConfig,
  validateAiConfig,
} from "../convex/lib/ai/config"

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

const ENV_KEYS = [
  "OPENAI_API_KEY",
  "COMPOSER_ENABLED",
  "OPENAI_RESEARCH_MODEL",
  "OPENAI_WRITING_MODEL",
  "OPENAI_IMAGE_MODEL",
  "OPENAI_REASONING_EFFORT",
  "OPENAI_IMAGE_QUALITY",
  "OPENAI_SEARCH_CONTEXT_SIZE",
  "OPENAI_MAX_RESEARCH_QUERIES",
] as const

const snapshot: Record<string, string | undefined> = {}

function captureEnv() {
  for (const key of ENV_KEYS) {
    snapshot[key] = process.env[key]
  }
}

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = snapshot[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

function clearAiEnv() {
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }
}

async function runTests() {
  console.log("===================================================================")
  console.log("SUITE: configuración global de IA")
  console.log("===================================================================\n")

  captureEnv()

  try {
    console.log("▶ Defaults documentados cuando el entorno está vacío")
    clearAiEnv()

    const research = getTextPhaseConfig("research")
    const writing = getTextPhaseConfig("writing")
    const image = getImagePhaseConfig()

    assert(research.model === "gpt-5.6-luna", "research usa gpt-5.6-luna por defecto")
    assert(writing.model === "gpt-5.6-luna", "writing usa gpt-5.6-luna por defecto")
    assert(image.model === "gpt-image-1-mini", "image usa gpt-image-1-mini por defecto")
    assert(research.webSearch === true, "research habilita Web Search")
    assert(writing.webSearch === false, "writing no habilita Web Search")
    assert(research.searchContextSize === "low", "tamaño de contexto de búsqueda por defecto: low")
    assert(research.maxResearchQueries === 5, "límite de consultas de investigación por defecto: 5")
    assert(research.reasoningEffort === "medium", "esfuerzo de razonamiento por defecto: medium")
    assert(image.quality === "low", "calidad de imagen por defecto: low")
    assert(hasApiKey() === false, "hasApiKey es false sin OPENAI_API_KEY")
    assert(isComposerEnabled() === false, "Composer apagado por defecto")

    console.log("\n▶ Override por variables de entorno")
    process.env.OPENAI_RESEARCH_MODEL = "gpt-test-research"
    process.env.OPENAI_WRITING_MODEL = "gpt-test-writing"
    process.env.OPENAI_IMAGE_MODEL = "gpt-test-image"
    process.env.OPENAI_REASONING_EFFORT = "low"
    process.env.OPENAI_IMAGE_QUALITY = "high"
    process.env.OPENAI_SEARCH_CONTEXT_SIZE = "high"
    process.env.OPENAI_MAX_RESEARCH_QUERIES = "10"

    assert(
      getTextPhaseConfig("research").model === "gpt-test-research",
      "OPENAI_RESEARCH_MODEL cambia el modelo de investigación"
    )
    assert(
      getTextPhaseConfig("writing").model === "gpt-test-writing",
      "OPENAI_WRITING_MODEL cambia el modelo de redacción"
    )
    assert(getImagePhaseConfig().model === "gpt-test-image", "OPENAI_IMAGE_MODEL cambia el modelo de imagen")
    assert(getTextPhaseConfig("writing").reasoningEffort === "low", "OPENAI_REASONING_EFFORT se aplica a texto")
    assert(getImagePhaseConfig().quality === "high", "OPENAI_IMAGE_QUALITY se aplica a imagen")
    assert(
      getTextPhaseConfig("research").searchContextSize === "high",
      "OPENAI_SEARCH_CONTEXT_SIZE se aplica a research"
    )
    assert(
      getTextPhaseConfig("research").maxResearchQueries === 10,
      "OPENAI_MAX_RESEARCH_QUERIES se aplica a research"
    )

    console.log("\n▶ Validación de enums inválidos")
    process.env.OPENAI_REASONING_EFFORT = "ludicrous"
    process.env.OPENAI_IMAGE_QUALITY = "ultra"
    process.env.OPENAI_SEARCH_CONTEXT_SIZE = "infinite"
    process.env.OPENAI_MAX_RESEARCH_QUERIES = "-3"
    delete process.env.OPENAI_API_KEY

    const report = validateAiConfig()
    assert(report.ok === false, "validateAiConfig.ok es false con enums inválidos y sin clave")
    assert(report.problems.length >= 5, "acumula todos los problemas, no solo el primero", String(report.problems.length))
    assert(
      report.problems.some((problem) => problem.includes("OPENAI_REASONING_EFFORT")),
      "reporta OPENAI_REASONING_EFFORT inválido"
    )
    assert(
      report.problems.some((problem) => problem.includes("OPENAI_IMAGE_QUALITY")),
      "reporta OPENAI_IMAGE_QUALITY inválido"
    )
    assert(
      report.problems.some((problem) => problem.includes("OPENAI_API_KEY")),
      "reporta la ausencia de OPENAI_API_KEY"
    )

    console.log("\n▶ hasApiKey nunca expone el valor")
    const secret = "sk-test-config-secret-do-not-leak"
    process.env.OPENAI_API_KEY = secret
    process.env.OPENAI_REASONING_EFFORT = "medium"
    process.env.OPENAI_IMAGE_QUALITY = "auto"
    process.env.OPENAI_SEARCH_CONTEXT_SIZE = "low"
    process.env.OPENAI_MAX_RESEARCH_QUERIES = "5"

    const healthy = validateAiConfig()
    assert(hasApiKey() === true, "hasApiKey es true cuando hay clave")
    assert(typeof hasApiKey() === "boolean", "hasApiKey solo devuelve boolean")
    const serialized = JSON.stringify(healthy)
    assert(!serialized.includes(secret), "validateAiConfig no serializa la clave")
    assert(!serialized.includes("sk-"), "el reporte no contiene prefijos sk-")

    console.log("\n▶ requireUsableAiConfig respeta el feature flag")
    process.env.COMPOSER_ENABLED = "false"
    let disabledMessage = ""
    try {
      requireUsableAiConfig()
    } catch (error) {
      disabledMessage = error instanceof Error ? error.message : String(error)
    }
    assert(disabledMessage.includes("COMPOSER_ENABLED"), "exige COMPOSER_ENABLED=true")

    process.env.COMPOSER_ENABLED = "true"
    let usableFailed = false
    try {
      requireUsableAiConfig()
    } catch {
      usableFailed = true
    }
    assert(usableFailed === false, "con flag y clave válidos no lanza")
  } finally {
    restoreEnv()
  }

  console.log("\n===================================================================")
  console.log(`Resultado: ${totalPassed} pass, ${totalFailed} fail`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    console.error("Fallos:", failures.join(", "))
    process.exit(1)
  }
}

runTests().catch((error) => {
  restoreEnv()
  console.error(error)
  process.exit(1)
})
