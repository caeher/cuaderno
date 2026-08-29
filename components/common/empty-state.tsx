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
      className={cn(bordered && "border border-dashed border-border", className)}
      {...props}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconComp />
        </EmptyMedia>
        <EmptyTitle>{finalTitle}</EmptyTitle>
        {finalDescription && <EmptyDescription>{finalDescription}</EmptyDescription>}
      </EmptyHeader>
      {action && <div className="mt-4">{action}</div>}
    </Empty>
  )
}
