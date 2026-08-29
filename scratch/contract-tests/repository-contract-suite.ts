import type {
  CategoryRepository,
  CommentRepository,
  PostRepository,
  TagRepository,
  TemplateRepository,
  UserRepository,
} from "@/lib/domain/repositories"
import type { User } from "@/lib/domain/entities"

export interface RepositoryBundle {
  userRepository: UserRepository
  categoryRepository: CategoryRepository
  tagRepository: TagRepository
  postRepository: PostRepository
  commentRepository: CommentRepository
  templateRepository: TemplateRepository
}

export interface ContractTestResults {
  suiteName: string
  totalPassed: number
  totalFailed: number
  failures: string[]
}

export async function runRepositoryContractSuite(
  suiteName: string,
  repos: RepositoryBundle
): Promise<ContractTestResults> {
  let totalPassed = 0
  let totalFailed = 0
  const failures: string[] = []

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [${suiteName}] PASS: ${message}`)
      totalPassed++
    } else {
      console.error(`  ❌ [${suiteName}] FAIL: ${message}`)
      totalFailed++
      failures.push(message)
    }
  }

  console.log(`\n==================================================`)
  console.log(`🧪 EJECUTANDO SUITE CONTRACTUAL: ${suiteName}`)
  console.log(`==================================================\n`)

  const uid = Math.random().toString(36).substring(2, 8)

  // ----------------------------------------------------
  // 1. Contrato: UserRepository
  // ----------------------------------------------------
  console.log(`▶ [${suiteName}] 1. Contrato: UserRepository`)
  const testUser: User = {
    id: `user_test_${uid}`,
    username: `autor_${uid}`,
    name: `Autor Test ${uid}`,
    email: `autor_${uid}@test.com`,
    avatarUrl: `https://example.com/avatar_${uid}.png`,
    coverUrl: `https://example.com/cover_${uid}.png`,
    bio: "Bio de prueba para contrato",
    tagline: "Tagline de prueba",
    location: "Madrid, ES",
    socials: { website: "https://test.com", twitter: "@test" },
    role: "owner",
    joinedAt: "2026-08-29",
    postCount: 0,
    followerCount: 10,
    timezone: "UTC",
    subdomainEnabled: true,
  }

  const createdUser = await repos.userRepository.create(testUser)
  assert(createdUser.username === testUser.username, "UserRepository.create persiste y retorna el usuario con su username")

  const foundById = await repos.userRepository.findById(testUser.id)
  assert(foundById !== null && foundById.email === testUser.email, "UserRepository.findById recupera el usuario correctamente")

  const foundByUsername = await repos.userRepository.findByUsername(testUser.username)
  assert(foundByUsername !== null && foundByUsername.id === testUser.id, "UserRepository.findByUsername recupera el usuario por username")

  const updatedUser = await repos.userRepository.update(testUser.id, {
    bio: "Bio actualizada",
    tagline: "Tagline actualizado",
  })
  assert(updatedUser !== null && updatedUser.bio === "Bio actualizada", "UserRepository.update modifica campos y retorna el usuario actualizado")

  const allUsers = await repos.userRepository.findAll()
  assert(Array.isArray(allUsers) && allUsers.some((u) => u.username === testUser.username), "UserRepository.findAll retorna lista que contiene al usuario")

  // ----------------------------------------------------
  // 2. Contrato: CategoryRepository
  // ----------------------------------------------------
  console.log(`\n▶ [${suiteName}] 2. Contrato: CategoryRepository`)
  const catSlug = `cat-slug-${uid}`
  const createdCat = await repos.categoryRepository.create({
    name: `Categoría ${uid}`,
    slug: catSlug,
    description: "Descripción de prueba",
    color: "#22c55e",
    organizationId: `org_${uid}`,
  })
  assert(createdCat.slug === catSlug, "CategoryRepository.create persiste categoría")

  const foundCat = await repos.categoryRepository.findBySlug(catSlug)
  assert(foundCat !== null && foundCat.name === `Categoría ${uid}`, "CategoryRepository.findBySlug encuentra por slug")

  const foundCatByOrg = await repos.categoryRepository.findByOrganization(`org_${uid}`)
  assert(foundCatByOrg.length > 0, "CategoryRepository.findByOrganization recupera categorías de la organización")

  const updatedCat = await repos.categoryRepository.update(createdCat.id, {
    name: `Categoría Editada ${uid}`,
  })
  assert(updatedCat !== null && updatedCat.name === `Categoría Editada ${uid}`, "CategoryRepository.update modifica categoría")

  // ----------------------------------------------------
  // 3. Contrato: TagRepository
  // ----------------------------------------------------
  console.log(`\n▶ [${suiteName}] 3. Contrato: TagRepository`)
  const tagSlug = `tag-slug-${uid}`
  const createdTag = await repos.tagRepository.create({
    name: `Tag ${uid}`,
    slug: tagSlug,
    color: "#a855f7",
    organizationId: `org_${uid}`,
  })
  assert(createdTag.slug === tagSlug, "TagRepository.create persiste etiqueta")

  const foundTag = await repos.tagRepository.findBySlug(tagSlug)
  assert(foundTag !== null && foundTag.name === `Tag ${uid}`, "TagRepository.findBySlug encuentra etiqueta por slug")

  const foundTagByOrg = await repos.tagRepository.findByOrganization(`org_${uid}`)
  assert(foundTagByOrg.length > 0, "TagRepository.findByOrganization recupera etiquetas de la organización")

  const updatedTag = await repos.tagRepository.update(createdTag.id, {
    name: `Tag Editado ${uid}`,
  })
  assert(updatedTag !== null && updatedTag.name === `Tag Editado ${uid}`, "TagRepository.update modifica etiqueta")

  // ----------------------------------------------------
  // 4. Contrato: PostRepository
  // ----------------------------------------------------
  console.log(`\n▶ [${suiteName}] 4. Contrato: PostRepository`)
  const postSlug = `articulo-test-${uid}`
  const initialPostCount = (await repos.userRepository.findById(testUser.id))?.postCount ?? 0

  const createdPost = await repos.postRepository.create({
    authorId: testUser.id,
    organizationId: `org_${uid}`,
    categoryId: createdCat.id,
    title: `Título del Artículo ${uid}`,
    slug: postSlug,
    excerpt: "Extracto de prueba",
    content: "Contenido de prueba con varias palabras para validar el cálculo automático de tiempo de lectura en la entidad.",
    tags: [tagSlug, "general"],
    status: "published",
    featured: true,
  })
  assert(createdPost.slug === postSlug, "PostRepository.create crea post y asigna slug")
  assert(createdPost.readingTimeMinutes >= 1, "PostRepository.create calcula readingTimeMinutes automáticamente")
  assert(createdPost.publishedAt !== null, "PostRepository.create asigna publishedAt al crearse como 'published'")

  // Verificar incremento de postCount en autor
  const authorAfterPost = await repos.userRepository.findById(testUser.id)
  assert((authorAfterPost?.postCount ?? 0) === initialPostCount + 1, "PostRepository.create incrementa atómicamente postCount en el autor")

  const foundPost = await repos.postRepository.findBySlug(postSlug)
  assert(foundPost !== null && foundPost.id === createdPost.id, "PostRepository.findBySlug recupera post")

  const authorPosts = await repos.postRepository.findByAuthorId(testUser.id, "published")
  assert(authorPosts.some((p) => p.slug === postSlug), "PostRepository.findByAuthorId recupera posts del autor filtrados por status")

  const publishedPosts = await repos.postRepository.findPublished()
  assert(publishedPosts.some((p) => p.slug === postSlug), "PostRepository.findPublished incluye post publicado")

  const featuredPosts = await repos.postRepository.findFeatured()
  assert(featuredPosts.some((p) => p.slug === postSlug), "PostRepository.findFeatured incluye post destacado")

  const tagPosts = await repos.postRepository.findByTag(tagSlug)
  assert(tagPosts.some((p) => p.slug === postSlug), "PostRepository.findByTag recupera post que contiene el tag")

  const categoryPosts = await repos.postRepository.findByCategory(createdCat.id)
  assert(categoryPosts.some((p) => p.slug === postSlug), "PostRepository.findByCategory recupera post asociado a la categoría")

  const updatedPost = await repos.postRepository.update(createdPost.id, {
    title: `Título Actualizado ${uid}`,
    views: 42,
    likes: 7,
  })
  assert(updatedPost !== null && updatedPost.title === `Título Actualizado ${uid}` && updatedPost.views === 42, "PostRepository.update actualiza métricas y título")

  // ----------------------------------------------------
  // 5. Contrato: CommentRepository
  // ----------------------------------------------------
  console.log(`\n▶ [${suiteName}] 5. Contrato: CommentRepository`)
  const createdComment = await repos.commentRepository.create({
    postId: createdPost.id,
    authorName: `Lector ${uid}`,
    authorAvatarUrl: `https://example.com/avatar_${uid}.png`,
    content: "¡Excelente artículo!",
  })
  assert(createdComment.postId === createdPost.id, "CommentRepository.create persiste comentario")

  // Verificar incremento de comments en el post
  const postWithComment = await repos.postRepository.findById(createdPost.id)
  assert((postWithComment?.comments ?? 0) >= 1, "CommentRepository.create incrementa atómicamente el contador comments en el post")

  const comments = await repos.commentRepository.findByPostId(createdPost.id)
  assert(comments.length >= 1 && comments.some((c) => c.id === createdComment.id), "CommentRepository.findByPostId recupera comentarios del post")

  // Borrar comentario
  await repos.commentRepository.delete(createdComment.id)
  const postAfterCommentDel = await repos.postRepository.findById(createdPost.id)
  assert((postAfterCommentDel?.comments ?? 0) === 0, "CommentRepository.delete decrementa atómicamente el contador comments en el post")

  // ----------------------------------------------------
  // 6. Contrato: TemplateRepository
  // ----------------------------------------------------
  console.log(`\n▶ [${suiteName}] 6. Contrato: TemplateRepository`)
  const testTenantId = `tenant_${uid}`
  const initialTpl = await repos.templateRepository.create({
    tenantId: testTenantId,
    tenantType: "user",
    name: "Plantilla Inicial",
    draftSlots: {
      home: [{ id: "b1", type: "heading", props: { text: "Encabezado v1" } }],
    },
    settings: { primaryColor: "#3b82f6" },
  })
  assert(initialTpl.tenantId === testTenantId, "TemplateRepository.create crea plantilla para el tenant")
  assert(!initialTpl.isPublished, "TemplateRepository.create inicia con isPublished = false")
  assert(initialTpl.version === 1, "TemplateRepository.create inicia con versión 1")

  // Guardar borrador aislado
  const draftTpl = await repos.templateRepository.saveDraft(testTenantId, {
    name: "Plantilla con Borrador",
    draftSlots: {
      home: [{ id: "b1", type: "heading", props: { text: "Encabezado Borrador v2" } }],
    },
  })
  assert(draftTpl.draftSlots.home?.[0].props.text === "Encabezado Borrador v2", "TemplateRepository.saveDraft actualiza draftSlots")
  assert(Object.keys(draftTpl.publishedSlots).length === 0, "ISOLATION: publishedSlots permanece vacío al editar sólo el borrador")

  // Publicar plantilla
  const publishedTpl = await repos.templateRepository.publish(testTenantId, "Admin Tester", "Publicación v2")
  assert(publishedTpl.isPublished, "TemplateRepository.publish marca isPublished = true")
  assert(publishedTpl.version === 2, "TemplateRepository.publish incrementa la versión a 2")
  assert(publishedTpl.publishedSlots.home?.[0].props.text === "Encabezado Borrador v2", "TemplateRepository.publish copia draftSlots a publishedSlots")

  // Revisiones
  const revisions = await repos.templateRepository.getRevisions(testTenantId)
  assert(revisions.length === 1 && revisions[0].version === 2, "TemplateRepository.getRevisions retorna revisión inmutable v2")

  // Nuevo borrador posterior
  await repos.templateRepository.saveDraft(testTenantId, {
    draftSlots: {
      home: [{ id: "b1", type: "heading", props: { text: "Borrador v3 No Publicado" } }],
    },
  })

  // Rollback a revisión v2
  const rolledBack = await repos.templateRepository.rollback(testTenantId, revisions[0].id)
  assert(rolledBack !== null && rolledBack.draftSlots.home?.[0].props.text === "Encabezado Borrador v2", "TemplateRepository.rollback restaura draftSlots desde snapshot inmutable")

  // ----------------------------------------------------
  // 7. Limpieza y desvinculación en cascada
  // ----------------------------------------------------
  console.log(`\n▶ [${suiteName}] 7. Limpieza y desvinculación en cascada`)
  // Eliminar post
  await repos.postRepository.delete(createdPost.id)
  const postDeleted = await repos.postRepository.findById(createdPost.id)
  assert(postDeleted === null, "PostRepository.delete elimina el post")
  const authorAfterDel = await repos.userRepository.findById(testUser.id)
  assert((authorAfterDel?.postCount ?? 0) === initialPostCount, "PostRepository.delete decrementa postCount en autor")

  // Eliminar categoría y tag
  await repos.categoryRepository.delete(createdCat.id)
  const catDeleted = await repos.categoryRepository.findById(createdCat.id)
  assert(catDeleted === null, "CategoryRepository.delete elimina categoría")

  await repos.tagRepository.delete(createdTag.id)
  const tagDeleted = await repos.tagRepository.findById(createdTag.id)
  assert(tagDeleted === null, "TagRepository.delete elimina etiqueta")

  console.log(`\n==================================================`)
  console.log(`📊 RESULTADOS [${suiteName}]: ${totalPassed} Pasaron | ${totalFailed} Fallaron`)
  console.log(`==================================================\n`)

  return {
    suiteName,
    totalPassed,
    totalFailed,
    failures,
  }
}
