"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { WIDGET_DEFINITIONS } from "@/lib/designer/widget-definitions"
import type { BlockNode } from "@/lib/domain/block-schema"
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
import {
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CanvasBlockWrapperProps {
  node: BlockNode
  index: number
  totalSiblings: number
  siblings: BlockNode[]
}

export function CanvasBlockWrapper({
  node,
  index,
  totalSiblings,
  siblings,
}: CanvasBlockWrapperProps) {
  const {
    selectedBlockId,
    selectBlock,
    hoverBlockId,
    setHoverBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    addBlock,
    isPreviewMode,
  } = useDesigner()

  const isSelected = selectedBlockId === node.id
  const isHovered = hoverBlockId === node.id
  const meta = WIDGET_DEFINITIONS[node.type]
  const title = node.name || meta?.name || node.type

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectBlock(node.id)
  }

  const handleAddBelow = (e: React.MouseEvent) => {
    e.stopPropagation()
    addBlock("heading", node.id, "after")
  }

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index > 0) {
      const prev = siblings[index - 1]
      moveBlock(node.id, prev.id, "before")
    }
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index < totalSiblings - 1) {
      const next = siblings[index + 1]
      moveBlock(node.id, next.id, "after")
    }
  }

  if (isPreviewMode) {
    return <RenderBlockContent node={node} isPreview={true} />
  }

  return (
    <div
      onClick={handleSelect}
      onMouseEnter={(e) => {
        e.stopPropagation()
        setHoverBlock(node.id)
      }}
      onMouseLeave={(e) => {
        e.stopPropagation()
        setHoverBlock(null)
      }}
      className={cn(
        "group/block relative transition-all rounded-md cursor-pointer",
        isSelected
          ? "ring-2 ring-primary ring-offset-2 z-10"
          : isHovered
          ? "ring-1 ring-primary/60"
          : "hover:ring-1 hover:ring-primary/40"
      )}
    >
      {/* Floating Action Bar on Selection */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-7 left-2 z-30 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-primary-foreground shadow-md text-[11px] font-medium"
        >
          <span className="font-semibold">{title}</span>
          <div className="mx-1 h-3 w-px bg-primary-foreground/30" />

          <button
            type="button"
            onClick={handleAddBelow}
            title="Añadir bloque debajo"
            className="rounded p-0.5 hover:bg-primary-foreground/20"
          >
            <Plus className="size-3" />
          </button>
          {index > 0 && (
            <button
              type="button"
              onClick={handleMoveUp}
              title="Mover arriba"
              className="rounded p-0.5 hover:bg-primary-foreground/20"
            >
              <ArrowUp className="size-3" />
            </button>
          )}
          {index < totalSiblings - 1 && (
            <button
              type="button"
              onClick={handleMoveDown}
              title="Mover abajo"
              className="rounded p-0.5 hover:bg-primary-foreground/20"
            >
              <ArrowDown className="size-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => duplicateBlock(node.id)}
            title="Duplicar"
            className="rounded p-0.5 hover:bg-primary-foreground/20"
          >
            <Copy className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => deleteBlock(node.id)}
            title="Eliminar"
            className="rounded p-0.5 hover:bg-destructive/80 text-rose-200 hover:text-white"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}

      {/* Render the actual block content */}
      <RenderBlockContent node={node} isPreview={false} />
    </div>
  )
}

function RenderBlockContent({ node, isPreview }: { node: BlockNode; isPreview: boolean }) {
  const style = blockStyleToCss(node.style)

  switch (node.type) {
    case "section":
      return (
        <section
          style={style}
          className={cn("w-full transition-all", !isPreview && "min-h-[60px]")}
        >
          {node.children && node.children.length > 0 ? (
            node.children.map((child, idx) => (
              <CanvasBlockWrapper
                key={child.id}
                node={child}
                index={idx}
                totalSiblings={node.children!.length}
                siblings={node.children!}
              />
            ))
          ) : !isPreview ? (
            <div className="flex items-center justify-center p-6 border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground">
              Sección vacía — haz clic para añadir bloques
            </div>
          ) : null}
        </section>
      )

    case "container":
      return (
        <div
          style={style}
          className={cn(
            "w-full flex-col sm:flex-row transition-all",
            !isPreview && "min-h-[60px]"
          )}
        >
          {node.children && node.children.length > 0 ? (
            node.children.map((child, idx) => (
              <div key={child.id} className="flex-1 min-w-0">
                <CanvasBlockWrapper
                  node={child}
                  index={idx}
                  totalSiblings={node.children!.length}
                  siblings={node.children!}
                />
              </div>
            ))
          ) : !isPreview ? (
            <div className="flex items-center justify-center p-6 border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground w-full">
              Contenedor de columnas vacío
            </div>
          ) : null}
        </div>
      )

    case "grid":
      return (
        <div
          style={style}
          className={cn("w-full transition-all", !isPreview && "min-h-[60px]")}
        >
          {node.children && node.children.length > 0 ? (
            node.children.map((child, idx) => (
              <CanvasBlockWrapper
                key={child.id}
                node={child}
                index={idx}
                totalSiblings={node.children!.length}
                siblings={node.children!}
              />
            ))
          ) : !isPreview ? (
            <div className="flex items-center justify-center p-6 border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground">
              Cuadrícula vacía
            </div>
          ) : null}
        </div>
      )

    case "spacer":
      return (
        <div
          style={style}
          className={cn("w-full flex items-center justify-center", !isPreview && "border border-dashed border-border/60 bg-muted/20 text-[10px] text-muted-foreground")}
        >
          {!isPreview && <span>Espacio ({node.props.height || "48px"})</span>}
        </div>
      )

    case "divider":
      return <hr style={style} className="border-t my-2" />

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
