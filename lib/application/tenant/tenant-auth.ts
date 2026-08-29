/**
 * Application Layer — Tenant Resolution & Authorization Guard
 *
 * Resolves the active tenant context using Clerk auth (Organizations vs Personal User)
 * and enforces strict isolation barriers so tenants cannot read or mutate each other's templates.
 */

import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/application/users"

export interface AuthenticatedTenantContext {
  authorized: boolean
  tenantId: string
  tenantType: "organization" | "user"
  userId: string
  userName: string
}

/**
 * Resolves the active tenant for the currently authenticated session.
 */
export async function resolveActiveTenantContext(): Promise<AuthenticatedTenantContext> {
  const [currentUser, clerkAuth] = await Promise.all([
    getCurrentUser().catch(() => null),
    auth().catch(() => null),
  ])

  const userId = clerkAuth?.userId || currentUser?.id || "u_anonymous"
  const userName = currentUser?.name || currentUser?.username || "Usuario"
  const orgId = clerkAuth?.orgId

  if (orgId) {
    return {
      authorized: true,
      tenantId: orgId,
      tenantType: "organization",
      userId,
      userName,
    }
  }

  // Fallback to personal user blog
  const tenantId = currentUser?.id || userId
  return {
    authorized: true,
    tenantId,
    tenantType: "user",
    userId,
    userName,
  }
}

/**
 * Validates that the active session has authority to read/modify the requested tenantId.
 * If requestedTenantId is provided and does not match the active session, authorization is denied.
 */
export async function resolveAndAuthorizeTenant(
  requestedTenantId?: string
): Promise<AuthenticatedTenantContext> {
  const context = await resolveActiveTenantContext()

  if (requestedTenantId && requestedTenantId !== context.tenantId) {
    // Check if the requestedTenantId corresponds to the user's username or direct user ID
    const currentUser = await getCurrentUser().catch(() => null)
    const isOwnerMatch = currentUser && (currentUser.id === requestedTenantId || currentUser.username === requestedTenantId)

    if (!isOwnerMatch) {
      throw new Error(`Acceso denegado: No tienes autorización para gestionar el template del tenant "${requestedTenantId}".`)
    }
  }

  return context
}
