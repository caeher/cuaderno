import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getTenantBySlug } from "@/lib/application/blog-use-cases"
import { TenantNavbar, TenantFooter } from "@/components/site"
import { CookieConsentBanner } from "@/components/site/cookie-consent-banner"

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params
  const tenantUser = await getTenantBySlug(tenant)

  if (!tenantUser) {
    notFound()
  }

  const reqHeaders = await headers()
  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true"
  const homeUrl = isSubdomain ? "/" : `/${tenant}`

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <TenantNavbar tenant={tenantUser} homeUrl={homeUrl} />
      <main className="flex-1">{children}</main>
      <TenantFooter tenant={tenantUser} homeUrl={homeUrl} />
      <CookieConsentBanner />
    </div>
  )
}
