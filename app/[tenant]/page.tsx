import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getTenantProfile } from "@/lib/application/blog-use-cases"
import { PageContainer } from "@/components/layout"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { generateAuthorJsonLd } from "@/lib/seo/json-ld"
import { constructSiteMetadata } from "@/lib/seo/metadata"
import { SITE_CONFIG } from "@/lib/seo/config"
import { AuthorHeroCover, AuthorProfileHeader } from "@/components/site/authors"
import { AuthorTimeline } from "@/components/site/posts"

interface TenantHomePageProps {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: TenantHomePageProps): Promise<Metadata> {
  const { tenant } = await params
  const data = await getTenantProfile(tenant)
  if (!data) return { title: "Blog no encontrado" }

  const { author } = data

  return constructSiteMetadata({
    title: `${author.name} — Blog`,
    description: author.bio || author.tagline || `Blog personal de ${author.name}`,
    image: author.coverUrl || author.avatarUrl,
    canonicalPath: `/${tenant}`,
    type: "profile",
    location: author.location,
  })
}

export default async function TenantHomePage({ params }: TenantHomePageProps) {
  const { tenant } = await params
  const data = await getTenantProfile(tenant)

  if (!data) {
    notFound()
  }

  const reqHeaders = await headers()
  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true"
  const { author, posts } = data

  const baseUrl = `${SITE_CONFIG.url}/${tenant}`
  const authorJsonLd = generateAuthorJsonLd(author, baseUrl, true)

  return (
    <>
      <JsonLdScript data={authorJsonLd} />

      <div className="w-full">
        <AuthorHeroCover coverUrl={author.coverUrl} />
        <PageContainer size="md">
          <div id="autor">
            <AuthorProfileHeader author={author} postsCount={posts.length} />
          </div>
          <div className="mt-8">
            <AuthorTimeline
              posts={posts}
              authorName={author.name}
              tenantSlug={isSubdomain ? undefined : tenant}
            />
          </div>
        </PageContainer>
      </div>
    </>
  )
}

