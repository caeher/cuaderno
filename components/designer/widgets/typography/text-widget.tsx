import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function TextBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  return (
    <div
      style={style}
      className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap transition-all"
    >
      {node.props.text || "Escribe aquí tu texto..."}
    </div>
  )
}
