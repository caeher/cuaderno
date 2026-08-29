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
  full: "max-w-full",
}

export function PageContainer({
  size = "xl",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-6 py-12 sm:py-14", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  )
}
