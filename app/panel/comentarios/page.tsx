import { getCurrentUser, getAllCommentsForAdmin } from "@/lib/application/blog-use-cases"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { AdminCommentsList } from "@/components/admin/comments"

export default async function AdminCommentsPage() {
  const user = await getCurrentUser()
  const { comments, postMap, posts } = await getAllCommentsForAdmin(user.id)

  return (
    <PanelPageLayout title="Moderación de Comentarios">
      <AdminCommentsList comments={comments} postMap={postMap} posts={posts} />
    </PanelPageLayout>
  )
}
