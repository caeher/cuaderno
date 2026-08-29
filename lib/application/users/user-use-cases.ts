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
  // 1. Intentar resolver usuario por sesión de Clerk si está en contexto web
  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server")
    const session = await auth()
    if (session?.userId) {
      // Buscar usuario en el repositorio por su clerkUserId o ID
      const user = await userRepository.findById(session.userId)
      if (user) return user

      // Si no existe pero tenemos datos de Clerk, sincronizar/crear el usuario
      const clerkUser = await currentUser().catch(() => null)
      if (clerkUser) {
        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || `${session.userId}@clerk.user`
        const displayName = clerkUser.fullName || clerkUser.username || clerkUser.firstName || "Usuario"
        const username =
          clerkUser.username ||
          primaryEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "") ||
          `user_${session.userId.slice(-6)}`

        const newUser = await userRepository.create({
          id: session.userId,
          username,
          name: displayName,
          email: primaryEmail,
          avatarUrl: clerkUser.imageUrl || "/placeholder.svg?height=200&width=200",
          coverUrl: "/placeholder.svg?height=480&width=1600",
          bio: "",
          tagline: "",
          location: undefined,
          socials: {},
          role: "owner",
          joinedAt: new Date().toISOString().split("T")[0],
          postCount: 0,
          followerCount: 0,
          timezone: "UTC",
        })
        return newUser
      }
    }
  } catch {
    // Si auth() no está disponible o no estamos en un ciclo de petición web
  }

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

  try {
    const created = await userRepository.create(defaultUser)
    return created || defaultUser
  } catch {
    return defaultUser
  }
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
