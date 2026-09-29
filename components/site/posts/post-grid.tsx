import * as React from "react"
import type { PublishedPost } from "@/lib/domain/entities"
import { PostCard } from "@/components/site/posts/post-card"
import { EmptyState, type EmptyPreset } from "@/components/common/empty-state"
import { cn } from "@/lib/utils"

export interface PostGridProps extends React.HTMLAttributes<HTMLDivElement> {
  posts: PublishedPost[]
  columns?: 2 | 3 | 4
  emptyStatePreset?: EmptyPreset
  emptyTitle?: string
  emptyDescription?: string
}

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
}

export function PostGrid({
  posts,
  columns = 3,
  emptyStatePreset = "posts",
  emptyTitle,
  emptyDescription,
  className,
  ...props
}: PostGridProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        preset={emptyStatePreset}
        title={emptyTitle}
        description={emptyDescription}
        className="mt-12"
      />
    )
  }

  return (
    <div
      className={cn("mt-10 grid gap-x-10 gap-y-12", columnClasses[columns], className)}
      {...props}
    >
      {posts.map((post) => {
        return <PostCard key={post.id} post={post} author={post.author} />
      })}
    </div>
  )
}
