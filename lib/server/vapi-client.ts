/**
 * Server-Side Vapi AI Client
 *
 * Provides strictly isolated server-side communication with the Vapi REST API.
 * Headless narration uses WebSocket transport (no Daily.co, no PSTN).
 *
 * CRITICAL SECURITY INVARIANT:
 * - This module must ONLY run in server environments (Node.js / Next.js Server Components / Actions).
 * - Never passes or leaks private API keys to logs, exceptions, or client components.
 */

import type { AudioServerConfig } from "./audio-config"
import {
  encodePcmS16leToWav,
  estimatePcmDurationSeconds,
  VAPI_PCM_SAMPLE_RATE,
} from "./pcm-wav"

export interface VapiCallCreationResponse {
  id: string
  status: string
  websocketCallUrl?: string
}

export interface VapiCallStatusResponse {
  id: string
  status: "queued" | "in-progress" | "ended" | string
  endedReason?: string
  duration?: number
  cost?: number
  artifact?: {
    recordingUrl?: string
    stereoRecordingUrl?: string
    transcript?: string
    [key: string]: unknown
  }
}

export interface VapiRecordingDownloadResult {
  buffer: ArrayBuffer
  contentType: string
  sizeBytes: number
  sourceUrl?: string
}

export interface VapiNarrationSynthesisResult {
  callId: string
  buffer: ArrayBuffer
  contentType: string
  sizeBytes: number
  durationSeconds: number
  endedReason?: string
  cost?: number
  source: "websocket-pcm" | "assistant-recording"
}

const MIN_PCM_BYTES = 2048
const SILENCE_IDLE_MS = 2500
const KEEPALIVE_INTERVAL_MS = 200
const KEEPALIVE_FRAME_SAMPLES = 1600

/**
 * Sanitizes an error message by stripping private API keys, Bearer tokens, or internal URLs.
 */
export function sanitizeVapiErrorMessage(error: unknown): string {
  if (!error) return "Error desconocido durante la comunicación con el servicio de voz."

  const rawMessage = error instanceof Error ? error.message : String(error)

  let sanitized = rawMessage
    .replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, "Bearer [REDACTED]")
    .replace(/(?:vapi_key|api_key|key|token|auth)=([^&\s]+)/gi, "$1=[REDACTED]")
    .replace(/https:\/\/[^/]+@/g, "https://[REDACTED]@")

  if (sanitized.includes("401") || sanitized.includes("Unauthorized")) {
    return "Error de autenticación: la clave privada de Vapi no es válida o ha expirado."
  }
  if (sanitized.includes("404") || sanitized.includes("Not Found")) {
    return "No se encontró el artefacto de grabación o la llamada especificada en Vapi."
  }
  if (sanitized.includes("429") || sanitized.includes("Rate limit")) {
    return "Límite de solicitudes alcanzado en el proveedor de voz. Intente de nuevo más tarde."
  }
  if (
    sanitized.includes("timed out") ||
    sanitized.includes("timeout") ||
    sanitized.includes("ETIMEDOUT")
  ) {
    return "El tiempo de espera para la generación de la narración se ha agotado."
  }

  return sanitized
}

function assertNoTelephony(payload: Record<string, unknown>): void {
  if ("phoneNumberId" in payload || "customer" in payload || "phoneNumber" in payload) {
    throw new Error("[SECURITY FATAL] Se detectaron campos telefónicos en el payload de Vapi.")
  }
}

function buildAssistantPayload(
  speechScript: string,
  config: AudioServerConfig,
  customSystemPrompt?: string
) {
  const systemPrompt =
    customSystemPrompt ||
    "Eres un narrador profesional de artículos de blog. Lee el texto con dicción clara, cadencia pausada y tono editorial profesional. No formules preguntas ni esperes interacción del usuario. Al terminar la lectura, permanece en silencio."

  return {
    name: config.assistantName,
    firstMessage: speechScript,
    voice: {
      provider: config.defaultVoiceProvider,
      voiceId: config.defaultVoiceId,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
      ],
    },
    artifactPlan: {
      recordingEnabled: true,
      recordingFormat: config.defaultFormat,
      loggingEnabled: true,
      transcriptPlan: {
        enabled: true,
        assistantName: "Narrador",
        userName: "Oyente",
      },
    },
    maxDurationSeconds: config.maxCallDurationSeconds,
    silenceTimeoutSeconds: config.silenceTimeoutSeconds,
  }
}

