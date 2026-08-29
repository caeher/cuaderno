import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/application/users"
import { getOrCreateTenantTemplate } from "@/lib/application/tenant/template-use-cases"
import { DesignerStudio } from "@/components/designer/designer-studio"

export default async function GlobalBlogDesignerPage() {
  const [user, clerkAuth] = await Promise.all([
    getCurrentUser().catch(() => null),
    auth().catch(() => null),
  ])

  if (!user) {
    notFound()
  }

  // Determine active tenant (Clerk Organization or personal user blog)
  const orgId = clerkAuth?.orgId
  const orgRole = clerkAuth?.orgRole
  const tenantId = orgId || user.id
  const tenantType = orgId ? ("organization" as const) : ("user" as const)

  // Enforce owner / admin permissions for organization tenants
  if (orgId && orgRole && orgRole !== "org:admin" && orgRole !== "admin" && orgRole !== "owner") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-xl font-semibold">Acceso restringido</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Solo los administradores y propietarios de la organización tienen permisos para modificar el diseño global del blog.
        </p>
      </div>
    )
  }

  const template = await getOrCreateTenantTemplate(tenantId, tenantType)

  return <DesignerStudio template={template} tenantSlug={user.username} />
}
