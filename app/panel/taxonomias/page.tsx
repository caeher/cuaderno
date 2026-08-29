import { getAllCategories, getAllTags, getCurrentUser } from "@/lib/application/blog-use-cases"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { TaxonomyManager } from "@/components/admin/taxonomies/taxonomy-manager"

export default async function AdminTaxonomiesPage() {
  const user = await getCurrentUser()
  const [allCategories, allTags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ])

  return (
    <PanelPageLayout title="Categorías y Etiquetas">
      <TaxonomyManager
        initialCategories={allCategories}
        initialTags={allTags}
        organizationId={user.id}
      />
    </PanelPageLayout>
  )
}
