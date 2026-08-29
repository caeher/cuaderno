/**
 * Observabilidad de consumo — issue #14.
 *
 * Extrae modelo, tokens, tool calls y costes de una respuesta del proveedor.
 * No aplica cuotas ni bloqueos: solo rellena `aiUsageEvents`.
 *
 * Los precios son estimaciones documentadas para telemetría. El coste real, si el
 * proveedor lo expone, se guarda aparte en `actualCostUsd`.
 */

export type AiUsageStatus =
  | "succeeded"
  | "failed"
  | "blocked"
  | "refused"
  | "moderated"

export interface UsageSnapshot {
  phase: string
  model: string
  inputTokens?: number
  outputTokens?: number
  imageCount?: number
  toolCalls?: number
  estimatedCostUsd?: number
  actualCostUsd?: number
  status: AiUsageStatus
  requestId?: string
}

/**
 * Tarifas de referencia en USD (observabilidad, no facturación).
 * Actualizar cuando cambie el catálogo; un desvío no bloquea ejecuciones.
 */
export const ESTIMATED_TEXT_USD_PER_MILLION = {
  input: 2.5,
  output: 15,
} as const

export const ESTIMATED_IMAGE_USD: Record<string, number> = {
  low: 0.01,
  medium: 0.04,
  high: 0.08,
  auto: 0.04,
}

export function estimateTextCostUsd(inputTokens: number, outputTokens: number): number {
  const input = (inputTokens / 1_000_000) * ESTIMATED_TEXT_USD_PER_MILLION.input
  const output = (outputTokens / 1_000_000) * ESTIMATED_TEXT_USD_PER_MILLION.output
  return roundUsd(input + output)
}

export function estimateImageCostUsd(imageCount: number, quality = "auto"): number {
  const unit = ESTIMATED_IMAGE_USD[quality] ?? ESTIMATED_IMAGE_USD.auto
  return roundUsd(imageCount * (unit ?? 0.04))
}

export function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

export interface ProviderUsageFields {
  inputTokens?: number
  outputTokens?: number
  imageCount?: number
  toolCalls?: number
  actualCostUsd?: number
}

export function buildUsageSnapshot(args: {
  phase: string
  model: string
  status: AiUsageStatus
  requestId?: string
  quality?: string
  usage?: ProviderUsageFields
}): UsageSnapshot {
  const inputTokens = args.usage?.inputTokens
  const outputTokens = args.usage?.outputTokens
  const imageCount = args.usage?.imageCount
  const toolCalls = args.usage?.toolCalls

  let estimatedCostUsd: number | undefined
  if (args.phase === "image" && imageCount !== undefined) {
    estimatedCostUsd = estimateImageCostUsd(imageCount, args.quality)
  } else if (inputTokens !== undefined || outputTokens !== undefined) {
    estimatedCostUsd = estimateTextCostUsd(inputTokens ?? 0, outputTokens ?? 0)
  }

  return {
    phase: args.phase,
    model: args.model,
    inputTokens,
    outputTokens,
    imageCount,
    toolCalls,
    estimatedCostUsd,
    actualCostUsd: args.usage?.actualCostUsd,
    status: args.status,
    requestId: args.requestId,
  }
}
