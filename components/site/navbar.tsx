"use client"

import Link from "next/link"
import { PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, Show, UserButton, OrganizationSwitcher } from "@clerk/nextjs"

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <PenLine className="size-4" />
          </span>
          <span className="font-serif text-xl font-medium tracking-tight">Cuaderno</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/explorar" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
            Explorar
          </Link>
          <Link href="/#autores" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
            Autores
          </Link>
          <Link href="/#como-funciona" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
            Cómo funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex cursor-pointer">
                Iniciar sesión
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="cursor-pointer">
                Empezar a escribir
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="hidden sm:block">
              <OrganizationSwitcher
                hidePersonal={false}
                afterCreateOrganizationUrl="/panel"
                afterSelectOrganizationUrl="/panel"
                afterLeaveOrganizationUrl="/panel"
              />
            </div>
            <Button variant="ghost" size="sm" className="gap-2" render={<Link href="/panel" />}>
              Mi panel
            </Button>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}
