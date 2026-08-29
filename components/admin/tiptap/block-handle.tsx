"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { NodeSelection } from "@tiptap/pm/state"
import { GripVertical, Plus } from "lucide-react"
import { BlockContextMenu } from "@/components/admin/tiptap/block-context-menu"
import { cn } from "@/lib/utils"

interface BlockHandleProps {
  editor: Editor
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function BlockHandle({ editor, containerRef }: BlockHandleProps) {
  const [visible, setVisible] = React.useState(false)
  const [top, setTop] = React.useState(0)
  const [blockPos, setBlockPos] = React.useState<number>(0)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const handleRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      if (menuOpen) return

      // Don't hide if mouse is hovering the block handle itself
      if (handleRef.current?.contains(e.target as Node)) {
        return
      }

      const editorDom = container.querySelector(".tiptap")
      if (!editorDom) return

      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      const tiptapElem = elements.find((el) => editorDom.contains(el) && el !== editorDom)

      if (!tiptapElem) {
        // If cursor moves far left/right of container, hide
        const containerRect = container.getBoundingClientRect()
        if (
          e.clientX < containerRect.left - 60 ||
          e.clientX > containerRect.right + 20 ||
          e.clientY < containerRect.top ||
          e.clientY > containerRect.bottom
        ) {
          setVisible(false)
        }
        return
      }

      // Find top-level block inside .tiptap
      let blockElement = tiptapElem as HTMLElement
      while (blockElement.parentElement && blockElement.parentElement !== editorDom) {
        blockElement = blockElement.parentElement
      }

      try {
        const pos = editor.view.posAtDOM(blockElement, 0)
        const resolvedPos = editor.state.doc.resolve(Math.max(0, pos))
        const startPos = resolvedPos.before(1)

        const containerRect = container.getBoundingClientRect()
        const blockRect = blockElement.getBoundingClientRect()

        const calculatedTop = blockRect.top - containerRect.top + 4

        setTop(calculatedTop)
        setBlockPos(Math.max(0, startPos))
        setVisible(true)
      } catch {
        // Fallback silently if pos cannot be resolved
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (menuOpen) return
      const related = e.relatedTarget as Node
      if (!container.contains(related) && !handleRef.current?.contains(related)) {
        setVisible(false)
      }
    }

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [containerRef, editor, menuOpen])

  const handleAddBlock = () => {
    try {
      const node = editor.state.doc.nodeAt(blockPos)
      const insertPos = node ? blockPos + node.nodeSize : blockPos

      editor
        .chain()
        .focus()
        .insertContentAt(insertPos, { type: "paragraph" })
        .setTextSelection(insertPos + 1)
        .run()

      // Insert slash to prompt slash commands immediately
      editor.commands.insertContent("/")
    } catch (err) {
      console.error(err)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    try {
      const view = editor.view
      const selection = NodeSelection.create(editor.state.doc, blockPos)
      const tr = editor.state.tr.setSelection(selection)
      view.dispatch(tr)

      const slice = selection.content()
      e.dataTransfer.clearData()
      e.dataTransfer.effectAllowed = "move"
      // @ts-ignore
      view.dragging = { slice, move: true }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      ref={handleRef}
      style={{
        top: `${top}px`,
        transform: "translateX(-100%)",
      }}
      className={cn(
        "absolute left-0 z-20 flex items-center gap-0.5 pr-2 transition-opacity duration-150",
        visible || menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      <button
        type="button"
        onClick={handleAddBlock}
        title="Añadir bloque debajo (/)"
        aria-label="Añadir bloque"
        className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Plus className="size-4" />
      </button>

      <BlockContextMenu
        editor={editor}
        blockPos={blockPos}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      >
        <button
          type="button"
          draggable
          onDragStart={handleDragStart}
          title="Arrastrar para mover o hacer clic para opciones"
          aria-label="Opciones de bloque"
          className="flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      </BlockContextMenu>
    </div>
  )
}
