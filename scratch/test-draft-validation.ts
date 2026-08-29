/**
 * Tests unitarios de validación de HTML TipTap, links seguros, ausencia de placeholders y métricas (Issue #17).
 *
 * Usage:
 *   pnpm tsx scratch/test-draft-validation.ts
 */

import {
  parseRawModelJson,
  validateTipTapHtml,
  validateSafeLinks,
  validateNoPlaceholders,
  validateLengthAndTone,
  validateStructuredDraft,
} from "../convex/lib/ai/writingValidation"

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
  console.log("SUITE: Validación de borradores editoriales y guardarraíles")
  console.log("===================================================================\n")

  console.log("▶ 1. Parser de respuestas JSON del modelo")
  const rawPlainJson = `{"title": "Hola Mundo", "content": "<p>Texto</p>"}`
  const parsedPlain = parseRawModelJson(rawPlainJson)
  assert(parsedPlain.title === "Hola Mundo", "Parsea JSON plano correctamente")

  const markdownJson = "```json\n" + rawPlainJson + "\n```"
  const parsedMarkdown = parseRawModelJson(markdownJson)
  assert(parsedMarkdown.title === "Hola Mundo", "Extrae y parsea JSON delimitado por markdown fences")

  let threwMalformed = false
  try {
    parseRawModelJson("No soy un JSON { foo }")
  } catch {
    threwMalformed = true
  }
  assert(threwMalformed, "Lanza error ante salida malformada")

  console.log("\n▶ 2. Validación de HTML y compatibilidad con TipTap")
  const validHtml = `
    <p>Este es el primer párrafo de introducción con <strong>énfasis</strong>.</p>
    <h2>Sección Principal</h2>
    <p>Explicación detallada con un enlace a <a href="https://example.com" target="_blank" rel="noopener noreferrer">la referencia</a>.</p>
    <blockquote><p>Cita de un experto en la materia.</p></blockquote>
    <h3>Subsección de Análisis</h3>
    <ul>
      <li>Punto 1</li>
      <li>Punto 2</li>
    </ul>
    <hr />
    <h2>Fuentes consultadas</h2>
    <ul>
      <li><a href="https://example.com/source">Fuente 1</a> - Editorial</li>
    </ul>
  `
  const validHtmlRes = validateTipTapHtml(validHtml)
  assert(validHtmlRes.errors.length === 0, "HTML válido no tiene errores")

  const htmlWithH1 = `<p>Intro</p><h1>Título no permitido en cuerpo</h1>`
  const h1Res = validateTipTapHtml(htmlWithH1)
  assert(h1Res.errors.some((e) => e.includes("<h1>")), "Detecta y prohíbe etiquetas <h1> en el cuerpo")

  const dangerousHtml = `<p>Texto</p><script>alert('pwned')</script><iframe src="https://evil.com"></iframe>`
  const dangerousRes = validateTipTapHtml(dangerousHtml)
  assert(dangerousRes.errors.length >= 2, "Detecta y bloquea etiquetas peligrosas (<script>, <iframe>)")

  const eventHandlerHtml = `<p>Haz clic <a href="https://test.com" onclick="stealData()">aquí</a></p>`
  const eventRes = validateTipTapHtml(eventHandlerHtml)
  assert(eventRes.errors.some((e) => e.includes("on*")), "Detecta y bloquea controladores de eventos interactivos (onclick)")

  console.log("\n▶ 3. Validación de Enlaces Seguros")
  const safeLinksHtml = `<p>Visita <a href="https://cuaderno.app">Cuaderno</a> o ve a <a href="#seccion">la sección</a>.</p>`
  const safeLinksRes = validateSafeLinks(safeLinksHtml)
  assert(safeLinksRes.errors.length === 0, "Enlaces https y anchors locales son válidos")

  const javascriptLinkHtml = `<p>Enlace malicioso: <a href="javascript:void(0)">Click</a></p>`
  const jsLinkRes = validateSafeLinks(javascriptLinkHtml)
  assert(jsLinkRes.errors.some((e) => e.includes("javascript:")), "Detecta y bloquea esquemas javascript:")

  const dataLinkHtml = `<p>Enlace con datos: <a href="data:text/html,payload">Click</a></p>`
  const dataLinkRes = validateSafeLinks(dataLinkHtml)
  assert(dataLinkRes.errors.some((e) => e.includes("data:")), "Detecta y bloquea esquemas data:")

  console.log("\n▶ 4. Detección de Placeholders y Textos Incompletos")
  const completeText = `<p>Este artículo contiene todo el análisis redactado formalmente.</p>`
  const completeRes = validateNoPlaceholders(completeText)
  assert(completeRes.errors.length === 0, "Texto completo no tiene errores de placeholders")

  const placeholderTodo = `<p>La conclusión es la siguiente: [TODO: Completar después de la revisión]</p>`
  const todoRes = validateNoPlaceholders(placeholderTodo)
  assert(todoRes.errors.length > 0, "Detecta placeholder [TODO: ...]")

  const placeholderInsert = `<p>Según reportó [Inserte nombre de la empresa], los ingresos aumentaron.</p>`
  const insertRes = validateNoPlaceholders(placeholderInsert)
  assert(insertRes.errors.length > 0, "Detecta placeholder [Inserte ...]")

  const placeholderLorem = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`
  const loremRes = validateNoPlaceholders(placeholderLorem)
  assert(loremRes.errors.length > 0, "Detecta texto de relleno Lorem ipsum")

  const placeholderMustache = `<p>Autor del estudio: {{author_name}}.</p>`
  const mustacheRes = validateNoPlaceholders(placeholderMustache)
  assert(mustacheRes.errors.length > 0, "Detecta placeholder de plantilla {{...}}")

  console.log("\n▶ 5. Validación Completa de Borrador Estructurado")
  const validDraftData = {
    title: "Guía de Arquitectura de Software Limpia",
    suggestedSlug: "guia-arquitectura-software-limpia",
    excerpt: "Aprende cómo estructurar tus aplicaciones desacoplando el dominio de la infraestructura técnica.",
    content: validHtml,
    headings: [
      { text: "Sección Principal", level: 2 },
      { text: "Subsección de Análisis", level: 3 },
      { text: "Fuentes consultadas", level: 2 },
    ],
    metaDescription: "Guía práctica sobre arquitectura limpia y desacoplamiento en TypeScript.",
    suggestedCategories: ["Desarrollo", "Arquitectura"],
    suggestedTags: ["typescript", "clean-architecture", "node"],
    callToAction: "¿Cómo aplicas estos principios en tu día a día?",
  }

  const validDraftResult = validateStructuredDraft(validDraftData, { targetLength: 1000 })
  assert(validDraftResult.valid === true, "Borrador estructurado y completo es válido")
  assert(validDraftResult.parsedDraft?.title === validDraftData.title, "Preserva título validado")
  assert(validDraftResult.parsedDraft?.suggestedSlug === validDraftData.suggestedSlug, "Preserva slug validado")
  assert(validDraftResult.parsedDraft?.suggestedTags?.length === 3, "Preserva etiquetas sugeridas")

  const invalidDraftData = {
    title: "Hi", // Demasiado corto
    excerpt: "Short", // Demasiado corto
    content: "<script>alert(1)</script><p>Lorem ipsum</p>", // Peligroso y con placeholder
  }
  const invalidDraftResult = validateStructuredDraft(invalidDraftData)
  assert(invalidDraftResult.valid === false, "Borrador inválido es rechazado")
  assert(invalidDraftResult.errors.length >= 3, "Reporta todos los errores acumulados (título, excerpt, script, lorem)")

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
