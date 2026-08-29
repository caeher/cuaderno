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
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl border border-border/80 bg-card/80 shadow-xs backdrop-blur-xs">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent" />
          <FileQuestion className="relative size-10 text-primary/80 stroke-[1.5]" />
          <span className="absolute -bottom-2 -right-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-[11px] font-mono font-medium text-muted-foreground shadow-xs">
            404
          </span>
        </div>

        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          {badge}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Volver atrás</span>
            </Button>
          )}

          <Button
            variant="default"
            size="default"
            className="gap-2 cursor-pointer"
            render={<Link href={homeUrl} />}
          >
            <Home className="size-4" />
            <span>{homeLabel}</span>
          </Button>

          {customActions}
        </div>

        {/* Suggested Helpful Navigation */}
        {showSuggestions && (
          <div className="mt-12 w-full border-t border-border/70 pt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rutas útiles que podrían interesarte
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-left">
              <Link
                href="/explorar"
                className="group flex flex-col rounded-xl border border-border/60 bg-card/50 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs"
              >
                <div className="flex items-center gap-2 text-foreground font-medium text-sm group-hover:text-primary">
                  <Compass className="size-4 text-primary" />
                  <span>Explorar posts</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">
                  Descubre artículos y notas por temática.
                </p>
              </Link>

              <Link
                href="/#autores"
                className="group flex flex-col rounded-xl border border-border/60 bg-card/50 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs"
              >
                <div className="flex items-center gap-2 text-foreground font-medium text-sm group-hover:text-primary">
                  <Users className="size-4 text-primary" />
                  <span>Autores</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">
                  Conoce a los creadores de Cuaderno.
                </p>
              </Link>

              <Link
                href="/registro"
                className="group flex flex-col rounded-xl border border-border/60 bg-card/50 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs"
              >
                <div className="flex items-center gap-2 text-foreground font-medium text-sm group-hover:text-primary">
                  <PenLine className="size-4 text-primary" />
                  <span>Crear blog</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">
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
