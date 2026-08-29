"use client"

import * as React from "react"
import Link from "next/link"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/format"
import { formatDate } from "@/lib/format"
import { Clock, Eye, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function PostMetaBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post, isStudioCanvas } = useTemplateContext()

  const author = post?.author || {
    name: "Elena Martí",
    avatarUrl: "/placeholder.svg",
    username: "elenamarti",
  }
  const currentPost = post?.post || {
    publishedAt: new Date().toISOString(),
    readingTimeMinutes: 5,
    views: 1240,
    category: { name: "Diseño & UX", slug: "diseno", color: "#3b82f6" },
  }

  const showAuthor = node.props?.showAuthor ?? true
  const showDate = node.props?.showDate ?? true
  const showReadingTime = node.props?.showReadingTime ?? true
  const showCategory = node.props?.showCategory ?? true

  return (
    <div
      style={css}
      className={cn(
        "flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-y border-border/40 py-3",
        node.style?.customClass
      )}
    >
      {showAuthor && (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={author.avatarUrl} alt={author.name} />
            <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{author.name}</span>
        </div>
      )}

      {showDate && currentPost.publishedAt && (
        <div className="flex items-center gap-1">
          <Calendar className="size-3.5" />
          <span>{formatDate(currentPost.publishedAt)}</span>
        </div>
      )}

      {showReadingTime && currentPost.readingTimeMinutes && (
        <div className="flex items-center gap-1">
          <Clock className="size-3.5" />
          <span>{currentPost.readingTimeMinutes} min de lectura</span>
        </div>
      )}

      {showCategory && currentPost.category && (
        <Badge
          variant="outline"
          className="text-[11px] font-normal"
          style={{ borderColor: currentPost.category.color, color: currentPost.category.color }}
        >
          {currentPost.category.name}
        </Badge>
      )}
    </div>
  )
}
