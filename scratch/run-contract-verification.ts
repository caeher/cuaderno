import {
  createRepositories,
  userRepository,
  categoryRepository,
  postRepository,
  tagRepository,
  commentRepository,
  templateRepository,
} from "../lib/infrastructure/repositories"
import { runConvexAuthAndSecurityTests } from "./contract-tests/convex-handler-tests"
import { runRepositoryContractSuite } from "./contract-tests/repository-contract-suite"

const shouldRunLiveConvexTests =
  Boolean(process.env.NEXT_PUBLIC_CONVEX_URL) &&
  process.env.CONVEX_RUN_LIVE_CONTRACTS === "1"

async function main() {
  console.log("===================================================================")
  console.log("🚀 EJECUTANDO SUITE COMPLETA DE VERIFICACIÓN CONVEX Y SEGURIDAD")
  console.log("===================================================================\n")

  let grandTotalPassed = 0
  let grandTotalFailed = 0

  // 1. Pruebas de Autorización y Seguridad Convex
  const securityResults = await runConvexAuthAndSecurityTests()
  grandTotalPassed += securityResults.totalPassed
  grandTotalFailed += securityResults.totalFailed

  // 2. Verificación de Instanciación de Repositorios Convex
  console.log("==================================================")
  console.log("⚙️  VERIFICANDO REPOSITORIOS CONVEX (repositories.ts)")
  console.log("==================================================")

  const repos = createRepositories()
  if (
    repos.userRepository &&
    repos.categoryRepository &&
    repos.postRepository &&
    repos.tagRepository &&
    repos.commentRepository &&
    repos.templateRepository
  ) {
    console.log("  ✅ createRepositories() instancia los 6 repositorios Convex correctamente")
    grandTotalPassed++
  } else {
    console.error("  ❌ createRepositories() falló al instanciar repositorios")
    grandTotalFailed++
  }

  if (
    userRepository &&
    categoryRepository &&
    postRepository &&
    tagRepository &&
    commentRepository &&
    templateRepository
  ) {
    console.log("  ✅ Singletons de repositorios exportados correctamente")
    grandTotalPassed++
  } else {
    console.error("  ❌ Singletons de repositorios no exportados")
    grandTotalFailed++
  }

  if (shouldRunLiveConvexTests) {
    console.log("\n==================================================")
    console.log("🧪 EJECUTANDO CONTRATOS CRUD CONTRA CONVEX EN VIVO")
    console.log("==================================================")
    const contractResults = await runRepositoryContractSuite("ConvexLive", createRepositories())
    grandTotalPassed += contractResults.totalPassed
    grandTotalFailed += contractResults.totalFailed
  } else {
    console.log(
      "\n  ⏭️  Contratos CRUD omitidos: define NEXT_PUBLIC_CONVEX_URL y CONVEX_RUN_LIVE_CONTRACTS=1"
    )
  }

  console.log("\n===================================================================")
  console.log(`🏁 RESUMEN GENERAL: ${grandTotalPassed} PASARON | ${grandTotalFailed} FALLARON`)
  console.log("===================================================================")

  if (grandTotalFailed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Error fatal en el runner de verificación:", err)
  process.exit(1)
})

