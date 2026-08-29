import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTenantBySlug } from "@/lib/application/blog-use-cases"
import { LegalPage, type LegalSection } from "@/components/site/legal-page"

interface TerminosPageProps {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: TerminosPageProps): Promise<Metadata> {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)
  if (!user) return { title: "Términos de Servicio" }
  return {
    title: `Términos de Servicio · ${user.name}`,
    description: `Condiciones de uso y normas de la comunidad en el blog de ${user.name}.`,
  }
}

export default async function TenantTerminosPage({ params }: TerminosPageProps) {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)

  if (!user) notFound()

  const legal = user.legalSettings || {}
  const companyName = legal.companyName || user.name

  if (legal.customTerms) {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="font-serif text-3xl font-medium">Términos de Servicio</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {user.joinedAt || "Reciente"}</p>
        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-sm text-foreground/90">
          {legal.customTerms}
        </div>
      </div>
    )
  }

  const sections: LegalSection[] = [
    {
      heading: "1. Objeto y Ámbito de Aplicación",
      body: [
        `Las presentes Condiciones Generales de Uso regulan el acceso, navegación y utilización de los contenidos y servicios ofrecidos en este blog de ${companyName}.`,
      ],
    },
    {
      heading: "2. Normas de Participación y Comentarios",
      body: [
        `Para fomentar un espacio constructivo de debate, los usuarios que participen en las secciones de comentarios se comprometen a:`,
      ],
      list: [
        "Respetar las opiniones de los demás lectores y del autor.",
        "No emplear lenguaje ofensivo, difamatorio, discriminatorio o que incite al odio.",
        "No publicar spam, publicidad no autorizada o enlaces maliciosos.",
        "El autor se reserva el derecho de moderar, editar o eliminar cualquier comentario que infrinja estas normas.",
      ],
    },
    {
      heading: "3. Responsabilidad sobre los Contenidos",
      body: [
        `Las opiniones y reflexiones publicadas en este blog representan el punto de vista de sus respectivos autores. Aunque se procura que toda la información sea rigurosa y actualizada, no se garantiza la infalibilidad o exactitud absoluta de todos los datos.`,
      ],
    },
    {
      heading: "4. Modificación de los Términos",
      body: [
        `${companyName} se reserva el derecho de modificar en cualquier momento las presentes condiciones, publicando la versión actualizada en esta misma página.`,
      ],
    },
  ]

  return (
    <LegalPage
      title="Términos de Servicio"
      updatedAt={user.joinedAt || "Reciente"}
      intro={`Condiciones generales y directrices de uso aplicables al blog de ${user.name}.`}
      badge="Términos & Condiciones"
      sections={sections}
    />
  )
}
