/**
 * Pruebas de integración de persistencia, aislamiento multi-tenant e idempotencia de Composer (issue #15).
 *
 * Usage:
 *   pnpm tsx scratch/test-composer-persistence.ts
 */

import {
  computeComposerJobIdempotencyKey,
  type ComposerBrief,
  type ComposerSessionStatus,
} from "../lib/domain/entities"
import {
  assertTransition,
  isTerminalStatus,
  type ComposerSessionStatus as StateStatus,
} from "../convex/lib/composerState"

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

// ─────────────────────────────────────────────────────────────────────────────
// Mock DB en memoria para emular operaciones transaccionales de Convex
// ─────────────────────────────────────────────────────────────────────────────

interface MockSession {
  _id: string
  tenantId: string
  authorId: string
  title?: string
  brief: ComposerBrief
  status: ComposerSessionStatus
  failureReason?: string
  postId?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

interface MockMessage {
  _id: string
  sessionId: string
  tenantId: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
}

interface MockJob {
  _id: string
  sessionId: string
  tenantId: string
  kind: "research" | "outline" | "article" | "image" | "moderation"
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled"
  idempotencyKey: string
  progress?: number
  attempt: number
  error?: string
  startedAt?: string
  finishedAt?: string
  createdAt: string
}

interface MockSource {
  _id: string
  sessionId: string
  tenantId: string
  url: string
  title?: string
  publisher?: string
  publishedAt?: string
  fetchedAt: string
  snippet?: string
  claims: Array<{ text: string; offset?: number }>
}

interface MockArtifact {
  _id: string
  sessionId: string
  tenantId: string
  kind: "outline" | "article" | "excerpt" | "taxonomy" | "altText" | "cover"
  content?: string
  storageId?: string
  version: number
  supersededBy?: string
  createdAt: string
}

interface MockUsageEvent {
  _id: string
  tenantId: string
  sessionId?: string
  jobId?: string
  phase: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  imageCount?: number
  toolCalls?: number
  estimatedCostUsd?: number
  actualCostUsd?: number
  status: string
  requestId?: string
  createdAt: string
}

interface MockPost {
  _id: string
  authorId: string
  tenantId?: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl?: string
  tags: string[]
  status: "draft" | "published" | "scheduled"
  updatedAt: string
  readingTimeMinutes: number
}

class InMemoryConvexDatabase {
  sessions: Map<string, MockSession> = new Map()
  messages: Map<string, MockMessage> = new Map()
  jobs: Map<string, MockJob> = new Map()
  sources: Map<string, MockSource> = new Map()
  artifacts: Map<string, MockArtifact> = new Map()
  usageEvents: Map<string, MockUsageEvent> = new Map()
  posts: Map<string, MockPost> = new Map()
  storageBlobs: Set<string> = new Set()

  private idCounter = 1

  private nextId(prefix: string): string {
    return `${prefix}_${this.idCounter++}`
  }

  // --- Auth & Ownership ---
  requireOwnedSession(sessionId: string, currentTenantId: string): MockSession {
    const session = this.sessions.get(sessionId)
    if (!session || session.tenantId !== currentTenantId) {
      throw new Error("Sesión de Composer no encontrada.")
    }
    return session
  }

  // --- Session Operations ---
  createSession(tenantId: string, authorId: string, brief: ComposerBrief = {}): string {
    const id = this.nextId("sess")
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    this.sessions.set(id, {
      _id: id,
      tenantId,
      authorId,
      brief,
      status: "collecting",
      createdAt: now,
      updatedAt: now,
      expiresAt,
    })
    return id
  }

  listSessions(tenantId: string, status?: ComposerSessionStatus): MockSession[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.tenantId === tenantId && (!status || s.status === status))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  updateBrief(sessionId: string, currentTenantId: string, brief: Partial<ComposerBrief>): void {
    const session = this.requireOwnedSession(sessionId, currentTenantId)
    if (isTerminalStatus(session.status as StateStatus)) {
      throw new Error(`La sesión está en estado "${session.status}" y ya no admite cambios en el brief.`)
    }
    session.brief = { ...session.brief, ...brief }
    session.updatedAt = new Date().toISOString()
  }

