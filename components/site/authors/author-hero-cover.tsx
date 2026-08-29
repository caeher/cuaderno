import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface AuthorHeroCoverProps {
  coverUrl?: string | null
  alt?: string
  className?: string
}

export function AuthorHeroCover({
  coverUrl,
  alt = "Portada de autor",
  className,
}: AuthorHeroCoverProps) {
  return (
    <div className={cn("relative h-48 w-full bg-surface-sunken sm:h-64", className)}>
      <Image
        src={coverUrl || "/placeholder.svg"}
        alt={alt}
        fill
        className="object-cover"
        priority
        unoptimized={Boolean(coverUrl?.startsWith("http"))}
      />
    </div>
  )
}
