/**
 * Creates or updates the Clerk JWT template required by Convex (aud: "convex").
 *
 * Usage: pnpm setup:clerk-convex
 *
 * Requires CLERK_SECRET_KEY in .env.local (or environment).
 */

import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const CONVEX_TEMPLATE_CLAIMS = {
  aud: "convex",
  name: "{{user.full_name}}",
  email: "{{user.primary_email_address}}",
  picture: "{{user.image_url}}",
  nickname: "{{user.username}}",
  given_name: "{{user.first_name}}",
  family_name: "{{user.last_name}}",
  email_verified: "{{user.email_verified}}",
  updated_at: "{{user.updated_at}}",
  org_id: "{{org.id}}",
  org_role: "{{org.role}}",
  org_slug: "{{org.slug}}",
  org_permissions: "{{org.permissions}}",
}

type JwtTemplate = {
  id: string
  name: string
  claims?: Record<string, unknown>
}

async function clerkFetch<T>(
  secretKey: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`Clerk API ${path} failed (${response.status}): ${body}`)
  }

  return body ? (JSON.parse(body) as T) : ({} as T)
}

async function main(): Promise<void> {
  loadEnvLocal()

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    console.error("Missing CLERK_SECRET_KEY. Add it to .env.local and retry.")
    process.exit(1)
  }

  const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN
  if (!issuer) {
    console.warn(
      "Warning: CLERK_JWT_ISSUER_DOMAIN is not set in .env.local. Set it to your Clerk Frontend API URL."
    )
  }

  const list = await clerkFetch<JwtTemplate[] | { data: JwtTemplate[] }>(
    secretKey,
    "/jwt_templates"
  )
  const templates = Array.isArray(list) ? list : list.data
  const existing = templates.find((t) => t.name === "convex")

  if (existing) {
    await clerkFetch<JwtTemplate>(secretKey, `/jwt_templates/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: "convex",
        claims: CONVEX_TEMPLATE_CLAIMS,
      }),
    })
    console.log('Updated JWT template "convex" with aud: "convex".')
  } else {
    await clerkFetch<JwtTemplate>(secretKey, "/jwt_templates", {
      method: "POST",
      body: JSON.stringify({
        name: "convex",
        claims: CONVEX_TEMPLATE_CLAIMS,
      }),
    })
    console.log('Created JWT template "convex" with aud: "convex".')
  }

  const verify = await clerkFetch<JwtTemplate[] | { data: JwtTemplate[] }>(
    secretKey,
    "/jwt_templates"
  )
  const verified = (Array.isArray(verify) ? verify : verify.data).find(
    (t) => t.name === "convex"
  )
  if (!verified) {
    throw new Error('JWT template "convex" was not found after create/update.')
  }
  console.log(`Verified template id=${verified.id}`)

  console.log("")
  console.log("Next steps:")
  console.log("1. Sign out and sign in again (or refresh session) so Clerk issues a new token.")
  if (issuer) {
    console.log(`2. Verify Convex has CLERK_JWT_ISSUER_DOMAIN=${issuer}`)
    console.log("   Run: npx convex env set CLERK_JWT_ISSUER_DOMAIN " + issuer)
  }
  console.log("3. Open /panel and confirm your profile loads.")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
