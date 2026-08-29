import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAuthorProfile } from "@/lib/application/blog-use-cases"
import { PageContainer } from "@/components/layout"
import { AuthorHeroCover, AuthorProfileHeader } from "@/components/site/authors"
import { AuthorTimeline } from "@/components/site/posts"

interface AuthorPageProps {
  params: Promise<{ tenant: string; username: string }>
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params
  const data = await getAuthorProfile(username)
  if (!data) return { title: "Autor no encontrado" }

  return {
    title: `${data.author.name} · Autor`,
    description: data.author.bio,
    openGraph: {
      title: `${data.author.name} · Autor`,
      description: data.author.bio,
      images: data.author.coverUrl ? [{ url: data.author.coverUrl }] : undefined,
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
