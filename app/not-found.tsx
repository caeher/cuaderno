import type { Metadata } from "next"
import { SiteNavbar } from "@/components/site/navbar"
import { SiteFooter } from "@/components/site/footer"
import { CookieConsentBanner } from "@/components/site/cookie-consent-banner"
import { NotFoundView } from "@/components/errors"
import { constructSiteMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = constructSiteMetadata({
  title: "Página no encontrada (404)",
  description: "Lo sentimos, no hemos podido encontrar la página que buscas en Cuaderno.",
  noIndex: true,
})

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      <main className="flex-1 flex items-center justify-center">
        <NotFoundView
          title="Página no encontrada"
          description="La dirección web a la que intentas acceder no existe, ha cambiado de nombre o no está disponible temporalmente."
          homeUrl="/"
          homeLabel="Volver al inicio"
          showBack={true}
          showSuggestions={true}
        />
      </main>
      <SiteFooter />
      <CookieConsentBanner />
    </div>
  )
}
