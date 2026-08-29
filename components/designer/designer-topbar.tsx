"use client"

import * as React from "react"
import Link from "next/link"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Send,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DesignerTopbarProps {
  postTitle: string
  onTitleChange: (title: string) => void
  onSave: (status: "draft" | "published") => void
  isSaving: boolean
  postStatus?: "draft" | "published" | "scheduled"
  backUrl?: string
}

export function DesignerTopbar({
  postTitle,
  onTitleChange,
  onSave,
  isSaving,
  postStatus = "draft",
  backUrl = "/panel/posts",
}: DesignerTopbarProps) {
  const {
    device,
    setDevice,
    undo,
    redo,
    canUndo,
    canRedo,
    isPreviewMode,
    togglePreviewMode,
  } = useDesigner()

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 shadow-xs z-30">
      {/* Left: Back Link & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={backUrl}
          className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
          title="Volver"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <input
            value={postTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Título del artículo..."
            className="w-48 sm:w-64 md:w-80 truncate bg-transparent font-serif text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 rounded px-1.5 py-0.5 border border-transparent hover:border-border/60"
          />
          <span
            className={cn(
              "hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider",
              postStatus === "published"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600"
            )}
          >
            {postStatus === "published" ? "Publicado" : "Borrador"}
          </span>
        </div>
      </div>

      {/* Center: Undo/Redo & Responsive Device Switcher */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 border-r border-border pr-2 mr-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Deshacer (Ctrl+Z)"
            className="flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Rehacer (Ctrl+Y)"
            className="flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="size-4" />
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/30">
          {[
            { id: "desktop", icon: Monitor, title: "Escritorio (100%)" },
            { id: "tablet", icon: Tablet, title: "Tableta (768px)" },
            { id: "mobile", icon: Smartphone, title: "Móvil (375px)" },
          ].map((dev) => (
            <button
              key={dev.id}
              type="button"
              onClick={() => setDevice(dev.id as any)}
              title={dev.title}
              className={cn(
                "flex size-7 items-center justify-center rounded transition-all",
                device === dev.id
                  ? "bg-background shadow-xs text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <dev.icon className="size-4" />
            </button>
          ))}
        </div>

        {/* Preview Mode Switcher */}
        <button
          type="button"
          onClick={togglePreviewMode}
          title={isPreviewMode ? "Salir de vista previa" : "Vista previa limpia"}
          className={cn(
            "ml-2 flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors",
            isPreviewMode
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {isPreviewMode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          <span className="hidden md:inline">{isPreviewMode ? "Modo Editor" : "Previsualizar"}</span>
        </button>
      </div>

      {/* Right: Save & Publish Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSave("draft")}
          disabled={isSaving}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <Save className="size-3.5" />
          <span>Guardar borrador</span>
        </button>

        <button
          type="button"
          onClick={() => onSave("published")}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
        >
          <Send className="size-3.5" />
          <span>{isSaving ? "Guardando..." : "Publicar"}</span>
        </button>
      </div>
    </header>
  )
}
