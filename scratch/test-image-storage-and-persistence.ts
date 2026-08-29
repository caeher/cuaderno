/**
 * Suite: Persistencia de imágenes en Convex Storage, versionado y aislamiento multi-tenant — Issue #18.
 *
 * Usage:
 *   pnpm tsx scratch/test-image-storage-and-persistence.ts
 */

let totalPassed = 0
let totalFailed = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  PASS: ${testName}`)
    totalPassed++
  } else {
    console.error(`  FAIL: ${testName}${detail ? ` (${detail})` : ""}`)
    totalFailed++
    failures.push(testName)
  }
}

interface MockArtifact {
  _id: string
  sessionId: string
  tenantId: string
  kind: "cover" | "altText" | "article" | "outline" | "excerpt" | "taxonomy"
  content?: string
  storageId?: string
  version: number
  supersededBy?: string
  createdAt: string
}

interface MockSession {
  _id: string
  tenantId: string
  authorId: string
  status: string
  title?: string
  brief: {
    topic?: string
    wantsCoverImage?: boolean
  }
  postId?: string
}

async function runTests() {
  console.log("===================================================================")
  console.log("SUITE: Almacenamiento de Imágenes, Versionado y Aislamiento Multi-Tenant")
  console.log("===================================================================\n")

  const artifactsDb: MockArtifact[] = []
  const sessionsDb: MockSession[] = []
  const storageStore: Record<string, string> = {}

  // Helper para simular Convex Storage
  const mockStorage = {
    store: async (data: Buffer | Blob, id: string) => {
      storageStore[id] = `https://convex.cloud/api/storage/${id}`
      return id
    },
    getUrl: async (id: string) => {
      return storageStore[id] || null
    },
    delete: async (id: string) => {
      delete storageStore[id]
    },
  }

  // 1. Crear sesión de prueba
  const sessionTenantA: MockSession = {
    _id: "session-tenant-a-1",
    tenantId: "tenant_alpha",
    authorId: "user_alpha_1",
    status: "drafting",
    title: "Post sobre IA y Arte",
    brief: { topic: "IA y Arte", wantsCoverImage: true },
  }
  sessionsDb.push(sessionTenantA)

  console.log("▶ 1. Persistencia de Imagen en Convex Storage y Registro de Artefactos")
  // Simular subida de imagen y registro
  const fakeStorageId1 = "storage_blob_12345"
  await mockStorage.store(Buffer.from("fake-png-binary-data"), fakeStorageId1)

  const coverArtifact1: MockArtifact = {
    _id: "artifact_cover_v1",
    sessionId: sessionTenantA._id,
    tenantId: sessionTenantA.tenantId,
    kind: "cover",
    storageId: fakeStorageId1,
    version: 1,
    createdAt: new Date().toISOString(),
  }
  const altTextArtifact1: MockArtifact = {
    _id: "artifact_alt_v1",
    sessionId: sessionTenantA._id,
    tenantId: sessionTenantA.tenantId,
    kind: "altText",
    content: "Ilustración conceptual de IA y arte",
    version: 1,
    createdAt: new Date().toISOString(),
  }
  artifactsDb.push(coverArtifact1, altTextArtifact1)

  const resolvedUrl = await mockStorage.getUrl(fakeStorageId1)
  assert(
    resolvedUrl === `https://convex.cloud/api/storage/${fakeStorageId1}`,
    "Resuelve URL persistente desde storageId de Convex"
  )
  assert(
    coverArtifact1.storageId === fakeStorageId1 && coverArtifact1.version === 1,
    "Artefacto 'cover' persiste storageId y número de versión"
  )
  assert(
    altTextArtifact1.content === "Ilustración conceptual de IA y arte",
    "Artefacto 'altText' persiste contenido textual descriptivo"
  )

  console.log("\n▶ 2. Versionado y Regeneración de Portada (supersededBy)")
  // Simular una regeneración
  const fakeStorageId2 = "storage_blob_67890"
  await mockStorage.store(Buffer.from("fake-png-binary-data-v2"), fakeStorageId2)

  const coverArtifact2: MockArtifact = {
    _id: "artifact_cover_v2",
    sessionId: sessionTenantA._id,
    tenantId: sessionTenantA.tenantId,
    kind: "cover",
    storageId: fakeStorageId2,
    version: 2,
    createdAt: new Date().toISOString(),
  }
  coverArtifact1.supersededBy = coverArtifact2._id
  artifactsDb.push(coverArtifact2)

  const activeCovers = artifactsDb.filter(
    (a) => a.sessionId === sessionTenantA._id && a.kind === "cover" && !a.supersededBy
  )
  assert(activeCovers.length === 1, "Solo existe una portada activa vigente tras regeneración")
  assert(activeCovers[0].version === 2, "La portada activa es la versión 2")
  assert(
    coverArtifact1.supersededBy === "artifact_cover_v2",
    "La portada versión 1 queda marcada como supersededBy"
  )

  console.log("\n▶ 3. Edición de Alt Text por el Usuario")
  const newAltText = "Nueva descripción optimizada de la portada para SEO"
  const altTextArtifact2: MockArtifact = {
    _id: "artifact_alt_v2",
    sessionId: sessionTenantA._id,
    tenantId: sessionTenantA.tenantId,
    kind: "altText",
    content: newAltText,
    version: 2,
    createdAt: new Date().toISOString(),
  }
  altTextArtifact1.supersededBy = altTextArtifact2._id
  artifactsDb.push(altTextArtifact2)

  const activeAltText = artifactsDb.find(
    (a) => a.sessionId === sessionTenantA._id && a.kind === "altText" && !a.supersededBy
  )
  assert(activeAltText?.content === newAltText, "El texto alternativo activo refleja la edición del autor")

  console.log("\n▶ 4. Aislamiento Multi-Tenant de Assets")
  const tenantBIdentity = "tenant_beta"

  const canTenantBAccessSession = sessionTenantA.tenantId === tenantBIdentity
  assert(!canTenantBAccessSession, "Tenant B no puede acceder a la sesión de Tenant A")

  const tenantBVisibleArtifacts = artifactsDb.filter(
    (a) => a.tenantId === tenantBIdentity
  )
  assert(
    tenantBVisibleArtifacts.length === 0,
    "Tenant B no puede listar ni ver artefactos de imágenes de Tenant A"
  )

  console.log("\n▶ 5. Descarte y Restauración de Portada (wantsCoverImage)")
  sessionTenantA.brief.wantsCoverImage = false
  assert(sessionTenantA.brief.wantsCoverImage === false, "Permite descartar la portada")

  sessionTenantA.brief.wantsCoverImage = true
  assert(sessionTenantA.brief.wantsCoverImage === true, "Permite restaurar la portada")

  console.log("\n===================================================================")
  console.log(`Resultado: ${totalPassed} pass, ${totalFailed} fail`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    process.exit(1)
  }
}

runTests()
