import { PostEditor } from "@/components/admin/post-editor"
import { getCategoriesByOrganization, getTagsByOrganization } from "@/lib/application/blog-use-cases"
import { resolvePanelTenantScope } from "@/lib/application/tenant"

export default async function NewPostPage() {
  const scope = await resolvePanelTenantScope()
  const [tags, categories] = await Promise.all([
    getTagsByOrganization(scope.tenantId),
    getCategoriesByOrganization(scope.tenantId),
  ])

  return <PostEditor mode="create" allTags={tags} allCategories={categories} />
}
