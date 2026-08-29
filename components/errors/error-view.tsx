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
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 shadow-xs backdrop-blur-xs">
          <div className="absolute inset-0 rounded-2xl bg-radial from-destructive/10 to-transparent" />
          <AlertTriangle className="relative size-10 text-destructive stroke-[1.5]" />
          <span className="absolute -bottom-2 -right-2 flex size-6 items-center justify-center rounded-full border border-destructive/30 bg-background text-[11px] font-mono font-medium text-destructive shadow-xs">
            500
          </span>
        </div>

        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          <span className="size-1.5 rounded-full bg-destructive animate-ping" />
          {badge}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>

        {/* Digest identifier if present */}
        {error.digest && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">ID de error: {error.digest}</span>
            <button
              type="button"
              onClick={handleCopyDigest}
              className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
              title="Copiar código de error"
            >
              {copiedDigest ? (
                <Check className="size-3 text-emerald-600" />
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
            className="gap-2 cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Reintentar</span>
          </Button>

          {showHome && (
            <Button
              variant="outline"
              size="default"
              className="gap-2 cursor-pointer"
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
            className="mx-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <Bug className="size-3.5" />
            <span>{showDetails ? "Ocultar detalles técnicos" : "Ver detalles técnicos del error"}</span>
            {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card p-4 text-left shadow-xs transition-all">
              <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-semibold text-foreground">
                <span>Mensaje de la excepción:</span>
                {error.name && <span className="font-mono text-[11px] text-muted-foreground">{error.name}</span>}
              </div>
              <p className="mt-2 font-mono text-xs text-destructive break-words">
                {error.message || "Error desconocido sin mensaje provisto."}
              </p>
              {error.stack && (
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Pila de llamadas (Stack trace):
                  </span>
                  <pre className="mt-1 max-h-44 overflow-x-auto overflow-y-auto rounded-lg bg-muted p-2.5 font-mono text-[11px] text-muted-foreground leading-relaxed">
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
