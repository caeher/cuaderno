import React from "react"
import Link from "next/link"
import { ShieldCheck, Info, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface LegalTable {
  headers: string[]
  rows: string[][]
}

export interface LegalCallout {
  type?: "info" | "warning" | "success"
  title?: string
  text: string
}

export interface LegalSection {
  id?: string
  heading: string
  subheading?: string
  body?: string[]
  list?: string[]
  callout?: LegalCallout
  table?: LegalTable
}

export interface LegalKeyPoint {
  title: string
  description: string
}

export interface LegalPageProps {
  title: string
  updatedAt: string
  version?: string
  intro: string
  badge?: string
  keyPoints?: LegalKeyPoint[]
  sections: LegalSection[]
  relatedDocs?: { title: string; href: string }[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function LegalPage({
  title,
  updatedAt,
  version = "1.0",
  intro,
  badge = "Documento Oficial",
  keyPoints,
  sections,
  relatedDocs,
}: LegalPageProps) {
  return (
    <article className="min-w-0 max-w-3xl flex-1 pb-16">
      {/* Header */}
      <header className="border-b border-border/70 pb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="secondary" className="font-mono text-xs">
            {badge}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            Versión {version}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-mono text-xs text-muted-foreground">
            Actualizado el {updatedAt}
          </span>
        </div>

        <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-balance">
          {title}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
          {intro}
        </p>

        {/* Puntos clave / Resumen ejecutivo */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              <span>Puntos clave en lenguaje claro</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {keyPoints.map((point, idx) => (
                <div key={idx} className="rounded-lg bg-background/80 p-3 shadow-xs border border-border/50">
                  <div className="text-xs font-semibold text-foreground">
                    {point.title}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {point.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Tabla de contenido rápida */}
      {sections.length > 3 && (
        <nav aria-label="Índice del documento" className="my-8 rounded-lg border border-border/60 bg-muted/30 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contenido de esta página
          </h2>
          <ol className="mt-3 grid gap-1.5 sm:grid-cols-2 text-xs">
            {sections.map((section, index) => {
              const anchorId = section.id || slugify(section.heading)
              return (
                <li key={anchorId} className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground/70">{index + 1}.</span>
                  <a
                    href={`#${anchorId}`}
                    className="truncate text-foreground/80 hover:text-primary hover:underline transition-colors"
                  >
                    {section.heading.replace(/^\d+\.\s*/, "")}
                  </a>
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      {/* Secciones */}
      <div className="mt-10 flex flex-col gap-10">
        {sections.map((section) => {
          const anchorId = section.id || slugify(section.heading)
          return (
            <section key={anchorId} id={anchorId} className="scroll-mt-24">
              <h2 className="font-serif text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                {section.heading}
              </h2>

              {section.subheading && (
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {section.subheading}
                </p>
              )}

              {/* Párrafos */}
              {section.body && section.body.length > 0 && (
                <div className="mt-3.5 flex flex-col gap-3.5">
                  {section.body.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-muted-foreground text-pretty">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Lista con viñetas */}
              {section.list && section.list.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground list-disc marker:text-primary">
                  {section.list.map((item, index) => (
                    <li key={index} className="text-pretty">
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {/* Callout */}
              {section.callout && (
                <div
                  className={cn(
                    "mt-5 rounded-lg border p-4 text-xs leading-relaxed",
                    section.callout.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/10 text-foreground"
                      : section.callout.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                      : "border-primary/20 bg-primary/5 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {section.callout.type === "warning" ? (
                      <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                    ) : section.callout.type === "success" ? (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Info className="size-4 text-primary" />
                    )}
                    <span>{section.callout.title || "Nota importante"}</span>
                  </div>
                  <p className="mt-1.5 text-muted-foreground">{section.callout.text}</p>
                </div>
              )}

              {/* Tabla estructurada */}
              {section.table && (
                <div className="mt-5 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/70 text-foreground">
                      <tr>
                        {section.table.headers.map((head, i) => (
                          <th key={i} className="p-3 font-semibold border-b border-border">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 align-top text-muted-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Documentos relacionados */}
      {relatedDocs && relatedDocs.length > 0 && (
        <footer className="mt-16 border-t border-border/70 pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documentos relacionados
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedDocs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group flex items-center justify-between rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {doc.title}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  )
}
