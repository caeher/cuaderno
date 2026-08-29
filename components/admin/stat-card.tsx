import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaTone?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function StatCard({ label, value, delta, deltaTone = "neutral", icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        {delta && (
          <p
            className={cn(
              "mt-1 text-xs",
              deltaTone === "positive" && "text-emerald-600 dark:text-emerald-400",
              deltaTone === "negative" && "text-destructive",
              deltaTone === "neutral" && "text-muted-foreground",
            )}
          >
            {delta}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
