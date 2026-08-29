"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { Check, Palette } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export const NOTION_TEXT_COLORS = [
  { label: "Por defecto", value: "inherit", color: "currentColor" },
  { label: "Gris", value: "#787774", color: "#787774" },
  { label: "Marrón", value: "#9f6b53", color: "#9f6b53" },
  { label: "Naranja", value: "#d9730d", color: "#d9730d" },
  { label: "Amarillo", value: "#cb912f", color: "#cb912f" },
  { label: "Verde", value: "#448361", color: "#448361" },
  { label: "Azul", value: "#337ea9", color: "#337ea9" },
  { label: "Morado", value: "#9065b0", color: "#9065b0" },
  { label: "Rosa", value: "#c14c8a", color: "#c14c8a" },
  { label: "Rojo", value: "#d44c47", color: "#d44c47" },
]

export const NOTION_BG_COLORS = [
  { label: "Sin fondo", value: "transparent", bg: "transparent" },
  { label: "Gris tenue", value: "rgba(227, 226, 224, 0.6)", bg: "rgba(227, 226, 224, 0.8)" },
  { label: "Marrón tenue", value: "rgba(238, 224, 218, 0.7)", bg: "rgba(238, 224, 218, 0.9)" },
  { label: "Naranja tenue", value: "rgba(250, 222, 201, 0.7)", bg: "rgba(250, 222, 201, 0.9)" },
  { label: "Amarillo tenue", value: "rgba(253, 236, 200, 0.7)", bg: "rgba(253, 236, 200, 0.9)" },
  { label: "Verde tenue", value: "rgba(219, 237, 219, 0.7)", bg: "rgba(219, 237, 219, 0.9)" },
  { label: "Azul tenue", value: "rgba(211, 229, 239, 0.7)", bg: "rgba(211, 229, 239, 0.9)" },
  { label: "Morado tenue", value: "rgba(232, 222, 238, 0.7)", bg: "rgba(232, 222, 238, 0.9)" },
  { label: "Rosa tenue", value: "rgba(244, 223, 235, 0.7)", bg: "rgba(244, 223, 235, 0.9)" },
  { label: "Rojo tenue", value: "rgba(251, 228, 228, 0.7)", bg: "rgba(251, 228, 228, 0.9)" },
]

interface ColorPickerProps {
  editor: Editor
}

export function ColorPicker({ editor }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)

  const activeColor = editor.getAttributes("textStyle").color || "inherit"
  const activeHighlight = editor.getAttributes("highlight").color || "transparent"

  const setTextColor = (color: string) => {
    if (color === "inherit") {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(color).run()
    }
  }

  const setBgColor = (color: string) => {
    if (color === "transparent") {
      editor.chain().focus().unsetHighlight().run()
    } else {
      editor.chain().focus().setHighlight({ color }).run()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          (activeColor !== "inherit" || activeHighlight !== "transparent") && "bg-muted text-foreground",
        )}
        aria-label="Color de texto y resaltado"
      >
        <Palette className="size-4" />
      </PopoverTrigger>
      <PopoverContent className="w-56 rounded-xl p-2 text-sm" align="start">
        <div className="flex flex-col gap-3">
          <div>
            <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Color de texto
            </span>
            <div className="mt-1 flex flex-col gap-0.5">
              {NOTION_TEXT_COLORS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setTextColor(item.value)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-foreground transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3.5 rounded-full border border-border"
                      style={{ backgroundColor: item.color }}
                    />
                    <span style={{ color: item.value === "inherit" ? undefined : item.value }}>{item.label}</span>
                  </span>
                  {activeColor === item.value && <Check className="size-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-2.5">
            <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Fondo de resaltado
            </span>
            <div className="mt-1 flex flex-col gap-0.5">
              {NOTION_BG_COLORS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setBgColor(item.value)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-foreground transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3.5 rounded border border-border"
                      style={{ backgroundColor: item.bg }}
                    />
                    <span>{item.label}</span>
                  </span>
                  {activeHighlight === item.value && <Check className="size-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
