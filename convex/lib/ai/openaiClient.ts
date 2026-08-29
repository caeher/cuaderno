"use node"

/**
 * Instancia lazy del SDK. Nunca exporta la clave; solo se importa desde
 * módulos `"use node"` (`client.ts`, `moderation.ts`, `aiNode.ts`).
 */

import OpenAI from "openai"

let cachedClient: OpenAI | undefined

export function getOpenAiClient(): OpenAI {
  if (cachedClient) return cachedClient

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      "Falta OPENAI_API_KEY en las variables de entorno de Convex. Configúrala con: pnpm convex env set OPENAI_API_KEY <valor>"
    )
  }

  cachedClient = new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: 120_000,
  })
  return cachedClient
}
