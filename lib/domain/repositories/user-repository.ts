import type { UpdateUserInput, User } from "../entities"

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  create(user: User): Promise<User>
  update(id: string, input: UpdateUserInput): Promise<User | null>
}