function resolveWebsocketUrl(data: Record<string, unknown>): string | undefined {
  const transport = data.transport as Record<string, unknown> | undefined
  if (transport && typeof transport.websocketCallUrl === "string") {
    return transport.websocketCallUrl
  }
  if (typeof data.websocketCallUrl === "string") {
    return data.websocketCallUrl
  }
  return undefined
}

/**
 * Creates a headless Vapi call using WebSocket transport (no Daily.co, no phone).
 */
export async function createVapiWebSocketCall(
  speechScript: string,
  config: AudioServerConfig,
  customSystemPrompt?: string
): Promise<VapiCallCreationResponse> {
  if (!config.vapiApiKey) {
    throw new Error(
      "VAPI_PRIVATE_API_KEY no está configurada en el servidor. Define la variable de entorno para habilitar narraciones."
    )
  }

  const cleanScript = speechScript.trim()
  if (!cleanScript) {
    throw new Error("El guion de voz para narración está vacío.")
  }

  const endpoint = `${config.vapiBaseUrl.replace(/\/+$/, "")}/call`
  const payload: Record<string, unknown> = {
    assistant: buildAssistantPayload(cleanScript, config, customSystemPrompt),
    transport: {
      provider: "vapi.websocket",
      audioFormat: {
        format: "pcm_s16le",
        container: "raw",
        sampleRate: VAPI_PCM_SAMPLE_RATE,
      },
    },
  }

  assertNoTelephony(payload)

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => "")
      throw new Error(`Fallo en Vapi API (HTTP ${res.status}): ${errorText}`)
    }

    const data = (await res.json()) as Record<string, unknown>
    if (typeof data.id !== "string" || !data.id) {
      throw new Error("Respuesta inválida de Vapi: ID de llamada no retornado.")
    }

    return {
      id: data.id,
      status: typeof data.status === "string" ? data.status : "queued",
      websocketCallUrl: resolveWebsocketUrl(data),
    }
  } catch (err) {
    throw new Error(sanitizeVapiErrorMessage(err))
  }
}

/** @deprecated Use createVapiWebSocketCall. Kept for existing test imports. */
export const createVapiWebCall = createVapiWebSocketCall

/**
 * Queries the current lifecycle status of a Vapi call.
 */
