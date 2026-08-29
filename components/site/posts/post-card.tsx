import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import type { Post, User } from "@/lib/domain/entities"
import { formatShortDate, getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buildTenantUrl } from "@/lib/tenant-utils"
import { cn } from "@/lib/utils"

export interface PostCardProps {
  post: Post
  author: User
  variant?: "default" | "compact"
  className?: string
}

export function PostCard({ post, author, variant = "default", className }: PostCardProps) {
  const postUrl = buildTenantUrl({
    tenantSlug: author.username,
    path: `/posts/${post.slug}`,
    subdomainEnabled: author.subdomainEnabled ?? true,
    customDomain: author.customDomain,
    absolute: author.subdomainEnabled ?? false,
  })

  if (variant === "compact") {
    return (
      <article className={cn("group flex gap-4 py-5", className)}>
        <div className="min-w-0 flex-1">
          <PostCardMeta post={post} author={author} />
          <Link href={postUrl} className="mt-1.5 block">
            <h3 className="text-base font-semibold leading-snug text-balance text-foreground transition-colors group-hover:text-ia">
              {post.title}
            </h3>
          </Link>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        </div>
        {post.coverUrl && (
          <Link
            href={postUrl}
            className="relative hidden size-24 flex-none overflow-hidden rounded-lg border border-border bg-surface-sunken sm:block"
          >
            <Image src={post.coverUrl || "/placeholder.svg"} alt="" fill className="object-cover" />
          </Link>
        )}
      </article>
    )
  }

  return (
    <article className={cn("group flex flex-col", className)}>
      {post.coverUrl && (
        <Link
          href={postUrl}
          className="relative mb-4 block aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-sunken"
        >
          <Image
            src={post.coverUrl || "/placeholder.svg"}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      )}
      <PostCardMeta post={post} author={author} />
      <Link href={postUrl} className="mt-2 block">
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-balance text-foreground transition-colors group-hover:text-ia">
          {post.title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>
    </article>
  )
}

export function PostCardMeta({ post, author }: { post: Post; author: User }) {
  const authorUrl = buildTenantUrl({
    tenantSlug: author.username,
    path: `/author/${author.username}`,
    subdomainEnabled: author.subdomainEnabled ?? true,
    customDomain: author.customDomain,
    absolute: author.subdomainEnabled ?? false,
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={authorUrl} className="flex items-center gap-1.5">
        <Avatar className="size-5">
          <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
          <AvatarFallback className="text-[9px]">{getInitials(author.name)}</AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-foreground transition-colors hover:text-ia">
          {author.name}
        </span>
      </Link>
      <span className="text-xs text-text-tertiary">·</span>
      <time className="text-xs tabular-nums text-text-tertiary">
        {formatShortDate(post.publishedAt)}
      </time>

      {post.category && (
        <>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: post.category.color || "var(--cat-2)" }}
            />
            {post.category.name}
          </span>
        </>
      )}
    </div>
  )
}
