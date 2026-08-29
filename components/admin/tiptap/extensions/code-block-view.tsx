"use client"

import * as React from "react"
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"
import { Check, Copy, Terminal } from "lucide-react"

const LANGUAGES = [
  { label: "Texto sin formato", value: "plaintext" },
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Bash / Shell", value: "bash" },
  { label: "SQL", value: "sql" },
  { label: "Markdown", value: "markdown" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "YAML", value: "yaml" },
]

export function CodeBlockComponent({ node, updateAttributes, extension }: NodeViewProps) {
  const [copied, setCopied] = React.useState(false)
  const currentLanguage = node.attrs.language || "plaintext"

  const handleCopy = () => {
    const textContent = node.textContent
    navigator.clipboard.writeText(textContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <NodeViewWrapper className="notion-code-block my-4 overflow-hidden rounded-xl border border-border/80 bg-muted/60 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/90 px-3.5 py-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 opacity-70" />
          <select
            contentEditable={false}
            value={currentLanguage}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="cursor-pointer rounded bg-transparent font-medium text-foreground/80 outline-none hover:text-foreground focus:bg-background/80"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-popover text-popover-foreground">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          contentEditable={false}
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label="Copiar código"
        >
          {copied ? (
            <>
              <Check className="size-3 text-green-500" />
              <span className="text-green-500 font-medium">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground">
        <code>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  )
}
