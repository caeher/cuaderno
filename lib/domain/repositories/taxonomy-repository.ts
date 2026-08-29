import type {
  Category,
  CreateCategoryInput,
  CreateTagInput,
  Tag,
  UpdateCategoryInput,
  UpdateTagInput,
} from "../entities"

export interface CategoryRepository {
  findAll(): Promise<Category[]>
  findById(id: string): Promise<Category | null>
  findBySlug(slug: string, organizationId?: string): Promise<Category | null>
  findByOrganization(organizationId: string): Promise<Category[]>
  create(input: CreateCategoryInput & { id?: string }): Promise<Category>
  update(id: string, input: UpdateCategoryInput): Promise<Category | null>
  delete(id: string): Promise<boolean>
}

export interface TagRepository {
  findAll(): Promise<Tag[]>
  findById(id: string): Promise<Tag | null>
  findBySlug(slug: string, organizationId?: string): Promise<Tag | null>
  findByOrganization(organizationId: string): Promise<Tag[]>
  create(input: CreateTagInput & { id?: string }): Promise<Tag>
  update(id: string, input: UpdateTagInput): Promise<Tag | null>
  delete(id: string): Promise<boolean>
}
