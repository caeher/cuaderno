/**
 * Entidades y tipos de dominio de Composer (issue #15).
 *
 * Capa de dominio puro (DDD / Clean Architecture): sin dependencias de base de datos ni SDKs externos.
 */

export type ComposerSessionStatus =
  | "collecting"
  | "awaiting_confirmation"
  | "researching"
  | "drafting"
  | "imaging"
  | "awaiting_review"
  | "failed"
  | "cancelled"

export type ComposerJobKind =
  | "research"
  | "outline"
  | "article"
  | "image"
  | "moderation"

export type ComposerJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled"

export type ComposerArtifactKind =
  | "outline"
  | "article"
  | "excerpt"
  | "taxonomy"
  | "altText"
  | "cover"

export type ComposerMessageRole = "user" | "assistant" | "system"

export interface ComposerBrief {
  topic?: string
  objective?: string
  audience?: string
  tone?: string
  language?: string
  targetCountry?: string
  targetLength?: number
  cutoffDate?: string
  preferredDomains?: string[]
  excludedDomains?: string[]
  seoKeywords?: string[]
  constraints?: string
  wantsCoverImage?: boolean
  wantsExtraImages?: boolean
}

export interface ComposerSession {
  id: string
  tenantId: string
  authorId: string
  title?: string
  brief: ComposerBrief
  status: ComposerSessionStatus
  failureReason?: string
  postId?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface ComposerMessage {
  id: string
  sessionId: string
  tenantId: string
  role: ComposerMessageRole
  content: string
  createdAt: string
}

export interface ComposerJob {
  id: string
  sessionId: string
  tenantId: string
  kind: ComposerJobKind
  status: ComposerJobStatus
  idempotencyKey: string
  progress?: number
  attempt: number
  error?: string
  startedAt?: string
  finishedAt?: string
  createdAt: string
}

export type ComposerClaimStatus = "confirmed" | "inferred" | "unverified"

export interface ComposerSourceClaim {
  text: string
  offset?: number
  status?: ComposerClaimStatus
}

export interface ComposerSource {
  id: string
  sessionId: string
  tenantId: string
  url: string
  title?: string
  domain?: string
  publisher?: string
  publishedAt?: string
  fetchedAt: string
  snippet?: string
  isExcluded?: boolean
  claims: ComposerSourceClaim[]
}

export interface ComposerArtifact {
  id: string
  sessionId: string
  tenantId: string
  kind: ComposerArtifactKind
  content?: string
  storageId?: string
  version: number
  supersededBy?: string
  createdAt: string
}

export interface AiUsageEvent {
  id: string
  tenantId: string
  sessionId?: string
  jobId?: string
  phase: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  imageCount?: number
  toolCalls?: number
  estimatedCostUsd?: number
  actualCostUsd?: number
  status: string
  requestId?: string
  createdAt: string
}

export interface ComposerSessionUsage {
  events: AiUsageEvent[]
  totalEstimatedCostUsd: number
  totalInputTokens: number
  totalOutputTokens: number
  totalImageCount: number
  totalToolCalls: number
}

export interface ComposerOutlineSection {
  title: string
  level: 2 | 3
  description: string
  keyPoints: string[]
  targetWordCount?: number
  relevantSources?: string[]
}

export interface ComposerOutline {
  suggestedTitle: string
  summary: string
  sections: ComposerOutlineSection[]
  estimatedTotalWords: number
}

export interface ComposerDraftArticle {
  title: string
  suggestedSlug: string
  excerpt: string
  content: string
  headings: Array<{ text: string; level: number }>
  metaDescription: string
  suggestedCategories?: string[]
  suggestedTags?: string[]
  callToAction?: string
}

export interface ComposerDraftValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface PhaseMetrics {
  totalEvents: number
  succeeded: number
  failed: number
  moderated: number
  refused: number
  totalCostUsd: number
  totalInputTokens: number
  totalOutputTokens: number
  totalImageCount: number
  totalToolCalls: number
}

export interface AiMetricsSummary {
  tenantId: string
  totalEvents: number
  successRate: number
  failureRate: number
  succeededCount: number
  failedCount: number
  moderatedCount: number
  refusedCount: number
  totalCostUsd: number
  totalInputTokens: number
  totalOutputTokens: number
  totalImageCount: number
  totalToolCalls: number
  phaseBreakdown: Record<string, PhaseMetrics>
}

export interface ComposerEvalCase {
  id: string
  name: string
  category: "multilingual" | "sensitive_moderation" | "ambiguity" | "prompt_injection" | "conflicting_sources" | "provider_faults"
  description: string
  input: {
    brief: ComposerBrief
    simulatedWebSnippet?: string
    injectedPrompt?: string
  }
  expected: {
    shouldTriggerModeration?: boolean
    shouldDetectAmbiguity?: boolean
    shouldSanitizeInjection?: boolean
    shouldHandleErrorGracefully?: boolean
    expectedLanguage?: string
  }
}

export interface ComposerEvalResult {
  caseId: string
  caseName: string
  passed: boolean
  details: string
  durationMs?: number
}

/**
 * Genera una clave de idempotencia determinista para un trabajo de Composer.
 */
export function computeComposerJobIdempotencyKey(
  sessionId: string,
  kind: ComposerJobKind,
  attempt: number = 0
): string {
  return `composer:${sessionId.trim()}:${kind.trim()}:attempt_${attempt}`
}
