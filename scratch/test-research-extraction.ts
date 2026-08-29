/**
 * Tests de extracción y normalización de fuentes para investigación (Issue #16).
 *
 * Usage:
 *   pnpm tsx scratch/test-research-extraction.ts
 */

import {
  canonicalizeUrl,
  extractDomainFromUrl,
  extractSources,
} from "../convex/lib/ai/client"
import type { Response } from "openai/resources/responses/responses"

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
  console.log("SUITE: extracción, normalización y deduplicación de fuentes")
  console.log("===================================================================\n")

  console.log("▶ 1. Extracción y normalización de dominios")
  assert(
    extractDomainFromUrl("https://www.nature.com/articles/s41586-024") === "nature.com",
    "Remueve prefijo www y extrae dominio"
  )
  assert(
    extractDomainFromUrl("http://blog.cloudflare.com/post-name/") === "blog.cloudflare.com",
    "Preserva subdominios relevantes"
  )
  assert(
    extractDomainFromUrl("not-a-valid-url") === undefined,
    "Devuelve undefined para URLs malformadas"
  )

  console.log("\n▶ 2. Canonicalización de URLs y eliminación de tracking")
  const dirtyUrl = "https://techcrunch.com/2026/02/ai-trends?utm_source=twitter&utm_medium=social&fbclid=12345#section"
  const cleanUrl = canonicalizeUrl(dirtyUrl)
  assert(
    cleanUrl === "https://techcrunch.com/2026/02/ai-trends",
    "Limpia parámetros de tracking (utm_*, fbclid) y hash"
  )

  console.log("\n▶ 3. Extracción combinada de fuentes desde Responses API")
  const mockResponse: any = {
    id: "resp-test-123",
    model: "gpt-5.6-luna",
    output: [
      {
        type: "web_search_call",
        action: {
          sources: [
            {
              url: "https://openai.com/index/announcing-new-features/?utm_campaign=launch",
              title: "Announcing New Features",
              snippet: "We are introducing smaller models.",
              publisher: "OpenAI Blog",
            },
            {
              url: "https://github.com/blog/announcement",
              title: "GitHub Updates",
            },
          ],
        },
      },
      {
        type: "message",
        content: [
          {
            type: "output_text",
            annotations: [
              {
                type: "url_citation",
                url: "https://www.nature.com/articles/123",
                title: "Nature Scientific Paper",
              },
            ],
          },
        ],
      },
    ],
    output_text: JSON.stringify({
      summary: "Resumen de la investigación.",
      confirmed_facts: [
        {
          claim: "Los nuevos modelos son 3 veces más eficientes.",
          source_url: "https://openai.com/index/announcing-new-features",
          source_title: "Announcing New Features",
          snippet: "Efficiency increased 3x.",
          publisher: "OpenAI Blog",
        },
      ],
      inferences: [
        {
          point: "Habrá mayor adopción en dispositivos locales.",
          rationale: "Debido a la reducción de latencia.",
        },
      ],
      information_gaps: [],
      suggested_outline: [],
    }),
  }

  const sources = extractSources(mockResponse as Response)

  assert(sources.length === 3, `Extrae 3 fuentes únicas sin duplicados (obtenidas: ${sources.length})`)

  const openaiSource = sources.find((s) => s.domain === "openai.com")
  assert(Boolean(openaiSource), "Encuentra fuente de openai.com")
  assert(
    openaiSource?.url === "https://openai.com/index/announcing-new-features",
    "URL de OpenAI normalizada y canonicalizada"
  )
  assert(
    Boolean(openaiSource?.claims && openaiSource.claims.length === 1),
    "Asocia afirmación estructurada a la fuente"
  )
  assert(
    Boolean(openaiSource?.claims?.[0]?.status === "confirmed"),
    "Marca la afirmación como confirmed"
  )

  const natureSource = sources.find((s) => s.domain === "nature.com")
  assert(Boolean(natureSource), "Captura fuente anotada en url_citation")
  assert(natureSource?.title === "Nature Scientific Paper", "Preserva título de la cita")

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
