"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { TEMPLATE_KITS } from "@/lib/designer/template-kits"
import { Sparkles, Plus, Check } from "lucide-react"

export function TemplateLibraryPanel() {
  const { insertTemplate, selectedBlockId } = useDesigner()
  const [insertedId, setInsertedId] = React.useState<string | null>(null)

  const handleInsert = (templateId: string) => {
    insertTemplate(templateId, selectedBlockId || undefined)
    setInsertedId(templateId)
    setTimeout(() => setInsertedId(null), 1500)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-card p-3 font-semibold text-xs text-foreground">
        <Sparkles className="size-4 text-primary" />
        <span>Kits de Secciones Prediseñadas</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Inserta secciones listas para usar con tipografía, colores y espaciados armoniosos en un solo clic.
        </p>

        <div className="flex flex-col gap-3">
          {TEMPLATE_KITS.map((kit) => (
            <div
              key={kit.id}
              className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-foreground">{kit.name}</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{kit.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleInsert(kit.id)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {insertedId === kit.id ? (
                  <>
                    <Check className="size-3.5" />
                    ¡Sección insertada!
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Insertar en el lienzo
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
