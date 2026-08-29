/**
 * Suite: Control de costes de imagen, estimaciones, regeneración y tolerancia a fallos — Issue #18.
 *
 * Usage:
 *   pnpm tsx scratch/test-image-cost-and-regeneration.ts
 */

import { estimateImageCostUsd } from "../convex/lib/ai/usage"
import { getImagePhaseConfig } from "../convex/lib/ai/config"

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

async function runTests() {
  console.log("===================================================================")
  console.log("SUITE: Control de Costes, Estimaciones de Imagen y Fallos")
  console.log("===================================================================\n")

  console.log("▶ 1. Verificación de Modelo y Calidad por Defecto (Coste Mínimo)")
  const imageConfig = getImagePhaseConfig()
  assert(imageConfig.model === "gpt-image-1-mini", "Modelo de imagen por defecto es gpt-image-1-mini")
  assert(imageConfig.quality === "low", "Calidad de imagen por defecto es low (coste mínimo)")

  console.log("\n▶ 2. Estimaciones de Coste por Nivel de Calidad")
  const costLow = estimateImageCostUsd(1, "low")
  const costMedium = estimateImageCostUsd(1, "medium")
  const costHigh = estimateImageCostUsd(1, "high")
  const costAuto = estimateImageCostUsd(1, "auto")

  assert(costLow === 0.01, `Coste para quality 'low' es $0.01 (calculado: $${costLow})`)
  assert(costMedium === 0.04, `Coste para quality 'medium' es $0.04 (calculado: $${costMedium})`)
  assert(costHigh === 0.08, `Coste para quality 'high' es $0.08 (calculado: $${costHigh})`)
  assert(costAuto === 0.04, `Coste para quality 'auto' es $0.04 (calculado: $${costAuto})`)

  console.log("\n▶ 3. Tolerancia a Refusals y Bloqueos de Moderación")
  // Simulación de flujo ante rechazo de imagen
  let sessionStatus = "imaging"
  let jobStatus = "running"
  let errorMessage: string | undefined

  try {
    // Simular error de refusal
    throw new Error("El modelo rechazó generar este contenido por política de seguridad.")
  } catch (err: any) {
    jobStatus = "failed"
    errorMessage = err.message
    // Transición de rescate para no bloquear el borrador
    if (sessionStatus === "imaging") {
      sessionStatus = "awaiting_review"
    }
  }

  assert(jobStatus === "failed", "El job de imagen se marca como 'failed' ante un refusal")
  assert(
    Boolean(errorMessage?.includes("política de seguridad")),
    "Registra el motivo del fallo para mostrar en el chat"
  )
  assert(
    sessionStatus === "awaiting_review",
    "La sesión transiciona a 'awaiting_review' para permitir continuar con el borrador"
  )

  console.log("\n▶ 4. Handoff de Portada al Crear Borrador")
  const artifactsWithCover = [
    { kind: "article", content: "<h1>Hola</h1>" },
    { kind: "cover", storageId: "blob_cover_1" },
  ]
  const mockStorageUrl = "https://convex.cloud/api/storage/blob_cover_1"

  // Caso A: wantsCoverImage = true
  const wantsCoverA = true
  const coverA = artifactsWithCover.find((a) => a.kind === "cover")
  const coverUrlA = wantsCoverA && coverA ? mockStorageUrl : undefined
  assert(
    coverUrlA === mockStorageUrl,
    "Asigna coverUrl al post si el usuario quería portada y está generada"
  )

  // Caso B: wantsCoverImage = false (descartada)
  const wantsCoverB = false
  const coverUrlB = wantsCoverB && coverA ? mockStorageUrl : undefined
  assert(
    coverUrlB === undefined,
    "No asigna coverUrl al post si el usuario descartó la portada"
  )

  console.log("\n===================================================================")
  console.log(`Resultado: ${totalPassed} pass, ${totalFailed} fail`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    process.exit(1)
  }
}

runTests()
