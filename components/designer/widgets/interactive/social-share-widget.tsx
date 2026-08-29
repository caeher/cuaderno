"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { TwitterIcon, LinkedinIcon } from "@/components/common/social-icons"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function SocialShareBlock({ node }: { node: BlockNode }) {
  const [copied, setCopied] = React.useState(false)
  const style = blockStyleToCss(node.style)

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      style={style}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-b border-border/70 py-4 my-6"
    >
      <span className="text-sm font-medium text-muted-foreground">
        {node.props.label || "¿Te gustó el artículo? Compártelo:"}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, "_blank")
            }
          }}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
          title="Compartir en Twitter / X"
        >
          <TwitterIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank")
            }
          }}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
          title="Compartir en LinkedIn"
        >
          <LinkedinIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
          title="Copiar enlace"
        >
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          <span>{copied ? "¡Copiado!" : "Copiar link"}</span>
        </button>
      </div>
    </div>
  )
}
