/**
 * Seguridad de la capa OpenAI: cero filtración de secretos y frontera de cliente.
 *
 * Usage:
 *   pnpm tsx scratch/test-ai-security.ts
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { validateAiConfig } from "../convex/lib/ai/config"
import { sanitizeOpenAiError } from "../convex/lib/ai/errors"

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

function collectFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".convex") continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      collectFiles(full, acc)
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      acc.push(full)
    }
  }
  return acc
}

function fileImportsForbidden(filePath: string): string[] {
  const source = readFileSync(filePath, "utf8")
  const hits: string[] = []
  if (/\bfrom\s+["']openai["']/.test(source) || /\brequire\(["']openai["']\)/.test(source)) {
    hits.push("openai")
  }
  if (source.includes("convex/lib/ai/client") || source.includes("convex/lib/ai/openaiClient")) {
    hits.push("convex/lib/ai/client")
  }
  return hits
}

async function runTests() {
  console.log("===================================================================")
  console.log("SUITE: seguridad de la plataforma IA")
  console.log("===================================================================\n")

  console.log("▶ sanitizeOpenAiError redacta secretos")
  const secret = "sk-proj-SUPERSECRETKEYVALUE123456"
  const error = new Error(
    `401 Unauthorized Authorization: Bearer ${secret} api_key=${secret} https://user:pass@api.openai.com/v1/responses`
  )
  const sanitized = sanitizeOpenAiError(error)

  assert(!sanitized.includes(secret), "elimina sk- y Bearer tokens")
  assert(!sanitized.includes("Bearer "), "no deja el prefijo Bearer")
  assert(!sanitized.toLowerCase().includes("user:pass@"), "redacta credenciales en URL")
  assert(/autenticación|OPENAI_API_KEY/i.test(sanitized), "traduce 401 a un mensaje accionable")

  const timeout = sanitizeOpenAiError(new Error("The operation was aborted due to timeout"))
  assert(timeout.includes("tiempo máximo"), "timeout se vuelve un mensaje presentable")

  console.log("\n▶ Health check no filtra la clave")
  const previous = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = secret
  try {
    const report = validateAiConfig()
    const json = JSON.stringify({ report, smoke: { ok: true, model: report.writingModel, requestId: "resp_test" } })
    assert(!json.includes(secret), "JSON de health + smoke no contiene la clave")
    assert(!json.includes("OPENAI_API_KEY"), "JSON no nombra la variable con su valor")
    assert(report.hasApiKey === true, "solo informa presencia de la clave")
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = previous
  }

  console.log("\n▶ Frontera de cliente: app/ y components/ no importan OpenAI")
  const root = process.cwd()
  const clientDirs = ["app", "components"].map((dir) => join(root, dir))
  const leaks: string[] = []

  for (const dir of clientDirs) {
    try {
      for (const file of collectFiles(dir)) {
        const hits = fileImportsForbidden(file)
        if (hits.length > 0) {
          leaks.push(`${relative(root, file)}: ${hits.join(", ")}`)
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    }
  }

  assert(leaks.length === 0, "ningún archivo de app/ o components/ importa openai ni el cliente", leaks.join(" | "))

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
