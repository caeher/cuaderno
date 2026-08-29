"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { Clock, FileText, CheckCircle2 } from "lucide-react"

interface EditorStatusBarProps {
  editor: Editor
}

export function EditorStatusBar({ editor }: EditorStatusBarProps) {
  const words = editor.storage.characterCount?.words?.() ?? 0
  const characters = editor.storage.characterCount?.characters?.() ?? 0
  const readingTime = Math.max(1, Math.ceil(words / 200))

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-sm text-text-tertiary">
      <div className="flex flex-wrap items-center gap-4 tabular-nums">
        <span className="flex items-center gap-1.5">
          <FileText className="size-4" />
          <span>
            {words} {words === 1 ? "palabra" : "palabras"} · {characters} caracteres
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <span>~{readingTime} min de lectura</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="size-4 text-perf" />
        <span>Bloques sincronizados</span>
      </div>
    </div>
  )
}
