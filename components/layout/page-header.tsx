import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  eyebrow?: string
  align?: "left" | "center"
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  eyebrow,
  align = "left",
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto max-w-2xl text-center items-center" : "max-w-2xl",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="text-base leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      )}
    </header>
  )
}
