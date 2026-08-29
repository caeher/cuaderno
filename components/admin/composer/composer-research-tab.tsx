"use client"

import * as React from "react"
import {
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Filter,
  CheckCircle2,
  XCircle,
  Globe,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { ComposerSource } from "@/lib/domain/entities"

export interface ComposerResearchTabProps {
  sources: ComposerSource[]
  isTogglingSource?: boolean
  onToggleSourceExclusion: (sourceId: string, isExcluded: boolean) => void
  onProceedToOutline?: () => void
  onProceedToDraft?: () => void
  canProceed?: boolean
  className?: string
}

export function ComposerResearchTab({
  sources,
  isTogglingSource = false,
  onToggleSourceExclusion,
  onProceedToOutline,
  onProceedToDraft,
  canProceed = true,
  className = "",
}: ComposerResearchTabProps) {
  const [filterQuery, setFilterQuery] = React.useState("")

  const filteredSources = React.useMemo(() => {
    if (!filterQuery.trim()) return sources
    const q = filterQuery.toLowerCase()
    return sources.filter(
      (s) =>
        s.url.toLowerCase().includes(q) ||
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.domain && s.domain.toLowerCase().includes(q)) ||
        (s.publisher && s.publisher.toLowerCase().includes(q)) ||
        (s.snippet && s.snippet.toLowerCase().includes(q))
    )
  }, [sources, filterQuery])

  const totalSources = sources.length
  const activeSources = sources.filter((s) => !s.isExcluded).length
  const totalClaims = sources.reduce((sum, s) => sum + (s.claims?.length || 0), 0)

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Globe className="size-3.5 text-primary" />
            <span>{totalSources} fuentes consultadas</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 className="size-3 text-emerald-500" />
            <span>{activeSources} activas para redacción</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="size-3 text-blue-500" />
            <span>{totalClaims} afirmaciones verificadas</span>
          </div>
        </div>

        {/* Action button to proceed */}
        <div className="flex items-center gap-2">
          {onProceedToOutline && (
            <Button
              size="sm"
              onClick={onProceedToOutline}
              disabled={!canProceed || activeSources === 0}
              className="cursor-pointer gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="size-3.5" />
              Generar esquema (Outline)
            </Button>
          )}

          {onProceedToDraft && !onProceedToOutline && (
            <Button
              size="sm"
              onClick={onProceedToDraft}
              disabled={!canProceed || activeSources === 0}
              className="cursor-pointer gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="size-3.5" />
              Aprobar y redactar artículo
            </Button>
          )}
        </div>
      </div>

      {/* Filter Input */}
      {totalSources > 2 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar por dominio, título o contenido de fuente..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      )}

      {/* Sources List */}
      {filteredSources.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground">
          <Search className="size-8 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-medium text-foreground">
            {filterQuery ? "No hay fuentes que coincidan con la búsqueda" : "No se han registrado fuentes todavía"}
          </p>
          <p className="text-[11px] mt-0.5 max-w-sm">
            {filterQuery
              ? "Prueba con otro término o limpia el filtro."
              : "Las fuentes investigadas en la web aparecerán aquí con enlaces verificables y claims clasificados."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSources.map((source) => {
            const isExcluded = Boolean(source.isExcluded)

            return (
              <div
                key={source.id}
                className={`rounded-lg border p-4 transition-all ${
                  isExcluded
                    ? "border-border/50 bg-muted/20 opacity-60"
                    : "border-border/80 bg-card hover:border-border shadow-2xs"
                }`}
              >
                {/* Top: Domain, Publisher, Toggle */}
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-border/50">
                  <div className="flex flex-wrap items-center gap-2">
                    {source.domain && (
                      <Badge variant="outline" className="text-[10px] font-mono bg-muted/50">
                        {source.domain}
                      </Badge>
                    )}
                    {source.publisher && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {source.publisher}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      {isExcluded ? "Excluida" : "Incluida"}
                    </span>
                    <Switch
                      checked={!isExcluded}
                      onCheckedChange={(checked) => onToggleSourceExclusion(source.id, !checked)}
                      disabled={isTogglingSource}
                      title={isExcluded ? "Re-incluir en la redacción" : "Excluir de la redacción"}
                    />
                  </div>
                </div>

                {/* Title & Verified Link */}
                <div className="pt-2">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                  >
                    <span>{source.title || source.url}</span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </div>

                {/* Snippet */}
                {source.snippet && (
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    «{source.snippet}»
                  </p>
                )}

                {/* Claims list */}
                {source.claims && source.claims.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-border/40">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Afirmaciones extraídas ({source.claims.length}):
                    </span>
                    <div className="flex flex-col gap-1">
                      {source.claims.map((claim, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-start gap-1.5 rounded-sm bg-muted/40 p-1.5 text-[11px]"
                        >
                          {claim.status === "confirmed" ? (
                            <ShieldCheck className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                          ) : claim.status === "inferred" ? (
                            <AlertCircle className="size-3 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <HelpCircle className="size-3 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className="flex-1 text-foreground leading-snug">{claim.text}</span>
                          <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                            {claim.status === "confirmed"
                              ? "Confirmado"
                              : claim.status === "inferred"
                                ? "Inferencia"
                                : "Sin verificar"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
