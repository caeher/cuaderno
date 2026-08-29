import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  children: React.ReactNode
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-[90rem]",
}

export function PageContainer({
  size = "xl",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        // Gutter del panel: 16px en móvil, 24px desde md, 40px desde xl.
        "mx-auto w-full px-4 py-6 md:p-6 xl:p-10",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
