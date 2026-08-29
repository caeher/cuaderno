import { getCurrentUser, getDashboardData, getAllTags, getAllCategories } from "@/lib/application/blog-use-cases"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { NewPostButton } from "@/components/admin/dashboard"
import { PostsDataTable } from "@/components/admin/posts"

export default async function AdminPostsPage() {
  const user = await getCurrentUser()
  const [{ posts }, allTags, allCategories] = await Promise.all([
    getDashboardData(user.id),
    getAllTags(),
    getAllCategories(),
  ])

  return (
    <PanelPageLayout title="Gestión de Posts" action={<NewPostButton />}>
      <PostsDataTable initialPosts={posts} allTags={allTags} allCategories={allCategories} />
    </PanelPageLayout>
  )
}

