"use client"

import * as React from "react"
import { Check, Copy, ExternalLink, Globe, Info, Network, Server, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { buildTenantUrl, getRootDomain } from "@/lib/tenant-utils"

interface DomainSettingsSectionProps {
  username: string
  subdomainEnabled: boolean
  customDomain?: string
  onSubdomainEnabledChange: (enabled: boolean) => void
  onCustomDomainChange: (domain: string) => void
}

export function DomainSettingsSection({
  username,
  subdomainEnabled,
  customDomain = "",
  onSubdomainEnabledChange,
  onCustomDomainChange,
}: DomainSettingsSectionProps) {
  const [copied, setCopied] = React.useState(false)
  const rootDomain = getRootDomain()
  const slug = username.trim() || "mi-blog"

  const publicUrl = buildTenantUrl({
    tenantSlug: slug,
    subdomainEnabled,
    customDomain: customDomain || null,
    absolute: true,
  })

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success("Enlace copiado al portapapeles")
    setTimeout(() => setCopied(false), 2500)
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
                  {subdomainEnabled ? "Modo Subdominio" : "Modo Ruta Amigable"}
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

      {/* Custom Domain Option (Future Scaling) */}
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 p-4 bg-card">
        <Label htmlFor="customDomain" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          Dominio Personalizado (Opcional)
        </Label>
        <p className="text-xs text-muted-foreground">
          Si dispones de tu propio dominio o subdominio (ej: <code className="text-primary">blog.miempresa.com</code>), indícalo aquí.
        </p>
        <Input
          id="customDomain"
          placeholder="ej: blog.miempresa.com"
          value={customDomain}
          onChange={(e) => onCustomDomainChange(e.target.value)}
          className="text-xs font-mono max-w-md mt-1"
        />
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
