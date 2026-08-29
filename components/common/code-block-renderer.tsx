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
      className={cn("group relative my-4 overflow-hidden rounded-xl border border-border bg-surface-sunken", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2 font-mono text-xs text-text-tertiary">
        <span>{language || "code"}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 cursor-pointer gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3.5 text-perf" /> : <Copy className="size-3.5" />}
          <span>{copied ? "¡Copiado!" : "Copiar"}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}
