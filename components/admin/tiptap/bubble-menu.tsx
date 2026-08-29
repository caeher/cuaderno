"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/admin/tiptap/color-picker"
import { cn } from "@/lib/utils"

interface BubbleMenuProps {
  editor: Editor
}

export function EditorBubbleMenu({ editor }: BubbleMenuProps) {
  const [linkUrl, setLinkUrl] = React.useState("")
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [turnIntoOpen, setTurnIntoOpen] = React.useState(false)

  const getCurrentNodeType = () => {
    if (editor.isActive("heading", { level: 1 })) return { label: "Título 1", icon: Heading1 }
    if (editor.isActive("heading", { level: 2 })) return { label: "Título 2", icon: Heading1 }
    if (editor.isActive("heading", { level: 3 })) return { label: "Título 3", icon: Heading2 }
    if (editor.isActive("heading", { level: 4 })) return { label: "Título 4", icon: Heading3 }
    if (editor.isActive("bulletList")) return { label: "Viñetas", icon: List }
    if (editor.isActive("orderedList")) return { label: "Numerada", icon: ListOrdered }
    if (editor.isActive("taskList")) return { label: "Tareas", icon: CheckSquare }
    if (editor.isActive("blockquote")) return { label: "Cita", icon: Quote }
    if (editor.isActive("codeBlock")) return { label: "Código", icon: Code }
    if (editor.isActive("callout")) return { label: "Callout", icon: Sparkles }
    return { label: "Texto", icon: null }
  }

  const currentType = getCurrentNodeType()

  const handleSetLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run()
    }
    setLinkOpen(false)
  }

  const openLinkPopover = () => {
    const existingHref = editor.getAttributes("link").href || ""
    setLinkUrl(existingHref)
    setLinkOpen(true)
  }

  const shouldShow = ({ state, from, to }: any) => {
    // Don't show bubble menu inside code blocks or if selection is collapsed
    if (editor.isActive("codeBlock") || editor.isActive("table")) return false
    return from !== to
  }

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-2xl backdrop-blur-md"
      options={{
        placement: "top",
        offset: 8,
      }}
    >
      {/* Turn Into dropdown */}
      <Popover open={turnIntoOpen} onOpenChange={setTurnIntoOpen}>
        <PopoverTrigger
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          aria-label="Convertir bloque en"
        >
          {currentType.icon && <currentType.icon className="size-3.5" />}
          <span>{currentType.label}</span>
          <ChevronDown className="size-3 opacity-60" />
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1 text-xs" align="start">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setParagraph().run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <span>Texto / Párrafo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <Heading1 className="size-3.5" />
              <span>Título 1 (Grande)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <Heading2 className="size-3.5" />
              <span>Título 2 (Medio)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 4 }).run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <Heading3 className="size-3.5" />
              <span>Título 3 (Pequeño)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleBulletList().run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <List className="size-3.5" />
              <span>Lista con viñetas</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleOrderedList().run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <ListOrdered className="size-3.5" />
              <span>Lista numerada</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleTaskList().run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <CheckSquare className="size-3.5" />
              <span>Lista de tareas</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleBlockquote().run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <Quote className="size-3.5" />
              <span>Cita</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleCallout().run()
                setTurnIntoOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              <Sparkles className="size-3.5" />
              <span>Cuadro Destacado</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="mx-1 h-4 w-px bg-border" />

      {/* Basic formatting */}
      <FormatButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Negrita (Ctrl+B)"
      >
        <Bold className="size-3.5" />
      </FormatButton>
      <FormatButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Cursiva (Ctrl+I)"
      >
        <Italic className="size-3.5" />
      </FormatButton>
      <FormatButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Subrayado (Ctrl+U)"
      >
        <UnderlineIcon className="size-3.5" />
      </FormatButton>
      <FormatButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="Tachado"
      >
        <Strikethrough className="size-3.5" />
      </FormatButton>
      <FormatButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        label="Código en línea (Ctrl+E)"
      >
        <Code className="size-3.5" />
      </FormatButton>

      {/* Link popover */}
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger
          className={cn(
            "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            editor.isActive("link") && "bg-accent text-accent-foreground",
          )}
          onClick={openLinkPopover}
          aria-label="Enlace"
        >
          <LinkIcon className="size-3.5" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2 text-xs" align="center">
          <form onSubmit={handleSetLink} className="flex gap-1.5">
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="h-8 text-xs"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-8 px-2.5 text-xs">
              Aplicar
            </Button>
            {editor.isActive("link") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => {
                  editor.chain().focus().unsetLink().run()
                  setLinkOpen(false)
                }}
              >
                Quitar
              </Button>
            )}
          </form>
        </PopoverContent>
      </Popover>

      {/* Notion Text & Highlight Color Picker */}
      <ColorPicker editor={editor} />

      <div className="mx-1 h-4 w-px bg-border" />

      {/* Alignment */}
      <FormatButton
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        label="Alinear a la izquierda"
      >
        <AlignLeft className="size-3.5" />
      </FormatButton>
      <FormatButton
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        label="Centrar"
      >
        <AlignCenter className="size-3.5" />
      </FormatButton>
      <FormatButton
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        label="Alinear a la derecha"
      >
        <AlignRight className="size-3.5" />
      </FormatButton>
    </TiptapBubbleMenu>
  )
}

function FormatButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground font-semibold",
      )}
    >
      {children}
    </button>
  )
}
