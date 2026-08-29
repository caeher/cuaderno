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
      <h2 className="font-serif text-xl font-medium tracking-tight flex items-center gap-2">
        <span>Comentarios</span>
        <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
      </h2>

      {/* Add Comment Form */}
      {postId && (
        <form onSubmit={handleSubmit} className="mt-5 rounded-lg border border-border/80 bg-card p-4 shadow-xs">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <MessageSquarePlus className="size-3.5 text-primary" />
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
              placeholder="Escribe tu opinión o reflexión..."
              rows={3}
              required
              className="text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" type="submit" disabled={isSubmitting} className="cursor-pointer gap-1.5">
                <Send className="size-3.5" />
                {isSubmitting ? "Publicando..." : "Comentar"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {comments.length > 0 ? (
        <div className="mt-6 flex flex-col gap-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground italic">Sé el primero en dejar un comentario.</p>
      )}
    </section>
  )
}
