import * as React from "react"
import Link from "next/link"
import { Folder, Hash } from "lucide-react"
import type { Category, Tag } from "@/lib/domain/entities"
import { SearchInput } from "@/components/forms/search-input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PostSearchFilterProps {
  tags: Tag[]
  categories?: Category[]
  activeTag?: string
  activeCategory?: string
  searchQuery?: string
  actionUrl?: string
  className?: string
}

export function PostSearchFilter({
  tags,
  categories = [],
  activeTag,
  activeCategory,
  searchQuery,
  actionUrl = "/explorar",
  className,
}: PostSearchFilterProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <SearchInput
        action={actionUrl}
        name="q"
        placeholder="Buscar por título o descripción…"
        defaultValue={searchQuery ?? ""}
        hiddenParams={{ tag: activeTag, category: activeCategory }}
      />

      {/* Categories Row */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Categorías
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={
                searchQuery
                  ? `${actionUrl}?q=${searchQuery}${activeTag ? `&tag=${activeTag}` : ""}`
                  : activeTag
                  ? `${actionUrl}?tag=${activeTag}`
                  : actionUrl
              }
            >
              <Badge
                variant={!activeCategory ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  !activeCategory
                    ? "border-ia-border bg-ia-tint font-medium text-ia"
                    : "border-border bg-card text-muted-foreground hover:bg-surface-sunken"
                )}
              >
                Todas las categorías
              </Badge>
            </Link>

            {categories.map((c) => {
              const isActive = activeCategory === c.slug || activeCategory === c.id
              const params = new URLSearchParams()
              if (searchQuery) params.set("q", searchQuery)
              if (activeTag) params.set("tag", activeTag)
              if (!isActive) params.set("category", c.slug)

              const href = `${actionUrl}?${params.toString()}`

              return (
                <Link key={c.id} href={href}>
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer gap-1.5 text-xs",
                      isActive
                        ? "border-ia-border bg-ia-tint font-medium text-ia"
                        : "border-border bg-card text-muted-foreground hover:bg-surface-sunken"
                    )}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color || "var(--cat-2)" }}
                    />
                    <span>{c.name}</span>
                  </Badge>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Tags Row */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Etiquetas temáticas
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={
                searchQuery
                  ? `${actionUrl}?q=${searchQuery}${activeCategory ? `&category=${activeCategory}` : ""}`
                  : activeCategory
                  ? `${actionUrl}?category=${activeCategory}`
                  : actionUrl
              }
            >
              <Badge
                variant={!activeTag ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  !activeTag
                    ? "border-ia-border bg-ia-tint font-medium text-ia"
                    : "border-border bg-card text-muted-foreground hover:bg-surface-sunken"
                )}
              >
                Todas
              </Badge>
            </Link>

            {tags.map((t) => {
              const isActive = activeTag === t.slug
              const params = new URLSearchParams()
              if (searchQuery) params.set("q", searchQuery)
              if (activeCategory) params.set("category", activeCategory)
              if (!isActive) params.set("tag", t.slug)

              const href = `${actionUrl}?${params.toString()}`

              return (
                <Link key={t.id} href={href}>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={cn(
                      "cursor-pointer text-xs font-normal",
                      isActive
                        ? "border-ia-border bg-ia-tint font-medium text-ia"
                        : "border-border bg-card text-muted-foreground hover:bg-surface-sunken"
                    )}
                  >
                    #{t.name}
                  </Badge>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
