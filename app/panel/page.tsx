import { getCurrentUser, getDashboardData } from "@/lib/application/blog-use-cases"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import {
  WelcomeHeader,
  DashboardStatsGrid,
  RecentPostsCard,
  NewPostButton,
  QuickActionsBar,
  RecentCommentsWidget,
} from "@/components/admin/dashboard"

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  const { posts, stats, recentComments, postMap } = await getDashboardData(user.id)

  return (
    <PanelPageLayout title="Panel Principal" action={<NewPostButton />}>
      <WelcomeHeader
        name={user.name}
        totalPosts={posts.length}
        publishedPosts={stats.publishedCount}
      />

      <QuickActionsBar authorUsername={user.username} />

      <DashboardStatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <RecentPostsCard posts={posts.slice(0, 6)} />
        </div>
        <div className="lg:col-span-1">
          <RecentCommentsWidget comments={recentComments} postMap={postMap} />
        </div>
      </div>
    </PanelPageLayout>
  )
}
