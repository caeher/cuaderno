/**
 * Metadata Builder Utilities for Next.js 16
 *
 * Generates unified, SEO & GEO-optimized Metadata objects
 * for layout and page components.
 */

import type { Metadata } from "next"
import { resolveGeoLocation, SITE_CONFIG } from "./config"

export interface ConstructMetadataParams {
  title?: string
  description?: string
  image?: string | null
  canonicalPath?: string
  type?: "website" | "article" | "profile"
  publishedTime?: string | null
  modifiedTime?: string | null
  authors?: string[]
  tags?: string[]
  location?: string | null
  noIndex?: boolean
}

export function constructSiteMetadata({
  title,
  description = SITE_CONFIG.description,
  image = "/placeholder.jpg",
  canonicalPath = "/",
  type = "website",
  publishedTime,
  modifiedTime,
  authors = [SITE_CONFIG.name],
  tags = SITE_CONFIG.defaultKeywords,
  location,
  noIndex = false,
}: ConstructMetadataParams = {}): Metadata {
  const fullTitle = title
    ? `${title} · ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`

  const fullCanonicalUrl = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${SITE_CONFIG.url}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`

  const ogImageUrl = image
    ? image.startsWith("http")
      ? image
      : `${SITE_CONFIG.url}${image.startsWith("/") ? image : `/${image}`}`
    : `${SITE_CONFIG.url}/placeholder.jpg`

  const geo = resolveGeoLocation(location)

  const otherMeta: Record<string, string> = {}
  if (geo) {
    otherMeta["geo.region"] = geo.regionCode
    otherMeta["geo.placename"] = geo.placename
    otherMeta["geo.position"] = geo.coordinates
    otherMeta["ICBM"] = geo.coordinates.replace(";", ", ")
  }

  return {
    title: title ? { default: title, template: `%s · ${SITE_CONFIG.name}` } : fullTitle,
    description,
    keywords: tags,
    authors: authors.map((name) => ({ name })),
    creator: SITE_CONFIG.creator,
    publisher: SITE_CONFIG.name,
    alternates: {
      canonical: fullCanonicalUrl,
      languages: {
        "es-ES": fullCanonicalUrl,
        "es-MX": fullCanonicalUrl,
        "es-CL": fullCanonicalUrl,
        "es-CO": fullCanonicalUrl,
        "es-AR": fullCanonicalUrl,
      },
    },
    openGraph: {
      title: title || fullTitle,
      description,
      url: fullCanonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      alternateLocale: SITE_CONFIG.alternateLocales,
      type: type === "article" ? "article" : "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ],
      ...(type === "article" && publishedTime
        ? {
            publishedTime,
            modifiedTime: modifiedTime || publishedTime,
            authors,
            tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title || fullTitle,
      description,
      images: [ogImageUrl],
      creator: SITE_CONFIG.twitterHandle,
      site: SITE_CONFIG.twitterHandle,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined,
  }
}
