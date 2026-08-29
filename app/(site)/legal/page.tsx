import type { Metadata } from "next"
import Link from "next/link"
import {
  ShieldCheck,
  FileText,
  Cookie,
  Scale,
  Copyright,
  ArrowRight,
  Lock,
  Sparkles,
  Download,
  Mail,
  UserCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Centro Legal y Privacidad | Cuaderno",
  description:
    "Consulta nuestros términos de servicio, política de privacidad RGPD, política de cookies y compromisos legales de la plataforma Cuaderno.",
}

const legalCards = [
  {
    title: "Aviso Legal",
    href: "/legal/aviso-legal",
    icon: Scale,
    badge: "LSSI-CE",
    description:
      "Información sobre la titularidad del sitio web, objeto del servicio, condiciones de acceso y legislación aplicable.",
  },
  {
    title: "Política de Privacidad",
    href: "/legal/privacidad",
    icon: ShieldCheck,
    badge: "RGPD / GDPR",
    description:
      "Detalle de cómo tratamos tus datos personales, bases jurídicas, transferencias seguras y cómo ejercer tus derechos ARCO+.",
  },
  {
    title: "Términos de Servicio",
    href: "/legal/terminos",
    icon: FileText,
    badge: "Contrato de Uso",
    description:
      "Condiciones que rigen el uso de la plataforma, normas de conducta, moderación de contenidos y garantías de servicio.",
  },
  {
    title: "Política de Cookies",
    href: "/legal/cookies",
    icon: Cookie,
    badge: "Gestión de Rastreo",
    description:
      "Explicación transparente de las cookies técnicas utilizadas, almacenamiento local y guía para gestionar tus preferencias.",
  },
  {
    title: "Propiedad Intelectual",
    href: "/legal/propiedad-intelectual",
    icon: Copyright,
    badge: "Derechos de Autor",
    description:
      "Garantía de titularidad exclusiva de los autores sobre sus posts y procedimiento formal de notificación de infracción (DMCA).",
  },
]

const commitments = [
  {
    icon: Sparkles,
    title: "100% de los derechos son tuyos",
    description:
      "Nunca reclamamos la propiedad sobre los artículos, imágenes o textos que publiques en Cuaderno. Tu obra te pertenece.",
  },
  {
    icon: Lock,
    title: "Sin venta de datos personales",
    description:
      "No comercializamos tus datos ni tu historial de lectura con terceros, anunciantes ni corredores de datos.",
  },
  {
    icon: Download,
    title: "Portabilidad garantizada",
    description:
      "Tus datos y publicaciones no están encerrados. Puedes solicitar una exportación o eliminar tu cuenta cuando lo decidas.",
  },
  {
    icon: UserCheck,
    title: "Cumplimiento estricto del RGPD",
    description:
      "Tratamos los datos conforme al Reglamento General de Protección de Datos y aplicamos cifrado en tránsito y reposo.",
  },
]

export default function LegalHubPage() {
  return (
    <div className="flex-1 pb-16">
      <header className="border-b border-border/70 pb-8">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            Centro de Cumplimiento
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            Revisión 2026
          </span>
        </div>

        <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-balance">
          Centro Legal y de Transparencia
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
          En Cuaderno creemos en una web abierta, respetuosa con la autoría y transparente con los datos. Aquí encontrarás todos los documentos normativos, políticas de privacidad y términos que garantizan tu seguridad y tus derechos como creador y lector.
        </p>
      </header>

      {/* Grid de Documentos Legales */}
      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Documentos y Políticas Oficiales
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {legalCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="size-4.5" />
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {card.badge}
                    </Badge>
                  </div>

                  <h3 className="mt-4 font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span>Leer documento completo</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Compromisos de la plataforma */}
      <section className="mt-14 rounded-2xl border border-border/70 bg-muted/20 p-6 sm:p-8">
        <div className="max-w-xl">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
            Nuestros principios de confianza
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Construimos Cuaderno bajo la premisa de que escribir en internet no debería requerir ceder tu privacidad ni renunciar al control sobre tu trabajo.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {commitments.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background border border-border/70 text-primary shadow-xs">
                  <Icon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Bloque de contacto para soporte legal */}
      <section className="mt-12 rounded-xl border border-border/70 bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                ¿Necesitas asistencia legal o ejercer tus derechos?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Nuestro equipo responde a solicitudes de privacidad y consultas normativas en menos de 48 horas laborales.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <a
              href="mailto:privacidad@cuaderno.app"
              className="inline-flex items-center justify-center rounded-md bg-secondary px-3.5 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              privacidad@cuaderno.app
            </a>
            <a
              href="mailto:legal@cuaderno.app"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              legal@cuaderno.app
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
