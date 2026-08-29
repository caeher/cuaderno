import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostForReading } from "@/lib/application/blog-use-cases"
import { userRepository } from "@/lib/infrastructure/repositories"
import { ArticleContainer } from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { generateArticleJsonLd, generateBreadcrumbsJsonLd } from "@/lib/seo/json-ld"
import { constructSiteMetadata } from "@/lib/seo/metadata"
import {
  PostHeader,
  PostCoverImage,
  PostContent,
  PostActionBar,
  PostKeyTakeaways,
  RelatedPostsSection,
} from "@/components/site/posts"
import { AuthorBioCard } from "@/components/site/authors"
import { PostCommentsSection } from "@/components/site/comments"

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getPostForReading(slug)
  if (!data) return { title: "Post no encontrado" }

  const { post, author } = data

  return constructSiteMetadata({
    title: post.title,
    description: post.excerpt || `Lee ${post.title} por ${author.name} en Cuaderno.`,
    image: post.coverUrl,
    canonicalPath: `/post/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [author.name],
    tags: post.tags,
    location: author.location,
  })
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const data = await getPostForReading(slug)
  if (!data) notFound()

  const { post, author, comments, relatedPosts } = data
  const allAuthors = await userRepository.findAll()
  const authorMap = new Map(allAuthors.map((u) => [u.id, u]))

  const articleJsonLd = generateArticleJsonLd(post, author)
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Explorar", url: "/explorar" },
    ...(post.category
      ? [{ name: post.category.name, url: `/explorar?category=${post.category.slug}` }]
      : []),
    { name: post.title, url: `/post/${post.slug}` },
  ])

  return (
    <>
      <JsonLdScript data={articleJsonLd} />
      <JsonLdScript data={breadcrumbsJsonLd} />

      <ArticleContainer>
        <article itemScope itemType="https://schema.org/BlogPosting">
          <PostHeader post={post} author={author} />
          <PostCoverImage coverUrl={post.coverUrl} />
          
          {/* GEO & AI Direct Answer / Executive Summary */}
          <PostKeyTakeaways
            excerpt={post.excerpt}
            content={post.content}
            readingTimeMinutes={post.readingTimeMinutes}
          />

          <div className="mt-8">
            <PostContent content={post.content} />
          </div>

          <PostActionBar
            likes={post.likes}
            commentsCount={post.comments}
            postTitle={post.title}
          />
        </article>

        <Separator className="my-10" />
        <AuthorBioCard author={author} />
        <PostCommentsSection comments={comments} postId={post.id} postSlug={post.slug} />
        <RelatedPostsSection posts={relatedPosts} authorMap={authorMap} />
      </ArticleContainer>
    </>
  )
}

