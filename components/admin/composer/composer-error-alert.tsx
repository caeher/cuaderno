"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Edit3, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ComposerErrorAlertProps {
  error?: string | null
  phase?: string
  isRetrying?: boolean
  onRetry?: () => void
  onEditBrief?: () => void
  onDismiss?: () => void
  className?: string
}

export function ComposerErrorAlert({
  error,
  phase,
  isRetrying = false,
  onRetry,
  onEditBrief,
  onDismiss,
  className = "",
}: ComposerErrorAlertProps) {
  if (!error) return null

  // Classify user-friendly explanation
  const isModerated = /moderaci|seguridad|filtro|content_filter|refusal/i.test(error)
  const isNoSources = /fuentes confiables|no se encontraron|sin fuentes/i.test(error)
  const isAmbiguous = /ambigüedad|aclaración|brief requiere/i.test(error)
  const isTransient = /timeout|tiempo de espera|red|conexion/i.test(error)

  const getHeading = () => {
    if (isModerated) return "Solicitud restringida por moderación"
    if (isNoSources) return "Fuentes insuficientes sobre el tema"
    if (isAmbiguous) return "El brief requiere mayor definición"
    if (isTransient) return "Tiempo de espera agotado"
    return "No se pudo completar la operación"
  }

  const getAdvice = () => {
    if (isModerated) {
      return "El contenido ingresado o el tema solicitado no superó los filtros de seguridad. Intenta reformular el tema o las restricciones."
    }
    if (isNoSources) {
      return "No encontramos suficientes fuentes verificables con los parámetros actuales. Prueba ampliando las palabras clave o permitiendo más dominios."
    }
    if (isAmbiguous) {
      return "Para investigar con precisión, por favor especifica el tema central, público objetivo o el ángulo del artículo."
    }
    if (isTransient) {
      return "El servidor tardó más de lo esperado en responder. Puedes reintentar la operación sin coste duplicado."
    }
    return error
  }

  return (
    <div
      className={`rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-4 shrink-0 mt-0.5 text-destructive" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-foreground">{getHeading()}</h5>
            {phase && (
              <span className="rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-wider">
                {phase}
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{getAdvice()}</p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="h-7 cursor-pointer gap-1.5 text-xs text-foreground bg-background hover:bg-muted"
              >
                <RefreshCw className={`size-3 ${isRetrying ? "animate-spin" : ""}`} />
                Reintentar
              </Button>
            )}

            {onEditBrief && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onEditBrief}
                className="h-7 cursor-pointer gap-1.5 text-xs text-foreground hover:bg-muted"
              >
                <Edit3 className="size-3" />
                Ajustar preferencias
              </Button>
            )}

            {onDismiss && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-7 cursor-pointer text-xs text-muted-foreground hover:text-foreground ml-auto"
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
