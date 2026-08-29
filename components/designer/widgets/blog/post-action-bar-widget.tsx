"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { PostActionBar } from "@/components/site/posts/post-action-bar"
import { cn } from "@/lib/utils"

export function PostActionBarBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post } = useTemplateContext()

  const likes = post?.post?.likes || 42
  const commentsCount = post?.comments?.length ?? post?.post?.comments ?? 3
  const title = post?.post?.title || "Artículo del blog"

  return (
    <div style={css} className={cn("post-action-bar-widget w-full", node.style?.customClass)}>
      <PostActionBar likes={likes} commentsCount={commentsCount} postTitle={title} />
    </div>
  )
}
