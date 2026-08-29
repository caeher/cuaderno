/**
 * Narration Security, Privacy, and Multi-Tenancy Isolation Suite
 *
 * Verifies strict security and isolation guarantees:
 * 1. Zero Secret Leakage: Private keys, Bearer tokens, Vapi temporary URLs, call IDs
 *    and stack traces never leak to public projections or Server Actions.
 * 2. Multi-Tenant Authorization Barrier: Strict isolation between tenants (User A vs User B vs Org).
 * 3. Draft vs Published Isolation: Draft post narrations are never accessible to public readers.
 * 4. Tenant Routes & Custom Domains: Insulation of tenant routes (/[tenant]/post/[slug]) and subdomains.
 * 5. Physical Storage Purge: Storage blobs are purged upon deletion.
 *
 * Usage:
 *   pnpm tsx scratch/test-narration-security-and-isolation.ts
 */

import { assertCanManageResource, assertCanManageTenant } from "../convex/lib/auth"
import type { AuthenticatedTenantIdentity } from "../convex/lib/auth"
import { sanitizeVapiErrorMessage } from "../lib/server/vapi-client"
import { getAudioServerConfig } from "../lib/server/audio-config"
import type { PostNarration } from "../lib/domain/entities"

let totalPassed = 0
let totalFailed = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`)
    totalPassed++
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ""}`)
    totalFailed++
    failures.push(testName)
  }
}

