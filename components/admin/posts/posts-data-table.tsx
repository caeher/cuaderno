"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Eye,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Star,
  CheckCircle2,
  FileText,
  Clock,
  ArrowUpDown,
  Filter,
  X,
  Folder,
} from "lucide-react"
import { toast } from "sonner"
import type { Category, Post, PostStatus, Tag } from "@/lib/domain/entities"
import { formatCompactNumber, formatShortDate } from "@/lib/format"
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

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4">
        {/* Status Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>Todos</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-semibold">
                {counts.all}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === "published"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>Publicados</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-semibold">
                {counts.published}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === "draft"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>Borradores</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-semibold">
                {counts.draft}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("scheduled")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === "scheduled"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>Programados</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-semibold">
                {counts.scheduled}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
                title="Vista de tabla"
              >
                <List className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
                title="Vista de cuadrícula"
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar + Filters Row */}
        <div className="grid gap-3 sm:grid-cols-12 items-center">
          {/* Search Input */}
          <div className="relative sm:col-span-5 lg:col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título o contenido..."
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          {allCategories.length > 0 && (
            <div className="sm:col-span-3 lg:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer truncate"
              >
                <option value="all">Todas las categorías</option>
                <option value="uncategorized">Sin categoría</option>
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    📁 {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-2">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer truncate"
              >
                <option value="all">Todas las etiquetas</option>
                {allTags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    #{tag.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By Dropdown */}
          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground hidden lg:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full sm:w-auto rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="views">Más vistos</option>
              <option value="likes">Más me gusta</option>
              <option value="comments">Más comentarios</option>
              <option value="title">Alfabético (A-Z)</option>
            </select>
          </div>
        </div>
      </div>


      {/* Bulk Actions Floating Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary">
              {selectedIds.size} post{selectedIds.size > 1 ? "s" : ""} seleccionado{selectedIds.size > 1 ? "s" : ""}
            </span>
            <Button variant="ghost" size="xs" onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground">
              Deseleccionar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleBulkStatus("published")}
              disabled={isActionPending}
            >
              Publicar seleccionados
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleBulkStatus("draft")}
              disabled={isActionPending}
            >
              Mover a borrador
            </Button>
            <Button
              size="xs"
              variant="destructive"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={isActionPending}
            >
              <Trash2 className="size-3" />
              Eliminar ({selectedIds.size})
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area: Table View vs Grid View */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          preset="posts"
          title={searchQuery || statusFilter !== "all" || tagFilter !== "all" ? "No se encontraron posts" : "Aún no tienes posts"}
          description={
            searchQuery || statusFilter !== "all" || tagFilter !== "all"
              ? "Prueba cambiando o limpiando los filtros de búsqueda."
              : "Comienza a escribir tu primera historia o diseña con el lienzo visual."
          }
          action={
            searchQuery || statusFilter !== "all" || tagFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setTagFilter("all")
                }}
              >
                Limpiar filtros
              </Button>
            ) : (
              <Button size="sm" render={<Link href="/panel/posts/nuevo" />}>
                Crear primer post
              </Button>
            )
          }
        />
      ) : viewMode === "table" ? (
        <div className="rounded-md border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Vistas</TableHead>
                <TableHead className="text-right">Me gusta</TableHead>
                <TableHead className="text-right">Comentarios</TableHead>
                <TableHead className="text-right">Actualizado</TableHead>
                <TableHead className="w-12 text-center" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => {
                const isSelected = selectedIds.has(post.id)
                const category = post.categoryId ? categoryMap.get(post.categoryId) : null

                return (
                  <TableRow key={post.id} className={isSelected ? "bg-muted/30" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(post.id)}
                        aria-label={`Seleccionar ${post.title}`}
                      />
                    </TableCell>
                    <TableCell className="p-0 text-center">
                      <button
                        onClick={() => handleToggleFeatured(post.id)}
                        title={post.featured ? "Quitar de destacados" : "Marcar como destacado"}
                        className="cursor-pointer text-muted-foreground hover:text-amber-500 transition-colors p-1"
                      >
                        <Star
                          className={`size-4 ${
                            post.featured ? "fill-amber-400 text-amber-500" : "opacity-30 hover:opacity-100"
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="max-w-xs md:max-w-md font-medium text-foreground">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <Link href={`/panel/posts/${post.id}`} className="hover:underline font-medium truncate">
                            {post.title}
                          </Link>
                        </div>
                        {post.excerpt && (
                          <span className="text-xs text-muted-foreground truncate">{post.excerpt}</span>
                        )}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.tags.slice(0, 3).map((tagSlug) => (
                              <span key={tagSlug} className="text-[10px] text-muted-foreground font-mono">
                                #{tagSlug}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-muted/60 border border-border/80">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: category.color || "#3b82f6" }}
                          />
                          <span className="truncate max-w-[120px]">{category.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sin categoría</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<button className="cursor-pointer" />}>
                          <Badge
                            variant={
                              post.status === "published"
                                ? "default"
                                : post.status === "scheduled"
                                ? "outline"
                                : "secondary"
                            }
                            className="cursor-pointer hover:opacity-80"
                          >
                            {statusLabels[post.status] ?? post.status}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel className="text-xs">Cambiar estado</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleChangeStatus(post.id, "published")}>
                            Publicado
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeStatus(post.id, "draft")}>
                            Borrador
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeStatus(post.id, "scheduled")}>
                            Programado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatCompactNumber(post.views)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatCompactNumber(post.likes)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatCompactNumber(post.comments)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatShortDate(post.updatedAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" className="cursor-pointer" />}>
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem render={<Link href={`/panel/posts/${post.id}`} />}>
                              <Pencil data-icon="inline-start" /> Editar post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                              <Copy data-icon="inline-start" /> Duplicar
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteDialogPost(post)}
                          >
                            <Trash2 data-icon="inline-start" /> Eliminar post
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
        /* Grid Card View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const isSelected = selectedIds.has(post.id)
            const category = post.categoryId ? categoryMap.get(post.categoryId) : null

            return (
              <Card key={post.id} className={`relative flex flex-col justify-between transition-shadow hover:shadow-md ${isSelected ? "border-primary ring-1 ring-primary" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(post.id)}
                        aria-label={`Seleccionar ${post.title}`}
                      />
                      <Badge
                        variant={
                          post.status === "published"
                            ? "default"
                            : post.status === "scheduled"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {statusLabels[post.status] ?? post.status}
                      </Badge>
                      {category && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted border border-border">
                          <span
                            className="size-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: category.color || "#3b82f6" }}
                          />
                          <span className="truncate max-w-[90px]">{category.name}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleFeatured(post.id)}
                      className="cursor-pointer text-muted-foreground hover:text-amber-500"
                    >
                      <Star className={`size-4 ${post.featured ? "fill-amber-400 text-amber-500" : "opacity-30"}`} />
                    </button>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-2">
                    <Link href={`/panel/posts/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs mt-1">
                    {post.excerpt || "Sin resumen"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{formatCompactNumber(post.views)} vistas</span>
                      <span>{formatCompactNumber(post.likes)} likes</span>
                      <span>{formatCompactNumber(post.comments)} com.</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" className="cursor-pointer" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/panel/posts/${post.id}`} />}>
                          <Pencil data-icon="inline-start" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                          <Copy data-icon="inline-start" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteDialogPost(post)}>
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

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteDialogPost)}
        onOpenChange={(open) => !open && setDeleteDialogPost(null)}
        title="¿Eliminar este post?"
        description={`¿Estás seguro de que deseas eliminar permanentemente "${deleteDialogPost?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar post"
        variant="destructive"
        isLoading={isActionPending}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title={`¿Eliminar ${selectedIds.size} posts?`}
        description="Esta acción eliminará de forma permanente todos los posts seleccionados junto con sus comentarios. No se puede deshacer."
        confirmText={`Eliminar ${selectedIds.size} posts`}
        variant="destructive"
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}

