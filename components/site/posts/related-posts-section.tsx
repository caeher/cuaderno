import * as React from "react"
import type { PublishedPost } from "@/lib/domain/entities"
import { PostCard } from "@/components/site/posts/post-card"
import { cn } from "@/lib/utils"

export interface RelatedPostsSectionProps {
  posts: PublishedPost[]
  title?: string
  className?: string
}

export function RelatedPostsSection({
  posts,
  title = "Quizás también te interese",
  className,
}: RelatedPostsSectionProps) {
  if (!posts || posts.length === 0) return null

  return (
    <div className={cn("mt-14 border-t border-border/70 pt-10", className)}>
      <h2 className="font-serif text-xl font-medium">{title}</h2>
      <div className="mt-6 flex flex-col divide-y divide-border/70">
        {posts.map((relatedPost) => {
          return (
            <PostCard
              key={relatedPost.id}
              post={relatedPost}
              author={relatedPost.author}
              variant="compact"
            />
          )
        })}
      </div>
    </div>
  )
}