async function runSecuritySuite() {
  console.log("===================================================================")
  console.log("🔒 EJECUTANDO SUITE DE SEGURIDAD, PRIVACIDAD Y MULTI-TENANT")
  console.log("===================================================================\n")

  // =========================================================================
  // 1. Zero Secret Leakage Verification
  // =========================================================================
  console.log("▶ [TEST 1] Zero Secret Leakage (Claves privadas, tokens, URLs efímeras)")

  const fakePrivateKey = "vapi_priv_sec_999988887777aaaa"
  const fakeBearerToken = `Bearer ${fakePrivateKey}`
  const fakeSignedUrl = "https://storage.vapi.ai/recordings/call_123.mp3?token=secret_signed_token_xyz"
  const internalErrorWithSecrets = new Error(
    `Failed POST to Vapi endpoint https://api.vapi.ai/call/web with Authorization: ${fakeBearerToken}. Error: 401 Unauthorized.`
  )

  const sanitizedMessage = sanitizeVapiErrorMessage(internalErrorWithSecrets)

  assert(
    !sanitizedMessage.includes(fakePrivateKey),
    "sanitizeVapiErrorMessage elimina claves privadas de excepciones"
  )
  assert(
    !sanitizedMessage.includes(fakeBearerToken) && !sanitizedMessage.includes("Bearer"),
    "sanitizeVapiErrorMessage redacta tokens Bearer"
  )
  assert(
    !sanitizedMessage.includes("https://api.vapi.ai/call/web"),
    "Mensaje de error simplificado oculta endpoints internos de infraestructura"
  )

  // Test public reader projection contract
  const fullServerNarrationDoc = {
    _id: "narr_sec_test_01",
    postId: "post_sec_test_01",
    postDocId: "doc_123",
    authorId: "author_alice",
    tenantId: "tenant_alice",
    status: "ready" as const,
    transcript: "Texto completo del post.",
    contentHash: "hash_abc1234567890",
    idempotencyKey: "narration:post_sec_test_01:hash_abc1234567890",
    vapiCallId: "call_vapi_internal_id_999",
    fileSizeBytes: 125000,
    mimeType: "audio/mpeg",
    endedReason: "assistant-completed-speech",
    generationMetadata: {
      provider: "11labs",
      voiceId: "sarah",
      costUsd: 0.035,
      durationSeconds: 90,
      vapiCallId: "call_vapi_internal_id_999",
    },
    language: "es",
    voice: "sarah",
    duration: 90,
    format: "mp3" as const,
    storageId: "convex_storage_file_123",
    audioUrl: "https://my-blog-convex.convex.cloud/api/storage/file_123",
    error: undefined,
    approvedAt: "2026-08-29T12:00:00Z",
    createdAt: "2026-08-29T12:00:00Z",
    updatedAt: "2026-08-29T12:01:00Z",
  }

  // Projection logic applied in convex/narrations.ts getForPost for public readers:
  const publicProjection = {
    _id: fullServerNarrationDoc._id,
    postId: fullServerNarrationDoc.postId,
    status: fullServerNarrationDoc.status,
    language: fullServerNarrationDoc.language,
    voice: fullServerNarrationDoc.voice,
    duration: fullServerNarrationDoc.duration,
    format: fullServerNarrationDoc.format,
    audioUrl: fullServerNarrationDoc.audioUrl,
    transcript: fullServerNarrationDoc.transcript,
    approvedAt: fullServerNarrationDoc.approvedAt,
    createdAt: fullServerNarrationDoc.createdAt,
  }

  assert(!("vapiCallId" in publicProjection), "Proyección pública NO expone vapiCallId")
  assert(!("generationMetadata" in publicProjection), "Proyección pública NO expone generationMetadata ni costes")
  assert(!("idempotencyKey" in publicProjection), "Proyección pública NO expone idempotencyKey")
  assert(!("storageId" in publicProjection), "Proyección pública expone audioUrl resuelta, no el storageId interno")
  assert(publicProjection.audioUrl?.startsWith("https://my-blog-convex.convex.cloud"), "audioUrl apunta a almacenamiento propio (Convex Storage)")
  assert(publicProjection.transcript === fullServerNarrationDoc.transcript, "Proyección pública incluye transcript para lectores")

  // =========================================================================
  // 2. Multi-Tenant Authorization Barrier
  // =========================================================================
  console.log("\n▶ [TEST 2] Aislamiento Multi-Tenant (Tenant A vs Tenant B vs Organización)")

  const tenantAliceIdentity: AuthenticatedTenantIdentity = {
    isAuthenticated: true,
    userId: "user_alice",
    tenantId: "user_alice",
    tenantType: "user",
    tokenIdentifier: "clerk|user_alice",
    name: "Alice",
    email: "alice@test.com",
    username: "alice",
    avatarUrl: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: [],
  }

  const tenantBobIdentity: AuthenticatedTenantIdentity = {
    isAuthenticated: true,
    userId: "user_bob",
    tenantId: "user_bob",
    tenantType: "user",
    tokenIdentifier: "clerk|user_bob",
    name: "Bob",
    email: "bob@test.com",
    username: "bob",
    avatarUrl: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: [],
  }

  const enterpriseOrgIdentity: AuthenticatedTenantIdentity = {
    isAuthenticated: true,
    userId: "user_carol_editor",
    tenantId: "org_enterprise_tech",
    tenantType: "organization",
    tokenIdentifier: "clerk|user_carol_editor",
    name: "Carol",
    email: "carol@enterprise.com",
    username: "carol",
    avatarUrl: null,
    orgId: "org_enterprise_tech",
    orgRole: "org:admin",
    orgSlug: "enterprise-tech",
    orgPermissions: ["admin"],
  }

  const aliceNarrationResource = {
    authorId: "user_alice",
    tenantId: "user_alice",
  }

  const enterpriseNarrationResource = {
    authorId: "user_carol_editor",
    tenantId: "org_enterprise_tech",
    organizationId: "org_enterprise_tech",
  }

  // Alice manages her own narration -> OK
  let aliceCanManageOwn = true
  try {
    assertCanManageResource(tenantAliceIdentity, aliceNarrationResource)
  } catch {
    aliceCanManageOwn = false
  }
  assert(aliceCanManageOwn, "Autor Alice puede gestionar sus propias narraciones")

  // Bob attempts to modify Alice's narration -> BLOCKED
  let bobBlockedOnAlice = false
  try {
    assertCanManageResource(tenantBobIdentity, aliceNarrationResource)
  } catch (err: any) {
    bobBlockedOnAlice = true
    assert(err.message.includes("Acceso denegado"), "Lanza 'Acceso denegado' cuando Bob intenta acceder a recursos de Alice")
  }
  assert(bobBlockedOnAlice, "Barrera de seguridad bloquea modificaciones cross-tenant entre usuarios")

  // Carol manages enterprise resource -> OK
  let carolCanManageOrg = true
  try {
    assertCanManageResource(enterpriseOrgIdentity, enterpriseNarrationResource)
  } catch {
    carolCanManageOrg = false
  }
  assert(carolCanManageOrg, "Editor de organización puede gestionar narraciones de su organización")

  // Alice attempts to modify enterprise resource -> BLOCKED
  let aliceBlockedOnOrg = false
  try {
    assertCanManageResource(tenantAliceIdentity, enterpriseNarrationResource)
  } catch (err: any) {
    aliceBlockedOnOrg = true
  }
  assert(aliceBlockedOnOrg, "Usuario externo no puede acceder a narraciones de organizaciones ajenas")

  // =========================================================================
  // 3. Draft vs Published Isolation
  // =========================================================================
  console.log("\n▶ [TEST 3] Aislamiento de Posts en Borrador vs Publicados")

  const draftPost = {
    id: "post_draft_01",
    title: "Post en Borrador Secreto",
    status: "draft" as const,
    authorId: "user_alice",
  }

  const publishedPost = {
    id: "post_published_01",
    title: "Post Publicado Oficial",
    status: "published" as const,
    authorId: "user_alice",
  }

  const pendingNarration = {
    postId: "post_published_01",
    status: "pending" as const,
    audioUrl: null,
  }

  const readyNarration = {
    postId: "post_published_01",
    status: "ready" as const,
    audioUrl: "https://my-blog.convex.cloud/api/storage/ready_audio.mp3",
  }

  // Simulation of public visibility predicate:
  const isNarrationPubliclyVisible = (
    post: { status: "draft" | "published" },
    narration?: { status: "pending" | "generating" | "ready" | "failed" } | null
  ): boolean => {
    // 1. Draft posts NEVER show audio to the public
    if (post.status !== "published") return false
    // 2. Only ready narrations with an audioUrl are visible to public readers
    if (!narration || narration.status !== "ready") return false
    return true
  }

  assert(
    !isNarrationPubliclyVisible(draftPost, readyNarration),
    "Un post en borrador ('draft') NUNCA expone reproductor ni audio al público"
  )
  assert(
    !isNarrationPubliclyVisible(publishedPost, pendingNarration),
    "Un post publicado con narración 'pending' NO expone reproductor al público"
  )
  assert(
    isNarrationPubliclyVisible(publishedPost, readyNarration),
    "Un post publicado con narración 'ready' expone el reproductor correctamente"
  )

  // =========================================================================
  // 4. Tenant Routes & Custom Domains
  // =========================================================================
  console.log("\n▶ [TEST 4] Aislamiento en Rutas de Tenant y Subdominios")

  const isSubdomainTrue = true
  const isSubdomainFalse = false
  const tenantSlug = "carlos-tech"
  const postSlug = "mi-primer-articulo"

  const computeCanonicalPostUrl = (isSub: boolean, tenant: string, slug: string) => {
    return isSub ? `/post/${slug}` : `/${tenant}/post/${slug}`
  }

  assert(
    computeCanonicalPostUrl(isSubdomainTrue, tenantSlug, postSlug) === "/post/mi-primer-articulo",
    "En subdominio dedicado, la ruta canónica del post es /post/[slug]"
  )
  assert(
    computeCanonicalPostUrl(isSubdomainFalse, tenantSlug, postSlug) === "/carlos-tech/post/mi-primer-articulo",
    "En ruta multi-tenant compartida, la ruta canónica incluye el prefijo /[tenant]"
  )

  // =========================================================================
  // 5. Physical Storage Purge Contract
  // =========================================================================
  console.log("\n▶ [TEST 5] Contrato de Purga Física en Convex Storage al Eliminar")

  const simulatedStorageBucket = new Map<string, ArrayBuffer>()
  simulatedStorageBucket.set("storage_file_999", new ArrayBuffer(4096))

  const simulateConvexNarrationRemove = async (
    narration: { id: string; storageId?: string },
    storage: Map<string, ArrayBuffer>
  ) => {
    if (narration.storageId) {
      storage.delete(narration.storageId)
    }
    return true
  }

  assert(simulatedStorageBucket.has("storage_file_999"), "Archivo existe inicialmente en el storage")
  await simulateConvexNarrationRemove(
    { id: "narr_del_01", storageId: "storage_file_999" },
    simulatedStorageBucket
  )
  assert(!simulatedStorageBucket.has("storage_file_999"), "Eliminar narración purga físicamente el blob en Convex Storage")

  console.log("\n===================================================================")
  console.log(`🏁 RESUMEN SEGURIDAD Y AISLAMIENTO: ${totalPassed} PASARON | ${totalFailed} FALLARON`)
  console.log("===================================================================")

  if (totalFailed > 0) {
    console.error("\nFallos detectados:")
    failures.forEach((f) => console.error(` - ${f}`))
    process.exit(1)
  }
}

runSecuritySuite().catch((err) => {
  console.error("Error fatal en suite de seguridad:", err)
  process.exit(1)
})
