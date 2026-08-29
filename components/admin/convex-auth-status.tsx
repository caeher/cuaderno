"use client"

import { useState } from "react"
import { useAuth, useUser, useOrganization } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, ShieldAlert, RefreshCw, Database, Building, User, CheckCircle2, AlertCircle } from "lucide-react"

export function ConvexAuthStatus() {
  const isConvexConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)
  const { isLoaded, isSignedIn, userId, orgId, orgRole } = useAuth()
  const { user } = useUser()
  const { organization } = useOrganization()

  // Query al backend de Convex usando useQuery (reactivo)
  const authStatus = useQuery(api.testAuth.getAuthStatus)
  const executeTestWrite = useMutation(api.testAuth.testWriteOperation)

  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const handleTestWrite = async () => {
    setLoadingAction(true)
    setTestResult(null)
    try {
      const res = await executeTestWrite({
        resourceName: "Diagnóstico de prueba",
      })
      setTestResult({
        success: true,
        message: res.message,
      })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al ejecutar la mutación"
      setTestResult({
        success: false,
        message: errorMsg,
      })
    } finally {
      setLoadingAction(false)
    }
  }

  if (!isConvexConfigured) {
    return (
      <Card className="border-border bg-warn-tint shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-warn-ink">
            <ShieldAlert className="size-5 text-warn" />
            <CardTitle className="text-base font-medium">Convex no configurado localmente</CardTitle>
          </div>
          <CardDescription className="text-warn-ink">
            La variable <code className="font-mono font-semibold">NEXT_PUBLIC_CONVEX_URL</code> no está definida en tu archivo <code className="font-mono">.env.local</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-warn-ink">
          <p>Para conectar Convex con Clerk:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Ejecuta <code className="rounded bg-card px-1 py-0.5 font-mono">npx convex dev</code> para iniciar tu backend.</li>
            <li>Copia la variable <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code> en tu <code className="font-mono">.env.local</code>.</li>
            <li>Configura el JWT Template <code className="font-mono">convex</code> en el Dashboard de Clerk.</li>
          </ol>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-border shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="size-5 text-ia" />
            <CardTitle className="text-base font-medium">Estado de Autenticación Convex + Clerk</CardTitle>
          </div>
          {authStatus?.identity.isAuthenticated ? (
            <Badge variant="default" className="gap-1 border-transparent bg-perf-tint text-perf-strong">
              <ShieldCheck className="size-3.5" /> Autenticado en Convex
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <User className="size-3.5" /> Anónimo / No verificado
            </Badge>
          )}
        </div>
        <CardDescription>
          Diagnóstico en vivo de la sincronización de identidad y claims de organización entre Clerk y Convex.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clerk State */}
          <div className="space-y-2 rounded-xl border border-border bg-surface-sunken p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              <User className="size-3.5" /> Estado en Cliente (Clerk)
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sesión:</span>
                <span className="font-medium">{!isLoaded ? "Cargando..." : isSignedIn ? "Iniciada" : "Anónima"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono truncate max-w-[180px]">{userId || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usuario:</span>
                <span className="truncate max-w-[180px]">{user?.primaryEmailAddress?.emailAddress || user?.username || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organización:</span>
                <span className="truncate max-w-[180px]">{organization?.name || "Personal (Sin Org)"}</span>
              </div>
              {orgId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Org ID / Rol:</span>
                  <span className="font-mono truncate max-w-[180px]">{orgId} ({orgRole || "member"})</span>
                </div>
              )}
            </div>
          </div>

          {/* Convex Backend State */}
          <div className="space-y-2 rounded-xl border border-border bg-surface-sunken p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              <ShieldCheck className="size-3.5" /> Identidad Backend (Convex)
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend Auth:</span>
                <span className="font-medium">
                  {authStatus === undefined
                    ? "Consultando..."
                    : authStatus.identity.isAuthenticated
                    ? "Válida (JWT Clerk)"
                    : "Anónimo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenant ID:</span>
                <span className="font-mono truncate max-w-[180px]">
                  {authStatus?.identity.tenantId || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo Tenant:</span>
                <span className="font-medium capitalize">
                  {authStatus?.identity.tenantType || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clerk Subject:</span>
                <span className="font-mono truncate max-w-[180px]">
                  {authStatus?.identity.userId || "—"}
                </span>
              </div>
              {authStatus?.identity.orgId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Org Claim:</span>
                  <span className="font-mono truncate max-w-[180px]">
                    {authStatus.identity.orgId} ({authStatus.identity.orgRole})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Test Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="text-sm text-muted-foreground">
            Prueba de mutación autenticada con control de acceso por Tenant.
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestWrite}
            disabled={loadingAction || !authStatus?.identity.isAuthenticated}
            className="gap-1.5"
          >
            {loadingAction ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Building className="size-3.5" />
            )}
            Probar Mutación en Convex
          </Button>
        </div>

        {testResult && (
          <div
            className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
              testResult.success
                ? "border border-perf/25 bg-perf-tint text-perf-strong"
                : "border border-destructive/25 bg-danger-tint text-destructive"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-perf" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            )}
            <div>
              <p className="font-medium">{testResult.success ? "Éxito" : "Error"}</p>
              <p>{testResult.message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
