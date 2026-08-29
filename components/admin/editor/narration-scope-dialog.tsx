"use client"

import * as React from "react"
import { Sparkles, Mic, FileText, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cleanPostToSpeechScript } from "@/lib/server/speech-script-sanitizer"

export interface NarrationScopeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postTitle: string
  postExcerpt?: string
  postContent: string
  isGenerating?: boolean
  onConfirm: (options: { language: string }) => void | Promise<void>
}

export function NarrationScopeDialog({
  open,
  onOpenChange,
  postTitle,
  postExcerpt,
  postContent,
  isGenerating = false,
  onConfirm,
}: NarrationScopeDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState("es")

  // Generate preview of sanitized speech script
  const scriptPreview = React.useMemo(() => {
    try {
      return cleanPostToSpeechScript(
        postTitle || "Sin título",
        postContent || "",
        postExcerpt || undefined,
        { language: selectedLanguage }
      )
    } catch {
      return {
        speechScript: `${postTitle || ""}. ${postExcerpt || ""}`.trim(),
        wordCount: 0,
        estimatedDurationSeconds: 0,
        characterCount: 0,
      }
    }
  }, [postTitle, postContent, postExcerpt, selectedLanguage])

  const formattedEstimatedTime = React.useMemo(() => {
    const totalSecs = scriptPreview.estimatedDurationSeconds
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    if (mins === 0) return `${secs} s`
    return `${mins} min ${secs > 0 ? `${secs} s` : ""}`
  }, [scriptPreview.estimatedDurationSeconds])

  const handleConfirm = async () => {
    await onConfirm({
      language: selectedLanguage,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Mic className="size-5" />
            <DialogTitle className="text-lg">Generar narración de voz</DialogTitle>
          </div>
          <DialogDescription>
            Revisa el alcance del texto que se transformará en audio para los lectores.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/80 bg-muted/40 p-3 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <div>
                <span className="font-semibold text-foreground">{scriptPreview.wordCount}</span>
                <span className="text-muted-foreground"> palabras</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <div>
                <span className="font-semibold text-foreground">~{formattedEstimatedTime}</span>
                <span className="text-muted-foreground"> duración est.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Idioma del audio</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isGenerating}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="es">Español (es)</option>
              <option value="en">Inglés (en)</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              La voz se toma de la configuración global del servidor.
            </p>
          </div>

          {/* Text Scope Preview */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Texto a narrar (limpio de etiquetas y código):</span>
              <span>{scriptPreview.characterCount} caracteres</span>
            </div>
            <div className="max-h-36 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-foreground/90 select-text">
              {scriptPreview.speechScript || (
                <span className="italic text-muted-foreground">
                  No hay texto suficiente en el título o contenido.
                </span>
              )}
            </div>
          </div>

          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-[11px] leading-snug text-muted-foreground">
            💡 <strong className="text-foreground">Nota:</strong> El audio se generará de forma
            asíncrona en segundo plano sin interrumpir tu edición ni modificar el contenido del post.
          </div>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isGenerating || scriptPreview.wordCount === 0}
            className="cursor-pointer gap-1.5"
          >
            {isGenerating ? (
              <>
                <Spinner className="size-3.5" />
                Iniciando generación...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                Confirmar y generar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
