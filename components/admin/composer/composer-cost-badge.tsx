"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Coins, Info, Search, Image as ImageIcon, Cpu } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComposerCostBadgeProps {
  sessionId?: string | null
  className?: string
}

export function ComposerCostBadge({ sessionId, className = "" }: ComposerCostBadgeProps) {
  const usage = useQuery(
    api.composer.getSessionUsage,
    sessionId ? { sessionId: sessionId as Id<"composerSessions"> } : "skip"
  )

  const cost = usage?.totalEstimatedCostUsd ?? 0
  const inputTokens = usage?.totalInputTokens ?? 0
  const outputTokens = usage?.totalOutputTokens ?? 0
  const toolCalls = usage?.totalToolCalls ?? 0
  const imageCount = usage?.totalImageCount ?? 0

  const formattedCost = cost < 0.0001 && cost > 0
    ? "< $0.0001"
    : `$${cost.toFixed(4)}`

  return (
    <Popover>
      <PopoverTrigger
        className={`inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer ${className}`}
        title="Ver desglose de costes y telemetría"
      >
        <Coins className="size-3.5 text-amber-500" />
        <span className="font-mono">{formattedCost}</span>
        <span className="text-[10px] text-muted-foreground">USD</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-xs" align="end">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Coins className="size-3.5 text-amber-500" /> Consumo de la sesión
            </span>
            <Badge variant="outline" className="font-mono text-[10px]">
              {formattedCost} USD
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Cpu className="size-3 text-blue-500" />
              <span>Tokens entrada:</span>
            </div>
            <div className="text-right font-mono font-medium text-foreground">
              {inputTokens.toLocaleString()}
            </div>

            <div className="flex items-center gap-1.5">
              <Cpu className="size-3 text-indigo-500" />
              <span>Tokens salida:</span>
            </div>
            <div className="text-right font-mono font-medium text-foreground">
              {outputTokens.toLocaleString()}
            </div>

            <div className="flex items-center gap-1.5">
              <Search className="size-3 text-emerald-500" />
              <span>Búsquedas web:</span>
            </div>
            <div className="text-right font-mono font-medium text-foreground">
              {toolCalls}
            </div>

            <div className="flex items-center gap-1.5">
              <ImageIcon className="size-3 text-purple-500" />
              <span>Imágenes:</span>
            </div>
            <div className="text-right font-mono font-medium text-foreground">
              {imageCount}
            </div>
          </div>

          <div className="flex items-start gap-1.5 rounded-sm bg-muted/40 p-1.5 text-[10px] text-muted-foreground">
            <Info className="size-3 shrink-0 mt-0.5" />
            <span>
              Tarifas estimadas de telemetría. El modelo es gestionado globalmente en el servidor.
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
