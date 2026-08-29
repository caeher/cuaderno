import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { ShieldCheck, Scale, FileText, Cookie, Mail, Building2, MapPin } from "lucide-react"
import { getTenantBySlug } from "@/lib/application/blog-use-cases"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TenantLegalPageProps {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: TenantLegalPageProps): Promise<Metadata> {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)
  if (!user) return { title: "Centro Legal" }

  return {
    title: `Centro Legal y Privacidad · ${user.name}`,
    description: `Políticas de privacidad, términos de servicio y aviso legal de ${user.name}.`,
  }
}

export default async function TenantLegalPage({ params }: TenantLegalPageProps) {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)

  if (!user) notFound()

  const reqHeaders = await headers()
  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true"
  const baseLegalUrl = isSubdomain ? "/legal" : `/${tenant}/legal`

  const legal = user.legalSettings || {}
  const companyName = legal.companyName || user.name
  const contactEmail = legal.contactEmail || user.email
  const taxId = legal.taxId || "No especificado"
  const address = legal.address || user.location || "No especificada"

  const cards = [
    {
      title: "Aviso Legal",
      href: `${baseLegalUrl}/aviso-legal`,
      icon: Scale,
      badge: "LSSI-CE",
      description: "Datos identificativos del titular del blog, condiciones de acceso y derechos de propiedad.",
    },
    {
      title: "Política de Privacidad",
      href: `${baseLegalUrl}/privacidad`,
      icon: ShieldCheck,
      badge: "RGPD & LOPD-GDD",
      description: "Información detallada sobre el tratamiento de tus datos personales, finalidades y ejercicio de derechos.",
    },
    {
      title: "Términos de Servicio",
      href: `${baseLegalUrl}/terminos`,
      icon: FileText,
      badge: "Condiciones",
      description: "Normas de uso del blog, autoría de contenidos publicados y responsabilidades de los usuarios.",
    },
    {
      title: "Política de Cookies",
      href: `${baseLegalUrl}/cookies`,
      icon: Cookie,
      badge: "ePrivacy",
      description: "Tipos de cookies utilizadas, finalidades técnicas y cómo configurar o revocar el consentimiento.",
    },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Centro de Transparencia
          </Badge>
          <span className="text-xs text-muted-foreground">Actualizado: {user.joinedAt || "Reciente"}</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-foreground">
          Centro Legal y Privacidad
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Bienvenido al centro de transparencia legal de <strong className="text-foreground">{user.name}</strong>. Aquí
          encontrarás toda la información sobre la titularidad del blog, el tratamiento de tus datos personales y las
          condiciones de uso de los contenidos.
        </p>
      </div>

      {/* Identidad del Titular */}
      <Card className="border-border/80 bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Titular y Responsable del Blog
          </CardTitle>
          <CardDescription className="text-xs">
            Datos identificativos en cumplimiento de la normativa legal aplicable.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-xs">
          <div>
            <span className="text-muted-foreground block">Titular / Razón Social:</span>
            <span className="font-medium text-foreground">{companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Identificación Fiscal / NIF:</span>
            <span className="font-medium text-foreground">{taxId}</span>
          </div>
          <div>
            <span className="text-muted-foreground block flex items-center gap-1">
              <Mail className="size-3" /> Contacto Legal:
            </span>
            <a href={`mailto:${contactEmail}`} className="font-mono text-primary hover:underline">
              {contactEmail}
            </a>
          </div>
          <div>
            <span className="text-muted-foreground block flex items-center gap-1">
              <MapPin className="size-3" /> Domicilio / Ubicación:
            </span>
            <span className="font-medium text-foreground">{address}</span>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Documentos */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-4" />
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {card.badge}
                  </Badge>
                </div>
                <h3 className="mt-4 font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
              </div>
              <div className="mt-4 text-xs font-medium text-primary flex items-center gap-1">
                <span>Leer documento</span>
                <span>&rarr;</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
