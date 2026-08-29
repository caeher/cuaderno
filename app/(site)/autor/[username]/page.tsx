import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAuthorProfile } from "@/lib/application/blog-use-cases"
import { PageContainer } from "@/components/layout"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { generateAuthorJsonLd, generateBreadcrumbsJsonLd } from "@/lib/seo/json-ld"
import { constructSiteMetadata } from "@/lib/seo/metadata"
import { AuthorHeroCover, AuthorProfileHeader } from "@/components/site/authors"
import { AuthorTimeline } from "@/components/site/posts"

interface AuthorPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params
  const data = await getAuthorProfile(username)
  if (!data) return { title: "Autor no encontrado" }

  const { author } = data

  return constructSiteMetadata({
    title: `${author.name} — Perfil de autor`,
    description: author.bio || author.tagline || `Artículos y notas de ${author.name} en Cuaderno.`,
    image: author.coverUrl || author.avatarUrl,
    canonicalPath: `/autor/${author.username}`,
    type: "profile",
    location: author.location,
  })
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params
  const data = await getAuthorProfile(username)
  if (!data) notFound()

  const { author, posts } = data

  const authorJsonLd = generateAuthorJsonLd(author)
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Autores", url: "/explorar" },
    { name: author.name, url: `/autor/${author.username}` },
  ])

  return (
    <>
      <JsonLdScript data={authorJsonLd} />
      <JsonLdScript data={breadcrumbsJsonLd} />

      <div className="w-full">
        <AuthorHeroCover coverUrl={author.coverUrl} />
        <PageContainer size="md">
          <AuthorProfileHeader author={author} postsCount={posts.length} />
          <AuthorTimeline posts={posts} authorName={author.name} />
        </PageContainer>
      </div>
    </>
  )
}

