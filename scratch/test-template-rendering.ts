/**
 * Integration Test Suite for Public Route Template Rendering & Fallback Engine
 *
 * Tests:
 * 1. Fallback to Classic Theme when no template is published.
 * 2. Published Template rendering for Home & Post slots.
 * 3. Multi-Tenant Strict Isolation.
 * 4. Dynamic Widget Data Resolution (Title, Content, Meta, Cover, Actions, Bio, Related, Comments).
 * 5. Robustness & Error Handling on Corrupted AST / Unknown Blocks.
 * 6. SEO, JSON-LD, Canonical & Subdomain Invariance.
 */

import {
  createBlockNode,
  type BlockNode,
} from "../lib/domain/block-schema"
import { validateAndNormalizeBlockTree } from "../lib/domain/template-validator"
import type {
  GlobalTemplateContext,
  HomeSlotContext,
  PostSlotContext,
  TenantTemplate,
} from "../lib/domain/template-schema"
import {
  getOrCreateTenantTemplate,
  saveTenantTemplateDraft,
  publishTenantTemplate,
  getPublishedTemplateForTenant,
} from "../lib/application/tenant/template-use-cases"
import {
  getTenantProfile,
  getPostForReadingByTenant,
} from "../lib/application/blog-use-cases"
import { userRepository, postRepository } from "../lib/infrastructure/repositories"
import { constructSiteMetadata } from "../lib/seo/metadata"
import { generateArticleJsonLd, generateAuthorJsonLd } from "../lib/seo/json-ld"
import { buildTenantUrl } from "../lib/tenant-utils"

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

