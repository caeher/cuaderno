"use client"

import * as React from "react"
import {
  FolderTree,
  Tag as TagIcon,
  Plus,
  Pencil,
  Trash2,
  Folder,
  Hash,
  Sparkles,
  Search,
  BookOpen,
  Check,
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { cn } from "@/lib/utils"

const COLOR_PALETTE = [
  "#3b82f6", // Azul
  "#8b5cf6", // Violeta
  "#ec4899", // Rosa
  "#f43f5e", // Carmesí
  "#f59e0b", // Ámbar
  "#10b981", // Esmeralda
  "#06b6d4", // Cian
  "#64748b", // Pizarra
]

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

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif tracking-tight text-foreground flex items-center gap-2">
            <FolderTree className="size-5 text-primary" />
            Taxonomías del Blog
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organiza tus publicaciones mediante Categorías estructurales (1 por post) y Etiquetas temáticas libres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "categories" ? (
            <Button size="sm" onClick={() => openCategoryModal()} className="gap-1.5 cursor-pointer">
              <Plus className="size-4" />
              <span>Nueva categoría</span>
            </Button>
          ) : (
            <Button size="sm" onClick={() => openTagModal()} className="gap-1.5 cursor-pointer">
              <Plus className="size-4" />
              <span>Nueva etiqueta</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="categories" className="gap-2 text-xs cursor-pointer">
              <Folder className="size-3.5" />
              <span>Categorías</span>
              <span className="rounded-full bg-primary/15 text-primary px-1.5 py-0.2 text-[10px] font-semibold">
                {categories.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2 text-xs cursor-pointer">
              <TagIcon className="size-3.5" />
              <span>Etiquetas</span>
              <span className="rounded-full bg-primary/15 text-primary px-1.5 py-0.2 text-[10px] font-semibold">
                {tags.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar ${activeTab === "categories" ? "categorías" : "etiquetas"}...`}
              className="h-8 text-xs pl-8 pr-3"
            />
          </div>
        </div>

        {/* Tab 1: Categories */}
        <TabsContent value="categories" className="pt-4">
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
                <Button size="sm" onClick={() => openCategoryModal()}>
                  <Plus className="size-4" />
                  Crear categoría
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead className="w-12 text-center">Color</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="hidden md:table-cell">Descripción</TableHead>
                    <TableHead className="text-right">Posts asociados</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat.id} className="text-xs">
                      <TableCell className="text-center">
                        <span
                          className="inline-block size-3.5 rounded-full shadow-xs border border-border"
                          style={{ backgroundColor: cat.color || "#3b82f6" }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        /{cat.slug}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground line-clamp-1 max-w-xs">
                        {cat.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {cat.postCount ?? 0} {cat.postCount === 1 ? "post" : "posts"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openCategoryModal(cat)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Editar categoría"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeleteCatTarget(cat)}
                            className="cursor-pointer text-muted-foreground hover:text-destructive"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="size-3.5" />
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
        <TabsContent value="tags" className="pt-4">
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
                <Button size="sm" onClick={() => openTagModal()}>
                  <Plus className="size-4" />
                  Crear etiqueta
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead>Etiqueta</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Posts asociados</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id} className="text-xs">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: tag.color || "#64748b" }}
                          />
                          <Badge variant="outline" className="font-mono text-xs">
                            #{tag.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {tag.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {tag.postCount ?? 0} {tag.postCount === 1 ? "post" : "posts"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openTagModal(tag)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Editar etiqueta"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeleteTagTarget(tag)}
                            className="cursor-pointer text-muted-foreground hover:text-destructive"
                            title="Eliminar etiqueta"
                          >
                            <Trash2 className="size-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <Card className="w-full max-w-md bg-background border border-border shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Folder className="size-4 text-primary" />
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </CardTitle>
              <CardDescription className="text-xs">
                Las categorías representan las divisiones principales del contenido de tu organización.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCategory}>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Nombre</label>
                  <Input
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Ej. Inteligencia Artificial"
                    className="mt-1 text-xs"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Slug (URL)</label>
                  <Input
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="inteligencia-artificial (autogenerado si se deja en blanco)"
                    className="mt-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Descripción (opcional)</label>
                  <Textarea
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Breve explicación del tipo de contenido en esta categoría..."
                    rows={2}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Color distintivo</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCatColor(color)}
                        className={cn(
                          "size-5 rounded-full border border-background transition-transform cursor-pointer",
                          catColor === color && "ring-2 ring-primary ring-offset-2 scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCategoryModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={!catName.trim() || isSubmitting}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <Card className="w-full max-w-md bg-background border border-border shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Hash className="size-4 text-primary" />
                {editingTag ? "Editar Etiqueta" : "Nueva Etiqueta"}
              </CardTitle>
              <CardDescription className="text-xs">
                Las etiquetas permiten asociar palabras clave temáticas y transversales a los artículos.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveTag}>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Nombre de la etiqueta</label>
                  <Input
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Ej. react, tutorial, opinion"
                    className="mt-1 text-xs"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Slug (URL)</label>
                  <Input
                    value={tagSlug}
                    onChange={(e) => setTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="slug-etiqueta"
                    className="mt-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Color de acento</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTagColor(color)}
                        className={cn(
                          "size-5 rounded-full border border-background transition-transform cursor-pointer",
                          tagColor === color && "ring-2 ring-primary ring-offset-2 scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTagModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={!tagName.trim() || isSubmitting}>
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
