"use client"

import { useQuery } from "convex/react"
import { Sparkles } from "lucide-react"

import { api } from "@/convex/_generated/api"

export function ComposerEnabledGate({ children }: { children: React.ReactNode }) {
  const health = useQuery(api.ai.getConfigHealth, {})

  if (health === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Comprobando disponibilidad de Composer…
      </div>
    )
  }

  if (!health.availableForCurrentTenant) {
    const reason = health.killSwitchActive
      ? "Composer está desactivado de emergencia en este entorno."
      : !health.composerEnabled
        ? "Composer está apagado en este entorno (COMPOSER_ENABLED)."
        : "Composer no está habilitado para este espacio de trabajo en el rollout actual."

    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Sparkles className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Composer no está disponible</h2>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">{reason}</p>
      </div>
    )
  }

  return children
}
