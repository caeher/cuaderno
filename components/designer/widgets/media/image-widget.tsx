import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function ImageBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  return (
    <figure style={{ margin: style.margin, maxWidth: style.maxWidth, width: style.width }} className="my-4">
      <div
        style={{
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          aspectRatio: node.props.aspectRatio || "16/9",
        }}
        className="relative overflow-hidden bg-muted border border-border/50"
      >
        <img
          src={node.props.src || "/placeholder.svg"}
          alt={node.props.alt || "Imagen"}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
      {node.props.caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {node.props.caption}
        </figcaption>
      )}
    </figure>
  )
}
