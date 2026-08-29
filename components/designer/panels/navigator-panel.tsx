"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { WIDGET_DEFINITIONS } from "@/lib/designer/widget-definitions"
import type { BlockNode } from "@/lib/domain/block-schema"
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function NavigatorPanel() {
  const { blocks, selectedBlockId, selectBlock, deleteBlock, duplicateBlock, moveBlock } = useDesigner()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-card p-3 font-semibold text-xs text-foreground">
        <Layers className="size-4 text-primary" />
        <span>Navegador de Capas & Jerarquía</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {blocks.map((block, idx) => (
          <NavigatorNode
            key={block.id}
            node={block}
            index={idx}
            totalSiblings={blocks.length}
            selectedBlockId={selectedBlockId}
            onSelect={selectBlock}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
            onMove={moveBlock}
            siblings={blocks}
            depth={0}
          />
        ))}

        {blocks.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No hay bloques en la página.
          </div>
        )}
      </div>
    </div>
  )
}

interface NavigatorNodeProps {
  node: BlockNode
  index: number
  totalSiblings: number
  selectedBlockId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (sourceId: string, targetId: string, position?: "before" | "after" | "inside") => void
  siblings: BlockNode[]
  depth: number
}

function NavigatorNode({
  node,
  index,
  totalSiblings,
  selectedBlockId,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
  siblings,
  depth,
}: NavigatorNodeProps) {
  const [isOpen, setIsOpen] = React.useState(true)
  const isSelected = selectedBlockId === node.id
  const hasChildren = node.children && node.children.length > 0
  const meta = WIDGET_DEFINITIONS[node.type]
  const title = node.name || meta?.name || node.type

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index > 0) {
      const prevSibling = siblings[index - 1]
      onMove(node.id, prevSibling.id, "before")
    }
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (index < totalSiblings - 1) {
      const nextSibling = siblings[index + 1]
      onMove(node.id, nextSibling.id, "after")
    }
  }

  return (
    <div className="flex flex-col">
      <div
        onClick={() => onSelect(node.id)}
        style={{ paddingLeft: `${Math.max(8, depth * 16 + 8)}px` }}
        className={cn(
          "group flex items-center justify-between gap-1.5 rounded-lg py-1.5 pr-2 text-xs transition-colors cursor-pointer",
          isSelected
            ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/40"
            : "hover:bg-accent/50 text-foreground/90"
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              className="p-0.5 text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            </button>
          ) : (
            <div className="size-3" />
          )}
          <span className="truncate text-xs">{title}</span>
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {index > 0 && (
            <button
              type="button"
              onClick={handleMoveUp}
              title="Mover arriba"
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-background"
            >
              <ArrowUp className="size-3" />
            </button>
          )}
          {index < totalSiblings - 1 && (
            <button
              type="button"
              onClick={handleMoveDown}
              title="Mover abajo"
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-background"
            >
              <ArrowDown className="size-3" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(node.id)
            }}
            title="Duplicar"
            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-background"
          >
            <Copy className="size-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
            title="Eliminar"
            className="p-1 text-destructive hover:bg-destructive/10 rounded"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>

      {/* Recursive Children rendering */}
      {hasChildren && isOpen && (
        <div className="flex flex-col">
          {node.children!.map((child, cIdx) => (
            <NavigatorNode
              key={child.id}
              node={child}
              index={cIdx}
              totalSiblings={node.children!.length}
              selectedBlockId={selectedBlockId}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onMove={onMove}
              siblings={node.children!}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
