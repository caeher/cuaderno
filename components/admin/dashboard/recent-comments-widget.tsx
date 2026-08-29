"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Comment, Post } from "@/lib/domain/entities"
import { formatShortDate, getInitials } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { deleteCommentAction } from "@/app/actions/blog-actions"

export interface RecentCommentsWidgetProps {
  comments: Comment[]
  postMap: Map<string, Post>
}

export function RecentCommentsWidget({ comments: initialComments, postMap }: RecentCommentsWidgetProps) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  const handleDelete = async (commentId: string, postTitle?: string) => {
    try {
      setDeletingId(commentId)
      const res = await deleteCommentAction(commentId)
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        toast.success("Comentario eliminado correctamente")
      } else {
        toast.error("Error al eliminar el comentario")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-xl border border-border py-0 shadow-none ring-0">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-base font-medium text-foreground">Últimos comentarios</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Opiniones recientes de tus lectores.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 cursor-pointer text-ia hover:bg-ia-tint hover:text-ia-hover"
          render={<Link href="/panel/comentarios" />}
        >
          Ver todos
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardHeader>

      <CardContent className="border-t border-border px-5 py-2">
        {comments.length === 0 ? (
          <div className="py-6">
            <EmptyState
              preset="comments"
              bordered={false}
              title="Sin comentarios recientes"
              description="Tus entradas aún no han recibido comentarios nuevos."
            />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {comments.slice(0, 4).map((comment) => {
              const post = postMap.get(comment.postId)
              return (
                <div key={comment.id} className="flex items-start gap-3 py-3">
                  <Avatar className="mt-0.5 size-8 shrink-0">
                    <AvatarImage src={comment.authorAvatarUrl || "/placeholder.svg"} alt={comment.authorName} />
                    <AvatarFallback className="text-xs">{getInitials(comment.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{comment.authorName}</p>
                      <time className="shrink-0 text-xs tabular-nums text-text-tertiary">
                        {formatShortDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      &ldquo;{comment.content}&rdquo;
                    </p>
                    {post && (
                      <p className="mt-1 truncate text-xs text-text-tertiary">
                        En{" "}
                        <Link
                          href={`/panel/posts/${post.id}`}
                          className="font-medium text-muted-foreground hover:text-foreground hover:underline"
                        >
                          {post.title}
                        </Link>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 cursor-pointer text-text-tertiary hover:bg-danger-tint hover:text-destructive"
                    onClick={() => handleDelete(comment.id, post?.title)}
                    disabled={deletingId === comment.id}
                    title="Eliminar comentario"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
