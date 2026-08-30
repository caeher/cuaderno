/**
 * Runner unificado de verificación de la plataforma IA.
 *
 * Usage:
 *   pnpm test:ai
 */

import { execSync } from "child_process"

interface SuiteResult {
  name: string
  file: string
  success: boolean
  output: string
}

const suites = [
  { name: "1. Configuración global de modelos y research", file: "scratch/test-ai-config.ts" },
  { name: "2. Seguridad y frontera de cliente", file: "scratch/test-ai-security.ts" },
  { name: "3. Prompts de investigación y defensa Prompt Injection", file: "scratch/test-research-prompts-and-security.ts" },
  { name: "4. Extracción, dominios y normalización de fuentes", file: "scratch/test-research-extraction.ts" },
  { name: "5. Persistencia, revisión y exclusión de fuentes", file: "scratch/test-composer-research-persistence.ts" },
  { name: "6. Integración autenticada", file: "scratch/test-ai-integration.ts" },
  { name: "7. Prompts de redacción y outline sin Web Search", file: "scratch/test-writing-prompts-and-generation.ts" },
  { name: "8. Validación de HTML TipTap, enlaces y placeholders", file: "scratch/test-draft-validation.ts" },
  { name: "9. Handoff de Composer a post en estado draft", file: "scratch/test-composer-draft-handoff.ts" },
  { name: "10. Prompts de imagen de Composer, brief visual y alt text", file: "scratch/test-image-brief-and-prompts.ts" },
  { name: "11. Persistencia de imágenes en Convex Storage y aislamiento", file: "scratch/test-image-storage-and-persistence.ts" },
  { name: "12. Control de costes de imagen, estimaciones y fallos", file: "scratch/test-image-cost-and-regeneration.ts" },
  { name: "13. Evaluaciones (Evals) multilingües, moderación y ambigüedad", file: "scratch/test-composer-evals.ts" },
  { name: "14. Seguridad, aislamiento multi-tenant e idempotencia", file: "scratch/test-composer-security-isolation.ts" },
  { name: "15. Trazabilidad de citas 1:1 y cero auto-publicación", file: "scratch/test-composer-citations-and-publication.ts" },
  { name: "16. Feature flags, kill switch y canary rollout", file: "scratch/test-composer-flags-and-killswitch.ts" },
  { name: "17. Máquina de estados y camino feliz", file: "scratch/test-composer-state.ts" },
  { name: "18. Persistencia y handoff del camino real", file: "scratch/test-composer-persistence.ts" },
  { name: "19. Visibilidad de Composer y Vapi en el panel", file: "scratch/test-panel-integration-visibility.ts" },
]

function runAllSuites() {
  console.log("===================================================================")
  console.log("EJECUTANDO SUITE UNIFICADA DE VERIFICACIÓN DE IA")
  console.log("===================================================================\n")

  const results: SuiteResult[] = []

  for (const suite of suites) {
    console.log(`\nEjecutando: ${suite.name} (${suite.file})...`)
    try {
      const output = execSync(`pnpm tsx ${suite.file}`, {
        encoding: "utf-8",
        stdio: "pipe",
      })
      console.log(output)
      results.push({ name: suite.name, file: suite.file, success: true, output })
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; message: string }
      console.error(err.stdout || err.stderr || err.message)
      results.push({ name: suite.name, file: suite.file, success: false, output: err.message })
    }
  }

  console.log("\n===================================================================")
  console.log("RESUMEN")
  console.log("===================================================================")

  let allPassed = true
  for (const result of results) {
    if (result.success) {
      console.log(`  [PASS] ${result.name}`)
    } else {
      console.error(`  [FAIL] ${result.name}`)
      allPassed = false
    }
  }
  console.log("===================================================================\n")

  if (!allPassed) {
    console.error("Una o más suites de IA fallaron.")
    process.exit(1)
  }

  console.log("Todas las suites de IA pasaron.")
}

runAllSuites()
