"use client"

import { SiteNavbar } from "@/components/site/navbar"
import { SiteFooter } from "@/components/site/footer"
import { ErrorView } from "@/components/errors"

interface RootErrorProps {
  error: Error & { digest?: string }
  retry: () => void
  reset?: () => void
}

export default function RootError({ error, retry, reset }: RootErrorProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      <main className="flex-1 flex items-center justify-center">
        <ErrorView
          error={error}
          retry={retry}
          reset={reset}
          title="Algo no ha salido como esperábamos"
          description="Se ha producido un error inesperado al procesar la página. Puedes volver a intentarlo o regresar al inicio."
          homeUrl="/"
          homeLabel="Volver al inicio"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
