import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function GalleryBlock({ node }: { node: BlockNode }) {
  const images = (node.props.images as string[]) || []
  const columns = Number(node.props.columns || 3)
  const style = blockStyleToCss(node.style)

  return (
    <div
      style={{
        ...style,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: node.props.gap || "16px",
      }}
      className="my-4"
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="relative aspect-square overflow-hidden rounded-xl bg-muted border border-border/50 transition-transform duration-300 hover:scale-[1.02]"
        >
          <img src={src} alt={`Galería ${i + 1}`} className="size-full object-cover" />
        </div>
      ))}
    </div>
  )
}
