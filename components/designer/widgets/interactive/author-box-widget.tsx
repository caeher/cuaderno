import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function AuthorBoxBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)

  return (
    <div style={style} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 my-6">
      <div className="size-16 flex-none rounded-full overflow-hidden border-2 border-border bg-muted">
        <img
          src={node.props.avatarUrl || "/placeholder.svg"}
          alt={node.props.name || "Autor"}
          className="size-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h4 className="font-serif text-lg font-bold text-foreground">{node.props.name || "Nombre del Autor"}</h4>
        {node.props.role && <p className="text-xs text-primary font-medium">{node.props.role}</p>}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{node.props.bio || "Biografía del autor..."}</p>
      </div>
    </div>
  )
}
