"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { cn } from "@/lib/utils"

export function PostTitleBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post } = useTemplateContext()

  const title = post?.post?.title || "El futuro de las publicaciones modulares en la web moderna"
  const Tag = (`h${node.props?.level || 1}`) as keyof React.JSX.IntrinsicElements

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
