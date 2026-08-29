"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { CanvasBlockWrapper } from "@/components/designer/canvas/canvas-block-wrapper"
import { Plus, Sparkles, Layout } from "lucide-react"
import { cn } from "@/lib/utils"

export function DesignerCanvas() {
  const { blocks, selectBlock, addBlock, insertTemplate, device, isPreviewMode } = useDesigner()

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectBlock(null)
    }
  }

  // Viewport width styling based on responsive device switcher
  const getDeviceWidthClass = () => {
    switch (device) {
      case "mobile":
        return "w-[375px] max-w-[375px] min-h-[667px] shadow-2xl rounded-3xl border-8 border-neutral-800"
      case "tablet":
        return "w-[768px] max-w-[768px] min-h-[1024px] shadow-xl rounded-2xl border-4 border-neutral-700"
      default:
        return "w-full max-w-5xl"
    }
  }

  return (
    <div
      onClick={handleCanvasClick}
      className="relative flex-1 overflow-y-auto bg-muted/40 p-4 md:p-8 flex justify-center items-start min-h-full"
    >
      <div
        onClick={handleCanvasClick}
        className={cn(
          "relative min-h-[600px] bg-card p-6 md:p-10 transition-all duration-300 flex flex-col gap-6 shadow-sm border border-border/70",
          getDeviceWidthClass()
        )}
      >
        {/* Device Mode Badge */}
        {!isPreviewMode && device !== "desktop" && (
          <div className="absolute top-2 right-4 text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
            Vista: {device}
          </div>
        )}

        {/* Blocks Rendering */}
        {blocks.map((block, idx) => (
          <CanvasBlockWrapper
            key={block.id}
            node={block}
            index={idx}
            totalSiblings={blocks.length}
            siblings={blocks}
          />
        ))}

        {/* Add Block / Section Bottom Prompters */}
        {!isPreviewMode && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center transition-colors hover:border-primary/50">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="size-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-foreground">Añadir Nueva Sección o Bloque</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inserta una sección en blanco o elige una plantilla prediseñada.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => addBlock("section")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-xs"
              >
                <Layout className="size-3.5" />
                Sección en blanco
              </button>
              <button
                type="button"
                onClick={() => insertTemplate("two-column-story")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
              >
                <Sparkles className="size-3.5 text-primary" />
                Plantilla 2 Columnas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
