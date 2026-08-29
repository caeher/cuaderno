import type { AuthorWithStats, Post, UpdateUserInput, User } from "@/lib/domain/entities"
import { categoryRepository, postRepository, userRepository } from "@/lib/infrastructure/repositories"

export async function getAllAuthorsWithStats(): Promise<AuthorWithStats[]> {
  const authors = await userRepository.findAll()
  const posts = await postRepository.findPublished()

  return authors.map((author) => {
    const authorPosts = posts.filter((p) => p.authorId === author.id)
    return {
      ...author,
      totalViews: authorPosts.reduce((sum, p) => sum + p.views, 0),
      totalLikes: authorPosts.reduce((sum, p) => sum + p.likes, 0),
    }
  })
}

/** Returns the active user. If multiple exist, defaults to the first user or creates a fallback default user */
export async function getCurrentUser(): Promise<User> {
  const users = await userRepository.findAll()
  if (users.length > 0) {
    return users[0]
  }

  const defaultUser: User = {
    id: "u_default",
    username: "admin",
    name: "Administrador",
    email: "admin@ejemplo.com",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    coverUrl: "/placeholder.svg?height=480&width=1600",
    bio: "Autor y creador de contenidos.",
    tagline: "Notas, diseño e ideas",
    location: "Madrid, España",
    socials: {},
    role: "owner",
    joinedAt: new Date().toISOString().split("T")[0],
    postCount: 0,
    followerCount: 0,
    timezone: "UTC",
  }
  return userRepository.create(defaultUser)
}

export async function getAuthorProfile(username: string): Promise<{
  author: AuthorWithStats
  posts: Post[]
} | null> {
  const author = await userRepository.findByUsername(username)
  if (!author) return null

  const [posts, categories] = await Promise.all([
    postRepository.findByAuthorId(author.id, "published"),
    categoryRepository.findAll(),
  ])
  const catMap = new Map(categories.map((c) => [c.id, c]))

  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)

  const enrichedPosts = posts.map((p) => ({
    ...p,
    category: p.categoryId ? catMap.get(p.categoryId) ?? null : null,
  }))

  return {
    author: { ...author, totalViews, totalLikes },
    posts: enrichedPosts.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
  }
}

export async function updateUserProfile(id: string, input: UpdateUserInput): Promise<User | null> {
  return userRepository.update(id, input)
}
