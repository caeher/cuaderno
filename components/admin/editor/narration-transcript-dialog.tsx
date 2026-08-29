"use client"

import * as React from "react"
import { Copy, Check, Save, Sparkles, FileText } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { updateNarrationTranscriptAction } from "@/app/actions/narrations"

export interface NarrationTranscriptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  narrationId?: string
  postSlug?: string
  initialTranscript: string
  onTranscriptUpdated?: (newTranscript: string) => void
  onRegenerateRequested?: (editedTranscript: string) => void
}

export function NarrationTranscriptDialog({
  open,
  onOpenChange,
  narrationId,
  postSlug,
  initialTranscript,
  onTranscriptUpdated,
  onRegenerateRequested,
}: NarrationTranscriptDialogProps) {
  const [transcript, setTranscript] = React.useState(initialTranscript)
  const [isSaving, setIsSaving] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Synchronize when initial transcript changes
  React.useEffect(() => {
    setTranscript(initialTranscript)
  }, [initialTranscript, open])

  const wordCount = React.useMemo(() => {
    const trimmed = transcript.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [transcript])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      toast.success("Transcripción copiada al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar el texto")
    }
  }

  const handleSave = async () => {
    if (!narrationId) {
      onTranscriptUpdated?.(transcript)
      onOpenChange(false)
      return
    }

    try {
      setIsSaving(true)
      const res = await updateNarrationTranscriptAction(narrationId, transcript, postSlug)
      if (res.success) {
        toast.success("Transcripción guardada correctamente")
        onTranscriptUpdated?.(transcript)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Error al guardar la transcripción")
      }
    } catch {
      toast.error("Ocurrió un error inesperado al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerate = () => {
    onOpenChange(false)
    onRegenerateRequested?.(transcript)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <FileText className="size-5" />
            <DialogTitle className="text-lg">Transcripción del audio</DialogTitle>
          </div>
          <DialogDescription>
            Inspecciona o edita el texto exacto que se sintetiza para la narración.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{wordCount} palabras · {transcript.length} caracteres</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copied ? "Copiado" : "Copiar texto"}
            </Button>
          </div>

          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={10}
            placeholder="Texto del guion de voz..."
            className="text-xs font-mono leading-relaxed resize-y max-h-80"
          />

          <p className="text-[11px] text-muted-foreground">
            Puedes ajustar la puntuación o reemplazar términos específicos para mejorar la entonación y pronunciación de la voz.
          </p>
        </div>

        <DialogFooter showCloseButton={false} className="gap-2">
          {onRegenerateRequested && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRegenerate}
              className="mr-auto cursor-pointer gap-1.5"
            >
              <Sparkles className="size-3.5 text-primary" />
              Regenerar con este texto
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cerrar
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !transcript.trim()}
            className="cursor-pointer gap-1.5"
          >
            {isSaving ? <Spinner className="size-3.5" /> : <Save className="size-3.5" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