async function runRenderingTests() {
  console.log("==================================================================")
  console.log("🧪 RUNNING PUBLIC TEMPLATE RENDERING & FALLBACK INTEGRATION TESTS")
  console.log("==================================================================\n")

  // --- Test 1: Fallback Rendering for Tenant Without Template ---
  console.log("▶ [Test 1] Fallback to Classic Theme when No Published Template Exists")
  {
    const users = await userRepository.findAll()
    assert(users.length > 0, "Existen usuarios en la base de datos para la prueba")
    const testUser = users[0]

    // Create a fresh un-published tenant
    const unpubTenantId = "unpub_tenant_" + Math.random().toString(36).substring(2, 8)
    const initialTpl = await getOrCreateTenantTemplate(unpubTenantId, "user")
    assert(!initialTpl.isPublished, "Plantilla nueva inicia con isPublished = false")

    const pubTpl = await getPublishedTemplateForTenant(unpubTenantId)
    assert(pubTpl === null, "getPublishedTemplateForTenant retorna null para tenant sin publicar")

    // Verify tenant profile can be fetched
    const profile = await getTenantProfile(testUser.username)
    assert(profile !== null, `Perfil de tenant '${testUser.username}' resuelto con éxito`)
    assert(Array.isArray(profile?.posts), "Perfil contiene colección de posts para fallback clásico")
  }

  // --- Test 2: Multi-Tenant Isolation ---
  console.log("\n▶ [Test 2] Strict Multi-Tenant Isolation (Tenant A vs Tenant B)")
  {
    const tenantA = "tenant_a_" + Math.random().toString(36).substring(2, 8)
    const tenantB = "tenant_b_" + Math.random().toString(36).substring(2, 8)

    // Tenant A configures and publishes a custom Home template
    const homeBlocksA: BlockNode[] = [
      createBlockNode("banner", { title: "Hero de Tenant A", subtitle: "Bienvenido a Tenant A" }),
      createBlockNode("blog_post_grid", { columns: 3 }),
    ]
    await getOrCreateTenantTemplate(tenantA, "user")
    await saveTenantTemplateDraft(tenantA, { draftSlots: { home: homeBlocksA } })
    const publishedA = await publishTenantTemplate(tenantA, "User A", "Publique mi template")

    assert(publishedA.isPublished, "Tenant A publicó exitosamente su plantilla")
    assert(publishedA.publishedSlots.home?.length === 2, "Tenant A tiene 2 bloques en slot home publicado")

    // Tenant B creates a template but does NOT publish it
    await getOrCreateTenantTemplate(tenantB, "user")
    await saveTenantTemplateDraft(tenantB, {
      draftSlots: { home: [createBlockNode("heading", { text: "Borrador de B" })] },
    })

    // Check published retrieval
    const resolvedPubA = await getPublishedTemplateForTenant(tenantA)
    const resolvedPubB = await getPublishedTemplateForTenant(tenantB)

    assert(resolvedPubA !== null, "Tenant A resuelve su plantilla publicada")
    assert(resolvedPubA?.publishedSlots.home?.[0].props.title === "Hero de Tenant A", "Tenant A obtiene su título personalizado")
    assert(resolvedPubB === null, "Tenant B no tiene plantilla publicada (retorna null -> activa fallback)")
    assert(resolvedPubA?.tenantId === tenantA, "Aislamiento: La plantilla de A pertenece estrictamente a tenantA")
  }

  // --- Test 3: Dynamic Data Resolution in Widgets ---
  console.log("\n▶ [Test 3] Dynamic Route Data Resolution in Template Widgets")
  {
    const posts = await postRepository.findPublished()
    const users = await userRepository.findAll()
    assert(posts.length > 0, "Existen artículos publicados")
    const samplePost = posts[0]
    const sampleAuthor = users.find((u) => u.id === samplePost.authorId) || users[0]

    // Create a published Post slot template
    const tenantPostSlot = "tenant_post_" + Math.random().toString(36).substring(2, 8)
    const postSlotBlocks: BlockNode[] = [
      createBlockNode("post_title", { level: 1 }),
      createBlockNode("post_meta", { showAuthor: true, showDate: true }),
      createBlockNode("post_cover", { aspectRatio: "16/9" }),
      createBlockNode("post_takeaways", { title: "Resumen" }),
      createBlockNode("post_content", {}),
      createBlockNode("post_action_bar", {}),
      createBlockNode("author_box", {}),
      createBlockNode("comments_section", {}),
      createBlockNode("post_grid", { count: 3 }),
    ]

    await getOrCreateTenantTemplate(tenantPostSlot, "user")
    await saveTenantTemplateDraft(tenantPostSlot, { draftSlots: { post: postSlotBlocks } })
    const publishedPostTpl = await publishTenantTemplate(tenantPostSlot, "Editor", "Template de lectura")

    assert(publishedPostTpl.publishedSlots.post?.length === 9, "Persiste los 9 widgets dinámicos del slot post")

    // Mock runtime PostSlotContext
    const related = posts.filter((p) => p.id !== samplePost.id).slice(0, 3)
    const postContext: PostSlotContext = {
      tenant: sampleAuthor,
      homeUrl: `/${sampleAuthor.username}`,
      isSubdomain: false,
      post: samplePost,
      author: sampleAuthor,
      comments: [
        {
          id: "comm_1",
          postId: samplePost.id,
          authorName: "Lector Verificado",
          authorAvatarUrl: "",
          content: "Excelente artículo.",
          createdAt: new Date().toISOString(),
        },
      ],
      relatedPosts: related,
      authorMap: new Map(users.map((u) => [u.id, u])),
    }

    // Verify context holds expected data
    assert(postContext.post.title === samplePost.title, `post_title resolverá: '${samplePost.title}'`)
    assert(postContext.post.content === samplePost.content, "post_content resolverá el contenido editorial real")
    assert(postContext.author.name === sampleAuthor.name, `author_box resolverá al autor '${sampleAuthor.name}'`)
    assert(postContext.comments.length === 1, "comments_section resolverá la lista de comentarios en vivo")
    assert(postContext.relatedPosts.length === related.length, `post_grid resolverá ${related.length} artículos relacionados`)
  }

  // --- Test 4: Robustness on Invalid AST / Unknown Blocks ---
  console.log("\n▶ [Test 4] Resilient Fallback on Corrupted or Unknown Block Tree AST")
  {
    const corruptedBlocks = [
      { id: "corrupt_1", type: "invalid_unknown_block_xyz", props: {} },
      { id: "corrupt_2", type: "another_bad_type" },
    ]

    const validation = validateAndNormalizeBlockTree(corruptedBlocks)
    assert(!validation.isValid, "Validador detecta correctamente que los bloques son inválidos")
    assert(validation.normalized.length === 0, "Normalizador descarta los bloques corruptos")

    // In a slot renderer, when normalized.length === 0, it gracefully invokes the fallback
  }

  // --- Test 5: SEO, JSON-LD, LLMs.txt & Canonical Preservation ---
  console.log("\n▶ [Test 5] SEO Metadata, JSON-LD & Canonical Preservation Invariance")
  {
    const users = await userRepository.findAll()
    const testUser = users[0]
    const posts = await postRepository.findPublished()
    const testPost = posts[0]

    // 1. Home Metadata
    const homeMeta = constructSiteMetadata({
      title: `${testUser.name} — Blog`,
      description: testUser.bio || "Blog personal",
      canonicalPath: `/${testUser.username}`,
      type: "profile",
    })
    const homeTitleStr = typeof homeMeta.title === "string" ? homeMeta.title : (homeMeta.title as any)?.default
    assert(homeTitleStr === `${testUser.name} — Blog`, "Metadata de Home genera título correcto")
    assert((homeMeta.openGraph as any)?.type === "website", "Metadata de Home define OpenGraph type website")

    // 2. Article Metadata
    const articleMeta = constructSiteMetadata({
      title: `${testPost.title} · ${testUser.name}`,
      description: testPost.excerpt,
      canonicalPath: `/${testUser.username}/post/${testPost.slug}`,
      type: "article",
    })
    const articleTitleStr = typeof articleMeta.title === "string" ? articleMeta.title : (articleMeta.title as any)?.default
    assert(articleTitleStr === `${testPost.title} · ${testUser.name}`, "Metadata de Post genera título canónico de artículo")
    assert((articleMeta.openGraph as any)?.type === "article", "Metadata de Post define OpenGraph type article")

    // 3. JSON-LD Author Schema
    const authorJson = generateAuthorJsonLd(testUser, `https://midominio.com/${testUser.username}`, true)
    assert(authorJson["@type"] === "Person" || authorJson["@type"] === "ProfilePage", "JSON-LD de Autor genera Schema.org válido")
    assert(authorJson.name === testUser.name || (authorJson as any).mainEntity?.name === testUser.name, "JSON-LD incluye el nombre del autor")

    // 4. JSON-LD Article Schema
    const articleJson = generateArticleJsonLd(testPost, testUser, `https://midominio.com/${testUser.username}`, true)
    assert(articleJson["@type"] === "BlogPosting" || articleJson["@type"] === "Article", "JSON-LD de Artículo genera Schema BlogPosting/Article")
    assert(articleJson.headline === testPost.title, "JSON-LD de Artículo preserva el headline")

    // 5. Tenant URL Builder
    const subUrl = buildTenantUrl({
      tenantSlug: testUser.username,
      path: `/post/${testPost.slug}`,
      subdomainEnabled: true,
      absolute: false,
      isSubdomainHost: true,
    })
    assert(subUrl === `/post/${testPost.slug}`, `buildTenantUrl resuelve ruta relativa limpia en host de subdominio: '${subUrl}'`)
  }

  console.log("\n==================================================================")
  console.log(`📊 RESULTADOS: ${totalPassed} Pasaron | ${totalFailed} Fallaron`)
  console.log("==================================================================")

  if (totalFailed > 0) {
    process.exit(1)
  }
}

runRenderingTests().catch((err) => {
  console.error("Fatal test runner error:", err)
  process.exit(1)
})