  appendMessage(sessionId: string, currentTenantId: string, role: "user" | "assistant" | "system", content: string): string {
    const session = this.requireOwnedSession(sessionId, currentTenantId)
    const id = this.nextId("msg")
    const now = new Date().toISOString()
    this.messages.set(id, {
      _id: id,
      sessionId,
      tenantId: currentTenantId,
      role,
      content,
      createdAt: now,
    })
    session.updatedAt = now
    return id
  }

  transitionSession(sessionId: string, to: ComposerSessionStatus, failureReason?: string, postId?: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Sesión de Composer no encontrada.")
    assertTransition(session.status as StateStatus, to as StateStatus)
    session.status = to
    session.failureReason = failureReason
    session.postId = postId || session.postId
    session.updatedAt = new Date().toISOString()
  }

  cancelSession(sessionId: string, currentTenantId: string): void {
    const session = this.requireOwnedSession(sessionId, currentTenantId)
    if (isTerminalStatus(session.status as StateStatus)) return

    assertTransition(session.status as StateStatus, "cancelled")
    const now = new Date().toISOString()
    session.status = "cancelled"
    session.updatedAt = now

    // Propagar cancelación en cascada
    for (const job of this.jobs.values()) {
      if (job.sessionId === sessionId && (job.status === "queued" || job.status === "running")) {
        job.status = "cancelled"
        job.finishedAt = now
      }
    }
  }

  // --- Jobs Operations (Idempotencia) ---
  enqueueJob(sessionId: string, currentTenantId: string, kind: MockJob["kind"], idempotencyKey: string): string {
    const session = this.requireOwnedSession(sessionId, currentTenantId)
    if (isTerminalStatus(session.status as StateStatus)) {
      throw new Error(`La sesión está en estado "${session.status}" y no admite nuevos trabajos.`)
    }

    // Buscar si ya existe por idempotencyKey en el tenant
    for (const job of this.jobs.values()) {
      if (job.tenantId === currentTenantId && job.idempotencyKey === idempotencyKey) {
        return job._id
      }
    }

    const id = this.nextId("job")
    this.jobs.set(id, {
      _id: id,
      sessionId,
      tenantId: currentTenantId,
      kind,
      status: "queued",
      idempotencyKey,
      attempt: 0,
      createdAt: new Date().toISOString(),
    })
    return id
  }

  startJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (!job) throw new Error("Job de Composer no encontrado.")
    if (job.status === "cancelled") return false

    job.status = "running"
    job.attempt += 1
    job.startedAt = new Date().toISOString()
    job.error = undefined
    return true
  }

  updateJobProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId)
    if (!job) throw new Error("Job de Composer no encontrado.")
    job.progress = Math.max(0, Math.min(1, progress))
  }

  finishJob(jobId: string, status: "succeeded" | "failed", error?: string): void {
    const job = this.jobs.get(jobId)
    if (!job) throw new Error("Job de Composer no encontrado.")
    job.status = status
    job.error = error
    job.finishedAt = new Date().toISOString()
    job.progress = status === "succeeded" ? 1 : undefined
  }

  // --- Fuentes & Artefactos ---
  recordSources(sessionId: string, sourcesList: Array<Omit<MockSource, "_id" | "sessionId" | "tenantId" | "fetchedAt">>): void {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Sesión de Composer no encontrada.")
    const now = new Date().toISOString()

    for (const src of sourcesList) {
      let existing: MockSource | undefined
      for (const s of this.sources.values()) {
        if (s.sessionId === sessionId && s.url === src.url) {
          existing = s
          break
        }
      }

      if (existing) {
        existing.claims = src.claims
        existing.fetchedAt = now
      } else {
        const id = this.nextId("src")
        this.sources.set(id, {
          _id: id,
          sessionId,
          tenantId: session.tenantId,
          fetchedAt: now,
          ...src,
        })
      }
    }
  }

  recordArtifact(sessionId: string, kind: MockArtifact["kind"], content?: string, storageId?: string): string {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Sesión de Composer no encontrada.")

    const previous = Array.from(this.artifacts.values()).filter(
      (a) => a.sessionId === sessionId && a.kind === kind
    )
    const active = previous.find((a) => !a.supersededBy)
    const version = previous.reduce((max, a) => Math.max(max, a.version), 0)

    const id = this.nextId("art")
    this.artifacts.set(id, {
      _id: id,
      sessionId,
      tenantId: session.tenantId,
      kind,
      content,
      storageId,
      version: version + 1,
      createdAt: new Date().toISOString(),
    })

    if (active) {
      active.supersededBy = id
    }

    return id
  }

  recordUsage(event: Omit<MockUsageEvent, "_id" | "createdAt">): void {
    const id = this.nextId("use")
    this.usageEvents.set(id, {
      _id: id,
      ...event,
      createdAt: new Date().toISOString(),
    })
  }

  // --- Handoff a Posts (Idempotente) ---
  createDraftFromSession(sessionId: string, currentTenantId: string): string {
    const session = this.requireOwnedSession(sessionId, currentTenantId)

    if (session.postId) {
      const existing = this.posts.get(session.postId)
      if (existing) return session.postId
    }

    if (session.status !== "awaiting_review") {
      throw new Error(`La sesión está en estado "${session.status}". Solo se puede crear el borrador desde "awaiting_review".`)
    }

    const activeArtifacts = Array.from(this.artifacts.values()).filter(
      (a) => a.sessionId === sessionId && !a.supersededBy
    )
    const article = activeArtifacts.find((a) => a.kind === "article")
    if (!article?.content) {
      throw new Error("La sesión no tiene un artículo generado; no hay nada que convertir en borrador.")
    }

    const postId = this.nextId("post")
    const now = new Date().toISOString()
    this.posts.set(postId, {
      _id: postId,
      authorId: session.authorId,
      tenantId: currentTenantId,
      title: session.title || session.brief.topic || "Borrador sin título",
      slug: "articulo-generado-por-composer",
      excerpt: activeArtifacts.find((a) => a.kind === "excerpt")?.content || "",
      content: article.content,
      tags: ["ia", "investigacion"],
      status: "draft",
      updatedAt: now,
      readingTimeMinutes: 5,
    })

    session.postId = postId
    session.updatedAt = now
    return postId
  }

  // --- Purga de Sesiones ---
  purgeExpiredSessions(now: Date = new Date()): { revisadas: number; borradas: number } {
    let revisadas = 0
    let borradas = 0

    for (const session of Array.from(this.sessions.values())) {
      if (!session.expiresAt || new Date(session.expiresAt) > now) continue
      revisadas++

      // Solo borrar sesiones en estado terminal
      if (!isTerminalStatus(session.status as StateStatus)) continue

      // Borrar mensajes
      for (const [id, m] of Array.from(this.messages.entries())) {
        if (m.sessionId === session._id) this.messages.delete(id)
      }
      // Borrar jobs
      for (const [id, j] of Array.from(this.jobs.entries())) {
        if (j.sessionId === session._id) this.jobs.delete(id)
      }
      // Borrar fuentes
      for (const [id, s] of Array.from(this.sources.entries())) {
        if (s.sessionId === session._id) this.sources.delete(id)
      }
      // Borrar artefactos y blobs de storage
      for (const [id, a] of Array.from(this.artifacts.entries())) {
        if (a.sessionId === session._id) {
          if (a.storageId) this.storageBlobs.delete(a.storageId)
          this.artifacts.delete(id)
        }
      }

      this.sessions.delete(session._id)
      borradas++
    }

    return { revisadas, borradas }
  }
}

