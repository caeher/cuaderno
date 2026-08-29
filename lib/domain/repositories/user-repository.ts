import type { UpdateUserInput, User } from "../entities"

export interface SyncFromClerkInput {
  clerkUserId: string
  name: string
  email: string
  username?: string
  avatarUrl?: string
}

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  findByClerkUserId(clerkUserId: string): Promise<User | null>
  syncFromClerk(input: SyncFromClerkInput): Promise<User>
  create(user: User): Promise<User>
  update(id: string, input: UpdateUserInput): Promise<User | null>
}
