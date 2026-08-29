/**
 * Comprehensive Automated Verification Suite for Tenant Template System
 *
 * Tests:
 * 1. AST Validation, Normalization, Sanitization & Depth Limits.
 * 2. Multi-tenant Authorization & Isolation Guard.
 * 3. Persistence Lifecycle: Create, Draft Saving, Publishing, Revision History, and Rollback.
 * 4. Draft vs Published Isolation (Draft edits don't leak into Published).
 * 5. Monotonic Versioning & Immutability of Revisions.
 * 6. Post Content Integrity (Posts remain independent and intact).
 */

import {
  CURRENT_TEMPLATE_SCHEMA_VERSION,
  createBlockNode,
  validateAndNormalizeBlockTree,
  validateAndNormalizeSlotMap,
  MAX_BLOCK_TREE_DEPTH,
} from "../lib/domain"
import {
  getOrCreateTenantTemplate,
  getTenantTemplate,
  saveTenantTemplateDraft,
  publishTenantTemplate,
  getTenantTemplateRevisions,
  rollbackTenantTemplate,
} from "../lib/application/tenant/template-use-cases"
import { resolveAndAuthorizeTenant } from "../lib/application/tenant/tenant-auth"
import { postRepository, userRepository } from "../lib/infrastructure/repositories"

