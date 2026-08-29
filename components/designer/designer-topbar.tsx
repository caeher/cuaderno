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
  RotateCcw,
  History,
  Layout,
  FileText,
  PanelTop,
  PanelBottom,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TemplateSlotType } from "@/lib/domain/template-schema"

interface DesignerTopbarProps {
  templateName: string
  onTemplateNameChange?: (name: string) => void
  onSaveDraft: () => void
  onPublish: () => void
  onOpenRevisions?: () => void
  isSaving: boolean
  isPublished?: boolean
  backUrl?: string
}

const SLOTS_CONFIG: { id: TemplateSlotType; label: string; icon: any }[] = [
  { id: "home", label: "Portada (Home)", icon: Layout },
  { id: "post", label: "Artículo (Post)", icon: FileText },
  { id: "header", label: "Cabecera (Header)", icon: PanelTop },
  { id: "footer", label: "Pie (Footer)", icon: PanelBottom },
]

export function DesignerTopbar({
  templateName,
  onTemplateNameChange,
  onSaveDraft,
  onPublish,
  onOpenRevisions,
  isSaving,
  isPublished = false,
  backUrl = "/panel",
}: DesignerTopbarProps) {
  const {
    activeSlot,
    setActiveSlot,
    device,
    setDevice,
    undo,
    redo,
    canUndo,
    canRedo,
    isPreviewMode,
    togglePreviewMode,
    resetCurrentSlotToDefault,
  } = useDesigner()

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-border bg-card px-3 sm:px-4 shadow-xs z-30">
      {/* Left: Back Link & Template Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link
          href={backUrl}
          className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Volver al panel"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <input
            value={templateName}
            onChange={(e) => onTemplateNameChange?.(e.target.value)}
            placeholder="Nombre de la plantilla..."
            className="w-36 sm:w-48 md:w-56 truncate bg-transparent font-serif text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 rounded px-1.5 py-0.5 border border-transparent hover:border-border/60"
          />
          <span
            className={cn(
              "hidden lg:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider",
              isPublished
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}
          >
            {isPublished && <CheckCircle2 className="size-3" />}
            {isPublished ? "Publicado" : "Borrador"}
          </span>
        </div>
      </div>

      {/* Center: Slot Switcher & Devices */}
      <div className="flex items-center gap-2">
        {/* Slot Switcher Tabs */}
        <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
          {SLOTS_CONFIG.map((slot) => {
            const Icon = slot.icon
            const isActive = activeSlot === slot.id
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveSlot(slot.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-background shadow-xs text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={`Editar Slot: ${slot.label}`}
              >
                <Icon className="size-3.5" />
                <span className="hidden md:inline">{slot.label}</span>
              </button>
            )
          })}
        </div>

        {/* Undo / Redo */}
        <div className="hidden xl:flex items-center gap-0.5 border-l border-border pl-2 ml-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Deshacer (Ctrl+Z)"
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Rehacer (Ctrl+Y)"
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="size-3.5" />
          </button>
        </div>

        {/* Device Switcher */}
        <div className="hidden sm:flex items-center rounded-lg border border-border p-0.5 bg-muted/30">
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
                "flex size-7 items-center justify-center rounded transition-all cursor-pointer",
                device === dev.id
                  ? "bg-background shadow-xs text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <dev.icon className="size-3.5" />
            </button>
          ))}
        </div>

        {/* Preview Mode Switcher */}
        <button
          type="button"
          onClick={togglePreviewMode}
          title={isPreviewMode ? "Salir de vista previa" : "Vista previa limpia"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
            isPreviewMode
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {isPreviewMode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          <span className="hidden lg:inline">{isPreviewMode ? "Editor" : "Previsualizar"}</span>
        </button>
      </div>

      {/* Right: Actions (Reset, Revisions, Save Draft, Publish) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {onOpenRevisions && (
          <button
            type="button"
            onClick={onOpenRevisions}
            title="Historial de versiones"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <History className="size-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Restablecer este slot a la plantilla recomendada por defecto?")) {
              resetCurrentSlotToDefault()
            }
          }}
          title="Restablecer slot actual"
          className="hidden sm:flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="size-3.5" />
          <span>Guardar borrador</span>
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Send className="size-3.5" />
          <span>{isSaving ? "Publicando..." : "Publicar"}</span>
        </button>
      </div>
    </header>
  )
}
