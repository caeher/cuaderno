import { getPanelScopedData } from "@/lib/application/tenant"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { TaxonomyManager } from "@/components/admin/taxonomies/taxonomy-manager"

export default async function AdminTaxonomiesPage() {
  const { scope, categories, tags } = await getPanelScopedData()

  return (
    <PanelPageLayout title="Categorías y Etiquetas">
      <TaxonomyManager
        initialCategories={categories}
        initialTags={tags}
        organizationId={scope.tenantId}
      />
    </PanelPageLayout>
  )
}
