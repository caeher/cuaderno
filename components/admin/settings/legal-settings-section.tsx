"use client"

import * as React from "react"
import { Scale, Building2, ShieldCheck, Mail, MapPin, FileText, Cookie, ExternalLink, Sparkles, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { buildTenantLegalUrl } from "@/lib/tenant-utils"
import type { TenantLegalSettings } from "@/lib/domain/entities"

interface LegalSettingsSectionProps {
  username: string
  subdomainEnabled: boolean
  legalSettings: TenantLegalSettings
  onLegalSettingsChange: (settings: TenantLegalSettings) => void
}

export function LegalSettingsSection({
  username,
  subdomainEnabled,
  legalSettings,
  onLegalSettingsChange,
}: LegalSettingsSectionProps) {
  const [legalDocTab, setLegalDocTab] = React.useState<string>("aviso")

  function updateField<K extends keyof TenantLegalSettings>(key: K, value: string) {
    onLegalSettingsChange({
      ...legalSettings,
      [key]: value,
    })
  }

  const baseLegalUrl = buildTenantLegalUrl(username || "mi-blog", "", {
    subdomainEnabled,
    absolute: true,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-foreground flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            Páginas Legales del Blog
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configura la titularidad, privacidad (RGPD/LOPD) y términos legales exclusivos de este blog o publicación.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 cursor-pointer bg-background"
          render={
            <a href={baseLegalUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
              <span>Ver Centro Legal Público</span>
            </a>
          }
        />
      </div>

      {/* 1. Datos Identificativos del Titular */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Datos Identificativos del Titular / Responsable
          </CardTitle>
          <CardDescription className="text-xs">
            Estos datos se utilizarán automáticamente en todas las políticas legales generadas para tu blog.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="legalCompanyName" className="text-xs font-medium">
              Razón Social o Nombre del Titular
            </Label>
            <Input
              id="legalCompanyName"
              placeholder="ej: Acme Media S.L. o Tu Nombre"
              value={legalSettings.companyName ?? ""}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="legalTaxId" className="text-xs font-medium">
              NIF / CIF / Identificación Fiscal
            </Label>
            <Input
              id="legalTaxId"
              placeholder="ej: B12345678 o 12345678Z"
              value={legalSettings.taxId ?? ""}
              onChange={(e) => updateField("taxId", e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="legalContactEmail" className="text-xs font-medium">
              Correo Electrónico de Contacto Legal
            </Label>
            <Input
              id="legalContactEmail"
              type="email"
              placeholder="ej: legal@tuempresa.com"
              value={legalSettings.contactEmail ?? ""}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="legalDpoContact" className="text-xs font-medium">
              Contacto de Privacidad / DPO (Opcional)
            </Label>
            <Input
              id="legalDpoContact"
              placeholder="ej: dpo@tuempresa.com"
              value={legalSettings.dpoContact ?? ""}
              onChange={(e) => updateField("dpoContact", e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="legalAddress" className="text-xs font-medium">
              Domicilio o Ubicación Social
            </Label>
            <Input
              id="legalAddress"
              placeholder="ej: Calle Gran Vía 28, 28013 Madrid, España"
              value={legalSettings.address ?? ""}
              onChange={(e) => updateField("address", e.target.value)}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Textos Personalizados por Documento */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Redacción Personalizada de Políticas (Opcional)
              </CardTitle>
              <CardDescription className="text-xs">
                Si dejas estos campos vacíos, el sistema generará automáticamente las políticas con la plantilla estándar oficial.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs value={legalDocTab} onValueChange={setLegalDocTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/60 border border-border/60">
              <TabsTrigger value="aviso" className="gap-1.5 text-xs py-1.5 px-2.5 cursor-pointer">
                <Scale className="size-3" />
                <span>Aviso Legal</span>
              </TabsTrigger>
              <TabsTrigger value="privacidad" className="gap-1.5 text-xs py-1.5 px-2.5 cursor-pointer">
                <ShieldCheck className="size-3" />
                <span>Privacidad</span>
              </TabsTrigger>
              <TabsTrigger value="terminos" className="gap-1.5 text-xs py-1.5 px-2.5 cursor-pointer">
                <FileText className="size-3" />
                <span>Términos</span>
              </TabsTrigger>
              <TabsTrigger value="cookies" className="gap-1.5 text-xs py-1.5 px-2.5 cursor-pointer">
                <Cookie className="size-3" />
                <span>Cookies</span>
              </TabsTrigger>
            </TabsList>

            {/* AVISO LEGAL */}
            <TabsContent value="aviso" className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Texto personalizado para el Aviso Legal:</span>
                {legalSettings.customLegalNotice ? (
                  <Badge variant="secondary" className="text-[10px]">Personalizado</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Plantilla Automática</Badge>
                )}
              </div>
              <Textarea
                placeholder="Escribe aquí el texto legal completo si deseas anular la plantilla automática..."
                value={legalSettings.customLegalNotice ?? ""}
                onChange={(e) => updateField("customLegalNotice", e.target.value)}
                rows={8}
                className="text-xs font-mono"
              />
            </TabsContent>

            {/* PRIVACIDAD */}
            <TabsContent value="privacidad" className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Texto personalizado para la Política de Privacidad:</span>
                {legalSettings.customPrivacyPolicy ? (
                  <Badge variant="secondary" className="text-[10px]">Personalizado</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Plantilla Automática</Badge>
                )}
              </div>
              <Textarea
                placeholder="Escribe aquí tu política de privacidad RGPD si tienes cláusulas especiales..."
                value={legalSettings.customPrivacyPolicy ?? ""}
                onChange={(e) => updateField("customPrivacyPolicy", e.target.value)}
                rows={8}
                className="text-xs font-mono"
              />
            </TabsContent>

            {/* TÉRMINOS */}
            <TabsContent value="terminos" className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Texto personalizado para los Términos de Servicio:</span>
                {legalSettings.customTerms ? (
                  <Badge variant="secondary" className="text-[10px]">Personalizado</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Plantilla Automática</Badge>
                )}
              </div>
              <Textarea
                placeholder="Escribe aquí tus términos de uso y normas de autoría..."
                value={legalSettings.customTerms ?? ""}
                onChange={(e) => updateField("customTerms", e.target.value)}
                rows={8}
                className="text-xs font-mono"
              />
            </TabsContent>

            {/* COOKIES */}
            <TabsContent value="cookies" className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Texto personalizado para la Política de Cookies:</span>
                {legalSettings.customCookiePolicy ? (
                  <Badge variant="secondary" className="text-[10px]">Personalizado</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Plantilla Automática</Badge>
                )}
              </div>
              <Textarea
                placeholder="Escribe aquí tu política de cookies si utilizas rastreadores de terceros adicionales..."
                value={legalSettings.customCookiePolicy ?? ""}
                onChange={(e) => updateField("customCookiePolicy", e.target.value)}
                rows={8}
                className="text-xs font-mono"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
