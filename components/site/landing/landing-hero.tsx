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
    <section className="relative overflow-x-clip bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-muted px-4 text-[13px] font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-text-tertiary" strokeWidth={1.5} />
            Ahora en beta abierta
          </span>
          <h1 className="mt-6 text-[2rem] font-bold leading-[1.05] tracking-[-0.02em] text-balance text-foreground sm:text-5xl sm:tracking-[-0.03em] lg:text-6xl">
            Tu blog, escrito para ser leído{" "}
            <span className="text-muted-foreground">— no configurado</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted-foreground">
            Cuaderno te da un perfil de autor, un editor sin distracciones y un panel para publicar,{" "}
            <span className="font-semibold text-foreground">sin tocar una sola línea de código</span>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              size="lg"
              className="h-12 w-full px-6 text-base font-semibold sm:w-auto"
              render={<Link href="/registro" />}
            >
              Empieza a escribir gratis
              <ArrowRight data-icon="inline-end" strokeWidth={1.5} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full border-border bg-card px-6 text-base font-medium text-foreground hover:bg-muted sm:w-auto"
              render={<Link href="/explorar" />}
            >
              Explorar blogs
            </Button>
          </div>
          {topAuthors.length > 0 && (
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {topAuthors.map((author) => (
                  <Avatar key={author.id} className="size-8 border-2 border-background">
                    <AvatarImage src={author.avatarUrl || "/placeholder.svg"} alt={author.name} />
                    <AvatarFallback className="bg-surface-sunken text-[10px] text-muted-foreground">
                      {getInitials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{readerCountText}</p>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <span className="text-[13px] text-text-tertiary">elena-marti.cuaderno.app</span>
            </div>
            {featuredPost && (
              <div className="p-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface-sunken">
                  <Image
                    src={featuredPost.coverUrl || "/placeholder.svg"}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug text-balance text-foreground">
                  {featuredPost.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {featuredPost.excerpt}
                </p>
              </div>
            )}
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[13px] font-medium text-muted-foreground">6 posts publicados</span>
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">2.8k seguidores</p>
          </div>
        </div>
      </div>
    </section>
  )
}
