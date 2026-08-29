import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function VideoBlock({ node }: { node: BlockNode }) {
  const url = node.props.url || ""
  const style = blockStyleToCss(node.style)

  // Format embed url if youtube
  let embedUrl = url
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("watch?v=")[1]?.split("&")[0]
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`
  } else if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0]
    embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`
  }

  return (
    <div style={style} className="relative aspect-video w-full overflow-hidden rounded-xl bg-black my-4">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={node.props.title || "Video"}
          className="size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          Ingresa una URL de video válida
        </div>
      )}
    </div>
  )
}
