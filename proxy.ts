import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { extractTenantFromHost } from "@/lib/tenant-utils"

export default clerkMiddleware(async (_auth, req) => {
  const url = req.nextUrl
  const hostname = req.headers.get("host")
  const tenantSlug = extractTenantFromHost(hostname)

  // 1. Subdomain Request (e.g. {slug}.mydomain.com or {slug}.localhost:3000)
  if (tenantSlug) {
    // Allow static files, api routes, and clerk internal paths to pass through
    if (
      url.pathname.startsWith("/_next") ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/__clerk") ||
      url.pathname.includes(".")
    ) {
      const response = NextResponse.next()
      response.headers.set("x-tenant-slug", tenantSlug)
      response.headers.set("x-is-subdomain", "true")
      return response
    }

    // Rewrite internally: e.g. "acme.mydomain.com/post/slug" -> "/acme/post/slug"
    // The user's browser URL remains "acme.mydomain.com/post/slug"
    const rewriteUrl = new URL(`/${tenantSlug}${url.pathname}${url.search}`, req.url)
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-tenant-slug", tenantSlug)
    requestHeaders.set("x-is-subdomain", "true")

    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    })
  }

  // 2. Root Domain Request (e.g. mydomain.com or localhost:3000)
  // Normal routing handles /, /explorar, /panel, and /{slug}/...
  const response = NextResponse.next()
  response.headers.set("x-is-subdomain", "false")
  return response
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
