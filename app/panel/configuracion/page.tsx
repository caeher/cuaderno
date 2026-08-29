import { getCurrentUser } from "@/lib/application/blog-use-cases"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { SettingsForm } from "@/components/admin/settings"

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()

  return (
    <PanelPageLayout title="Configuración" className="mx-auto w-full max-w-4xl">
      <SettingsForm user={user} />
    </PanelPageLayout>
  )
}
