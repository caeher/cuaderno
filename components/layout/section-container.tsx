import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  bordered?: boolean
  background?: "default" | "muted" | "card"
  containerSize?: "sm" | "md" | "lg" | "xl" | "full"
  children: React.ReactNode
}

const backgroundClasses = {
  default: "bg-background",
  muted: "bg-muted/30",
  card: "bg-card/40",
}

const containerSizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-full",
}

export function SectionContainer({
  id,
  bordered = true,
  background = "default",
  containerSize = "xl",
  className,
  children,
  ...props
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        bordered && "border-t border-border/70",
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      <div className={cn("mx-auto px-6 py-20 md:py-24", containerSizeClasses[containerSize])}>
        {children}
      </div>
    </section>
  )
}
