/**
 * Tests de persistencia y contratos de fuentes de investigación en Composer (Issue #16).
 *
 * Usage:
 *   pnpm tsx scratch/test-composer-research-persistence.ts
 */

import type {
  ComposerBrief,
  ComposerSource,
} from "../lib/domain/entities/composer"

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

// Implementación en memoria para simular el almacén de datos
class MockResearchStore {
  private sources: Map<string, ComposerSource> = new Map()

  addSource(source: ComposerSource) {
    this.sources.set(source.id, source)
  }

  getSource(id: string): ComposerSource | undefined {
    return this.sources.get(id)
  }

  listSourcesBySession(sessionId: string, tenantId: string): ComposerSource[] {
    return Array.from(this.sources.values()).filter(
      (s) => s.sessionId === sessionId && s.tenantId === tenantId
    )
  }

  toggleSourceExclusion(
    sessionId: string,
    sourceId: string,
    tenantId: string,
    isExcluded: boolean
  ): void {
    const source = this.sources.get(sourceId)
    if (!source || source.sessionId !== sessionId || source.tenantId !== tenantId) {
      throw new Error("Fuente no encontrada o tenant mismatch.")
    }
    source.isExcluded = isExcluded
  }

  getActiveSourcesForDrafting(sessionId: string, tenantId: string): ComposerSource[] {
    return this.listSourcesBySession(sessionId, tenantId).filter(
      (s) => !s.isExcluded
    )
  }
}

async function runTests() {
  console.log("===================================================================")
  console.log("SUITE: persistencia y revisión de fuentes de investigación")
  console.log("===================================================================\n")

  const store = new MockResearchStore()

  console.log("▶ 1. Enriquecimiento del brief con campos de investigación")
  const enrichedBrief: ComposerBrief = {
    topic: "Estrategias de IA en el edge",
    objective: "Evaluar trade-offs entre latencia y costo",
    targetCountry: "España",
    language: "es",
    cutoffDate: "2026-01-01",
    preferredDomains: ["acm.org", "ieee.org"],
    excludedDomains: ["unreliable.info"],
    targetLength: 2000,
    wantsCoverImage: true,
  }

  assert(enrichedBrief.objective === "Evaluar trade-offs entre latencia y costo", "Brief almacena objective")
  assert(enrichedBrief.targetCountry === "España", "Brief almacena targetCountry")
  assert(enrichedBrief.cutoffDate === "2026-01-01", "Brief almacena cutoffDate")
  assert(enrichedBrief.preferredDomains?.includes("acm.org") === true, "Brief almacena preferredDomains")

  console.log("\n▶ 2. Registro de fuentes con trazabilidad y dominios")
  const source1: ComposerSource = {
    id: "src_1",
    sessionId: "sess_abc",
    tenantId: "tenant_1",
    url: "https://ieee.org/papers/edge-ai",
    domain: "ieee.org",
    title: "Edge AI Benchmarks 2026",
    publisher: "IEEE",
    fetchedAt: new Date().toISOString(),
    snippet: "Small models achieve 95% parity on edge NPUs.",
    isExcluded: false,
    claims: [
      {
        text: "Los NPUs reducen el consumo energético en un 40%.",
        status: "confirmed",
      },
    ],
  }

  const source2: ComposerSource = {
    id: "src_2",
    sessionId: "sess_abc",
    tenantId: "tenant_1",
    url: "https://medium.com/@dev/my-thoughts",
    domain: "medium.com",
    title: "Personal blog on edge AI",
    fetchedAt: new Date().toISOString(),
    isExcluded: false,
    claims: [
      {
        text: "Todos los servidores centrales quedarán obsoletos.",
        status: "inferred",
      },
    ],
  }

  store.addSource(source1)
  store.addSource(source2)

  const initialSources = store.listSourcesBySession("sess_abc", "tenant_1")
  assert(initialSources.length === 2, "Recupera las 2 fuentes asociadas a la sesión")
  assert(initialSources[0].domain === "ieee.org", "Fuente 1 tiene dominio extraído")
  assert(initialSources[0].claims[0].status === "confirmed", "Claim 1 tiene status confirmed")

  console.log("\n▶ 3. Descarte / exclusión de fuentes por el usuario")
  store.toggleSourceExclusion("sess_abc", "src_2", "tenant_1", true)
  assert(store.getSource("src_2")?.isExcluded === true, "Fuente 2 marcada como excluida")

  const activeForDrafting = store.getActiveSourcesForDrafting("sess_abc", "tenant_1")
  assert(activeForDrafting.length === 1, "Solo 1 fuente activa para redacción tras descarte")
  assert(activeForDrafting[0].id === "src_1", "La fuente activa es la fuente no descartada")

  // Re-incluir la fuente
  store.toggleSourceExclusion("sess_abc", "src_2", "tenant_1", false)
  assert(store.getSource("src_2")?.isExcluded === false, "Fuente 2 re-incluida con éxito")
  assert(
    store.getActiveSourcesForDrafting("sess_abc", "tenant_1").length === 2,
    "Ambas fuentes activas tras revertir descarte"
  )

  console.log("\n▶ 4. Aislamiento por Tenant")
  let tenantBreachFailed = false
  try {
    store.toggleSourceExclusion("sess_abc", "src_1", "tenant_attacker", true)
  } catch {
    tenantBreachFailed = true
  }
  assert(tenantBreachFailed === true, "Impide a otro tenant modificar o excluir fuentes de la sesión")

  console.log("\n===================================================================")
  console.log(`Resultado: ${totalPassed} pass, ${totalFailed} fail`)
  console.log("===================================================================\n")

  if (totalFailed > 0) {
    console.error("Fallos:", failures.join(", "))
    process.exit(1)
  }
}

runTests().catch((error) => {
  console.error(error)
  process.exit(1)
})