export async function getVapiCall(
  callId: string,
  config: AudioServerConfig
): Promise<VapiCallStatusResponse> {
  if (!config.vapiApiKey) {
    throw new Error("VAPI_PRIVATE_API_KEY no está configurada.")
  }

  const endpoint = `${config.vapiBaseUrl.replace(/\/+$/, "")}/call/${encodeURIComponent(callId)}`

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.vapiApiKey}`,
      },
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => "")
      throw new Error(`Error al consultar llamada en Vapi (HTTP ${res.status}): ${errorText}`)
    }

    return (await res.json()) as VapiCallStatusResponse
  } catch (err) {
    throw new Error(sanitizeVapiErrorMessage(err))
  }
}

/**
 * Polls the Vapi call until it reaches the "ended" status or exceeds the maximum timeout.
 */
export async function pollVapiCallUntilEnded(
  callId: string,
  config: AudioServerConfig,
  signal?: AbortSignal,
  options?: {
    maxWaitMs?: number
    pollIntervalMs?: number
  }
): Promise<VapiCallStatusResponse> {
  const maxWait = options?.maxWaitMs ?? config.maxPollWaitMs
  const interval = options?.pollIntervalMs ?? config.pollIntervalMs
  const startTime = Date.now()

  let lastStatus: VapiCallStatusResponse | null = null

  while (Date.now() - startTime < maxWait) {
    if (signal?.aborted) {
      throw new Error("La operación de generación de audio fue cancelada.")
    }

    lastStatus = await getVapiCall(callId, config)

    if (lastStatus.status === "ended") {
      return lastStatus
    }

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, interval)
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timer)
            reject(new Error("Operación cancelada."))
          },
          { once: true }
        )
      }
    })
  }

  throw new Error(
    `La generación de narración en Vapi superó el tiempo máximo de espera (${Math.round(
      maxWait / 1000
    )} segundos). Último estado: ${lastStatus?.status || "desconocido"}.`
  )
}

/**
 * Downloads the assistant-only audio recording by safely following the authenticated
 * HTTP 302 redirect on the server.
 */
export async function downloadVapiAssistantRecording(
  callId: string,
  config: AudioServerConfig,
  signal?: AbortSignal
): Promise<VapiRecordingDownloadResult> {
  if (!config.vapiApiKey) {
    throw new Error("VAPI_PRIVATE_API_KEY no está configurada.")
  }

  const endpoint = `${config.vapiBaseUrl.replace(/\/+$/, "")}/call/${encodeURIComponent(
    callId
  )}/assistant-recording`

  try {
    const probeRes = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.vapiApiKey}`,
      },
      redirect: "manual",
      signal,
    })

    let targetDownloadUrl = endpoint
    let isSignedRedirect = false

    if (probeRes.status === 302 || probeRes.status === 301 || probeRes.status === 307) {
      const location = probeRes.headers.get("location")
      if (!location) {
        throw new Error("El endpoint de grabación devolvió redirección pero sin encabezado Location.")
      }
      targetDownloadUrl = location
      isSignedRedirect = true
    } else if (!probeRes.ok) {
      const errorText = await probeRes.text().catch(() => "")
      throw new Error(
        `No se pudo obtener el artefacto de grabación en Vapi (HTTP ${probeRes.status}): ${errorText}`
      )
    }

    const downloadHeaders: Record<string, string> = {}
    if (!isSignedRedirect) {
      downloadHeaders["Authorization"] = `Bearer ${config.vapiApiKey}`
    }

    const downloadRes = await fetch(targetDownloadUrl, {
      method: "GET",
      headers: downloadHeaders,
      signal,
    })

    if (!downloadRes.ok) {
      throw new Error(
        `Fallo al descargar el archivo de audio desde el almacenamiento de Vapi (HTTP ${downloadRes.status}).`
      )
    }

    const contentType = downloadRes.headers.get("content-type") || "audio/mpeg"
    const buffer = await downloadRes.arrayBuffer()

    return {
      buffer,
      contentType,
      sizeBytes: buffer.byteLength,
      sourceUrl: isSignedRedirect ? targetDownloadUrl.split("?")[0] : undefined,
    }
  } catch (err) {
    throw new Error(sanitizeVapiErrorMessage(err))
  }
}

function toUint8Array(data: ArrayBuffer | Blob | Buffer | ArrayBufferView): Promise<Uint8Array> {
  if (data instanceof Uint8Array) {
    return Promise.resolve(data)
  }
  if (data instanceof ArrayBuffer) {
    return Promise.resolve(new Uint8Array(data))
  }
  if (ArrayBuffer.isView(data)) {
    return Promise.resolve(new Uint8Array(data.buffer, data.byteOffset, data.byteLength))
  }
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return data.arrayBuffer().then((buf) => new Uint8Array(buf))
  }
  return Promise.resolve(new Uint8Array())
}

