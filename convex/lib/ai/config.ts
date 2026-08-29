/**
 * Resolvedor global de configuración de IA — parte del issue #14.
 *
 * Es la ÚNICA fuente de verdad sobre qué modelo, con qué esfuerzo y con qué
 * herramientas corre cada fase de Composer. Todas las llamadas al proveedor la
 * consultan; ninguna hardcodea un nombre de modelo.
 *
 * Tres invariantes que sostienen los criterios de aceptación de #14:
 *
 * 1. **La configuración vive en el entorno, no en el código.** Cambiar de modelo es
 *    cambiar una variable y reiniciar; no requiere deploy de código ni migración de
 *    datos. Por eso los nombres de modelo se leen en tiempo de ejecución y no son
 *    constantes exportadas.
 *
 * 2. **El navegador no puede elegir nada.** No hay ningún parámetro de modelo, calidad
 *    ni esfuerzo que entre por argumento de una función pública. Si en el futuro alguien
 *    agrega uno, rompe el criterio de aceptación del issue.
 *
 * 3. **La clave nunca se devuelve.** `hasApiKey()` responde si existe; su valor no sale
 *    de este módulo. Ninguna función de acá puede terminar en un log, un bundle o una
 *    Server Action serializada con el secreto dentro.
 *
 * Este archivo NO importa el SDK de OpenAI a propósito: es configuración pura y
 * validable, así que puede existir y probarse antes de que la dependencia esté instalada.
 */

/** Fases de Composer que consumen el proveedor de IA. */
export type AiPhase = "research" | "writing" | "image"

export type ReasoningEffort = "minimal" | "low" | "medium" | "high"
export type ImageQuality = "low" | "medium" | "high" | "auto"

export interface TextPhaseConfig {
  phase: "research" | "writing"
  model: string
  reasoningEffort: ReasoningEffort
  /**
   * Web Search se habilita SOLO en investigación. El modelo de redacción escribe a
   * partir de las fuentes ya recolectadas: si pudiera buscar, podría introducir
   * afirmaciones sin fuente registrada y romper la trazabilidad que exige la épica.
   */
  webSearch: boolean
}

export interface ImagePhaseConfig {
  phase: "image"
  model: string
  quality: ImageQuality
}

const DEFAULTS = {
  researchModel: "gpt-5.6-luna",
  writingModel: "gpt-5.6-luna",
  imageModel: "gpt-image-1-mini",
  reasoningEffort: "medium" as ReasoningEffort,
  imageQuality: "auto" as ImageQuality,
}

const REASONING_EFFORTS: readonly string[] = ["minimal", "low", "medium", "high"]
const IMAGE_QUALITIES: readonly string[] = ["low", "medium", "high", "auto"]

function readEnv(name: string): string | undefined {
  const value = process.env[name]
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function readEnum<T extends string>(
  name: string,
  allowed: readonly string[],
  fallback: T
): T {
  const value = readEnv(name)
  if (!value) return fallback

  if (!allowed.includes(value)) {
    throw new Error(
      `Configuración de IA inválida: ${name}="${value}". Valores permitidos: ${allowed.join(", ")}.`
    )
  }

  return value as T
}

/** Indica si hay credencial configurada. Nunca devuelve su valor. */
export function hasApiKey(): boolean {
  return Boolean(readEnv("OPENAI_API_KEY"))
}

/**
 * Feature flag de rollout (#20). Por defecto APAGADO: Composer no debe encenderse
 * por el mero hecho de estar desplegado.
 */
export function isComposerEnabled(): boolean {
  return readEnv("COMPOSER_ENABLED") === "true"
}

export function getTextPhaseConfig(phase: "research" | "writing"): TextPhaseConfig {
  const model =
    phase === "research"
      ? readEnv("OPENAI_RESEARCH_MODEL") ?? DEFAULTS.researchModel
      : readEnv("OPENAI_WRITING_MODEL") ?? DEFAULTS.writingModel

  return {
    phase,
    model,
    reasoningEffort: readEnum(
      "OPENAI_REASONING_EFFORT",
      REASONING_EFFORTS,
      DEFAULTS.reasoningEffort
    ),
    webSearch: phase === "research",
  }
}

export function getImagePhaseConfig(): ImagePhaseConfig {
  return {
    phase: "image",
    model: readEnv("OPENAI_IMAGE_MODEL") ?? DEFAULTS.imageModel,
    quality: readEnum("OPENAI_IMAGE_QUALITY", IMAGE_QUALITIES, DEFAULTS.imageQuality),
  }
}

export interface AiConfigReport {
  ok: boolean
  hasApiKey: boolean
  composerEnabled: boolean
  researchModel: string
  writingModel: string
  imageModel: string
  reasoningEffort: ReasoningEffort
  imageQuality: ImageQuality
  problems: string[]
}

/**
 * Valida la configuración completa y devuelve un reporte legible.
 *
 * Se llama al arrancar y desde el health check: descubrir que falta la clave en medio
 * de un job de research es descubrirlo tarde, con una sesión a medias y un usuario
 * esperando. Los problemas se acumulan en vez de lanzar en el primero para poder
 * reportarlos todos de una vez.
 */
export function validateAiConfig(): AiConfigReport {
  const problems: string[] = []

  let reasoningEffort = DEFAULTS.reasoningEffort
  let imageQuality = DEFAULTS.imageQuality

  try {
    reasoningEffort = readEnum(
      "OPENAI_REASONING_EFFORT",
      REASONING_EFFORTS,
      DEFAULTS.reasoningEffort
    )
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error))
  }

  try {
    imageQuality = readEnum("OPENAI_IMAGE_QUALITY", IMAGE_QUALITIES, DEFAULTS.imageQuality)
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error))
  }

  const apiKey = hasApiKey()
  if (!apiKey) {
    problems.push(
      "Falta OPENAI_API_KEY en las variables de entorno de Convex. Configúrala con: pnpm convex env set OPENAI_API_KEY <valor>"
    )
  }

  return {
    ok: problems.length === 0,
    hasApiKey: apiKey,
    composerEnabled: isComposerEnabled(),
    researchModel: readEnv("OPENAI_RESEARCH_MODEL") ?? DEFAULTS.researchModel,
    writingModel: readEnv("OPENAI_WRITING_MODEL") ?? DEFAULTS.writingModel,
    imageModel: readEnv("OPENAI_IMAGE_MODEL") ?? DEFAULTS.imageModel,
    reasoningEffort,
    imageQuality,
    problems,
  }
}

/**
 * Exige configuración válida antes de gastar dinero.
 *
 * La llaman las actions de #16 a #18 como primera línea, para que un despliegue mal
 * configurado falle con un mensaje accionable en vez de con un 401 del proveedor.
 */
export function requireUsableAiConfig(): void {
  if (!isComposerEnabled()) {
    throw new Error(
      "Composer está deshabilitado en este entorno (COMPOSER_ENABLED != 'true')."
    )
  }

  const report = validateAiConfig()
  if (!report.ok) {
    throw new Error(`Configuración de IA inválida:\n- ${report.problems.join("\n- ")}`)
  }
}
