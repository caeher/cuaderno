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
  muted: "bg-surface-sunken",
  card: "bg-card",
}

const containerSizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-[90rem]",
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
        // El sistema se sostiene con el hairline de 1px, no con sombra.
        bordered && "border-t border-border",
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 py-12 md:px-6 md:py-16 xl:px-10",
          containerSizeClasses[containerSize]
        )}
      >
        {children}
      </div>
    </section>
  )
}
