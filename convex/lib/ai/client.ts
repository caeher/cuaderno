"use node"

/**
 * Cliente OpenAI — solo servidor / `"use node"`.
 *
 * Invariantes:
 * - La clave se lee de `process.env.OPENAI_API_KEY` y nunca se exporta.
 * - El modelo, el esfuerzo y la calidad salen de `config.ts`, no de argumentos públicos.
 * - `store: false` para no dejar el contenido en el historial del proveedor.
 * - Web Search solo en la fase de investigación.
 */

import { APIConnectionTimeoutError, APIError, RateLimitError } from "openai"
import type { Response } from "openai/resources/responses/responses"

import {
  getImagePhaseConfig,
  getTextPhaseConfig,
  requireUsableAiConfig,
  type ImageQuality,
} from "./config"
import {
  AiRefusalError,
  AiTransientError,
  presentOpenAiError,
  sanitizeOpenAiError,
} from "./errors"
import { assertTextAllowed, outcomeFromProviderModeration } from "./moderation"
import { getOpenAiClient } from "./openaiClient"

export { getOpenAiClient } from "./openaiClient"
import { buildUsageSnapshot, type UsageSnapshot } from "./usage"

const TEXT_TIMEOUT_MS = 120_000
const IMAGE_TIMEOUT_MS = 60_000
const MAX_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 400

export interface TextGenerationInput {
  input: string
  instructions?: string
  idempotencyKey?: string
  maxOutputTokens?: number
}

export interface ResearchSource {
  url: string
  title?: string
}

export interface TextGenerationResult {
  text: string
  sources: ResearchSource[]
  usage: UsageSnapshot
}

export interface ImageGenerationResult {
  model: string
  quality: ImageQuality
  imageCount: number
  b64Json?: string
  usage: UsageSnapshot
}

function isTransient(error: unknown): boolean {
  if (error instanceof RateLimitError) return true
  if (error instanceof APIConnectionTimeoutError) return true
  if (error instanceof APIError) {
    const status = error.status ?? 0
    return status === 429 || status >= 500
  }
  if (error instanceof Error && /timeout|aborted|ECONNRESET/i.test(error.message)) {
    return true
  }
  return false
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isTransient(error) || attempt === MAX_ATTEMPTS) {
        if (isTransient(error)) {
          throw new AiTransientError(sanitizeOpenAiError(error))
        }
        throw presentOpenAiError(error)
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_DELAY_MS * attempt))
    }
  }

  throw presentOpenAiError(lastError)
}

function extractRefusal(response: Response): string | undefined {
  for (const item of response.output) {
    if (item.type !== "message") continue
    for (const part of item.content) {
      if (part.type === "refusal") {
        return part.refusal
      }
    }
  }
  return undefined
}

function extractSources(response: Response): ResearchSource[] {
  const seen = new Set<string>()
  const sources: ResearchSource[] = []

  const add = (url: string, title?: string) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    sources.push({ url, title })
  }

  for (const item of response.output) {
    if (item.type === "web_search_call") {
      const action = "action" in item ? item.action : undefined
      const actionSources =
        action && typeof action === "object" && "sources" in action
          ? (action.sources as Array<{ url?: string; title?: string }> | undefined)
          : undefined
      for (const source of actionSources ?? []) {
        if (source.url) add(source.url, source.title)
      }
    }

    if (item.type === "message") {
      for (const part of item.content) {
        if (part.type !== "output_text") continue
        for (const annotation of part.annotations ?? []) {
          if (annotation.type === "url_citation" && annotation.url) {
            add(annotation.url, annotation.title)
          }
        }
      }
    }
  }

  return sources
}

function countToolCalls(response: Response): number {
  return response.output.filter((item) => item.type.endsWith("_call")).length
}

