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
import { assertResearchQueryBudget, countWebSearchCalls } from "./researchBudget"
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

export interface ResearchClaim {
  text: string
  offset?: number
  status?: "confirmed" | "inferred" | "unverified"
}

export interface ResearchSource {
  url: string
  title?: string
  domain?: string
  publisher?: string
  publishedAt?: string
  snippet?: string
  claims?: ResearchClaim[]
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

export function extractDomainFromUrl(rawUrl: string): string | undefined {
  try {
    const parsed = new URL(rawUrl)
    return parsed.hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return undefined
  }
}

export function canonicalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl)
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "_ga",
      "ref",
    ]
    for (const param of trackingParams) {
      parsed.searchParams.delete(param)
    }
    parsed.hash = ""
    return parsed.toString().replace(/\/+$/, "")
  } catch {
    return rawUrl.trim()
  }
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

export function extractSources(response: Response): ResearchSource[] {
  const sourcesMap = new Map<string, ResearchSource>()

  const addOrUpdate = (
    rawUrl: string,
    title?: string,
    snippet?: string,
    publisher?: string
  ) => {
    if (!rawUrl) return
    const canonical = canonicalizeUrl(rawUrl)
    if (!canonical || canonical.length < 4) return

    const domain = extractDomainFromUrl(canonical)
    const existing = sourcesMap.get(canonical)

    if (existing) {
      if (!existing.title && title) existing.title = title
      if (!existing.snippet && snippet) existing.snippet = snippet
      if (!existing.publisher && publisher) existing.publisher = publisher
      if (!existing.domain && domain) existing.domain = domain
    } else {
      sourcesMap.set(canonical, {
        url: canonical,
        title: title?.trim() || undefined,
        domain,
        publisher: publisher?.trim() || undefined,
        snippet: snippet?.trim() || undefined,
        claims: [],
      })
    }
  }

  for (const item of response.output) {
    if (item.type === "web_search_call") {
      const action = "action" in item ? item.action : undefined
      const actionSources =
        action && typeof action === "object" && "sources" in action
          ? (action.sources as Array<{ url?: string; title?: string; snippet?: string; publisher?: string }> | undefined)
          : undefined
      for (const source of actionSources ?? []) {
        if (source.url) {
          addOrUpdate(source.url, source.title, source.snippet, source.publisher)
        }
      }
    }

    if (item.type === "message") {
      for (const part of item.content) {
        if (part.type !== "output_text") continue
        for (const annotation of part.annotations ?? []) {
          if (annotation.type === "url_citation" && annotation.url) {
            addOrUpdate(annotation.url, annotation.title)
          }
        }
      }
    }
  }

  // Parsear hechos estructurados del output_text si viene en JSON
  try {
    const rawText = response.output_text?.trim() || ""
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText]
    const jsonStr = jsonMatch[1] || rawText
    const parsed = JSON.parse(jsonStr)

    if (parsed && Array.isArray(parsed.confirmed_facts)) {
      for (const fact of parsed.confirmed_facts) {
        if (fact.source_url && fact.claim) {
          const canonical = canonicalizeUrl(fact.source_url)
          addOrUpdate(fact.source_url, fact.source_title, fact.snippet, fact.publisher)
          const source = sourcesMap.get(canonical)
          if (source) {
            source.claims = source.claims || []
            source.claims.push({
              text: fact.claim,
              status: "confirmed",
            })
          }
        }
      }
    }

    if (parsed && Array.isArray(parsed.inferences)) {
      for (const inference of parsed.inferences) {
        const text = typeof inference.point === "string" ? inference.point : inference.claim
        const sourceUrl = inference.source_url
        if (!text || !sourceUrl) continue
        const canonical = canonicalizeUrl(sourceUrl)
        addOrUpdate(sourceUrl, inference.source_title, inference.rationale, inference.publisher)
        const source = sourcesMap.get(canonical)
        if (source) {
          source.claims = source.claims || []
          source.claims.push({
            text,
            status: "inferred",
          })
        }
      }
    }
  } catch {
    // Si no es JSON puro, no rompemos: las fuentes extraídas de annotations y tool calls ya están capturadas.
  }

  return normalizeResearchSources(Array.from(sourcesMap.values()))
}

export function normalizeResearchSources(sources: ResearchSource[]): ResearchSource[] {
  return sources
    .filter((source) => source.url.trim().length >= 8)
    .map((source) => ({
      ...source,
      claims: (source.claims ?? [])
        .filter((claim) => claim.text.trim().length > 0)
        .map((claim) => ({
          ...claim,
          status: claim.status ?? "confirmed",
        })),
    }))
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
        tools: config.webSearch
          ? [
              {
                type: "web_search" as const,
                ...(config.searchContextSize
                  ? { search_context_size: config.searchContextSize }
                  : {}),
              },
            ]
          : undefined,
        include: config.webSearch ? ["web_search_call.action.sources"] : undefined,
        ...(config.webSearch && config.maxResearchQueries
          ? { max_tool_calls: config.maxResearchQueries }
          : {}),
      },
      { timeout: TEXT_TIMEOUT_MS, signal: AbortSignal.timeout(TEXT_TIMEOUT_MS) }
    )
  )

  if (response.error) {
    throw presentOpenAiError(new Error(response.error.message))
  }

  assertResponseAllowed(response)
  await assertTextAllowed(response.output_text)

  if (config.webSearch && config.maxResearchQueries) {
    assertResearchQueryBudget(
      countWebSearchCalls(response.output),
      config.maxResearchQueries
    )
  }

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

export async function generateImage(
  prompt: string,
  options?: { quality?: ImageQuality }
): Promise<ImageGenerationResult> {
  requireUsableAiConfig()
  await assertTextAllowed(prompt)

  const config = getImagePhaseConfig()
  const effectiveQuality = options?.quality ?? config.quality
  const client = getOpenAiClient()

  const response = await withRetry(() =>
    client.images.generate(
      {
        model: config.model,
        prompt,
        n: 1,
        quality: effectiveQuality,
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
    quality: effectiveQuality,
    usage: {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      imageCount: response.data?.length ?? 1,
    },
  })

  return {
    model: config.model,
    quality: effectiveQuality,
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
