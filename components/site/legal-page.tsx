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
      <header className="border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant="secondary"
            className="border-border bg-surface-sunken text-xs text-muted-foreground"
          >
            {badge}
          </Badge>
          <span className="text-xs tabular-nums text-text-tertiary">
            Versión {version}
          </span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-xs tabular-nums text-text-tertiary">
            Actualizado el {updatedAt}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
          {intro}
        </p>

        {/* Puntos clave / Resumen ejecutivo */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-surface-sunken p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="size-4 text-text-tertiary" />
              <span>Puntos clave en lenguaje claro</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {keyPoints.map((point, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card p-3">
                  <div className="text-sm font-semibold text-foreground">
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
        <nav aria-label="Índice del documento" className="my-8 rounded-xl border border-border bg-surface-sunken p-4">
          <h2 className="text-sm font-semibold text-foreground">
            Contenido de esta página
          </h2>
          <ol className="mt-3 grid gap-1.5 sm:grid-cols-2 text-xs">
            {sections.map((section, index) => {
              const anchorId = section.id || slugify(section.heading)
              return (
                <li key={anchorId} className="flex items-center gap-2">
                  <span className="tabular-nums text-text-tertiary">{index + 1}.</span>
                  <a
                    href={`#${anchorId}`}
                    className="truncate text-muted-foreground transition-colors hover:text-ia hover:underline"
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
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {section.heading}
              </h2>

              {section.subheading && (
                <p className="mt-1 text-xs font-medium text-text-tertiary">
                  {section.subheading}
                </p>
              )}

              {/* Párrafos */}
              {section.body && section.body.length > 0 && (
                <div className="mt-3.5 flex flex-col gap-3.5">
                  {section.body.map((paragraph, index) => (
                    <p key={index} className="text-base leading-relaxed text-muted-foreground text-pretty">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Lista con viñetas */}
              {section.list && section.list.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2 pl-5 text-base leading-relaxed text-muted-foreground list-disc marker:text-text-tertiary">
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
                    "mt-5 rounded-xl border p-4 text-sm leading-relaxed",
                    section.callout.type === "warning"
                      ? "border-border bg-warn-tint text-foreground"
                      : section.callout.type === "success"
                      ? "border-border bg-perf-tint text-foreground"
                      : "border-ia-border bg-ia-tint text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {section.callout.type === "warning" ? (
                      <AlertCircle className="size-4 text-warn-ink" />
                    ) : section.callout.type === "success" ? (
                      <CheckCircle2 className="size-4 text-perf-strong" />
                    ) : (
                      <Info className="size-4 text-ia" />
                    )}
                    <span>{section.callout.title || "Nota importante"}</span>
                  </div>
                  <p className="mt-1.5 text-muted-foreground">{section.callout.text}</p>
                </div>
              )}

              {/* Tabla estructurada */}
              {section.table && (
                <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-sunken text-muted-foreground">
                      <tr>
                        {section.table.headers.map((head, i) => (
                          <th key={i} className="border-b border-border p-3 font-medium">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="transition-colors hover:bg-surface-sunken">
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
        <footer className="mt-16 border-t border-border pt-8">
          <h3 className="text-base font-semibold text-foreground">
            Documentos relacionados
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedDocs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-surface-sunken"
              >
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-ia">
                  {doc.title}
                </span>
                <ArrowRight className="size-4 text-text-tertiary transition-all group-hover:translate-x-1 group-hover:text-ia" />
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  )
}
