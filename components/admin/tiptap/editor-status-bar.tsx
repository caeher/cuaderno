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
    <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <FileText className="size-3.5 opacity-70" />
          <span>
            {words} {words === 1 ? "palabra" : "palabras"} · {characters} caracteres
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5 opacity-70" />
          <span>~{readingTime} min de lectura</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-500" />
        <span>Bloques sincronizados</span>
      </div>
    </div>
  )
}
