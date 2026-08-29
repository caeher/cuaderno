import type {
  CreateNarrationInput,
  NarrationStatus,
  PostNarration,
  UpdateNarrationInput,
} from "../entities"

export interface NarrationRepository {
  findByPostId(postId: string): Promise<PostNarration | null>
  findById(id: string): Promise<PostNarration | null>
  findByIdempotencyKey(key: string): Promise<PostNarration | null>
  findByTenant(tenantId: string, status?: NarrationStatus): Promise<PostNarration[]>
  create(input: CreateNarrationInput): Promise<PostNarration>
  update(id: string, input: UpdateNarrationInput): Promise<PostNarration | null>
  delete(id: string): Promise<boolean>
  deleteStorageBlob(storageId: string): Promise<boolean>
}
