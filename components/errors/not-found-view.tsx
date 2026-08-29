"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileQuestion,
  ArrowLeft,
  Home,
  Compass,
  Users,
  PenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NotFoundViewProps {
  title?: string
  description?: string
  badge?: string
  homeUrl?: string
  homeLabel?: string
  showBack?: boolean
  showSuggestions?: boolean
  className?: string
  customActions?: React.ReactNode
}

export function NotFoundView({
  title = "Página no encontrada",
  description = "No hemos podido encontrar la página que estás buscando. Es posible que la dirección sea incorrecta, el post haya sido eliminado o el autor haya cambiado de enlace.",
  badge = "Error 404",
  homeUrl = "/",
  homeLabel = "Volver al inicio",
  showBack = true,
  showSuggestions = true,
  className,
  customActions,
}: NotFoundViewProps) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(homeUrl)
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16 text-center sm:px-6",
        className
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center">
        {/* Subtle Decorative Icon Container */}
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-xl border border-border bg-neutral-tint">
          <FileQuestion className="size-10 stroke-[1.5] text-neutral" />
          <span className="absolute -bottom-2 -right-2 flex size-6 items-center justify-center rounded-full border border-border bg-card font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
            404
          </span>
        </div>

        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-sunken px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-warn" />
          {badge}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {showBack && (
            <Button
              variant="outline"
              size="default"
              onClick={handleBack}
              className="h-10 cursor-pointer gap-2 rounded-lg border-border px-5 font-medium"
            >
              <ArrowLeft className="size-4" />
              <span>Volver atrás</span>
            </Button>
          )}

          <Button
            variant="default"
            size="default"
            className="h-10 cursor-pointer gap-2 rounded-lg px-5 font-semibold"
            render={<Link href={homeUrl} />}
          >
            <Home className="size-4" />
            <span>{homeLabel}</span>
          </Button>

          {customActions}
        </div>

        {/* Suggested Helpful Navigation */}
        {showSuggestions && (
          <div className="mt-12 w-full border-t border-border pt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Rutas útiles que podrían interesarte
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-left">
              <Link
                href="/explorar"
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-ia-border hover:bg-ia-tint"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-ia">
                  <Compass className="size-4 text-ia" />
                  <span>Explorar posts</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  Descubre artículos y notas por temática.
                </p>
              </Link>

              <Link
                href="/#autores"
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-ia-border hover:bg-ia-tint"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-ia">
                  <Users className="size-4 text-ia" />
                  <span>Autores</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  Conoce a los creadores de Cuaderno.
                </p>
              </Link>

              <Link
                href="/registro"
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-ia-border hover:bg-ia-tint"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-ia">
                  <PenLine className="size-4 text-ia" />
                  <span>Crear blog</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  Empieza a publicar con tu propia identidad.
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
