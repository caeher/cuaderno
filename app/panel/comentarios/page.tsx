import { getPanelCommentsData } from "@/lib/application/tenant"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { AdminCommentsList } from "@/components/admin/comments"

export default async function AdminCommentsPage() {
  const { comments, postMap, posts } = await getPanelCommentsData()

  return (
    <PanelPageLayout title="Moderación de Comentarios">
      <AdminCommentsList comments={comments} postMap={postMap} posts={posts} />
    </PanelPageLayout>
  )
}
