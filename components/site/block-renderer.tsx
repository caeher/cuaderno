"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { deserializeBlockTree } from "@/lib/domain/block-schema"
import {
  AccordionBlock,
  AuthorBoxBlock,
  BannerBlock,
  ButtonBlock,
  CalloutBlock,
  CounterBlock,
  GalleryBlock,
  HeadingBlock,
  IconBoxBlock,
  ImageBlock,
  NewsletterBlock,
  QuoteBlock,
  SocialShareBlock,
  TextBlock,
  VideoBlock,
  blockStyleToCss,
} from "@/components/designer/widgets/widget-components"
import { cn } from "@/lib/utils"

export interface BlockRendererProps {
  blocks?: BlockNode[] | string | null
  className?: string
}

export function BlockRenderer({ blocks, className }: BlockRendererProps) {
  const nodes = React.useMemo(() => {
    if (typeof blocks === "string") {
      return deserializeBlockTree(blocks)
    }
    if (Array.isArray(blocks)) {
      return blocks
    }
    return []
  }, [blocks])

  if (!nodes || nodes.length === 0) {
    return null
  }

  return (
    <div className={cn("block-designer-render w-full flex flex-col gap-6", className)}>
      {nodes.map((node) => (
        <RenderNode key={node.id} node={node} />
      ))}
    </div>
  )
}

export function RenderNode({ node }: { node: BlockNode }) {
  // Check responsive visibility
  const hideClass = cn(
    node.style?.hideOnDesktop && "hidden md:hidden",
    node.style?.hideOnTablet && "md:hidden lg:flex",
    node.style?.hideOnMobile && "hidden sm:flex"
  )

  switch (node.type) {
    case "section": {
      const style = blockStyleToCss(node.style)
      return (
        <section
          style={style}
          className={cn("w-full transition-all", hideClass, node.style?.customClass)}
        >
          {node.children?.map((child) => (
            <RenderNode key={child.id} node={child} />
          ))}
        </section>
      )
    }

    case "container": {
      const style = blockStyleToCss(node.style)
      return (
        <div
          style={style}
          className={cn(
            "w-full flex-col sm:flex-row transition-all",
            hideClass,
            node.style?.customClass
          )}
        >
          {node.children?.map((child) => (
            <div key={child.id} className="flex-1 min-w-0">
              <RenderNode node={child} />
            </div>
          ))}
        </div>
      )
    }

    case "grid": {
      const style = blockStyleToCss(node.style)
      return (
        <div
          style={style}
          className={cn("w-full transition-all", hideClass, node.style?.customClass)}
        >
          {node.children?.map((child) => (
            <RenderNode key={child.id} node={child} />
          ))}
        </div>
      )
    }

    case "spacer": {
      const style = blockStyleToCss(node.style)
      return <div style={style} className={cn("w-full pointer-events-none", hideClass)} />
    }

    case "divider": {
      const style = blockStyleToCss(node.style)
      return <hr style={style} className={cn("border-t", hideClass)} />
    }

    case "heading":
      return <HeadingBlock node={node} />

    case "text":
      return <TextBlock node={node} />

    case "quote":
      return <QuoteBlock node={node} />

    case "counter":
      return <CounterBlock node={node} />

    case "image":
      return <ImageBlock node={node} />

    case "gallery":
      return <GalleryBlock node={node} />

    case "video":
      return <VideoBlock node={node} />

    case "banner":
      return <BannerBlock node={node} />

    case "icon_box":
      return <IconBoxBlock node={node} />

    case "button":
      return <ButtonBlock node={node} />

    case "accordion":
      return <AccordionBlock node={node} />

    case "callout":
      return <CalloutBlock node={node} />

    case "author_box":
      return <AuthorBoxBlock node={node} />

    case "newsletter_box":
      return <NewsletterBlock node={node} />

    case "social_share":
      return <SocialShareBlock node={node} />

    default:
      return null
  }
}
