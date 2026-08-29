import type { MetadataRoute } from "next"
import { AI_CRAWLER_USER_AGENTS, SITE_CONFIG } from "@/lib/seo/config"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel/", "/api/", "/__clerk/"],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "DuckDuckBot"],
        allow: "/",
        disallow: ["/panel/", "/api/", "/__clerk/"],
      },
      {
        userAgent: AI_CRAWLER_USER_AGENTS,
        allow: ["/", "/post/", "/autor/", "/explorar", "/llms.txt"],
        disallow: ["/panel/", "/api/", "/__clerk/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
