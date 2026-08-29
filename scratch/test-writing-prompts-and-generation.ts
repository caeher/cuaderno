/**
 * Tests unitarios de prompts de redacción, esquematización (Outline) y configuración (Issue #17).
 *
 * Usage:
 *   pnpm tsx scratch/test-writing-prompts-and-generation.ts
 */

import { getTextPhaseConfig } from "../convex/lib/ai/config"
import {
  buildOutlineSystemPrompt,
  buildOutlineUserPrompt,
  buildWritingSystemPrompt,
  buildWritingUserPrompt,
  type WritingBriefInput,
  type WritingSourceInput,
  type OutlineStructure,
} from "../convex/lib/ai/writingPrompts"

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
  console.log("SUITE: Prompts de redacción, outline y configuración de servidor")
  console.log("===================================================================\n")

  console.log("▶ 1. Configuración de IA para la fase de redacción (Invariante: Sin Web Search)")
  const writingConfig = getTextPhaseConfig("writing")
  assert(writingConfig.phase === "writing", "Fase es 'writing'")
  assert(writingConfig.webSearch === false, "Web Search está ESTRICTAMENTE deshabilitado en redacción")
  assert(writingConfig.model === "gpt-5.6-luna", "Modelo por defecto es gpt-5.6-luna")

  console.log("\n▶ 2. Prompts de Esquematización (Outline)")
  const outlineSystemPrompt = buildOutlineSystemPrompt()
  assert(
    outlineSystemPrompt.includes("DATOS EXTERNOS") || outlineSystemPrompt.includes("untrusted"),
    "Outline system prompt incluye directiva contra Prompt Injection"
  )
  assert(
    outlineSystemPrompt.includes("suggestedTitle") && outlineSystemPrompt.includes("sections"),
    "Outline system prompt especifica formato JSON estructurado"
  )
  assert(
    outlineSystemPrompt.includes("PROHIBIDO inventar"),
    "Outline system prompt prohíbe inventar fuentes no aprobadas"
  )

  const sampleBrief: WritingBriefInput = {
    topic: "Arquitectura Hexagonal en TypeScript y Next.js",
    objective: "Explicar los beneficios de desacoplar dominio de infraestructura",
    audience: "Desarrolladores Fullstack",
    language: "es",
    tone: "técnico y didáctico",
    targetLength: 1500,
    targetCountry: "España",
    seoKeywords: ["arquitectura hexagonal", "typescript", "clean architecture"],
    constraints: "Incluir ejemplos prácticos de puertos y adaptadores",
    callToAction: "¿Qué patrón de arquitectura utilizas en tus proyectos?",
  }

  const sampleSources: WritingSourceInput[] = [
    {
      url: "https://martinfowler.com/bliki/HexagonalArchitecture.html",
      title: "Hexagonal Architecture",
      publisher: "Martin Fowler",
      snippet: "Allow an application to equally be driven by users, programs, automated test or batch scripts.",
      claims: [
        { text: "El núcleo de la aplicación permanece desacoplado de frameworks e infraestructura.", status: "confirmed" },
      ],
    },
    {
      url: "https://spam.com/fake",
      title: "Fuente excluida",
      isExcluded: true,
    },
  ]

  const outlineUserPrompt = buildOutlineUserPrompt(sampleBrief, sampleSources)
  assert(outlineUserPrompt.includes(sampleBrief.topic!), "Outline user prompt contiene el tema del brief")
  assert(outlineUserPrompt.includes("martinfowler.com"), "Outline user prompt incluye fuente aprobada")
  assert(!outlineUserPrompt.includes("spam.com/fake"), "Outline user prompt excluye fuentes marcadas con isExcluded: true")

  console.log("\n▶ 3. Prompts de Redacción Completa (Writing Draft)")
  const writingSystemPrompt = buildWritingSystemPrompt()
  assert(
    writingSystemPrompt.includes("TipTap"),
    "Writing system prompt instruye formato HTML compatible con TipTap"
  )
  assert(
    writingSystemPrompt.includes("Fuentes consultadas"),
    "Writing system prompt exige sección obligatoria de 'Fuentes consultadas' al final"
  )
  assert(
    writingSystemPrompt.includes("PROHIBICIÓN ABSOLUTA DE PLACEHOLDERS"),
    "Writing system prompt prohíbe placeholders como [TODO] o [Inserte aquí]"
  )
  assert(
    writingSystemPrompt.includes("suggestedSlug") && writingSystemPrompt.includes("metaDescription"),
    "Writing system prompt exige salida JSON estructurada con metadatos SEO"
  )

  const sampleOutline: OutlineStructure = {
    suggestedTitle: "Dominando la Arquitectura Hexagonal en TypeScript",
    summary: "Guía práctica para construir aplicaciones desacopladas y mantenibles.",
    estimatedTotalWords: 1500,
    sections: [
      {
        title: "Fundamentos de los Puertos y Adaptadores",
        level: 2,
        description: "Explicación conceptual de los límites de la aplicación",
        keyPoints: ["Entidades puras", "Inversión de dependencias"],
        targetWordCount: 500,
      },
    ],
  }

  const writingUserPrompt = buildWritingUserPrompt(sampleBrief, sampleSources, sampleOutline)
  assert(writingUserPrompt.includes(sampleBrief.topic!), "Writing user prompt incluye el tema del brief")
  assert(writingUserPrompt.includes(sampleOutline.suggestedTitle), "Writing user prompt incluye título del esquema")
  assert(writingUserPrompt.includes("Fundamentos de los Puertos y Adaptadores"), "Writing user prompt incluye secciones del outline")
  assert(writingUserPrompt.includes("martinfowler.com"), "Writing user prompt incluye fuentes para citación")
  assert(!writingUserPrompt.includes("spam.com/fake"), "Writing user prompt filtra fuentes descartadas")

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
