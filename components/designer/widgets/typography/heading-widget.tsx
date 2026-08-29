import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"
import { cn } from "@/lib/utils"

export function HeadingBlock({ node }: { node: BlockNode }) {
  const level = Number(node.props.level || 2)
  const Tag = (`h${Math.min(6, Math.max(1, level))}` as unknown) as React.ElementType
  const style = blockStyleToCss(node.style)

  return (
    <Tag style={style} className={cn("tracking-tight font-serif text-foreground transition-all")}>
      {node.props.text || "Encabezado"}
    </Tag>
  )
}
