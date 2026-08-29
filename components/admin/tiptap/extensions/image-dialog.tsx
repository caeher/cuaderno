"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { ImageIcon, Link2, UploadCloud } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"

interface ImageDialogProps {
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_IMAGES = [
  {
    name: "Minimal Desk",
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Architecture & Light",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Code & Screen",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
  },
]

export function ImageDialog({ editor, open, onOpenChange }: ImageDialogProps) {
  const [url, setUrl] = React.useState("")
  const [alt, setAlt] = React.useState("")
  const [caption, setCaption] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    editor
      .chain()
      .focus()
      .setImage({
        src: url.trim(),
        alt: alt.trim() || undefined,
        title: caption.trim() || undefined,
      })
      .run()

    setUrl("")
    setAlt("")
    setCaption("")
    onOpenChange(false)
  }

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            Insertar Imagen
          </DialogTitle>
          <DialogDescription>
            Pega el enlace de una imagen o selecciona una de muestra para añadirla a tu publicación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="image-url">Enlace de la imagen (URL)</FieldLabel>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="image-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                className="pl-9"
                autoFocus
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="image-alt">Texto alternativo (Accesibilidad / SEO)</FieldLabel>
            <Input
              id="image-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Descripción de la imagen..."
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="image-caption">Pie de foto (Opcional)</FieldLabel>
            <Input
              id="image-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Leyenda o crédito..."
            />
          </Field>

          <div>
            <span className="text-xs font-medium text-muted-foreground">Imágenes sugeridas:</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => handleSelectSample(img.url)}
                  className="group relative aspect-video overflow-hidden rounded-md border border-border/80 text-left transition-all hover:border-primary focus:outline-none"
                >
                  <img src={img.url} alt={img.name} className="size-full object-cover transition-transform group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-background/80 px-1 py-0.5 text-[10px] font-medium backdrop-blur-sm">
                    {img.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Insertar imagen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
