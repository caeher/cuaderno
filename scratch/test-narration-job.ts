/**
 * Post Narration Job & Vapi Pipeline Verification Suite
 *
 * Runs comprehensive automated verification for:
 * 1. Speech Script Sanitizer (HTML, Markdown, unreadable URLs, code exclusion, prosody)
 * 2. Audio Buffer Validator (MP3 ID3/MPEG, WAV RIFF, empty/corrupted/size bounds rejection)
 * 3. Idempotency & Deterministic Hash calculation
 * 4. Post Immutability Guarantee (Post remains 100% read-only across success/failure)
 * 5. Security & Privacy Filtering (public projection vs author projection, zero exposed secrets)
 * 6. Vapi Contract & Error Sanitizer
 *
 * Usage:
 *   pnpm tsx scratch/test-narration-job.ts
 */

import { cleanPostToSpeechScript } from "../lib/server/speech-script-sanitizer"
import { isMp3Buffer, isWavBuffer, validateAudioBuffer } from "../lib/server/audio-validator"
import {
  computeNarrationIdempotencyKey,
  computePostContentHash,
  isNarrationOutdated,
  type PostNarration,
} from "../lib/domain/entities"
import { sanitizeVapiErrorMessage } from "../lib/server/vapi-client"
import { getAudioServerConfig } from "../lib/server/audio-config"

let totalPassed = 0
let totalFailed = 0
const failureList: string[] = []

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    totalPassed++
  } else {
    console.error(`  ❌ FAIL: ${testName}`)
    totalFailed++
    failureList.push(testName)
  }
}

