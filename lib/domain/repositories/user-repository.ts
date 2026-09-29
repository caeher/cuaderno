import type {
  PublicAuthor,
  PublicLegalSettings,
  PublicTenantSeoSettings,
  UpdateUserInput,
  User,
} from "../entities"

export interface SyncFromClerkInput {
  clerkUserId: string
  name: string
  email: string
  username?: string
  avatarUrl?: string
}

export interface UserRepository {
  findAllPublic(): Promise<PublicAuthor[]>
  findById(id: string): Promise<User | null>
  findCurrent(): Promise<User | null>
  findPublicByUsername(username: string): Promise<PublicAuthor | null>
  findPublicLegalSettings(username: string): Promise<PublicLegalSettings | null>
  findPublicSeoSettings(username: string): Promise<PublicTenantSeoSettings | null>
  syncFromClerk(input: SyncFromClerkInput): Promise<User>
  create(user: User): Promise<User>
  update(id: string, input: UpdateUserInput): Promise<User | null>
}
