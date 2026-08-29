import type {
  AudioFormat,
  NarrationStatus,
  PostNarration,
} from "@/lib/domain/entities"
import {
  computeNarrationSourceHash,
  isNarrationOutdated,
} from "@/lib/domain/entities"
import { cleanPostToSpeechScript } from "@/lib/server/speech-script-sanitizer"
import {
  narrationRepository,
  postRepository,
} from "@/lib/infrastructure/repositories"
import {
  executePostNarrationJob,
  type ExecuteNarrationJobOptions,
  type NarrationJobExecutionResult,
} from "@/lib/server/narration-job-runner"

/**
 * Obtiene la narración asociada a una publicación.
 */
export async function getNarrationForPost(postId: string): Promise<PostNarration | null> {
  return narrationRepository.findByPostId(postId)
}

/**
 * Ejecuta el job server-side para generar o reutilizar una narración de voz Vapi.
 */
export async function generatePostNarration(
  postId: string,
  options?: ExecuteNarrationJobOptions
): Promise<NarrationJobExecutionResult> {
  return executePostNarrationJob(postId, options)
}

/**
 * Reintenta o regenera forzosamente la narración de una publicación.
 */
export async function retryPostNarration(
  postId: string,
  options?: Omit<ExecuteNarrationJobOptions, "forceRegenerate">
): Promise<NarrationJobExecutionResult> {
  return executePostNarrationJob(postId, {
    ...options,
    forceRegenerate: true,
  })
}

/**
 * Inicia una solicitud de narración para un post calculando su snapshot y hash de contenido.
 */
export async function createNarrationRequest(
  postId: string,
  options?: {
    language?: string
    voice?: string
    format?: AudioFormat
  }
): Promise<PostNarration> {
  const post = await postRepository.findById(postId)
  if (!post) {
    throw new Error(`Publicación con ID "${postId}" no encontrada.`)
  }

  const language = options?.language || "es"
  const script = cleanPostToSpeechScript(post.title, post.content, post.excerpt, {
    language,
  })
  const contentHash = computeNarrationSourceHash(post.title, script.speechScript, language)
  const voice = options?.voice || "sarah"
  const format = options?.format || "mp3"

  return narrationRepository.create({
    postId: post.id,
    authorId: post.authorId,
    tenantId: post.organizationId || post.authorId,
    organizationId: post.organizationId,
    transcript: script.speechScript,
    contentHash,
    language,
    voice,
    format,
    status: "pending",
  })
}

/**
 * Verifica si una narración ha quedado desactualizada con respecto al estado actual del post.
 */
export function checkNarrationOutdated(
  narration: PostNarration,
  post: { title: string; content: string; language?: string }
): boolean {
  return isNarrationOutdated(narration, post)
}

/**
 * Lista narraciones asociadas a un tenant.
 */
export async function listTenantNarrations(
  tenantId: string,
  status?: NarrationStatus
): Promise<PostNarration[]> {
  return narrationRepository.findByTenant(tenantId, status)
}

/**
 * Actualiza la transcripción editable de una narración.
 */
export async function updateNarrationTranscript(
  id: string,
  transcript: string
): Promise<PostNarration | null> {
  return narrationRepository.update(id, { transcript })
}

/**
 * Elimina una narración de forma segura.
 */
export async function deleteNarration(id: string): Promise<boolean> {
  return narrationRepository.delete(id)
}

