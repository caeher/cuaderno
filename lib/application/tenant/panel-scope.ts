import { getCurrentUser } from "@/lib/application/users"
import {
  getCategoriesByOrganization,
  getDashboardData,
  getTagsByOrganization,
} from "@/lib/application/blog-use-cases"
import { getAllCommentsForAdmin } from "@/lib/application/comments"
import type { PanelTenantScope } from "@/lib/application/dashboard/dashboard-use-cases"
import { resolveActiveTenantContext } from "./tenant-auth"

export async function resolvePanelTenantScope(): Promise<PanelTenantScope> {
  const [user, tenant] = await Promise.all([getCurrentUser(), resolveActiveTenantContext()])

  if (!user || !tenant.authorized) {
    throw new Error("No autenticado")
  }

  const authorId = user.clerkUserId ?? user.legacyId ?? user.id

  return {
    tenantId: tenant.tenantId,
    authorId,
    tenantType: tenant.tenantType,
  }
}

export async function getPanelScopedData() {
  const scope = await resolvePanelTenantScope()
  const [dashboard, categories, tags] = await Promise.all([
    getDashboardData(scope),
    getCategoriesByOrganization(scope.tenantId),
    getTagsByOrganization(scope.tenantId),
  ])

  return { scope, dashboard, categories, tags }
}

export async function getPanelCommentsData() {
  const scope = await resolvePanelTenantScope()
  const commentsData = await getAllCommentsForAdmin(scope)
  return { scope, ...commentsData }
}
