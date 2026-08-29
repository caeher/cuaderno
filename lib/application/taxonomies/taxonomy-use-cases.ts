import type {
  Category,
  CreateCategoryInput,
  CreateTagInput,
  Tag,
  UpdateCategoryInput,
  UpdateTagInput,
} from "@/lib/domain/entities"
import { categoryRepository, postRepository, tagRepository } from "@/lib/infrastructure/repositories"

export async function getAllCategories(): Promise<Category[]> {
  const [categories, posts] = await Promise.all([categoryRepository.findAll(), postRepository.findAll()])
  return categories.map((cat) => ({
    ...cat,
    postCount: posts.filter((p) => p.categoryId === cat.id).length,
  }))
}

export async function getCategoriesByOrganization(orgId: string): Promise<Category[]> {
  const [categories, posts] = await Promise.all([
    categoryRepository.findByOrganization(orgId),
    postRepository.findAll(),
  ])
  return categories.map((cat) => ({
    ...cat,
    postCount: posts.filter((p) => p.categoryId === cat.id).length,
  }))
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categoryRepository.findById(id)
}

export async function getCategoryBySlug(slug: string, orgId?: string): Promise<Category | null> {
  return categoryRepository.findBySlug(slug, orgId)
}

export async function createCategory(input: CreateCategoryInput & { id?: string }): Promise<Category> {
  return categoryRepository.create(input)
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category | null> {
  return categoryRepository.update(id, input)
}

export async function deleteCategory(id: string): Promise<boolean> {
  return categoryRepository.delete(id)
}

export async function getAllTags(): Promise<Tag[]> {
  const [tags, posts] = await Promise.all([tagRepository.findAll(), postRepository.findAll()])
  return tags.map((t) => ({
    ...t,
    postCount: posts.filter((p) => p.tags.includes(t.slug) || p.tags.includes(t.id)).length,
  }))
}

export async function getTagsByOrganization(orgId: string): Promise<Tag[]> {
  const [tags, posts] = await Promise.all([
    tagRepository.findByOrganization(orgId),
    postRepository.findAll(),
  ])
  return tags.map((t) => ({
    ...t,
    postCount: posts.filter((p) => p.tags.includes(t.slug) || p.tags.includes(t.id)).length,
  }))
}

export async function getTagById(id: string): Promise<Tag | null> {
  return tagRepository.findById(id)
}

export async function createTag(input: CreateTagInput & { id?: string }): Promise<Tag> {
  return tagRepository.create(input)
}

export async function updateTag(id: string, input: UpdateTagInput): Promise<Tag | null> {
  return tagRepository.update(id, input)
}

export async function deleteTag(id: string): Promise<boolean> {
  return tagRepository.delete(id)
}
