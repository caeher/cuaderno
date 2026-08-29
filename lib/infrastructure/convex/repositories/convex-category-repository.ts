import { api } from "@/convex/_generated/api"
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/domain/entities"
import type { CategoryRepository } from "@/lib/domain/repositories"
import { convexMutation, convexQuery } from "../client"
import { convexDocToCategory } from "../mappers"

export class ConvexCategoryRepository implements CategoryRepository {
  async findAll(): Promise<Category[]> {
    const docs = await convexQuery(api.categories.list)
    return (docs || []).map(convexDocToCategory)
  }

  async findById(id: string): Promise<Category | null> {
    const doc = await convexQuery(api.categories.getById, { id })
    return doc ? convexDocToCategory(doc) : null
  }

  async findBySlug(slug: string, organizationId?: string): Promise<Category | null> {
    const doc = await convexQuery(api.categories.getBySlug, {
      slug,
      organizationId,
    })
    return doc ? convexDocToCategory(doc) : null
  }

  async findByOrganization(organizationId: string): Promise<Category[]> {
    const docs = await convexQuery(api.categories.getByOrganization, {
      organizationId,
    })
    return (docs || []).map(convexDocToCategory)
  }

  async create(input: CreateCategoryInput & { id?: string }): Promise<Category> {
    const doc = await convexMutation(api.categories.create, {
      id: input.id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      color: input.color,
      icon: input.icon,
      organizationId: input.organizationId,
      authorId: input.authorId,
    })
    return convexDocToCategory(doc)
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const doc = await convexMutation(api.categories.update, {
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      color: input.color,
      icon: input.icon,
    })
    return doc ? convexDocToCategory(doc) : null
  }

  async delete(id: string): Promise<boolean> {
    const success = await convexMutation(api.categories.remove, { id })
    return Boolean(success)
  }
}
