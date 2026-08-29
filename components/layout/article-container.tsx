import * as React from "react"
import { cn } from "@/lib/utils"

export interface ArticleContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function ArticleContainer({
  className,
  children,
  ...props
}: ArticleContainerProps) {
  return (
    <article
      className={cn("mx-auto max-w-2xl px-6 py-12 sm:py-16", className)}
      {...props}
    >
      {children}
    </article>
  )
}
