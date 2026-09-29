import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { PublishedPost } from "@/lib/domain/entities"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/site/section-heading"
import { PostCard } from "@/components/site/posts/post-card"
import { Button } from "@/components/ui/button"

export interface FeaturedPostsSectionProps {
  posts: PublishedPost[]
  title?: string
  eyebrow?: string
  viewAllHref?: string
}

export function FeaturedPostsSection({
  posts,
  title = "Historias que están circulando",
  eyebrow = "Lo más leído",
  viewAllHref = "/explorar",
}: FeaturedPostsSectionProps) {
  return (
    <SectionContainer background="card">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow={eyebrow} title={title} />
        {viewAllHref && (
          <Button variant="ghost" render={<Link href={viewAllHref} />}>
            Ver todo
            <ArrowRight data-icon="inline-end" />
          </Button>
        )}
      </div>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          return <PostCard key={post.id} post={post} author={post.author} />
        })}
      </div>
    </SectionContainer>
  )
}
