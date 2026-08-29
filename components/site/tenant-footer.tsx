"use client"

import Link from "next/link"
import { PenLine } from "lucide-react"
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
    <footer className="border-t border-border/70 bg-card/30 mt-20">
      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link href={homeUrl} className="font-serif font-medium text-foreground hover:text-primary transition-colors">
              {tenant.name}
            </Link>
            <span>·</span>
            <span>© {new Date().getFullYear()} Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-2xs"
            >
              <span className="flex size-4 items-center justify-center rounded-xs bg-primary text-primary-foreground">
                <PenLine className="size-2.5" />
              </span>
              <span>Publicado con Cuaderno</span>
            </Link>
          </div>
        </div>

        {/* Tenant Legal Links */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 border-t border-border/50 pt-4 text-[11px] text-muted-foreground">
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
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Preferencias de cookies
          </button>
        </div>
      </div>
    </footer>
  )
}
