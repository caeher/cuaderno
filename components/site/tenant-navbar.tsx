"use client"

import Link from "next/link"
import { BookOpen, Globe, PenLine, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/format"
import type { User } from "@/lib/domain/entities"

interface TenantNavbarProps {
  tenant: User
  homeUrl: string
}

export function TenantNavbar({ tenant, homeUrl }: TenantNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Tenant Brand / Identity */}
        <Link href={homeUrl} className="flex items-center gap-3 group">
          <Avatar className="size-8 border border-border shadow-2xs group-hover:border-primary transition-colors">
            <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
            <AvatarFallback className="text-xs font-semibold">{getInitials(tenant.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {tenant.name}
            </span>
            {tenant.tagline && (
              <span className="hidden sm:inline text-[11px] text-muted-foreground -mt-1 truncate max-w-xs">
                {tenant.tagline}
              </span>
            )}
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href={homeUrl} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
            Artículos
          </Link>
          {tenant.bio && (
            <Link href={`${homeUrl}#autor`} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Acerca de
            </Link>
          )}
          {tenant.socials?.website && (
            <a
              href={tenant.socials.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="size-3.5" />
              <span>Web</span>
            </a>
          )}
        </nav>

        {/* Actions / Auth */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex cursor-pointer text-xs">
                Iniciar sesión
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="cursor-pointer gap-1.5 text-xs">
                <Sparkles className="size-3" />
                Crea tu blog
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button variant="ghost" size="sm" className="gap-2 text-xs" render={<Link href="/panel" />}>
              Mi panel
            </Button>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}
