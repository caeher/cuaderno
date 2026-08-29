import type { Category } from "./taxonomy"

export type PostStatus = "draft" | "published" | "scheduled"

export type EditorMode = "notion" | "elementor"

export interface Post {
  id: string
  authorId: string
  organizationId?: string
  categoryId?: string | null
  category?: Category | null
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl: string | null
  tags: string[]
  status: PostStatus
  publishedAt: string | null
  updatedAt: string
  readingTimeMinutes: number
  views: number
  likes: number
  comments: number
  featured: boolean
  /** @deprecated Kept for schema backwards compatibility only; templates are managed at tenant level */
  designData?: string | null
  /** @deprecated Kept for schema backwards compatibility only; standard editor is used */
  editorMode?: EditorMode
}

export interface CreatePostInput {
  authorId: string
  organizationId?: string
  categoryId?: string | null
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl?: string | null
  tags: string[]
  status: PostStatus
  readingTimeMinutes?: number
  featured?: boolean
  designData?: string | null
  editorMode?: EditorMode
}

export interface UpdatePostInput {
  organizationId?: string
  categoryId?: string | null
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  coverUrl?: string | null
  tags?: string[]
  status?: PostStatus
  readingTimeMinutes?: number
  featured?: boolean
  views?: number
  likes?: number
  comments?: number
  designData?: string | null
  editorMode?: EditorMode
}
