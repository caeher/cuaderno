import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"
import { getWidgetIcon } from "@/components/designer/widgets/utils/icon-helper"
import { cn } from "@/lib/utils"

export function ButtonBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  const variant = node.props.variant || "primary"
  const IconComp = getWidgetIcon(node.props.iconName)

  return (
    <div style={{ textAlign: style.textAlign, margin: style.margin }} className="my-2">
      <a
        href={node.props.url || "#"}
        target={node.props.openInNewTab ? "_blank" : undefined}
        rel={node.props.openInNewTab ? "noopener noreferrer" : undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium text-sm rounded-lg px-5 py-2.5 transition-all shadow-xs active:scale-95 cursor-pointer",
          variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" && "border border-border bg-background hover:bg-accent text-foreground",
          variant === "gradient" && "bg-gradient-to-r from-primary to-chart-4 text-white shadow-md hover:opacity-95"
        )}
      >
        <span>{node.props.text || "Botón"}</span>
        {node.props.iconName && <IconComp className="size-4" />}
      </a>
    </div>
  )
}
