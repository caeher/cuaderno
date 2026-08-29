import * as React from "react"
import Link from "next/link"
import type { User } from "@/lib/domain/entities"
import { getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AuthorBioCardProps extends React.HTMLAttributes<HTMLDivElement> {
  author: User
}

export function AuthorBioCard({ author, className, ...props }: AuthorBioCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-xs",
        className
      )}
      {...props}
    >
      <Avatar className="size-14">
        <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
        <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-serif text-lg font-medium">{author.name}</p>
        {author.bio && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{author.bio}</p>
        )}
        <Button
          variant="link"
          className="mt-2 h-auto px-0 text-primary hover:underline"
          render={<Link href={`/autor/${author.username}`} />}
        >
          Ver todos sus posts
        </Button>
      </div>
    </div>
  )
}