function assertResponseAllowed(response: Response): void {
  if (response.incomplete_details?.reason === "content_filter") {
    const outcome = outcomeFromProviderModeration(true)
    if (!outcome.allowed) {
      throw new AiRefusalError(outcome.reason)
    }
  }

  const refusal = extractRefusal(response)
  if (refusal) {
    throw new AiRefusalError("El modelo rechazó generar este contenido.")
  }

  const moderation = response.moderation
  if (moderation && "input" in moderation) {
    const input = moderation.input
    const output = moderation.output
    if ("flagged" in input && input.flagged) {
      throw new AiRefusalError("El contenido de entrada no superó la revisión de seguridad.")
    }
    if ("flagged" in output && output.flagged) {
      throw new AiRefusalError("El contenido generado no superó la revisión de seguridad.")
    }
  }
}

async function runTextPhase(
  phase: "research" | "writing",
  input: TextGenerationInput
): Promise<TextGenerationResult> {
  requireUsableAiConfig()
  await assertTextAllowed(input.input)

  const config = getTextPhaseConfig(phase)
  const client = getOpenAiClient()

  const response = await withRetry(() =>
    client.responses.create(
      {
        model: config.model,
        input: input.input,
        instructions: input.instructions,
        max_output_tokens: input.maxOutputTokens,
        store: false,
        reasoning: { effort: config.reasoningEffort },
        prompt_cache_key: input.idempotencyKey,
        metadata: input.idempotencyKey
          ? { idempotency_key: input.idempotencyKey.slice(0, 512) }
          : undefined,
        moderation: { model: "omni-moderation-latest" },
        tools: config.webSearch ? [{ type: "web_search" }] : undefined,
        include: config.webSearch ? ["web_search_call.action.sources"] : undefined,
      },
      { timeout: TEXT_TIMEOUT_MS, signal: AbortSignal.timeout(TEXT_TIMEOUT_MS) }
    )
  )

  if (response.error) {
    throw presentOpenAiError(new Error(response.error.message))
  }

  assertResponseAllowed(response)
  await assertTextAllowed(response.output_text)

  const usage = buildUsageSnapshot({
    phase,
    model: String(response.model ?? config.model),
    status: "succeeded",
    requestId: response.id,
    usage: {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      toolCalls: countToolCalls(response),
    },
  })

  return {
    text: response.output_text,
    sources: config.webSearch ? extractSources(response) : [],
    usage,
  }
}

export async function runResearchResponse(
  input: TextGenerationInput
): Promise<TextGenerationResult> {
  return await runTextPhase("research", input)
}

export async function runWritingResponse(
  input: TextGenerationInput
): Promise<TextGenerationResult> {
  return await runTextPhase("writing", input)
}

export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
  requireUsableAiConfig()
  await assertTextAllowed(prompt)

  const config = getImagePhaseConfig()
  const client = getOpenAiClient()

  const response = await withRetry(() =>
    client.images.generate(
      {
        model: config.model,
        prompt,
        n: 1,
        quality: config.quality,
        moderation: "auto",
      },
      { timeout: IMAGE_TIMEOUT_MS, signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS) }
    )
  )

  const first = response.data?.[0]
  if (!first?.b64_json) {
    throw new AiRefusalError("El proveedor no devolvió una imagen utilizable.")
  }

  const usage = buildUsageSnapshot({
    phase: "image",
    model: config.model,
    status: "succeeded",
    quality: config.quality,
    usage: {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      imageCount: response.data?.length ?? 1,
    },
  })

  return {
    model: config.model,
    quality: config.quality,
    imageCount: response.data?.length ?? 1,
    b64Json: first.b64_json,
    usage,
  }
}

/** Prueba mínima: una respuesta corta de redacción, sin Web Search. */
export async function runSmokeGeneration(): Promise<{
  ok: true
  model: string
  requestId?: string
  phase: "writing"
}> {
  const result = await runWritingResponse({
    input: "Responde únicamente con la palabra ok.",
    instructions: "Responde con una sola palabra en minúsculas.",
    maxOutputTokens: 16,
    idempotencyKey: `composer-smoke-${Date.now()}`,
  })

  return {
    ok: true,
    model: result.usage.model,
    requestId: result.usage.requestId,
    phase: "writing",
  }
}
