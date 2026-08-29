import { api } from "@/convex/_generated/api"
import type {
  CreateNarrationInput,
  NarrationStatus,
  PostNarration,
  UpdateNarrationInput,
} from "@/lib/domain/entities"
import type { NarrationRepository } from "@/lib/domain/repositories"
import { convexMutation, convexQuery } from "../client"
import { convexDocToNarration } from "../mappers"

export class ConvexNarrationRepository implements NarrationRepository {
  async findByPostId(postId: string): Promise<PostNarration | null> {
    const doc = await convexQuery(api.narrations.getForPost, { postId })
    return doc ? convexDocToNarration(doc) : null
  }

  async findById(id: string): Promise<PostNarration | null> {
    const doc = await convexQuery(api.narrations.getById, { id })
    return doc ? convexDocToNarration(doc) : null
  }

  async findByIdempotencyKey(key: string): Promise<PostNarration | null> {
    const doc = await convexQuery((api.narrations as any).getByIdempotencyKey, {
      idempotencyKey: key,
    })
    return doc ? convexDocToNarration(doc) : null
  }

  async findByTenant(tenantId: string, status?: NarrationStatus): Promise<PostNarration[]> {
    const docs = await convexQuery(api.narrations.listByTenant, {
      tenantId,
      status,
    })
    return (docs || []).map((doc) => convexDocToNarration(doc))
  }

  async create(input: CreateNarrationInput): Promise<PostNarration> {
    const doc = await convexMutation(api.narrations.create, {
      postId: input.postId,
      transcript: input.transcript,
      contentHash: input.contentHash,
      idempotencyKey: input.idempotencyKey,
      language: input.language,
      voice: input.voice,
      format: input.format,
      status: input.status,
    })
    return convexDocToNarration(doc)
  }

  async update(id: string, input: UpdateNarrationInput): Promise<PostNarration | null> {
    const doc = await convexMutation(api.narrations.updateStatus, {
      id,
      status: input.status,
      storageId: input.storageId as any,
      vapiCallId: input.vapiCallId,
      idempotencyKey: input.idempotencyKey,
      fileSizeBytes: input.fileSizeBytes,
      mimeType: input.mimeType,
      endedReason: input.endedReason,
      generationMetadata: input.generationMetadata,
      duration: input.duration,
      error: input.error,
      transcript: input.transcript,
      contentHash: input.contentHash,
      format: input.format,
    })
    return doc ? convexDocToNarration(doc) : null
  }

  async deleteStorageBlob(storageId: string): Promise<boolean> {
    const success = await convexMutation(api.narrations.deleteStorageBlob, {
      storageId: storageId as never,
    })
    return Boolean(success)
  }

  async delete(id: string): Promise<boolean> {
    const success = await convexMutation(api.narrations.remove, { id })
    return Boolean(success)
  }
}
