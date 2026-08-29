import * as React from "react"
import { Eye, Heart, MessageCircle, FileText, TrendingUp, Clock } from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import { formatCompactNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface DashboardStats {
  totalViews: number
  totalLikes: number
  totalComments: number
  publishedCount: number
  draftCount: number
  scheduledCount?: number
  totalPostsCount?: number
  avgReadingTime?: number
  engagementRate?: number
}

export interface DashboardStatsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: DashboardStats
}

export function DashboardStatsGrid({ stats, className, ...props }: DashboardStatsGridProps) {
  const avgViewsPerPost = stats.publishedCount > 0 ? Math.round(stats.totalViews / stats.publishedCount) : 0
  const engagement = stats.engagementRate ?? (stats.totalViews > 0 ? Number((((stats.totalLikes + stats.totalComments) / stats.totalViews) * 100).toFixed(1)) : 0)

  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
      {...props}
    >
      <StatCard
        label="Vistas totales"
        value={formatCompactNumber(stats.totalViews)}
        icon={Eye}
        delta={`~${formatCompactNumber(avgViewsPerPost)} vistas/post`}
        deltaTone="positive"
      />
      <StatCard
        label="Interacción total"
        value={formatCompactNumber(stats.totalLikes + stats.totalComments)}
        icon={Heart}
        delta={`${engagement}% tasa de engagement`}
        deltaTone={engagement > 5 ? "positive" : "neutral"}
      />
      <StatCard
        label="Comentarios"
        value={formatCompactNumber(stats.totalComments)}
        icon={MessageCircle}
        delta={`${stats.totalLikes} me gusta recibidos`}
        deltaTone="neutral"
      />
      <StatCard
        label="Contenido"
        value={`${stats.publishedCount} pub.`}
        icon={FileText}
        delta={`${stats.draftCount} borrador${stats.draftCount === 1 ? "" : "es"}${stats.scheduledCount ? ` · ${stats.scheduledCount} prog.` : ""}`}
        deltaTone="neutral"
      />
    </div>
  )
}
