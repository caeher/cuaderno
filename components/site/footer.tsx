"use client"

import Link from "next/link"
import { PenLine, Sliders } from "lucide-react"

const productLinks = [
  { href: "/explorar", label: "Explorar blogs" },
  { href: "/registro", label: "Crear tu blog" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#autores", label: "Comunidad de autores" },
]

const legalLinks = [
  { href: "/legal", label: "Centro Legal" },
  { href: "/legal/aviso-legal", label: "Aviso Legal" },
  { href: "/legal/privacidad", label: "Privacidad (RGPD)" },
  { href: "/legal/terminos", label: "Términos de servicio" },
  { href: "/legal/cookies", label: "Política de Cookies" },
  { href: "/legal/propiedad-intelectual", label: "Propiedad Intelectual" },
]

export function SiteFooter() {
  const openCookiePreferences = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-settings"))
    }
  }

  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <PenLine className="size-4" />
              </span>
              <span className="font-serif text-xl font-medium tracking-tight">Cuaderno</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              La plataforma para escribir y publicar tu propio blog. Sin plantillas genéricas, sin fricción — solo
              tú, tus ideas y un panel simple para gestionarlas.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Cumplimiento RGPD & LSSI-CE
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Producto</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Legal & Privacidad</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                >
                  <Sliders className="size-3" />
                  <span>Configuración de cookies</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cuaderno. Todos los derechos reservados.</p>
          <p>Hecho para quienes prefieren escribir antes que configurar.</p>
        </div>
      </div>
    </footer>
  )
}
