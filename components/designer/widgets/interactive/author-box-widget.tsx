"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"

export function AuthorBoxBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  const { post, global, home, isStudioCanvas } = useTemplateContext()

  const currentAuthor = post?.author || global?.tenant || home?.tenant

  const name =
    currentAuthor?.name ||
    node.props?.name ||
    (isStudioCanvas ? "Elena Martí" : "Autor")
  const avatarUrl =
    currentAuthor?.avatarUrl ||
    node.props?.avatarUrl ||
    "/placeholder.svg"
  const bio =
    currentAuthor?.bio ||
    currentAuthor?.tagline ||
    node.props?.bio ||
    (isStudioCanvas ? "Escribe sobre arquitectura de información, diseño y tecnología." : "")
  const role =
    node.props?.role ||
    currentAuthor?.tagline ||
    (currentAuthor?.role === "owner" ? "Autor Principal" : "")

  return (
    <div
      style={style}
      className={cn(
        "author-box-widget flex flex-col sm:flex-row items-start sm:items-center gap-5 my-6",
        node.style?.customClass
      )}
    >
      <div className="size-16 flex-none rounded-full overflow-hidden border-2 border-border bg-muted">
        <Avatar className="size-full">
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-serif text-lg font-bold text-foreground">{name}</h4>
        {role ? <p className="text-xs text-primary font-medium mt-0.5">{role}</p> : null}
        {bio ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bio}</p> : null}
      </div>
    </div>
  )
}

