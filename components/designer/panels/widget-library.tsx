"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { WIDGET_CATEGORIES, WIDGET_DEFINITIONS } from "@/lib/designer/widget-definitions"
import type { BlockCategory, BlockType } from "@/lib/domain/block-schema"
import { Input } from "@/components/ui/input"
import {
  Search,
  Layout,
  Columns,
  Grid,
  MoveVertical,
  Minus,
  Heading,
  Type,
  Quote,
  Hash,
  Image,
  Images,
  Video,
  Maximize,
  Sparkles,
  MousePointerClick,
  HelpCircle,
  Layers,
  Info,
  BookOpen,
  User,
  Mail,
  Share2,
  Plus,
} from "lucide-react"

const ICON_MAP: Record<string, React.ElementType> = {
  Layout,
  Columns,
  Grid,
  MoveVertical,
  Minus,
  Heading,
  Type,
  Quote,
  Hash,
  Image,
  Images,
  Video,
  Maximize,
  Sparkles,
  MousePointerClick,
  HelpCircle,
  Layers,
  Info,
  BookOpen,
  User,
  Mail,
  Share2,
}

export function WidgetLibrary() {
  const { addBlock, selectedBlockId } = useDesigner()
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<BlockCategory | "all">("all")

  const allWidgets = Object.values(WIDGET_DEFINITIONS)

  const filtered = allWidgets.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "all" || w.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search & Category Filter */}
      <div className="flex flex-col gap-2.5 p-4 border-b border-border bg-card">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar bloque o widget..."
            className="pl-8 text-xs h-8"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors shrink-0 ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {WIDGET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-2.5 py-1 font-medium transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {WIDGET_CATEGORIES.map((category) => {
          const categoryWidgets = filtered.filter((w) => w.category === category.id)
          if (categoryWidgets.length === 0) return null

          return (
            <div key={category.id} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground/80">{category.name}</span>
                <span className="text-[10px] text-muted-foreground">{categoryWidgets.length}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categoryWidgets.map((widget) => {
                  const IconComp = ICON_MAP[widget.icon] || Sparkles
                  return (
                    <button
                      key={widget.type}
                      type="button"
                      onClick={() => addBlock(widget.type, selectedBlockId || undefined, "after")}
                      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3 text-center transition-all hover:border-primary/60 hover:bg-accent/40 hover:shadow-xs active:scale-95"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <IconComp className="size-4" />
                      </div>
                      <span className="font-medium text-xs text-foreground group-hover:text-primary line-clamp-1">
                        {widget.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <p className="text-xs">No se encontraron bloques con "{search}".</p>
          </div>
        )}
      </div>
    </div>
  )
}
