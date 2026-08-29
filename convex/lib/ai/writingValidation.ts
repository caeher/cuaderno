/**
 * Validadores y guardarraíles para la fase de Redacción y Esquematización (Issue #17).
 *
 * Funciones de validación:
 * 1. `parseAndValidateStructuredDraft`: Parsea el JSON del modelo y valida campos requeridos.
 * 2. `validateTipTapHtml`: Comprueba que el HTML cumpla con las etiquetas semánticas admitidas por TipTap.
 * 3. `validateSafeLinks`: Asegura que todos los enlaces usen HTTP/HTTPS y protocolos seguros.
 * 4. `validateNoPlaceholders`: Verifica la ausencia total de comodines y texto sin redactar.
 * 5. `validateLengthAndTone`: Evalúa longitud y métricas contra el brief.
 */

import type { WritingBriefInput } from "./writingPrompts"

export interface StructuredDraftOutput {
  title: string
  suggestedSlug: string
  excerpt: string
  content: string
  headings: Array<{ text: string; level: number }>
  metaDescription: string
  suggestedCategories?: string[]
  suggestedTags?: string[]
  callToAction?: string
}

export interface ValidationIssue {
  field?: string
  message: string
  severity: "error" | "warning"
}

export interface DraftValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  parsedDraft?: StructuredDraftOutput
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Parsing y Estructura del JSON
// ─────────────────────────────────────────────────────────────────────────────

