"use client"

import * as React from "react"
import { Plus, Check, Folder, ChevronDown, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/domain/entities"
import { quickCreateCategoryAction } from "@/app/actions/blog-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface CategorySelectProps {
  allCategories: Category[]
  selectedCategoryId: string | null | undefined
  onChange: (categoryId: string | null) => void
  onCategoryCreated?: (category: Category) => void
  organizationId?: string
  label?: string
  description?: string
  className?: string
}

export function CategorySelect({
  allCategories,
  selectedCategoryId,
  onChange,
  onCategoryCreated,
  organizationId,
  label = "Categoría principal",
  description = "Selecciona una categoría para clasificar tu artículo.",
  className,
}: CategorySelectProps) {
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [newCatName, setNewCatName] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState("#3b82f6")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const selectedCategory = allCategories.find((c) => c.id === selectedCategoryId)

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return allCategories
    const q = search.toLowerCase()
    return allCategories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    )
  }, [allCategories, search])

  const COLOR_PALETTE = [
    "#3b82f6", // Azul
    "#8b5cf6", // Violeta
    "#ec4899", // Rosa
    "#f59e0b", // Ámbar
    "#10b981", // Esmeralda
    "#06b6d4", // Cian
    "#64748b", // Pizarra
  ]

  async function handleQuickCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const res = await quickCreateCategoryAction(newCatName.trim(), organizationId, selectedColor)
      if (res.success && res.category) {
        toast.success(`Categoría "${res.category.name}" creada`)
        onCategoryCreated?.(res.category)
        onChange(res.category.id)
        setNewCatName("")
        setIsCreating(false)
      } else {
        toast.error("Error al crear categoría")
      }
    } catch {
      toast.error("Error inesperado al crear categoría")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Field className={cn("gap-2", className)}>
      {label && <FieldLabel className="text-[13px] font-medium text-foreground">{label}</FieldLabel>}
      {description && <FieldDescription className="text-xs text-muted-foreground">{description}</FieldDescription>}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              type="button"
              className="h-10 w-full cursor-pointer justify-between rounded-lg border-border bg-card px-3 text-sm font-normal hover:bg-surface-sunken"
            />
          }
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2 truncate">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedCategory.color || "var(--cat-2)" }}
              />
              <span className="font-medium text-foreground truncate">{selectedCategory.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Folder className="size-3.5" />
              <span>Sin categoría asignada</span>
            </div>
          )}
          <ChevronDown className="ml-2 size-4 shrink-0 text-text-tertiary" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-72 p-2">
          {!isCreating ? (
            <>
              <div className="p-1 pb-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar categoría…"
                  className="h-8 rounded-lg text-xs"
                  autoFocus
                />
              </div>

              <DropdownMenuGroup className="max-h-48 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => onChange(null)}
                  className="flex items-center justify-between text-xs cursor-pointer py-1.5"
                >
                  <span className="italic text-muted-foreground">Ninguna (sin categoría)</span>
                  {!selectedCategoryId && <Check className="size-3.5 text-ia" />}
                </DropdownMenuItem>

                {filteredCategories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId
                  return (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => onChange(cat.id)}
                      className="flex items-center justify-between text-xs cursor-pointer py-1.5"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color || "var(--cat-2)" }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      {isSelected && <Check className="size-3.5 shrink-0 text-ia" />}
                    </DropdownMenuItem>
                  )
                })}

                {filteredCategories.length === 0 && (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No se encontraron categorías
                  </div>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={() => {
                  setNewCatName(search.trim())
                  setIsCreating(true)
                }}
                className="flex cursor-pointer items-center gap-2 py-1.5 text-xs font-medium text-ia"
              >
                <Plus className="size-3.5" />
                <span>Crear nueva categoría…</span>
              </DropdownMenuItem>
            </>
          ) : (
            <form onSubmit={handleQuickCreate} className="flex flex-col gap-2 p-1">
              <span className="text-[13px] font-medium text-foreground">Nueva categoría</span>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombre de categoría…"
                className="h-8 rounded-lg text-xs"
                autoFocus
              />

              <div className="flex items-center gap-1.5 py-1">
                <span className="mr-1 text-xs text-muted-foreground">Color:</span>
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "size-4 cursor-pointer rounded-full border border-border transition-transform",
                      selectedColor === color &&
                        "scale-110 ring-2 ring-ia ring-offset-2 ring-offset-card"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsCreating(false)}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="xs"
                  disabled={!newCatName.trim() || isSubmitting}
                  className="h-8 rounded-lg px-3 text-xs font-medium"
                >
                  {isSubmitting ? "Creando..." : "Guardar"}
                </Button>
              </div>
            </form>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  )
}
