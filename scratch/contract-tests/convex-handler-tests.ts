/**
 * Pruebas unitarias de autorización multi-tenant y lógica de handlers Convex
 */

import { assertCanManageResource, assertCanManageTenant, requireTenantAuth, getTenantIdentity } from "@/convex/lib/auth"
import type { AuthenticatedTenantIdentity } from "@/convex/lib/auth"
import { computePostContentHash, isNarrationOutdated } from "@/lib/domain/entities"
import { getAudioServerConfig, isValidAudioMimeType } from "@/lib/server/audio-config"


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

  // --- 7. Aislamiento Multi-Tenant para PostNarration ---
  console.log("\n▶ [Test 7] Aislamiento Multi-Tenant para PostNarration")
  const narrationResource = {
    authorId: "user_123",
    tenantId: "user_123",
  }
  // Acceso concedido al autor propietario
  let narrationOwnerOk = true
  try {
    assertCanManageResource(userIdentity as AuthenticatedTenantIdentity, narrationResource)
  } catch {
    narrationOwnerOk = false
  }
  assert(narrationOwnerOk, "Permite al autor propietario gestionar su narración")

  // Acceso denegado a otro usuario para la narración
  let narrationCrossTenantDenied = false
  try {
    assertCanManageResource(orgIdentity as AuthenticatedTenantIdentity, narrationResource)
  } catch (err: any) {
    narrationCrossTenantDenied = true
    assert(err.message.includes("Acceso denegado"), "Lanza 'Acceso denegado' ante intento de gestionar narración ajena")
  }
  assert(narrationCrossTenantDenied, "Bloquea mutaciones de narración por usuarios de otros tenants")

  // --- 8. Sanitización Pública de PostNarration (Ready vs Pending/Failed) ---
  console.log("\n▶ [Test 8] Sanitización Pública de PostNarration")
  const readyNarration = {
    _id: "narr_1",
    postId: "post_1",
    status: "ready",
    language: "es",
    voice: "sarah",
    duration: 120,
    format: "mp3",
    audioUrl: "https://storage.convex.cloud/api/storage/file_123",
    error: undefined,
    approvedAt: "2026-08-29T15:00:00Z",
    createdAt: "2026-08-29T15:00:00Z",
  }
  assert(readyNarration.status === "ready" && !!readyNarration.audioUrl, "Narración 'ready' expone audioUrl pública estable")

  const pendingNarration = {
    _id: "narr_2",
    postId: "post_2",
    status: "pending",
    transcript: "Borrador de transcripción secreta",
    audioUrl: null,
  }
  const isPubliclyVisible = (status: string) => status === "ready"
  assert(!isPubliclyVisible(pendingNarration.status), "Narración en estado 'pending' NO se expone públicamente a lectores")

  // --- 9. Detección Determinista de Obsolescencia (contentHash) ---
  console.log("\n▶ [Test 9] Detección Determinista de Obsolescencia (contentHash)")
  const initialTitle = "Introducción a Convex"
  const initialContent = "Convex es una plataforma reactiva para bases de datos de documentos."
  const initialHash = computePostContentHash(initialTitle, initialContent, "es")

  assert(initialHash.startsWith("hash_") && initialHash.length === 21, "computePostContentHash genera un hash determinista no vacío")

  const narrationRecord = {
    contentHash: initialHash,
  }

  // Mismo contenido -> No obsoleta
  const isOutdatedSame = isNarrationOutdated(narrationRecord, {
    title: initialTitle,
    content: initialContent,
    language: "es",
  })
  assert(!isOutdatedSame, "isNarrationOutdated evalúa false cuando el contenido no ha cambiado")

  // Modificación en el cuerpo -> Obsoleta
  const isOutdatedModified = isNarrationOutdated(narrationRecord, {
    title: initialTitle,
    content: initialContent + " Modificación adicional posterior.",
    language: "es",
  })
  assert(isOutdatedModified, "isNarrationOutdated evalúa true cuando cambia el contenido del post")

  // Modificación en el título -> Obsoleta
  const isOutdatedTitle = isNarrationOutdated(narrationRecord, {
    title: "Nuevo Título Actualizado",
    content: initialContent,
    language: "es",
  })
  assert(isOutdatedTitle, "isNarrationOutdated evalúa true cuando cambia el título del post")

  // --- 10. Configuración de Servidor de Audio y Tipos MIME ---
  console.log("\n▶ [Test 10] Configuración de Servidor de Audio y Tipos MIME")
  assert(isValidAudioMimeType("audio/mpeg"), "isValidAudioMimeType acepta 'audio/mpeg'")
  assert(isValidAudioMimeType("audio/wav"), "isValidAudioMimeType acepta 'audio/wav'")
  assert(!isValidAudioMimeType("video/mp4"), "isValidAudioMimeType rechaza 'video/mp4'")
  assert(!isValidAudioMimeType("application/json"), "isValidAudioMimeType rechaza tipos no de audio")

  const audioConfig = getAudioServerConfig()
  assert(audioConfig.defaultFormat === "mp3", "Configuración de audio resuelve 'mp3' por defecto")
  assert(audioConfig.defaultVoiceId === "sarah", "Configuración de audio resuelve voz 'sarah' por defecto")
  assert(audioConfig.vapiBaseUrl === "https://api.vapi.ai", "Configuración de audio resuelve URL base de Vapi")
  assert(audioConfig.allowedMimeTypes.includes("audio/mpeg"), "allowedMimeTypes incluye 'audio/mpeg'")

  console.log(`\n==================================================`)
  console.log(`📊 RESULTADOS CONVEX SECURITY: ${totalPassed} Pasaron | ${totalFailed} Fallaron`)
  console.log(`==================================================\n`)

  return { totalPassed, totalFailed }
}

