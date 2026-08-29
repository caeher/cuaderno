import * as React from "react"
import Link from "next/link"
import type { Post } from "@/lib/domain/entities"
import { formatDate, formatCompactNumber } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/empty-state"
import { cn } from "@/lib/utils"

export interface AuthorTimelineProps {
  posts: Post[]
  authorName: string
  tenantSlug?: string
  className?: string
}

export function AuthorTimeline({
  posts,
  authorName,
  tenantSlug,
  className,
}: AuthorTimelineProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        preset="author-posts"
        description={`${authorName} no ha publicado nada por aquí todavía, vuelve más tarde.`}
        className="my-10"
      />
    )
  }

  return (
    <div className={cn("py-10", className)}>
      <div className="flex flex-col divide-y divide-border/70">
        {posts.map((post) => {
          const postHref = tenantSlug ? `/${tenantSlug}/posts/${post.slug}` : `/posts/${post.slug}`

          return (
            <article key={post.id} className="group py-6 first:pt-0">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <Link href={postHref} className="mt-2 block">
                <h2 className="font-serif text-2xl font-medium leading-snug text-balance group-hover:text-primary">
                  {post.title}
                </h2>
              </Link>
              {post.excerpt && (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDate(post.publishedAt)} · {post.readingTimeMinutes} min de lectura ·{" "}
                {formatCompactNumber(post.views)} vistas
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
