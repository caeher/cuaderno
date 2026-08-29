/**
 * Integración autenticada de la capa OpenAI (issue #14).
 *
 * Sin OPENAI_API_KEY: valida el contrato local y omite la llamada real.
 * Con clave + COMPOSER_ENABLED=true: ejecuta una Responses mínima y comprueba
 * que la respuesta serializada no contiene secretos.
 *
 * Usage:
 *   pnpm tsx scratch/test-ai-integration.ts
 */

import { validateAiConfig } from "../convex/lib/ai/config"
import { buildUsageSnapshot } from "../convex/lib/ai/usage"

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

function containsSecret(value: unknown, secret?: string): boolean {
  const json = JSON.stringify(value)
  if (json.includes("sk-")) return true
  if (secret && json.includes(secret)) return true
  if (json.includes("Bearer ")) return true
  return false
}

async function runTests() {
  console.log("===================================================================")
  console.log("SUITE: integración autenticada OpenAI")
  console.log("===================================================================\n")

  console.log("▶ Contrato del health check (sin gastar tokens)")
  const report = validateAiConfig()
  assert(typeof report.ok === "boolean", "ok es boolean")
  assert(typeof report.hasApiKey === "boolean", "hasApiKey es boolean")
  assert(typeof report.researchModel === "string" && report.researchModel.length > 0, "researchModel presente")
  assert(typeof report.writingModel === "string" && report.writingModel.length > 0, "writingModel presente")
  assert(typeof report.imageModel === "string" && report.imageModel.length > 0, "imageModel presente")
  assert(!containsSecret(report, process.env.OPENAI_API_KEY), "health no expone la clave")

  console.log("\n▶ Observabilidad: snapshot de uso no guarda secretos")
  const usage = buildUsageSnapshot({
    phase: "writing",
    model: report.writingModel,
    status: "succeeded",
    requestId: "resp_integration_fixture",
    usage: { inputTokens: 12, outputTokens: 4, toolCalls: 0 },
  })
  assert(usage.model === report.writingModel, "el snapshot registra el modelo efectivo de la fase")
  assert(typeof usage.estimatedCostUsd === "number", "estima coste a partir de tokens")
  assert(!containsSecret(usage, process.env.OPENAI_API_KEY), "usage no contiene secretos")

  const liveKey = process.env.OPENAI_API_KEY?.trim()
  const composerOn = process.env.COMPOSER_ENABLED === "true"

  if (!liveKey || !composerOn) {
    console.log(
      "\n▶ Llamada real omitida (define OPENAI_API_KEY y COMPOSER_ENABLED=true para ejecutar el smoke)"
    )
    assert(true, "omite la llamada al proveedor si el entorno no está listo")
  } else {
    console.log("\n▶ Smoke autenticado contra Responses API")
    const { runSmokeGeneration } = await import("../convex/lib/ai/client")
    const smoke = await runSmokeGeneration()
    assert(smoke.ok === true, "smoke ok")
    assert(smoke.phase === "writing", "smoke usa la fase de redacción")
    assert(smoke.model === report.writingModel, "el modelo efectivo coincide con OPENAI_WRITING_MODEL")
    assert(typeof smoke.requestId === "string" && smoke.requestId.length > 0, "devuelve request ID")
    assert(!containsSecret(smoke, liveKey), "la respuesta del smoke no expone la clave")
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
  console.error(error)
  process.exit(1)
})
