"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Unlink2,
  Type,
  Palette,
  Box,
  Layers,
} from "lucide-react"

const PRESET_COLORS = [
  { label: "Heredado", value: "inherit", bg: "transparent" },
  { label: "Primario", value: "var(--primary)", bg: "var(--primary)" },
  { label: "Texto", value: "var(--foreground)", bg: "var(--foreground)" },
  { label: "Atenuado", value: "var(--muted-foreground)", bg: "var(--muted-foreground)" },
  { label: "Fondo Suave", value: "rgba(0, 0, 0, 0.04)", bg: "rgba(128, 128, 128, 0.15)" },
  { label: "Esmeralda", value: "#10b981", bg: "#10b981" },
  { label: "Cielo", value: "#0284c7", bg: "#0284c7" },
  { label: "Ámbar", value: "#f59e0b", bg: "#f59e0b" },
  { label: "Rosa", value: "#f43f5e", bg: "#f43f5e" },
]

export function StyleTab() {
  const { getSelectedBlock, updateBlockStyle } = useDesigner()
  const block = getSelectedBlock()

  const [paddingLinked, setPaddingLinked] = React.useState(true)
  const [marginLinked, setMarginLinked] = React.useState(false)

  if (!block) return null

  const style = block.style || {}

  const handleStyleChange = (key: string, value: any) => {
    updateBlockStyle(block.id, { [key]: value })
  }

  const handlePaddingChange = (side: "top" | "right" | "bottom" | "left", val: string) => {
    const formatted = val.endsWith("px") || val.endsWith("rem") || val.endsWith("%") ? val : `${val}px`
    if (paddingLinked) {
      updateBlockStyle(block.id, {
        padding: { top: formatted, right: formatted, bottom: formatted, left: formatted },
      })
    } else {
      updateBlockStyle(block.id, {
        padding: { ...(style.padding || {}), [side]: formatted },
      })
    }
  }

  const handleMarginChange = (side: "top" | "right" | "bottom" | "left", val: string) => {
    const formatted = val === "auto" || val.endsWith("px") || val.endsWith("rem") ? val : `${val}px`
    if (marginLinked) {
      updateBlockStyle(block.id, {
        margin: { top: formatted, right: formatted, bottom: formatted, left: formatted },
      })
    } else {
      updateBlockStyle(block.id, {
        margin: { ...(style.margin || {}), [side]: formatted },
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 text-xs">
      {/* 1. TIPOGRAFÍA */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground/90 border-b border-border pb-1.5">
          <Type className="size-3.5 text-primary" />
          <span>Tipografía & Texto</span>
        </div>

        {/* Font Family */}
        <Field>
          <FieldLabel>Familia de Fuente</FieldLabel>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "var(--font-serif)", label: "Serif Editorial" },
              { id: "var(--font-sans)", label: "Sans Moderna" },
              { id: "var(--font-mono)", label: "Monoespacio" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleStyleChange("fontFamily", f.id)}
                className={`rounded border p-1.5 text-[11px] font-medium transition-colors ${
                  style.fontFamily === f.id
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel>Tamaño de Letra</FieldLabel>
            <Input
              value={style.fontSize || ""}
              onChange={(e) => handleStyleChange("fontSize", e.target.value)}
              placeholder="Ej: 18px, 2rem"
              className="text-xs font-mono"
            />
          </Field>
          <Field>
            <FieldLabel>Grosor (Weight)</FieldLabel>
            <select
              value={style.fontWeight || 400}
              onChange={(e) => handleStyleChange("fontWeight", Number(e.target.value))}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="300">Ligero (300)</option>
              <option value="400">Normal (400)</option>
              <option value="500">Medio (500)</option>
              <option value="600">Seminegrita (600)</option>
              <option value="700">Negrita (700)</option>
              <option value="800">Extra Negrita (800)</option>
            </select>
          </Field>
        </div>

        {/* Text Align */}
        <Field>
          <FieldLabel>Alineación</FieldLabel>
          <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
            {[
              { id: "left", icon: AlignLeft },
              { id: "center", icon: AlignCenter },
              { id: "right", icon: AlignRight },
              { id: "justify", icon: AlignJustify },
            ].map((al) => (
              <button
                key={al.id}
                type="button"
                onClick={() => handleStyleChange("textAlign", al.id)}
                className={`flex flex-1 items-center justify-center rounded py-1 transition-colors ${
                  (style.textAlign || "left") === al.id
                    ? "bg-background shadow-xs text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <al.icon className="size-3.5" />
              </button>
            ))}
          </div>
        </Field>

        {/* Text Color */}
        <Field>
          <FieldLabel>Color de Texto</FieldLabel>
          <div className="flex flex-wrap gap-1.5 items-center">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => handleStyleChange("color", c.value)}
                className={`size-6 rounded-full border border-border transition-transform hover:scale-110 flex items-center justify-center ${
                  style.color === c.value ? "ring-2 ring-primary ring-offset-1" : ""
                }`}
                style={{ backgroundColor: c.bg }}
              />
            ))}
            <Input
              value={style.color || ""}
              onChange={(e) => handleStyleChange("color", e.target.value)}
              placeholder="#000000"
              className="h-7 w-24 text-[11px] font-mono"
            />
          </div>
        </Field>
      </div>

      {/* 2. ESPACIADO (PADDING & MARGIN) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground/90 border-b border-border pb-1.5">
          <Box className="size-3.5 text-primary" />
          <span>Espaciado & Relleno</span>
        </div>

        {/* Padding */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Relleno Interior (Padding)</FieldLabel>
            <button
              type="button"
              onClick={() => setPaddingLinked(!paddingLinked)}
              className={`rounded p-1 text-xs transition-colors ${
                paddingLinked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              }`}
              title={paddingLinked ? "Valores enlazados" : "Valores independientes"}
            >
              {paddingLinked ? <Link2 className="size-3.5" /> : <Unlink2 className="size-3.5" />}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
            <div>
              <span className="text-muted-foreground">Arriba</span>
              <Input
                value={style.padding?.top?.replace("px", "") || "0"}
                onChange={(e) => handlePaddingChange("top", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
            <div>
              <span className="text-muted-foreground">Der.</span>
              <Input
                value={style.padding?.right?.replace("px", "") || "0"}
                onChange={(e) => handlePaddingChange("right", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
            <div>
              <span className="text-muted-foreground">Abajo</span>
              <Input
                value={style.padding?.bottom?.replace("px", "") || "0"}
                onChange={(e) => handlePaddingChange("bottom", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
            <div>
              <span className="text-muted-foreground">Izq.</span>
              <Input
                value={style.padding?.left?.replace("px", "") || "0"}
                onChange={(e) => handlePaddingChange("left", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
          </div>
        </Field>

        {/* Margin */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Margen Exterior</FieldLabel>
            <button
              type="button"
              onClick={() => setMarginLinked(!marginLinked)}
              className={`rounded p-1 text-xs transition-colors ${
                marginLinked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              }`}
              title={marginLinked ? "Valores enlazados" : "Valores independientes"}
            >
              {marginLinked ? <Link2 className="size-3.5" /> : <Unlink2 className="size-3.5" />}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
            <div>
              <span className="text-muted-foreground">Arriba</span>
              <Input
                value={style.margin?.top?.replace("px", "") || "0"}
                onChange={(e) => handleMarginChange("top", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
            <div>
              <span className="text-muted-foreground">Der.</span>
              <Input
                value={style.margin?.right?.replace("px", "") || "0"}
                onChange={(e) => handleMarginChange("right", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
            <div>
              <span className="text-muted-foreground">Abajo</span>
              <Input
                value={style.margin?.bottom?.replace("px", "") || "0"}
                onChange={(e) => handleMarginChange("bottom", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
            <div>
              <span className="text-muted-foreground">Izq.</span>
              <Input
                value={style.margin?.left?.replace("px", "") || "0"}
                onChange={(e) => handleMarginChange("left", e.target.value)}
                className="mt-0.5 text-center text-xs h-7"
              />
            </div>
          </div>
        </Field>
      </div>

      {/* 3. FONDO */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground/90 border-b border-border pb-1.5">
          <Palette className="size-3.5 text-primary" />
          <span>Fondo & Apariencia</span>
        </div>

        <Field>
          <FieldLabel>Color de Fondo</FieldLabel>
          <div className="flex flex-wrap gap-1.5 items-center">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => handleStyleChange("backgroundColor", c.value === "inherit" ? undefined : c.value)}
                className={`size-6 rounded-full border border-border transition-transform hover:scale-110 ${
                  style.backgroundColor === c.value ? "ring-2 ring-primary ring-offset-1" : ""
                }`}
                style={{ backgroundColor: c.bg }}
              />
            ))}
            <Input
              value={style.backgroundColor || ""}
              onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
              placeholder="rgba(0,0,0,0.05)"
              className="h-7 w-32 text-[11px] font-mono"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>Degradado de Fondo (CSS Gradient)</FieldLabel>
          <Input
            value={style.backgroundGradient || ""}
            onChange={(e) => handleStyleChange("backgroundGradient", e.target.value)}
            placeholder="linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
            className="text-xs font-mono"
          />
        </Field>
      </div>

      {/* 4. BORDES & SOMBRAS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground/90 border-b border-border pb-1.5">
          <Layers className="size-3.5 text-primary" />
          <span>Bordes & Esquinas</span>
        </div>

        {/* Border Radius */}
        <Field>
          <FieldLabel>Esquinas Redondeadas (Border Radius)</FieldLabel>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: "0px", label: "0px" },
              { id: "8px", label: "8px" },
              { id: "16px", label: "16px" },
              { id: "9999px", label: "Píldora" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleStyleChange("borderRadius", r.id)}
                className={`rounded border p-1 text-[11px] font-mono ${
                  style.borderRadius === r.id
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Border Width & Color */}
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel>Grosor del Borde</FieldLabel>
            <select
              value={style.borderWidth || "0px"}
              onChange={(e) => {
                handleStyleChange("borderWidth", e.target.value)
                if (e.target.value !== "0px" && !style.borderStyle) {
                  handleStyleChange("borderStyle", "solid")
                }
              }}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none"
            >
              <option value="0px">Sin borde</option>
              <option value="1px">1px</option>
              <option value="2px">2px</option>
              <option value="4px">4px</option>
            </select>
          </Field>
          <Field>
            <FieldLabel>Color de Borde</FieldLabel>
            <Input
              value={style.borderColor || ""}
              onChange={(e) => handleStyleChange("borderColor", e.target.value)}
              placeholder="rgba(0,0,0,0.1)"
              className="h-8 text-xs font-mono"
            />
          </Field>
        </div>

        {/* Box Shadow */}
        <Field>
          <FieldLabel>Sombra (Box Shadow)</FieldLabel>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "none", label: "Ninguna" },
              { id: "0 2px 8px -2px rgba(0,0,0,0.08)", label: "Sutil" },
              { id: "0 8px 24px -4px rgba(0,0,0,0.12)", label: "Media" },
              { id: "0 20px 40px -10px rgba(0,0,0,0.2)", label: "Elevada" },
              { id: "0 0 20px rgba(var(--primary), 0.3)", label: "Glow ✨" },
            ].map((sh) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => handleStyleChange("boxShadow", sh.id === "none" ? undefined : sh.id)}
                className={`rounded border p-1 text-[11px] ${
                  (style.boxShadow || "none") === sh.id
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {sh.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  )
}