async function runPersistenceTests() {
  console.log("===================================================================")
  console.log("SUITE: Persistencia, Aislamiento Multi-Tenant e Idempotencia")
  console.log("===================================================================\n")

  const db = new InMemoryConvexDatabase()

  const TENANT_A = "tenant_alpha_123"
  const USER_A = "user_author_a"

  const TENANT_B = "tenant_beta_456"
  const USER_B = "user_author_b"

  // 1. Creación de sesión para Tenant A
  console.log("▶ Creación y Aislamiento de Sesión")
  const sessionA = db.createSession(TENANT_A, USER_A, { topic: "Computación Cuántica", language: "es" })
  assert(Boolean(sessionA), "Tenant A puede crear una sesión en estado collecting")

  const listA = db.listSessions(TENANT_A)
  assert(listA.length === 1 && listA[0]._id === sessionA, "Tenant A lista su sesión")

  const listB = db.listSessions(TENANT_B)
  assert(listB.length === 0, "Tenant B no puede ver la sesión de Tenant A en su listado")

  let tenantBThrew = false
  try {
    db.requireOwnedSession(sessionA, TENANT_B)
  } catch (err) {
    tenantBThrew = err instanceof Error && err.message.includes("Sesión de Composer no encontrada")
  }
  assert(tenantBThrew, "Tenant B no puede acceder directamente a la sesión de Tenant A (error opaco)")

  // 2. Mensajes en la conversación
  console.log("\n▶ Mensajes de Conversación")
  const msg1 = db.appendMessage(sessionA, TENANT_A, "user", "Quiero un artículo enfocado en qubits superconductores.")
  const msg2 = db.appendMessage(sessionA, TENANT_A, "assistant", "Perfecto, investigaré los últimos avances de IBM y Google.")
  assert(Boolean(msg1 && msg2), "Se pueden agregar mensajes a la conversación")

  let tenantBMsgThrew = false
  try {
    db.appendMessage(sessionA, TENANT_B, "user", "Intento de inyección de Tenant B")
  } catch {
    tenantBMsgThrew = true
  }
  assert(tenantBMsgThrew, "Tenant B no puede agregar mensajes a una sesión ajena")

  // 3. Encolado de Jobs e Idempotencia
  console.log("\n▶ Encolado de Jobs e Idempotencia")
  const idempotencyKey = computeComposerJobIdempotencyKey(sessionA, "research", 1)
  const job1Id = db.enqueueJob(sessionA, TENANT_A, "research", idempotencyKey)
  assert(Boolean(job1Id), "Primer encolado de job crea un nuevo job")

  // Segundo encolado con la misma idempotencyKey
  const job2Id = db.enqueueJob(sessionA, TENANT_A, "research", idempotencyKey)
  assert(job1Id === job2Id, "Reintento/Refresh con misma idempotencyKey devuelve el job existente sin duplicar")

  // Tenant B no puede encolar jobs en la sesión de Tenant A
  let tenantBJobThrew = false
  try {
    db.enqueueJob(sessionA, TENANT_B, "research", idempotencyKey)
  } catch {
    tenantBJobThrew = true
  }
  assert(tenantBJobThrew, "Tenant B no puede encolar jobs sobre la sesión de Tenant A")

  // 4. Ciclo de Vida del Job y Progreso
  console.log("\n▶ Ciclo de Vida del Job")
  const started = db.startJob(job1Id)
  assert(started === true, "startJob transiciona a running e incrementa attempt")
  const jobState = db.jobs.get(job1Id)
  assert(jobState?.status === "running" && jobState.attempt === 1, "Estado del job es running con attempt 1")

  db.updateJobProgress(job1Id, 0.5)
  assert(db.jobs.get(job1Id)?.progress === 0.5, "updateJobProgress actualiza progreso normalizado")

  db.finishJob(job1Id, "succeeded")
  assert(db.jobs.get(job1Id)?.status === "succeeded" && db.jobs.get(job1Id)?.progress === 1, "finishJob marca succeeded y progreso 1")

  // 5. Trazabilidad de Fuentes y Deduplicación
  console.log("\n▶ Fuentes y Trazabilidad")
  db.recordSources(sessionA, [
    {
      url: "https://nature.com/articles/quantum-qubits",
      title: "Superconducting Qubits Advance",
      publisher: "Nature",
      claims: [{ text: "Coherence times reached 100 microseconds", offset: 120 }],
    },
  ])

  let sources = Array.from(db.sources.values()).filter((s) => s.sessionId === sessionA)
  assert(sources.length === 1, "Fuente registrada correctamente")

  // Deduplicación por URL en reintento
  db.recordSources(sessionA, [
    {
      url: "https://nature.com/articles/quantum-qubits",
      title: "Superconducting Qubits Advance",
      claims: [{ text: "Updated claims text", offset: 150 }],
    },
  ])
  sources = Array.from(db.sources.values()).filter((s) => s.sessionId === sessionA)
  assert(sources.length === 1 && sources[0].claims[0].text === "Updated claims text", "Reintento de fuentes deduplica por URL sin multiplicar registros")

  // 6. Versionado de Artefactos
  console.log("\n▶ Versionado de Artefactos")
  const art1Id = db.recordArtifact(sessionA, "article", "Primer borrador del artículo.")
  const art2Id = db.recordArtifact(sessionA, "article", "Segundo borrador refinado.")

  const art1 = db.artifacts.get(art1Id)
  const art2 = db.artifacts.get(art2Id)
  assert(art1?.version === 1 && art1.supersededBy === art2Id, "Artefacto V1 marcado como supersededBy V2")
  assert(art2?.version === 2 && art2.supersededBy === undefined, "Artefacto V2 es la versión vigente activa")

  // 7. Observabilidad de Uso/Coste
  console.log("\n▶ Observabilidad de IA (aiUsageEvents)")
  db.recordUsage({
    tenantId: TENANT_A,
    sessionId: sessionA,
    jobId: job1Id,
    phase: "research",
    model: "gpt-5.6-luna",
    inputTokens: 1200,
    outputTokens: 450,
    estimatedCostUsd: 0.008,
    status: "succeeded",
  })
  const usages = Array.from(db.usageEvents.values()).filter((u) => u.sessionId === sessionA)
  assert(usages.length === 1 && usages[0].model === "gpt-5.6-luna", "Evento de uso registrado correctamente para observabilidad")

  // 8. Handoff Idempotente a Posts
  console.log("\n▶ Handoff a Borrador de Posts")
  // Transicionar sesión a awaiting_review
  db.transitionSession(sessionA, "awaiting_confirmation")
  db.transitionSession(sessionA, "researching")
  db.transitionSession(sessionA, "drafting")
  db.transitionSession(sessionA, "awaiting_review")

  const post1Id = db.createDraftFromSession(sessionA, TENANT_A)
  const createdPost = db.posts.get(post1Id)
  assert(Boolean(createdPost), "createDraftFromSession genera post en la tabla posts")
  assert(createdPost?.status === "draft", "Invariante de seguridad: el post generado SIEMPRE tiene status: 'draft'")

  // Reintento de creación de post (idempotencia)
  const post2Id = db.createDraftFromSession(sessionA, TENANT_A)
  assert(post1Id === post2Id, "Doble llamada a createDraftFromSession devuelve el mismo post sin duplicar")

  // 9. Cancelación y Cascada
  console.log("\n▶ Cancelación de Sesión y Cascada a Jobs")
  const session2 = db.createSession(TENANT_A, USER_A, { topic: "Otro tema", language: "es" })
  const pendingJobId = db.enqueueJob(session2, TENANT_A, "image", "img_key_1")
  db.cancelSession(session2, TENANT_A)
  assert(db.sessions.get(session2)?.status === "cancelled", "Sesión marcada como cancelled")
  assert(db.jobs.get(pendingJobId)?.status === "cancelled", "Job pendiente cancelado en cascada automáticamente")

  // 10. Política de Retención y Purga
  console.log("\n▶ Política de Retención y Purga de Sesiones")
  // Simular blob de storage en un artefacto
  const storageBlobId = "blob_cover_img_999"
  db.storageBlobs.add(storageBlobId)
  db.recordArtifact(sessionA, "cover", undefined, storageBlobId)

  // Avanzar reloj ficticio 91 días
  const future = new Date(Date.now() + 91 * 24 * 60 * 60 * 1000)
  const purgeResult = db.purgeExpiredSessions(future)

  assert(purgeResult.borradas >= 1, "purgeExpiredSessions purga sesiones terminales vencidas")
  assert(db.sessions.has(sessionA) === false, "Sesión vencida fue eliminada")
  assert(db.messages.has(msg1) === false, "Mensajes eliminados en cascada")
  assert(db.artifacts.has(art2Id) === false, "Artefactos eliminados en cascada")
  assert(db.storageBlobs.has(storageBlobId) === false, "Blob de storage eliminado antes del documento")
  assert(db.posts.has(post1Id) === true, "El post en borrador del usuario permanece intacto tras la purga")

  console.log("\n===================================================================")
  console.log(`Resultado: ${totalPassed} pass, ${totalFailed} fail`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    console.error("Fallos:", failures.join(", "))
    process.exit(1)
  }
}

runPersistenceTests().catch((err) => {
  console.error(err)
  process.exit(1)
})
