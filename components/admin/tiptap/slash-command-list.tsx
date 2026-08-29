"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { SlashCommandItem } from "@/components/admin/tiptap/slash-command"

interface SlashCommandListProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  function SlashCommandList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    useEffect(() => {
      const activeElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" })
      }
    }, [selectedIndex])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % Math.max(items.length, 1))
          return true
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % Math.max(items.length, 1))
          return true
        }
        if (event.key === "Enter") {
          if (items[selectedIndex]) {
            command(items[selectedIndex])
          }
          return true
        }
        return false
      },
    }))

    if (items.length === 0) {
      return (
        <div className="w-72 rounded-xl border border-border bg-popover/95 p-3 text-xs text-muted-foreground shadow-2xl backdrop-blur-md">
          No se encontraron bloques
        </div>
      )
    }

    return (
      <div
        ref={listRef}
        className="max-h-80 w-72 overflow-y-auto rounded-xl border border-border/80 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-md transition-all"
      >
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bloques básicos y avanzados
        </div>
        <div className="flex flex-col gap-0.5">
          {items.map((item, index) => {
            const isSelected = index === selectedIndex
            return (
              <button
                key={`${item.category}-${item.title}`}
                data-index={index}
                type="button"
                onClick={() => command(item)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                  isSelected
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "hover:bg-accent/60 text-foreground/90",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 flex-none items-center justify-center rounded-md border border-border/70 bg-background text-foreground/80 shadow-xs",
                    isSelected && "border-accent-foreground/20 text-accent-foreground bg-accent/40",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                <span className="flex flex-col overflow-hidden">
                  <span className="font-medium leading-tight truncate">{item.title}</span>
                  <span className="text-[11px] leading-tight text-muted-foreground truncate">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  },
)
