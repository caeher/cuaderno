"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import type { User } from "@/lib/domain/entities"

interface TenantFooterProps {
  tenant: User
  homeUrl: string
}

export function TenantFooter({ tenant, homeUrl }: TenantFooterProps) {
  const legalBaseUrl = homeUrl === "/" ? "/legal" : `${homeUrl}/legal`

  const openCookiePreferences = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-settings"))
    }
  }

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Link href={homeUrl} className="font-serif font-medium text-foreground transition-colors hover:text-ia">
              {tenant.name}
            </Link>
            <span>·</span>
            <span>© {new Date().getFullYear()} Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-ia-border hover:bg-ia-tint hover:text-ia"
            >
              <BookOpen className="size-3.5" />
              <span>Publicado con Cuaderno</span>
            </Link>
          </div>
        </div>

        {/* Tenant Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-text-tertiary sm:justify-start">
          <Link href={legalBaseUrl} className="hover:text-foreground transition-colors">
            Centro Legal
          </Link>
          <span>·</span>
          <Link href={`${legalBaseUrl}/aviso-legal`} className="hover:text-foreground transition-colors">
            Aviso Legal
          </Link>
          <span>·</span>
          <Link href={`${legalBaseUrl}/privacidad`} className="hover:text-foreground transition-colors">
            Privacidad
          </Link>
          <span>·</span>
          <Link href={`${legalBaseUrl}/terminos`} className="hover:text-foreground transition-colors">
            Términos
          </Link>
          <span>·</span>
          <Link href={`${legalBaseUrl}/cookies`} className="hover:text-foreground transition-colors">
            Cookies
          </Link>
          <span>·</span>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="cursor-pointer transition-colors hover:text-foreground"
          >
            Preferencias de cookies
          </button>
        </div>
      </div>
    </footer>
  )
}
