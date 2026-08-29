export type NarrationStatus = "pending" | "generating" | "ready" | "failed" | "deleted"

export type AudioFormat = "mp3" | "wav"

export interface NarrationGenerationMetadata {
  provider?: string
  voiceId?: string
  voiceProvider?: string
  costUsd?: number
  durationSeconds?: number
  vapiCallId?: string
  endedReason?: string
  wordCount?: number
  [key: string]: any
}

export interface PostNarration {
  id: string
  postId: string
  authorId: string
  tenantId?: string
  organizationId?: string
  status: NarrationStatus
  transcript: string
  contentHash: string
  idempotencyKey?: string
  vapiCallId?: string
  fileSizeBytes?: number
  mimeType?: string
  endedReason?: string
  generationMetadata?: NarrationGenerationMetadata
  language: string
  voice: string
  duration?: number
  format: AudioFormat
  storageId?: string
  audioUrl?: string | null
  isOutdated?: boolean
  error?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string | null
}

export interface CreateNarrationInput {
  postId: string
  authorId: string
  tenantId?: string
  organizationId?: string
  transcript: string
  contentHash: string
  idempotencyKey?: string
  vapiCallId?: string
  fileSizeBytes?: number
  mimeType?: string
  endedReason?: string
  generationMetadata?: NarrationGenerationMetadata
  language?: string
  voice?: string
  format?: AudioFormat
  status?: NarrationStatus
  duration?: number
  storageId?: string
  audioUrl?: string | null
  error?: string
}

export interface UpdateNarrationInput {
  status?: NarrationStatus
  transcript?: string
  contentHash?: string
  idempotencyKey?: string
  vapiCallId?: string
  fileSizeBytes?: number
  mimeType?: string
  endedReason?: string
  generationMetadata?: NarrationGenerationMetadata
  language?: string
  voice?: string
  duration?: number
  format?: AudioFormat
  storageId?: string
  audioUrl?: string | null
  error?: string
  approvedAt?: string | null
}

/**
 * Computes a deterministic content hash from title, content, and language.
 * Uses a lightweight, zero-dependency 32-bit FNV-1a / Murmur-inspired dual hash
 * to produce a hexadecimal checksum compatible across all JavaScript runtimes
 * (Node.js, Convex, Edge, Browser).
 */
export function computePostContentHash(
  title: string,
  content: string,
  language: string = "es"
): string {
  const normalized = `${(title || "").trim()}:::${(content || "").trim()}:::${(language || "es").trim().toLowerCase()}`
  
  let h1 = 0x811c9dc5
  let h2 = 0x1000193
  
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i)
    h1 ^= code
    h1 = Math.imul(h1, 16777619)
    h2 ^= code
    h2 = Math.imul(h2, 2166136261)
  }
  
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0")
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0")
  return `hash_${hex1}${hex2}`
}

/**
 * Hash of the sanitized speech script (not raw HTML).
 * Must match the value persisted by the narration job.
 */
export function computeNarrationSourceHash(
  title: string,
  speechScript: string,
  language: string = "es"
): string {
  return computePostContentHash(title, speechScript, language)
}

/**
 * Checks if a narration is outdated compared to the current speech script snapshot.
 * `post.content` must be the sanitized speech script (or identical source used at generation).
 */
export function isNarrationOutdated(
  narration: Pick<PostNarration, "contentHash">,
  post: { title: string; content: string; language?: string }
): boolean {
  if (!narration || !narration.contentHash) return true
  const currentHash = computeNarrationSourceHash(post.title, post.content, post.language)
  return narration.contentHash !== currentHash
}

/**
 * Computes a unique idempotency key for a narration generation job.
 */
export function computeNarrationIdempotencyKey(postId: string, contentHash: string): string {
  return `narration:${postId.trim()}:${contentHash.trim()}`
}
