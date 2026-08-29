/**
 * Schema.org JSON-LD Structured Data Generators
 *
 * Provides typed, search-engine and AI-crawler compatible JSON-LD schemas
 * adhering to schema.org specifications for BlogPosting, Person, WebSite,
 * Organization, and BreadcrumbList.
 */

import type { Post, User } from "@/lib/domain/entities"
import { resolveGeoLocation, SITE_CONFIG } from "./config"

export interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * Generates Schema.org `BlogPosting` structured data for articles
 */
export function generateArticleJsonLd(
  post: Post,
  author: User,
  baseUrl: string = SITE_CONFIG.url,
  isTenant = false
) {
  const postUrl = isTenant
    ? `${baseUrl}/post/${post.slug}`
    : `${baseUrl}/post/${post.slug}`

  const authorUrl = isTenant
    ? `${baseUrl}/#autor`
    : `${baseUrl}/autor/${author.username}`

  const wordCount = post.content ? post.content.split(/\s+/).filter(Boolean).length : 0
  const geo = resolveGeoLocation(author.location)

  const sameAs: string[] = []
  if (author.socials.website) sameAs.push(author.socials.website)
  if (author.socials.twitter) sameAs.push(`https://twitter.com/${author.socials.twitter.replace(/^@/, "")}`)
  if (author.socials.github) sameAs.push(`https://github.com/${author.socials.github}`)
  if (author.socials.linkedin) sameAs.push(author.socials.linkedin.startsWith("http") ? author.socials.linkedin : `https://linkedin.com/in/${author.socials.linkedin}`)

  const coverImage = post.coverUrl
    ? post.coverUrl.startsWith("http")
      ? post.coverUrl
      : `${baseUrl}${post.coverUrl}`
    : `${baseUrl}/placeholder.jpg`

  const authorImage = author.avatarUrl
    ? author.avatarUrl.startsWith("http")
      ? author.avatarUrl
      : `${baseUrl}${author.avatarUrl}`
    : `${baseUrl}/placeholder-user.jpg`

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    isPartOf: {
      "@type": "Blog",
      "@id": `${baseUrl}#blog`,
      name: isTenant ? `${author.name} — Blog` : SITE_CONFIG.name,
      publisher: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_CONFIG.url}/icon.svg`,
        },
      },
    },
    headline: post.title,
    description: post.excerpt || post.title,
    image: [coverImage],
    datePublished: post.publishedAt || post.updatedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
    wordCount,
    timeRequired: `PT${post.readingTimeMinutes || 1}M`,
    inLanguage: "es",
    keywords: post.tags && post.tags.length > 0 ? post.tags.join(", ") : undefined,
    articleSection: post.category?.name || "General",
    author: {
      "@type": "Person",
      "@id": `${authorUrl}#author`,
      name: author.name,
      url: authorUrl,
      image: authorImage,
      jobTitle: author.tagline || undefined,
      description: author.bio || undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      ...(geo
        ? {
            homeLocation: {
              "@type": "Place",
              name: geo.placename,
              address: {
                "@type": "PostalAddress",
                addressCountry: geo.countryCode,
                addressLocality: geo.placename.split(",")[0]?.trim(),
              },
            },
          }
        : {}),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/icon.svg`,
      },
    },
    ...(post.narration && post.narration.status === "ready" && post.narration.audioUrl
      ? {
          audio: {
            "@type": "AudioObject",
            contentUrl: post.narration.audioUrl,
            encodingFormat:
              post.narration.mimeType ||
              (post.narration.format === "wav" ? "audio/wav" : "audio/mpeg"),
            duration: `PT${Math.round(post.narration.duration || 1)}S`,
            name: `Narración de audio: ${post.title}`,
            transcript: post.narration.transcript || undefined,
          },
        }
      : {}),
    ...(geo
      ? {
          contentLocation: {
            "@type": "Place",
            name: geo.placename,
          },
          spatialCoverage: geo.placename,
        }
      : {}),
  }
}

/**
 * Generates Schema.org `Person` & `ProfilePage` structured data for authors
 */
export function generateAuthorJsonLd(
  author: User,
  baseUrl: string = SITE_CONFIG.url,
  isTenant = false
) {
  const profileUrl = isTenant ? baseUrl : `${baseUrl}/autor/${author.username}`
  const geo = resolveGeoLocation(author.location)

  const sameAs: string[] = []
  if (author.socials.website) sameAs.push(author.socials.website)
  if (author.socials.twitter) sameAs.push(`https://twitter.com/${author.socials.twitter.replace(/^@/, "")}`)
  if (author.socials.github) sameAs.push(`https://github.com/${author.socials.github}`)
  if (author.socials.linkedin) sameAs.push(author.socials.linkedin.startsWith("http") ? author.socials.linkedin : `https://linkedin.com/in/${author.socials.linkedin}`)
  if (author.socials.instagram) sameAs.push(`https://instagram.com/${author.socials.instagram.replace(/^@/, "")}`)

  const avatarUrl = author.avatarUrl
    ? author.avatarUrl.startsWith("http")
      ? author.avatarUrl
      : `${baseUrl}${author.avatarUrl}`
    : `${baseUrl}/placeholder-user.jpg`

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${profileUrl}#profile`,
    url: profileUrl,
    name: `Perfil de ${author.name}`,
    mainEntity: {
      "@type": "Person",
      "@id": `${profileUrl}#person`,
      name: author.name,
      alternateName: author.username,
      description: author.bio || author.tagline,
      jobTitle: author.tagline || undefined,
      url: profileUrl,
      image: avatarUrl,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      ...(geo
        ? {
            homeLocation: {
              "@type": "Place",
              name: geo.placename,
              address: {
                "@type": "PostalAddress",
                addressCountry: geo.countryCode,
                addressLocality: geo.placename.split(",")[0]?.trim(),
              },
            },
          }
        : {}),
    },
  }
}

/**
 * Generates Schema.org `WebSite` structured data with SearchAction
 */
export function generateWebSiteJsonLd(baseUrl: string = SITE_CONFIG.url) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    url: baseUrl,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    inLanguage: "es",
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}#organization`,
      name: SITE_CONFIG.name,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.svg`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/explorar?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/**
 * Generates Schema.org `Organization` structured data
 */
export function generateOrganizationJsonLd(baseUrl: string = SITE_CONFIG.url) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    name: SITE_CONFIG.name,
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description: SITE_CONFIG.description,
    sameAs: [
      `https://twitter.com/${SITE_CONFIG.twitterHandle.replace(/^@/, "")}`,
    ],
  }
}

/**
 * Generates Schema.org `BreadcrumbList` structured data
 */
export function generateBreadcrumbsJsonLd(
  items: BreadcrumbItem[],
  baseUrl: string = SITE_CONFIG.url
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: fullUrl,
      }
    }),
  }
}
