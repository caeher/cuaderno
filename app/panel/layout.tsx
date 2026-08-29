import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { PanelUserSyncError } from "@/components/admin/panel-user-sync-error"
import { getCurrentUser } from "@/lib/application/blog-use-cases"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
    return (
      <PanelUserSyncError message="Tu sesión está activa, pero no pudimos resolver tu perfil. Intenta recargar la página." />
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar currentUser={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
