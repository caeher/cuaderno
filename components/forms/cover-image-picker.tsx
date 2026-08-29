"use client"

import * as React from "react"
import Image from "next/image"
import { ImageIcon, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CoverImagePickerProps {
  value?: string | null
  onChange: (url: string) => void
  altText?: string
  onAltTextChange?: (alt: string) => void
  isAiGenerated?: boolean
  aspectRatio?: "16/9" | "3/1" | "16/10" | "21/9"
  className?: string
}

const aspectClasses = {
  "16/9": "aspect-[16/9]",
  "3/1": "aspect-[3/1]",
  "16/10": "aspect-[16/10]",
  "21/9": "aspect-[21/9]",
}

export function CoverImagePicker({
  value,
  onChange,
  altText,
  onAltTextChange,
  isAiGenerated,
  aspectRatio = "3/1",
  className,
}: CoverImagePickerProps) {
  const [showInput, setShowInput] = React.useState(Boolean(value))
  const [tempUrl, setTempUrl] = React.useState(value || "")

  React.useEffect(() => {
    setTempUrl(value || "")
  }, [value])

  const handleClear = () => {
    onChange("")
    setTempUrl("")
    setShowInput(false)
  }

  const handleApply = () => {
    onChange(tempUrl.trim())
    setShowInput(Boolean(tempUrl.trim()))
  }

  if (value) {
    return (
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border border-border bg-muted",
          aspectClasses[aspectRatio],
          className
        )}
      >
        <Image
          src={value}
          alt={altText || "Imagen de portada"}
          fill
          className="object-cover"
          unoptimized={value.startsWith("http")}
        />
        {isAiGenerated && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
            <Sparkles className="size-3 text-primary" />
            <span>Generada con IA</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-background cursor-pointer"
          title="Quitar portada"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  if (showInput) {
    return (
      <div className={cn("flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4", className)}>
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="size-4" />
            URL de la imagen de portada
          </span>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cancelar
          </button>
        </div>
        <div className="flex gap-2">
          <Input
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleApply()
              }
            }}
          />
          <Button size="sm" onClick={handleApply}>
            Listo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setShowInput(true)}
      className={cn(
        "flex items-center gap-2 self-start rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer",
        className
      )}
    >
      <ImageIcon className="size-3.5" />
      Añadir imagen de portada
    </button>
  )
}
