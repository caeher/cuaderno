"use client"

import * as React from "react"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  FileText,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import type { PostNarration } from "@/lib/domain/entities"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isPublicNarrationPlaybackEnabled } from "@/lib/public/narration-flags"
import { recordNarrationPlaybackAction } from "@/app/actions/narrations"

export interface PostAudioPlayerProps {
  narration?: PostNarration | null
  postTitle: string
  postSlug?: string
  className?: string
}

export function PostAudioPlayer({
  narration,
  postTitle,
  postSlug,
  className = "",
}: PostAudioPlayerProps) {
  // Return null if there is no ready audio to keep layout 100% untouched
  if (
    !isPublicNarrationPlaybackEnabled() ||
    !narration ||
    narration.status !== "ready" ||
    !narration.audioUrl
  ) {
    return null
  }

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const playerContainerRef = React.useRef<HTMLElement | null>(null)

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(narration.duration || 0)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [isTranscriptOpen, setIsTranscriptOpen] = React.useState(false)

  const reportPlayback = (
    event: "play" | "pause" | "complete" | "seek" | "rate_change",
    extras?: { playedSeconds?: number; playbackRate?: number }
  ) => {
    const metricPostId = narration.postId || postSlug
    if (!metricPostId) return
    void recordNarrationPlaybackAction({
      postId: metricPostId,
      event,
      playedSeconds: extras?.playedSeconds ?? currentTime,
      totalDurationSeconds: duration || narration.duration || 0,
      playbackRate: extras?.playbackRate ?? playbackRate,
    })
  }

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return "00:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        toast.error("No se pudo iniciar la reproducción del audio.")
      })
    }
  }

  // Skip backward 10s
  const skipBackward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
  }

  // Skip forward 10s
  const skipForward = () => {
    if (!audioRef.current) return
    const maxDur = duration || audioRef.current.duration || 0
    audioRef.current.currentTime = Math.min(maxDur, audioRef.current.currentTime + 10)
  }

  // Volume change
  const handleVolumeChange = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolume(clamped)
    if (audioRef.current) {
      audioRef.current.volume = clamped
      audioRef.current.muted = clamped === 0
      setIsMuted(clamped === 0)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    audioRef.current.muted = nextMuted
  }

  // Playback rate cycle
  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2, 0.75]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length] ?? 1
    setPlaybackRate(nextRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate
    }
    reportPlayback("rate_change", { playbackRate: nextRate })
  }

  // Handle Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value)
    setCurrentTime(target)
    if (audioRef.current) {
      audioRef.current.currentTime = target
    }
  }

  // Download Transcript as .txt
  const handleDownloadTranscript = () => {
    if (!narration.transcript) {
      toast.error("No hay transcripción disponible para descargar.")
      return
    }

    const filename = `${postSlug || "articulo"}-transcripcion.txt`
    const blob = new Blob([narration.transcript], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Transcripción descargada")
  }

  // Keyboard accessibility listeners inside container
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Space or 'k' toggles play/pause (avoid triggering when typing in inputs)
    if (e.target instanceof HTMLInputElement && e.target.type !== "range") return
    if (e.target instanceof HTMLTextAreaElement) return

    if (e.code === "Space" || e.key === "k" || e.key === "K") {
      e.preventDefault()
      togglePlay()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      skipBackward()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      skipForward()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      handleVolumeChange(volume + 0.1)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      handleVolumeChange(volume - 0.1)
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault()
      toggleMute()
    }
  }

  const voiceName = narration.voice || "Sarah"
  const formattedDuration = formatTime(duration || narration.duration || 0)

  return (
    <section
      ref={playerContainerRef}
      role="region"
      aria-label={`Reproductor de narración de audio para: ${postTitle}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={cn(
        "post-audio-player my-8 rounded-2xl border border-primary/20 bg-card p-4 sm:p-5 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/40",
        className
      )}
    >
      {/* HTML5 Native Audio element (with strictly disabled autoplay) */}
      <audio
        ref={audioRef}
        src={narration.audioUrl}
        preload="metadata"
        autoPlay={false}
        onPlay={() => {
          setIsPlaying(true)
          reportPlayback("play")
        }}
        onPause={() => {
          setIsPlaying(false)
          reportPlayback("pause")
        }}
        onEnded={() => {
          setIsPlaying(false)
          reportPlayback("complete", {
            playedSeconds: duration || narration.duration || 0,
          })
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || narration.duration || 0)
          }
        }}
      />

      {/* No-JS Fallback for Assistive Tech / Search Bots */}
      <noscript>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold mb-2">Escuchar narración del artículo:</p>
          <audio controls src={narration.audioUrl} preload="none">
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      </noscript>

      {/* Top Header: Badge and Voice Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <span className="font-semibold text-foreground">Escuchar artículo narrado</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Audio IA · Voz {voiceName}
          </span>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
          <span>{formatTime(currentTime)} / {formattedDuration}</span>
        </div>
      </div>

      {/* Main Controls Section */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Progress Bar / Scrubber */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={duration || narration.duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Posición de reproducción de audio"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration || narration.duration || 1)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} de ${formattedDuration}`}
            className="h-2 w-full appearance-none rounded-lg bg-muted accent-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Playback action group */}
          <div className="flex items-center gap-2">
            {/* Skip -10s */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={skipBackward}
              title="Retroceder 10 segundos (←)"
              aria-label="Retroceder 10 segundos"
              className="cursor-pointer size-8 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-4" />
            </Button>

            {/* Play / Pause Toggle */}
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              title={isPlaying ? "Pausar (Espacio o K)" : "Reproducir (Espacio o K)"}
              aria-label={isPlaying ? "Pausar narración" : "Reproducir narración"}
              className="cursor-pointer size-10 rounded-full shadow-xs"
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5 fill-current ml-0.5" />
              )}
            </Button>

            {/* Skip +10s */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={skipForward}
              title="Avanzar 10 segundos (→)"
              aria-label="Avanzar 10 segundos"
              className="cursor-pointer size-8 text-muted-foreground hover:text-foreground"
            >
              <RotateCw className="size-4" />
            </Button>
          </div>

          {/* Speed & Volume group */}
          <div className="flex items-center gap-3">
            {/* Playback speed toggle pill */}
            <Button
              variant="outline"
              size="sm"
              onClick={cyclePlaybackRate}
              title="Cambiar velocidad de reproducción"
              aria-label={`Velocidad de reproducción: ${playbackRate}x`}
              className="h-8 px-2.5 text-xs font-mono font-medium cursor-pointer"
            >
              {playbackRate}x
            </Button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleMute}
                title={isMuted ? "Activar sonido (M)" : "Silenciar (M)"}
                aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                className="size-8 cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="Control de volumen"
                className="w-16 h-1.5 appearance-none rounded bg-muted accent-primary cursor-pointer"
              />
            </div>

            {/* Transcript Accordion Trigger */}
            {narration.transcript && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
                aria-expanded={isTranscriptOpen}
                aria-controls="narration-transcript-content"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <FileText className="size-3.5" />
                <span className="hidden md:inline">Transcripción</span>
                {isTranscriptOpen ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Transcript Panel */}
      {isTranscriptOpen && narration.transcript && (
        <div
          id="narration-transcript-content"
          className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-4 transition-all animate-in fade-in-50"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              Texto de la narración
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTranscript}
              className="h-7 text-[11px] gap-1.5 cursor-pointer"
              title="Descargar transcripción en texto plano (.txt)"
            >
              <Download className="size-3" />
              Descargar .txt
            </Button>
          </div>

          <div className="mt-3 max-h-60 overflow-y-auto pr-1 text-xs leading-relaxed text-foreground/90 select-text font-serif">
            {narration.transcript.split("\n").map((para, idx) =>
              para.trim() ? (
                <p key={idx} className="mb-2.5 last:mb-0">
                  {para}
                </p>
              ) : null
            )}
          </div>
        </div>
      )}
    </section>
  )
}
