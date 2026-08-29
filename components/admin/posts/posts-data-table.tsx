"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  LayoutGrid,
  List,
  Eye,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Star,
  X,
  Image as ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { Category, Post, PostStatus, Tag } from "@/lib/domain/entities"
import { formatCompactNumber, formatShortDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  deletePostAction,
  duplicatePostAction,
  togglePostFeaturedAction,
  togglePostStatusAction,
  batchDeletePostsAction,
  batchUpdatePostStatusAction,
} from "@/app/actions/blog-actions"

const statusLabels: Record<string, string> = {
  published: "Publicado",
  draft: "Borrador",
  scheduled: "Programado",
}

/** Vocabulario cerrado de badges de estado — la regla de los tres colores. */
const statusBadgeStyles: Record<string, string> = {
  published: "bg-perf-tint text-perf-strong",
  draft: "bg-warn-tint text-warn-ink",
  scheduled: "bg-ia-tint text-ia",
}

const NEUTRAL_BADGE = "bg-neutral-tint text-neutral"

type SortOption = "newest" | "oldest" | "views" | "likes" | "comments" | "title"

export interface PostsDataTableProps {
  initialPosts?: Post[]
  posts?: Post[]
  allTags?: Tag[]
  allCategories?: Category[]
}

export function PostsDataTable({
  initialPosts,
  posts: legacyPosts,
  allTags = [],
  allCategories = [],
}: PostsDataTableProps) {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts ?? legacyPosts ?? [])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | PostStatus>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [tagFilter, setTagFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<SortOption>("newest")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  // Dialog states
  const [deleteDialogPost, setDeleteDialogPost] = React.useState<Post | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = React.useState(false)
  const [isActionPending, setIsActionPending] = React.useState(false)

  React.useEffect(() => {
    if (initialPosts) setPosts(initialPosts)
    else if (legacyPosts) setPosts(legacyPosts)
  }, [initialPosts, legacyPosts])

  // Map categories for quick lookups
  const categoryMap = React.useMemo(() => {
    return new Map(allCategories.map((c) => [c.id, c]))
  }, [allCategories])

  // Computed counts for tabs
  const counts = React.useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
    }
  }, [posts])

  // Filter & Sort
  const filteredPosts = React.useMemo(() => {
    return posts
      .filter((post) => {
        // Status filter
        if (statusFilter !== "all" && post.status !== statusFilter) return false
        // Category filter
        if (categoryFilter !== "all") {
          if (categoryFilter === "uncategorized") {
            if (post.categoryId) return false
          } else if (post.categoryId !== categoryFilter) {
            return false
          }
        }
        // Tag filter
        if (tagFilter !== "all" && !post.tags.includes(tagFilter)) return false
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesTitle = post.title.toLowerCase().includes(q)
          const matchesExcerpt = post.excerpt.toLowerCase().includes(q)
          const matchesTags = post.tags.some((t) => t.toLowerCase().includes(q))
          if (!matchesTitle && !matchesExcerpt && !matchesTags) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "newest") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
        if (sortBy === "oldest") return (a.updatedAt ?? "").localeCompare(b.updatedAt ?? "")
        if (sortBy === "views") return b.views - a.views
        if (sortBy === "likes") return b.likes - a.likes
        if (sortBy === "comments") return b.comments - a.comments
        if (sortBy === "title") return a.title.localeCompare(b.title)
        return 0
      })
  }, [posts, statusFilter, categoryFilter, tagFilter, searchQuery, sortBy])


  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPosts.map((p) => p.id)))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Quick Action: Toggle Featured
  const handleToggleFeatured = async (id: string) => {
    const target = posts.find((p) => p.id === id)
    if (!target) return

    // Optimistic
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    )

    try {
      const res = await togglePostFeaturedAction(id)
      if (res.success && res.post) {
        toast.success(res.post.featured ? "Post destacado" : "Post removido de destacados")
      }
    } catch {
      toast.error("Error al cambiar estado de destacado")
      // Rollback
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: target.featured } : p))
      )
    }
  }

  // Quick Action: Change Status
  const handleChangeStatus = async (id: string, newStatus: PostStatus) => {
    const target = posts.find((p) => p.id === id)
    if (!target || target.status === newStatus) return

    // Optimistic
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    )

    try {
      const res = await togglePostStatusAction(id, newStatus)
      if (res.success) {
        toast.success(`Estado cambiado a ${statusLabels[newStatus]}`)
      }
    } catch {
      toast.error("Error al actualizar estado")
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: target.status } : p))
      )
    }
  }

  // Quick Action: Duplicate Post
  const handleDuplicate = async (id: string) => {
    try {
      setIsActionPending(true)
      const res = await duplicatePostAction(id)
      if (res.success && res.post) {
        setPosts((prev) => [res.post!, ...prev])
        toast.success("Post duplicado como borrador")
      } else {
        toast.error("Error al duplicar el post")
      }
    } catch {
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsActionPending(false)
    }
  }

  // Single Delete
  const handleDeleteConfirm = async () => {
    if (!deleteDialogPost) return
    try {
      setIsActionPending(true)
      const res = await deletePostAction(deleteDialogPost.id)
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== deleteDialogPost.id))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(deleteDialogPost.id)
          return next
        })
        toast.success("Post eliminado correctamente")
      } else {
        toast.error("No se pudo eliminar el post")
      }
    } catch {
      toast.error("Error inesperado al eliminar")
    } finally {
      setIsActionPending(false)
      setDeleteDialogPost(null)
    }
  }

  // Bulk Delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      setIsBulkDeleting(true)
      const res = await batchDeletePostsAction(ids)
      if (res.success) {
        setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
        setSelectedIds(new Set())
        toast.success(`${ids.length} posts eliminados`)
      }
    } catch {
      toast.error("Error al eliminar los posts seleccionados")
    } finally {
      setIsBulkDeleting(false)
      setShowBulkDeleteDialog(false)
    }
  }

  // Bulk Status Update
  const handleBulkStatus = async (newStatus: PostStatus) => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      setIsActionPending(true)
      const res = await batchUpdatePostStatusAction(ids, newStatus)
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: newStatus } : p))
        )
        toast.success(`${ids.length} posts actualizados a ${statusLabels[newStatus]}`)
        setSelectedIds(new Set())
      }
    } catch {
      toast.error("Error al actualizar los posts seleccionados")
    } finally {
      setIsActionPending(false)
    }
  }

  const statusTabs: { value: "all" | PostStatus; label: string; count: number }[] = [
    { value: "all", label: "Todas", count: counts.all },
    { value: "published", label: "Publicadas", count: counts.published },
    { value: "draft", label: "Borradores", count: counts.draft },
    { value: "scheduled", label: "Programadas", count: counts.scheduled },
  ]

  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== "all" || tagFilter !== "all"

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs por estado — subrayado índigo en el activo */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "relative shrink-0 cursor-pointer px-3 pb-3 pt-1 text-sm font-medium transition-colors",
                "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors",
                isActive
                  ? "text-ia after:bg-ia"
                  : "text-muted-foreground after:bg-transparent hover:text-foreground"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>

      {/* Barra de lista: buscador · filtros · orden · alternador de vista */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar entradas…"
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-tertiary hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {allCategories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 max-w-48 cursor-pointer truncate rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="all">Todas las categorías</option>
            <option value="uncategorized">Sin categoría</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="h-9 max-w-48 cursor-pointer truncate rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="all">Todas las etiquetas</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.slug}>
                #{tag.name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2 sm:ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 cursor-pointer rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="views">Más vistas</option>
            <option value="likes">Más me gusta</option>
            <option value="comments">Más comentarios</option>
            <option value="title">Alfabético (A-Z)</option>
          </select>

          {/* Alternador lista / grilla — activo en índigo */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "cursor-pointer rounded-md p-1.5 transition-colors",
                viewMode === "table"
                  ? "bg-ia-tint text-ia"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Vista de lista"
              aria-label="Vista de lista"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "cursor-pointer rounded-md p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-ia-tint text-ia"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Vista de cuadrícula"
              aria-label="Vista de cuadrícula"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de selección múltiple */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ia-border bg-ia-tint px-3 py-2">
          <span className="text-sm font-medium text-ia">
            {selectedIds.size} entrada{selectedIds.size > 1 ? "s" : ""} seleccionada{selectedIds.size > 1 ? "s" : ""}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatus("published")}
              disabled={isActionPending}
              className="cursor-pointer"
            >
              Publicar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatus("draft")}
              disabled={isActionPending}
              className="cursor-pointer"
            >
              Mover a borrador
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={isActionPending}
              className="cursor-pointer text-destructive hover:bg-danger-tint hover:text-destructive"
            >
              <Trash2 data-icon="inline-start" />
              Eliminar ({selectedIds.size})
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
              className="cursor-pointer text-ia hover:bg-card hover:text-ia-hover"
              aria-label="Limpiar selección"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Contenido: tabla o grilla */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10">
          <EmptyState
            preset={hasActiveFilters ? "search" : "posts"}
            bordered={false}
            title={
              hasActiveFilters
                ? searchQuery
                  ? `Sin resultados para “${searchQuery}”`
                  : "Sin resultados"
                : "Aún no tienes entradas"
            }
            description={
              hasActiveFilters
                ? "Prueba con otro término o quita los filtros."
                : "Crea tu primera entrada y empieza a publicar."
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setTagFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" className="cursor-pointer" render={<Link href="/panel/posts/nuevo" />}>
                  Nueva entrada
                </Button>
              )
            }
          />
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table className="[&_td]:px-3 [&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_th]:px-3 [&_th:first-child]:pl-5 [&_th:last-child]:pr-5">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 w-10">
                  <Checkbox
                    checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todas"
                  />
                </TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground">Título</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground">Categoría</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground">Estado</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground">Vistas</TableHead>
                <TableHead className="h-12 text-xs font-medium text-muted-foreground">Fecha</TableHead>
                <TableHead className="h-12 w-14" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => {
                const isSelected = selectedIds.has(post.id)
                const category = post.categoryId ? categoryMap.get(post.categoryId) : null

                return (
                  <TableRow key={post.id} className={cn("h-[72px]", isSelected && "bg-surface-sunken")}>
                    <TableCell className="py-3 align-middle">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(post.id)}
                        aria-label={`Seleccionar ${post.title}`}
                      />
                    </TableCell>

                    <TableCell className="py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-sunken">
                          {post.coverUrl ? (
                            <img src={post.coverUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <ImageIcon className="size-5 text-text-tertiary" />
                          )}
                        </div>
                        <div className="flex min-w-0 max-w-xs flex-col gap-0.5 md:max-w-md">
                          <div className="flex items-start gap-1.5">
                            <button
                              onClick={() => handleToggleFeatured(post.id)}
                              title={post.featured ? "Quitar de destacadas" : "Marcar como destacada"}
                              aria-label={post.featured ? "Quitar de destacadas" : "Marcar como destacada"}
                              className="mt-0.5 shrink-0 cursor-pointer transition-colors"
                            >
                              <Star
                                className={cn(
                                  "size-3.5",
                                  post.featured
                                    ? "fill-warn text-warn"
                                    : "text-text-tertiary opacity-40 hover:opacity-100"
                                )}
                              />
                            </button>
                            <Link
                              href={`/panel/posts/${post.id}`}
                              className="line-clamp-2 text-sm font-medium whitespace-normal text-foreground hover:underline"
                            >
                              {post.title}
                            </Link>
                          </div>
                          <span className="truncate text-xs text-text-tertiary">/{post.slug}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 align-middle">
                      {category ? (
                        <span className="inline-flex max-w-40 items-center gap-1.5 rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-foreground">
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-cat-8"
                            style={category.color ? { backgroundColor: category.color } : undefined}
                          />
                          <span className="truncate">{category.name}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-text-tertiary">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<button className="cursor-pointer" />}>
                          <Badge
                            className={cn(
                              "h-6 rounded-full border-transparent px-2.5 text-xs font-medium transition-opacity hover:opacity-80",
                              statusBadgeStyles[post.status] ?? NEUTRAL_BADGE
                            )}
                          >
                            {statusLabels[post.status] ?? post.status}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel className="text-xs">Cambiar estado</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleChangeStatus(post.id, "published")}>
                            Publicado
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleChangeStatus(post.id, "draft")}>
                            Borrador
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleChangeStatus(post.id, "scheduled")}>
                            Programado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    <TableCell className="py-3 align-middle text-sm tabular-nums text-muted-foreground">
                      {formatCompactNumber(post.views)}
                    </TableCell>

                    <TableCell className="py-3 align-middle text-sm tabular-nums text-muted-foreground">
                      {formatShortDate(post.updatedAt)}
                    </TableCell>

                    <TableCell className="py-3 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="cursor-pointer text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer" render={<Link href={`/panel/posts/${post.id}`} />}>
                              <Pencil data-icon="inline-start" /> Editar
                            </DropdownMenuItem>
                            {post.status === "published" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                render={<Link href={`/post/${post.slug}`} target="_blank" rel="noreferrer" />}
                              >
                                <Eye data-icon="inline-start" /> Ver entrada
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleDuplicate(post.id)}>
                              <Copy data-icon="inline-start" /> Duplicar
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => setDeleteDialogPost(post)}
                          >
                            <Trash2 data-icon="inline-start" /> Eliminar entrada
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Vista de grilla */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const isSelected = selectedIds.has(post.id)
            const category = post.categoryId ? categoryMap.get(post.categoryId) : null

            return (
              <Card
                key={post.id}
                className={cn(
                  "flex flex-col justify-between gap-0 overflow-hidden rounded-xl border bg-card py-0 shadow-none ring-0 transition-colors",
                  isSelected ? "border-ia-border bg-ia-tint" : "border-border"
                )}
              >
                <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-surface-sunken">
                  {post.coverUrl ? (
                    <img src={post.coverUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-6 text-text-tertiary" />
                  )}
                </div>

                <CardHeader className="flex flex-col gap-2 px-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(post.id)}
                        aria-label={`Seleccionar ${post.title}`}
                      />
                      <Badge
                        className={cn(
                          "h-6 rounded-full border-transparent px-2.5 text-xs font-medium",
                          statusBadgeStyles[post.status] ?? NEUTRAL_BADGE
                        )}
                      >
                        {statusLabels[post.status] ?? post.status}
                      </Badge>
                      {category && (
                        <span className="inline-flex max-w-28 items-center gap-1.5 rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-foreground">
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-cat-8"
                            style={category.color ? { backgroundColor: category.color } : undefined}
                          />
                          <span className="truncate">{category.name}</span>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleFeatured(post.id)}
                      title={post.featured ? "Quitar de destacadas" : "Marcar como destacada"}
                      aria-label={post.featured ? "Quitar de destacadas" : "Marcar como destacada"}
                      className="shrink-0 cursor-pointer"
                    >
                      <Star
                        className={cn(
                          "size-4",
                          post.featured ? "fill-warn text-warn" : "text-text-tertiary opacity-40 hover:opacity-100"
                        )}
                      />
                    </button>
                  </div>

                  <CardTitle className="line-clamp-2 text-sm font-medium text-foreground">
                    <Link href={`/panel/posts/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
                    {post.excerpt || "Sin extracto"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pb-3 pt-3">
                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs tabular-nums text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{formatCompactNumber(post.views)} vistas</span>
                      <span>{formatCompactNumber(post.likes)} me gusta</span>
                      <span>{formatCompactNumber(post.comments)} com.</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" render={<Link href={`/panel/posts/${post.id}`} />}>
                          <Pencil data-icon="inline-start" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleDuplicate(post.id)}>
                          <Copy data-icon="inline-start" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => setDeleteDialogPost(post)}
                        >
                          <Trash2 data-icon="inline-start" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pie de lista */}
      {filteredPosts.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="tabular-nums">{filteredPosts.length}</span> de{" "}
          <span className="tabular-nums">{posts.length}</span>{" "}
          {posts.length === 1 ? "entrada" : "entradas"}
        </p>
      )}

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteDialogPost)}
        onOpenChange={(open) => !open && setDeleteDialogPost(null)}
        title="¿Eliminar esta entrada?"
        description={`¿Estás seguro de que deseas eliminar permanentemente "${deleteDialogPost?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar entrada"
        variant="destructive"
        isLoading={isActionPending}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title={`¿Eliminar ${selectedIds.size} entradas?`}
        description="Esta acción eliminará de forma permanente todas las entradas seleccionadas junto con sus comentarios. No se puede deshacer."
        confirmText={`Eliminar ${selectedIds.size} entradas`}
        variant="destructive"
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
