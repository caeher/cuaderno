import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import type { Metadata, Viewport } from 'next'
import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans, Work_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { JsonLdScript } from '@/components/seo/json-ld-script'
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/lib/seo/json-ld'
import { SITE_CONFIG } from '@/lib/seo/config'
import { ConvexClientProvider } from '@/components/providers/convex-client-provider'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
})

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
})

// Familia del design system (design-system/tokens/fonts.css). Work Sans se conserva
// declarada porque 35 archivos siguen usando font-serif/Fraunces: cambiar las dos
// familias a la vez es un salto visual que nadie pidio.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s · ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.creator, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.name,
  keywords: SITE_CONFIG.defaultKeywords,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/',
      'es-MX': '/',
      'es-CL': '/',
      'es-CO': '/',
      'es-AR': '/',
    },
  },
  openGraph: {
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    alternateLocale: SITE_CONFIG.alternateLocales,
    type: 'website',
    images: [
      {
        url: '/placeholder.jpg',
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitterHandle,
    site: SITE_CONFIG.twitterHandle,
    images: ['/placeholder.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#faf9f7',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const websiteJsonLd = generateWebSiteJsonLd()
  const organizationJsonLd = generateOrganizationJsonLd()

  return (
    <html lang="es" className="bg-background">
      <head>
        <JsonLdScript data={websiteJsonLd} />
        <JsonLdScript data={organizationJsonLd} />
      </head>
      <body
        className={`${plusJakarta.variable} ${fraunces.variable} ${workSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ClerkProvider
          appearance={{ theme: shadcn }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/panel"
          signUpFallbackRedirectUrl="/panel"
        >
          <ConvexClientProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}