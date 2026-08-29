import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface PostCoverImageProps {
  coverUrl?: string | null
  alt?: string
  priority?: boolean
  className?: string
}

export function PostCoverImage({
  coverUrl,
  alt = "Portada del artículo",
  priority = true,
  className,
}: PostCoverImageProps) {
  if (!coverUrl) return null

  return (
    <div
      className={cn(
        "relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/70 bg-muted shadow-xs",
        className
      )}
    >
      <Image
        src={coverUrl}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        unoptimized={coverUrl.startsWith("http")}
      />
    </div>
  )
}
