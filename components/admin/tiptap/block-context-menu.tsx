"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { NodeSelection } from "@tiptap/pm/state"
import {
  Copy,
  Trash2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Type,
  ChevronRight,
  Palette,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NOTION_TEXT_COLORS, NOTION_BG_COLORS } from "@/components/admin/tiptap/color-picker"

interface BlockContextMenuProps {
  editor: Editor
  blockPos: number
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BlockContextMenu({
  editor,
  blockPos,
  children,
  open,
  onOpenChange,
}: BlockContextMenuProps) {
  const selectBlock = React.useCallback(() => {
    try {
      const tr = editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, blockPos))
      editor.view.dispatch(tr)
    } catch {
      // Fallback
    }
  }, [editor, blockPos])

  const transformNode = (callback: () => void) => {
    try {
      selectBlock()
      callback()
    } catch (err) {
      console.error(err)
    }
    onOpenChange(false)
  }

  const handleDelete = () => {
    try {
      const node = editor.state.doc.nodeAt(blockPos)
      if (node) {
        const tr = editor.state.tr.delete(blockPos, blockPos + node.nodeSize)
        editor.view.dispatch(tr)
      }
    } catch (err) {
      console.error(err)
    }
    onOpenChange(false)
  }

  const handleDuplicate = () => {
    try {
      const node = editor.state.doc.nodeAt(blockPos)
      if (node) {
        const tr = editor.state.tr.insert(blockPos + node.nodeSize, node)
        editor.view.dispatch(tr)
      }
    } catch (err) {
      console.error(err)
    }
    onOpenChange(false)
  }

  const handleMove = (direction: "up" | "down") => {
    try {
      const $pos = editor.state.doc.resolve(blockPos)
      const index = $pos.index(0)
      const doc = editor.state.doc

      if (direction === "up" && index > 0) {
        const prevNode = doc.child(index - 1)
        const currentNode = doc.child(index)
        const prevPos = blockPos - prevNode.nodeSize
        const tr = editor.state.tr
          .delete(blockPos, blockPos + currentNode.nodeSize)
          .insert(prevPos, currentNode)
        editor.view.dispatch(tr)
      } else if (direction === "down" && index < doc.childCount - 1) {
        const currentNode = doc.child(index)
        const nextNode = doc.child(index + 1)
        const tr = editor.state.tr
          .delete(blockPos, blockPos + currentNode.nodeSize)
          .insert(blockPos + nextNode.nodeSize, currentNode)
        editor.view.dispatch(tr)
      }
    } catch (err) {
      console.error(err)
    }
    onOpenChange(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={children as React.ReactElement} />
      <DropdownMenuContent className="w-56 text-xs" align="start" side="right" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <Trash2 className="size-3.5" />
            <span>Eliminar bloque</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="size-3.5" />
            <span>Duplicar</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Type className="size-3.5" />
              <span>Convertir en</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52 text-xs">
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().setParagraph().run())}>
                <Type className="size-3.5" />
                <span>Texto / Párrafo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}>
                <Heading1 className="size-3.5" />
                <span>Título 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}>
                <Heading2 className="size-3.5" />
                <span>Título 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleHeading({ level: 4 }).run())}>
                <Heading3 className="size-3.5" />
                <span>Título 3</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleBulletList().run())}>
                <List className="size-3.5" />
                <span>Lista con viñetas</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleOrderedList().run())}>
                <ListOrdered className="size-3.5" />
                <span>Lista numerada</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleTaskList().run())}>
                <CheckSquare className="size-3.5" />
                <span>Lista de tareas</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleBlockquote().run())}>
                <Quote className="size-3.5" />
                <span>Cita</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => transformNode(() => editor.chain().focus().toggleCallout().run())}>
                <Sparkles className="size-3.5" />
                <span>Cuadro Destacado</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="size-3.5" />
              <span>Color de bloque</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48 text-xs max-h-72 overflow-y-auto">
              <div className="px-2 py-1 font-semibold text-[10px] uppercase text-muted-foreground">Texto</div>
              {NOTION_TEXT_COLORS.map((c) => (
                <DropdownMenuItem
                  key={c.value}
                  onClick={() => transformNode(() => {
                    if (c.value === "inherit") editor.chain().focus().unsetColor().run()
                    else editor.chain().focus().setColor(c.value).run()
                  })}
                >
                  <span className="size-3 rounded-full border border-border" style={{ backgroundColor: c.color }} />
                  <span style={{ color: c.value === "inherit" ? undefined : c.value }}>{c.label}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="px-2 py-1 font-semibold text-[10px] uppercase text-muted-foreground">Fondo</div>
              {NOTION_BG_COLORS.map((b) => (
                <DropdownMenuItem
                  key={b.value}
                  onClick={() => transformNode(() => {
                    if (b.value === "transparent") editor.chain().focus().unsetHighlight().run()
                    else editor.chain().focus().setHighlight({ color: b.value }).run()
                  })}
                >
                  <span className="size-3 rounded border border-border" style={{ backgroundColor: b.bg }} />
                  <span>{b.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleMove("up")}>
            <ArrowUp className="size-3.5" />
            <span>Mover arriba</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMove("down")}>
            <ArrowDown className="size-3.5" />
            <span>Mover abajo</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
