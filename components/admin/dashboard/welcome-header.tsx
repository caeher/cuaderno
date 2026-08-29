"use client"

import * as React from "react"
import { Sparkles, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WelcomeHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  subtitle?: string
  totalPosts?: number
  publishedPosts?: number
}

export function WelcomeHeader({
  name,
  subtitle,
  totalPosts,
  publishedPosts,
  className,
  ...props
}: WelcomeHeaderProps) {
  const firstName = name.split(" ")[0] || name

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Buenos días"
    if (hour >= 12 && hour < 20) return "Buenas tardes"
    return "Buenas noches"
  }, [])

  const formattedDate = React.useMemo(() => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date())
  }, [])

  const defaultSubtitle =
    totalPosts !== undefined
      ? `Tienes ${publishedPosts ?? 0} posts publicados de ${totalPosts} totales. Aquí tienes el estado de tu blog.`
      : "Aquí tienes un resumen en tiempo real de tu blog."

  return (
    <div className={cn("flex flex-col gap-2 md:flex-row md:items-center md:justify-between", className)} {...props}>
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
          <span>{greeting}, {firstName}</span>
          <Sparkles className="size-5 text-amber-500 shrink-0 hidden sm:inline" />
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle || defaultSubtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-md self-start md:self-auto capitalize border border-border/50">
        <Calendar className="size-3.5" />
        <span>{formattedDate}</span>
      </div>
    </div>
  )
}
