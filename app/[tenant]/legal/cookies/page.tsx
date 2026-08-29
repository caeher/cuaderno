import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTenantBySlug } from "@/lib/application/blog-use-cases"
import { LegalPage, type LegalSection } from "@/components/site/legal-page"

interface CookiesPageProps {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: CookiesPageProps): Promise<Metadata> {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)
  if (!user) return { title: "Política de Cookies" }
  return {
    title: `Política de Cookies · ${user.name}`,
    description: `Información sobre el uso de cookies y rastreadores en el blog de ${user.name}.`,
  }
}

export default async function TenantCookiesPage({ params }: CookiesPageProps) {
  const { tenant } = await params
  const user = await getTenantBySlug(tenant)

  if (!user) notFound()

  const legal = user.legalSettings || {}
  const companyName = legal.companyName || user.name

  if (legal.customCookiePolicy) {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="font-serif text-3xl font-medium">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {user.joinedAt || "Reciente"}</p>
        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-sm text-foreground/90">
          {legal.customCookiePolicy}
        </div>
      </div>
    )
  }

  const sections: LegalSection[] = [
    {
      heading: "1. ¿Qué son las cookies?",
      body: [
        `Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier página web. Su utilidad es que la web sea capaz de recordar tu visita cuando vuelvas a navegar por esa página.`,
      ],
    },
    {
      heading: "2. Cookies utilizadas en este blog",
      body: [
        `Este blog utiliza cookies estrictamente necesarias para el funcionamiento del servicio, preferencias del usuario (modo oscuro/claro) y, en su caso, cookies analíticas agregadas para conocer el volumen de visitas.`,
      ],
      table: {
        headers: ["Nombre", "Tipo", "Finalidad", "Duración"],
        rows: [
          ["cookie_consent", "Técnica", "Guarda tus preferencias de consentimiento de cookies", "1 año"],
          ["theme", "Preferencia", "Almacena la preferencia de tema (claro/oscuro)", "Persistente"],
          ["__clerk_session", "Autenticación", "Gestión de sesión de usuario autenticado", "Sesión"],
        ],
      },
    },
    {
      heading: "3. Cómo desactivar o eliminar las cookies",
      body: [
        `Puedes ejercer tu derecho de desactivación o eliminación de cookies en cualquier momento a través del banner de configuración de este sitio o configurando las opciones de tu navegador de internet (Chrome, Firefox, Safari, Edge).`,
      ],
      callout: {
        type: "info",
        title: "Configuración Rápida",
        text: `Puedes abrir en cualquier momento el panel de preferencias haciendo clic en el enlace 'Configuración de cookies' situado al pie de página.`,
      },
    },
  ]

  return (
    <LegalPage
      title="Política de Cookies"
      updatedAt={user.joinedAt || "Reciente"}
      intro={`Información transparente sobre el uso de cookies y almacenamiento local en el blog de ${user.name}.`}
      badge="ePrivacy"
      sections={sections}
    />
  )
}
