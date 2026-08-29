"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { EyeOff, Sparkles, Code, Monitor, Tablet, Smartphone } from "lucide-react"

export function AdvancedTab() {
  const { getSelectedBlock, updateBlockStyle } = useDesigner()
  const block = getSelectedBlock()

  if (!block) return null

  const style = block.style || {}

  const handleStyleChange = (key: string, value: any) => {
    updateBlockStyle(block.id, { [key]: value })
  }

  return (
    <div className="flex flex-col gap-6 p-4 text-xs">
      {/* 1. VISIBILIDAD RESPONSIVA */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground/90 border-b border-border pb-1.5">
          <EyeOff className="size-3.5 text-primary" />
          <span>Visibilidad por Dispositivo</span>
        </div>
        <FieldDescription>
          Oculta este bloque en determinados tamaños de pantalla para ofrecer una experiencia optimizada.
        </FieldDescription>

        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center gap-2">
              <Monitor className="size-4 text-muted-foreground" />
              <span>Ocultar en Escritorio (&gt; 1024px)</span>
            </div>
            <input
              type="checkbox"
              checked={Boolean(style.hideOnDesktop)}
              onChange={(e) => handleStyleChange("hideOnDesktop", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center gap-2">
              <Tablet className="size-4 text-muted-foreground" />
              <span>Ocultar en Tableta (768px - 1024px)</span>
            </div>
            <input
              type="checkbox"
              checked={Boolean(style.hideOnTablet)}
              onChange={(e) => handleStyleChange("hideOnTablet", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:bg-muted/30 cursor-pointer">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-muted-foreground" />
              <span>Ocultar en Móvil (&lt; 768px)</span>
            </div>
            <input
              type="checkbox"
              checked={Boolean(style.hideOnMobile)}
              onChange={(e) => handleStyleChange("hideOnMobile", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </label>
        </div>
      </div>

      {/* 2. ANIMACIONES */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground/90 border-b border-border pb-1.5">
          <Sparkles className="size-3.5 text-primary" />
          <span>Efectos de Entrada</span>
        </div>

        <Field>
          <FieldLabel>Animación al Cargar</FieldLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "none", label: "Ninguna" },
              { id: "fadeIn", label: "Aparecer (Fade In)" },
              { id: "slideUp", label: "Deslizar Arriba" },
              { id: "zoomIn", label: "Agrandar (Zoom In)" },
            ].map((anim) => (
              <button
                key={anim.id}
                type="button"
                onClick={() => handleStyleChange("animation", anim.id === "none" ? undefined : anim.id)}
                className={`rounded border p-2 text-xs font-medium text-left transition-colors ${
                  (style.animation || "none") === anim.id
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {anim.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* 3. CLASES & CSS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground/90 border-b border-border pb-1.5">
          <Code className="size-3.5 text-primary" />
          <span>Código & Clases CSS</span>
        </div>

        <Field>
          <FieldLabel>Clases Tailwind o CSS Adicionales</FieldLabel>
          <Input
            value={style.customClass || ""}
            onChange={(e) => handleStyleChange("customClass", e.target.value)}
            placeholder="shadow-2xl hover:-translate-y-1 transition-all"
            className="text-xs font-mono"
          />
        </Field>

        <Field>
          <FieldLabel>CSS Personalizado Inline</FieldLabel>
          <Textarea
            value={style.customCss || ""}
            onChange={(e) => handleStyleChange("customCss", e.target.value)}
            placeholder="filter: grayscale(20%); transform: rotate(1deg);"
            rows={3}
            className="text-xs font-mono"
          />
        </Field>
      </div>
    </div>
  )
}
