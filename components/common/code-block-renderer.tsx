"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CodeBlockRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string
  language?: string
}

export function CodeBlockRenderer({
  code,
  language,
  className,
  ...props
}: CodeBlockRendererProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div
      className={cn("group relative my-4 overflow-hidden rounded-xl border border-border bg-muted/70", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border/70 bg-card/60 px-4 py-2 text-xs font-mono text-muted-foreground">
        <span>{language || "code"}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          <span>{copied ? "¡Copiado!" : "Copiar"}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}
