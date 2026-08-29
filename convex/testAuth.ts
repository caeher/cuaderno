import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getTenantIdentity, requireTenantAuth } from "./lib/auth";

/**
 * Consulta de diagnóstico para inspeccionar la identidad resuelta desde el token JWT de Clerk.
 * Permite verificar si la petición es anónima, de blog personal (usuario) o de una organización activa.
 */
export const getAuthStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getTenantIdentity(ctx);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      identity,
    };
  },
});

/**
 * Endpoint público accesible por cualquier cliente (anónimo o autenticado).
 */
export const getPublicData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getTenantIdentity(ctx);
    return {
      message: "Este endpoint es público y accesible sin autenticación.",
      callerType: identity.tenantType,
      isAuthenticated: identity.isAuthenticated,
    };
  },
});

/**
 * Endpoint protegido que requiere sesión activa de Clerk (rechaza usuarios anónimos).
 */
export const getProtectedUserData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireTenantAuth(ctx);
    return {
      message: "Acceso concedido a datos de usuario autenticado.",
      userId: identity.userId,
      email: identity.email,
      name: identity.name,
      tenantId: identity.tenantId,
      tenantType: identity.tenantType,
    };
  },
});

/**
 * Endpoint que exige que el llamador esté operando bajo el contexto de una organización activa.
 */
export const getOrgScopedData = query({
  args: {
    expectedOrgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.expectedOrgId);

    if (identity.tenantType !== "organization" || !identity.orgId) {
      throw new Error(
        "Acceso denegado: Se requiere una organización activa en la sesión de Clerk para consultar este recurso."
      );
    }

    return {
      message: "Acceso concedido a recursos de la organización.",
      orgId: identity.orgId,
      orgRole: identity.orgRole,
      orgSlug: identity.orgSlug,
      orgPermissions: identity.orgPermissions,
      userId: identity.userId,
    };
  },
});

/**
 * Mutación de prueba para validar operaciones de escritura con control de acceso por tenant.
 */
export const testWriteOperation = mutation({
  args: {
    resourceName: v.string(),
    targetTenantId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireTenantAuth(ctx, args.targetTenantId);

    return {
      success: true,
      resourceName: args.resourceName,
      executedBy: identity.userId,
      tenantId: identity.tenantId,
      tenantType: identity.tenantType,
      message: `Operación ejecutada exitosamente para el tenant ${identity.tenantId}`,
    };
  },
});
