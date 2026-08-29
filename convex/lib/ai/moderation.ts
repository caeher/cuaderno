"use node"

/**
 * Moderación de entrada y salida — issue #14.
 *
 * Este módulo importa el SDK de OpenAI y SOLO debe usarse desde actions `"use node"`.
 * Un texto o imagen flagged no se persiste como post ni como asset publicable.
 */

import type OpenAI from "openai"

import { AiModerationError } from "./errors"
import { getOpenAiClient } from "./openaiClient"

export type ModerationOutcome =
  | { allowed: true }
  | { allowed: false; reason: string; categories: string[] }

const REFUSAL_MESSAGE =
  "Este contenido no puede continuar: no superó la revisión de seguridad."

function flaggedCategories(categories: object): string[] {
  return Object.entries(categories)
    .filter(([, flagged]) => flagged === true)
    .map(([name]) => name)
}

export async function moderateText(
  text: string,
  client?: OpenAI
): Promise<ModerationOutcome> {
  const trimmed = text.trim()
  if (!trimmed) {
    return { allowed: true }
  }

  const openai = client ?? getOpenAiClient()
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: trimmed,
  })

  const result = response.results[0]
  if (!result || !result.flagged) {
    return { allowed: true }
  }

  const categories = flaggedCategories(result.categories)
  return {
    allowed: false,
    reason: REFUSAL_MESSAGE,
    categories,
  }
}

export async function assertTextAllowed(text: string, client?: OpenAI): Promise<void> {
  const outcome = await moderateText(text, client)
  if (!outcome.allowed) {
    throw new AiModerationError(outcome.reason, outcome.categories)
  }
}

export function outcomeFromProviderModeration(
  flagged: boolean | undefined,
  categories?: Record<string, boolean>
): ModerationOutcome {
  if (!flagged) return { allowed: true }
  return {
    allowed: false,
    reason: REFUSAL_MESSAGE,
    categories: categories ? flaggedCategories(categories) : [],
  }
}
