import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/application/blog-use-cases"
import { PanelPageLayout } from "@/components/admin/layout/panel-page-layout"
import { SettingsForm } from "@/components/admin/settings"
import { PanelUserSyncError } from "@/components/admin/panel-user-sync-error"

export default async function AdminSettingsPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  let user
  try {
    user = await getCurrentUser()
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined
    return <PanelUserSyncError message={message} />
  }

  if (!user) {
    return <PanelUserSyncError />
  }

  return (
    <PanelPageLayout title="Configuración" className="mx-auto w-full max-w-4xl">
      <SettingsForm user={user} />
    </PanelPageLayout>
  )
}
