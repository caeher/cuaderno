"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { WIDGET_DEFINITIONS } from "@/lib/designer/widget-definitions"
import { ContentTab } from "@/components/designer/panels/tabs/content-tab"
import { StyleTab } from "@/components/designer/panels/tabs/style-tab"
import { AdvancedTab } from "@/components/designer/panels/tabs/advanced-tab"
import {
  SlidersHorizontal,
  Palette,
  Settings2,
  Trash2,
  Copy,
  X,
  FileText,
  MousePointerClick,
  Sparkles,
} from "lucide-react"

export function BlockInspector() {
  const {
    getSelectedBlock,
    inspectorSubTab,
    setInspectorSubTab,
    deleteBlock,
    duplicateBlock,
    selectBlock,
    updateBlockName,
  } = useDesigner()

  const block = getSelectedBlock()

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-96">
        <MousePointerClick className="size-8 stroke-1 text-muted-foreground/60 mb-2 animate-pulse" />
        <h4 className="font-medium text-sm text-foreground">Ningún bloque seleccionado</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Haz clic sobre cualquier bloque en el lienzo o añádelo desde la galería para editar sus propiedades.
        </p>
      </div>
    )
  }

  const meta = WIDGET_DEFINITIONS[block.type]
  const title = block.name || meta?.name || block.type

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with Title & Quick Block Actions */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary flex-none">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-foreground truncate block">{title}</span>
            <span className="text-[10px] font-mono text-muted-foreground truncate block">#{block.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => duplicateBlock(block.id)}
            title="Duplicar bloque"
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => deleteBlock(block.id)}
            title="Eliminar bloque"
            className="flex size-7 items-center justify-center rounded text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => selectBlock(null)}
            title="Cerrar inspector"
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Tab Bar (Contenido, Estilo, Avanzado) */}
      <div className="flex border-b border-border bg-card">
        {[
          { id: "content", label: "Contenido", icon: FileText },
          { id: "style", label: "Estilo", icon: Palette },
          { id: "advanced", label: "Avanzado", icon: Settings2 },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setInspectorSubTab(tab.id as any)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              inspectorSubTab === tab.id
                ? "border-primary text-primary font-semibold bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40"
            }`}
          >
            <tab.icon className="size-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto">
        {inspectorSubTab === "content" && <ContentTab />}
        {inspectorSubTab === "style" && <StyleTab />}
        {inspectorSubTab === "advanced" && <AdvancedTab />}
      </div>
    </div>
  )
}
