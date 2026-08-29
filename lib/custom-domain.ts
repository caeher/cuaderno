/**
 * Resolución de dominios personalizados — issue #12.
 *
 * El middleware necesita mapear un host arbitrario (`blog.empresa.com`) al slug del
 * tenant que lo reclamó. Ese dato vive en Convex (`users.customDomain`, índice
 * `by_custom_domain`), así que la resolución es una llamada de red.
 *
 * Dos decisiones que explican el diseño de este archivo:
 *
 * 1. **Caché en memoria, obligatoria.** Sin ella cada request de cada blog con dominio
 *    propio pagaría un round-trip extra antes de renderizar. La caché vive en el
 *    módulo, así que es por instancia del runtime y se pierde en frío — es un acelerador,
 *    no una fuente de verdad.
 *
 * 2. **Se cachean también los fallos.** Un host desconocido que no se cachea convierte
 *    cualquier tráfico de bots hacia dominios inexistentes en una consulta por request.
 *    El TTL negativo es más corto para que un dominio recién configurado empiece a
 *    funcionar en un minuto y no en cinco.
 *
 * Ante cualquier error se falla ABIERTO: se devuelve `null` y el middleware trata el
 * host como si fuera de la plataforma. Un blog que no resuelve es un 404; una excepción
 * en el middleware es un 500 en todo el sitio.
 *
 * **Por qué NO usa `lib/infrastructure/convex/client.ts`:** ese helper resuelve un JWT
 * de Clerk con `auth()` y consulta con `fetchQuery` de `convex/nextjs`, que asumen el
 * contexto de un Server Component o Route Handler. Este código corre en el middleware,
 * antes de ese contexto y sin sesión — la consulta es deliberadamente anónima y por eso
 * `users.getByCustomDomain` devuelve una proyección mínima. No lo refactorices para
 * reutilizar aquel cliente.
 */

import { ConvexHttpClient } from "convex/browser"

import { api } from "@/convex/_generated/api"

import { normalizeCustomDomain } from "./tenant-utils"

const POSITIVE_TTL_MS = 5 * 60 * 1000
const NEGATIVE_TTL_MS = 60 * 1000
const MAX_ENTRIES = 500

interface CacheEntry {
  tenant: string | null
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

function readCache(domain: string, now: number): CacheEntry | undefined {
  const entry = cache.get(domain)
  if (!entry) return undefined

  if (entry.expiresAt <= now) {
    cache.delete(domain)
    return undefined
  }

  return entry
}

function writeCache(domain: string, tenant: string | null, now: number): void {
  // Descarte simple por inserción: alcanza para acotar la memoria del isolate sin
  // pagar la contabilidad de un LRU real.
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next()
    if (!oldest.done) cache.delete(oldest.value)
  }

  cache.set(domain, {
    tenant,
    expiresAt: now + (tenant ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS),
  })
}

/**
 * Devuelve el slug del tenant dueño de este host, o `null` si el host no corresponde
 * a ningún dominio personalizado configurado.
 */
export async function resolveTenantByCustomDomain(
  hostHeader: string | null | undefined
): Promise<string | null> {
  const domain = normalizeCustomDomain(hostHeader)
  if (!domain) return null

  const now = Date.now()

  const cached = readCache(domain, now)
  if (cached) return cached.tenant

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    // Sin backend configurado no hay nada que resolver; no es un error del request.
    return null
  }

  try {
    const client = new ConvexHttpClient(convexUrl)
    const owner = await client.query(api.users.getByCustomDomain, {
      customDomain: domain,
    })

    const tenant = owner?.username ?? null
    writeCache(domain, tenant, now)
    return tenant
  } catch {
    // Fallo abierto: se cachea negativo por poco tiempo para no reintentar en bucle
    // si Convex está caído, y el middleware sigue como si fuera un host de plataforma.
    writeCache(domain, null, now)
    return null
  }
}

/** Vacía la caché. Existe para las pruebas y para una futura invalidación explícita. */
export function clearCustomDomainCache(): void {
  cache.clear()
}