let totalPassed = 0
let totalFailed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`)
    totalPassed++
  } else {
    console.error(`  ❌ FAIL: ${message}`)
    totalFailed++
  }
}

async function runTests() {
  console.log("==================================================")
  console.log("🧪 RUNNING TENANT TEMPLATE INTEGRATION TEST SUITE")
  console.log("==================================================\n")

  // --- 1. AST Validation, Normalization and Sanitization ---
  console.log("▶ [Test 1] AST Validation, Normalization & Sanitization")
  {
    // Valid block tree
    const validTree = [
      createBlockNode("section", {}, {}, [
        createBlockNode("heading", { text: "Título del Blog" }),
        createBlockNode("text", { content: "Párrafo informativo" }),
      ]),
    ]
    const validResult = validateAndNormalizeBlockTree(validTree)
    assert(validResult.isValid, "Valida correctamente un árbol de bloques conforme al AST")
    assert(validResult.normalized.length === 1, "Conserva los nodos de nivel raíz")
    assert(validResult.normalized[0].children?.length === 2, "Conserva los nodos hijos")

    // Unknown block type sanitization
    const invalidTree = [
      { id: "b1", type: "malicious_script", props: { evil: true } },
      createBlockNode("heading", { text: "Válido" }),
    ]
    const invalidResult = validateAndNormalizeBlockTree(invalidTree)
    assert(!invalidResult.isValid, "Detecta tipos de bloques no permitidos")
    assert(invalidResult.normalized.length === 1, "Filtra y elimina el nodo inválido")
    assert(invalidResult.normalized[0].type === "heading", "Conserva únicamente el nodo válido")

    // XSS / Malicious URL sanitization
    const dirtyTree = [
      createBlockNode("button", { linkUrl: "javascript:alert('pwned')" }),
      createBlockNode("image", { imageUrl: "https://example.com/banner.jpg" }),
    ]
    const sanitized = validateAndNormalizeBlockTree(dirtyTree)
    assert(sanitized.normalized[0].props.linkUrl === "", "Sanitiza y anula URLs maliciosas javascript:")
    assert(sanitized.normalized[1].props.imageUrl === "https://example.com/banner.jpg", "Mantiene intactas las URLs seguras")

    // Depth limit check (max 10 levels)
    let deepNode: any = { id: "leaf", type: "text", props: {} }
    for (let i = 0; i < 15; i++) {
      deepNode = { id: `level_${i}`, type: "container", props: {}, children: [deepNode] }
    }
    const depthResult = validateAndNormalizeBlockTree([deepNode])
    assert(!depthResult.isValid, "Detecta y previene anidamiento que exceda MAX_BLOCK_TREE_DEPTH")

    // Slot map validation
    const slotMap = {
      home: validTree,
      post: [createBlockNode("post_content", {})],
      header: [createBlockNode("site_navbar", {})],
      footer: [createBlockNode("site_footer", {})],
      invalid_slot: [createBlockNode("text", {})],
    }
    const slotResult = validateAndNormalizeSlotMap(slotMap)
    assert(!slotResult.isValid, "Detecta slots no reconocidos")
    assert(slotResult.normalized.home !== undefined, "Normaliza slot 'home'")
    assert(slotResult.normalized.post !== undefined, "Normaliza slot 'post'")
    assert(slotResult.normalized.header !== undefined, "Normaliza slot 'header'")
    assert(slotResult.normalized.footer !== undefined, "Normaliza slot 'footer'")
    assert((slotResult.normalized as any).invalid_slot === undefined, "Descarta slots no permitidos")
  }

  // --- 2. Multi-tenant Authorization & Isolation Guard ---
  console.log("\n▶ [Test 2] Multi-tenant Authorization & Isolation Guard")
  {
    const activeContext = await resolveAndAuthorizeTenant()
    assert(activeContext.authorized, "Resuelve con éxito el contexto de tenant activo")
    assert(typeof activeContext.tenantId === "string" && activeContext.tenantId.length > 0, `Tenant ID resuelto: ${activeContext.tenantId}`)

    // Authorized access for own tenant
    const ownAuth = await resolveAndAuthorizeTenant(activeContext.tenantId)
    assert(ownAuth.authorized, "Autoriza acceso cuando el tenantId solicitado coincide con el autenticado")

    // Cross-tenant access denial
    let unauthorizedCaught = false
    try {
      await resolveAndAuthorizeTenant("foreign_tenant_unauthorized_999")
    } catch (err: any) {
      unauthorizedCaught = true
      assert(err.message.includes("Acceso denegado"), "Rechaza explícitamente el acceso cruzado a otro tenant")
    }
    assert(unauthorizedCaught, "Previene que un tenant lea o modifique templates de otro tenant")
  }

  // --- 3. Persistence Lifecycle, Revisions & Rollback ---
  console.log("\n▶ [Test 3] Persistence Lifecycle: Draft, Publish, Revision History & Rollback")
  {
    const testTenantId = "test_tenant_" + Math.random().toString(36).substring(2, 8)

    // 1. Initial creation
    const initialTpl = await getOrCreateTenantTemplate(testTenantId, "user")
    assert(initialTpl.tenantId === testTenantId, "Crea la plantilla inicial para el tenant")
    assert(initialTpl.schemaVersion === CURRENT_TEMPLATE_SCHEMA_VERSION, `Fija schemaVersion en ${CURRENT_TEMPLATE_SCHEMA_VERSION}`)
    assert(initialTpl.version === 1, "Inicia con versión 1")
    assert(!initialTpl.isPublished, "Inicia en estado no publicado (isPublished = false)")

    // 2. Draft updates (Draft isolation)
    const draftNodes = [
      createBlockNode("heading", { text: "Título del Borrador v1" }),
      createBlockNode("text", { content: "Contenido exclusivo del borrador" }),
    ]
    const updatedDraft = await saveTenantTemplateDraft(testTenantId, {
      name: "Mi Blog Personal Custom",
      draftSlots: { home: draftNodes },
      settings: { primaryColor: "#ef4444" },
    })

    assert(updatedDraft.name === "Mi Blog Personal Custom", "Actualiza el nombre del borrador")
    assert(updatedDraft.draftSlots.home?.length === 2, "Persiste los bloques en draftSlots")
    assert(Object.keys(updatedDraft.publishedSlots).length === 0, "ISOLATION: publishedSlots permanece vacío mientras sólo se edita el borrador")
    assert(!updatedDraft.isPublished, "ISOLATION: isPublished permanece falso mientras no se publique")

    // 3. Publishing Template (Version Increment & Snapshot)
    const published = await publishTenantTemplate(testTenantId, "Admin Tester", "Primera versión estable de producción")
    assert(published.isPublished, "Marca la plantilla como publicada (isPublished = true)")
    assert(published.version === 2, "Incrementa monótonamente la versión a 2 tras publicar")
    assert(published.publishedSlots.home?.length === 2, "Copia fielmente draftSlots hacia publishedSlots al publicar")
    assert(published.publishedAt !== null, "Asigna fecha de publicación (publishedAt)")

    // 4. Check Revisions history
    const revisions = await getTenantTemplateRevisions(testTenantId)
    assert(revisions.length === 1, "Registra 1 revisión inmutable en el historial")
    assert(revisions[0].version === 2, "La revisión registra versión 2")
    assert(revisions[0].publishedBy === "Admin Tester", "Registra el autor de la publicación")
    assert(revisions[0].slotsSnapshot.home?.length === 2, "Almacena snapshot inmutable de los slots")

    // 5. New Draft edits after publishing
    const newDraftNodes = [
      createBlockNode("heading", { text: "Título del Borrador v2 (No publicado)" }),
    ]
    const draftV2 = await saveTenantTemplateDraft(testTenantId, {
      draftSlots: { home: newDraftNodes },
    })
    assert(draftV2.draftSlots.home?.[0].props.text === "Título del Borrador v2 (No publicado)", "Guarda nuevo borrador")
    assert(draftV2.publishedSlots.home?.[0].props.text === "Título del Borrador v1", "ISOLATION: La versión publicada conserva el título anterior mientras el nuevo borrador no se publique")

    // 6. Rollback to Revision 1
    const rolledBack = await rollbackTenantTemplate(testTenantId, revisions[0].id)
    assert(rolledBack !== null, "Ejecuta el rollback a la revisión previa")
    assert(rolledBack?.draftSlots.home?.[0].props.text === "Título del Borrador v1", "Restaura con éxito los draftSlots a partir del snapshot inmutable")
  }

  // --- 4. Post Content Integrity & Independence ---
  console.log("\n▶ [Test 4] Post Content Integrity & Independence from Templates")
  {
    const posts = await postRepository.findAll()
    assert(Array.isArray(posts), "El repositorio de posts responde adecuadamente de forma desacoplada")
    if (posts.length > 0) {
      const firstPost = posts[0]
      assert(typeof firstPost.title === "string" && firstPost.title.length > 0, `Post '${firstPost.title}' mantiene su título intacto`)
      assert(typeof firstPost.content === "string", "Post mantiene su contenido TipTap/Notion intacto")
      assert(firstPost.id.length > 0, "Post conserva su identificador")
    }
  }

  console.log("\n==================================================")
  console.log(`📊 RESULTADOS: ${totalPassed} Pasaron | ${totalFailed} Fallaron`)
  console.log("==================================================")

  if (totalFailed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error("Fatal test runner error:", err)
  process.exit(1)
})
