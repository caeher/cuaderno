"use client"

import * as React from "react"
import {
  ListTree,
  Sparkles,
  RefreshCw,
  FileEdit,
  CheckCircle2,
  Layers,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ComposerArtifact, ComposerOutline } from "@/lib/domain/entities"

export interface ComposerOutlineTabProps {
  outlineArtifact?: ComposerArtifact | null
  isGeneratingDraft?: boolean
  onProceedToDraft: () => void
  onRegenerateOutline?: () => void
  canProceed?: boolean
  className?: string
}

export function ComposerOutlineTab({
  outlineArtifact,
  isGeneratingDraft = false,
  onProceedToDraft,
  onRegenerateOutline,
  canProceed = true,
  className = "",
}: ComposerOutlineTabProps) {
  const parsedOutline = React.useMemo<ComposerOutline | null>(() => {
    if (!outlineArtifact?.content) return null
    try {
      // Try parsing JSON structure
      const raw = outlineArtifact.content.trim()
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, raw]
      const jsonStr = jsonMatch[1] || raw
      const parsed = JSON.parse(jsonStr)
      if (parsed && (parsed.sections || parsed.suggestedTitle)) {
        return parsed as ComposerOutline
      }
      return null
    } catch {
      return null
    }
  }, [outlineArtifact])

  if (!outlineArtifact || !outlineArtifact.content) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground ${className}`}>
        <ListTree className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-medium text-foreground">No hay esquema generado</p>
        <p className="text-[11px] mt-0.5 max-w-sm">
          Completa la investigación web para generar un esquema estructurado con jerarquía de encabezados y fuentes mapeadas.
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 p-3">
        <div className="flex items-center gap-2">
          <ListTree className="size-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            Esquema editorial estructurado
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            v{outlineArtifact.version}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRegenerateOutline && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRegenerateOutline}
              className="h-7 text-xs cursor-pointer gap-1"
            >
              <RefreshCw className="size-3" />
              Regenerar
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={onProceedToDraft}
            disabled={!canProceed || isGeneratingDraft}
            className="cursor-pointer gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="size-3.5" />
            {isGeneratingDraft ? "Iniciando redacción..." : "Redactar artículo completo"}
          </Button>
        </div>
      </div>

      {/* Structured Outline Content */}
      {parsedOutline ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-5 shadow-2xs">
          {/* Title & Summary */}
          {parsedOutline.suggestedTitle && (
            <div className="flex flex-col gap-1 border-b border-border/60 pb-3">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Título sugerido:
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground leading-snug">
                {parsedOutline.suggestedTitle}
              </h3>
              {parsedOutline.summary && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {parsedOutline.summary}
                </p>
              )}
            </div>
          )}

          {/* Sections List */}
          {parsedOutline.sections && parsedOutline.sections.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Estructura de secciones ({parsedOutline.sections.length}):
              </span>

              <div className="flex flex-col gap-2.5">
                {parsedOutline.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-foreground">
                          {section.title}
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        H{section.level || 2}
                      </Badge>
                    </div>

                    {section.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed pl-7">
                        {section.description}
                      </p>
                    )}

                    {/* Key points */}
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <ul className="flex flex-col gap-1 pl-7 pt-1">
                        {section.keyPoints.map((pt, pIdx) => (
                          <li
                            key={pIdx}
                            className="flex items-start gap-1.5 text-[11px] text-foreground/90"
                          >
                            <span className="text-primary mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Mapped Sources */}
                    {section.relevantSources && section.relevantSources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pl-7 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span className="font-medium">Fuentes:</span>
                        {section.relevantSources.map((src, sIdx) => (
                          <Badge key={sIdx} variant="secondary" className="text-[9px] font-mono">
                            {src}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback formatted plain text outline */
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs">
          <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {outlineArtifact.content}
          </pre>
        </div>
      )}
    </div>
  )
}
