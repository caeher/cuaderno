"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShieldCheck,
  FileText,
  Cookie,
  Scale,
  Home,
  Mail,
  Sliders,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/domain/entities"

interface TenantLegalNavProps {
  tenant: User
  baseLegalUrl: string
}

export function TenantLegalNav({ tenant, baseLegalUrl }: TenantLegalNavProps) {
  const pathname = usePathname()
  const contactEmail = tenant.legalSettings?.contactEmail || tenant.email || "contacto@ejemplo.com"

  const documents = [
    {
      href: `${baseLegalUrl}`,
      title: "Centro Legal",
      description: "Información y políticas de este blog",
      icon: Home,
      exact: true,
    },
    {
      href: `${baseLegalUrl}/aviso-legal`,
      title: "Aviso Legal",
      description: "Titularidad y datos identificativos",
      icon: Scale,
    },
    {
      href: `${baseLegalUrl}/privacidad`,
      title: "Política de Privacidad",
      description: "Protección de datos y derechos",
      icon: ShieldCheck,
    },
    {
      href: `${baseLegalUrl}/terminos`,
      title: "Términos de Servicio",
      description: "Condiciones de uso y autoría",
      icon: FileText,
    },
    {
      href: `${baseLegalUrl}/cookies`,
      title: "Política de Cookies",
      description: "Gestión y tipos de cookies",
      icon: Cookie,
    },
  ]

  const openCookiePreferences = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-settings"))
    }
  }

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div>
          <h2 className="px-3 text-xs font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            Documentos Legales · {tenant.name}
          </h2>
          <nav className="mt-3 flex flex-col gap-1">
            {documents.map((item) => {
              const Icon = item.icon
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-ia-tint font-semibold text-ia"
                      : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0 transition-colors",
                      isActive
                        ? "text-ia"
                        : "text-text-tertiary group-hover:text-foreground"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="leading-tight">{item.title}</div>
                    <div className="mt-0.5 truncate text-xs font-normal text-text-tertiary">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Acceso rápido a preferencias de cookies */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sliders className="size-4 text-text-tertiary" />
            <span>Tus preferencias</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Puedes configurar tus preferencias de cookies para este blog.
          </p>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="mt-3 inline-flex items-center text-xs font-medium text-ia hover:text-ia-hover hover:underline cursor-pointer"
          >
            Configurar cookies &rarr;
          </button>
        </div>

        {/* Bloque de contacto legal */}
        <div className="rounded-xl border border-border bg-surface-sunken p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Mail className="size-4 text-text-tertiary" />
            <span>Contacto del Titular</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Para cuestiones de privacidad o derechos legales sobre este blog:
          </p>
          <div className="mt-2.5 space-y-1 text-xs">
            <a
              href={`mailto:${contactEmail}`}
              className="block truncate text-foreground hover:text-ia transition-colors"
            >
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
