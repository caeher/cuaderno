/**
 * Unified Narration Verification Runner
 *
 * Runs all narration test suites in sequence:
 * 1. Domain, script sanitization & basic contracts (test-narration-job.ts)
 * 2. Vapi fault injection & simulation suite (test-vapi-narration-fault-injection.ts)
 * 3. Security, zero secret leakage & multi-tenant isolation (test-narration-security-and-isolation.ts)
 * 4. Audio player accessibility & UX contracts (test-audio-player-accessibility.ts)
 *
 * Usage:
 *   pnpm tsx scratch/run-narration-verification.ts
 */

import { execSync } from "child_process"

interface SuiteResult {
  name: string
  file: string
  success: boolean
  output: string
}

const suites = [
  { name: "1. Dominio, Sanitización y Validador", file: "scratch/test-narration-job.ts" },
  { name: "2. Tolerancia a Fallos y Simulación Vapi", file: "scratch/test-vapi-narration-fault-injection.ts" },
  { name: "3. Seguridad, Privacidad y Aislamiento Multi-Tenant", file: "scratch/test-narration-security-and-isolation.ts" },
  { name: "4. Accesibilidad y Contratos UX del Reproductor", file: "scratch/test-audio-player-accessibility.ts" },
]

async function runAllSuites() {
  console.log("===================================================================")
  console.log("🎙️  EJECUTANDO SUITE UNIFICADA DE VERIFICACIÓN DE NARRACIONES VAPI")
  console.log("===================================================================\n")

  const results: SuiteResult[] = []

  for (const s of suites) {
    console.log(`\n⏳ Ejecutando: ${s.name} (${s.file})...`)
    try {
      const output = execSync(`pnpm tsx ${s.file}`, {
        encoding: "utf-8",
        stdio: "pipe",
      })
      console.log(output)
      results.push({ name: s.name, file: s.file, success: true, output })
    } catch (err: any) {
      console.error(err.stdout || err.stderr || err.message)
      results.push({ name: s.name, file: s.file, success: false, output: err.message })
    }
  }

  console.log("\n===================================================================")
  console.log("📊 RESUMEN EJECUTIVO DE SUITES DE NARRACIÓN")
  console.log("===================================================================")

  let allPassed = true
  for (const r of results) {
    if (r.success) {
      console.log(`  ✅ [PASS] ${r.name}`)
    } else {
      console.error(`  ❌ [FAIL] ${r.name}`)
      allPassed = false
    }
  }
  console.log("===================================================================\n")

  if (!allPassed) {
    console.error("❌ Una o más suites de narración fallaron.")
    process.exit(1)
  } else {
    console.log("🎉 ¡Todas las suites de prueba de narración pasaron con 100% de éxito!")
  }
}

runAllSuites().catch((err) => {
  console.error("Error fatal en el runner unificado:", err)
  process.exit(1)
})
