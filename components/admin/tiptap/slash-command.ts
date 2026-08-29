import { Extension } from "@tiptap/core"
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import type { Editor, Range } from "@tiptap/core"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Type,
  CheckSquare,
  Sparkles,
  Table as TableIcon,
  ImageIcon,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { SlashCommandList, type SlashCommandListRef } from "@/components/admin/tiptap/slash-command-list"

export interface SlashCommandItem {
  title: string
  description: string
  category: "Básicos" | "Listas" | "Destacados" | "Estructura y Medios"
  icon: LucideIcon
  command: (props: { editor: Editor; range: Range }) => void
}

export const COMMANDS: SlashCommandItem[] = [
  // Básicos
  {
    title: "Texto",
    description: "Texto normal de párrafo",
    category: "Básicos",
    icon: Type,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Título 1",
    description: "Encabezado grande de sección",
    category: "Básicos",
    icon: Heading1,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Título 2",
    description: "Encabezado mediano",
    category: "Básicos",
    icon: Heading2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Título 3",
    description: "Encabezado pequeño o subsección",
    category: "Básicos",
    icon: Heading3,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 4 }).run(),
  },
  {
    title: "Divisor",
    description: "Línea horizontal separadora",
    category: "Básicos",
    icon: Minus,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },

  // Listas
  {
    title: "Lista con viñetas",
    description: "Crea una lista simple sin orden",
    category: "Listas",
    icon: List,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Lista numerada",
    description: "Crea una lista ordenada con números",
    category: "Listas",
    icon: ListOrdered,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Lista de tareas (To-Do)",
    description: "Casillas de verificación interactivas",
    category: "Listas",
    icon: CheckSquare,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Lista desplegable (Toggle)",
    description: "Acordeón colapsable para ocultar detalles",
    category: "Listas",
    icon: ChevronRight,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setToggleBlock().run(),
  },

  // Destacados & Código
  {
    title: "Cuadro Destacado (Callout)",
    description: "Caja resaltada con ícono y fondo",
    category: "Destacados",
    icon: Sparkles,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCallout({ icon: "💡", color: "default" }).run(),
  },
  {
    title: "Bloque de código",
    description: "Código fuente con resaltado de sintaxis",
    category: "Destacados",
    icon: Code2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock({ language: "typescript" }).run(),
  },
  {
    title: "Cita",
    description: "Resalta una frase o cita célebre",
    category: "Destacados",
    icon: Quote,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },

  // Estructura y Medios
  {
    title: "Tabla",
    description: "Inserta una cuadrícula de datos 3x3",
    category: "Estructura y Medios",
    icon: TableIcon,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Imagen",
    description: "Inserta una imagen desde URL o galería",
    category: "Estructura y Medios",
    icon: ImageIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      window.dispatchEvent(new CustomEvent("tiptap:open-image-dialog"))
    },
  },
]

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase().trim()
          if (!q) return COMMANDS
          return COMMANDS.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q),
          )
        },
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
          props.command({ editor, range })
        },
        render: () => {
          let component: ReactRenderer<SlashCommandListRef>
          let unmount: (() => void) | undefined

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandList, {
                props: { items: props.items, command: props.command },
                editor: props.editor,
              })
              unmount = props.mount(component.element as HTMLElement)
            },
            onUpdate: (props) => {
              component.updateProps({ items: props.items, command: props.command })
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                unmount?.()
                return true
              }
              return component.ref?.onKeyDown(props) ?? false
            },
            onExit: () => {
              unmount?.()
              component.destroy()
            },
          }
        },
      } satisfies Partial<SuggestionOptions<SlashCommandItem>>,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
