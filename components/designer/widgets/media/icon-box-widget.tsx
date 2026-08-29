import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"
import { getWidgetIcon } from "@/components/designer/widgets/utils/icon-helper"

export function IconBoxBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  const IconComp = getWidgetIcon(node.props.icon || "Sparkles")

  return (
    <div style={style} className="flex flex-col gap-3 rounded-xl transition-all">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <IconComp className="size-5" />
      </div>
      <h3 className="font-serif text-lg font-semibold text-foreground">
        {node.props.title || "Característica"}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {node.props.description || "Descripción detallada."}
      </p>
    </div>
  )
}
