import * as React from "react"
import { ChevronDown } from "lucide-react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"
import { cn } from "@/lib/utils"

export function AccordionBlock({ node }: { node: BlockNode }) {
  const items = (node.props.items as Array<{ id: string; title: string; content: string }>) || []
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id || null)
  const style = blockStyleToCss(node.style)

  return (
    <div
      style={style}
      className="flex flex-col divide-y divide-border/70 rounded-xl border border-border/80 bg-card/60 overflow-hidden my-4"
    >
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className="transition-colors">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between p-4 text-left font-serif text-base font-medium text-foreground hover:bg-accent/40 cursor-pointer"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn("size-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && (
              <div className="p-4 pt-0 text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
