"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { Mic, Sparkles, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { getNarrationServiceHealthAction } from "@/app/actions/narrations"
import {
  getComposerUnavailableReason,
  getNarrationUnavailableMessage,
  isComposerReadyForUse,
  type NarrationHealthSnapshot,
} from "@/lib/application/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field"

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return ok ? (
    <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
      <CheckCircle2 className="size-3" />
      {label}
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-700 border-amber-500/20">
      <AlertTriangle className="size-3" />
      {label}
    </Badge>
  )
}

export function IntegrationsSettingsSection() {
  const { isLoaded, isSignedIn } = useUser()
  const composerHealth = useQuery(
    api.ai.getConfigHealth,
    isLoaded && isSignedIn ? {} : "skip"
  )
  const [narrationHealth, setNarrationHealth] = React.useState<NarrationHealthSnapshot | null>(null)
  const [narrationError, setNarrationError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    getNarrationServiceHealthAction()
      .then((status) => {
        if (!cancelled) setNarrationHealth(status)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setNarrationError(
            error instanceof Error ? error.message : "No se pudo consultar el estado de Vapi."
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const composerReady = isComposerReadyForUse(composerHealth ?? null)
  const composerReason = composerHealth ? getComposerUnavailableReason(composerHealth) : null
  const narrationReason = narrationHealth ? getNarrationUnavailableMessage(narrationHealth) : null

  return (
    <FieldSet>
      <FieldLegend>Integraciones del panel</FieldLegend>
      <FieldDescription>
        Composer (OpenAI) y la narración de voz (Vapi) se controlan por variables de entorno. No se
        envían claves al navegador.
      </FieldDescription>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>
                Composer · OpenAI
              </CardTitle>
              {composerHealth === undefined ? (
                <Badge variant="secondary">Comprobando…</Badge>
              ) : (
                <StatusBadge ok={composerReady} label={composerReady ? "Listo" : "Apagado"} />
              )}
            </div>
            <CardDescription className="text-xs">
              Asistente de investigación y borradores. Nunca publica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {composerHealth && (
              <dl className="grid gap-1.5 text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt>Flag COMPOSER_ENABLED</dt>
                  <dd className="font-medium text-foreground">
                    {composerHealth.composerEnabled ? "true" : "false"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Clave OpenAI en Convex</dt>
                  <dd className="font-medium text-foreground">
                    {composerHealth.hasApiKey ? "Configurada" : "Ausente"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Sesión Convex</dt>
                  <dd className="font-medium text-foreground">
                    {composerHealth.isAuthenticated ? "Autenticada" : "Sin JWT"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Kill switch</dt>
                  <dd className="font-medium text-foreground">
                    {composerHealth.killSwitchActive ? "Activo" : "Inactivo"}
                  </dd>
                </div>
              </dl>
            )}
            {composerReason && (
              <p className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5 text-amber-800 dark:text-amber-200">
                {composerReason.message}
              </p>
            )}
            <Button size="sm" variant="outline" render={<Link href="/panel/composer" />}>
              <ExternalLink data-icon="inline-start" />
              Abrir Composer
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mic className="size-4" />
                </span>
                Narración · Vapi
              </CardTitle>
              {narrationHealth === null && !narrationError ? (
                <Badge variant="secondary">Comprobando…</Badge>
              ) : (
                <StatusBadge
                  ok={narrationHealth?.enabled === true}
                  label={narrationHealth?.enabled ? "Listo" : "Apagado"}
                />
              )}
            </div>
            <CardDescription className="text-xs">
              Generación de audio en el editor de posts. Vive en el servidor Next.js, no en Convex.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {narrationHealth && (
              <dl className="grid gap-1.5 text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt>Servicio habilitado</dt>
                  <dd className="font-medium text-foreground">
                    {narrationHealth.enabled ? "Sí" : "No"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>VAPI_PRIVATE_API_KEY</dt>
                  <dd className="font-medium text-foreground">
                    {narrationHealth.isConfigured ? "Configurada" : "Ausente"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Kill switch</dt>
                  <dd className="font-medium text-foreground">
                    {narrationHealth.isKillSwitchActive ? "Activo" : "Inactivo"}
                  </dd>
                </div>
              </dl>
            )}
            {(narrationReason || narrationError) && (
              <p className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5 text-amber-800 dark:text-amber-200">
                {narrationError || narrationReason}
              </p>
            )}
            <Button size="sm" variant="outline" render={<Link href="/panel/posts" />}>
              <ExternalLink data-icon="inline-start" />
              Ir a posts
            </Button>
          </CardContent>
        </Card>
      </div>
    </FieldSet>
  )
}
