"use client"

import * as React from "react"
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Underline } from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Highlight } from "@tiptap/extension-highlight"
import { TextAlign } from "@tiptap/extension-text-align"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { Image as TiptapImage } from "@tiptap/extension-image"
import { CharacterCount } from "@tiptap/extension-character-count"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"

import { Callout } from "@/components/admin/tiptap/extensions/callout-extension"
import {
  ToggleBlock,
  ToggleSummary,
  ToggleContent,
} from "@/components/admin/tiptap/extensions/toggle-extension"
import { CodeBlockComponent } from "@/components/admin/tiptap/extensions/code-block-view"
import { SlashCommand } from "@/components/admin/tiptap/slash-command"
import { EditorBubbleMenu } from "@/components/admin/tiptap/bubble-menu"
import { TableToolbar } from "@/components/admin/tiptap/table-toolbar"
import { BlockHandle } from "@/components/admin/tiptap/block-handle"
import { ImageDialog } from "@/components/admin/tiptap/extensions/image-dialog"
import { EditorStatusBar } from "@/components/admin/tiptap/editor-status-bar"

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "text-ia underline underline-offset-2 decoration-ia-border hover:decoration-ia" },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            const level = node.attrs.level
            if (level === 2) return "Título 1 (Grande)..."
            if (level === 3) return "Título 2 (Medio)..."
            return "Título 3 (Pequeño)..."
          }
          if (node.type.name === "toggleSummary") {
            return "Título del desplegable..."
          }
          return placeholder ?? "Escribe algo, o pulsa '/' para ver comandos..."
        },
        includeChildren: true,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "notion-image rounded-xl border border-border my-4 max-w-full h-auto",
        },
      }),
      CharacterCount,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent)
        },
      }).configure({ lowlight }),
      Callout,
      ToggleBlock,
      ToggleSummary,
      ToggleContent,
      SlashCommand,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap min-h-[480px] focus:outline-none px-2 py-1",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  React.useEffect(() => {
    const handleOpenImageDialog = () => {
      setImageDialogOpen(true)
    }

    window.addEventListener("tiptap:open-image-dialog", handleOpenImageDialog)
    return () => {
      window.removeEventListener("tiptap:open-image-dialog", handleOpenImageDialog)
    }
  }, [])

  if (!editor) return null

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col rounded-xl border border-border bg-card"
    >
      {/* Notion Gutter Block Handle (+ and :: grip) */}
      <BlockHandle editor={editor} containerRef={containerRef} />

      {/* Floating Bubble Toolbar */}
      <EditorBubbleMenu editor={editor} />

      {/* Floating Table Toolbar */}
      <TableToolbar editor={editor} />

      {/* Image Insertion Dialog */}
      <ImageDialog
        editor={editor}
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
      />

      {/* Main Block Content Canvas */}
      <div className="relative flex-1 px-6 py-7 pl-10 md:pl-12">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Status Bar */}
      <EditorStatusBar editor={editor} />
    </div>
  )
}
