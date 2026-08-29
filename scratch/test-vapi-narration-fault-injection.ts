/**
 * Vapi Speech Synthesis Pipeline — Fault Injection & Simulation Suite
 *
 * Runs comprehensive offline simulations covering all critical failure modes
 * and lifecycle transitions of the Vapi Voice Narration system without making
 * any real HTTP requests to the external Vapi API.
 *
 * Scenarios Tested:
 * 1. [Happy Path] Full Success Lifecycle (POST /call websocket -> Poll -> 302 Download -> Valid MP3 -> Ready)
 * 2. [Fault 1] Empty Audio Artifact (0 bytes / header-less payload)
 * 3. [Fault 2] Corrupted / Non-Audio Format (HTML/JSON disguised as audio)
 * 4. [Fault 3] Expired Signed Redirect / 404 Not Found on Artifact Download
 * 5. [Fault 4] Polling Timeout (Vapi call stuck in-progress exceeding maxPollWaitMs)
 * 6. [Fault 5] Malformed API Response (missing call ID / broken JSON)
 * 7. [Fault 6] Client Cancellation via AbortSignal
 * 8. [Idempotency] Cached Reuse vs Forced Retry with Dirty Content
 * 9. [Kill Switch] Operational Kill Switch activation & immediate rejection
 *
 * Usage:
 *   pnpm tsx scratch/test-vapi-narration-fault-injection.ts
 */

import { validateAudioBuffer } from "../lib/server/audio-validator"
import {
  createVapiWebSocketCall,
  downloadVapiAssistantRecording,
  pollVapiCallUntilEnded,
  sanitizeVapiErrorMessage,
} from "../lib/server/vapi-client"
import { encodePcmS16leToWav, estimatePcmDurationSeconds } from "../lib/server/pcm-wav"
import {
  checkNarrationServiceStatus,
  getAudioServerConfig,
  isNarrationPlaybackEnabled,
  type AudioServerConfig,
} from "../lib/server/audio-config"
import {
  categorizeNarrationError,
  clearNarrationMetrics,
  getNarrationMetricsSnapshot,
  recordNarrationJobMetric,
} from "../lib/server/narration-metrics"
import {
  computeNarrationIdempotencyKey,
  computePostContentHash,
  isNarrationOutdated,
  type PostNarration,
} from "../lib/domain/entities"