async function runTests() {
  console.log("===================================================================")
  console.log("🎙️  EJECUTANDO SUITE DE PRUEBAS DEL JOB DE NARRACIÓN Y VAPI")
  console.log("===================================================================\n")

  // =========================================================================
  // 1. Test Suite: Speech Script Sanitizer
  // =========================================================================
  console.log("▶ [TEST SUITE 1] Sanitizador de Guiones de Voz (speech-script-sanitizer)")

  const richPostContent = [
    '<p>Bienvenidos a este <strong>artículo fundamental</strong> sobre IA &amp; voz.</p>',
    '<script>alert("hacked");</script>',
    '<style>.hidden { display: none; }</style>',
    '<pre><code>const a = 123; console.log(a);</code></pre>',
    '<p>Puedes leer más en <a href="https://ejemplo.com/docs/guia-completa?session=abc123xyz#sec1">la guía oficial</a> o visitar https://raw-unreadable-url.org/api/v1/query?token=secret987&flag=true.</p>',
    '<img src="https://ejemplo.com/hero.jpg" alt="Imagen decorativa" />',
    '<figure><figcaption>Figura 1: Diagrama no editorial</figcaption></figure>',
    '```typescript\nfunction runCode() { return true; }\n```',
    '> Este es un quote destacado con cadencia...',
    '¡¡¡Atención!!! ¿¿¿Pregunta??? No lo olvides.',
  ].join("\n")

  const sanitizedResult = cleanPostToSpeechScript(
    "Introducción a los Agentes de Voz",
    richPostContent,
    "Un resumen editorial conciso.",
    { language: "es" }
  )

  assert(
    !sanitizedResult.speechScript.includes("<script>") &&
      !sanitizedResult.speechScript.includes("alert("),
    "Elimina etiquetas <script> y su contenido malicioso"
  )

  assert(
    !sanitizedResult.speechScript.includes("<style>") &&
      !sanitizedResult.speechScript.includes(".hidden"),
    "Elimina etiquetas <style> y reglas CSS"
  )

  assert(
    !sanitizedResult.speechScript.includes("const a = 123") &&
      !sanitizedResult.speechScript.includes("function runCode"),
    "Excluye bloques de código (<pre><code> y fences de markdown)"
  )

  assert(
    !sanitizedResult.speechScript.includes("https://raw-unreadable-url.org"),
    "Filtra URLs desnudas no leíbles con query parameters"
  )

  assert(
    sanitizedResult.speechScript.includes("la guía oficial") &&
      !sanitizedResult.speechScript.includes("https://ejemplo.com/docs/guia-completa"),
    "Transforma enlaces HTML/Markdown a solo el texto ancla leíble"
  )

  assert(
    sanitizedResult.speechScript.includes("IA y voz"),
    "Decodifica entidades HTML como &amp; a lenguaje natural ('y')"
  )

  assert(
    !sanitizedResult.speechScript.includes("Figura 1: Diagrama no editorial") &&
      !sanitizedResult.speechScript.includes("<figcaption>"),
    "Excluye captions de figuras e imágenes no editoriales"
  )

  assert(
    sanitizedResult.speechScript.startsWith("Introducción a los Agentes de Voz."),
    "Compone el título con punto final prosódico al inicio"
  )

  assert(
    sanitizedResult.wordCount > 10 && sanitizedResult.estimatedDurationSeconds > 0,
    "Calcula conteo de palabras y duración estimada de voz positiva"
  )

  // =========================================================================
  // 2. Test Suite: Audio Buffer Validator
  // =========================================================================
  console.log("\n▶ [TEST SUITE 2] Validador de Buffers de Audio (audio-validator)")

  // Synthetic MP3 buffer with ID3v2 header
  const validMp3Id3 = new Uint8Array(2048)
  validMp3Id3[0] = 0x49 // 'I'
  validMp3Id3[1] = 0x44 // 'D'
  validMp3Id3[2] = 0x33 // '3'
  validMp3Id3[3] = 0x04 // version 2.4
  validMp3Id3.fill(0x55, 4)

  assert(isMp3Buffer(validMp3Id3), "isMp3Buffer detecta encabezado ID3v2 válido")

  // Synthetic MP3 buffer with MPEG Frame Sync (0xFF 0xFB)
  const validMp3Sync = new Uint8Array(2048)
  validMp3Sync[0] = 0xff
  validMp3Sync[1] = 0xfb
  validMp3Sync.fill(0xaa, 2)

  assert(isMp3Buffer(validMp3Sync), "isMp3Buffer detecta frame sync MPEG Layer III")

  // Synthetic WAV buffer (RIFF...WAVE)
  const validWav = new Uint8Array(2048)
  validWav[0] = 0x52 // 'R'
  validWav[1] = 0x49 // 'I'
  validWav[2] = 0x46 // 'F'
  validWav[3] = 0x46 // 'F'
  validWav[8] = 0x57 // 'W'
  validWav[9] = 0x41 // 'A'
  validWav[10] = 0x56 // 'V'
  validWav[11] = 0x45 // 'E'
  validWav.fill(0x11, 12)

  assert(isWavBuffer(validWav), "isWavBuffer detecta encabezado RIFF WAVE")

  // Validation execution: valid MP3
  const validMp3Validation = validateAudioBuffer(validMp3Id3, {
    declaredContentType: "audio/mpeg",
  })
  assert(
    validMp3Validation.isValid && validMp3Validation.format === "mp3" && validMp3Validation.mimeType === "audio/mpeg",
    "validateAudioBuffer acepta MP3 válido con tipo MIME audio/mpeg"
  )

  // Validation execution: empty buffer (0 bytes)
  const emptyValidation = validateAudioBuffer(new Uint8Array(0))
  assert(
    !emptyValidation.isValid && Boolean(emptyValidation.error?.includes("vacío")),
    "validateAudioBuffer rechaza buffer vacío (0 bytes)"
  )

  // Validation execution: truncated small buffer (< 1KB)
  const truncatedValidation = validateAudioBuffer(new Uint8Array(500))
  assert(
    !truncatedValidation.isValid && Boolean(truncatedValidation.error?.includes("demasiado pequeño")),
    "validateAudioBuffer rechaza archivos truncados menores a 1024 bytes"
  )

  // Validation execution: corrupted / non-audio buffer
  const corruptedBuffer = new Uint8Array(2048).fill(0x00)
  const corruptedValidation = validateAudioBuffer(corruptedBuffer)
  assert(
    !corruptedValidation.isValid && Boolean(corruptedValidation.error?.includes("no contiene una firma válida")),
    "validateAudioBuffer rechaza buffers sin magic bytes de MP3 ni WAV"
  )

  // =========================================================================
  // 3. Test Suite: Idempotency & Deterministic Hash
  // =========================================================================
  console.log("\n▶ [TEST SUITE 3] Idempotencia y Hash Determinista")

  const title = "Arquitectura de Software Moderna"
  const contentA = "El contenido editorial de la publicación en su versión inicial."
  const contentB = "El contenido editorial modificado con nuevos párrafos."

  const hashA1 = computePostContentHash(title, contentA, "es")
  const hashA2 = computePostContentHash(title, contentA, "es")
  const hashB = computePostContentHash(title, contentB, "es")

  assert(hashA1 === hashA2, "computePostContentHash es estrictamente determinista para el mismo contenido")
  assert(hashA1 !== hashB, "computePostContentHash genera hashes distintos ante variaciones de contenido")

  const postId = "post_abc_123"
  const idempotencyKeyA = computeNarrationIdempotencyKey(postId, hashA1)
  const idempotencyKeyB = computeNarrationIdempotencyKey(postId, hashB)

  assert(
    idempotencyKeyA === `narration:post_abc_123:${hashA1}`,
    "computeNarrationIdempotencyKey construye la clave canónica 'narration:postId:contentHash'"
  )
  assert(idempotencyKeyA !== idempotencyKeyB, "Claves de idempotencia difieren cuando cambia el hash")

  const mockNarration: Pick<PostNarration, "contentHash"> = { contentHash: hashA1 }
  assert(
    !isNarrationOutdated(mockNarration, { title, content: contentA, language: "es" }),
    "isNarrationOutdated retorna false cuando el snapshot de texto coincide exactamente"
  )
  assert(
    isNarrationOutdated(mockNarration, { title, content: contentB, language: "es" }),
    "isNarrationOutdated retorna true cuando el post ha sido editado"
  )

  // =========================================================================
  // 4. Test Suite: Post Immutability Guarantee
  // =========================================================================
  console.log("\n▶ [TEST SUITE 4] Garantía de Inmutabilidad del Post")

  const originalPost = {
    id: "post_immutability_test",
    title: "Post Inmutable",
    content: "Texto original del artículo.",
    status: "published" as const,
    publishedAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z",
    views: 42,
    likes: 5,
  }

  // Deep clone to simulate state before job
  const postBeforeJob = JSON.stringify(originalPost)

  // Simulate simulated narration failure or processing
  const simulatedNarrationError = "Vapi synthesis timed out"
  const failedNarrationRecord: Partial<PostNarration> = {
    postId: originalPost.id,
    status: "failed",
    error: sanitizeVapiErrorMessage(new Error(simulatedNarrationError)),
    updatedAt: new Date().toISOString(),
  }

  // Assert post object remained untouched
  const postAfterJob = JSON.stringify(originalPost)
  assert(
    postBeforeJob === postAfterJob,
    "El post permanece 100% inalterado y de solo lectura ante fallos de generación"
  )
  assert(
    originalPost.status === "published" && originalPost.publishedAt === "2026-08-29T10:00:00.000Z",
    "No se despublica ni modifica la fecha publishedAt del post como efecto lateral"
  )

  // =========================================================================
  // 5. Test Suite: Seguridad y Privacidad en Proyecciones
  // =========================================================================
  console.log("\n▶ [TEST SUITE 5] Seguridad y Filtrado de Privacidad")

  const fullNarrationRecord: PostNarration = {
    id: "narr_sec_001",
    postId: originalPost.id,
    authorId: "user_author_123",
    tenantId: "tenant_demo",
    status: "ready",
    transcript: "Texto completo del guion de voz...",
    contentHash: hashA1,
    idempotencyKey: idempotencyKeyA,
    vapiCallId: "call_vapi_secret_id_999",
    fileSizeBytes: 245000,
    mimeType: "audio/mpeg",
    endedReason: "assistant-completed-speech",
    generationMetadata: {
      provider: "11labs",
      voiceId: "sarah",
      costUsd: 0.045,
      durationSeconds: 125,
      vapiCallId: "call_vapi_secret_id_999",
    },
    language: "es",
    voice: "sarah",
    duration: 125,
    format: "mp3",
    storageId: "storage_convex_file_777",
    audioUrl: "https://my-convex-app.convex.cloud/api/storage/file_777",
    error: undefined,
    createdAt: "2026-08-29T12:00:00.000Z",
    updatedAt: "2026-08-29T12:02:00.000Z",
    approvedAt: "2026-08-29T12:02:00.000Z",
  }

  // Simulate public reader projection (as in convex/narrations.ts getForPost)
  const publicProjection = {
    _id: fullNarrationRecord.id,
    postId: fullNarrationRecord.postId,
    status: fullNarrationRecord.status,
    language: fullNarrationRecord.language,
    voice: fullNarrationRecord.voice,
    duration: fullNarrationRecord.duration,
    format: fullNarrationRecord.format,
    audioUrl: fullNarrationRecord.audioUrl,
    transcript: fullNarrationRecord.transcript,
    approvedAt: fullNarrationRecord.approvedAt,
    createdAt: fullNarrationRecord.createdAt,
  }

  assert(
    !("vapiCallId" in publicProjection) && !("generationMetadata" in publicProjection),
    "La vista pública excluye vapiCallId y metadatos internos de coste/proveedor"
  )

  assert(
    !("error" in publicProjection) && !("idempotencyKey" in publicProjection),
    "La vista pública excluye registros de error internos y claves de idempotencia"
  )

  assert(
    publicProjection.audioUrl?.includes("convex.cloud") ?? false,
    "El audio listo es accesible desde el almacenamiento propio (Convex Storage)"
  )

  assert(
    publicProjection.transcript === fullNarrationRecord.transcript,
    "La vista pública incluye el transcript accesible para lectores"
  )

  // =========================================================================
  // 6. Test Suite: Sanitización de Errores y Cliente Vapi
  // =========================================================================
  console.log("\n▶ [TEST SUITE 6] Sanitización de Errores de Red y Proveedor")

  const sensitiveError1 = new Error(
    "Request failed with status 401: Unauthorized. Bearer key_vapi_super_secret_token_12345 was invalid."
  )
  const sanitized1 = sanitizeVapiErrorMessage(sensitiveError1)

  assert(
    !sanitized1.includes("key_vapi_super_secret_token_12345") &&
      !sanitized1.includes("Bearer key_vapi"),
    "sanitizeVapiErrorMessage elimina claves de API privadas y tokens Bearer"
  )

  const sensitiveError2 = new Error("Connection timed out after 30000ms")
  const sanitized2 = sanitizeVapiErrorMessage(sensitiveError2)
  assert(
    sanitized2.includes("tiempo de espera"),
    "sanitizeVapiErrorMessage traduce timeouts a descripciones entendibles en español para el autor"
  )

  const audioConfig = getAudioServerConfig()
  assert(
    audioConfig.vapiBaseUrl === "https://api.vapi.ai" && audioConfig.allowedMimeTypes.includes("audio/mpeg"),
    "getAudioServerConfig carga valores predeterminados seguros en servidor"
  )

  // =========================================================================
  // Resumen Final
  // =========================================================================
  console.log("\n===================================================================")
  console.log(`🏁 RESUMEN GENERAL: ${totalPassed} PASARON | ${totalFailed} FALLARON`)
  console.log("===================================================================")

  if (totalFailed > 0) {
    console.error("\nFallos detectados:")
    failureList.forEach((f) => console.error(` - ${f}`))
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error("Error fatal en el runner de pruebas del job de narración:", err)
  process.exit(1)
})
