import { getPanelScopedData } from "@/lib/application/tenant"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { NewPostButton } from "@/components/admin/dashboard"
import { PostsDataTable } from "@/components/admin/posts"

export default async function AdminPostsPage() {
  const { dashboard, categories, tags } = await getPanelScopedData()
  const { posts } = dashboard

  return (
    <PanelPageLayout title="Gestión de Posts" action={<NewPostButton />}>
      <PostsDataTable initialPosts={posts} allTags={tags} allCategories={categories} />
    </PanelPageLayout>
  )
}

