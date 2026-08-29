"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, Show, UserButton, OrganizationSwitcher } from "@clerk/nextjs"

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <BookOpen className="size-[22px]" />
          <span className="text-xl font-semibold tracking-[-0.02em]">cuaderno</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/explorar"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Explorar
          </Link>
          <Link
            href="/#autores"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Autores
          </Link>
          <Link
            href="/#como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cómo funciona
          </Link>
        </nav>

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
              <Button size="sm" className="h-10 cursor-pointer rounded-lg px-5 text-sm font-semibold">
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
