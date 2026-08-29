"use client"

import * as React from "react"
import Link from "next/link"
import { MessageSquare, ArrowRight, Trash2 } from "lucide-react"
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
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <span>Últimos comentarios</span>
          </CardTitle>
          <CardDescription>Opiniones recientes de tus lectores.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" render={<Link href="/panel/comentarios" />}>
          Gestionar ({comments.length})
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <EmptyState
            preset="comments"
            bordered={false}
            title="Sin comentarios recientes"
            description="Tus artículos aún no han recibido comentarios nuevos."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {comments.slice(0, 4).map((comment) => {
              const post = postMap.get(comment.postId)
              return (
                <div key={comment.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar className="size-8 shrink-0 mt-0.5">
                    <AvatarImage src={comment.authorAvatarUrl || "/placeholder.svg"} alt={comment.authorName} />
                    <AvatarFallback className="text-[10px]">{getInitials(comment.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">{comment.authorName}</p>
                      <time className="text-[11px] text-muted-foreground shrink-0">{formatShortDate(comment.createdAt)}</time>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">&ldquo;{comment.content}&rdquo;</p>
                    {post && (
                      <p className="mt-1 text-[11px] text-muted-foreground truncate">
                        En{" "}
                        <Link href={`/panel/posts/${post.id}`} className="text-foreground hover:underline font-medium">
                          {post.title}
                        </Link>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-muted-foreground hover:text-destructive cursor-pointer opacity-70 hover:opacity-100"
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
