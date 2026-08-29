import * as React from "react"
import { Sparkles, CheckCircle2 } from "lucide-react"

export interface PostKeyTakeawaysProps {
  excerpt?: string
  content?: string
  readingTimeMinutes?: number
}

/**
 * Key Takeaways / Executive Summary component for Generative Engine Optimization (GEO).
 * AI search engines (Perplexity, SearchGPT, Gemini) favor structured, concise summaries
 * with clear bullet points for direct answer generation and citation.
 */
export function PostKeyTakeaways({
  excerpt,
  content,
  readingTimeMinutes,
}: PostKeyTakeawaysProps) {
  // Extract key points either from headings or split sentences of excerpt
  const points: string[] = []

  if (excerpt) {
    const sentences = excerpt
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)

    points.push(...sentences.slice(0, 3))
  }

  // If we have content with headings, extract 1-2 key subheadings as topics
  if (content && points.length < 3) {
    const headingMatches = content.match(/^##\s+(.+)$/gm)
    if (headingMatches) {
      headingMatches.slice(0, 3 - points.length).forEach((h) => {
        const cleanHeading = h.replace(/^##\s+/, "").trim()
        if (!points.includes(cleanHeading)) {
          points.push(`Análisis detallado: ${cleanHeading}`)
        }
      })
    }
  }

  if (points.length === 0) return null

  return (
    <aside
      aria-label="Resumen ejecutivo y puntos clave"
      className="my-8 rounded-xl border border-ia-border bg-ia-tint p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 border-b border-ia-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-card text-ia">
            <Sparkles className="size-4" />
          </span>
          <h3 className="text-base font-semibold text-foreground">
            Puntos clave · Resumen rápido
          </h3>
        </div>
        {readingTimeMinutes && (
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {readingTimeMinutes} min de lectura
          </span>
        )}
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ia" />
            <span>{point.replace(/\.$/, "")}.</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
