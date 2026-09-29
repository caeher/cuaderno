import type { Category } from "./taxonomy"
import type { PostNarration } from "./narration"
import type { PublicAuthor } from "./user"

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
  narration?: PostNarration | null
  /** @deprecated Kept for schema backwards compatibility only; templates are managed at tenant level */
  designData?: string | null
  /** @deprecated Kept for schema backwards compatibility only; standard editor is used */
  editorMode?: EditorMode
}

/**
 * Datos de una publicación visible públicamente. No contiene IDs de propietario
 * organizacional ni campos exclusivos del editor.
 */
export type PublishedPost = Omit<
  Post,
  "status" | "organizationId" | "designData" | "editorMode" | "authorId"
> & {
  status: "published"
  author: PublicAuthor
  /** Identidad visual del blog que publica, distinta del autor real si corresponde. */
  tenant?: PublicAuthor | null
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
