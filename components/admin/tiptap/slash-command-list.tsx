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
        <div className="w-72 rounded-xl border border-border bg-popover p-3 text-sm text-muted-foreground shadow-lg">
          No se encontraron bloques
        </div>
      )
    }

    return (
      <div
        ref={listRef}
        className="max-h-80 w-72 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg"
      >
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
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
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-ia-tint text-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 flex-none items-center justify-center rounded-lg border border-border bg-card text-muted-foreground",
                    isSelected && "border-ia-border bg-card text-ia",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                <span className="flex flex-col overflow-hidden">
                  <span className="font-medium leading-tight truncate">{item.title}</span>
                  <span className="truncate text-[13px] leading-tight text-text-tertiary">
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
