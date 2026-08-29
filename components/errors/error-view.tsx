"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  RotateCcw,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Bug,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorViewProps {
  error: Error & { digest?: string }
  retry?: () => void
  reset?: () => void
  title?: string
  description?: string
  badge?: string
  homeUrl?: string
  homeLabel?: string
  showHome?: boolean
  className?: string
  customActions?: React.ReactNode
}

export function ErrorView({
  error,
  retry,
  reset,
  title = "Algo no ha salido como esperábamos",
  description = "Ha ocurrido un error inesperado al procesar la página. El equipo técnico ha sido notificado si el error persiste.",
  badge = "Error del sistema",
  homeUrl = "/",
  homeLabel = "Volver al inicio",
  showHome = true,
  className,
  customActions,
}: ErrorViewProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const [copiedDigest, setCopiedDigest] = React.useState(false)

  React.useEffect(() => {
    // Log the error to console / error reporting
    console.error("[Cuaderno Error Boundary]:", error)
  }, [error])

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry()
    } else if (typeof reset === "function") {
      reset()
    } else if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  const handleCopyDigest = async () => {
    if (error.digest && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(error.digest)
      setCopiedDigest(true)
      setTimeout(() => setCopiedDigest(false), 2000)
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16 text-center sm:px-6",
        className
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center">
        {/* Subtle Decorative Warning Icon Container */}
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-xl border border-border bg-danger-tint">
          <AlertTriangle className="size-10 stroke-[1.5] text-destructive" />
          <span className="absolute -bottom-2 -right-2 flex size-6 items-center justify-center rounded-full border border-border bg-card font-mono text-[11px] font-medium tabular-nums text-destructive">
            500
          </span>
        </div>

        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-danger-tint px-3 py-1 text-xs font-medium text-destructive">
          <span className="size-1.5 rounded-full bg-destructive" />
          {badge}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>

        {/* Digest identifier if present */}
        {error.digest && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-1.5 text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">ID de error: {error.digest}</span>
            <button
              type="button"
              onClick={handleCopyDigest}
              className="inline-flex cursor-pointer items-center gap-1 font-medium text-ia hover:underline"
              title="Copiar código de error"
            >
              {copiedDigest ? (
                <Check className="size-3 text-perf" />
              ) : (
                <Copy className="size-3" />
              )}
              <span className="text-[11px]">
                {copiedDigest ? "Copiado" : "Copiar"}
              </span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="default"
            size="default"
            onClick={handleRetry}
            className="h-10 cursor-pointer gap-2 rounded-lg px-5 font-semibold"
          >
            <RotateCcw className="size-4" />
            <span>Reintentar</span>
          </Button>

          {showHome && (
            <Button
              variant="outline"
              size="default"
              className="h-10 cursor-pointer gap-2 rounded-lg border-border px-5 font-medium"
              render={<Link href={homeUrl} />}
            >
              <Home className="size-4" />
              <span>{homeLabel}</span>
            </Button>
          )}

          {customActions}
        </div>

        {/* Technical Details Accordion (helpful for dev or copy/paste) */}
        <div className="mt-10 w-full text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="mx-auto flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bug className="size-3.5" />
            <span>{showDetails ? "Ocultar detalles técnicos" : "Ver detalles técnicos del error"}</span>
            {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card p-4 text-left">
              <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-semibold text-foreground">
                <span>Mensaje de la excepción:</span>
                {error.name && <span className="font-mono text-[11px] text-text-tertiary">{error.name}</span>}
              </div>
              <p className="mt-2 break-words rounded-lg bg-danger-tint p-2.5 font-mono text-xs text-destructive">
                {error.message || "Error desconocido sin mensaje provisto."}
              </p>
              {error.stack && (
                <div className="mt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                    Pila de llamadas (Stack trace):
                  </span>
                  <pre className="mt-1 max-h-44 overflow-x-auto overflow-y-auto rounded-lg border border-border bg-surface-sunken p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
