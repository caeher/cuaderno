import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatItem {
  label: string
  value: string | number
}

export interface StatBadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatItem[]
  bordered?: boolean
}

export function StatBadgeGroup({
  stats,
  bordered = true,
  className,
  ...props
}: StatBadgeGroupProps) {
  if (!stats || stats.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-6 py-4",
        bordered && "border-y border-border/70",
        className
      )}
      {...props}
    >
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col">
          <p className="font-serif text-xl font-medium tracking-tight text-foreground">
            {stat.value}
          </p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
