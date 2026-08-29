"use client"

import * as React from "react"
import { Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SharePopover } from "@/components/common/share-popover"
import { cn } from "@/lib/utils"

export interface PostActionBarProps {
  likes: number
  commentsCount: number
  postTitle?: string
  className?: string
}

export function PostActionBar({
  likes,
  commentsCount,
  postTitle,
  className,
}: PostActionBarProps) {
  const [likeCount, setLikeCount] = React.useState(likes)
  const [hasLiked, setHasLiked] = React.useState(false)

  const handleToggleLike = () => {
    if (hasLiked) {
      setLikeCount((prev) => prev - 1)
      setHasLiked(false)
    } else {
      setLikeCount((prev) => prev + 1)
      setHasLiked(true)
    }
  }

  return (
    <div
      className={cn(
        "mt-10 flex items-center justify-between border-t border-border pt-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant={hasLiked ? "default" : "secondary"}
          size="sm"
          onClick={handleToggleLike}
          className="gap-1.5 cursor-pointer"
        >
          <Heart className={cn("size-4", hasLiked && "fill-current")} />
          <span className="tabular-nums">{likeCount}</span>
        </Button>
        <Button variant="secondary" size="sm" className="gap-1.5 cursor-pointer">
          <MessageCircle className="size-4" />
          <span className="tabular-nums">{commentsCount}</span>
        </Button>
      </div>
      <SharePopover title={postTitle} />
    </div>
  )
}
