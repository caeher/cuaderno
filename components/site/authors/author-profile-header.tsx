import * as React from "react"
import { MapPin } from "lucide-react"
import type { AuthorWithStats, User } from "@/lib/domain/entities"
import { formatCompactNumber, getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SocialLinks } from "@/components/common/social-links"
import { StatBadgeGroup } from "@/components/common/stat-badge-group"

export interface AuthorProfileHeaderProps {
  author: AuthorWithStats | User
  postsCount?: number
  onFollow?: () => void
}

export function AuthorProfileHeader({
  author,
  postsCount,
  onFollow,
}: AuthorProfileHeaderProps) {
  const stats = [
    { label: "Posts", value: postsCount ?? author.postCount },
    { label: "Seguidores", value: formatCompactNumber(author.followerCount) },
    {
      label: "Vistas totales",
      value: formatCompactNumber("totalViews" in author ? author.totalViews : 0),
    },
  ]

  return (
    <header className="flex flex-col">
      <div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          <Avatar className="size-24 border-4 border-background sm:size-28 shadow-sm">
            <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
            <AvatarFallback className="text-2xl">{getInitials(author.name)}</AvatarFallback>
          </Avatar>
        </div>
        <Button onClick={onFollow} className="sm:mb-1 cursor-pointer">
          Seguir
        </Button>
      </div>

      <div className="mt-5">
        <h1 className="font-serif text-3xl font-medium tracking-tight">{author.name}</h1>
        <p className="text-muted-foreground font-mono text-sm">@{author.username}</p>

        {author.bio && (
          <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground/90">{author.bio}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {author.location && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {author.location}
            </span>
          )}
          <SocialLinks socials={author.socials} />
        </div>

        <StatBadgeGroup stats={stats} className="mt-6" />
      </div>
    </header>
  )
}
