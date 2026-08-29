import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import {
  getPostForReadingByTenant,
  getPublishedTemplateForTenant,
} from "@/lib/application/blog-use-cases"
import { userRepository } from "@/lib/infrastructure/repositories"
import { ArticleContainer } from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { generateArticleJsonLd, generateBreadcrumbsJsonLd } from "@/lib/seo/json-ld"
import { constructSiteMetadata } from "@/lib/seo/metadata"
import { SITE_CONFIG } from "@/lib/seo/config"
import {
  PostHeader,
  PostCoverImage,
  PostContent,
  PostActionBar,
  PostKeyTakeaways,
  PostAudioPlayer,
  RelatedPostsSection,
} from "@/components/site/posts"
import { AuthorBioCard } from "@/components/site/authors"
import { PostCommentsSection } from "@/components/site/comments"
import { TenantSlotRenderer } from "@/components/site/tenant-slot-renderer"
import type { PostSlotContext } from "@/lib/domain/template-schema"

interface TenantPostPageProps {
  params: Promise<{ tenant: string; slug: string }>
}

export async function generateMetadata({ params }: TenantPostPageProps): Promise<Metadata> {
  const { tenant, slug } = await params
  const data = await getPostForReadingByTenant(tenant, slug)
  if (!data) return { title: "Artículo no encontrado" }

  const { post, author } = data

  return constructSiteMetadata({
    title: `${post.title} · ${author.name}`,
    description: post.excerpt || `Lee ${post.title} por ${author.name} en su blog.`,
    image: post.coverUrl,
    canonicalPath: `/${tenant}/post/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [author.name],
    tags: post.tags,
    location: author.location,
  })
}

export default async function TenantPostPage({ params }: TenantPostPageProps) {
  const { tenant, slug } = await params
  const data = await getPostForReadingByTenant(tenant, slug)

  if (!data) {
    notFound()
  }

  const reqHeaders = await headers()
  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true"

  const { post, author, comments, relatedPosts } = data
  const [allAuthors, publishedTemplate] = await Promise.all([
    userRepository.findAll(),
    getPublishedTemplateForTenant(author.id),
  ])
  const authorMap = new Map(allAuthors.map((u) => [u.id, u]))

  const baseUrl = `${SITE_CONFIG.url}/${tenant}`
  const articleJsonLd = generateArticleJsonLd(post, author, baseUrl, true)
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: author.name, url: isSubdomain ? "/" : `/${tenant}` },
    ...(post.category
      ? [{ name: post.category.name, url: `/explorar?category=${post.category.slug}` }]
      : []),
    { name: post.title, url: isSubdomain ? `/post/${post.slug}` : `/${tenant}/post/${post.slug}` },
  ])

  const postContext: PostSlotContext = {
    tenant: author,
    homeUrl: isSubdomain ? "/" : `/${tenant}`,
    isSubdomain,
    siteTitle: `${author.name} — Blog`,
    siteDescription: author.bio || author.tagline,
    post,
    author,
    comments,
    relatedPosts,
    authorMap,
  }

  const classicFallback = (
    <ArticleContainer>
      <article itemScope itemType="https://schema.org/BlogPosting">
        <PostHeader post={post} author={author} />
        <PostCoverImage coverUrl={post.coverUrl} />

        {/* Voice Narration Audio Player (only renders when ready) */}
        <PostAudioPlayer
          narration={post.narration}
          postTitle={post.title}
          postSlug={post.slug}
        />

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
  )

  return (
    <>
      <JsonLdScript data={articleJsonLd} />
      <JsonLdScript data={breadcrumbsJsonLd} />

      <TenantSlotRenderer
        slotType="post"
        template={publishedTemplate}
        context={postContext}
        fallback={classicFallback}
      />
    </>
  )
}


