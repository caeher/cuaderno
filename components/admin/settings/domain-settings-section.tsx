"use client"

import * as React from "react"
import {
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Globe,
  Info,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import type { CustomDomainClaim } from "@/lib/domain/entities"
import {
  claimCustomDomainAction,
  getCustomDomainClaimAction,
  removeCustomDomainAction,
  verifyCustomDomainAction,
} from "@/app/actions/custom-domains"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { buildTenantUrl, getRootDomain } from "@/lib/tenant-utils"

interface DomainSettingsSectionProps {
  username: string
  subdomainEnabled: boolean
  legacyCustomDomain?: string
  onSubdomainEnabledChange: (enabled: boolean) => void
}

export function DomainSettingsSection({
  username,
  subdomainEnabled,
  legacyCustomDomain,
  onSubdomainEnabledChange,
}: DomainSettingsSectionProps) {
  const [copied, setCopied] = React.useState(false)
  const [claim, setClaim] = React.useState<CustomDomainClaim | null>(null)
  const [domainInput, setDomainInput] = React.useState("")
  const [isLoadingClaim, setIsLoadingClaim] = React.useState(true)
  const [isManagingClaim, setIsManagingClaim] = React.useState(false)
  const [claimError, setClaimError] = React.useState<string | null>(null)
  const [hasRetiredLegacyDomain, setHasRetiredLegacyDomain] = React.useState(false)
  const rootDomain = getRootDomain()
  const slug = username.trim() || "mi-blog"
  const verifiedDomain = claim?.status === "verified" ? claim.hostname : null

  React.useEffect(() => {
    let active = true
    getCustomDomainClaimAction()
      .then((currentClaim) => {
        if (!active) return
        setClaim(currentClaim)
        setDomainInput(currentClaim?.hostname ?? legacyCustomDomain ?? "")
      })
      .catch((error: unknown) => {
        if (active) setClaimError(error instanceof Error ? error.message : "No se pudo consultar el estado del dominio.")
      })
      .finally(() => {
        if (active) setIsLoadingClaim(false)
      })
    return () => {
      active = false
    }
  }, [legacyCustomDomain])

  const publicUrl = buildTenantUrl({
    tenantSlug: slug,
    subdomainEnabled,
    customDomain: verifiedDomain,
    absolute: true,
  })

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success("Enlace copiado al portapapeles")
    setTimeout(() => setCopied(false), 2500)
  }

  async function runDomainOperation(operation: () => Promise<CustomDomainClaim | boolean>) {
    try {
      setIsManagingClaim(true)
      setClaimError(null)
      const result = await operation()
      if (typeof result === "boolean") {
        if (result) {
          setClaim(null)
          setDomainInput("")
          setHasRetiredLegacyDomain(true)
          toast.success("Dominio retirado. El cambio de routing puede tardar hasta 30 segundos.")
        } else {
          toast.message("No había un dominio activo para retirar.")
        }
      } else {
        setClaim(result)
        setDomainInput(result.hostname)
        toast.success(result.status === "verified" ? "Dominio verificado." : "Desafío DNS generado.")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo completar la operación."
      setClaimError(message)
      toast.error(message)
    } finally {
      setIsManagingClaim(false)
    }
  }

  function copyValue(value: string) {
    void navigator.clipboard.writeText(value)
    toast.success("Copiado al portapapeles")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-medium text-foreground flex items-center gap-2">
          <Globe className="size-4 text-primary" />
          Dominio y Enlace Público
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configura cómo acceden tus lectores a tu blog: mediante subdominio propio o mediante URL amigable en ruta.
        </p>
      </div>

      {/* Active URL Card Preview */}
      <Card className="border-primary/30 bg-primary/5 shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  URL Pública Activa
                </span>
                <Badge variant={subdomainEnabled ? "default" : "secondary"} className="text-[10px] px-2 py-0.5">
                  {verifiedDomain ? "Dominio Verificado" : subdomainEnabled ? "Modo Subdominio" : "Modo Ruta Amigable"}
                </Badge>
              </div>
              <p className="text-sm sm:text-base font-mono font-medium text-foreground break-all">
                {publicUrl}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs gap-1.5 bg-background cursor-pointer"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="text-xs gap-1.5 cursor-pointer"
                render={
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5" />
                    <span>Visitar</span>
                  </a>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routing Mode Selector */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Option 1: Subdomain Mode */}
        <div
          onClick={() => onSubdomainEnabledChange(true)}
          className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
            subdomainEnabled
              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
              : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Network className="size-4 text-primary" />
                Subdominio SaaS
              </span>
              <div
                className={`size-4 rounded-full border flex items-center justify-center ${
                  subdomainEnabled ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                }`}
              >
                {subdomainEnabled && <Check className="size-2.5 stroke-[3]" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu blog se mostrará directamente en la raíz de tu propio subdominio.
            </p>
          </div>
          <div className="mt-4 rounded-md bg-muted/60 px-2.5 py-1.5 font-mono text-xs text-foreground/90 break-all">
            https://{slug}.{rootDomain}/
          </div>
        </div>

        {/* Option 2: Friendly Path Route */}
        <div
          onClick={() => onSubdomainEnabledChange(false)}
          className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
            !subdomainEnabled
              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
              : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Server className="size-4 text-primary" />
                URL Amigable en Ruta
              </span>
              <div
                className={`size-4 rounded-full border flex items-center justify-center ${
                  !subdomainEnabled ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                }`}
              >
                {!subdomainEnabled && <Check className="size-2.5 stroke-[3]" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu blog se publicará bajo el dominio principal con tu identificador en la ruta.
            </p>
          </div>
          <div className="mt-4 rounded-md bg-muted/60 px-2.5 py-1.5 font-mono text-xs text-foreground/90 break-all">
            https://{rootDomain}/{slug}/
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-foreground">
            Dominio personalizado
          </p>
          <p className="text-xs text-muted-foreground">
            Reclama un hostname completo, por ejemplo <code className="text-primary">blog.miempresa.com</code>. El dominio raíz y <code>www</code> son hostnames distintos y se verifican por separado.
          </p>
        </div>

        {claim && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {claim.status === "verified" ? (
              <Badge className="gap-1"><ShieldCheck className="size-3" /> Verificado</Badge>
            ) : (
              <Badge variant="secondary" className="gap-1"><Clock3 className="size-3" /> Pendiente</Badge>
            )}
            <span className="font-mono text-foreground">{claim.hostname}</span>
          </div>
        )}

        {claimError && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
            {claimError}
          </p>
        )}

        {!claim && legacyCustomDomain && !hasRetiredLegacyDomain && (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-muted-foreground">
            <strong className="text-foreground">Dominio anterior pendiente de validación:</strong> {legacyCustomDomain}. Los dominios heredados ya no activan routing hasta completar la prueba DNS.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="customDomain" className="text-[11px] text-muted-foreground">Hostname</Label>
            <Input
              id="customDomain"
              placeholder="blog.miempresa.com"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              className="font-mono text-xs"
              autoComplete="off"
              disabled={isLoadingClaim || isManagingClaim}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={isLoadingClaim || isManagingClaim || !domainInput.trim()}
            onClick={() => void runDomainOperation(() => claimCustomDomainAction(domainInput.trim()))}
          >
            {claim?.status === "verified" && claim.hostname !== domainInput.trim() ? "Cambiar dominio" : "Generar desafío DNS"}
          </Button>
        </div>

        {claim?.status === "pending" && (
          <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div>
              <p className="text-xs font-semibold text-foreground">Publica este registro TXT en tu proveedor DNS</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                El desafío caduca el {new Date(claim.expiresAt).toLocaleString("es")}.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1 rounded-md border bg-background p-2.5">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">Nombre / host</span>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <code className="break-all text-[11px]">{claim.verificationHost}</code>
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Copiar host TXT" onClick={() => copyValue(claim.verificationHost)}>
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-md border bg-background p-2.5">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">Valor TXT</span>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <code className="break-all text-[11px]">cuaderno-domain-verification={claim.challenge}</code>
                  <Button type="button" variant="ghost" size="icon-xs" aria-label="Copiar valor TXT" onClick={() => copyValue(`cuaderno-domain-verification=${claim.challenge}`)}>
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mantén el valor exacto. Al solicitar un dominio distinto, el dominio anterior se revoca de inmediato; el nuevo solo recibirá tráfico después de verificarse.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={isManagingClaim} onClick={() => void runDomainOperation(() => verifyCustomDomainAction())}>
                Verificar registro DNS
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={isManagingClaim} onClick={() => void runDomainOperation(() => removeCustomDomainAction())}>
                <Trash2 className="size-3.5" /> Retirar dominio
              </Button>
            </div>
          </div>
        )}

        {claim?.status === "verified" && (
          <div className="flex flex-col gap-3 rounded-lg border border-emerald-600/20 bg-emerald-600/5 p-3">
            <p className="text-xs text-foreground">
              El control DNS está verificado y el routing está activo. La caché puede tardar hasta 30 segundos en reflejar cambios.
            </p>
            <p className="text-[11px] text-muted-foreground">
              También debes añadir el hostname en tu proveedor de hosting y confirmar allí que TLS/HTTPS esté emitido. Cuaderno no puede comprobar la configuración del proveedor ni el certificado.
            </p>
            <Button type="button" variant="outline" size="sm" className="self-start" disabled={isManagingClaim} onClick={() => void runDomainOperation(() => removeCustomDomainAction())}>
              <Trash2 className="size-3.5" /> Retirar dominio
            </Button>
          </div>
        )}

        {isLoadingClaim && <p className="text-xs text-muted-foreground">Consultando estado del dominio…</p>}
      </div>

      {/* Informative Note */}
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0 text-primary mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">Información técnica sobre subdominios:</span>
          <span>
            En producción, todos los subdominios funcionan mediante un registro DNS Wildcard (ej. <code className="text-foreground font-mono">*.{rootDomain}</code>). En desarrollo local, puedes acceder a <code className="text-foreground font-mono">{slug}.localhost:3000</code>.
          </span>
        </div>
      </div>
    </div>
  )
}
