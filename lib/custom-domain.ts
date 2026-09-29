import { ConvexHttpClient } from "convex/browser"

import { api } from "@/convex/_generated/api"

import { normalizeCustomDomainHostHeader } from "./custom-domain-policy"

const POSITIVE_TTL_MS = 30 * 1000
const NEGATIVE_TTL_MS = 15 * 1000
const ERROR_TTL_MS = 5 * 1000
const MAX_ENTRIES = 500

interface CacheEntry {
  tenant: string | null
  expiresAt: number
}

interface ResolverOptions {
  lookup: (hostname: string) => Promise<{ username: string } | null>
  now?: () => number
  positiveTtlMs?: number
  negativeTtlMs?: number
  errorTtlMs?: number
}

export function createCustomDomainResolver({
  lookup,
  now = Date.now,
  positiveTtlMs = POSITIVE_TTL_MS,
  negativeTtlMs = NEGATIVE_TTL_MS,
  errorTtlMs = ERROR_TTL_MS,
}: ResolverOptions) {
  const cache = new Map<string, CacheEntry>()

  function writeCache(hostname: string, tenant: string | null, ttl: number, at: number) {
    if (cache.size >= MAX_ENTRIES) {
      const oldest = cache.keys().next()
      if (!oldest.done) cache.delete(oldest.value)
    }
    cache.set(hostname, { tenant, expiresAt: at + ttl })
  }

  async function resolve(hostHeader: string | null | undefined): Promise<string | null> {
    const hostname = normalizeCustomDomainHostHeader(hostHeader)
    if (!hostname) return null

    const at = now()
    const cached = cache.get(hostname)
    if (cached && cached.expiresAt > at) return cached.tenant
    if (cached) cache.delete(hostname)

    try {
      const owner = await lookup(hostname)
      const tenant = owner?.username ?? null
      writeCache(hostname, tenant, tenant ? positiveTtlMs : negativeTtlMs, at)
      return tenant
    } catch {
      // Una caída de Convex no convierte un host no verificado en un tenant.
      writeCache(hostname, null, errorTtlMs, at)
      return null
    }
  }

  return { resolve, clear: () => cache.clear() }
}

const convexDomainResolver = createCustomDomainResolver({
  lookup: async (hostname) => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) return null

    const client = new ConvexHttpClient(convexUrl)
    return await client.query(api.users.getByCustomDomain, { customDomain: hostname })
  },
})

/** Devuelve el slug solo para reclamaciones DNS verificadas y exclusivas. */
export async function resolveTenantByCustomDomain(
  hostHeader: string | null | undefined
): Promise<string | null> {
  return await convexDomainResolver.resolve(hostHeader)
}

/** Vacía la caché local, también usada por las pruebas del TTL. */
export function clearCustomDomainCache(): void {
  convexDomainResolver.clear()
}
