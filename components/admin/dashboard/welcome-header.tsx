"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
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
      ? `${publishedPosts ?? 0} de ${totalPosts} entradas publicadas. Aquí tienes el rendimiento de tu blog.`
      : "Aquí tienes el rendimiento de tu blog."

  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {/* h2, no h1: el título de la página ya lo renderiza AdminTopbar como h1.
            Dos h1 con títulos distintos en la misma página es un defecto de
            accesibilidad, no una decisión de diseño. */}
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {firstName}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle || defaultSubtitle}</p>
      </div>

      <div className="flex items-center gap-1.5 self-start rounded-lg border border-border bg-card px-3 py-1.5 text-xs capitalize text-muted-foreground md:self-auto">
        <Calendar className="size-3.5 text-text-tertiary" />
        <span>{formattedDate}</span>
      </div>
    </div>
  )
}
