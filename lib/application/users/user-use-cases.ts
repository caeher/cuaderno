import type { AuthorWithStats, Post, UpdateUserInput, User } from "@/lib/domain/entities"
import { categoryRepository, postRepository, userRepository } from "@/lib/infrastructure/repositories"

export async function getAllAuthorsWithStats(): Promise<AuthorWithStats[]> {
  const authors = await userRepository.findAll()
  const posts = await postRepository.findPublished()

  return authors.map((author) => {
    const authorKey = author.clerkUserId ?? author.legacyId ?? author.id
    const authorPosts = posts.filter(
      (p) =>
        p.authorId === authorKey ||
        p.authorId === author.id ||
        p.authorId === author.legacyId
    )
    return {
      ...author,
      totalViews: authorPosts.reduce((sum, p) => sum + p.views, 0),
      totalLikes: authorPosts.reduce((sum, p) => sum + p.likes, 0),
    }
  })
}

/**
 * Returns the authenticated user from Clerk session, synced with Convex.
 * Returns null if there is no active Clerk session or sync fails.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server")
    const session = await auth()
    if (!session?.userId) {
      return null
    }

    const existing = await userRepository.findByClerkUserId(session.userId)
    if (existing) {
      return existing
    }

    const clerkUser = await currentUser().catch(() => null)
    if (!clerkUser) {
      return null
    }

    const primaryEmail =
      clerkUser.emailAddresses[0]?.emailAddress || `${session.userId}@clerk.user`
    const displayName =
      clerkUser.fullName || clerkUser.username || clerkUser.firstName || "Usuario"
    const username =
      clerkUser.username ||
      primaryEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "") ||
      `user_${session.userId.slice(-6)}`

    return await userRepository.syncFromClerk({
      clerkUserId: session.userId,
      name: displayName,
      email: primaryEmail,
      username,
      avatarUrl: clerkUser.imageUrl || "/placeholder.svg?height=200&width=200",
    })
  } catch {
    return null
  }
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("No autenticado")
  }
  return user
}

export async function getAuthorProfile(username: string): Promise<{
  author: AuthorWithStats
  posts: Post[]
} | null> {
  const author = await userRepository.findByUsername(username)
  if (!author) return null

  const authorKey = author.clerkUserId ?? author.legacyId ?? author.id
  const [posts, categories] = await Promise.all([
    postRepository.findByAuthorId(authorKey, "published"),
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
