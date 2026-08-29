import * as React from "react"
import { ArrowRight } from "lucide-react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function BannerBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  const bgImg = node.props.backgroundImage
  const overlay = node.props.overlayColor || "rgba(0, 0, 0, 0.6)"

  return (
    <div
      style={{
        ...style,
        position: "relative",
        backgroundImage: bgImg ? `url(${bgImg})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-white shadow-xl my-6"
    >
      {/* Background Overlay */}
      {bgImg && <div className="absolute inset-0" style={{ backgroundColor: overlay }} />}

      <div className="relative z-10 mx-auto max-w-2xl text-center flex flex-col items-center gap-4">
        <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
          {node.props.title || "Título del Banner"}
        </h2>
        {node.props.subtitle && (
          <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
            {node.props.subtitle}
          </p>
        )}
        {node.props.buttonText && (
          <a
            href={node.props.buttonUrl || "#"}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {node.props.buttonText}
            <ArrowRight className="size-4" />
          </a>
        )}
      </div>
    </div>
  )
}
