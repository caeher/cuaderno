"use client"

import Link from "next/link"
import { ErrorView } from "@/components/errors"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText } from "lucide-react"

interface PanelErrorProps {
  error: Error & { digest?: string }
  retry: () => void
  reset?: () => void
}

export default function PanelError({ error, retry, reset }: PanelErrorProps) {
  return (
    <div className="p-6">
      <ErrorView
        error={error}
        retry={retry}
        reset={reset}
        title="Error en el panel de control"
        description="Se ha producido un error al cargar los datos del panel de administración. Puedes reintentar la acción o volver al listado de artículos."
        badge="Panel de control"
        homeUrl="/panel"
        homeLabel="Ir al Dashboard"
        customActions={
          <Button
            variant="outline"
            size="default"
            className="gap-2 cursor-pointer"
            render={<Link href="/panel/posts" />}
          >
            <FileText className="size-4" />
            <span>Mis Posts</span>
          </Button>
        }
      />
    </div>
  )
}