export function parseRawModelJson<T = any>(rawText: string): T {
  const trimmed = rawText.trim()
  // Extraer bloque JSON si viene envuelto en markdown ```json ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed

  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    throw new Error(
      `El modelo no devolvió un JSON estructurado válido: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export function validateStructuredDraft(
  data: any,
  brief?: WritingBriefInput
): DraftValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: ["La respuesta generada no es un objeto válido."],
      warnings: [],
    }
  }

  // Validar Título
  const title = typeof data.title === "string" ? data.title.trim() : ""
  if (!title || title.length < 5) {
    errors.push("El título es obligatorio y debe tener al menos 5 caracteres.")
  } else if (title.length > 200) {
    warnings.push("El título es excesivamente largo (> 200 caracteres).")
  }

  // Validar Slug
  const suggestedSlug =
    typeof data.suggestedSlug === "string" && data.suggestedSlug.trim()
      ? data.suggestedSlug.trim()
      : typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : title
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80)

  // Validar Extracto (Excerpt)
  const excerpt = typeof data.excerpt === "string" ? data.excerpt.trim() : ""
  if (!excerpt || excerpt.length < 10) {
    errors.push("El extracto es obligatorio y debe tener al menos 10 caracteres.")
  } else if (excerpt.length > 300) {
    warnings.push("El extracto supera los 300 caracteres recomendados.")
  }

  // Validar Contenido HTML
  const content = typeof data.content === "string" ? data.content.trim() : ""
  if (!content || content.length < 50) {
    errors.push("El contenido del artículo está vacío o es demasiado breve.")
  }

  // Validar Headings
  let headings: Array<{ text: string; level: number }> = []
  if (Array.isArray(data.headings)) {
    headings = data.headings
      .filter((h: any) => h && typeof h.text === "string")
      .map((h: any) => ({
        text: String(h.text).trim(),
        level: typeof h.level === "number" && h.level >= 2 && h.level <= 4 ? h.level : 2,
      }))
  }

  // Validar Meta Description
  const metaDescription =
    typeof data.metaDescription === "string" ? data.metaDescription.trim() : excerpt.slice(0, 160)

  // Validar Taxonomías
  const suggestedCategories = Array.isArray(data.suggestedCategories)
    ? data.suggestedCategories.filter((c: any) => typeof c === "string" && c.trim().length > 0)
    : []

  const suggestedTags = Array.isArray(data.suggestedTags)
    ? data.suggestedTags.filter((t: any) => typeof t === "string" && t.trim().length > 0)
    : []

  // Validaciones profundas sobre el contenido HTML
  if (content) {
    // 2. HTML y TipTap
    const htmlIssues = validateTipTapHtml(content)
    errors.push(...htmlIssues.errors)
    warnings.push(...htmlIssues.warnings)

    // 3. Links seguros
    const linkIssues = validateSafeLinks(content)
    errors.push(...linkIssues.errors)
    warnings.push(...linkIssues.warnings)

    // 4. Placeholders
    const placeholderIssues = validateNoPlaceholders(content)
    errors.push(...placeholderIssues.errors)
    warnings.push(...placeholderIssues.warnings)

    // 5. Longitud
    if (brief) {
      const lengthIssues = validateLengthAndTone(content, brief)
      warnings.push(...lengthIssues.warnings)
    }
  }

  const parsedDraft: StructuredDraftOutput = {
    title,
    suggestedSlug,
    excerpt,
    content,
    headings,
    metaDescription,
    suggestedCategories,
    suggestedTags,
    callToAction: typeof data.callToAction === "string" ? data.callToAction.trim() : undefined,
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsedDraft: errors.length === 0 ? parsedDraft : undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Validación de HTML y Compatibilidad con TipTap
// ─────────────────────────────────────────────────────────────────────────────

const DISALLOWED_HTML_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "link",
  "meta",
  "h1", // En Cuaderno H1 está reservado para el título del post
]

export function validateTipTapHtml(html: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Buscar etiquetas no permitidas o peligrosas
  for (const tag of DISALLOWED_HTML_TAGS) {
    const regex = new RegExp(`<\\s*${tag}\\b[^>]*>`, "i")
    if (regex.test(html)) {
      if (tag === "h1") {
        errors.push("El contenido no debe contener etiquetas <h1>. Utiliza <h2> y <h3> para estructurar las secciones.")
      } else {
        errors.push(`Etiqueta HTML no permitida o peligrosa detectada: <${tag}>.`)
      }
    }
  }

  // Buscar controladores de eventos peligrosos (onclick, onerror, onload, etc.)
  const eventHandlerRegex = /\s+on[a-z]+\s*=\s*["'][^"']*["']/i
  if (eventHandlerRegex.test(html)) {
    errors.push("Se detectaron atributos de eventos interactivos no seguros (on*).")
  }

  // Verificar que contenga al menos algunos párrafos o encabezados
  if (!/<p\b/i.test(html)) {
    warnings.push("El contenido no parece tener etiquetas de párrafo <p>.")
  }

  return { errors, warnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Validación de Enlaces Seguros
// ─────────────────────────────────────────────────────────────────────────────

export function validateSafeLinks(html: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const hrefRegex = /href\s*=\s*["']([^"']*)["']/gi
  let match: RegExpExecArray | null

  while ((match = hrefRegex.exec(html)) !== null) {
    const rawUrl = match[1].trim()
    if (!rawUrl) continue

    // Bloquear esquemas peligrosos
    if (/^(javascript:|data:|vbscript:|file:)/i.test(rawUrl)) {
      errors.push(`Enlace con protocolo peligroso detectado: "${rawUrl.slice(0, 30)}..."`)
      continue
    }

    // Aceptar anchors locales (#seccion) o URLs con protocolo http/https
    if (rawUrl.startsWith("#") || rawUrl.startsWith("/")) {
      continue
    }

    try {
      const parsed = new URL(rawUrl)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.push(`Protocolo de enlace no admitido (${parsed.protocol}) en "${rawUrl}".`)
      }
    } catch {
      errors.push(`Enlace con URL mal formada: "${rawUrl}".`)
    }
  }

  return { errors, warnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Ausencia de Placeholders y Comodines
// ─────────────────────────────────────────────────────────────────────────────

const FORBIDDEN_PLACEHOLDERS = [
  /\[\s*inserte\s+[^\]]+\]/i,
  /\[\s*insert\s+[^\]]+\]/i,
  /\[\s*todo\b[^\]]*\]/i,
  /\[\s*completar\b[^\]]*\]/i,
  /\[\s*pendiente\b[^\]]*\]/i,
  /\[\s*nombre\s+del\s+autor\s*\]/i,
  /\[\s*url\s+de\s+la\s+fuente\s*\]/i,
  /\{\{\s*[\w.-]+\s*\}\}/i,
  /<placeholder>/i,
  /\blorem\s+ipsum\b/i,
]

export function validateNoPlaceholders(text: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  for (const pattern of FORBIDDEN_PLACEHOLDERS) {
    const match = text.match(pattern)
    if (match) {
      errors.push(`Se detectó un marcador de posición o texto incompleto: "${match[0]}". El artículo debe estar completamente redactado.`)
    }
  }

  return { errors, warnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Validación de Longitud y Tono
// ─────────────────────────────────────────────────────────────────────────────

export function countWordsInHtml(html: string): number {
  const plainText = html.replace(/<[^>]+>/g, " ").trim()
  if (!plainText) return 0
  return plainText.split(/\s+/).filter(Boolean).length
}

export function validateLengthAndTone(
  html: string,
  brief: WritingBriefInput
): { warnings: string[] } {
  const warnings: string[] = []
  const wordCount = countWordsInHtml(html)

  if (wordCount < 100) {
    warnings.push(`El artículo es muy corto (${wordCount} palabras).`)
  }

  if (brief.targetLength && brief.targetLength > 0) {
    const lowerBound = Math.floor(brief.targetLength * 0.5)
    const upperBound = Math.ceil(brief.targetLength * 1.6)

    if (wordCount < lowerBound) {
      warnings.push(
        `La longitud del artículo (${wordCount} palabras) está significativamente por debajo del objetivo de ${brief.targetLength} palabras.`
      )
    } else if (wordCount > upperBound) {
      warnings.push(
        `La longitud del artículo (${wordCount} palabras) supera considerablemente el objetivo de ${brief.targetLength} palabras.`
      )
    }
  }

  return { warnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Citas 1:1 contra composerSources
// ─────────────────────────────────────────────────────────────────────────────

export function extractHrefsFromHtml(html: string): string[] {
  const matches = html.matchAll(/href=["']([^"']+)["']/gi)
  const urls: string[] = []
  for (const match of matches) {
    if (match[1]) urls.push(match[1].trim())
  }
  return urls
}

function normalizeCitationUrl(rawUrl: string): string {
  return rawUrl.toLowerCase().replace(/\/+$/, "")
}

/**
 * Cada href http(s) del artículo debe pertenecer a una fuente no excluida.
 * Anchors locales, rutas internas y protocolos no web se ignoran aquí:
 * `validateSafeLinks` ya bloquea javascript:/data:.
 */
export function verifyCitationsAgainstSources(
  htmlContent: string,
  approvedSources: Array<{ url: string; isExcluded?: boolean }>
): { valid: boolean; unapprovedUrls: string[] } {
  const hrefs = extractHrefsFromHtml(htmlContent)
  const validSourceUrls = new Set(
    approvedSources
      .filter((source) => !source.isExcluded)
      .map((source) => normalizeCitationUrl(source.url))
  )

  const unapprovedUrls: string[] = []
  for (const href of hrefs) {
    if (href.startsWith("#") || href.startsWith("/")) continue
    if (!/^https?:\/\//i.test(href)) continue

    const normalizedHref = normalizeCitationUrl(href)
    if (!validSourceUrls.has(normalizedHref)) {
      unapprovedUrls.push(href)
    }
  }

  return {
    valid: unapprovedUrls.length === 0,
    unapprovedUrls,
  }
}
