/**
 * Multi-Tenancy & Subdomain Utilities
 *
 * Provides helper functions to extract tenant slugs from host headers,
 * identify reserved paths/subdomains, and build URLs for both subdomain mode
 * and route-based friendly URLs.
 */

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "panel",
  "static",
  "assets",
  "mail",
  "cdn",
  "auth",
  "dashboard",
  "blog",
  "status",
  "post",
  "posts",
  "author",
  "autor",
])

export const RESERVED_ROOT_PATHS = new Set([
  "",
  "/",
  "/panel",
  "/api",
  "/iniciar-sesion",
  "/registro",
  "/legal",
  "/explorar",
  "/sign-in",
  "/sign-up",
  "/_next",
  "/favicon.ico",
  "/icon.svg",
  "/placeholder.svg",
  "/robots.txt",
  "/sitemap.xml",
  "/post",
  "/posts",
  "/author",
  "/autor",
])

export function getRootDomain(): string {
  const envDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? process.env.VERCEL_PROJECT_PRODUCTION_URL : "")

  if (envDomain) {
    return envDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")
  }

  return "localhost:3000"
}

/**
 * Checks if a given path is a top-level reserved SaaS platform route.
 */
export function isReservedPath(pathname: string): boolean {
  const normalized = pathname.toLowerCase()
  if (RESERVED_ROOT_PATHS.has(normalized)) return true

  const segments = normalized.split("/").filter(Boolean)
  if (segments.length === 0) return true

  const firstSegment = `/${segments[0]}`
  return (
    RESERVED_ROOT_PATHS.has(firstSegment) ||
    firstSegment.startsWith("/_next") ||
    firstSegment.startsWith("/api") ||
    firstSegment.startsWith("/panel") ||
    firstSegment.startsWith("/legal") ||
    firstSegment.startsWith("/explorar") ||
    firstSegment.startsWith("/post") ||
    firstSegment.startsWith("/posts") ||
    firstSegment.startsWith("/author") ||
    firstSegment.startsWith("/autor") ||
    firstSegment.startsWith("/sign-") ||
    firstSegment.startsWith("/iniciar-") ||
    firstSegment.startsWith("/registro")
  )
}

/**
 * Extracts the tenant slug from an incoming HTTP Host header.
 *
 * Supported formats:
 * - acme.mydomain.com -> "acme"
 * - acme.localhost:3000 -> "acme"
 * - acme.lvh.me:3000 -> "acme"
 * - mydomain.com -> null
 * - localhost:3000 -> null
 */
export function extractTenantFromHost(hostHeader: string | null | undefined): string | null {
  if (!hostHeader) return null

  // Remove port if present
  const hostWithoutPort = hostHeader.split(":")[0].toLowerCase().trim()
  const rootDomain = getRootDomain().split(":")[0].toLowerCase().trim()

  // 1. Direct match with root domain (no subdomain)
  if (hostWithoutPort === rootDomain || hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") {
    return null
  }

  // 2. Localhost subdomain (e.g. acme.localhost or acme.lvh.me)
  if (hostWithoutPort.endsWith(".localhost") || hostWithoutPort.endsWith(".lvh.me")) {
    const parts = hostWithoutPort.split(".")
    const candidate = parts[0]
    if (candidate && !RESERVED_SUBDOMAINS.has(candidate)) {
      return candidate
    }
    return null
  }

  // 3. Production domain subdomain (e.g. acme.mydomain.com)
  if (rootDomain && hostWithoutPort.endsWith(`.${rootDomain}`)) {
    const subdomain = hostWithoutPort.slice(0, -(rootDomain.length + 1))
    // Subdomain could be nested like "foo" or "foo.bar" — take immediate sub
    const parts = subdomain.split(".")
    const candidate = parts[parts.length - 1]
    if (candidate && !RESERVED_SUBDOMAINS.has(candidate)) {
      return candidate
    }
    return null
  }

  // 4. Fallback for 3-part generic domains (e.g. acme.domain.com)
  const hostParts = hostWithoutPort.split(".")
  if (hostParts.length >= 3) {
    const candidate = hostParts[0]
    if (candidate && !RESERVED_SUBDOMAINS.has(candidate)) {
      return candidate
    }
  }

  return null
}

/**
 * Normaliza un host o dominio personalizado a su forma canónica de almacenamiento:
 * sin protocolo, sin puerto, sin barra final, en minúsculas y sin el `www.` inicial.
 *
 * `www.blog.com` y `blog.com` son el mismo dominio para efectos de resolución de
 * tenant; guardarlos como dos valores distintos parte el índice `by_custom_domain`.
 */
export function normalizeCustomDomain(value: string | null | undefined): string | null {
  if (!value) return null

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    .split(":")[0]
    .replace(/^www\./, "")

  if (!normalized || !normalized.includes(".")) return null

  return normalized
}

