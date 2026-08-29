import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTenantBySlug } from "@/lib/application/blog-use-cases"
import { LegalPage, type LegalSection } from "@/components/site/legal-page"

interface AvisoLegalPageProps {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: AvisoLegalPageProps): Promise<Metadata> {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)
  if (!user) return { title: "Aviso Legal" }
  return {
    title: `Aviso Legal · ${user.name}`,
    description: `Información legal y datos identificativos del blog de ${user.name}.`,
  }
}

export default async function TenantAvisoLegalPage({ params }: AvisoLegalPageProps) {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)

  if (!user) notFound()

  const legal = user.legalSettings || {}
  const companyName = legal.companyName || user.name
  const contactEmail = legal.contactEmail || user.email
  const taxId = legal.taxId || "No especificado"
  const address = legal.address || user.location || "España / Internacional"

  if (legal.customLegalNotice) {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="font-serif text-3xl font-medium">Aviso Legal</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {user.joinedAt || "Reciente"}</p>
        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-sm text-foreground/90">
          {legal.customLegalNotice}
        </div>
      </div>
    )
  }

  const sections: LegalSection[] = [
    {
      heading: "1. Datos Identificativos del Titular",
      body: [
        `En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), a continuación se reflejan los siguientes datos:`,
      ],
      table: {
        headers: ["Concepto", "Información"],
        rows: [
          ["Titular / Razón Social", companyName],
          ["NIF / Identificación Fiscal", taxId],
          ["Domicilio / Ubicación", address],
          ["Correo electrónico", contactEmail],
          ["Actividad", "Publicación de contenidos editoriales y blog personal"],
        ],
      },
    },
    {
      heading: "2. Condiciones de Uso y Acceso",
      body: [
        `El acceso y uso de este blog atribuye la condición de USUARIO, que acepta, desde dicho acceso, las Condiciones Generales de Uso aquí reflejadas.`,
        `El usuario asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro o suscripción que fuese necesario para acceder a determinados servicios o contenidos.`,
      ],
      list: [
        "Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.",
        "Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, o que atente contra los derechos humanos.",
        "Provocar daños en los sistemas físicos y lógicos del titular, de sus proveedores o de terceras personas.",
      ],
    },
    {
      heading: "3. Propiedad Intelectual e Industrial",
      body: [
        `${companyName}, por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de este blog, así como de los elementos contenidos en el mismo (a título enunciativo, textos, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño).`,
        `Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de este blog con fines comerciales sin la autorización expresa del titular.`,
      ],
    },
    {
      heading: "4. Exclusión de Garantías y Responsabilidad",
      body: [
        `${companyName} no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.`,
      ],
    },
    {
      heading: "5. Legislación Aplicable y Jurisdicción",
      body: [
        `La relación entre ${companyName} y el USUARIO se regirá por la normativa española y comunitaria vigente. Para la resolución de cualquier controversia, las partes se someterán a los Juzgados y Tribunales competentes.`,
      ],
    },
  ]

  return (
    <LegalPage
      title="Aviso Legal"
      updatedAt={user.joinedAt || "Reciente"}
      intro={`Información corporativa, titularidad y condiciones legales aplicables a este blog de ${user.name}.`}
      badge="LSSI-CE"
      sections={sections}
    />
  )
}
