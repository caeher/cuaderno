import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getCurrentUser } from "@/lib/application/blog-use-cases"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <SidebarProvider>
      <AdminSidebar currentUser={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
