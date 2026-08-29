/**
 * Encodes raw PCM s16le (mono) into a RIFF WAVE container.
 * Used to persist Vapi WebSocket audio without a third-party encoder.
 */

export const VAPI_PCM_SAMPLE_RATE = 16_000
export const VAPI_PCM_CHANNELS = 1
export const VAPI_PCM_BITS_PER_SAMPLE = 16

export function estimatePcmDurationSeconds(
  pcmByteLength: number,
  sampleRate: number = VAPI_PCM_SAMPLE_RATE
): number {
  const bytesPerSecond = sampleRate * VAPI_PCM_CHANNELS * (VAPI_PCM_BITS_PER_SAMPLE / 8)
  if (bytesPerSecond <= 0 || pcmByteLength <= 0) return 0
  return pcmByteLength / bytesPerSecond
}

export function encodePcmS16leToWav(
  pcm: Uint8Array | ArrayBuffer,
  sampleRate: number = VAPI_PCM_SAMPLE_RATE
): ArrayBuffer {
  const pcmBytes = pcm instanceof Uint8Array ? pcm : new Uint8Array(pcm)
  const dataSize = pcmBytes.byteLength
  const numChannels = VAPI_PCM_CHANNELS
  const bitsPerSample = VAPI_PCM_BITS_PER_SAMPLE
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)

  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeAscii = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i))
    }
  }

  writeAscii(0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(8, "WAVE")
  writeAscii(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeAscii(36, "data")
  view.setUint32(40, dataSize, true)
  new Uint8Array(buffer, 44).set(pcmBytes)

  return buffer
}
