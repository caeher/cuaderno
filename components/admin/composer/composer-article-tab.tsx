"use client"

import * as React from "react"
import {
  FileText,
  Clock,
  Tag,
  FolderTree,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Share2,
  FileCheck,
  Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ComposerArtifact } from "@/lib/domain/entities"

export interface ComposerArticleTabProps {
  articleArtifact?: ComposerArtifact | null
  excerptArtifact?: ComposerArtifact | null
  taxonomyArtifact?: ComposerArtifact | null
  title?: string
  isCreatingDraft?: boolean
  onCreateDraft: () => void
  onRegenerateDraft?: () => void
  className?: string
}

export function ComposerArticleTab({
  articleArtifact,
  excerptArtifact,
  taxonomyArtifact,
  title,
  isCreatingDraft = false,
  onCreateDraft,
  onRegenerateDraft,
  className = "",
}: ComposerArticleTabProps) {
  // Parse taxonomy JSON if present
  const parsedTaxonomy = React.useMemo(() => {
    if (!taxonomyArtifact?.content) return null
    try {
      return JSON.parse(taxonomyArtifact.content)
    } catch {
      return null
    }
  }, [taxonomyArtifact])

  // Word count & Reading time calculation
  const wordCount = React.useMemo(() => {
    if (!articleArtifact?.content) return 0
    const text = articleArtifact.content.replace(/<[^>]*>/g, " ")
    return text.trim().split(/\s+/).filter(Boolean).length
  }, [articleArtifact])

  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  if (!articleArtifact || !articleArtifact.content) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground ${className}`}>
        <FileText className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-medium text-foreground">El artículo aún no ha sido redactado</p>
        <p className="text-[11px] mt-0.5 max-w-sm">
          Completa la fase de investigación y esquema para que Composer genere el borrador con citas verificadas y formato para TipTap.
        </p>
      </div>
    )
  }

  const tags = parsedTaxonomy?.tags || parsedTaxonomy?.suggestedTags || []
  const categories = parsedTaxonomy?.suggestedCategories || []
  const metaDescription = parsedTaxonomy?.metaDescription || excerptArtifact?.content || ""
  const suggestedSlug = parsedTaxonomy?.suggestedSlug || ""

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 p-3.5">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>~{readingTime} min de lectura</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="text-muted-foreground">
            <span>{wordCount.toLocaleString()} palabras</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <Badge variant="outline" className="text-[10px] font-mono">
            v{articleArtifact.version}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRegenerateDraft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRegenerateDraft}
              className="h-8 text-xs cursor-pointer gap-1.5"
            >
              <RefreshCw className="size-3" />
              Regenerar
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={onCreateDraft}
            disabled={isCreatingDraft}
            className="cursor-pointer gap-2 text-xs font-semibold h-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <FileCheck className="size-3.5" />
            {isCreatingDraft ? "Creando borrador..." : "Crear borrador en el editor"}
          </Button>
        </div>
      </div>

      {/* Main Editorial Preview */}
      <div className="rounded-xl border border-border/80 bg-card p-6 md:p-8 shadow-xs">
        {/* Article Title */}
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4 leading-tight">
          {title || "Borrador de artículo"}
        </h1>

        {/* Excerpt Lead */}
        {excerptArtifact?.content && (
          <p className="text-base text-muted-foreground font-normal leading-relaxed mb-6 pb-4 border-b border-border/60 italic">
            {excerptArtifact.content}
          </p>
        )}

        {/* HTML TipTap Body Content with rich formatting */}
        <div
          className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed
            prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:my-4 prose-p:leading-relaxed
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-md
            prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80
            prose-code:font-mono prose-code:text-xs prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm"
          dangerouslySetInnerHTML={{ __html: articleArtifact.content }}
        />
      </div>

      {/* Metadata & SEO Suggestions Card */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-5 text-xs">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Tag className="size-3.5 text-primary" /> Metadatos y Taxonomías generadas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Categories & Tags */}
          <div className="flex flex-col gap-2">
            {categories.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <FolderTree className="size-3" /> Categorías sugeridas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Tag className="size-3" /> Etiquetas (Tags):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tg: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[10px] font-mono">
                      #{tg}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEO & Slug */}
          <div className="flex flex-col gap-2">
            {suggestedSlug && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground font-medium">Slug de URL propuesto:</span>
                <span className="font-mono text-foreground font-medium bg-background border border-border/60 rounded px-2 py-1 select-all">
                  /{suggestedSlug}
                </span>
              </div>
            )}

            {metaDescription && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground font-medium">Meta descripción SEO:</span>
                <p className="text-muted-foreground leading-snug">
                  {metaDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