/**
 * Indica si el dominio raíz está configurado explícitamente en el entorno.
 *
 * `getRootDomain()` cae a "localhost:3000" cuando no hay variable, y ese default es
 * indistinguible de una configuración real. Saberlo importa para no tratar el dominio
 * de producción como si fuera ajeno.
 */
export function isRootDomainConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
      process.env.ROOT_DOMAIN ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL
  )
}

/**
 * Indica si un host pertenece a la propia plataforma — el dominio raíz, cualquiera
 * de sus subdominios, o localhost.
 *
 * Es la guarda que evita salir a buscar un dominio personalizado en la base de datos
 * en cada request del sitio principal.
 *
 * **Falla del lado seguro cuando no hay dominio raíz configurado.** Sin la variable de
 * entorno, `getRootDomain()` devuelve "localhost:3000"; con ese valor, el dominio real
 * de producción NO coincide con la raíz y quedaría clasificado como dominio ajeno, con
 * lo que cada request del sitio principal intentaría resolver un dominio personalizado
 * que no existe. Devolver `true` en ese caso desactiva la resolución de dominios
 * propios hasta que alguien configure la variable — que es exactamente el
 * comportamiento anterior a esta función, y por lo tanto no puede romper nada que hoy
 * funcione.
 */
export function isPlatformHost(hostHeader: string | null | undefined): boolean {
  if (!hostHeader) return true
  if (!isRootDomainConfigured()) return true

  const host = hostHeader.split(":")[0].toLowerCase().trim()
  const rootDomain = getRootDomain().split(":")[0].toLowerCase().trim()

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".lvh.me")
  ) {
    return true
  }

  if (!rootDomain) return true

  return host === rootDomain || host.endsWith(`.${rootDomain}`)
}

export interface BuildTenantUrlOptions {
  tenantSlug: string
  path?: string
  subdomainEnabled?: boolean
  customDomain?: string | null
  absolute?: boolean
  isSubdomainHost?: boolean
}

/**
 * Builds the appropriate public URL for a tenant's blog or post.
 * Respects subdomain configuration, custom domain, and current host context.
 */
export function buildTenantUrl({
  tenantSlug,
  path = "",
  subdomainEnabled = true,
  customDomain = null,
  absolute = false,
  isSubdomainHost = false,
}: BuildTenantUrlOptions): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : ""
  const rootDomain = getRootDomain()
  const isLocal = rootDomain.includes("localhost") || rootDomain.includes("127.0.0.1")
  const protocol = isLocal ? "http" : "https"

  // 1. Custom Domain (e.g. blog.empresa.com)
  if (customDomain) {
    const formattedDomain = customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")
    return `${protocol}://${formattedDomain}${cleanPath}`
  }

  // 2. Subdomain Mode Enabled (e.g. acme.mydomain.com or acme.localhost:3000)
  if (subdomainEnabled) {
    if (absolute) {
      if (isLocal) {
        // e.g. acme.localhost:3000
        const port = rootDomain.includes(":") ? `:${rootDomain.split(":")[1]}` : ":3000"
        return `${protocol}://${tenantSlug}.localhost${port}${cleanPath}`
      }
      return `${protocol}://${tenantSlug}.${rootDomain}${cleanPath}`
    }

    // If we are already rendering inside the subdomain host context, relative link is just /path
    if (isSubdomainHost) {
      return cleanPath || "/"
    }

    // If we need an absolute or root link
    if (isLocal) {
      const port = rootDomain.includes(":") ? `:${rootDomain.split(":")[1]}` : ":3000"
      return `${protocol}://${tenantSlug}.localhost${port}${cleanPath}`
    }
    return `${protocol}://${tenantSlug}.${rootDomain}${cleanPath}`
  }

  // 3. Path Mode (Friendly URL e.g. mydomain.com/acme or /acme/post/slug)
  if (absolute) {
    return `${protocol}://${rootDomain}/${tenantSlug}${cleanPath}`
  }

  return `/${tenantSlug}${cleanPath}`
}

export function buildTenantPostUrl(
  tenantSlug: string,
  postSlug: string,
  options?: Omit<BuildTenantUrlOptions, "tenantSlug" | "path">
): string {
  return buildTenantUrl({
    ...options,
    tenantSlug,
    path: `/posts/${postSlug}`,
  })
}

export function buildTenantAuthorUrl(
  tenantSlug: string,
  authorUsername: string,
  options?: Omit<BuildTenantUrlOptions, "tenantSlug" | "path">
): string {
  return buildTenantUrl({
    ...options,
    tenantSlug,
    path: `/author/${authorUsername}`,
  })
}

export function buildTenantLegalUrl(
  tenantSlug: string,
  legalDoc: string = "",
  options?: Omit<BuildTenantUrlOptions, "tenantSlug" | "path">
): string {
  const cleanDoc = legalDoc.replace(/^\//, "")
  const path = cleanDoc ? `/legal/${cleanDoc}` : "/legal"
  return buildTenantUrl({
    ...options,
    tenantSlug,
    path,
  })
}

