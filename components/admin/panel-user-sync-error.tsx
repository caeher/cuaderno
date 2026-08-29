import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PanelUserSyncErrorProps {
  message?: string
}

export function PanelUserSyncError({ message }: PanelUserSyncErrorProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">No pudimos cargar tu perfil</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {message ??
          "Tu sesión de Clerk es válida, pero no se pudo sincronizar tu usuario con Convex. Verifica la integración Convex en el dashboard de Clerk (JWT template \"convex\" o integración nativa)."}
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button asChild>
          <Link href="/panel">Reintentar</Link>
        </Button>
      </div>
    </div>
  )
}
