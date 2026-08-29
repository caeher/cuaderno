"use client"

import * as React from "react"
import Link from "next/link"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function CategoryFilterBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { home, global, isStudioCanvas } = useTemplateContext()

  const categories = home?.categories || (isStudioCanvas ? [
    { id: "c1", name: "Todos", slug: "todos", color: "#64748b" },
    { id: "c2", name: "Diseño & UX", slug: "diseno", color: "#3b82f6" },
    { id: "c3", name: "Ingeniería", slug: "ingenieria", color: "#10b981" },
    { id: "c4", name: "Cultura", slug: "cultura", color: "#8b5cf6" },
  ] : [])

  const [activeSlug, setActiveSlug] = React.useState("todos")

  return (
    <div
      style={css}
      className={cn(
        "category-filter-widget flex flex-wrap items-center gap-2 overflow-x-auto pb-2 w-full",
        node.style?.customClass
      )}
    >
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveSlug(cat.slug)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.color && (
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            )}
            <span>{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}
