"use client"

import * as React from "react"
import {
  Mic,
  Sparkles,
  RefreshCw,
  Trash2,
  FileText,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { NarrationScopeDialog } from "./narration-scope-dialog"
import { NarrationTranscriptDialog } from "./narration-transcript-dialog"
import {
  generatePostNarrationAction,
  retryPostNarrationAction,
  deletePostNarrationAction,
  getNarrationServiceHealthAction,
} from "@/app/actions/narrations"
import { computeNarrationSourceHash } from "@/lib/domain/entities"
import { cleanPostToSpeechScript } from "@/lib/server/speech-script-sanitizer"
import {
  getNarrationUnavailableMessage,
  type NarrationHealthSnapshot,
} from "@/lib/application/panel"

export interface PostNarrationManagerProps {
  postId?: string
  postSlug?: string
  postTitle: string
  postExcerpt?: string
  postContent: string
  userRole?: "owner" | "admin" | string
  className?: string
}

export function PostNarrationManager({
  postId,
  postSlug,
  postTitle,
  postExcerpt,
  postContent,
  userRole = "owner",
  className = "",
}: PostNarrationManagerProps) {
  // 1. Reactive live subscription to Convex for real-time background status updates
  const narrationDoc = useQuery(
    api.narrations.getForPost,
    postId ? { postId } : "skip"
  )

  // Local state for modals & controls
  const [isScopeDialogOpen, setIsScopeDialogOpen] = React.useState(false)
  const [isTranscriptDialogOpen, setIsTranscriptDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [serviceHealth, setServiceHealth] = React.useState<NarrationHealthSnapshot | null>(null)

  React.useEffect(() => {
    let cancelled = false
    getNarrationServiceHealthAction()
      .then((status) => {
        if (!cancelled) setServiceHealth(status)
      })
      .catch(() => {
        if (!cancelled) {
          setServiceHealth({
            enabled: false,
            isConfigured: false,
            isKillSwitchActive: false,
            reason: "No se pudo comprobar el estado del servicio de narración.",
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const serviceUnavailableMessage = serviceHealth
    ? getNarrationUnavailableMessage(serviceHealth)
    : null
  const isServiceEnabled = serviceHealth === null || serviceHealth.enabled

  // Audio preview state
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)

  const isAuthorized = userRole === "owner" || userRole === "admin"
  const isPostSaved = Boolean(postId)

  // Determine if narration is outdated comparing live editor content with generated hash
  const isContentOutdated = React.useMemo(() => {
    if (!narrationDoc || narrationDoc.status !== "ready") return false
    if ("isOutdated" in narrationDoc && narrationDoc.isOutdated) return true
    if (!("contentHash" in narrationDoc) || !narrationDoc.contentHash) return false

    const script = cleanPostToSpeechScript(
      postTitle || "",
      postContent || "",
      postExcerpt,
      { language: narrationDoc.language || "es" }
    )
    const currentHash = computeNarrationSourceHash(
      postTitle || "",
      script.speechScript,
      narrationDoc.language || "es"
    )
    return narrationDoc.contentHash !== currentHash
  }, [narrationDoc, postTitle, postContent, postExcerpt])

  // Handle audio playback toggle
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        toast.error("No se pudo reproducir el audio")
      })
    }
  }

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "00:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Handle generation start
  const handleGenerate = async (options: { language: string }) => {
    if (!postId) {
      toast.error("Guarda el post antes de generar el audio")
      return
    }

    try {
      setIsSubmitting(true)
      setIsScopeDialogOpen(false)
      toast.info("Iniciando generación de narración de voz...", {
        description: "El audio se procesa en segundo plano. Puedes continuar redactando.",
      })

      const res = await generatePostNarrationAction(postId, options)
      if (res.success) {
        if (res.reusedExisting) {
          toast.success("Narración cargada desde almacenamiento existente.")
        } else {
          toast.success("¡Narración de voz generada con éxito!")
        }
      } else {
        toast.error(res.error || "No se pudo generar la narración.")
      }
    } catch {
      toast.error("Ocurrió un error al procesar la solicitud de audio.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle retry or update
  const handleRetry = async () => {
    if (!postId) return
    try {
      setIsSubmitting(true)
      toast.info("Actualizando narración de voz...")
      const res = await retryPostNarrationAction(postId)
      if (res.success) {
        toast.success("¡Narración actualizada con éxito!")
      } else {
        toast.error(res.error || "Error al actualizar la narración.")
      }
    } catch {
      toast.error("Ocurrió un error al actualizar el audio.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!narrationDoc?._id) return
    try {
      setIsSubmitting(true)
      const res = await deletePostNarrationAction(narrationDoc._id, postSlug)
      if (res.success) {
        toast.success("Narración de audio eliminada.")
        if (audioRef.current) {
          audioRef.current.pause()
          setIsPlaying(false)
        }
      } else {
        toast.error(res.error || "Error al eliminar la narración.")
      }
    } catch {
      toast.error("Ocurrió un error inesperado al eliminar.")
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // If user is not authorized (not owner/admin), do not render
  if (!isAuthorized) {
    return null
  }

  // CASE 1: Post not saved yet
  if (!isPostSaved) {
    return (
      <div className={`rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-xs ${className}`}>
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <Mic className="size-4 text-muted-foreground/70 shrink-0" />
          <span>
            <strong className="font-medium text-foreground">Narración de audio:</strong> Guarda este borrador para habilitar la generación de voz para los lectores.
          </span>
        </div>
      </div>
    )
  }

  const status = narrationDoc?.status || "none"

  return (
    <div className={`rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-all ${className}`}>
      {/* Header / Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mic className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Narración de voz
              {status === "generating" && (
                <Badge variant="secondary" className="text-[10px] animate-pulse bg-blue-500/10 text-blue-600 border-blue-500/20">
                  Generando...
                </Badge>
              )}
              {status === "ready" && !isContentOutdated && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                  <CheckCircle2 className="size-3" /> Audio listo
                </Badge>
              )}
              {status === "ready" && isContentOutdated && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                  <AlertTriangle className="size-3" /> Desactualizado
                </Badge>
              )}
              {status === "failed" && (
                <Badge variant="destructive" className="text-[10px] gap-1">
                  Error
                </Badge>
              )}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Genera una versión leída del artículo con voz natural y transcripción accesible.
            </p>
          </div>
        </div>

        {/* Primary Action Button when none or failed */}
        {(status === "none" || !narrationDoc) && (
          <Button
            size="sm"
            onClick={() => setIsScopeDialogOpen(true)}
            disabled={isSubmitting || !isServiceEnabled}
            className="cursor-pointer gap-1.5 text-xs font-medium"
          >
            <Sparkles className="size-3.5" />
            Generar audio
          </Button>
        )}
      </div>

      {serviceUnavailableMessage && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong className="font-medium">Vapi no está operativo:</strong> {serviceUnavailableMessage}
          </p>
        </div>
      )}

      {/* STATE 1: GENERATING (Non-blocking banner) */}
      {status === "generating" && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2.5">
            <Spinner className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium">Sintetizando narración en segundo plano...</p>
              <p className="text-[11px] text-muted-foreground">
                Puedes seguir editando y guardando el post. La página se actualizará automáticamente cuando esté listo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: FAILED */}
      {status === "failed" && (
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
          <div className="flex items-start gap-2.5 text-destructive">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">No se pudo completar la narración</p>
              <p className="text-[11px] text-muted-foreground">
                {narrationDoc && "error" in narrationDoc && narrationDoc.error
                  ? narrationDoc.error
                  : "Ocurrió un error durante la síntesis del audio. Por favor intenta de nuevo."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isSubmitting}
            className="cursor-pointer gap-1.5 text-xs shrink-0 self-end sm:self-auto"
          >
            <RefreshCw className={`size-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
            Reintentar
          </Button>
        </div>
      )}

      {/* STATE 3: READY / OUTDATED */}
      {status === "ready" && narrationDoc && (
        <div className="mt-3 flex flex-col gap-3">
          {/* Outdated notice if text changed */}
          {isContentOutdated && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>El contenido del post se ha modificado desde que se generó este audio.</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isSubmitting}
                className="h-7 text-xs bg-background/80 hover:bg-background border-amber-500/40 text-amber-900 dark:text-amber-200 cursor-pointer gap-1 shrink-0"
              >
                <RefreshCw className={`size-3 ${isSubmitting ? "animate-spin" : ""}`} />
                Actualizar audio
              </Button>
            </div>
          )}

          {/* Author Pre-listening Audio Player */}
          {narrationDoc.audioUrl && (
            <div className="flex flex-col sm:flex-row items-center gap-3 rounded-lg border border-border/80 bg-muted/40 p-3">
              <audio
                ref={audioRef}
                src={narrationDoc.audioUrl}
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime)
                    setDuration(audioRef.current.duration || narrationDoc.duration || 0)
                  }
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    setDuration(audioRef.current.duration || narrationDoc.duration || 0)
                  }
                }}
              />

              <Button
                size="icon-sm"
                variant="default"
                onClick={togglePlay}
                className="size-8 rounded-full shrink-0 cursor-pointer"
                title={isPlaying ? "Pausar" : "Escuchar narración"}
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current ml-0.5" />}
              </Button>

              <div className="flex flex-1 flex-col gap-1 w-full">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || narrationDoc.duration || 0)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || narrationDoc.duration || 1}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    const target = parseFloat(e.target.value)
                    setCurrentTime(target)
                    if (audioRef.current) {
                      audioRef.current.currentTime = target
                    }
                  }}
                  className="h-1.5 w-full appearance-none rounded-lg bg-muted-foreground/30 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                <Volume2 className="size-3.5" />
                <span className="capitalize">{narrationDoc.voice || "Sarah"}</span>
              </div>
            </div>
          )}

          {/* Action Toolbar for the Author */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTranscriptDialogOpen(true)}
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                <FileText className="size-3 text-muted-foreground" />
                Ver / Editar transcripción
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsScopeDialogOpen(true)}
                disabled={isSubmitting}
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                <RefreshCw className="size-3 text-muted-foreground" />
                Reemplazar audio
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isSubmitting}
              className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-1.5 ml-auto"
            >
              <Trash2 className="size-3" />
              Eliminar audio
            </Button>
          </div>
        </div>
      )}

      {/* Dialog: Scope Confirmation */}
      <NarrationScopeDialog
        open={isScopeDialogOpen}
        onOpenChange={setIsScopeDialogOpen}
        postTitle={postTitle}
        postExcerpt={postExcerpt}
        postContent={postContent}
        isGenerating={isSubmitting}
        onConfirm={handleGenerate}
      />

      {/* Dialog: Transcript Viewer / Editor */}
      {narrationDoc && (
        <NarrationTranscriptDialog
          open={isTranscriptDialogOpen}
          onOpenChange={setIsTranscriptDialogOpen}
          narrationId={narrationDoc._id}
          postSlug={postSlug}
          initialTranscript={"transcript" in narrationDoc && narrationDoc.transcript ? narrationDoc.transcript : ""}
          onRegenerateRequested={(_edited) => {
            setIsScopeDialogOpen(true)
          }}
        />
      )}

      {/* Dialog: Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="¿Eliminar la narración de audio?"
        description="Esta acción eliminará permanentemente el archivo de audio generado y su transcripción asociada. Los lectores ya no podrán escuchar el post hasta que generes una nueva narración."
        confirmText="Eliminar audio"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
