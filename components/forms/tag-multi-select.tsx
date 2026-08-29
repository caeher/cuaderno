"use client"

import * as React from "react"
import { Plus, X, Hash, Check } from "lucide-react"
import { toast } from "sonner"
import type { Tag } from "@/lib/domain/entities"
import { quickCreateTagAction } from "@/app/actions/blog-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export interface TagMultiSelectProps {
  allTags: Tag[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
  onTagCreated?: (tag: Tag) => void
  organizationId?: string
  label?: string
  description?: string
  showBadgesSummary?: boolean
  className?: string
}

export function TagMultiSelect({
  allTags,
  selectedTags,
  onChange,
  onTagCreated,
  organizationId,
  label = "Etiquetas temáticas",
  description = "Selecciona una o más etiquetas para facilitar la búsqueda de tu contenido.",
  showBadgesSummary = true,
  className,
}: TagMultiSelectProps) {
  const [newTagName, setNewTagName] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleToggleTag = (slug: string) => {
    if (selectedTags.includes(slug)) {
      onChange(selectedTags.filter((t) => t !== slug))
    } else {
      onChange([...selectedTags, slug])
    }
  }

  const handleRemoveTag = (slug: string) => {
    onChange(selectedTags.filter((t) => t !== slug))
  }

  const handleCreateTag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = newTagName.replace(/^#/, "").trim()
    if (!clean || isSubmitting) return

    try {
      setIsSubmitting(true)
      const res = await quickCreateTagAction(clean, organizationId)
      if (res.success && res.tag) {
        toast.success(`Etiqueta #${res.tag.name} creada`)
        onTagCreated?.(res.tag)
        if (!selectedTags.includes(res.tag.slug)) {
          onChange([...selectedTags, res.tag.slug])
        }
        setNewTagName("")
        setIsCreating(false)
      } else {
        toast.error("Error al crear la etiqueta")
      }
    } catch {
      toast.error("Error inesperado al crear etiqueta")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Field className={cn("gap-2.5", className)}>
      <div className="flex items-center justify-between">
        <div>
          {label && <FieldLabel className="text-xs font-semibold">{label}</FieldLabel>}
          {description && <FieldDescription className="text-[11px]">{description}</FieldDescription>}
        </div>
      </div>

      {/* Selected Tags Pills */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/30 border border-border/60">
          <span className="text-[11px] font-medium text-muted-foreground self-center mr-1">
            Seleccionadas ({selectedTags.length}):
          </span>
          {selectedTags.map((slug) => {
            const tagObj = allTags.find((t) => t.slug === slug || t.id === slug)
            const tagName = tagObj?.name ?? slug
            return (
              <Badge
                key={slug}
                variant="secondary"
                className="gap-1.5 pl-2.5 pr-1 py-0.5 text-xs font-normal bg-background hover:bg-muted text-foreground border border-border/80 shadow-xs"
              >
                <span>#{tagName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(slug)}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Available Tags Chips to click-toggle */}
      <div className="flex flex-wrap items-center gap-1.5">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug) || selectedTags.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleToggleTag(tag.slug)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors cursor-pointer border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                  : "bg-background text-muted-foreground border-border/70 hover:border-foreground/30 hover:text-foreground hover:bg-muted/40"
              )}
            >
              {isSelected ? <Check className="size-3 shrink-0" /> : <Hash className="size-3 opacity-50 shrink-0" />}
              <span>{tag.name}</span>
            </button>
          )
        })}

        {/* Quick add inline button / input */}
        {!isCreating ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setIsCreating(true)}
            className="rounded-full text-xs text-primary hover:bg-primary/10 h-6 px-2 gap-1"
          >
            <Plus className="size-3" />
            <span>Nueva etiqueta</span>
          </Button>
        ) : (
          <form onSubmit={handleCreateTag} className="flex items-center gap-1">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nueva etiqueta..."
              className="h-6 text-xs w-32 px-2 py-0"
              autoFocus
            />
            <Button
              type="submit"
              size="xs"
              disabled={!newTagName.trim() || isSubmitting}
              className="h-6 px-2 text-[11px]"
            >
              {isSubmitting ? "..." : "Añadir"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setNewTagName("")
                setIsCreating(false)
              }}
              className="h-6 px-1.5 text-xs text-muted-foreground"
            >
              <X className="size-3" />
            </Button>
          </form>
        )}
      </div>
    </Field>
  )
}

