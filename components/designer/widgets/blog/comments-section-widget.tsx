"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { PostCommentsSection } from "@/components/site/comments/post-comments-section"
import { cn } from "@/lib/utils"

export function CommentsSectionBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post, isStudioCanvas } = useTemplateContext()

  const comments = post?.comments ?? (isStudioCanvas ? [
    {
      id: "c_demo_1",
      postId: "p1",
      authorName: "Carlos Vega",
      authorAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      content: "Excelente artículo sobre la separación de templates y contenido editorial. Hacía mucha falta esta distinción.",
      createdAt: "2026-08-28",
    },
    {
      id: "c_demo_2",
      postId: "p1",
      authorName: "Marina Torres",
      authorAvatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      content: "Me encanta el enfoque modular y la fluidez del canvas responsivo.",
      createdAt: "2026-08-29",
    },
  ] : [])

  const postId = post?.post?.id || (isStudioCanvas ? "demo-post-id" : "")
  const postSlug = post?.post?.slug || (isStudioCanvas ? "demo-post-slug" : "")

  if (!postId && !isStudioCanvas) {
    return null
  }

  return (
    <div style={css} className={cn("comments-section-widget w-full", node.style?.customClass)}>
      <PostCommentsSection comments={comments} postId={postId} postSlug={postSlug} />
    </div>
  )
}

