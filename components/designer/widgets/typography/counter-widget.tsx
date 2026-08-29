import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function CounterBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  return (
    <div style={style} className="flex flex-col items-center justify-center transition-all">
      <span className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-primary">
        {node.props.prefix}
        {node.props.number || "0"}
        {node.props.suffix}
      </span>
      <span className="mt-2 text-sm font-medium text-muted-foreground">
        {node.props.label || "Métrica"}
      </span>
    </div>
  )
}
