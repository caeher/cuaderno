"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { cn } from "@/lib/utils"

export function PostCoverBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post } = useTemplateContext()

  const coverUrl =
    post?.post?.coverUrl ||
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80"
  const title = post?.post?.title || "Imagen de portada del artículo"

  if (!coverUrl) return null

  return (
    <div
      style={css}
      className={cn(
        "relative overflow-hidden rounded-xl shadow-xs aspect-video w-full bg-muted",
        node.style?.customClass
      )}
    >
      <img src={coverUrl} alt={title} className="size-full object-cover" />
    </div>
  )
}
