import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaTone?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function StatCard({ label, value, delta, deltaTone = "neutral", icon: Icon }: StatCardProps) {
  const DeltaArrow =
    deltaTone === "positive" ? ArrowUp : deltaTone === "negative" ? ArrowDown : null

  return (
    <article className="flex min-h-[116px] flex-col gap-4 rounded-xl border border-border bg-card p-5">
      {/* fila 1 — cuadro de icono tintado + etiqueta */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-ia-tint text-ia"
        >
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
        <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
      </div>

      {/* fila 2 — valor · fila 3 — delta / comparación */}
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-bold leading-[1.15] tracking-[-0.02em] tabular-nums text-foreground">
          {value}
        </span>
        {delta && (
          <p
            className={cn(
              "flex min-w-0 items-center gap-1 text-[13px] leading-5",
              deltaTone === "positive" && "font-semibold text-perf-strong tabular-nums",
              deltaTone === "negative" && "font-semibold text-destructive tabular-nums",
              deltaTone === "neutral" && "text-text-tertiary",
            )}
          >
            {DeltaArrow && (
              <DeltaArrow className="size-3 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            )}
            <span className="truncate">{delta}</span>
          </p>
        )}
      </div>
    </article>
  )
}
