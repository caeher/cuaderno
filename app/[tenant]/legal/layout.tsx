import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getTenantBySlug } from "@/lib/application/blog-use-cases"
import { PageContainer } from "@/components/layout"
import { TenantLegalNav } from "@/components/site"

interface TenantLegalLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLegalLayout({ children, params }: TenantLegalLayoutProps) {
  const { tenant } = await params
  const tenantUser = await getTenantBySlug(tenant)

  if (!tenantUser) {
    notFound()
  }

  const reqHeaders = await headers()
  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true"
  const baseLegalUrl = isSubdomain ? "/legal" : `/${tenant}/legal`

  return (
    <PageContainer size="lg" className="py-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
        <TenantLegalNav tenant={tenantUser} baseLegalUrl={baseLegalUrl} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </PageContainer>
  )
}
