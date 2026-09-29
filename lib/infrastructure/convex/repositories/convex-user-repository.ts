import { api } from "@/convex/_generated/api"
import type {
  PublicAuthor,
  PublicLegalSettings,
  PublicTenantSeoSettings,
  UpdateUserInput,
  User,
} from "@/lib/domain/entities"
import type { SyncFromClerkInput, UserRepository } from "@/lib/domain/repositories"
import { convexMutation, convexQuery } from "../client"
import {
  convexDocToPublicAuthor,
  convexDocToPublicLegalSettings,
  convexDocToPublicSeoSettings,
  convexDocToUser,
} from "../mappers"

export class ConvexUserRepository implements UserRepository {
  async findAllPublic(): Promise<PublicAuthor[]> {
    const docs = await convexQuery(api.users.listPublic)
    return (docs || []).map(convexDocToPublicAuthor)
  }

  async findById(id: string): Promise<User | null> {
    const doc = await convexQuery(api.users.getPrivateById, { id })
    return doc ? convexDocToUser(doc) : null
  }

  async findCurrent(): Promise<User | null> {
    const doc = await convexQuery(api.users.getCurrent)
    return doc ? convexDocToUser(doc) : null
  }

  async findPublicByUsername(username: string): Promise<PublicAuthor | null> {
    const doc = await convexQuery(api.users.getPublicByUsername, { username })
    return doc ? convexDocToPublicAuthor(doc) : null
  }

  async findPublicLegalSettings(username: string): Promise<PublicLegalSettings | null> {
    const doc = await convexQuery(api.users.getPublicLegalSettingsByUsername, { username })
    return doc ? convexDocToPublicLegalSettings(doc) : null
  }

  async findPublicSeoSettings(username: string): Promise<PublicTenantSeoSettings | null> {
    const doc = await convexQuery(api.users.getPublicSeoSettingsByUsername, { username })
    return doc ? convexDocToPublicSeoSettings(doc) : null
  }

  async syncFromClerk(input: SyncFromClerkInput): Promise<User> {
    const doc = await convexMutation(api.users.syncFromClerk, input)
    if (!doc) {
      throw new Error("No se pudo sincronizar el usuario desde Clerk.")
    }
    return convexDocToUser(doc)
  }

  async create(user: User): Promise<User> {
    const doc = await convexMutation(api.users.create, {
      id: user.legacyId,
      clerkUserId: user.clerkUserId,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      tagline: user.tagline,
      location: user.location,
      socials: user.socials,
      role: user.role,
      joinedAt: user.joinedAt,
      postCount: user.postCount,
      followerCount: user.followerCount,
      timezone: user.timezone,
      subdomainEnabled: user.subdomainEnabled,
      customDomain: user.customDomain,
      legalSettings: user.legalSettings,
      seoSettings: user.seoSettings,
    })
    if (!doc) {
      throw new Error("No se pudo crear el usuario.")
    }
    return convexDocToUser(doc)
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const doc = await convexMutation(api.users.update, {
      id,
      username: input.username,
      name: input.name,
      email: input.email,
      avatarUrl: input.avatarUrl,
      coverUrl: input.coverUrl,
      bio: input.bio,
      tagline: input.tagline,
      location: input.location,
      socials: input.socials,
      timezone: input.timezone,
      subdomainEnabled: input.subdomainEnabled,
      customDomain: input.customDomain,
      legalSettings: input.legalSettings,
      seoSettings: input.seoSettings,
    })
    return doc ? convexDocToUser(doc) : null
  }
}
