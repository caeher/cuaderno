"use client"

import * as React from "react"
import Link from "next/link"
import {
  MessageSquare,
  Search,
  Trash2,
  Eye,
  FileText,
  Filter,
  ArrowUpDown,
  X,
  ExternalLink,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import type { Comment, Post } from "@/lib/domain/entities"
import { formatShortDate, getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { deleteCommentAction } from "@/app/actions/blog-actions"

export interface AdminCommentsListProps {
  comments: Comment[]
  postMap: Map<string, Post>
  posts?: Post[]
}

export function AdminCommentsList({
  comments: initialComments,
  postMap,
  posts = [],
}: AdminCommentsListProps) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedPostId, setSelectedPostId] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest">("newest")
  const [deleteDialogComment, setDeleteDialogComment] = React.useState<Comment | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  // Compute posts with comments for filter options
  const uniquePosts = React.useMemo(() => {
    if (posts.length > 0) return posts
    const mapPosts = Array.from(postMap.values())
    return mapPosts
  }, [posts, postMap])

  // Filtered comments
  const filteredComments = React.useMemo(() => {
    return comments
      .filter((comment) => {
        // Post filter
        if (selectedPostId !== "all" && comment.postId !== selectedPostId) return false
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const post = postMap.get(comment.postId)
          const matchesAuthor = comment.authorName.toLowerCase().includes(q)
          const matchesContent = comment.content.toLowerCase().includes(q)
          const matchesPost = post?.title.toLowerCase().includes(q) ?? false
          if (!matchesAuthor && !matchesContent && !matchesPost) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "newest") return (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
        return (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
      })
  }, [comments, selectedPostId, searchQuery, sortBy, postMap])

  const handleDeleteConfirm = async () => {
    if (!deleteDialogComment) return
    try {
      setIsDeleting(true)
      const post = postMap.get(deleteDialogComment.postId)
      const res = await deleteCommentAction(deleteDialogComment.id, post?.slug)
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== deleteDialogComment.id))
        toast.success("Comentario eliminado correctamente")
      } else {
        toast.error("Error al eliminar el comentario")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsDeleting(false)
      setDeleteDialogComment(null)
    }
  }

  const postsWithCommentsCount = React.useMemo(() => {
    const postIds = new Set(comments.map((c) => c.postId))
    return postIds.size
  }, [comments])

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageCircle className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total de comentarios</p>
            <h3 className="text-2xl font-bold text-foreground">{comments.length}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Artículos comentados</p>
            <h3 className="text-2xl font-bold text-foreground">{postsWithCommentsCount}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Promedio por artículo</p>
            <h3 className="text-2xl font-bold text-foreground">
              {postsWithCommentsCount > 0 ? (comments.length / postsWithCommentsCount).toFixed(1) : "0"}
            </h3>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid gap-3 sm:grid-cols-12 items-center">
        {/* Search */}
        <div className="relative sm:col-span-6 lg:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por autor, texto o post..."
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

        {/* Post Filter */}
        <div className="sm:col-span-4 lg:col-span-4">
          <select
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer truncate"
          >
            <option value="all">Todos los artículos ({comments.length})</option>
            {uniquePosts.map((post) => {
              const count = comments.filter((c) => c.postId === post.id).length
              return (
                <option key={post.id} value={post.id}>
                  {post.title} ({count})
                </option>
              )
            })}
          </select>
        </div>

        {/* Sort */}
        <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
            className="w-full sm:w-auto rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <EmptyState
          preset="comments"
          bordered={false}
          title={searchQuery || selectedPostId !== "all" ? "No se encontraron comentarios" : "Sin comentarios"}
          description={
            searchQuery || selectedPostId !== "all"
              ? "Prueba cambiando los filtros de búsqueda."
              : "Tus posts aún no han recibido comentarios de la comunidad."
          }
          action={
            searchQuery || selectedPostId !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedPostId("all")
                }}
              >
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredComments.map((comment) => {
            const post = postMap.get(comment.postId)
            return (
              <Card key={comment.id} className="transition-all hover:border-border/80">
                <CardContent className="flex items-start gap-3.5 pt-5 pb-5">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={comment.authorAvatarUrl || "/placeholder.svg"}
                      alt={comment.authorName}
                    />
                    <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                      <time className="text-xs text-muted-foreground shrink-0">
                        {formatShortDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed break-words">
                      {comment.content}
                    </p>
                    {post && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                        <span>Artículo:</span>
                        <Link
                          href={`/panel/posts/${post.id}`}
                          className="font-medium text-foreground hover:underline truncate max-w-sm"
                        >
                          &ldquo;{post.title}&rdquo;
                        </Link>
                        {post.status === "published" && (
                          <Link
                            href={`/post/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline ml-1"
                          >
                            <ExternalLink className="size-3" />
                            Ver post
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteDialogComment(comment)}
                    title="Eliminar comentario"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteDialogComment)}
        onOpenChange={(open) => !open && setDeleteDialogComment(null)}
        title="¿Eliminar este comentario?"
        description={`¿Estás seguro de que deseas eliminar permanentemente el comentario de "${deleteDialogComment?.authorName}"?`}
        confirmText="Eliminar comentario"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

