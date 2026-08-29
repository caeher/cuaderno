import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { resolveTenantByCustomDomain } from "@/lib/custom-domain"
import { extractTenantFromHost, isPlatformHost } from "@/lib/tenant-utils"

const isProtectedRoute = createRouteMatcher(["/panel(.*)"])
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/iniciar-sesion(.*)",
  "/registro(.*)",
  "/__clerk(.*)",
])

/**
 * Rutas que nunca se reescriben bajo el slug de un tenant: assets de Next, API,
 * internos de Clerk y cualquier path con extensión.
 */
function isPassthroughPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/__clerk") ||
    pathname.includes(".")
  )
}

/**
 * Reescribe la request al segmento del tenant, propagando los headers de contexto
 * como headers de REQUEST para que los Server Components los lean con `headers()`.
 */
function rewriteToTenant(
  req: Request & { nextUrl: URL },
  tenantSlug: string,
  hostMode: "subdomain" | "custom"
) {
  const url = req.nextUrl
  const rewriteUrl = new URL(`/${tenantSlug}${url.pathname}${url.search}`, req.url)

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-tenant-slug", tenantSlug)
  // El tenant vive en la raíz del host tanto en subdominio como en dominio propio,
  // así que los enlaces relativos son correctos en ambos casos.
  requestHeaders.set("x-is-subdomain", "true")
  requestHeaders.set("x-tenant-host-mode", hostMode)

  return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  const url = req.nextUrl
  const hostname = req.headers.get("host")

  // Las rutas de autenticación nunca se reescriben bajo un slug de tenant.
  if (isAuthRoute(req)) {
    return NextResponse.next()
  }

  // 1. Subdominio de la plataforma (acme.midominio.com o acme.localhost:3000)
  const tenantSlug = extractTenantFromHost(hostname)
  if (tenantSlug) {
    if (isPassthroughPath(url.pathname)) {
      const response = NextResponse.next()
      response.headers.set("x-tenant-slug", tenantSlug)
      response.headers.set("x-is-subdomain", "true")
      response.headers.set("x-tenant-host-mode", "subdomain")
      return response
    }

    return rewriteToTenant(req, tenantSlug, "subdomain")
  }

  // 2. Dominio personalizado (blog.empresa.com) — issue #12.
  //
  // Solo se consulta si el host NO pertenece a la plataforma: sin esa guarda, cada
  // request del sitio principal saldría a buscar un dominio propio que no existe.
  if (!isPlatformHost(hostname)) {
    const customTenant = await resolveTenantByCustomDomain(hostname)

    if (customTenant) {
      if (isPassthroughPath(url.pathname)) {
        const response = NextResponse.next()
        response.headers.set("x-tenant-slug", customTenant)
        response.headers.set("x-is-subdomain", "true")
        response.headers.set("x-tenant-host-mode", "custom")
        return response
      }

      return rewriteToTenant(req, customTenant, "custom")
    }

    // Host desconocido: no se reescribe. Cae al sitio principal, que responde 404
    // en vez de reventar el middleware.
  }

  // 3. Dominio raíz (midominio.com o localhost:3000)
  const response = NextResponse.next()
  response.headers.set("x-is-subdomain", "false")
  response.headers.set("x-tenant-host-mode", "path")
  return response
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
