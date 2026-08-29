"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns,
  Rows,
  Trash2,
  Table as TableIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TableToolbarProps {
  editor: Editor
}

export function TableToolbar({ editor }: TableToolbarProps) {
  const shouldShow = () => {
    return editor.isActive("table")
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-xl backdrop-blur-md"
      options={{
        placement: "top",
        offset: 8,
      }}
    >
      <div className="flex items-center gap-1 border-r border-border pr-1">
        <TableButton
          onClick={() => editor.chain().focus().addRowBefore().run()}
          label="Insertar fila arriba"
        >
          <BetweenHorizontalStart className="size-3.5" />
        </TableButton>
        <TableButton
          onClick={() => editor.chain().focus().addRowAfter().run()}
          label="Insertar fila abajo"
        >
          <BetweenHorizontalEnd className="size-3.5" />
        </TableButton>
        <TableButton
          onClick={() => editor.chain().focus().deleteRow().run()}
          label="Eliminar fila"
          destructive
        >
          <Rows className="size-3.5" />
        </TableButton>
      </div>

      <div className="flex items-center gap-1 border-r border-border px-1">
        <TableButton
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          label="Insertar columna a la izquierda"
        >
          <BetweenVerticalStart className="size-3.5" />
        </TableButton>
        <TableButton
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          label="Insertar columna a la derecha"
        >
          <BetweenVerticalEnd className="size-3.5" />
        </TableButton>
        <TableButton
          onClick={() => editor.chain().focus().deleteColumn().run()}
          label="Eliminar columna"
          destructive
        >
          <Columns className="size-3.5" />
        </TableButton>
      </div>

      <div className="flex items-center gap-1 pl-1">
        <TableButton
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          label="Alternar fila de encabezado"
        >
          <TableIcon className="size-3.5" />
        </TableButton>
        <TableButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          label="Eliminar tabla"
          destructive
        >
          <Trash2 className="size-3.5" />
        </TableButton>
      </div>
    </BubbleMenu>
  )
}

function TableButton({
  onClick,
  label,
  children,
  destructive = false,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        destructive && "hover:bg-destructive/15 hover:text-destructive",
      )}
    >
      {children}
    </button>
  )
}
