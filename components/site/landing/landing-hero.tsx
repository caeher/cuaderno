import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, FileText, Sparkles } from "lucide-react"
import type { Post, User } from "@/lib/domain/entities"
import { getInitials } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface LandingHeroProps {
  featuredPost?: Post | null
  topAuthors?: User[]
  readerCountText?: string
}

export function LandingHero({
  featuredPost,
  topAuthors = [],
  readerCountText = "Más de 10 mil lectores cada mes",
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            Ahora en beta abierta
          </span>
          <h1 className="mt-6 font-serif text-4xl font-medium leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            Tu blog, escrito para ser leído — no configurado
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Cuaderno te da un perfil de autor, un editor sin distracciones y un panel para publicar, sin tocar una
            sola línea de código.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href="/registro" />}>
              Empieza a escribir gratis
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/explorar" />}>
              Explorar blogs
            </Button>
          </div>
          {topAuthors.length > 0 && (
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {topAuthors.map((author) => (
                  <Avatar key={author.id} className="size-8 border-2 border-background">
                    <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
                    <AvatarFallback className="text-[10px]">{getInitials(author.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{readerCountText}</p>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="relative rotate-1 rounded-xl border border-border bg-card p-5 shadow-[0_30px_60px_-30px_oklch(0.19_0.014_264/0.25)]">
            <div className="flex items-center gap-2 border-b border-border/70 pb-4">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-destructive/60" />
                <span className="size-2.5 rounded-full bg-chart-3/60" />
                <span className="size-2.5 rounded-full bg-chart-5/60" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">elena-marti.cuaderno.app</span>
            </div>
            {featuredPost && (
              <div className="pt-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={featuredPost.coverUrl || "/placeholder.svg"}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 font-serif text-lg font-medium leading-snug text-balance">
                  {featuredPost.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {featuredPost.excerpt}
                </p>
              </div>
            )}
          </div>
          <div className="absolute -bottom-6 -left-6 hidden -rotate-2 rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span className="font-mono text-xs">6 posts publicados</span>
            </div>
            <p className="mt-1 font-serif text-2xl font-medium">2.8k seguidores</p>
          </div>
        </div>
      </div>
    </section>
  )
}