export async function captureVapiWebSocketAudio(
  websocketUrl: string,
  config: AudioServerConfig,
  signal?: AbortSignal
): Promise<{ pcm: Uint8Array; durationSeconds: number }> {
  if (typeof WebSocket === "undefined") {
    throw new Error("WebSocket no está disponible en este runtime de servidor.")
  }

  const chunks: Uint8Array[] = []
  let receivedAudio = false
  let lastAudioAt = 0

  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(websocketUrl)
    socket.binaryType = "arraybuffer"

    let settled = false
    let keepalive: ReturnType<typeof setInterval> | undefined
    let idleWatch: ReturnType<typeof setInterval> | undefined
    let maxTimer: ReturnType<typeof setTimeout> | undefined

    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      if (keepalive) clearInterval(keepalive)
      if (idleWatch) clearInterval(idleWatch)
      if (maxTimer) clearTimeout(maxTimer)
      signal?.removeEventListener("abort", onAbort)
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "end-call" }))
        }
        socket.close()
      } catch {
        // ignore close errors
      }
      if (error) reject(error)
      else resolve()
    }

    const onAbort = () => {
      finish(new Error("La operación de generación de audio fue cancelada."))
    }

    signal?.addEventListener("abort", onAbort, { once: true })

    socket.onopen = () => {
      const silence = new Uint8Array(KEEPALIVE_FRAME_SAMPLES * 2)
      keepalive = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(silence)
        }
      }, KEEPALIVE_INTERVAL_MS)

      idleWatch = setInterval(() => {
        if (receivedAudio && Date.now() - lastAudioAt >= SILENCE_IDLE_MS) {
          finish()
        }
      }, 250)

      maxTimer = setTimeout(() => {
        if (receivedAudio) finish()
        else finish(new Error("El tiempo de espera para la generación de la narración se ha agotado."))
      }, config.maxPollWaitMs)
    }

    socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const message = JSON.parse(event.data) as { type?: string; status?: string }
          if (message.type === "hangup" || message.type === "end-call" || message.status === "ended") {
            finish()
          }
        } catch {
          // ignore non-JSON text frames
        }
        return
      }

      void toUint8Array(event.data as ArrayBuffer | Blob).then((bytes) => {
        if (bytes.byteLength === 0) return
        const isSilence = bytes.every((sample) => sample === 0)
        if (isSilence) return
        chunks.push(bytes)
        receivedAudio = true
        lastAudioAt = Date.now()
      })
    }

    socket.onerror = () => {
      finish(new Error("Error de transporte WebSocket al sintetizar la narración en Vapi."))
    }

    socket.onclose = () => {
      finish()
    }
  })

  const totalBytes = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const pcm = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    pcm.set(chunk, offset)
    offset += chunk.byteLength
  }

  return {
    pcm,
    durationSeconds: estimatePcmDurationSeconds(pcm.byteLength, VAPI_PCM_SAMPLE_RATE),
  }
}

/**
 * Synthesizes narration audio via Vapi WebSocket transport.
 * Falls back to the authenticated assistant-recording download if the stream is short.
 */
export async function synthesizeNarrationWithVapi(
  speechScript: string,
  config: AudioServerConfig,
  options?: {
    systemPrompt?: string
    signal?: AbortSignal
  }
): Promise<VapiNarrationSynthesisResult> {
  const callCreation = await createVapiWebSocketCall(
    speechScript,
    config,
    options?.systemPrompt
  )

  if (callCreation.websocketCallUrl) {
    try {
      const captured = await captureVapiWebSocketAudio(
        callCreation.websocketCallUrl,
        config,
        options?.signal
      )

      if (captured.pcm.byteLength >= MIN_PCM_BYTES) {
        const wav = encodePcmS16leToWav(captured.pcm, VAPI_PCM_SAMPLE_RATE)
        return {
          callId: callCreation.id,
          buffer: wav,
          contentType: "audio/wav",
          sizeBytes: wav.byteLength,
          durationSeconds: Math.max(1, Math.round(captured.durationSeconds)),
          endedReason: "websocket-stream-complete",
          source: "websocket-pcm",
        }
      }
    } catch (error) {
      if (options?.signal?.aborted) {
        throw error
      }
      // Fall through to recording download
    }
  }

  const finalCallData = await pollVapiCallUntilEnded(callCreation.id, config, options?.signal)
  const download = await downloadVapiAssistantRecording(
    callCreation.id,
    config,
    options?.signal
  )

  return {
    callId: callCreation.id,
    buffer: download.buffer,
    contentType: download.contentType,
    sizeBytes: download.sizeBytes,
    durationSeconds: finalCallData.duration || 1,
    endedReason: finalCallData.endedReason,
    cost: finalCallData.cost,
    source: "assistant-recording",
  }
}
