"use client"

import * as React from "react"
import {
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldCheck,
  Info,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface ComposerCoverTabProps {
  coverUrl?: string | null
  altText?: string | null
  version?: number
  wantsCover?: boolean
  isGeneratingCover?: boolean
  onGenerateCover: () => void
  onRegenerateCover?: () => void
  canProceed?: boolean
  className?: string
}

export function ComposerCoverTab({
  coverUrl,
  altText,
  version = 1,
  wantsCover = true,
  isGeneratingCover = false,
  onGenerateCover,
  onRegenerateCover,
  canProceed = true,
  className = "",
}: ComposerCoverTabProps) {
  if (!wantsCover && !coverUrl) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground ${className}`}>
        <ImageIcon className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-medium text-foreground">Portada desactivada en el brief</p>
        <p className="text-[11px] mt-0.5 max-w-sm">
          Puedes activar la generación de portada en cualquier momento para crear una imagen panorámica 16:9 adaptada a tu artículo.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={onGenerateCover}
          disabled={!canProceed || isGeneratingCover}
          className="mt-4 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Sparkles className="size-3.5" />
          {isGeneratingCover ? "Generando..." : "Generar portada ahora"}
        </Button>
      </div>
    )
  }

  if (!coverUrl) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground ${className}`}>
        <ImageIcon className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-medium text-foreground">La portada aún no se ha generado</p>
        <p className="text-[11px] mt-0.5 max-w-sm">
          Al completar la redacción del artículo o solicitarla explícitamente, se generará una portada horizontal 16:9 con texto alternativo accesible.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={onGenerateCover}
          disabled={!canProceed || isGeneratingCover}
          className="mt-4 cursor-pointer gap-1.5 text-xs font-medium"
        >
          <Sparkles className="size-3.5" />
          {isGeneratingCover ? "Generando..." : "Generar portada"}
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 p-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-4 text-purple-500" />
          <span className="text-xs font-semibold text-foreground">
            Portada editorial adaptada
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            v{version} • 16:9
          </Badge>
        </div>

        {onRegenerateCover && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegenerateCover}
            disabled={isGeneratingCover}
            className="h-7 text-xs cursor-pointer gap-1.5"
          >
            <RefreshCw className={`size-3 ${isGeneratingCover ? "animate-spin" : ""}`} />
            {isGeneratingCover ? "Generando..." : "Regenerar portada"}
          </Button>
        )}
      </div>

      {/* Image Preview Container */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="relative aspect-16/9 w-full bg-muted overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={altText || "Portada generada por Composer"}
            className="h-full w-full object-cover transition-all"
          />
        </div>

        {/* Accessibility & Prompt Metadata Footer */}
        <div className="flex flex-col gap-2 p-4 border-t border-border/60 bg-muted/10 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Eye className="size-3.5 text-blue-500" /> Texto alternativo accesible (WCAG):
            </span>
            <p className="text-foreground bg-background border border-border/60 rounded-md p-2 text-xs">
              {altText || "Imagen de portada conceptual para el artículo."}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-500" />
              Composición horizontal sin tipografía superpuesta
            </span>
            <span>Almacenado en Convex Storage</span>
          </div>
        </div>
      </div>
    </div>
  )
}
