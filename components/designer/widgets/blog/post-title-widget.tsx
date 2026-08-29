"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { cn } from "@/lib/utils"

export function PostTitleBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post, isStudioCanvas } = useTemplateContext()

  const title =
    post?.post?.title ||
    (isStudioCanvas ? "El futuro de las publicaciones modulares en la web moderna" : "")
  const level = Math.min(Math.max(Number(node.props?.level || 1), 1), 6)
  const Tag = (`h${level}`) as keyof React.JSX.IntrinsicElements

  if (!title) return null

  return (
    <Tag
      style={css}
      className={cn(
        "font-serif tracking-tight text-foreground text-balance",
        node.style?.customClass
      )}
    >
      {title}
    </Tag>
  )
}

