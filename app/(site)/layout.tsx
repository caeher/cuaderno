import { SiteFooter } from "@/components/site/footer"
import { SiteNavbar } from "@/components/site/navbar"
import { CookieConsentBanner } from "@/components/site/cookie-consent-banner"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieConsentBanner />
    </div>
  )
}
