import * as React from "react"
import type { Comment } from "@/lib/domain/entities"
import { formatDate, getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface CommentItemProps extends React.HTMLAttributes<HTMLDivElement> {
  comment: Comment
}

export function CommentItem({ comment, className, ...props }: CommentItemProps) {
  return (
    <div className={cn("flex gap-3", className)} {...props}>
      <Avatar className="size-8 shrink-0">
        <AvatarImage
          src={comment.authorAvatarUrl || "/placeholder.svg"}
          alt={comment.authorName}
        />
        <AvatarFallback className="text-[10px]">
          {getInitials(comment.authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-foreground">{comment.authorName}</p>
          <time className="text-xs tabular-nums text-text-tertiary">
            {formatDate(comment.createdAt)}
          </time>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{comment.content}</p>
      </div>
    </div>
  )
}
