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
  const tenantId = orgId || user.id
  const tenantType = orgId ? ("organization" as const) : ("user" as const)

  const template = await getOrCreateTenantTemplate(tenantId, tenantType)

  return <DesignerStudio template={template} tenantSlug={user.username} />
}
