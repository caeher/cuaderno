"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Sparkles, Coins, Server, ShieldCheck, AlertCircle } from "lucide-react"

export interface ComposerConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actionLabel?: string
  phase?: "research" | "outline" | "draft" | "image" | "handoff"
  estimatedCost?: string
  estimatedTokens?: string
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
}

export function ComposerConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Confirmar y continuar",
  phase,
  estimatedCost,
  estimatedTokens,
  isLoading = false,
  onConfirm,
}: ComposerConfirmDialogProps) {
  const getPhaseDetails = () => {
    switch (phase) {
      case "research":
        return {
          cost: estimatedCost || "~ $0.01 - $0.02 USD",
          details: "Incluye consultas de búsqueda web en tiempo real y extracción de afirmaciones verificables.",
          model: "Resolución automática de servidor con Web Search",
        }
      case "outline":
        return {
          cost: estimatedCost || "~ $0.005 - $0.01 USD",
          details: "Estructuración de secciones y jerarquía editorial a partir de fuentes aprobadas.",
          model: "Modelo editorial de servidor",
        }
      case "draft":
        return {
          cost: estimatedCost || "~ $0.02 - $0.04 USD",
          details: "Redacción completa en HTML TipTap con citas verificables a fuentes consultadas.",
          model: "Modelo de redacción con esfuerzo de razonamiento",
        }
      case "image":
        return {
          cost: estimatedCost || "~ $0.04 USD",
          details: "Generación de imagen horizontal 16:9 y texto alternativo accesible WCAG.",
          model: "Generador de imágenes de servidor",
        }
      case "handoff":
        return {
          cost: "Sin coste de IA adicional",
          details: "Se creará un post en estado BORRADOR (draft) en tu panel. Composer nunca publica directamente.",
          model: "Persistencia interna en base de datos",
        }
      default:
        return {
          cost: estimatedCost || "Estimación según consumo",
          details: "La operación se procesará en segundo plano.",
          model: "Gestionado globalmente por servidor",
        }
    }
  }

  const phaseInfo = getPhaseDetails()

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Cost & Server Info Box */}
        <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Coins className="size-3.5 text-amber-500" /> Coste estimado:
            </span>
            <span className="font-mono text-foreground">{phaseInfo.cost}</span>
          </div>

          {estimatedTokens && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tokens aproximados:</span>
              <span className="font-mono text-foreground">{estimatedTokens}</span>
            </div>
          )}

          <div className="flex items-start gap-1.5 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <Server className="size-3 shrink-0 mt-0.5 text-blue-500" />
            <span>{phaseInfo.model}</span>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3 shrink-0 mt-0.5 text-emerald-500" />
            <span>{phaseInfo.details}</span>
          </div>
        </div>

        {phase === "handoff" && (
          <div className="flex items-start gap-2 rounded-md bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-500/20">
            <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Invariante editorial:</strong> El post se guardará en tu lista de posts como <strong>borrador</strong>. Podrás revisarlo, cambiarlo y publicarlo cuando lo desees.
            </span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="cursor-pointer text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="cursor-pointer gap-1.5 text-xs font-medium"
          >
            {isLoading ? (
              <>
                <Spinner className="size-3.5" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                {actionLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
