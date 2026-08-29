import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PanelUserSyncErrorProps {
  message?: string
}

function isJwtSetupError(message?: string): boolean {
  return Boolean(
    message?.includes("NoAuthProvider") ||
      message?.includes("No auth provider") ||
      message?.includes("Falta JWT de Clerk")
  )
}

export function PanelUserSyncError({ message }: PanelUserSyncErrorProps) {
  const isJwtMisconfigured = isJwtSetupError(message)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">No pudimos cargar tu perfil</h1>
      {isJwtMisconfigured ? (
        <div className="max-w-lg space-y-3 text-sm text-muted-foreground text-left">
          <p>
            Tu sesión de Clerk es válida, pero falta el JWT que Convex espera (<code className="font-mono">aud: convex</code>).
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              En el dashboard de Clerk, crea el template JWT{" "}
              <code className="font-mono">convex</code> (Integraciones → Convex) o ejecuta{" "}
              <code className="font-mono">pnpm setup:clerk-convex</code>.
            </li>
            <li>
              Verifica que Convex tenga{" "}
              <code className="font-mono">CLERK_JWT_ISSUER_DOMAIN</code> apuntando a tu Frontend API URL.
            </li>
            <li>Cierra sesión, vuelve a entrar y recarga el panel.</li>
          </ol>
        </div>
      ) : (
        <p className="max-w-md text-sm text-muted-foreground">
          {message ??
            "Tu sesión de Clerk es válida, pero no se pudo sincronizar tu usuario con Convex."}
        </p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" render={<Link href="/" />}>
          Ir al inicio
        </Button>
        <Button render={<Link href="/panel" />}>Reintentar</Button>
      </div>
    </div>
  )
}
