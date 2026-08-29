"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { PostActionBar } from "@/components/site/posts/post-action-bar"
import { cn } from "@/lib/utils"

export function PostActionBarBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post, isStudioCanvas } = useTemplateContext()

  const likes = post?.post?.likes ?? (isStudioCanvas ? 42 : 0)
  const commentsCount = post?.comments?.length ?? post?.post?.comments ?? (isStudioCanvas ? 3 : 0)
  const title = post?.post?.title || (isStudioCanvas ? "Artículo del blog" : "")

  return (
    <div style={css} className={cn("post-action-bar-widget w-full", node.style?.customClass)}>
      <PostActionBar likes={likes} commentsCount={commentsCount} postTitle={title} />
    </div>
  )
}

