"use client"

import * as React from "react"
import Link from "next/link"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { PostCard } from "@/components/site/post-card"
import { cn } from "@/lib/utils"

export function BlogPostGridBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { home, global, isStudioCanvas } = useTemplateContext()

  const columns = Number(node.props?.columns || 2)
  const limit = Number(node.props?.limit || 10)

  const posts = home?.posts?.slice(0, limit) || (isStudioCanvas ? [
    {
      id: "demo_1",
      authorId: "u1",
      title: "Arquitectura de Información para Blogs Multi-Tenant",
      slug: "arquitectura-multitenant",
      excerpt: "Cómo diseñar una plataforma donde cada organización posee su propio tema compartido.",
      content: "",
      coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
      tags: ["arquitectura", "diseno"],
      status: "published" as const,
      publishedAt: "2026-08-25",
      updatedAt: "2026-08-25",
      readingTimeMinutes: 6,
      views: 520,
      likes: 38,
      comments: 4,
      featured: true,
    },
    {
      id: "demo_2",
      authorId: "u1",
      title: "Tipografía Fluida y Sistemas de Espaciado",
      slug: "tipografia-fluida",
      excerpt: "Exploración práctica de unidades clamp() y ritmos verticales en Tailwind v4.",
      content: "",
      coverUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80",
      tags: ["css", "tipografia"],
      status: "published" as const,
      publishedAt: "2026-08-20",
      updatedAt: "2026-08-20",
      readingTimeMinutes: 4,
      views: 310,
      likes: 24,
      comments: 2,
      featured: false,
    },
  ] : [])

  const author = global?.tenant || {
    name: "Elena Martí",
    avatarUrl: "/placeholder.svg",
    username: "elenamarti",
  }

  const gridColsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2"

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center text-sm text-muted-foreground">
        No hay artículos publicados todavía en este blog.
      </div>
    )
  }

  return (
    <div
      style={css}
      className={cn(
        "blog-post-grid-widget grid gap-6 w-full",
        gridColsClass,
        node.style?.customClass
      )}
    >
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          authorName={author.name}
          authorAvatarUrl={author.avatarUrl}
          tenantSlug={global?.isSubdomain ? undefined : author.username}
        />
      ))}
    </div>
  )
}
