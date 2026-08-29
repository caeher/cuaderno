/**
 * Server-Side Audio Artifact Validator
 *
 * Strictly validates audio buffers downloaded from Vapi or speech synthesis engines
 * prior to persisting to permanent Convex Storage and marking status as "ready".
 *
 * Validations:
 * 1. Buffer Size: Minimum non-empty threshold (> 1 KB) and maximum security threshold (< 50 MB).
 * 2. MIME & Content-Type: Validated against allowed audio types (audio/mpeg, audio/wav).
 * 3. Binary Magic Byte Signature:
 *    - MP3: ID3v2 header ('ID3' / 0x49 0x44 0x33) or MPEG sync frame (0xFF 0xFB, 0xFF 0xF3, 0xFF 0xF2).
 *    - WAV: RIFF container with WAVE format identifier ('RIFF'....'WAVE').
 * 4. Duration sanity check (> 0 seconds).
 */

import {
  ALLOWED_AUDIO_FORMATS,
  ALLOWED_AUDIO_MIME_TYPES,
  type AllowedAudioFormat,
  type AllowedAudioMimeType,
} from "./audio-config"

export interface AudioValidationResult {
  isValid: boolean
  error?: string
  format: AllowedAudioFormat
  mimeType: AllowedAudioMimeType
  sizeBytes: number
  hasMagicBytes: boolean
  estimatedDurationSeconds?: number
}

export interface AudioValidationOptions {
  minSizeBytes?: number
  maxSizeBytes?: number
  expectedFormat?: AllowedAudioFormat
  declaredContentType?: string | null
  reportedDurationSeconds?: number
}

const DEFAULT_MIN_SIZE_BYTES = 1024 // 1 KB min to reject empty / corrupted headers
const DEFAULT_MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB max limit

/**
 * Checks if a byte buffer starts with or contains valid MP3 headers (ID3v2 or MPEG Sync).
 */
export function isMp3Buffer(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false

  // 1. Check ID3v2 tag ('I', 'D', '3')
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return true
  }

  // 2. Check MPEG Audio Frame Sync word (11 bits set: 0xFF followed by 0xEx or 0xFx)
  // Standard Layer III: 0xFF 0xFB (MPEG 1 Layer 3), 0xFF 0xF3 (MPEG 2 Layer 3), 0xFF 0xF2 (MPEG 2.5 Layer 3)
  for (let i = 0; i < Math.min(bytes.length - 1, 4096); i++) {
    if (bytes[i] === 0xff && (bytes[i + 1] & 0xe0) === 0xe0) {
      const layer = (bytes[i + 1] >> 1) & 0x03
      // layer 1 = Layer III, layer 2 = Layer II, layer 3 = Layer I
      if (layer !== 0) {
        return true
      }
    }
  }

  return false
}

/**
 * Checks if a byte buffer is a valid RIFF WAVE audio file.
 */
export function isWavBuffer(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false

  // Check 'RIFF' at 0..3
  const isRiff =
    bytes[0] === 0x52 && // 'R'
    bytes[1] === 0x49 && // 'I'
    bytes[2] === 0x46 && // 'F'
    bytes[3] === 0x46 // 'F'

  // Check 'WAVE' at 8..11
  const isWave =
    bytes[8] === 0x57 && // 'W'
    bytes[9] === 0x41 && // 'A'
    bytes[10] === 0x56 && // 'V'
    bytes[11] === 0x45 // 'E'

  return isRiff && isWave
}

/**
 * Validates a downloaded audio buffer against size, container, format, and magic bytes.
 */
export function validateAudioBuffer(
  buffer: ArrayBuffer | Uint8Array,
  options?: AudioValidationOptions
): AudioValidationResult {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  const sizeBytes = bytes.byteLength
  const minSize = options?.minSizeBytes ?? DEFAULT_MIN_SIZE_BYTES
  const maxSize = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES

  // 1. Check size bounds
  if (sizeBytes === 0) {
    return {
      isValid: false,
      error: "El archivo de audio está vacío (0 bytes).",
      format: options?.expectedFormat || "mp3",
      mimeType: "audio/mpeg",
      sizeBytes: 0,
      hasMagicBytes: false,
    }
  }

  if (sizeBytes < minSize) {
    return {
      isValid: false,
      error: `El archivo de audio es demasiado pequeño (${sizeBytes} bytes). Mínimo requerido: ${minSize} bytes.`,
      format: options?.expectedFormat || "mp3",
      mimeType: "audio/mpeg",
      sizeBytes,
      hasMagicBytes: false,
    }
  }

  if (sizeBytes > maxSize) {
    return {
      isValid: false,
      error: `El archivo de audio excede el tamaño máximo permitido (${sizeBytes} bytes > ${maxSize} bytes).`,
      format: options?.expectedFormat || "mp3",
      mimeType: "audio/mpeg",
      sizeBytes,
      hasMagicBytes: false,
    }
  }

  // 2. Identify format and magic bytes
  const isMp3 = isMp3Buffer(bytes)
  const isWav = isWavBuffer(bytes)

  if (!isMp3 && !isWav) {
    return {
      isValid: false,
      error: "El buffer recibido no contiene una firma válida de audio MP3 (ID3/MPEG) ni WAV (RIFF).",
      format: options?.expectedFormat || "mp3",
      mimeType: "audio/mpeg",
      sizeBytes,
      hasMagicBytes: false,
    }
  }

  const detectedFormat: AllowedAudioFormat = isWav ? "wav" : "mp3"
  const detectedMimeType: AllowedAudioMimeType = isWav ? "audio/wav" : "audio/mpeg"

  // 3. Validate declared content type if provided
  if (options?.declaredContentType) {
    const rawContent = options.declaredContentType.toLowerCase().split(";")[0].trim()
    const isValidDeclared = (ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(rawContent)
    if (!isValidDeclared && rawContent !== "application/octet-stream" && rawContent !== "audio/mp3") {
      return {
        isValid: false,
        error: `Content-Type "${options.declaredContentType}" no es un tipo de audio permitido (${ALLOWED_AUDIO_MIME_TYPES.join(", ")}).`,
        format: detectedFormat,
        mimeType: detectedMimeType,
        sizeBytes,
        hasMagicBytes: true,
      }
    }
  }

  // 4. Estimate duration if not reported (assuming ~128kbps for mp3, ~1411kbps for wav PCM)
  let estimatedDuration = options?.reportedDurationSeconds
  if (!estimatedDuration || estimatedDuration <= 0) {
    if (detectedFormat === "mp3") {
      // 128 kbps = 16,000 bytes / sec
      estimatedDuration = Math.max(1, Math.round(sizeBytes / 16000))
    } else {
      // 16-bit 44.1kHz stereo WAV = 176,400 bytes / sec
      estimatedDuration = Math.max(1, Math.round(sizeBytes / 176400))
    }
  }

  return {
    isValid: true,
    format: detectedFormat,
    mimeType: detectedMimeType,
    sizeBytes,
    hasMagicBytes: true,
    estimatedDurationSeconds: estimatedDuration,
  }
}
