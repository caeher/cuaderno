/**
 * Prompts y utilidades para generación de imágenes de Composer — Issue #18.
 *
 * Responsabilidades:
 * - Generar un prompt visual optimizado para portadas de blog a partir del brief y del borrador/outline.
 * - Garantizar composición horizontal con espacio negativo y sin texto/palabras incrustadas.
 * - Generar texto alternativo (alt text) accesible en español (WCAG / SEO, < 125 caracteres).
 * - Blindar el prompt visual contra Prompt Injection proveniente de campos de usuario.
 */

export interface ComposerVisualBriefInput {
  topic?: string
  objective?: string
  audience?: string
  tone?: string
  language?: string
  constraints?: string
  title?: string
  excerpt?: string
}

export interface GeneratedVisualBrief {
  prompt: string
  altText: string
  suggestedStyle: string
  aspectRatio: "16:9" | "3:1" | "1:1"
}

/**
 * Sanitiza texto de usuario para evitar que inyecte directivas en el generador de imágenes.
 */
function sanitizeInput(text: string | undefined): string {
  if (!text) return ""
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/[{}[\]<>]/g, "")
    .trim()
}

/**
 * Genera un texto alternativo (alt text) accesible y descriptivo en español.
 */
export function generateSuggestedAltText(args: {
  topic?: string
  title?: string
  visualSubject?: string
}): string {
  const subject = args.visualSubject?.trim()
  const title = args.title?.trim()
  const topic = args.topic?.trim()

  let base = ""
  if (subject) {
    base = subject
  } else if (title) {
    base = `Ilustración conceptual para el artículo sobre ${title}`
  } else if (topic) {
    base = `Imagen de portada representativa de ${topic}`
  } else {
    base = "Imagen de portada editorial para la publicación"
  }

  // Normalizar y recortar a máximo 125 caracteres
  const clean = base
    .replace(/\s+/g, " ")
    .replace(/^[,\-.:;\s]+/, "")
    .trim()

  if (clean.length <= 125) {
    return clean
  }

  return clean.slice(0, 122).trim() + "..."
}

/**
 * Mapea el tono editorial a directivas visuales compatibles con fotografía o ilustración moderna.
 */
function resolveVisualAesthetic(tone?: string): string {
  const normalized = (tone || "").toLowerCase().trim()

  if (normalized.includes("técnico") || normalized.includes("tecnico") || normalized.includes("formal")) {
    return "clean, modern, minimalist technical aesthetic, subtle gradients, balanced studio lighting, professional and polished look"
  }
  if (normalized.includes("creativo") || normalized.includes("inspiracional") || normalized.includes("artístico")) {
    return "vibrant, contemporary conceptual art, warm ambient lighting, expressive textures, elegant atmosphere"
  }
  if (normalized.includes("periodístico") || normalized.includes("periodistico") || normalized.includes("divulgativo")) {
    return "high quality editorial photography style, documentary lighting, authentic composition, rich contrast"
  }

  return "modern editorial design, clean composition, soft cinematic lighting, premium magazine aesthetic"
}

/**
 * Construye el prompt visual completo enviado al modelo de imágenes.
 *
 * Invariantes visuales para portadas de Cuaderno:
 * 1. Composición horizontal amplia apta para cabeceras y tarjetas.
 * 2. Sujeto centrado o descentrado con amplio espacio negativo para evitar recortes.
 * 3. Prohibición estricta de tipografía, texto o marcas superpuestas.
 * 4. Delimitación de entradas de usuario como datos inertes.
 */
export function buildVisualImagePrompt(input: ComposerVisualBriefInput): GeneratedVisualBrief {
  const cleanTopic = sanitizeInput(input.topic)
  const cleanTitle = sanitizeInput(input.title)
  const cleanExcerpt = sanitizeInput(input.excerpt)
  const cleanConstraints = sanitizeInput(input.constraints)
  const aesthetic = resolveVisualAesthetic(input.tone)

  const subject = cleanTitle || cleanTopic || "contemporary knowledge and technology"
  const context = cleanExcerpt ? `Context theme: ${cleanExcerpt.slice(0, 160)}.` : ""
  const extraConstraint = cleanConstraints ? `Additional guideline: ${cleanConstraints.slice(0, 100)}.` : ""

  const prompt = [
    `Editorial banner cover image representing: "${subject}".`,
    context,
    aesthetic + ".",
    "Wide horizontal composition with generous negative space around the subject, suitable for a web publication header.",
    "Clean visual elements, balanced depth of field, high detail, artistic editorial quality.",
    extraConstraint,
    "Strict rule: Absolutely NO text, NO typography, NO letters, NO words, NO logos, NO watermarks, NO UI elements, NO captions.",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  const altText = generateSuggestedAltText({
    topic: cleanTopic,
    title: cleanTitle,
    visualSubject: `Portada visual sobre ${cleanTitle || cleanTopic || "el artículo"}`,
  })

  return {
    prompt,
    altText,
    suggestedStyle: aesthetic,
    aspectRatio: "16:9",
  }
}
