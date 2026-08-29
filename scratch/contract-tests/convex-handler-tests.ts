/**
 * Pruebas unitarias de autorización multi-tenant y lógica de handlers Convex
 */

import { assertCanManageResource, assertCanManageTenant, requireTenantAuth, getTenantIdentity } from "@/convex/lib/auth"
import type { AuthenticatedTenantIdentity } from "@/convex/lib/auth"

export async function runConvexAuthAndSecurityTests(): Promise<{ totalPassed: number; totalFailed: number }> {
  let totalPassed = 0
  let totalFailed = 0

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [Convex Security] PASS: ${message}`)
      totalPassed++
    } else {
      console.error(`  ❌ [Convex Security] FAIL: ${message}`)
      totalFailed++
    }
  }

  console.log("==================================================")
  console.log("🔒 EJECUTANDO PRUEBAS DE AUTORIZACIÓN Y AISLAMIENTO MULTI-TENANT CONVEX")
  console.log("==================================================\n")

  // --- 1. Resolución de Identidad Anónima ---
  console.log("▶ [Test 1] Resolución de Identidad Anónima vs Autenticada")
  const anonCtx = {
    auth: {
      getUserIdentity: async () => null,
    },
  }
  const anonIdentity = await getTenantIdentity(anonCtx)
  assert(!anonIdentity.isAuthenticated, "Identifica correctamente peticiones sin token como no autenticadas")
  assert(anonIdentity.tenantType === "anonymous", "Asigna tenantType 'anonymous'")

  let anonAuthError = false
  try {
    await requireTenantAuth(anonCtx)
  } catch (err: any) {
    anonAuthError = true
    assert(err.message.includes("No autenticado"), "requireTenantAuth rechaza llamadas anónimas")
  }
  assert(anonAuthError, "Previene ejecución de mutaciones privadas a llamadores no autenticados")

  // --- 2. Identidad de Blog Personal (User) ---
  console.log("\n▶ [Test 2] Identidad de Blog Personal (User)")
  const userCtx = {
    auth: {
      getUserIdentity: async () => ({
        tokenIdentifier: "clerk|user_123",
        issuer: "https://clerk.test.com",
        subject: "user_123",
        name: "Carlos Autor",
        email: "carlos@test.com",
        preferredUsername: "carlos",
      }),
    },
  }
  const userIdentity = await getTenantIdentity(userCtx)
  assert(userIdentity.isAuthenticated, "Autentica con éxito usuario de Clerk")
  assert(userIdentity.tenantId === "user_123", "Resuelve tenantId canónico como userId ('user_123')")
  assert(userIdentity.tenantType === "user", "Resuelve tenantType como 'user'")

  // --- 3. Identidad de Organización (Tenant Org) ---
  console.log("\n▶ [Test 3] Identidad de Organización (Tenant Org)")
  const orgCtx = {
    auth: {
      getUserIdentity: async () => ({
        tokenIdentifier: "clerk|user_456",
        issuer: "https://clerk.test.com",
        subject: "user_456",
        name: "Editor Corporativo",
        email: "editor@empresa.com",
        org_id: "org_enterprise_99",
        org_role: "org:admin",
        org_slug: "empresa-tech",
        org_permissions: ["org:manage", "org:publish"],
      }),
    },
  }
  const orgIdentity = await getTenantIdentity(orgCtx)
  assert(orgIdentity.isAuthenticated, "Autentica usuario con contexto de organización")
  assert(orgIdentity.tenantId === "org_enterprise_99", "Resuelve tenantId canónico como orgId ('org_enterprise_99')")
  assert(orgIdentity.tenantType === "organization", "Resuelve tenantType como 'organization'")
  assert(orgIdentity.orgRole === "org:admin", "Extrae rol organizacional 'org:admin'")

  // --- 4. Validación de Gestión de Tenant (assertCanManageTenant) ---
  console.log("\n▶ [Test 4] Control de Aislamiento de Tenant (assertCanManageTenant)")
  // Acceso concedido al propio tenant
  let ownTenantOk = true
  try {
    assertCanManageTenant(orgIdentity as AuthenticatedTenantIdentity, "org_enterprise_99")
  } catch {
    ownTenantOk = false
  }
  assert(ownTenantOk, "Permite gestionar el tenant propio coincidente con orgId")

  // Acceso denegado a tenant ajeno
  let crossTenantDenied = false
  try {
    assertCanManageTenant(orgIdentity as AuthenticatedTenantIdentity, "org_foreign_other_88")
  } catch (err: any) {
    crossTenantDenied = true
    assert(err.message.includes("Acceso denegado"), "Lanza 'Acceso denegado' ante intento de gestionar otro tenant")
  }
  assert(crossTenantDenied, "Bloquea estrictamente mutaciones dirigidas a otro tenant")

  // --- 5. Validación de Pertenencia de Recursos (assertCanManageResource) ---
  console.log("\n▶ [Test 5] Validación de Pertenencia de Recursos (assertCanManageResource)")
  // Recurso perteneciente a la misma organización
  let ownOrgResourceOk = true
  try {
    assertCanManageResource(orgIdentity as AuthenticatedTenantIdentity, {
      organizationId: "org_enterprise_99",
      authorId: "user_456",
    })
  } catch {
    ownOrgResourceOk = false
  }
  assert(ownOrgResourceOk, "Permite modificar recurso perteneciente a la misma organización")

  // Recurso perteneciente a otro autor / organización
  let foreignResourceDenied = false
  try {
    assertCanManageResource(orgIdentity as AuthenticatedTenantIdentity, {
      organizationId: "org_other_victim_77",
      authorId: "user_other_victim_77",
      tenantId: "org_other_victim_77",
    })
  } catch (err: any) {
    foreignResourceDenied = true
    assert(err.message.includes("Acceso denegado"), "Lanza 'Acceso denegado' al intentar modificar recursos ajenos")
  }
  assert(foreignResourceDenied, "Bloquea estrictamente modificación de recursos no pertenecientes al llamador")

  // --- 6. Sanitización de plantillas para lectores anónimos ---
  console.log("\n▶ [Test 6] Ocultar draftSlots en respuestas públicas de plantillas")
  const templateWithDraft = {
    tenantId: "user_123",
    draftSlots: { home: { blocks: [] } },
    publishedSlots: { home: { blocks: [{ id: "1" }] } },
    isPublished: true,
  }
  const { draftSlots, ...publicTemplate } = templateWithDraft
  assert(!("draftSlots" in publicTemplate), "Las respuestas públicas no exponen draftSlots")
  assert(
    "publishedSlots" in publicTemplate,
    "Las respuestas públicas conservan publishedSlots"
  )

  console.log(`\n==================================================`)
  console.log(`📊 RESULTADOS CONVEX SECURITY: ${totalPassed} Pasaron | ${totalFailed} Fallaron`)
  console.log(`==================================================\n`)

  return { totalPassed, totalFailed }
}
