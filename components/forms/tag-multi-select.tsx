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
          {label && <FieldLabel className="text-[13px] font-medium text-foreground">{label}</FieldLabel>}
          {description && <FieldDescription className="text-xs text-muted-foreground">{description}</FieldDescription>}
        </div>
      </div>

      {/* Selected Tags Pills */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-surface-sunken p-2">
          <span className="mr-1 self-center text-xs font-medium text-text-tertiary">
            Seleccionadas ({selectedTags.length}):
          </span>
          {selectedTags.map((slug) => {
            const tagObj = allTags.find((t) => t.slug === slug || t.id === slug)
            const tagName = tagObj?.name ?? slug
            return (
              <Badge
                key={slug}
                variant="secondary"
                className="h-7 gap-1.5 rounded-full border border-border bg-card py-0 pl-2.5 pr-1 text-xs font-medium text-foreground"
              >
                <span>#{tagName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(slug)}
                  className="cursor-pointer rounded-full p-0.5 text-text-tertiary transition-colors hover:text-foreground"
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
                "inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-xs transition-colors",
                isSelected
                  ? "border-ia-border bg-ia-tint font-medium text-ia"
                  : "border-border bg-card text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
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
            className="h-7 gap-1 rounded-full px-2.5 text-xs font-medium text-ia hover:bg-ia-tint hover:text-ia-hover"
          >
            <Plus className="size-3" />
            <span>Nueva etiqueta</span>
          </Button>
        ) : (
          <form onSubmit={handleCreateTag} className="flex items-center gap-1">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nueva etiqueta…"
              className="h-7 w-32 rounded-lg px-2 py-0 text-xs"
              autoFocus
            />
            <Button
              type="submit"
              size="xs"
              disabled={!newTagName.trim() || isSubmitting}
              className="h-7 rounded-lg px-3 text-xs font-medium"
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
              className="h-7 px-1.5 text-xs text-text-tertiary hover:text-foreground"
            >
              <X className="size-3" />
            </Button>
          </form>
        )}
      </div>
    </Field>
  )
}

