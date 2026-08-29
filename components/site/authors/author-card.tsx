import * as React from "react"
import Link from "next/link"
import type { User } from "@/lib/domain/entities"
import { formatCompactNumber, getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buildTenantUrl } from "@/lib/tenant-utils"
import { cn } from "@/lib/utils"

export interface AuthorCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  author: User
}

export function AuthorCard({ author, className, ...props }: AuthorCardProps) {
  const authorUrl = buildTenantUrl({
    tenantSlug: author.username,
    subdomainEnabled: author.subdomainEnabled ?? true,
    customDomain: author.customDomain,
    absolute: author.subdomainEnabled ?? false,
  })

  return (
    <Link
      href={authorUrl}
      className={cn(
        "group flex flex-col items-start rounded-xl border border-border bg-card p-5 transition-colors hover:bg-surface-sunken",
        className
      )}
      {...props}
    >
      <Avatar className="size-12">
        <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
        <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
      </Avatar>
      <h3 className="mt-4 text-base font-semibold text-foreground transition-colors group-hover:text-ia">
        {author.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {author.tagline}
      </p>
      <p className="mt-3 text-xs tabular-nums text-text-tertiary">
        {author.postCount} posts · {formatCompactNumber(author.followerCount)} seguidores
      </p>
    </Link>
  )
}
