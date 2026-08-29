import { api } from "@/convex/_generated/api"
import type {
  CreateTagInput,
  Tag,
  UpdateTagInput,
} from "@/lib/domain/entities"
import type { TagRepository } from "@/lib/domain/repositories"
import { convexMutation, convexQuery } from "../client"
import { convexDocToTag } from "../mappers"

export class ConvexTagRepository implements TagRepository {
  async findAll(): Promise<Tag[]> {
    const docs = await convexQuery(api.tags.list)
    return (docs || []).map(convexDocToTag)
  }

  async findById(id: string): Promise<Tag | null> {
    const doc = await convexQuery(api.tags.getById, { id })
    return doc ? convexDocToTag(doc) : null
  }

  async findBySlug(slug: string, organizationId?: string): Promise<Tag | null> {
    const doc = await convexQuery(api.tags.getBySlug, {
      slug,
      organizationId,
    })
    return doc ? convexDocToTag(doc) : null
  }

  async findByOrganization(organizationId: string): Promise<Tag[]> {
    const docs = await convexQuery(api.tags.getByOrganization, {
      organizationId,
    })
    return (docs || []).map(convexDocToTag)
  }

  async create(input: CreateTagInput & { id?: string }): Promise<Tag> {
    const doc = await convexMutation(api.tags.create, {
      id: input.id,
      name: input.name,
      slug: input.slug,
      color: input.color,
      organizationId: input.organizationId,
      authorId: input.authorId,
    })
    return convexDocToTag(doc)
  }

  async update(id: string, input: UpdateTagInput): Promise<Tag | null> {
    const doc = await convexMutation(api.tags.update, {
      id,
      name: input.name,
      slug: input.slug,
      color: input.color,
    })
    return doc ? convexDocToTag(doc) : null
  }

  async delete(id: string): Promise<boolean> {
    const success = await convexMutation(api.tags.remove, { id })
    return Boolean(success)
  }
}
