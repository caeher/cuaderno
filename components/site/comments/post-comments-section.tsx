"use client"

import * as React from "react"
import { Send, MessageSquarePlus } from "lucide-react"
import { toast } from "sonner"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Comment } from "@/lib/domain/entities"
import { convexDocToComment } from "@/lib/infrastructure/convex/mappers"
import { CommentItem } from "@/components/site/comments/comment-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { addCommentAction } from "@/app/actions/blog-actions"

export interface PostCommentsSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  comments: Comment[]
  postId?: string
  postSlug?: string
}

export function PostCommentsSection({
  comments: initialComments,
  postId,
  postSlug,
  className,
  ...props
}: PostCommentsSectionProps) {
  // Suscripción reactiva en tiempo real vía WebSocket a Convex
  const liveCommentDocs = useQuery(
    api.comments.getByPostId,
    postId ? { postId } : "skip"
  )

  const [optimisticComments, setOptimisticComments] = React.useState<Comment[]>([])

  const comments = React.useMemo<Comment[]>(() => {
    if (liveCommentDocs && Array.isArray(liveCommentDocs) && liveCommentDocs.length > 0) {
      return liveCommentDocs.map(convexDocToComment)
    }
    if (optimisticComments.length > 0) {
      return [...optimisticComments, ...initialComments]
    }
    return initialComments
  }, [liveCommentDocs, initialComments, optimisticComments])

  const [authorName, setAuthorName] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId || !authorName.trim() || !content.trim()) {
      toast.error("Por favor completa tu nombre y comentario")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await addCommentAction({
        postId,
        authorName: authorName.trim(),
        content: content.trim(),
        postSlug,
      })

      if (res.success && res.comment) {
        setOptimisticComments((prev) => [res.comment!, ...prev])
        setContent("")
        toast.success("¡Comentario publicado con éxito!")
      } else {
        toast.error("No se pudo publicar el comentario")
      }
    } catch {
      toast.error("Ocurrió un error inesperado al comentar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={cn("mt-10", className)} {...props}>
      <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
        <span>Comentarios</span>
        <span className="text-sm font-normal tabular-nums text-text-tertiary">
          ({comments.length})
        </span>
      </h2>

      {/* Add Comment Form */}
      {postId && (
        <form onSubmit={handleSubmit} className="mt-5 rounded-xl border border-border bg-card p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquarePlus className="size-4 text-text-tertiary" />
            Deja una respuesta
          </h4>
          <div className="flex flex-col gap-3">
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tu nombre o alias"
              required
              className="text-sm"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu opinión o reflexión…"
              rows={3}
              required
              className="text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" type="submit" disabled={isSubmitting} className="cursor-pointer gap-1.5">
                <Send className="size-3.5" />
                {isSubmitting ? "Publicando…" : "Comentar"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {comments.length > 0 ? (
        <div className="mt-6 flex flex-col divide-y divide-border">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} className="py-5 first:pt-0 last:pb-0" />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Sé el primero en dejar un comentario.
        </p>
      )}
    </section>
  )
}
