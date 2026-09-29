import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import {
  getPostForReadingByTenant,
  getPublishedTemplateForTenantSlug,
  getPublicTenantSeoSettings,
} from "@/lib/application/blog-use-cases"
import { ArticleContainer } from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { generateArticleJsonLd, generateBreadcrumbsJsonLd } from "@/lib/seo/json-ld"
import { constructSiteMetadata } from "@/lib/seo/metadata"
import { SITE_CONFIG } from "@/lib/seo/config"
import { buildTenantPostUrl, buildTenantUrl } from "@/lib/tenant-utils"
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
  const [data, seo] = await Promise.all([
    getPostForReadingByTenant(tenant, slug),
    getPublicTenantSeoSettings(tenant),
  ])
  if (!data) return { title: "Artículo no encontrado" }

  const { post, author, tenant: tenantAuthor } = data
  const tenantBaseUrl = buildTenantUrl({
    tenantSlug: tenant,
    subdomainEnabled: tenantAuthor.subdomainEnabled ?? true,
    customDomain: tenantAuthor.customDomain,
    absolute: true,
  })
  const canonicalPostUrl = buildTenantPostUrl(tenant, post.slug, {
    subdomainEnabled: tenantAuthor.subdomainEnabled ?? true,
    customDomain: tenantAuthor.customDomain,
    absolute: true,
  })

  return constructSiteMetadata({
    title: seo?.metaTitle || `${post.title} · ${tenantAuthor.name}`,
    description: seo?.metaDescription || post.excerpt || `Lee ${post.title} en el blog de ${tenantAuthor.name}.`,
    image: seo?.socialSharingImage || post.coverUrl || tenantAuthor.coverUrl,
    canonicalPath: canonicalPostUrl,
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
  const isTenantHost = reqHeaders.get("x-is-subdomain") === "true"

  const { post, author, tenant: tenantAuthor, comments, relatedPosts } = data
  const publishedTemplate = await getPublishedTemplateForTenantSlug(tenant)

  const tenantBaseUrl = buildTenantUrl({
    tenantSlug: tenant,
    subdomainEnabled: tenantAuthor.subdomainEnabled ?? true,
    customDomain: tenantAuthor.customDomain,
    absolute: true,
  })
  const canonicalPostUrl = buildTenantPostUrl(tenant, post.slug, {
    subdomainEnabled: tenantAuthor.subdomainEnabled ?? true,
    customDomain: tenantAuthor.customDomain,
    absolute: true,
  })
  const articleJsonLd = generateArticleJsonLd(post, author, tenantBaseUrl, true, {
    blogName: `${tenantAuthor.name} — Blog`,
    tenantUsername: tenantAuthor.username,
  })
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: tenantAuthor.name, url: tenantBaseUrl },
    ...(post.category
      ? [{ name: post.category.name, url: `${SITE_CONFIG.url}/explorar?category=${post.category.slug}` }]
      : []),
    { name: post.title, url: canonicalPostUrl },
  ])

  const postContext: PostSlotContext = {
    tenant: tenantAuthor,
    homeUrl: isTenantHost ? "/" : `/${tenant}`,
    isSubdomain: isTenantHost,
    siteTitle: `${tenantAuthor.name} — Blog`,
    siteDescription: tenantAuthor.bio || tenantAuthor.tagline,
    post,
    author,
    comments,
    relatedPosts,
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
      <RelatedPostsSection posts={relatedPosts} tenant={tenantAuthor} />
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
