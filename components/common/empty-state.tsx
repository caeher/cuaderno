import * as React from "react"
import { Search, FileText, MessageSquare, Globe } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export type EmptyPreset = "search" | "posts" | "comments" | "author-posts" | "custom"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  preset?: EmptyPreset
  title?: string
  description?: string
  icon?: React.ElementType
  action?: React.ReactNode
  bordered?: boolean
}

const presets: Record<
  Exclude<EmptyPreset, "custom">,
  { title: string; description: string; icon: React.ElementType }
> = {
  search: {
    title: "No encontramos resultados",
    description: "Prueba con otra búsqueda o explora todas las categorías.",
    icon: Search,
  },
  posts: {
    title: "Aún no tienes posts",
    description: "Escribe tu primer post para empezar a construir tu blog.",
    icon: FileText,
  },
  comments: {
    title: "Sin comentarios todavía",
    description: "Cuando alguien comente en tus posts, aparecerá aquí.",
    icon: MessageSquare,
  },
  "author-posts": {
    title: "Todavía no hay posts publicados",
    description: "Este autor no ha publicado nada por aquí, vuelve más tarde.",
    icon: Globe,
  },
}

const mediaTones: Record<EmptyPreset, string> = {
  search: "bg-neutral-tint text-neutral",
  posts: "bg-ia-tint text-ia",
  comments: "bg-ia-tint text-ia",
  "author-posts": "bg-neutral-tint text-neutral",
  custom: "bg-ia-tint text-ia",
}

export function EmptyState({
  preset = "search",
  title,
  description,
  icon,
  action,
  bordered = true,
  className,
  ...props
}: EmptyStateProps) {
  const presetConfig = preset !== "custom" ? presets[preset] : null
  const finalTitle = title ?? presetConfig?.title ?? "Sin elementos"
  const finalDescription = description ?? presetConfig?.description
  const IconComp = icon ?? presetConfig?.icon ?? FileText

  return (
    <Empty
      className={cn(
        "gap-0 px-6 py-12",
        bordered && "border border-dashed border-border bg-card",
        className
      )}
      {...props}
    >
      <EmptyHeader className="gap-0">
        <EmptyMedia
          className={cn(
            "mb-5 size-12 rounded-lg [&_svg]:size-6 [&_svg]:stroke-[1.5]",
            mediaTones[preset]
          )}
        >
          <IconComp />
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold tracking-[-0.01em] text-foreground">
          {finalTitle}
        </EmptyTitle>
        {finalDescription && (
          <EmptyDescription className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
            {finalDescription}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {action && <div className="mt-6">{action}</div>}
    </Empty>
  )
}
