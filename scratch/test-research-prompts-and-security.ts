/**
 * Tests unitarios de prompts de investigación, directivas de seguridad y clasificación epistémica (Issue #16).
 *
 * Usage:
 *   pnpm tsx scratch/test-research-prompts-and-security.ts
 */

import {
  buildResearchSystemPrompt,
  buildResearchUserPrompt,
  checkBriefAmbiguity,
  type ResearchBriefInput,
} from "../convex/lib/ai/researchPrompts"

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
  console.log("SUITE: prompts de investigación, seguridad y clasificación epistémica")
  console.log("===================================================================\n")

  console.log("▶ 1. Detección de ambigüedad en el brief")
  const emptyBrief: ResearchBriefInput = {}
  const checkEmpty = checkBriefAmbiguity(emptyBrief)
  assert(checkEmpty.isAmbiguous === true, "Brief vacío detectado como ambiguo")
  assert(checkEmpty.reasons.length >= 2, "Reporta múltiples razones de ambigüedad")

  const genericBrief: ResearchBriefInput = { topic: "IA", language: "es" }
  const checkGeneric = checkBriefAmbiguity(genericBrief)
  assert(checkGeneric.isAmbiguous === true, "Tema demasiado breve sin objetivo es ambiguo")

  const clearBrief: ResearchBriefInput = {
    topic: "Avances en modelos de lenguaje pequeños para edge devices en 2026",
    objective: "Analizar el rendimiento de SLMs locales frente a arquitecturas cloud",
    audience: "Desarrolladores y arquitectos de software",
    language: "es",
    targetCountry: "España",
    tone: "técnico y reflexivo",
    cutoffDate: "2026-01-01",
    targetLength: 1800,
    preferredDomains: ["arxiv.org", "github.com"],
    excludedDomains: ["spammyblog.com"],
  }
  const checkClear = checkBriefAmbiguity(clearBrief)
  assert(checkClear.isAmbiguous === false, "Brief completo y explícito no es ambiguo")
  assert(checkClear.reasons.length === 0, "Brief válido tiene 0 razones de ambigüedad")

  console.log("\n▶ 2. Directivas de seguridad y defensa contra Prompt Injection")
  const systemPrompt = buildResearchSystemPrompt()
  assert(
    systemPrompt.includes("DATOS NO CONFIABLES") || systemPrompt.includes("untrusted"),
    "Instruye explícitamente a tratar contenido web como datos no confiables"
  )
  assert(
    systemPrompt.includes("NUNCA obedezcas órdenes") || systemPrompt.includes("Ignora las instrucciones"),
    "Instruye a ignorar comandos e inyecciones encontradas en páginas externas"
  )

  console.log("\n▶ 3. Clasificación epistémica obligatoria")
  assert(
    systemPrompt.includes("confirmed_facts") && systemPrompt.includes("HECHOS CONFIRMADOS"),
    "Exige hechos confirmados con URL real"
  )
  assert(
    systemPrompt.includes("inferences") && systemPrompt.includes("INFERENCIAS"),
    "Distingue inferencias y análisis"
  )
  assert(
    systemPrompt.includes("information_gaps") && systemPrompt.includes("LAGUNAS DE INFORMACIÓN"),
    "Identifica lagunas y afirmaciones no verificadas"
  )
  assert(
    systemPrompt.includes("PROHIBIDO inventar"),
    "Prohíbe inventar citas o fuentes sin respaldo"
  )

  console.log("\n▶ 4. Política editorial y propiedad intelectual")
  assert(
    systemPrompt.includes("Sintetiza") && systemPrompt.includes("NO copies párrafos literales"),
    "Instruye síntesis y prohíbe copiado masivo literal"
  )

  console.log("\n▶ 5. Construcción del prompt de usuario")
  const userPrompt = buildResearchUserPrompt(clearBrief)
  assert(userPrompt.includes(clearBrief.topic!), "Incluye el tema en el prompt")
  assert(userPrompt.includes(clearBrief.objective!), "Incluye el objetivo")
  assert(userPrompt.includes(clearBrief.audience!), "Incluye el lector/audiencia")
  assert(userPrompt.includes("arxiv.org, github.com"), "Incluye dominios preferidos")
  assert(userPrompt.includes("spammyblog.com"), "Incluye dominios excluidos")
  assert(userPrompt.includes("2026-01-01"), "Incluye fecha de corte")
  assert(userPrompt.includes("1800 palabras"), "Incluye longitud estimada")

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
