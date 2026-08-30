"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { Sparkles } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { getComposerUnavailableReason } from "@/lib/application/panel"

export function ComposerEnabledGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const health = useQuery(
    api.ai.getConfigHealth,
    isLoaded && isSignedIn ? {} : "skip"
  )

  if (!isLoaded || health === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Comprobando disponibilidad de Composer…
      </div>
    )
  }

  const unavailable = getComposerUnavailableReason(health)
  if (unavailable) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Sparkles className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{unavailable.title}</h2>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">{unavailable.message}</p>
      </div>
    )
  }

  return children
}
