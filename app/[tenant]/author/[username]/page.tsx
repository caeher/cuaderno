import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getTenantAuthorProfile, getPublicTenantSeoSettings } from "@/lib/application/blog-use-cases"
import { PageContainer } from "@/components/layout"
import { AuthorHeroCover, AuthorProfileHeader } from "@/components/site/authors"
import { AuthorTimeline } from "@/components/site/posts"
import { buildTenantUrl } from "@/lib/tenant-utils"

interface AuthorPageProps {
  params: Promise<{ tenant: string; username: string }>
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { tenant, username } = await params
  const [data, seo] = await Promise.all([
    getTenantAuthorProfile(tenant, username),
    getPublicTenantSeoSettings(tenant),
  ])
  if (!data) return { title: "Autor no encontrado" }

  const canonicalUrl = buildTenantUrl({
    tenantSlug: tenant,
    path: `/author/${username}`,
    subdomainEnabled: data.tenant.subdomainEnabled ?? true,
    customDomain: data.tenant.customDomain,
    absolute: true,
  })

  return {
    title: seo?.metaTitle || `${data.author.name} · Autor`,
    description: seo?.metaDescription || data.author.bio,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seo?.metaTitle || `${data.author.name} · Autor`,
      description: seo?.metaDescription || data.author.bio,
      url: canonicalUrl,
      images: (seo?.socialSharingImage || data.author.coverUrl)
        ? [{ url: seo?.socialSharingImage || data.author.coverUrl }]
        : undefined,
    },
  }
}

export default async function TenantAuthorPage({ params }: AuthorPageProps) {
  const { tenant, username } = await params
  const data = await getTenantAuthorProfile(tenant, username)
  if (!data) notFound()

  const { author, posts } = data
  const isTenantHost = (await headers()).get("x-is-subdomain") === "true"

  return (
    <div className="w-full">
      <AuthorHeroCover coverUrl={author.coverUrl} />
      <PageContainer size="md">
        <AuthorProfileHeader author={author} postsCount={posts.length} />
        <AuthorTimeline
          posts={posts}
          authorName={author.name}
          tenantSlug={isTenantHost ? undefined : tenant}
          tenantHost={isTenantHost}
        />
      </PageContainer>
    </div>
  )
}
