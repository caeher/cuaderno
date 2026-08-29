export interface Category {
  id: string
  organizationId?: string
  authorId?: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  postCount?: number
}

export interface Tag {
  id: string
  organizationId?: string
  authorId?: string
  name: string
  slug: string
  color?: string
  postCount?: number
}

export interface CreateCategoryInput {
  organizationId?: string
  authorId?: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  description?: string
  color?: string
  icon?: string
}

export interface CreateTagInput {
  organizationId?: string
  authorId?: string
  name: string
  slug: string
  color?: string
}

export interface UpdateTagInput {
  name?: string
  slug?: string
  color?: string
}
