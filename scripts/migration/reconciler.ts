import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import type { MigrationExportBundle } from "./types"

export interface ConvexMigrationStats {
  totals: {
    users: number
    categories: number
    tags: number
    posts: number
    comments: number
    tenantTemplates: number
    tenantTemplateRevisions: number
  }
  orphans: {
    postsWithoutAuthor: number
    postsWithoutCategory: number
    commentsWithoutPost: number
    revisionsWithoutTemplate: number
  }
}

export interface ReconciliationRow {
  entity: string
  sourceCount: number
  destinationCount: number
  difference: number
  status: "PASS" | "FAIL"
}

export function buildReconciliationRows(
  source: MigrationExportBundle,
  destination: ConvexMigrationStats
): ReconciliationRow[] {
  const rows: ReconciliationRow[] = [
    {
      entity: "Usuarios",
      sourceCount: source.users.length,
      destinationCount: destination.totals.users,
      difference: destination.totals.users - source.users.length,
      status: destination.totals.users === source.users.length ? "PASS" : "FAIL",
    },
    {
      entity: "Categorías",
      sourceCount: source.categories.length,
      destinationCount: destination.totals.categories,
      difference: destination.totals.categories - source.categories.length,
      status: destination.totals.categories === source.categories.length ? "PASS" : "FAIL",
    },
    {
      entity: "Etiquetas (Tags)",
      sourceCount: source.tags.length,
      destinationCount: destination.totals.tags,
      difference: destination.totals.tags - source.tags.length,
      status: destination.totals.tags === source.tags.length ? "PASS" : "FAIL",
    },
    {
      entity: "Publicaciones (Posts)",
      sourceCount: source.posts.length,
      destinationCount: destination.totals.posts,
      difference: destination.totals.posts - source.posts.length,
      status: destination.totals.posts === source.posts.length ? "PASS" : "FAIL",
    },
    {
      entity: "Comentarios",
      sourceCount: source.comments.length,
      destinationCount: destination.totals.comments,
      difference: destination.totals.comments - source.comments.length,
      status: destination.totals.comments === source.comments.length ? "PASS" : "FAIL",
    },
    {
      entity: "Plantillas de Tenant",
      sourceCount: source.templates.length,
      destinationCount: destination.totals.tenantTemplates,
      difference: destination.totals.tenantTemplates - source.templates.length,
      status:
        destination.totals.tenantTemplates === source.templates.length ? "PASS" : "FAIL",
    },
    {
      entity: "Revisiones de Plantilla",
      sourceCount: source.revisions.length,
      destinationCount: destination.totals.tenantTemplateRevisions,
      difference:
        destination.totals.tenantTemplateRevisions - source.revisions.length,
      status:
        destination.totals.tenantTemplateRevisions === source.revisions.length
          ? "PASS"
          : "FAIL",
    },
  ]

  return rows
}

export function writeMigrationReport(options: {
  source: MigrationExportBundle
  destination: ConvexMigrationStats
  outputDir?: string
}): { path: string; passed: boolean } {
  const rows = buildReconciliationRows(options.source, options.destination)
  const passed = rows.every((row) => row.status === "PASS")
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const outputDir = resolve(options.outputDir || "docs/reports")
  mkdirSync(outputDir, { recursive: true })
  const reportPath = resolve(outputDir, `migration-report-${timestamp}.md`)

  const table = rows
    .map(
      (row) =>
        `| **${row.entity}** | ${row.sourceCount} | ${row.destinationCount} | ${row.difference} | ${row.status === "PASS" ? "✅ Exacto" : "❌ Diferencia"} |`
    )
    .join("\n")

  const content = `# Informe de Reconciliación y Auditoría de Migración

- **Fecha de Ejecución**: ${new Date().toISOString()}
- **Fuente de Origen**: ${options.source.source.toUpperCase()}
- **Estado General**: **${passed ? "PASSED" : "FAILED"}**

---

## 1. Resumen Cuantitativo de Tablas vs Colecciones

| Entidad | Conteo Origen | Conteo Destino (Convex) | Diferencia | Estado |
| :--- | :---: | :---: | :---: | :---: |
${table}

---

## 2. Integridad Referencial y Huérfanos

- **Posts sin Autor resuelto**: ${options.destination.orphans.postsWithoutAuthor}
- **Posts sin Categoría resuelta**: ${options.destination.orphans.postsWithoutCategory}
- **Comentarios sin Post resuelto**: ${options.destination.orphans.commentsWithoutPost}
- **Revisiones sin Plantilla resuelta**: ${options.destination.orphans.revisionsWithoutTemplate}

---

## 3. Conclusión

${passed ? "✅ **APROBADO**: Los recuentos coinciden con el origen." : "❌ **RECHAZADO**: Existen discrepancias que requieren revisión."}
`

  writeFileSync(reportPath, content, "utf8")
  return { path: reportPath, passed }
}
