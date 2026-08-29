import type { MetadataRoute } from "next"
import { categoryRepository, postRepository, tagRepository, userRepository } from "@/lib/infrastructure/repositories"
import { SITE_CONFIG } from "@/lib/seo/config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url

  try {
    const [posts, authors, categories, tags] = await Promise.all([
      postRepository.findPublished(),
      userRepository.findAll(),
      categoryRepository.findAll(),
      tagRepository.findAll(),
    ])

    const now = new Date()

    // 1. Static Core Pages
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: now,
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/explorar`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/legal`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/legal/privacidad`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/legal/terminos`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/legal/cookies`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.3,
      },
      {
        url: `${baseUrl}/legal/aviso-legal`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.3,
      },
    ]

    // 2. Published Blog Posts
    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: "weekly",
      priority: post.featured ? 0.9 : 0.8,
      images: post.coverUrl ? [post.coverUrl.startsWith("http") ? post.coverUrl : `${baseUrl}${post.coverUrl}`] : undefined,
    }))

    // 3. Author Profiles & Tenant Blog Homepages
    const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
      url: `${baseUrl}/autor/${author.username}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }))

    const tenantRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
      url: `${baseUrl}/${author.username}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }))

    // 4. Categories and Tags
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/explorar?category=${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }))

    const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${baseUrl}/explorar?tag=${tag.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }))

    return [
      ...staticRoutes,
      ...postRoutes,
      ...authorRoutes,
      ...tenantRoutes,
      ...categoryRoutes,
      ...tagRoutes,
    ]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ]
  }
}
