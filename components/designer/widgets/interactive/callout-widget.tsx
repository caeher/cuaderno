import * as React from "react"
import { AlertTriangle, Info, Sparkles } from "lucide-react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"
import { cn } from "@/lib/utils"

export function CalloutBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  const type = node.props.type || "tip"

  return (
    <div
      style={style}
      className={cn(
        "flex gap-3 rounded-xl border p-4 my-4",
        type === "tip" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200",
        type === "info" && "border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-200",
        type === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200",
        type === "error" && "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200"
      )}
    >
      <div className="mt-0.5 flex-none">
        {type === "tip" && <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />}
        {type === "info" && <Info className="size-5 text-sky-600 dark:text-sky-400" />}
        {type === "warning" && <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />}
        {type === "error" && <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400" />}
      </div>
      <div className="flex flex-col gap-1">
        {node.props.title && <h4 className="font-semibold text-sm">{node.props.title}</h4>}
        <p className="text-sm leading-relaxed opacity-90">{node.props.message}</p>
      </div>
    </div>
  )
}
