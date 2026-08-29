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
  { name: "1. Configuración global de modelos", file: "scratch/test-ai-config.ts" },
  { name: "2. Seguridad y frontera de cliente", file: "scratch/test-ai-security.ts" },
  { name: "3. Integración autenticada", file: "scratch/test-ai-integration.ts" },
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
