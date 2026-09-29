import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAuthorProfile } from "@/lib/application/blog-use-cases"
import { getPublicTenantSeoSettings } from "@/lib/application/blog-use-cases"
import { PageContainer } from "@/components/layout"
import { AuthorHeroCover, AuthorProfileHeader } from "@/components/site/authors"
import { AuthorTimeline } from "@/components/site/posts"

interface AuthorPageProps {
  params: Promise<{ tenant: string; username: string }>
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params
  const [data, seo] = await Promise.all([
    getAuthorProfile(username),
    getPublicTenantSeoSettings(username),
  ])
  if (!data) return { title: "Autor no encontrado" }

  return {
    title: seo?.metaTitle || `${data.author.name} · Autor`,
    description: seo?.metaDescription || data.author.bio,
    openGraph: {
      title: seo?.metaTitle || `${data.author.name} · Autor`,
      description: seo?.metaDescription || data.author.bio,
      images: (seo?.socialSharingImage || data.author.coverUrl)
        ? [{ url: seo?.socialSharingImage || data.author.coverUrl }]
        : undefined,
    },
  }
}

export default async function TenantAuthorPage({ params }: AuthorPageProps) {
  const { username } = await params
  const data = await getAuthorProfile(username)
  if (!data) notFound()

  const { author, posts } = data

  return (
    <div className="w-full">
      <AuthorHeroCover coverUrl={author.coverUrl} />
      <PageContainer size="md">
        <AuthorProfileHeader author={author} postsCount={posts.length} />
        <AuthorTimeline posts={posts} authorName={author.name} />
      </PageContainer>
    </div>
  )
}
