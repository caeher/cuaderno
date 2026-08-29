import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTenantBySlug } from "@/lib/application/blog-use-cases"
import { LegalPage, type LegalSection } from "@/components/site/legal-page"

interface PrivacidadPageProps {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: PrivacidadPageProps): Promise<Metadata> {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)
  if (!user) return { title: "Política de Privacidad" }
  return {
    title: `Política de Privacidad · ${user.name}`,
    description: `Tratamiento de datos personales y derechos RGPD en el blog de ${user.name}.`,
  }
}

export default async function TenantPrivacidadPage({ params }: PrivacidadPageProps) {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)

  if (!user) notFound()

  const legal = user.legalSettings || {}
  const companyName = legal.companyName || user.name
  const contactEmail = legal.contactEmail || user.email
  const dpoContact = legal.dpoContact || contactEmail

  if (legal.customPrivacyPolicy) {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="font-serif text-3xl font-medium">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {user.joinedAt || "Reciente"}</p>
        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-sm text-foreground/90">
          {legal.customPrivacyPolicy}
        </div>
      </div>
    )
  }

  const sections: LegalSection[] = [
    {
      heading: "1. Responsable del Tratamiento",
      body: [
        `En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPD-GDD), se informa al usuario de que los datos personales recabados a través de este blog serán tratados por:`,
      ],
      table: {
        headers: ["Concepto", "Detalle"],
        rows: [
          ["Responsable", companyName],
          ["Email de Contacto", contactEmail],
          ["Contacto Delegado / Privacidad", dpoContact],
        ],
      },
    },
    {
      heading: "2. Finalidad del Tratamiento de Datos",
      body: [
        `Los datos personales facilitados por los usuarios (por ejemplo, al dejar un comentario, suscribirse a una newsletter o contactar al autor) serán tratados con las siguientes finalidades:`,
      ],
      list: [
        "Gestionar la publicación y moderación de comentarios en los artículos.",
        "Responder a consultas, solicitudes o sugerencias remitidas por los lectores.",
        "Envío de notificaciones sobre nuevas publicaciones (si el usuario se ha suscrito explícitamente).",
        "Garantizar la seguridad técnica y prevenir el spam o abuso en el blog.",
      ],
    },
    {
      heading: "3. Legitimación para el Tratamiento",
      body: [
        `La base legal para el tratamiento de los datos es el **consentimiento expreso del usuario** al enviar comentarios o formularios de contacto, así como el **interés legítimo** en mantener la seguridad y calidad del servicio.`,
      ],
    },
    {
      heading: "4. Plazo de Conservación de los Datos",
      body: [
        `Los datos personales se conservarán mientras se mantenga la relación y el usuario no solicite su supresión, o durante los plazos legales aplicables para el cumplimiento de obligaciones jurídicas.`,
      ],
    },
    {
      heading: "5. Derechos del Usuario (ARCO+)",
      body: [
        `El usuario puede ejercer en cualquier momento sus derechos de **acceso, rectificación, supresión, limitación, portabilidad y oposición**, enviando una solicitud por escrito a:`,
      ],
      callout: {
        type: "info",
        title: "Ejercicio de Derechos",
        text: `Envía un correo electrónico a ${contactEmail} indicando el derecho que deseas ejercer y adjuntando copia de un documento acreditativo de tu identidad.`,
      },
    },
  ]

  return (
    <LegalPage
      title="Política de Privacidad"
      updatedAt={user.joinedAt || "Reciente"}
      intro={`Información detallada sobre el tratamiento responsable y seguro de los datos personales en el blog de ${user.name}.`}
      badge="RGPD & LOPD-GDD"
      sections={sections}
    />
  )
}
