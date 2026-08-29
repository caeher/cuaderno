import * as React from "react"
import Link from "next/link"
import type { Post, User } from "@/lib/domain/entities"
import { formatDate, getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SharePopover } from "@/components/common/share-popover"

export interface PostHeaderProps {
  post: Post
  author: User
}

export function PostHeader({ post, author }: PostHeaderProps) {
  return (
    <header className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        {post.category && (
          <Link
            href={`/explorar?category=${post.category.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface-sunken"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: post.category.color || "var(--cat-2)" }}
            />
            <span>{post.category.name}</span>
          </Link>
        )}

        {post.tags.length > 0 &&
          post.tags.map((tag) => (
            <Link key={tag} href={`/explorar?tag=${tag}`}>
              <Badge
                variant="secondary"
                className="text-xs font-normal text-muted-foreground hover:bg-surface-sunken"
              >
                #{tag}
              </Badge>
            </Link>
          ))}
      </div>

      <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-balance text-foreground">
        {post.title}
      </h1>


      {post.excerpt && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
          {post.excerpt}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between border-y border-border py-4">
        <Link href={`/autor/${author.username}`} rel="author" className="group flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
            <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground transition-colors group-hover:text-ia">
              {author.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs tabular-nums text-text-tertiary">
              {post.publishedAt ? (
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              ) : (
                <span className="rounded-full bg-warn-tint px-2 py-0.5 font-medium text-warn-ink">
                  Borrador
                </span>
              )}
              <span>·</span>
              <span>{post.readingTimeMinutes} min de lectura</span>
            </div>
          </div>
        </Link>
        <SharePopover title={post.title} />
      </div>
    </header>
  )
}
