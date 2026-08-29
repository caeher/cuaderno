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
  const centrado = align === "center"

  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        centrado
          ? "mx-auto max-w-2xl items-center text-center"
          : "md:flex-row md:items-start md:justify-between md:gap-6",
        className
      )}
      {...props}
    >
      <div className={cn("min-w-0", centrado && "flex flex-col items-center")}>
        {eyebrow && (
          <span className="mb-2 block font-mono text-xs font-medium uppercase tracking-widest text-ia">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-balance text-foreground md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[60ch] text-sm leading-[1.55] text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
      )}
    </header>
  )
}
