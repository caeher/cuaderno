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
        placeholder="Buscar por título o descripción..."
        defaultValue={searchQuery ?? ""}
        hiddenParams={{ tag: activeTag, category: activeCategory }}
      />

      {/* Categories Row */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                className="cursor-pointer text-xs"
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
                      "cursor-pointer text-xs gap-1.5",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color || "#3b82f6" }}
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
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                className="cursor-pointer text-xs"
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
                      "cursor-pointer text-xs font-mono font-normal",
                      isActive && "bg-primary text-primary-foreground font-medium"
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

