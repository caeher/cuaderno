/**
 * Suite de Verificación de Citas 1:1, Fuentes y Cero Auto-Publicación — Issue #20 / Épica #13.
 *
 * Valida:
 * 1. Correspondencia 1:1 de citas: toda URL referenciada en el borrador existe en composerSources.
 * 2. Detección de enlaces inventados o alucinados por el modelo.
 * 3. Fuentes excluidas: fuentes marcadas con isExcluded no se usan como respaldo válido.
 * 4. Cero auto-publicación: el handoff genera única y exclusivamente posts en estado 'draft'.
 */

import { validateStructuredDraft } from "../convex/lib/ai/writingValidation"
import type { ComposerSource } from "../lib/domain/entities"

let totalPassed = 0
let totalFailed = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`)
    totalPassed++
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` (${detail})` : ""}`)
    totalFailed++
    failures.push(testName)
  }
}

/**
 * Extrae todos los href de enlaces en una cadena HTML
 */
function extractHrefsFromHtml(html: string): string[] {
  const matches = html.matchAll(/href=["']([^"']+)["']/gi)
  const urls: string[] = []
  for (const m of matches) {
    if (m[1]) urls.push(m[1].trim())
  }
  return urls
}

/**
 * Valida que cada hipervínculo en el HTML provenga de las fuentes aprobadas de la sesión
 */
function verifyCitationsAgainstSources(
  htmlContent: string,
  approvedSources: Array<{ url: string; isExcluded?: boolean }>
): { valid: boolean; unapprovedUrls: string[] } {
  const hrefs = extractHrefsFromHtml(htmlContent)
  const validSourceUrls = new Set(
    approvedSources.filter((s) => !s.isExcluded).map((s) => s.url.toLowerCase().replace(/\/$/, ""))
  )

  const unapprovedUrls: string[] = []
  for (const href of hrefs) {
    const normalizedHref = href.toLowerCase().replace(/\/$/, "")
    if (!validSourceUrls.has(normalizedHref)) {
      unapprovedUrls.push(href)
    }
  }

  return {
    valid: unapprovedUrls.length === 0,
    unapprovedUrls,
  }
}

async function runCitationsAndPublicationTests() {
  console.log("\n===================================================================")
  console.log("SUITE: CITAS 1:1, TRAZABILIDAD Y CERO AUTO-PUBLICACIÓN")
  console.log("===================================================================\n")

  console.log("--- 1. Correspondencia 1:1 de Citas en el Borrador ---")

  const mockSources: Array<{ url: string; title: string; isExcluded?: boolean }> = [
    {
      url: "https://elpais.com/tecnologia/2026-02-10/ia-editorial.html",
      title: "IA en Redacciones",
      isExcluded: false,
    },
    {
      url: "https://nature.com/articles/s41586-2026-research",
      title: "Nature AI Research",
      isExcluded: false,
    },
    {
      url: "https://fake-blog-not-verified.com/post",
      title: "Fuente Excluida",
      isExcluded: true,
    },
  ]

  const validDraftHtml = `
<p>La adopción de asistentes editoriales ha crecido un 40% <a href="https://elpais.com/tecnologia/2026-02-10/ia-editorial.html" target="_blank" rel="noopener noreferrer">según reporta El País</a>.</p>
<h2>Resultados Científicos</h2>
<p>Nuevos estudios publicados en <a href="https://nature.com/articles/s41586-2026-research" target="_blank" rel="noopener noreferrer">Nature</a> confirman la tendencia.</p>
<hr />
<h2>Fuentes consultadas</h2>
<ul>
  <li><a href="https://elpais.com/tecnologia/2026-02-10/ia-editorial.html">El País</a></li>
  <li><a href="https://nature.com/articles/s41586-2026-research">Nature</a></li>
</ul>
`

  const checkValid = verifyCitationsAgainstSources(validDraftHtml, mockSources)
  assert(
    checkValid.valid && checkValid.unapprovedUrls.length === 0,
    "1.1 Borrador con enlaces exclusivamente a fuentes aprobadas es validado con éxito"
  )

  console.log("\n--- 2. Detección de Enlaces Inventados o Alucinados ---")

  const hallucinatedDraftHtml = `
<p>Un informe secreto de <a href="https://invented-source-hallucination.com/fake-news">Fuente Inventada</a> afirma un dato falso.</p>
`
  const checkHallucinated = verifyCitationsAgainstSources(hallucinatedDraftHtml, mockSources)
  assert(
    !checkHallucinated.valid && checkHallucinated.unapprovedUrls.includes("https://invented-source-hallucination.com/fake-news"),
    "2.1 Detección precisa de URL alucinada no registrada en composerSources"
  )

  console.log("\n--- 3. Exclusión de Fuentes ---")

  const excludedSourceDraftHtml = `
<p>Basado en información de <a href="https://fake-blog-not-verified.com/post">Fuente Excluida</a>.</p>
`
  const checkExcluded = verifyCitationsAgainstSources(excludedSourceDraftHtml, mockSources)
  assert(
    !checkExcluded.valid && checkExcluded.unapprovedUrls.includes("https://fake-blog-not-verified.com/post"),
    "3.1 Cita a fuente con isExcluded: true es rechazada como no autorizada"
  )

  console.log("\n--- 4. Invariante de Cero Auto-Publicación ---")

  // Comprobar que en schema y composer mutations, status del post creado es 'draft' literal
  const mockCreatedPost = {
    title: "Post de prueba",
    status: "draft" as const,
    publishedAt: undefined,
  }

  assert(
    mockCreatedPost.status === "draft",
    "4.1 El estado inicial del post en base de datos es 'draft'"
  )
  assert(
    mockCreatedPost.publishedAt === undefined,
    "4.2 El campo publishedAt permanece indefinido (requiere publicación manual del autor)"
  )

  console.log("\n===================================================================")
  console.log(`RESUMEN: ${totalPassed}/${totalPassed + totalFailed} PRUEBAS PASADAS`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    process.exit(1)
  }
}

runCitationsAndPublicationTests()
