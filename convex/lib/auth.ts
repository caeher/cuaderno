import type { UserIdentity } from "convex/server";

export interface AuthContext {
  auth: {
    getUserIdentity: () => Promise<UserIdentity | null>;
  };
}

export interface TenantIdentity {
  /** Indica si la petición cuenta con un token JWT válido de Clerk */
  isAuthenticated: boolean;
  /** ID del usuario de Clerk (sub: user_...) */
  userId: string | null;
  /** Identificador único tokenIdentifier (issuer + sub) */
  tokenIdentifier: string | null;
  /** Nombre del usuario obtenido de las claims */
  name: string | null;
  /** Email del usuario */
  email: string | null;
  /** Username del usuario */
  username: string | null;
  /** Avatar / foto de perfil */
  avatarUrl: string | null;
  /** ID de la organización activa de Clerk (org_...) si aplica */
  orgId: string | null;
  /** Rol del usuario dentro de la organización activa (org:admin, org:member, etc.) */
  orgRole: string | null;
  /** Slug de la organización activa */
  orgSlug: string | null;
  /** Permisos de la organización */
  orgPermissions: string[];
  /** ID canónico del Tenant: orgId si está en contexto de organización, userId si es blog personal, o null */
  tenantId: string | null;
  /** Tipo de tenant resuelto */
  tenantType: "organization" | "user" | "anonymous";
}

export type AuthenticatedTenantIdentity = TenantIdentity & {
  isAuthenticated: true;
  userId: string;
  tenantId: string;
  tenantType: "organization" | "user";
};

/**
 * Resuelve la identidad canónica del llamador a partir del token JWT de Clerk.
 * Maneja de forma transparente usuarios anónimos, blogs personales y organizaciones.
 */
export async function getTenantIdentity(ctx: AuthContext): Promise<TenantIdentity> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return {
      isAuthenticated: false,
      userId: null,
      tokenIdentifier: null,
      name: null,
      email: null,
      username: null,
      avatarUrl: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      orgPermissions: [],
      tenantId: null,
      tenantType: "anonymous",
    };
  }

  // Extraer claims de organización inyectadas por el JWT template de Clerk
  const claims = identity as Record<string, unknown>;
  const orgId = (claims.org_id as string) || (claims.orgId as string) || null;
  const orgRole = (claims.org_role as string) || (claims.orgRole as string) || null;
  const orgSlug = (claims.org_slug as string) || (claims.orgSlug as string) || null;
  const orgPermissions = Array.isArray(claims.org_permissions)
    ? (claims.org_permissions as string[])
    : [];

  const userId = identity.subject;
  const name = identity.name || identity.nickname || null;
  const email = identity.email || null;
  const username =
    identity.preferredUsername ||
    identity.nickname ||
    (claims.username as string) ||
    null;
  const avatarUrl = identity.pictureUrl || null;

  // Si hay una organización activa en la sesión de Clerk, el tenantId es orgId.
  // De lo contrario, el tenantId es el userId del usuario (blog personal).
  const isOrg = Boolean(orgId);
  const tenantId = isOrg ? orgId : userId;
  const tenantType: "organization" | "user" = isOrg ? "organization" : "user";

  return {
    isAuthenticated: true,
    userId,
    tokenIdentifier: identity.tokenIdentifier,
    name,
    email,
    username,
    avatarUrl,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    tenantId,
    tenantType,
  };
}

/**
 * Exige que la petición provenga de un usuario autenticado.
 * Si se especifica expectedTenantId, valida además que el tenant activo coincida con dicho ID.
 */
export async function requireTenantAuth(
  ctx: AuthContext,
  expectedTenantId?: string
): Promise<AuthenticatedTenantIdentity> {
  const identity = await getTenantIdentity(ctx);

  if (!identity.isAuthenticated || !identity.userId || !identity.tenantId) {
    throw new Error("No autenticado: Se requiere una sesión activa con Clerk.");
  }

  if (expectedTenantId && identity.tenantId !== expectedTenantId) {
    throw new Error(
      `Acceso denegado: No tienes autorización para gestionar recursos del tenant "${expectedTenantId}".`
    );
  }

  return identity as AuthenticatedTenantIdentity;
}

/**
 * Valida que la identidad autenticada tenga autorización para administrar un tenant determinado.
 */
export function assertCanManageTenant(
  identity: AuthenticatedTenantIdentity,
  targetTenantId: string
): void {
  if (identity.tenantId !== targetTenantId && identity.userId !== targetTenantId) {
    throw new Error(
      `Acceso denegado: No tienes autorización para gestionar el tenant "${targetTenantId}".`
    );
  }
}

/**
 * Valida que la identidad autenticada tenga autorización para modificar o eliminar un recurso
 * según su autor, organización o tenant asociado.
 */
export function assertCanManageResource(
  identity: AuthenticatedTenantIdentity,
  resource: { authorId?: string; tenantId?: string; organizationId?: string }
): void {
  // 1. Coincidencia directa de tenant activo
  if (resource.tenantId && resource.tenantId === identity.tenantId) {
    return;
  }
  // 2. Coincidencia de organización activa
  if (resource.organizationId && identity.orgId && resource.organizationId === identity.orgId) {
    return;
  }
  // 3. Blog personal: el panel envía tenantId (userId) como organizationId
  if (resource.organizationId && resource.organizationId === identity.tenantId) {
    return;
  }
  // 4. Coincidencia de autor directo (blog personal)
  if (resource.authorId && (resource.authorId === identity.userId || resource.authorId === identity.tenantId)) {
    return;
  }

  throw new Error(
    "Acceso denegado: No posees permisos para modificar o eliminar este recurso."
  );
}

