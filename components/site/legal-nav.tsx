"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShieldCheck,
  FileText,
  Cookie,
  Scale,
  Copyright,
  Home,
  Mail,
  Sliders,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const LEGAL_DOCUMENTS = [
  {
    href: "/legal",
    title: "Centro Legal",
    description: "Índice general y principios de cumplimiento",
    icon: Home,
  },
  {
    href: "/legal/aviso-legal",
    title: "Aviso Legal",
    description: "Información corporativa y titularidad del servicio",
    icon: Scale,
  },
  {
    href: "/legal/privacidad",
    title: "Política de Privacidad",
    description: "Tratamiento de datos personales y derechos RGPD",
    icon: ShieldCheck,
  },
  {
    href: "/legal/terminos",
    title: "Términos de Servicio",
    description: "Condiciones de uso y propiedad de contenidos",
    icon: FileText,
  },
  {
    href: "/legal/cookies",
    title: "Política de Cookies",
    description: "Uso de cookies y tabla técnica de rastreadores",
    icon: Cookie,
  },
  {
    href: "/legal/propiedad-intelectual",
    title: "Propiedad Intelectual",
    description: "Derechos de autor y notificaciones DMCA",
    icon: Copyright,
  },
]

export function LegalNav() {
  const pathname = usePathname()

  const openCookiePreferences = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-settings"))
    }
  }

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div>
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documentación Legal
          </h2>
          <nav className="mt-3 flex flex-col gap-1">
            {LEGAL_DOCUMENTS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-secondary font-medium text-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0 transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="leading-tight">{item.title}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground/80">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Acceso rápido a preferencias de cookies */}
        <div className="rounded-lg border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Sliders className="size-3.5 text-primary" />
            <span>Tus preferencias</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Puedes modificar o revocar tu consentimiento de cookies en cualquier momento.
          </p>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="mt-3 inline-flex items-center text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            Configurar cookies &rarr;
          </button>
        </div>

        {/* Bloque de contacto legal */}
        <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Mail className="size-3.5" />
            <span>Contacto Legal</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Para dudas sobre privacidad, derechos ARCO o propiedad intelectual:
          </p>
          <div className="mt-2.5 space-y-1 text-xs">
            <a
              href="mailto:privacidad@cuaderno.app"
              className="block font-mono text-xs text-foreground/90 hover:text-primary transition-colors"
            >
              privacidad@cuaderno.app
            </a>
            <a
              href="mailto:legal@cuaderno.app"
              className="block font-mono text-xs text-foreground/90 hover:text-primary transition-colors"
            >
              legal@cuaderno.app
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
