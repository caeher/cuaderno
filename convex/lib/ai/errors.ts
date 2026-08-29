/**
 * Errores presentables de la capa OpenAI.
 *
 * Ningún mensaje que salga de aquí puede contener la API key, tokens Bearer ni
 * URLs con credenciales. Ese es el mismo invariante que `sanitizeVapiErrorMessage`.
 */

export class AiRefusalError extends Error {
  readonly code = "ai_refusal"

  constructor(message = "El modelo rechazó generar este contenido.") {
    super(message)
    this.name = "AiRefusalError"
  }
}

export class AiModerationError extends Error {
  readonly code = "ai_moderated"
  readonly categories: string[]

  constructor(message = "El contenido no superó la moderación.", categories: string[] = []) {
    super(message)
    this.name = "AiModerationError"
    this.categories = categories
  }
}

export class AiTransientError extends Error {
  readonly code = "ai_transient"

  constructor(message = "El proveedor de IA no respondió a tiempo. Inténtalo de nuevo.") {
    super(message)
    this.name = "AiTransientError"
  }
}

export class AiPresentableError extends Error {
  readonly code = "ai_failed"

  constructor(message: string) {
    super(message)
    this.name = "AiPresentableError"
  }
}

const SECRET_PATTERNS: readonly RegExp[] = [
  /Bearer\s+[a-zA-Z0-9_\-.]+/gi,
  /sk-[a-zA-Z0-9_\-]+/gi,
  /(?:openai_api_key|api_key|api-key|key|token|auth)=([^&\s"']+)/gi,
  /https:\/\/[^/\s]+@/g,
]

/**
 * Redacta secretos de un error del proveedor antes de loguearlo o devolverlo.
 * Nunca reexpone `OPENAI_API_KEY`.
 */
export function sanitizeOpenAiError(error: unknown): string {
  if (!error) {
    return "Error desconocido al comunicarse con el proveedor de IA."
  }

  const raw = error instanceof Error ? error.message : String(error)
  let sanitized = raw
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]")
  }

  if (sanitized.includes("401") || /unauthorized/i.test(sanitized)) {
    return "Error de autenticación con el proveedor de IA. Revisa OPENAI_API_KEY en Convex."
  }
  if (sanitized.includes("429") || /rate limit/i.test(sanitized)) {
    return "El proveedor de IA está limitando peticiones. Espera un momento e inténtalo de nuevo."
  }
  if (/timeout|timed out|aborted/i.test(sanitized)) {
    return "La petición al proveedor de IA superó el tiempo máximo de espera."
  }
  if (/\b5\d\d\b/.test(sanitized) || /internal server error/i.test(sanitized)) {
    return "El proveedor de IA tuvo un error temporal. Inténtalo de nuevo."
  }

  if (sanitized.length > 280) {
    return `${sanitized.slice(0, 277)}...`
  }

  return sanitized
}

export function presentOpenAiError(error: unknown): Error {
  if (
    error instanceof AiRefusalError ||
    error instanceof AiModerationError ||
    error instanceof AiTransientError ||
    error instanceof AiPresentableError
  ) {
    return error
  }

  return new AiPresentableError(sanitizeOpenAiError(error))
}
