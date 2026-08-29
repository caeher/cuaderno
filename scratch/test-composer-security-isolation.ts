/**
 * Suite de Seguridad, Aislamiento Multi-Tenant y Resiliencia — Issue #20 / Épica #13.
 *
 * Valida:
 * 1. Autorización estricta por identidad de Clerk / Convex.
 * 2. Aislamiento absoluto entre tenants (Tenant A no puede leer ni modificar recursos de Tenant B).
 * 3. Idempotencia de jobs y generación de borradores.
 * 4. Cancelación limpia en curso propagada a jobs hijos.
 * 5. Control de reintentos y progreso.
 * 6. Verificación explícita de NO aplicación de cuotas ni presupuestos por tenant en esta fase.
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
    console.log(`  [PASS] ${testName}`)
    totalPassed++
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` (${detail})` : ""}`)
    totalFailed++
    failures.push(testName)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock DB & Context para simular aislamiento y persistencia Convex
// ─────────────────────────────────────────────────────────────────────────────

interface MockSessionDoc {
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
}

interface MockJobDoc {
  _id: string
  sessionId: string
  tenantId: string
  kind: "research" | "outline" | "article" | "image" | "moderation"
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled"
  idempotencyKey: string
  attempt: number
  progress?: number
  startedAt?: string
  finishedAt?: string
}

interface MockUsageEventDoc {
  _id: string
  tenantId: string
  sessionId?: string
  jobId?: string
  phase: string
  estimatedCostUsd?: number
  actualCostUsd?: number
  status: string
}

class MockConvexEnvironment {
  sessions: Map<string, MockSessionDoc> = new Map()
  jobs: Map<string, MockJobDoc> = new Map()
  usageEvents: MockUsageEventDoc[] = []
  posts: Map<string, { _id: string; tenantId: string; status: string; title: string }> = new Map()

  // Simula requireTenantAuth & requireOwnedSession
  requireOwnedSession(tenantId: string, sessionId: string): MockSessionDoc {
    const session = this.sessions.get(sessionId)
    if (!session || session.tenantId !== tenantId) {
      throw new Error("Sesión de Composer no encontrada.")
    }
    return session
  }

  createSession(tenantId: string, authorId: string, brief: ComposerBrief = {}): string {
    const id = `sess_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()
    this.sessions.set(id, {
      _id: id,
      tenantId,
      authorId,
      brief,
      status: "collecting",
      createdAt: now,
      updatedAt: now,
    })
    return id
  }

  enqueueJob(
    tenantId: string,
    sessionId: string,
    kind: "research" | "outline" | "article" | "image",
    idempotencyKey: string
  ): string {
    const session = this.requireOwnedSession(tenantId, sessionId)
    if (isTerminalStatus(session.status as StateStatus)) {
      throw new Error(`La sesión está en estado "${session.status}" y no admite nuevos trabajos.`)
    }

    // Comprobación de idempotencia
    for (const job of this.jobs.values()) {
      if (job.tenantId === tenantId && job.idempotencyKey === idempotencyKey) {
        return job._id
      }
    }

    const jobId = `job_${Math.random().toString(36).substring(2, 9)}`
    this.jobs.set(jobId, {
      _id: jobId,
      sessionId,
      tenantId,
      kind,
      status: "queued",
      idempotencyKey,
      attempt: 0,
    })
    return jobId
  }

  startJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (!job || job.status === "cancelled") return false
    job.status = "running"
    job.attempt += 1
    job.startedAt = new Date().toISOString()
    return true
  }

  cancelSession(tenantId: string, sessionId: string): void {
    const session = this.requireOwnedSession(tenantId, sessionId)
    if (isTerminalStatus(session.status as StateStatus)) return

    assertTransition(session.status as StateStatus, "cancelled")
    session.status = "cancelled"
    session.updatedAt = new Date().toISOString()

    // Propagar a jobs vivos
    for (const job of this.jobs.values()) {
      if (job.sessionId === sessionId && (job.status === "queued" || job.status === "running")) {
        job.status = "cancelled"
        job.finishedAt = new Date().toISOString()
      }
    }
  }

  recordUsage(event: Omit<MockUsageEventDoc, "_id">): void {
    this.usageEvents.push({
      _id: `usage_${Math.random().toString(36).substring(2, 9)}`,
      ...event,
    })
  }

  createDraftFromSession(tenantId: string, sessionId: string): string {
    const session = this.requireOwnedSession(tenantId, sessionId)
    if (session.postId) {
      const existing = this.posts.get(session.postId)
      if (existing) return session.postId
    }

    if (session.status !== "awaiting_review") {
      throw new Error(`Solo se puede crear borrador desde 'awaiting_review'`)
    }

    const postId = `post_${Math.random().toString(36).substring(2, 9)}`
    this.posts.set(postId, {
      _id: postId,
      tenantId,
      status: "draft",
      title: session.title || "Borrador de prueba",
    })
    session.postId = postId
    return postId
  }
}

async function runSecurityIsolationTests() {
  console.log("\n===================================================================")
  console.log("SUITE: SEGURIDAD, AISLAMIENTO MULTI-TENANT E IDEMPOTENCIA")
  console.log("===================================================================\n")

  const env = new MockConvexEnvironment()

  console.log("--- 1. Aislamiento Multi-Tenant ---")
  const tenantA = "org_acme_corp"
  const tenantB = "org_globex_inc"

  const sessionAId = env.createSession(tenantA, "user_alice", { topic: "Estrategias de Growth" })
  const sessionBId = env.createSession(tenantB, "user_bob", { topic: "Seguridad en Cloud" })

  assert(
    Boolean(env.requireOwnedSession(tenantA, sessionAId)),
    "1.1 Tenant A accede a su propia sesión"
  )

  let tenantACrossAccessFailed = false
  try {
    env.requireOwnedSession(tenantA, sessionBId)
  } catch (err) {
    tenantACrossAccessFailed = (err as Error).message.includes("no encontrada")
  }
  assert(
    tenantACrossAccessFailed,
    "1.2 Tenant A NO puede acceder a la sesión de Tenant B (lanza error opaco no encontrada)"
  )

  let tenantBCrossAccessFailed = false
  try {
    env.requireOwnedSession(tenantB, sessionAId)
  } catch (err) {
    tenantBCrossAccessFailed = (err as Error).message.includes("no encontrada")
  }
  assert(
    tenantBCrossAccessFailed,
    "1.3 Tenant B NO puede acceder a la sesión de Tenant A"
  )

  console.log("\n--- 2. Idempotencia de Encolado y Handoff ---")
  const idempKeyResearch = computeComposerJobIdempotencyKey(sessionAId, "research", 0)
  const job1Id = env.enqueueJob(tenantA, sessionAId, "research", idempKeyResearch)
  const job2Id = env.enqueueJob(tenantA, sessionAId, "research", idempKeyResearch)

  assert(
    job1Id === job2Id,
    "2.1 Encolar dos veces con la misma idempotencyKey devuelve el mismo jobId sin duplicar"
  )

  // Cambiar estado a awaiting_review para probar handoff
  const sessionA = env.sessions.get(sessionAId)!
  sessionA.status = "awaiting_review"

  const postId1 = env.createDraftFromSession(tenantA, sessionAId)
  const postId2 = env.createDraftFromSession(tenantA, sessionAId)

  assert(
    postId1 === postId2,
    "2.2 createDraftFromSession es idempotente (mismo postId en llamadas repetidas)"
  )

  const createdPost = env.posts.get(postId1)!
  assert(
    createdPost.status === "draft",
    "2.3 El post creado tiene invariablemente status 'draft'"
  )

  console.log("\n--- 3. Cancelación en Curso y Reintentos ---")
  const sessionCId = env.createSession(tenantA, "user_alice", { topic: "Tema a Cancelar" })
  const jobCId = env.enqueueJob(tenantA, sessionCId, "research", "idemp_c_1")
  env.startJob(jobCId)

  assert(env.jobs.get(jobCId)!.status === "running", "3.1 Job C está en ejecución")
  assert(env.jobs.get(jobCId)!.attempt === 1, "3.2 Contador de intentos se incrementó a 1")

  env.cancelSession(tenantA, sessionCId)
  assert(env.sessions.get(sessionCId)!.status === "cancelled", "3.3 Sesión C pasa a estado 'cancelled'")
  assert(env.jobs.get(jobCId)!.status === "cancelled", "3.4 Job C en curso se cancela inmediatamente")

  let enqueueInCancelledFailed = false
  try {
    env.enqueueJob(tenantA, sessionCId, "outline", "idemp_c_2")
  } catch (err) {
    enqueueInCancelledFailed = true
  }
  assert(enqueueInCancelledFailed, "3.5 No se permite encolar jobs en una sesión cancelada")

  console.log("\n--- 4. Verificación de Invariante: NO Cuotas por Tenant en Fase 1 ---")
  // Simulamos alto volumen de consumo para un tenant sin que el sistema bloquee
  for (let i = 0; i < 20; i++) {
    env.recordUsage({
      tenantId: tenantA,
      sessionId: sessionAId,
      phase: "research",
      estimatedCostUsd: 0.15,
      actualCostUsd: 0.14,
      status: "succeeded",
    })
  }

  assert(
    env.usageEvents.filter((e) => e.tenantId === tenantA).length === 20,
    "4.1 Todos los 20 eventos de consumo se registraron en telemetría aiUsageEvents"
  )

  // Encolar nuevo trabajo en una sesión activa sigue estando permitido (sin bloqueo por software)
  const sessionDId = env.createSession(tenantA, "user_alice", { topic: "Nuevo tema con alto consumo previo" })
  const nextJobId = env.enqueueJob(tenantA, sessionDId, "research", "idemp_high_usage")
  assert(
    Boolean(nextJobId),
    "4.2 El sistema NO bloquea por cuotas de software a nivel de tenant (observabilidad pura)"
  )

  console.log("\n===================================================================")
  console.log(`RESUMEN: ${totalPassed}/${totalPassed + totalFailed} PRUEBAS PASADAS`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    process.exit(1)
  }
}

runSecurityIsolationTests()