let totalPassed = 0
let totalFailed = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    totalPassed++
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ""}`)
    totalFailed++
    failures.push(testName)
  }
}

// Helper to generate a valid synthetic MP3 buffer (ID3v2 header + MPEG frame sync)
function createSyntheticValidMp3Buffer(sizeBytes: number = 8192): Uint8Array {
  const buf = new Uint8Array(sizeBytes)
  buf[0] = 0x49 // 'I'
  buf[1] = 0x44 // 'D'
  buf[2] = 0x33 // '3'
  buf[3] = 0x04 // version 2.4
  buf.fill(0xff, 10, 11)
  buf.fill(0xfb, 11, 12)
  buf.fill(0xaa, 12)
  return buf
}

// Helper to generate a valid synthetic WAV buffer (RIFF...WAVE)
function createSyntheticValidWavBuffer(sizeBytes: number = 8192): Uint8Array {
  const buf = new Uint8Array(sizeBytes)
  buf[0] = 0x52 // 'R'
  buf[1] = 0x49 // 'I'
  buf[2] = 0x46 // 'F'
  buf[3] = 0x46 // 'F'
  buf[8] = 0x57 // 'W'
  buf[9] = 0x41 // 'A'
  buf[10] = 0x56 // 'V'
  buf[11] = 0x45 // 'E'
  buf.fill(0x55, 12)
  return buf
}

async function runFaultInjectionSuite() {
  console.log("===================================================================")
  console.log("⚡ EJECUTANDO SUITE DE SIMULACIÓN Y TOLERANCIA A FALLOS (VAPI MOCKS)")
  console.log("===================================================================\n")

  clearNarrationMetrics()

  const baseConfig: AudioServerConfig = {
    vapiApiKey: "vapi_mock_test_key_abc123",
    vapiBaseUrl: "https://api.vapi.ai",
    defaultVoiceId: "sarah",
    defaultVoiceProvider: "11labs",
    defaultFormat: "mp3",
    assistantName: "Blog Narration Voice",
    defaultLanguage: "es",
    maxCallDurationSeconds: 120,
    silenceTimeoutSeconds: 15,
    pollIntervalMs: 50, // fast poll for tests
    maxPollWaitMs: 500, // 500ms max wait for timeout test
    maxSizeBytes: 50 * 1024 * 1024,
    minSizeBytes: 1024,
    allowedMimeTypes: ["audio/mpeg", "audio/wav"],
    isConfigured: true,
    isFeatureEnabled: true,
    isKillSwitchActive: false,
  }

  // Backup original global fetch
  const originalFetch = globalThis.fetch

  // =========================================================================
  // SCENARIO 1: Happy Path Full Success Lifecycle
  // =========================================================================
  console.log("▶ [ESCENARIO 1] Ciclo de Vida Exitoso (POST /call websocket -> Poll -> 302 -> MP3 Valid)")
  {
    const mockCallId = "call_mock_success_001"
    const validMp3 = createSyntheticValidMp3Buffer(16384)

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = String(input)

      // 1. POST /call (WebSocket transport)
      if (urlStr.endsWith("/call") && init?.method === "POST") {
        const body = typeof init.body === "string" ? JSON.parse(init.body) : {}
        assert(
          body.transport?.provider === "vapi.websocket",
          "createVapiWebSocketCall usa transporte vapi.websocket"
        )
        assert(
          !("phoneNumberId" in body) && !("customer" in body),
          "El payload de creación no incluye campos telefónicos"
        )
        return new Response(
          JSON.stringify({
            id: mockCallId,
            status: "queued",
            transport: {
              provider: "vapi.websocket",
              websocketCallUrl: `wss://api.vapi.ai/${mockCallId}/transport`,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }

      // 2. GET /call/{id} (Poll status)
      if (urlStr.endsWith(`/call/${mockCallId}`) && (!init?.method || init?.method === "GET")) {
        return new Response(
          JSON.stringify({
            id: mockCallId,
            status: "ended",
            duration: 45,
            cost: 0.025,
            endedReason: "assistant-completed-speech",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }

      // 3. GET /call/{id}/assistant-recording (Probed with manual redirect)
      if (urlStr.endsWith(`/call/${mockCallId}/assistant-recording`)) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `https://storage.vapi.ai/recordings/${mockCallId}.mp3?token=secret123`,
          },
        })
      }

      // 4. Download from signed storage URL
      if (urlStr.includes("storage.vapi.ai/recordings")) {
        return new Response(validMp3, {
          status: 200,
          headers: { "Content-Type": "audio/mpeg" },
        })
      }

      return new Response("Not Found", { status: 404 })
    }

    try {
      // Step 1: Create Call
      const creation = await createVapiWebSocketCall("Este es un texto editorial completo para la prueba.", baseConfig)
      assert(creation.id === mockCallId && creation.status === "queued", "createVapiWebSocketCall retorna ID de sesión simulada")
      assert(
        creation.websocketCallUrl?.includes("/transport"),
        "createVapiWebSocketCall retorna websocketCallUrl"
      )

      // Step 2: Poll Call Status
      const polled = await pollVapiCallUntilEnded(mockCallId, baseConfig)
      assert(polled.status === "ended" && polled.duration === 45, "pollVapiCallUntilEnded resuelve cuando el estado es 'ended'")

      // Step 3: Download Recording with 302 redirect
      const download = await downloadVapiAssistantRecording(mockCallId, baseConfig)
      assert(download.sizeBytes === 16384 && download.contentType === "audio/mpeg", "downloadVapiAssistantRecording sigue redirect 302 y descarga buffer")

      // Step 4: Validate Audio Buffer
      const validation = validateAudioBuffer(download.buffer, {
        declaredContentType: download.contentType,
        reportedDurationSeconds: polled.duration,
      })
      assert(validation.isValid && validation.format === "mp3" && validation.hasMagicBytes, "validateAudioBuffer certifica MP3 con ID3v2/MPEG válido")

      recordNarrationJobMetric({
        postId: "post_test_success",
        action: "create",
        status: "success",
        durationMs: 120,
        audioSizeBytes: validation.sizeBytes,
        audioDurationSec: polled.duration,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      assert(false, "Flujo de éxito completado sin errores", String(err))
    }
  }

  // =========================================================================
  // SCENARIO 2: Empty Audio Artifact Rejection (0 bytes)
  // =========================================================================
  console.log("\n▶ [ESCENARIO 2] Rechazo de Artefacto Vacío (0 bytes)")
  {
    const mockCallId = "call_mock_empty_002"

    globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const urlStr = String(input)
      if (urlStr.endsWith(`/call/${mockCallId}/assistant-recording`)) {
        return new Response(null, {
          status: 302,
          headers: { Location: "https://storage.vapi.ai/empty.mp3" },
        })
      }
      if (urlStr.includes("storage.vapi.ai/empty.mp3")) {
        return new Response(new ArrayBuffer(0), {
          status: 200,
          headers: { "Content-Type": "audio/mpeg" },
        })
      }
      return new Response("Not Found", { status: 404 })
    }

    try {
      const download = await downloadVapiAssistantRecording(mockCallId, baseConfig)
      const validation = validateAudioBuffer(download.buffer)
      assert(!validation.isValid, "validateAudioBuffer rechaza buffer de 0 bytes")
      assert(validation.error?.includes("vacío") ?? false, "El mensaje de error indica que el archivo está vacío")

      const category = categorizeNarrationError(new Error(validation.error))
      assert(category === "EMPTY_ARTIFACT", "categorizeNarrationError clasifica el fallo como EMPTY_ARTIFACT")
    } catch (err) {
      assert(false, "Escenario de artefacto vacío manejado", String(err))
    }
  }

  // =========================================================================
  // SCENARIO 3: Corrupted / Non-Audio Format Rejection
  // =========================================================================
  console.log("\n▶ [ESCENARIO 3] Rechazo de Formato Corrupto / No Audio (HTML / JSON falso)")
  {
    const mockCallId = "call_mock_corrupt_003"
    const fakeHtmlResponse = new TextEncoder().encode("<html><body>502 Bad Gateway from Proxy</body></html>")

    globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const urlStr = String(input)
      if (urlStr.endsWith(`/call/${mockCallId}/assistant-recording`)) {
        return new Response(null, {
          status: 302,
          headers: { Location: "https://storage.vapi.ai/corrupt.mp3" },
        })
      }
      if (urlStr.includes("storage.vapi.ai/corrupt.mp3")) {
        return new Response(fakeHtmlResponse, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        })
      }
      return new Response("Not Found", { status: 404 })
    }

    try {
      const download = await downloadVapiAssistantRecording(mockCallId, baseConfig)
      const validation = validateAudioBuffer(download.buffer, {
        declaredContentType: download.contentType,
      })
      assert(!validation.isValid, "validateAudioBuffer rechaza contenido HTML sin magic bytes de audio")
      assert(!validation.hasMagicBytes, "hasMagicBytes es false para buffers corruptos")

      const category = categorizeNarrationError(new Error(validation.error))
      assert(category === "INVALID_FORMAT", "categorizeNarrationError clasifica el fallo como INVALID_FORMAT")
    } catch (err) {
      assert(false, "Escenario de payload corrupto manejado", String(err))
    }
  }

  // =========================================================================
  // SCENARIO 4: Expired Signed Redirect / 404 Not Found
  // =========================================================================
  console.log("\n▶ [ESCENARIO 4] Manejo de Redirect Expirada / Error 404 en Descarga")
  {
    const mockCallId = "call_mock_expired_004"

    globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const urlStr = String(input)
      if (urlStr.endsWith(`/call/${mockCallId}/assistant-recording`)) {
        return new Response(
          JSON.stringify({ message: "Recording artifact expired or not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        )
      }
      return new Response("Not Found", { status: 404 })
    }

    let downloadFailed = false
    try {
      await downloadVapiAssistantRecording(mockCallId, baseConfig)
    } catch (err: any) {
      downloadFailed = true
      assert(
        err.message.includes("No se encontró el artefacto"),
        "sanitizeVapiErrorMessage convierte HTTP 404 en mensaje amigable en español"
      )
      assert(
        !err.message.includes("token=") && !err.message.includes("secret"),
        "El mensaje de error sanitizado no expone tokens privados"
      )
    }
    assert(downloadFailed, "downloadVapiAssistantRecording lanza error controlado ante 404")
  }

  // =========================================================================
  // SCENARIO 5: Polling Timeout (Vapi call stuck in-progress)
  // =========================================================================
  console.log("\n▶ [ESCENARIO 5] Timeout de Polling (Llamada congelada en in-progress)")
  {
    const mockCallId = "call_mock_stuck_005"

    globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const urlStr = String(input)
      if (urlStr.endsWith(`/call/${mockCallId}`)) {
        return new Response(
          JSON.stringify({ id: mockCallId, status: "in-progress" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }
      return new Response("Not Found", { status: 404 })
    }

    let timeoutOccurred = false
    try {
      await pollVapiCallUntilEnded(mockCallId, {
        ...baseConfig,
        pollIntervalMs: 20,
        maxPollWaitMs: 100, // force fast timeout in 100ms
      })
    } catch (err: any) {
      timeoutOccurred = true
      assert(err.message.includes("superó el tiempo máximo de espera"), "pollVapiCallUntilEnded detecta y lanza timeout controlado")
      const cat = categorizeNarrationError(err)
      assert(cat === "TIMEOUT", "categorizeNarrationError clasifica timeout como TIMEOUT")
    }
    assert(timeoutOccurred, "Interrupción defensiva ejecutada ante llamadas congeladas")
  }

  // =========================================================================
  // SCENARIO 6: Malformed API Response Handling
  // =========================================================================
  console.log("\n▶ [ESCENARIO 6] Respuesta Malformada de API Vapi (sin call ID)")
  {
    globalThis.fetch = async (): Promise<Response> => {
      return new Response(JSON.stringify({ status: "queued" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    let malformedCaught = false
    try {
      await createVapiWebSocketCall("Texto de prueba", baseConfig)
    } catch (err: any) {
      malformedCaught = true
      assert(err.message.includes("ID de llamada no retornado"), "createVapiWebSocketCall valida estructura obligatoria del payload")
    }
    assert(malformedCaught, "Rechaza respuestas incompletas de proveedores")
  }

  // =========================================================================
  // SCENARIO 7: Cancellation via AbortSignal
  // =========================================================================
  console.log("\n▶ [ESCENARIO 7] Cancelación Voluntaria vía AbortSignal")
  {
    const mockCallId = "call_mock_abort_007"
    const abortController = new AbortController()

    globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const urlStr = String(input)
      if (urlStr.endsWith(`/call/${mockCallId}`)) {
        // Trigger abort on first poll
        abortController.abort()
        return new Response(
          JSON.stringify({ id: mockCallId, status: "in-progress" }),
          { status: 200 }
        )
      }
      return new Response("Not Found", { status: 404 })
    }

    let abortCaught = false
    try {
      await pollVapiCallUntilEnded(mockCallId, {
        ...baseConfig,
        pollIntervalMs: 50,
        maxPollWaitMs: 2000,
      }, abortController.signal)
    } catch (err: any) {
      abortCaught = true
      assert(err.message.includes("cancelada") || err.message.includes("cancelado"), "pollVapiCallUntilEnded responde inmediatamente al AbortSignal")
      const cat = categorizeNarrationError(err)
      assert(cat === "CLIENT_ABORT", "categorizeNarrationError clasifica cancelación como CLIENT_ABORT")
    }
    assert(abortCaught, "AbortSignal interrumpe el pipeline y libera temporizadores")
  }

  // =========================================================================
  // SCENARIO 8: Idempotency & Deduplication vs Forced Retry
  // =========================================================================
  console.log("\n▶ [ESCENARIO 8] Idempotencia: Deduplicación vs Reintento Forzado")
  {
    const postId = "post_idemp_101"
    const scriptA = "Texto original de la publicación para el primer hash."
    const scriptB = "Texto modificado de la publicación para el segundo hash."

    const hashA = computePostContentHash("Título Post", scriptA, "es")
    const hashB = computePostContentHash("Título Post", scriptB, "es")
    const keyA = computeNarrationIdempotencyKey(postId, hashA)
    const keyB = computeNarrationIdempotencyKey(postId, hashB)

    assert(keyA !== keyB, "Clave de idempotencia cambia determinísticamente ante cambios de texto")

    const existingNarration: PostNarration = {
      id: "narr_cached_01",
      postId,
      authorId: "author_1",
      status: "ready",
      transcript: scriptA,
      contentHash: hashA,
      idempotencyKey: keyA,
      language: "es",
      voice: "sarah",
      format: "mp3",
      storageId: "storage_abc",
      audioUrl: "https://storage.convex.cloud/abc.mp3",
      createdAt: "2026-08-29T10:00:00Z",
      updatedAt: "2026-08-29T10:01:00Z",
    }

    // Checking if matching hash is considered outdated
    assert(
      !isNarrationOutdated(existingNarration, { title: "Título Post", content: scriptA, language: "es" }),
      "isNarrationOutdated retorna false cuando el contenido actual es idéntico al hash cacheado"
    )

    // Checking if modified post is considered outdated
    assert(
      isNarrationOutdated(existingNarration, { title: "Título Post", content: scriptB, language: "es" }),
      "isNarrationOutdated retorna true cuando el contenido del post ha sido editado"
    )
  }

  // =========================================================================
  // SCENARIO 9: Kill Switch & Feature Flag Behavior
  // =========================================================================
  console.log("\n▶ [ESCENARIO 9] Activación de Kill Switch Operativo")
  {
    const originalKillSwitch = process.env.AUDIO_NARRATION_KILL_SWITCH

    try {
      // Activar Kill Switch
      process.env.AUDIO_NARRATION_KILL_SWITCH = "true"

      const status = checkNarrationServiceStatus()
      assert(!status.enabled, "checkNarrationServiceStatus reporta enabled: false cuando el Kill Switch está activo")
      assert(status.isKillSwitchActive, "isKillSwitchActive es true")
      assert(status.reason?.includes("Kill Switch") ?? false, "Proporciona razón operativa clara al usuario")

      const cat = categorizeNarrationError(new Error(status.reason))
      assert(cat === "KILL_SWITCH", "categorizeNarrationError clasifica como KILL_SWITCH")
      assert(!isNarrationPlaybackEnabled(), "El kill switch también oculta el reproductor público")
    } finally {
      // Restore
      if (originalKillSwitch !== undefined) {
        process.env.AUDIO_NARRATION_KILL_SWITCH = originalKillSwitch
      } else {
        delete process.env.AUDIO_NARRATION_KILL_SWITCH
      }
    }
  }

  // =========================================================================
  // SCENARIO 10: WebSocket PCM -> WAV encoding and empty stream rejection
  // =========================================================================
  console.log("\n▶ [ESCENARIO 10] Transporte WebSocket: PCM a WAV y stream vacío")
  {
    const pcm = new Uint8Array(6400)
    for (let i = 0; i < pcm.length; i += 2) {
      pcm[i] = 0x10
      pcm[i + 1] = 0x00
    }
    const wav = encodePcmS16leToWav(pcm, 16000)
    const wavBytes = new Uint8Array(wav)
    const validation = validateAudioBuffer(wav, {
      declaredContentType: "audio/wav",
      reportedDurationSeconds: estimatePcmDurationSeconds(pcm.byteLength, 16000),
    })

    assert(wavBytes[0] === 0x52 && wavBytes[8] === 0x57, "encodePcmS16leToWav produce cabecera RIFF/WAVE")
    assert(validation.isValid && validation.format === "wav", "El WAV encapsulado supera la validación de magic bytes")
    assert(estimatePcmDurationSeconds(0) === 0, "Un stream PCM vacío no reporta duración")
    assert(
      estimatePcmDurationSeconds(32000, 16000) === 1,
      "La duración PCM se calcula a 16 kHz / 16-bit / mono"
    )
  }

  // =========================================================================
  // Metrics Snapshot Verification
  // =========================================================================
  console.log("\n▶ [OBSERVABILIDAD] Verificación de Métricas e Instrumentación")
  {
    const snapshot = getNarrationMetricsSnapshot()
    assert(snapshot.summary.totalJobsRecorded > 0, "Se registran métricas de jobs de narración en el buffer de telemetría")
    assert(snapshot.recentJobs.some((m) => m.status === "success"), "Métrica de éxito registrada con duración y tamaño")
  }

  // Restore global fetch
  globalThis.fetch = originalFetch

  console.log("\n===================================================================")
  console.log(`🏁 RESUMEN SIMULACIÓN VAPI: ${totalPassed} PASARON | ${totalFailed} FALLARON`)
  console.log("===================================================================")

  if (totalFailed > 0) {
    console.error("\nFallos detectados:")
    failures.forEach((f) => console.error(` - ${f}`))
    process.exit(1)
  }
}

runFaultInjectionSuite().catch((err) => {
  console.error("Error fatal en suite de simulación Vapi:", err)
  process.exit(1)
})
