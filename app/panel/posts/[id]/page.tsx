import { notFound } from "next/navigation"
import { PostEditor } from "@/components/admin/post-editor"
import { getCategoriesByOrganization, getTagsByOrganization, getCurrentUser } from "@/lib/application/blog-use-cases"
import { getPostForEditing } from "@/lib/application/posts"
import { resolvePanelTenantScope } from "@/lib/application/tenant"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [scope, currentUser] = await Promise.all([
    resolvePanelTenantScope(),
    getCurrentUser(),
  ])
  const [post, tags, categories] = await Promise.all([
    getPostForEditing(id),
    getTagsByOrganization(scope.tenantId),
    getCategoriesByOrganization(scope.tenantId),
  ])

  if (!post) notFound()

  return (
    <PostEditor
      mode="edit"
      initialPost={post}
      allTags={tags}
      allCategories={categories}
      userRole={currentUser?.role || "owner"}
    />
  )
}

