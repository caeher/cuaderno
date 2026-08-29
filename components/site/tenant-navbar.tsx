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
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Tenant Brand / Identity */}
        <Link href={homeUrl} className="flex items-center gap-3 group">
          <Avatar className="size-8 border border-border transition-colors group-hover:border-ia">
            <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
            <AvatarFallback className="bg-surface-sunken text-xs font-semibold text-muted-foreground">{getInitials(tenant.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover:text-ia">
              {tenant.name}
            </span>
            {tenant.tagline && (
              <span className="-mt-1 hidden max-w-xs truncate text-[11px] text-text-tertiary sm:inline">
                {tenant.tagline}
              </span>
            )}
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href={homeUrl} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Artículos
          </Link>
          {tenant.bio && (
            <Link href={`${homeUrl}#autor`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Acerca de
            </Link>
          )}
          {tenant.socials?.website && (
            <a
              href={tenant.socials.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="size-3.5 text-text-tertiary" />
              <span>Web</span>
            </a>
          )}
        </nav>

        {/* Actions / Auth */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="hidden h-10 cursor-pointer px-3 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Iniciar sesión
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="h-10 cursor-pointer gap-1.5 rounded-lg px-5 text-sm font-semibold">
                <Sparkles className="size-3" />
                Crea tu blog
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 gap-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              render={<Link href="/panel" />}
            >
              Mi panel
            </Button>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}
