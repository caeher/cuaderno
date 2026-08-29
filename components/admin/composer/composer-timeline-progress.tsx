"use client"

import * as React from "react"
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  Loader2,
  Sparkles,
  Search,
  FileText,
  Image as ImageIcon,
  CheckCheck,
  Ban,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ComposerSessionStatus } from "@/lib/domain/entities"

export interface ComposerTimelineProgressProps {
  status: ComposerSessionStatus
  activeJobKind?: string
  progress?: number
  wantsCover?: boolean
  isProcessing?: boolean
  onCancel?: () => void
  onRetry?: () => void
  className?: string
}

interface StepItem {
  id: string
  label: string
  icon: React.ElementType
  statuses: ComposerSessionStatus[]
}

export function ComposerTimelineProgress({
  status,
  activeJobKind,
  progress = 0,
  wantsCover = true,
  isProcessing = false,
  onCancel,
  onRetry,
  className = "",
}: ComposerTimelineProgressProps) {
  const steps: StepItem[] = React.useMemo(() => {
    const baseSteps: StepItem[] = [
      { id: "brief", label: "Brief editorial", icon: FileText, statuses: ["collecting"] },
      { id: "research", label: "Investigación web", icon: Search, statuses: ["awaiting_confirmation", "researching"] },
      { id: "draft", label: "Redacción", icon: Sparkles, statuses: ["drafting"] },
    ]

    if (wantsCover) {
      baseSteps.push({ id: "cover", label: "Portada visual", icon: ImageIcon, statuses: ["imaging"] })
    }

    baseSteps.push({ id: "review", label: "Revisión final", icon: CheckCheck, statuses: ["awaiting_review"] })
    return baseSteps
  }, [wantsCover])

  const getStepState = (stepIndex: number) => {
    if (status === "failed") {
      // Find where it failed
      return "idle"
    }
    if (status === "cancelled") {
      return "idle"
    }

    const currentStepIndex = steps.findIndex((s) => s.statuses.includes(status))
    if (currentStepIndex === -1) {
      if (status === "awaiting_review") return "completed"
      return "idle"
    }

    if (stepIndex < currentStepIndex) return "completed"
    if (stepIndex === currentStepIndex) return "active"
    return "idle"
  }

  const isTerminalFailed = status === "failed"
  const isTerminalCancelled = status === "cancelled"
  const isTerminalComplete = status === "awaiting_review"

  return (
    <div className={`flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-xs ${className}`}>
      {/* Header with Title & Action controls */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Progreso del artículo
          </span>
          {isProcessing && (
            <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
              <Loader2 className="size-3 animate-spin" />
              <span>{activeJobKind ? `Procesando ${activeJobKind}...` : "En curso..."}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isProcessing && onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-6 text-[11px] text-muted-foreground hover:text-destructive cursor-pointer gap-1 px-2"
            >
              <Ban className="size-3" />
              Cancelar
            </Button>
          )}

          {isTerminalFailed && onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-6 text-[11px] cursor-pointer gap-1 px-2"
            >
              <RefreshCw className="size-3" />
              Reintentar
            </Button>
          )}
        </div>
      </div>

      {/* Steps Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1">
        {steps.map((step, idx) => {
          const stepState = getStepState(idx)
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 rounded-lg p-2 transition-all ${
                stepState === "active"
                  ? "bg-primary/10 border border-primary/20 text-primary font-medium"
                  : stepState === "completed"
                    ? "bg-muted/40 text-muted-foreground"
                    : "text-muted-foreground/60"
              }`}
            >
              <div className="shrink-0">
                {stepState === "completed" ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : stepState === "active" ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/40" />
                )}
              </div>

              <div className="flex flex-col overflow-hidden text-[11px] leading-tight">
                <span className="truncate">{step.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Bar during active job */}
      {isProcessing && progress > 0 && (
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Progreso de la fase actual</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.max(5, Math.min(100, progress * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Terminal banners */}
      {isTerminalFailed && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
          <XCircle className="size-4 shrink-0" />
          <span>La sesión se detuvo debido a un error. Puedes reintentar la fase o ajustar el brief.</span>
        </div>
      )}

      {isTerminalCancelled && (
        <div className="flex items-center gap-2 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
          <Ban className="size-4 shrink-0" />
          <span>Esta sesión fue cancelada por el usuario.</span>
        </div>
      )}

      {isTerminalComplete && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>Investigación y borrador listos para revisión final y creación de post borrador.</span>
        </div>
      )}
    </div>
  )
}
