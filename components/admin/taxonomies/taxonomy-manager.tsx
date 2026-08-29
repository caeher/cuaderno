"use client"

import * as React from "react"
import {
  Tag as TagIcon,
  Plus,
  Pencil,
  Trash2,
  Folder,
  Hash,
  TrendingUp,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import type { Category, Tag } from "@/lib/domain/entities"
import {
  saveCategoryAction,
  deleteCategoryAction,
  saveTagAction,
  deleteTagAction,
} from "@/app/actions/blog-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { cn } from "@/lib/utils"

/**
 * Rampa cerrada de ocho de `design-system/components/data-display/category-dot.md`.
 *
 * `value` es EL DATO que ya vive persistido en cada categoría/etiqueta y que viaja
 * intacto a las mutaciones — no se toca, cambiarlo sería una migración de datos.
 * `token` es la ranura `--cat-1 … --cat-8` con la que se PINTA. Ningún hex llega
 * nunca al DOM: el color se resuelve siempre por token.
 */
const COLOR_PALETTE = [
  { value: "#3b82f6", token: "bg-cat-2", label: "Azul" },
  { value: "#8b5cf6", token: "bg-cat-1", label: "Índigo" },
  { value: "#ec4899", token: "bg-cat-5", label: "Rosa" },
  { value: "#f43f5e", token: "bg-cat-4", label: "Naranja" },
  { value: "#f59e0b", token: "bg-cat-7", label: "Amarillo" },
  { value: "#10b981", token: "bg-cat-3", label: "Verde" },
  { value: "#06b6d4", token: "bg-cat-6", label: "Teal" },
  { value: "#64748b", token: "bg-cat-8", label: "Gris" },
]

/** Ranura de la rampa con la que se pinta un color persistido. Gris por defecto. */
function colorToken(color?: string | null) {
  return COLOR_PALETTE.find((c) => c.value === color?.toLowerCase())?.token ?? "bg-cat-8"
}

/** Tinte del icono de una tarjeta de métrica. Clases literales: Tailwind no ve plantillas. */
const METRIC_TONE = {
  "cat-1": "bg-cat-1/10 text-cat-1",
  "cat-3": "bg-cat-3/10 text-cat-3",
  "cat-5": "bg-cat-5/10 text-cat-5",
  "cat-8": "bg-cat-8/15 text-cat-8",
} as const

/**
 * Tarjeta de la fila de métricas: `bg-card`, hairline, sin sombra y cifra en
 * `tabular-nums`. `variant="text"` es la variante de `stat-card.md` para cuando el
 * valor es un nombre y no una cifra — baja de escala y trunca a una línea.
 */
function MetricCard({
  icon,
  tone,
  label,
  value,
  context,
  variant = "number",
}: {
  icon: React.ReactNode
  tone: keyof typeof METRIC_TONE
  label: string
  value: React.ReactNode
  context?: string
  variant?: "number" | "text"
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
      <span
        aria-hidden
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          METRIC_TONE[tone]
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm text-muted-foreground">{label}</span>
        {variant === "text" ? (
          <span className="truncate text-xl font-semibold leading-tight text-foreground">
            {value}
          </span>
        ) : (
          <span className="text-3xl font-semibold leading-none tabular-nums text-foreground">
            {value}
          </span>
        )}
        {context ? (
          <span className="truncate text-xs tabular-nums text-text-tertiary">{context}</span>
        ) : null}
      </div>
    </div>
  )
}

export interface TaxonomyManagerProps {
  initialCategories: Category[]
  initialTags: Tag[]
  organizationId?: string
}

export function TaxonomyManager({
  initialCategories,
  initialTags,
  organizationId,
}: TaxonomyManagerProps) {
  const [categories, setCategories] = React.useState<Category[]>(initialCategories)
  const [tags, setTags] = React.useState<Tag[]>(initialTags)
  const [activeTab, setActiveTab] = React.useState<"categories" | "tags">("categories")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Category Dialog States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null)
  const [catName, setCatName] = React.useState("")
  const [catSlug, setCatSlug] = React.useState("")
  const [catDesc, setCatDesc] = React.useState("")
  const [catColor, setCatColor] = React.useState("#3b82f6")
  const [deleteCatTarget, setDeleteCatTarget] = React.useState<Category | null>(null)

  // Tag Dialog States
  const [isTagModalOpen, setIsTagModalOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null)
  const [tagName, setTagName] = React.useState("")
  const [tagSlug, setTagSlug] = React.useState("")
  const [tagColor, setTagColor] = React.useState("#64748b")
  const [deleteTagTarget, setDeleteTagTarget] = React.useState<Tag | null>(null)

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset form when opening category modal
  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat)
      setCatName(cat.name)
      setCatSlug(cat.slug)
      setCatDesc(cat.description || "")
      setCatColor(cat.color || "#3b82f6")
    } else {
      setEditingCategory(null)
      setCatName("")
      setCatSlug("")
      setCatDesc("")
      setCatColor("#3b82f6")
    }
    setIsCategoryModalOpen(true)
  }

  // Reset form when opening tag modal
  const openTagModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag)
      setTagName(tag.name)
      setTagSlug(tag.slug)
      setTagColor(tag.color || "#64748b")
    } else {
      setEditingTag(null)
      setTagName("")
      setTagSlug("")
      setTagColor("#64748b")
    }
    setIsTagModalOpen(true)
  }

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return

    try {
      setIsSubmitting(true)
      const res = await saveCategoryAction({
        id: editingCategory?.id,
        organizationId,
        name: catName.trim(),
        slug: catSlug.trim() || undefined,
        description: catDesc.trim() || undefined,
        color: catColor,
      })

      if (res.success && res.category) {
        if (editingCategory) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? { ...res.category!, postCount: c.postCount } : c))
          )
          toast.success("Categoría actualizada con éxito")
        } else {
          setCategories((prev) => [...prev, { ...res.category!, postCount: 0 }])
          toast.success("Categoría creada con éxito")
        }
        setIsCategoryModalOpen(false)
      } else {
        toast.error("No se pudo guardar la categoría")
      }
    } catch {
      toast.error("Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return
    try {
      setIsSubmitting(true)
      const res = await deleteCategoryAction(deleteCatTarget.id)
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deleteCatTarget.id))
        toast.success("Categoría eliminada correctamente")
      }
    } catch {
      toast.error("Error al eliminar categoría")
    } finally {
      setIsSubmitting(false)
      setDeleteCatTarget(null)
    }
  }

  // Save Tag
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = tagName.replace(/^#/, "").trim()
    if (!clean) return

    try {
      setIsSubmitting(true)
      const res = await saveTagAction({
        id: editingTag?.id,
        organizationId,
        name: clean,
        slug: tagSlug.trim() || undefined,
        color: tagColor,
      })

      if (res.success && res.tag) {
        if (editingTag) {
          setTags((prev) =>
            prev.map((t) => (t.id === editingTag.id ? { ...res.tag!, postCount: t.postCount } : t))
          )
          toast.success("Etiqueta actualizada")
        } else {
          setTags((prev) => [...prev, { ...res.tag!, postCount: 0 }])
          toast.success("Etiqueta creada")
        }
        setIsTagModalOpen(false)
      } else {
        toast.error("No se pudo guardar la etiqueta")
      }
    } catch {
      toast.error("Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Tag
  const handleDeleteTag = async () => {
    if (!deleteTagTarget) return
    try {
      setIsSubmitting(true)
      const res = await deleteTagAction(deleteTagTarget.id)
      if (res.success) {
        setTags((prev) => prev.filter((t) => t.id !== deleteTagTarget.id))
        toast.success("Etiqueta eliminada")
      }
    } catch {
      toast.error("Error al eliminar etiqueta")
    } finally {
      setIsSubmitting(false)
      setDeleteTagTarget(null)
    }
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Métricas derivadas de los datos que ya están en pantalla — sin fetching nuevo.
  const categoryPostTotal = categories.reduce((total, c) => total + (c.postCount ?? 0), 0)
  const topCategory = categories.reduce<Category | null>(
    (top, c) => ((c.postCount ?? 0) > (top?.postCount ?? -1) ? c : top),
    null
  )
  const tagUseTotal = tags.reduce((total, t) => total + (t.postCount ?? 0), 0)
  const topTag = tags.reduce<Tag | null>(
    (top, t) => ((t.postCount ?? 0) > (top?.postCount ?? -1) ? t : top),
    null
  )
  const unusedTags = tags.filter((t) => (t.postCount ?? 0) === 0).length

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Taxonomías del Blog
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Organiza tus publicaciones mediante Categorías estructurales (1 por post) y Etiquetas temáticas libres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "categories" ? (
            <Button size="lg" onClick={() => openCategoryModal()} className="cursor-pointer gap-1.5">
              <Plus className="size-4" />
              <span>Nueva categoría</span>
            </Button>
          ) : (
            <Button size="lg" onClick={() => openTagModal()} className="cursor-pointer gap-1.5">
              <Plus className="size-4" />
              <span>Nueva etiqueta</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Categorías y etiquetas comparten ruta: la pestaña activa se marca con
              subrayado índigo, que es como el panel señala navegación. */}
          <TabsList variant="line" className="h-9 gap-5 p-0">
            <TabsTrigger
              value="categories"
              className="cursor-pointer gap-2 px-1 text-sm text-muted-foreground after:bg-ia data-active:text-ia"
            >
              <Folder className="size-4" strokeWidth={1.75} />
              <span>Categorías</span>
              <span className="rounded-full bg-ia-tint px-1.5 text-[10px] font-semibold tabular-nums text-ia">
                {categories.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="tags"
              className="cursor-pointer gap-2 px-1 text-sm text-muted-foreground after:bg-ia data-active:text-ia"
            >
              <TagIcon className="size-4" strokeWidth={1.75} />
              <span>Etiquetas</span>
              <span className="rounded-full bg-ia-tint px-1.5 text-[10px] font-semibold tabular-nums text-ia">
                {tags.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar ${activeTab === "categories" ? "categorías" : "etiquetas"}...`}
              className="h-9 border-border bg-card pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        {/* Tab 1: Categories */}
        <TabsContent value="categories" className="flex flex-col gap-6 pt-6">
          {/* Métricas */}
          {categories.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                tone="cat-1"
                icon={<Folder className="size-5" strokeWidth={1.75} />}
                label="Total de categorías"
                value={categories.length}
              />
              <MetricCard
                tone="cat-3"
                icon={<TrendingUp className="size-5" strokeWidth={1.75} />}
                label="Entradas en total"
                value={categoryPostTotal}
                context="En todas las categorías"
              />
              <MetricCard
                tone="cat-5"
                icon={<Hash className="size-5" strokeWidth={1.75} />}
                label="Categoría más popular"
                variant="text"
                value={topCategory?.name ?? "—"}
                context={`${topCategory?.postCount ?? 0} entradas`}
              />
            </div>
          )}

          {filteredCategories.length === 0 ? (
            <EmptyState
              preset="posts"
              title="No se encontraron categorías"
              description={
                searchQuery
                  ? "No hay categorías que coincidan con la búsqueda."
                  : "Crea tu primera categoría para organizar las temáticas clave de tu blog."
              }
              action={
                <Button size="lg" onClick={() => openCategoryModal()} className="cursor-pointer">
                  <Plus className="size-4" />
                  Crear categoría
                </Button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="h-11 px-4 text-xs font-medium text-muted-foreground">
                      Nombre
                    </TableHead>
                    <TableHead className="hidden h-11 px-4 text-xs font-medium text-muted-foreground lg:table-cell">
                      Descripción
                    </TableHead>
                    <TableHead className="h-11 px-4 text-right text-xs font-medium text-muted-foreground">
                      Entradas
                    </TableHead>
                    <TableHead className="h-11 w-24 px-4 text-right text-xs font-medium text-muted-foreground">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat.id} className="h-14 border-border">
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={cn("size-2 shrink-0 rounded-full", colorToken(cat.color))}
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">
                              {cat.name}
                            </span>
                            <span className="truncate font-mono text-xs text-text-tertiary">
                              /{cat.slug}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-xs truncate px-4 text-sm text-muted-foreground lg:table-cell">
                        {cat.description || "—"}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <span
                          className={cn(
                            "text-sm tabular-nums",
                            (cat.postCount ?? 0) === 0 ? "text-text-tertiary" : "text-foreground"
                          )}
                        >
                          {cat.postCount ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openCategoryModal(cat)}
                            className="cursor-pointer text-text-tertiary hover:text-foreground"
                            title="Editar categoría"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteCatTarget(cat)}
                            className="cursor-pointer text-text-tertiary hover:bg-danger-tint hover:text-destructive"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Tags */}
        <TabsContent value="tags" className="flex flex-col gap-6 pt-6">
          {/* Métricas */}
          {tags.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                tone="cat-1"
                icon={<TagIcon className="size-5" strokeWidth={1.75} />}
                label="Total de etiquetas"
                value={tags.length}
              />
              <MetricCard
                tone="cat-3"
                icon={<TrendingUp className="size-5" strokeWidth={1.75} />}
                label="Usos en total"
                value={tagUseTotal}
                context="En todas las entradas"
              />
              <MetricCard
                tone="cat-5"
                icon={<Hash className="size-5" strokeWidth={1.75} />}
                label="Etiqueta más usada"
                variant="text"
                value={topTag ? `#${topTag.name}` : "—"}
                context={`${topTag?.postCount ?? 0} entradas`}
              />
              <MetricCard
                tone="cat-8"
                icon={<TagIcon className="size-5" strokeWidth={1.75} />}
                label="Sin usar"
                value={unusedTags}
                context="Etiquetas sin entradas"
              />
            </div>
          )}

          {filteredTags.length === 0 ? (
            <EmptyState
              preset="posts"
              title="No se encontraron etiquetas"
              description={
                searchQuery
                  ? "No hay etiquetas que coincidan con la búsqueda."
                  : "Crea etiquetas para añadir palabras clave y temas secundarios a tus artículos."
              }
              action={
                <Button size="lg" onClick={() => openTagModal()} className="cursor-pointer">
                  <Plus className="size-4" />
                  Crear etiqueta
                </Button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="h-11 px-4 text-xs font-medium text-muted-foreground">
                      Etiqueta
                    </TableHead>
                    <TableHead className="hidden h-11 px-4 text-xs font-medium text-muted-foreground sm:table-cell">
                      Slug
                    </TableHead>
                    <TableHead className="h-11 px-4 text-right text-xs font-medium text-muted-foreground">
                      Entradas
                    </TableHead>
                    <TableHead className="h-11 w-24 px-4 text-right text-xs font-medium text-muted-foreground">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id} className="h-14 border-border">
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={cn("size-2 shrink-0 rounded-full", colorToken(tag.color))}
                          />
                          <span className="truncate text-sm font-medium text-foreground">
                            #{tag.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden px-4 font-mono text-xs text-text-tertiary sm:table-cell">
                        {tag.slug}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <span
                          className={cn(
                            "text-sm tabular-nums",
                            (tag.postCount ?? 0) === 0 ? "text-text-tertiary" : "text-foreground"
                          )}
                        >
                          {tag.postCount ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openTagModal(tag)}
                            className="cursor-pointer text-text-tertiary hover:text-foreground"
                            title="Editar etiqueta"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTagTarget(tag)}
                            className="cursor-pointer text-text-tertiary hover:bg-danger-tint hover:text-destructive"
                            title="Eliminar etiqueta"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Modal / Drawer */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 animate-in fade-in">
          <Card className="w-full max-w-md border border-border bg-card ring-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                {editingCategory ? "Editar categoría" : "Nueva categoría"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Las categorías representan las divisiones principales del contenido de tu organización.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCategory}>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Nombre</label>
                  <Input
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Ej. Inteligencia Artificial"
                    className="h-9 border-border text-sm"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Slug (URL)</label>
                  <Input
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="inteligencia-artificial (autogenerado si se deja en blanco)"
                    className="h-9 border-border font-mono text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Descripción (opcional)</label>
                  <Textarea
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Breve explicación del tipo de contenido en esta categoría..."
                    rows={2}
                    className="border-border text-sm"
                  />
                  <p className="text-xs text-text-tertiary">
                    Se muestra bajo el nombre en el listado y en el blog público.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Color distintivo</label>
                  <div className="flex items-center gap-2.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={color.label}
                        aria-pressed={catColor === color.value}
                        onClick={() => setCatColor(color.value)}
                        className={cn(
                          "size-6 cursor-pointer rounded-full transition-transform",
                          color.token,
                          catColor === color.value &&
                            "scale-110 ring-2 ring-ia ring-offset-2 ring-offset-card"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Paleta cerrada de ocho: el color identifica, no significa.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setIsCategoryModalOpen(false)}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!catName.trim() || isSubmitting}
                    className="min-w-[9.5rem] cursor-pointer"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar categoría"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 animate-in fade-in">
          <Card className="w-full max-w-md border border-border bg-card ring-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                {editingTag ? "Editar etiqueta" : "Nueva etiqueta"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Las etiquetas permiten asociar palabras clave temáticas y transversales a los artículos.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveTag}>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Nombre de la etiqueta</label>
                  <Input
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Ej. react, tutorial, opinion"
                    className="h-9 border-border text-sm"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Slug (URL)</label>
                  <Input
                    value={tagSlug}
                    onChange={(e) => setTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="slug-etiqueta"
                    className="h-9 border-border font-mono text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Color de acento</label>
                  <div className="flex items-center gap-2.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={color.label}
                        aria-pressed={tagColor === color.value}
                        onClick={() => setTagColor(color.value)}
                        className={cn(
                          "size-6 cursor-pointer rounded-full transition-transform",
                          color.token,
                          tagColor === color.value &&
                            "scale-110 ring-2 ring-ia ring-offset-2 ring-offset-card"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setIsTagModalOpen(false)}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!tagName.trim() || isSubmitting}
                    className="min-w-[9.5rem] cursor-pointer"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar etiqueta"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteCatTarget)}
        onOpenChange={(open) => !open && setDeleteCatTarget(null)}
        title={`¿Eliminar categoría "${deleteCatTarget?.name}"?`}
        description="Esta acción eliminará la categoría. Los artículos que pertenecían a ella pasarán a 'Sin categoría'. No se eliminará ningún post."
        confirmText="Eliminar categoría"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleDeleteCategory}
      />

      {/* Delete Tag Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTagTarget)}
        onOpenChange={(open) => !open && setDeleteTagTarget(null)}
        title={`¿Eliminar etiqueta "#${deleteTagTarget?.name}"?`}
        description="Esta acción eliminará la etiqueta del catálogo general de tu blog."
        confirmText="Eliminar etiqueta"
        variant="destructive"
        isLoading={isSubmitting}
        onConfirm={handleDeleteTag}
      />
    </div>
  )
}
