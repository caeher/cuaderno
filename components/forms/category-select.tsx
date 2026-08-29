"use client"

import * as React from "react"
import { Plus, Check, Folder, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/domain/entities"
import { quickCreateCategoryAction } from "@/app/actions/blog-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface CategorySelectProps {
  allCategories?: Category[]
  selectedCategoryId: string | null | undefined
  onChange: (categoryId: string | null) => void
  onCategoryCreated?: (category: Category) => void
  organizationId?: string
  label?: string
  description?: string
  className?: string
}

export function CategorySelect({
  allCategories = [],
  selectedCategoryId,
  onChange,
  onCategoryCreated,
  organizationId,
  label = "Categoría principal",
  description = "Selecciona una categoría para clasificar tu artículo.",
  className,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [newCatName, setNewCatName] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState("#3b82f6")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const selectedCategory = React.useMemo(() => {
    if (!selectedCategoryId) return null
    return (
      allCategories.find(
        (c) => c.id === selectedCategoryId || c.slug === selectedCategoryId
      ) || null
    )
  }, [allCategories, selectedCategoryId])

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
        setIsOpen(false)
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
      {label && <FieldLabel className="text-xs font-semibold">{label}</FieldLabel>}
      {description && <FieldDescription className="text-[11px]">{description}</FieldDescription>}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              type="button"
              className="w-full justify-between font-normal text-xs h-9 px-3 bg-background border-border/80 hover:bg-muted/50 cursor-pointer"
            />
          }
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2 truncate">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedCategory.color || "#3b82f6" }}
              />
              <span className="font-medium text-foreground truncate">{selectedCategory.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Folder className="size-3.5" />
              <span>Sin categoría asignada</span>
            </div>
          )}
          <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
        </PopoverTrigger>

        <PopoverContent align="start" className="w-72 p-2">
          {!isCreating ? (
            <div className="flex flex-col gap-1">
              <div className="p-1 pb-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar categoría..."
                  className="h-7 text-xs"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onChange(null)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left",
                    !selectedCategoryId && "bg-accent/70 font-medium text-foreground"
                  )}
                >
                  <span className="italic">Ninguna (Sin categoría)</span>
                  {!selectedCategoryId && <Check className="size-3.5 text-primary shrink-0" />}
                </button>

                {filteredCategories.map((cat) => {
                  const isSelected =
                    cat.id === selectedCategoryId || cat.slug === selectedCategoryId
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onChange(cat.id)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left",
                        isSelected && "bg-accent/70 font-medium"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color || "#3b82f6" }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
                    </button>
                  )
                })}

                {filteredCategories.length === 0 && (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No se encontraron categorías
                  </div>
                )}
              </div>

              <div className="border-t border-border/80 my-1" />

              <button
                type="button"
                onClick={() => {
                  setNewCatName(search.trim())
                  setIsCreating(true)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-accent cursor-pointer transition-colors text-left"
              >
                <Plus className="size-3.5" />
                <span>Crear nueva categoría...</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleQuickCreate} className="flex flex-col gap-2 p-1">
              <span className="text-xs font-semibold text-foreground">Nueva categoría</span>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombre de categoría..."
                className="h-7 text-xs"
                autoFocus
              />

              <div className="flex items-center gap-1.5 py-1">
                <span className="text-[11px] text-muted-foreground mr-1">Color:</span>
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "size-4 rounded-full transition-transform cursor-pointer border border-background",
                      selectedColor === color && "ring-2 ring-primary ring-offset-1 scale-110"
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
                  className="text-xs h-6 px-2 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="xs"
                  disabled={!newCatName.trim() || isSubmitting}
                  className="text-xs h-6 px-2 cursor-pointer"
                >
                  {isSubmitting ? "Creando..." : "Guardar"}
                </Button>
              </div>
            </form>
          )}
        </PopoverContent>
      </Popover>
    </Field>
  )
}
