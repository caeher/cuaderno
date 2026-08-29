import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function QuoteBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  return (
    <figure style={style} className="my-4 transition-all">
      <blockquote className="italic font-serif text-foreground">
        &ldquo;{node.props.quote || "Cita destacada..."}&rdquo;
      </blockquote>
      {(node.props.author || node.props.title) && (
        <figcaption className="mt-2 text-sm font-sans font-medium text-muted-foreground not-italic">
          — {node.props.author} {node.props.title ? `(${node.props.title})` : ""}
        </figcaption>
      )}
    </figure>
  )
}
