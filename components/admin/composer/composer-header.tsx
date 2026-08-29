"use client"

import * as React from "react"
import {
  Sparkles,
  Server,
  PlusCircle,
  FileCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Ban,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ComposerCostBadge } from "./composer-cost-badge"
import { ComposerSessionSelector } from "./composer-session-selector"
import type { ComposerSessionStatus } from "@/lib/domain/entities"

export interface ComposerHeaderProps {
  sessionId?: string | null
  title?: string
  status?: ComposerSessionStatus
  tenantName?: string
  isCreatingDraft?: boolean
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onCreateDraft?: () => void
  className?: string
}

export function ComposerHeader({
  sessionId,
  title,
  status,
  tenantName,
  isCreatingDraft = false,
  onSelectSession,
  onNewSession,
  onCreateDraft,
  className = "",
}: ComposerHeaderProps) {
  const getStatusBadge = (st?: ComposerSessionStatus) => {
    switch (st) {
      case "awaiting_review":
        return (
          <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 font-medium">
            <CheckCircle2 className="size-3" /> Listo para borrador
          </Badge>
        )
      case "researching":
        return (
          <Badge variant="secondary" className="text-[11px] bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse gap-1 font-medium">
            <Loader2 className="size-3 animate-spin" /> Investigando...
          </Badge>
        )
      case "drafting":
        return (
          <Badge variant="secondary" className="text-[11px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20 animate-pulse gap-1 font-medium">
            <Loader2 className="size-3 animate-spin" /> Redactando...
          </Badge>
        )
      case "imaging":
        return (
          <Badge variant="secondary" className="text-[11px] bg-purple-500/10 text-purple-600 border-purple-500/20 animate-pulse gap-1 font-medium">
            <Loader2 className="size-3 animate-spin" /> Generando portada...
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-[11px] gap-1 font-medium">
            <AlertCircle className="size-3" /> Error
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="text-[11px] text-muted-foreground gap-1 font-medium">
            <Ban className="size-3" /> Cancelada
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4 ${className}`}>
      {/* Left: Title, Badges & Tenant */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Sparkles className="size-4" />
          </div>
          <h1 className="font-serif text-lg md:text-xl font-bold text-foreground truncate max-w-md">
            {title || "Composer — Asistente Editorial"}
          </h1>
          {getStatusBadge(status)}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
          {tenantName && (
            <span className="flex items-center gap-1">
              <Building2 className="size-3 text-muted-foreground" />
              <strong className="font-medium text-foreground">{tenantName}</strong>
            </span>
          )}
          <span className="text-muted-foreground/40">•</span>
          <span className="flex items-center gap-1">
            <Server className="size-3 text-blue-500" />
            <span>Modelo gestionado por el servidor</span>
          </span>
        </div>
      </div>

      {/* Right: Actions, History & Cost Telemetry */}
      <div className="flex flex-wrap items-center gap-2">
        <ComposerCostBadge sessionId={sessionId} />

        <ComposerSessionSelector
          activeSessionId={sessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNewSession}
          className="cursor-pointer gap-1.5 text-xs h-8"
        >
          <PlusCircle className="size-3.5 text-muted-foreground" />
          <span>Nueva sesión</span>
        </Button>

        {status === "awaiting_review" && onCreateDraft && (
          <Button
            type="button"
            size="sm"
            onClick={onCreateDraft}
            disabled={isCreatingDraft}
            className="cursor-pointer gap-1.5 text-xs font-semibold h-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <FileCheck className="size-3.5" />
            {isCreatingDraft ? "Creando..." : "Crear borrador"}
          </Button>
        )}
      </div>
    </div>
  )
}
