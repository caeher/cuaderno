"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { PostKeyTakeaways } from "@/components/site/posts/post-key-takeaways"
import { cn } from "@/lib/utils"

export function PostTakeawaysBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post, isStudioCanvas } = useTemplateContext()

  const excerpt =
    post?.post?.excerpt ||
    (isStudioCanvas
      ? "Este artículo analiza la transición hacia sistemas de diseño modulares para blogs y publicaciones digitales."
      : "")
  const content = post?.post?.content || ""
  const readingTime = post?.post?.readingTimeMinutes || 4

  if (!excerpt && !content) return null

  return (
    <div style={css} className={cn("post-takeaways-widget w-full", node.style?.customClass)}>
      <PostKeyTakeaways excerpt={excerpt} content={content} readingTimeMinutes={readingTime} />
    </div>
  )
}
