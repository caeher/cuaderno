import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getTenantBySlug, getPublishedTemplateForTenant } from "@/lib/application/blog-use-cases"
import { TenantNavbar, TenantFooter, TenantSlotRenderer } from "@/components/site"
import { CookieConsentBanner } from "@/components/site/cookie-consent-banner"
import type { GlobalTemplateContext } from "@/lib/domain/template-schema"

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

  const [reqHeaders, publishedTemplate] = await Promise.all([
    headers(),
    getPublishedTemplateForTenant(tenantUser.id),
  ])

  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true"
  const homeUrl = isSubdomain ? "/" : `/${tenant}`

  const globalContext: GlobalTemplateContext = {
    tenant: tenantUser,
    homeUrl,
    isSubdomain,
    siteTitle: `${tenantUser.name} — Blog`,
    siteDescription: tenantUser.bio || tenantUser.tagline,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <TenantSlotRenderer
        slotType="header"
        template={publishedTemplate}
        context={globalContext}
        fallback={<TenantNavbar tenant={tenantUser} homeUrl={homeUrl} />}
      />
      <main className="flex-1">{children}</main>
      <TenantSlotRenderer
        slotType="footer"
        template={publishedTemplate}
        context={globalContext}
        fallback={<TenantFooter tenant={tenantUser} homeUrl={homeUrl} />}
      />
      <CookieConsentBanner />
    </div>
  )
}

