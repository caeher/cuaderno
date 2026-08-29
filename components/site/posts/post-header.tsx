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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: post.category.color || "#3b82f6" }}
            />
            <span>{post.category.name}</span>
          </Link>
        )}

        {post.tags.length > 0 &&
          post.tags.map((tag) => (
            <Link key={tag} href={`/explorar?tag=${tag}`}>
              <Badge variant="secondary" className="hover:bg-muted font-mono text-xs font-normal">
                #{tag}
              </Badge>
            </Link>
          ))}
      </div>

      <h1 className="mt-5 font-serif text-4xl font-medium leading-[1.1] text-balance sm:text-5xl">
        {post.title}
      </h1>


      {post.excerpt && (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
      )}

      <div className="mt-6 flex items-center justify-between border-y border-border/70 py-4">
        <Link href={`/autor/${author.username}`} rel="author" className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
            <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{author.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {post.publishedAt ? (
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              ) : (
                <span>Borrador</span>
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
