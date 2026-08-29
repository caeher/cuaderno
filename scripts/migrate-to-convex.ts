import { execSync } from "node:child_process"
import { exportMigrationData } from "./migration/exporter"
import { writeMigrationReport, type ConvexMigrationStats } from "./migration/reconciler"
import { chunkArray, normalizeMigrationBundle } from "./migration/transformer"
import type { MigrationSource } from "./migration/types"

function parseArgs(argv: string[]) {
  const source = (argv.find((arg) => arg.startsWith("--source="))?.split("=")[1] ||
    "mock") as MigrationSource
  const sqlitePath = argv.find((arg) => arg.startsWith("--sqlite-path="))?.split("=")[1]
  const jsonPath = argv.find((arg) => arg.startsWith("--json-path="))?.split("=")[1]
  const dryRun = argv.includes("--dry-run")
  return { source, sqlitePath, jsonPath, dryRun }
}

function runConvex(functionName: string, args: unknown) {
  const payload = JSON.stringify(args).replace(/'/g, "'\\''")
  execSync(`npx convex run ${functionName} '${payload}'`, {
    stdio: "inherit",
    encoding: "utf8",
  })
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  console.log(`📦 Exportando datos desde fuente: ${options.source}`)
  const exported = normalizeMigrationBundle(
    exportMigrationData({
      source: options.source,
      sqlitePath: options.sqlitePath,
      jsonPath: options.jsonPath,
    })
  )

  if (options.dryRun) {
    console.log("🔍 Dry run — recuentos de origen:")
    console.log({
      users: exported.users.length,
      categories: exported.categories.length,
      tags: exported.tags.length,
      posts: exported.posts.length,
      comments: exported.comments.length,
      templates: exported.templates.length,
      revisions: exported.revisions.length,
    })
    return
  }

  console.log("⬆️  Importando usuarios...")
  for (const batch of chunkArray(exported.users)) {
    runConvex("migration:importUsersBatch", { users: batch })
  }

  console.log("⬆️  Importando categorías...")
  for (const batch of chunkArray(exported.categories)) {
    runConvex("migration:importCategoriesBatch", { categories: batch })
  }

  console.log("⬆️  Importando etiquetas...")
  for (const batch of chunkArray(exported.tags)) {
    runConvex("migration:importTagsBatch", { tags: batch })
  }

  console.log("⬆️  Importando publicaciones...")
  for (const batch of chunkArray(exported.posts)) {
    runConvex("migration:importPostsBatch", { posts: batch })
  }

  console.log("⬆️  Importando plantillas...")
  for (const batch of chunkArray(exported.templates, 10)) {
    const revisions = exported.revisions.filter((revision) =>
      batch.some((template) => template.legacyId === revision.templateId)
    )
    runConvex("migration:importTemplatesBatch", {
      templates: batch,
      revisions,
    })
  }

  if (exported.templates.length === 0 && exported.revisions.length > 0) {
    runConvex("migration:importTemplatesBatch", {
      templates: [],
      revisions: exported.revisions,
    })
  }

  console.log("⬆️  Importando comentarios...")
  for (const batch of chunkArray(exported.comments)) {
    runConvex("migration:importCommentsBatch", { comments: batch })
  }

  console.log("🔁 Conciliando contadores...")
  runConvex("migration:reconcileCounters", {})

  console.log("📊 Obteniendo estadísticas de Convex...")
  const statsOutput = execSync(`npx convex run migration:getMigrationStats '{}'`, {
    encoding: "utf8",
  })
  const destination = JSON.parse(statsOutput) as ConvexMigrationStats

  const report = writeMigrationReport({ source: exported, destination })
  console.log(`📝 Informe generado en ${report.path}`)
  console.log(report.passed ? "✅ Migración reconciliada" : "❌ Migración con discrepancias")

  if (!report.passed) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("Error en migración:", error)
  process.exit(1)
})
