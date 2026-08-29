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
import { Card } from "@/components/ui/card"
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
        <Card className="flex flex-row items-center gap-3 rounded-xl border-border p-4 shadow-none">
          <div className="flex size-10 items-center justify-center rounded-lg bg-ia-tint text-ia">
            <MessageCircle className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de comentarios</p>
            <h3 className="text-2xl font-semibold tabular-nums text-foreground">{comments.length}</h3>
          </div>
        </Card>

        <Card className="flex flex-row items-center gap-3 rounded-xl border-border p-4 shadow-none">
          <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-tint text-neutral">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Artículos comentados</p>
            <h3 className="text-2xl font-semibold tabular-nums text-foreground">{postsWithCommentsCount}</h3>
          </div>
        </Card>

        <Card className="flex flex-row items-center gap-3 rounded-xl border-border p-4 shadow-none">
          <div className="flex size-10 items-center justify-center rounded-lg bg-perf-tint text-perf-strong">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Promedio por artículo</p>
            <h3 className="text-2xl font-semibold tabular-nums text-foreground">
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
            className="w-full cursor-pointer truncate rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
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
            className="w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 sm:w-auto"
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
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filteredComments.map((comment) => {
            const post = postMap.get(comment.postId)
            return (
              <div key={comment.id} className="transition-colors hover:bg-muted/50">
                <div className="flex items-start gap-3.5 px-5 py-4">
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
                      <time className="shrink-0 text-sm tabular-nums text-text-tertiary">
                        {formatShortDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1.5 break-words text-sm leading-relaxed text-muted-foreground">
                      {comment.content}
                    </p>
                    {post && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-2.5 text-sm text-text-tertiary">
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
                            className="ml-1 inline-flex items-center gap-1 font-medium text-ia hover:underline"
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
                    className="shrink-0 cursor-pointer text-muted-foreground hover:bg-danger-tint hover:text-destructive"
                    onClick={() => setDeleteDialogComment(comment)}
                    title="Eliminar comentario"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
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

