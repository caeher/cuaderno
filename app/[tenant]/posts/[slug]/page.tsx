import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostForReadingByTenant } from "@/lib/application/blog-use-cases"
import { userRepository } from "@/lib/infrastructure/repositories"
import { ArticleContainer } from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import {
  PostHeader,
  PostCoverImage,
  PostContent,
  PostActionBar,
  RelatedPostsSection,
} from "@/components/site/posts"
import { AuthorBioCard } from "@/components/site/authors"
import { PostCommentsSection } from "@/components/site/comments"

interface TenantPostPageProps {
  params: Promise<{ tenant: string; slug: string }>
}

export async function generateMetadata({ params }: TenantPostPageProps): Promise<Metadata> {
  const { tenant, slug } = await params
  const data = await getPostForReadingByTenant(tenant, slug)
  if (!data) return { title: "Artículo no encontrado" }

  return {
    title: `${data.post.title} · ${data.author.name}`,
    description: data.post.excerpt,
    openGraph: {
      title: data.post.title,
      description: data.post.excerpt,
      images: data.post.coverUrl ? [{ url: data.post.coverUrl }] : undefined,
    },
  }
}

export default async function TenantPostPage({ params }: TenantPostPageProps) {
  const { tenant, slug } = await params
  const data = await getPostForReadingByTenant(tenant, slug)

  if (!data) {
    notFound()
  }

  const { post, author, comments, relatedPosts } = data
  const allAuthors = await userRepository.findAll()
  const authorMap = new Map(allAuthors.map((u) => [u.id, u]))

  return (
    <ArticleContainer>
      <PostHeader post={post} author={author} />
      <PostCoverImage coverUrl={post.coverUrl} />
      <div className="mt-10">
        <PostContent content={post.content} />
      </div>
      <PostActionBar
        likes={post.likes}
        commentsCount={post.comments}
        postTitle={post.title}
      />
      <Separator className="my-10" />
      <AuthorBioCard author={author} />
      <PostCommentsSection comments={comments} postId={post.id} postSlug={post.slug} />
      <RelatedPostsSection posts={relatedPosts} authorMap={authorMap} />
    </ArticleContainer>
  )
}
