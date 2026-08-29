import type { PostStatus } from "@/lib/domain/entities"
import { commentRepository, postRepository, userRepository } from "@/lib/infrastructure/repositories"

export interface PanelTenantScope {
  tenantId: string
  authorId: string
  tenantType: "organization" | "user"
}

async function getPostsForPanelScope(scope: PanelTenantScope, status?: PostStatus) {
  if (scope.tenantType === "organization") {
    return postRepository.findByOrganization(scope.tenantId, status)
  }

  return postRepository.findByAuthorId(scope.authorId, status)
}

export async function getDashboardData(scope: PanelTenantScope) {
  const [user, posts] = await Promise.all([
    userRepository.findById(scope.authorId),
    getPostsForPanelScope(scope),
  ])

  if (!user) throw new Error("Usuario no encontrado")

  const published = posts.filter((p) => p.status === "published")
  const drafts = posts.filter((p) => p.status === "draft")
  const scheduled = posts.filter((p) => p.status === "scheduled")

  const totalViews = published.reduce((sum, p) => sum + p.views, 0)
  const totalLikes = published.reduce((sum, p) => sum + p.likes, 0)
  const totalComments = published.reduce((sum, p) => sum + p.comments, 0)
  const totalReadingTime = published.reduce((sum, p) => sum + p.readingTimeMinutes, 0)
  const avgReadingTime = published.length > 0 ? Math.round(totalReadingTime / published.length) : 0
  const engagementRate = totalViews > 0 ? Number((((totalLikes + totalComments) / totalViews) * 100).toFixed(1)) : 0

  const commentLists = await Promise.all(posts.map((p) => commentRepository.findByPostId(p.id)))
  const allComments = commentLists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const postMap = new Map(posts.map((p) => [p.id, p]))

  return {
    user,
    posts: posts.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")),
    recentComments: allComments.slice(0, 5),
    totalCommentsCount: allComments.length,
    postMap,
    stats: {
      totalViews,
      totalLikes,
      totalComments,
      publishedCount: published.length,
      draftCount: drafts.length,
      scheduledCount: scheduled.length,
      totalPostsCount: posts.length,
      avgReadingTime,
      engagementRate,
    },
  }
}
