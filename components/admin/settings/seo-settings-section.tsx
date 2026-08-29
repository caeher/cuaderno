"use client"

import * as React from "react"
import {
  Search,
  Sparkles,
  Bot,
  Globe2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  X,
  Share2,
  Laptop,
  Smartphone,
  Info,
} from "lucide-react"
import type { TenantSeoSettings } from "@/lib/domain/entities"
import { GEO_PRESETS, resolveGeoLocation, SITE_CONFIG } from "@/lib/seo/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface SeoSettingsSectionProps {
  authorName: string
  username: string
  defaultBio?: string
  defaultLocation?: string
  seoSettings: TenantSeoSettings
  onSeoSettingsChange: (settings: TenantSeoSettings) => void
}

export function SeoSettingsSection({
  authorName,
  username,
  defaultBio = "",
  defaultLocation = "",
  seoSettings,
  onSeoSettingsChange,
}: SeoSettingsSectionProps) {
  const [keywordInput, setKeywordInput] = React.useState("")
  const [serpView, setSerpView] = React.useState<"desktop" | "mobile">("desktop")

  const metaTitle = seoSettings.metaTitle ?? `${authorName} — Blog de ${authorName}`
  const metaDescription = seoSettings.metaDescription ?? (defaultBio || `Blog personal y publicaciones de ${authorName} en Cuaderno.`)
  const keywords = seoSettings.keywords ?? ["blog", "tecnología", "diseño", "escritura"]
  const allowAiCrawlers = seoSettings.allowAiCrawlers ?? true
  const enableLlmsTxt = seoSettings.enableLlmsTxt ?? true
  const geoCountry = seoSettings.geoCountry ?? (defaultLocation.includes("España") ? "España" : defaultLocation.includes("México") ? "México" : "España")
  const geoCity = seoSettings.geoCity ?? (defaultLocation.split(",")[0]?.trim() || "Madrid")
  const geoCoordinates = seoSettings.geoCoordinates ?? (resolveGeoLocation(defaultLocation)?.coordinates || "40.4168;-3.7038")

  const blogUrl = `${SITE_CONFIG.url}/${username}`
  const authorProfileUrl = `${SITE_CONFIG.url}/autor/${username}`

  // Compute SEO & GEO Quality Score (0 to 100)
  const auditChecks = [
    {
      title: "Título SEO optimizado (30-60 caracteres)",
      passed: metaTitle.length >= 25 && metaTitle.length <= 65,
      weight: 20,
      detail: `${metaTitle.length} caracteres (recomendado: 30-60)`,
    },
    {
      title: "Meta descripción persuasiva (70-160 caracteres)",
      passed: metaDescription.length >= 70 && metaDescription.length <= 160,
      weight: 20,
      detail: `${metaDescription.length} caracteres (recomendado: 70-160)`,
    },
    {
      title: "Palabras clave relevantes configuradas",
      passed: keywords.length >= 3,
      weight: 15,
      detail: `${keywords.length} palabras clave definidas (mínimo 3)`,
    },
    {
      title: "Geolocalización y metaetiquetas regionales (GEO)",
      passed: Boolean(geoCity && geoCoordinates),
      weight: 15,
      detail: geoCity ? `Ubicado en ${geoCity} (${geoCountry})` : "Pendiente de definir",
    },
    {
      title: "Indexación activa para Motores de IA (GPTBot / Perplexity)",
      passed: allowAiCrawlers,
      weight: 15,
      detail: allowAiCrawlers ? "Bots de IA autorizados" : "Bots de IA restringidos",
    },
    {
      title: "Endpoint llms.txt habilitado según estándar",
      passed: enableLlmsTxt,
      weight: 15,
      detail: enableLlmsTxt ? "Endpoint /llms.txt activo" : "Deshabilitado",
    },
  ]

  const healthScore = auditChecks.reduce(
    (total, check) => total + (check.passed ? check.weight : 0),
    0
  )

  function updateField<K extends keyof TenantSeoSettings>(
    field: K,
    value: TenantSeoSettings[K]
  ) {
    onSeoSettingsChange({
      ...seoSettings,
      [field]: value,
    })
  }

  function handleAddKeyword() {
    const clean = keywordInput.trim().toLowerCase().replace(/^#/, "")
    if (clean && !keywords.includes(clean)) {
      updateField("keywords", [...keywords, clean])
      setKeywordInput("")
    }
  }

  function handleRemoveKeyword(tagToRemove: string) {
    updateField("keywords", keywords.filter((k) => k !== tagToRemove))
  }

  function handleApplyPreset(presetKey: string) {
    const preset = GEO_PRESETS[presetKey]
    if (preset) {
      onSeoSettingsChange({
        ...seoSettings,
        geoCountry: preset.country,
        geoCity: preset.placename.split(",")[0]?.trim(),
        geoCoordinates: preset.coordinates,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Search className="size-4 text-text-tertiary" />
          Optimización SEO y GEO (Generative Engine Optimization)
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura cómo los motores de búsqueda tradicionales (Google, Bing) y los motores de IA generativa (Perplexity, SearchGPT, Gemini, Claude) descubren, citan y posicionan tu blog.
        </p>
      </div>

      {/* Real-time Health & Audit Score Card */}
      <Card className="overflow-hidden rounded-xl border border-border bg-card ring-0">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles className="size-4 text-text-tertiary" />
                Puntuación de Salud SEO & GEO
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Auditoría técnica en tiempo real para máxima visibilidad en buscadores y LLMs
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-mono text-2xl font-semibold tabular-nums ${
                    healthScore >= 80
                      ? "text-perf-strong"
                      : healthScore >= 50
                      ? "text-warn-ink"
                      : "text-destructive"
                  }`}
                >
                  {healthScore}
                </span>
                <span className="font-mono text-xs tabular-nums text-text-tertiary">/100</span>
              </div>
              <Badge
                variant="secondary"
                className={`border-transparent text-xs font-medium ${
                  healthScore >= 80
                    ? "bg-perf-tint text-perf-strong"
                    : healthScore >= 50
                    ? "bg-warn-tint text-warn-ink"
                    : "bg-danger-tint text-destructive"
                }`}
              >
                {healthScore >= 80 ? "Excelente" : healthScore >= 50 ? "Mejorable" : "Requiere atención"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 80
                  ? "bg-perf"
                  : healthScore >= 50
                  ? "bg-warn"
                  : "bg-destructive"
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {auditChecks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 rounded-lg border border-border p-2 transition-colors ${
                  check.passed ? "bg-perf-tint text-foreground" : "bg-surface-sunken text-muted-foreground"
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-perf-strong" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-warn-ink" />
                )}
                <div>
                  <p className="font-medium">{check.title}</p>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Classic Metadata */}
      <Card className="rounded-xl border border-border bg-card ring-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Globe2 className="size-4 text-text-tertiary" />
            Metadatos SEO del Blog
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Personaliza el título y la descripción con los que tu blog aparece en los resultados de Google y Bing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="metaTitle" className="text-sm font-medium text-foreground">
                Meta Título del Blog
              </Label>
              <span className={`font-mono text-xs tabular-nums ${metaTitle.length > 60 ? "text-warn-ink" : "text-text-tertiary"}`}>
                {metaTitle.length}/60 caracteres
              </span>
            </div>
            <Input
              id="metaTitle"
              value={seoSettings.metaTitle ?? ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              placeholder={`${authorName} — Blog de ${authorName}`}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Aparece en la pestaña del navegador y como encabezado azul en Google. Recomendado: 30-60 caracteres.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="metaDescription" className="text-sm font-medium text-foreground">
                Meta Descripción
              </Label>
              <span className={`font-mono text-xs tabular-nums ${metaDescription.length > 160 ? "text-warn-ink" : "text-text-tertiary"}`}>
                {metaDescription.length}/160 caracteres
              </span>
            </div>
            <Textarea
              id="metaDescription"
              value={seoSettings.metaDescription ?? ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              placeholder={defaultBio || `Blog personal y publicaciones de ${authorName} en Cuaderno.`}
              rows={3}
              className="resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Resumen que los buscadores muestran bajo el título. Recomendado: 80-160 caracteres.
            </p>
          </div>

          {/* Keywords / Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Palabras Clave Principales (Tags)</Label>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="gap-1 rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-xs text-foreground">
                  #{kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm mt-1.5">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddKeyword()
                  }
                }}
                placeholder="Añadir palabra clave..."
                className="text-sm"
              />
              <Button type="button" size="xs" variant="outline" onClick={handleAddKeyword} className="h-8 cursor-pointer rounded-lg border-border text-sm">
                <Plus className="size-3 mr-1" />
                Añadir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: GEO & Generative AI Crawlers */}
      <Card className="rounded-xl border border-border bg-card ring-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Bot className="size-4 text-ia" />
            GEO (Generative Engine Optimization) & Motores de IA
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Optimiza tu blog para ser citado y consultado por SearchGPT, Perplexity, Gemini y Claude.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-sunken p-3">
            <div className="space-y-0.5 pr-4">
              <Label className="text-sm font-medium text-foreground">
                Permitir rastreo a Motores de IA (GPTBot, PerplexityBot, ClaudeBot)
              </Label>
              <p className="text-xs text-muted-foreground">
                Permite a los asistentes de inteligencia artificial leer tus artículos para sintetizar respuestas directas y citar tu autoría con enlaces de fuente.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowAiCrawlers}
              onChange={(e) => updateField("allowAiCrawlers", e.target.checked)}
              className="size-4 cursor-pointer rounded border-border accent-primary focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-sunken p-3">
            <div className="space-y-0.5 pr-4">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                Generar estándar <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">/llms.txt</code>
              </Label>
              <p className="text-xs text-muted-foreground">
                Genera automáticamente un índice Markdown legible por máquinas con el resumen estructurado de tus artículos y datos de autoría según el protocolo llmstxt.org.
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableLlmsTxt}
              onChange={(e) => updateField("enableLlmsTxt", e.target.checked)}
              className="size-4 cursor-pointer rounded border-border accent-primary focus-visible:ring-ring"
            />
          </div>

          {/* Quick Endpoints Preview Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="cursor-pointer rounded-lg border-border text-xs text-muted-foreground hover:text-foreground"
              render={<a href="/llms.txt" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="mr-1 size-3 text-text-tertiary" />
              Ver /llms.txt global
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="cursor-pointer rounded-lg border-border text-xs text-muted-foreground hover:text-foreground"
              render={<a href={`/${username}/llms.txt`} target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="mr-1 size-3 text-text-tertiary" />
              Ver /{username}/llms.txt
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="cursor-pointer rounded-lg border-border text-xs text-muted-foreground hover:text-foreground"
              render={<a href="/sitemap.xml" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="mr-1 size-3 text-text-tertiary" />
              Ver /sitemap.xml
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="cursor-pointer rounded-lg border-border text-xs text-muted-foreground hover:text-foreground"
              render={<a href="/robots.txt" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="mr-1 size-3 text-text-tertiary" />
              Ver /robots.txt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Geographic SEO & Local Targeting */}
      <Card className="rounded-xl border border-border bg-card ring-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Globe2 className="size-4 text-text-tertiary" />
            SEO Geográfico y Búsqueda Regional (GEO)
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Inyecta metaetiquetas geográficas (<code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs text-foreground">geo.region</code>, <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs text-foreground">geo.position</code>, <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs text-foreground">ICBM</code>) y Schema.org <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs text-foreground">homeLocation</code> para mejorar el ranking en tu país o ciudad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Preajustes Rápidos de Región:</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {Object.entries(GEO_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => handleApplyPreset(key)}
                  className="h-7 cursor-pointer rounded-full border-border text-xs text-foreground"
                >
                  📍 {preset.placename}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="geoCountry" className="text-sm font-medium text-foreground">País</Label>
              <Input
                id="geoCountry"
                value={geoCountry}
                onChange={(e) => updateField("geoCountry", e.target.value)}
                placeholder="España"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="geoCity" className="text-sm font-medium text-foreground">Ciudad / Región</Label>
              <Input
                id="geoCity"
                value={geoCity}
                onChange={(e) => updateField("geoCity", e.target.value)}
                placeholder="Madrid"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="geoCoordinates" className="text-sm font-medium text-foreground">Coordenadas (Lat;Long)</Label>
              <Input
                id="geoCoordinates"
                value={geoCoordinates}
                onChange={(e) => updateField("geoCoordinates", e.target.value)}
                placeholder="40.4168;-3.7038"
                className="font-mono text-sm tabular-nums"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Live Interactive Previews */}
      <Card className="rounded-xl border border-dashed border-border bg-surface-sunken ring-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Sparkles className="size-4 text-text-tertiary" />
            Previsualizador en Tiempo Real
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Comprueba cómo se mostrará tu blog en Google, en asistentes de Inteligencia Artificial y en Redes Sociales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="h-auto w-full justify-start border border-border bg-card p-1">
              <TabsTrigger value="google" className="cursor-pointer gap-1.5 px-3 py-1.5 text-xs data-active:bg-ia-tint data-active:text-ia">
                <Search className="size-3.5 text-text-tertiary" />
                <span>Google SERP</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="cursor-pointer gap-1.5 px-3 py-1.5 text-xs data-active:bg-ia-tint data-active:text-ia">
                <Bot className="size-3.5 text-text-tertiary" />
                <span>Cita en Motores de IA</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="cursor-pointer gap-1.5 px-3 py-1.5 text-xs data-active:bg-ia-tint data-active:text-ia">
                <Share2 className="size-3.5 text-text-tertiary" />
                <span>Tarjeta Social</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Google SERP Preview */}
            <TabsContent value="google" className="mt-4 space-y-3">
              <div className="flex justify-end gap-1.5">
                <Button
                  type="button"
                  size="xs"
                  variant={serpView === "desktop" ? "secondary" : "ghost"}
                  onClick={() => setSerpView("desktop")}
                  className="h-7 cursor-pointer rounded-lg text-xs"
                >
                  <Laptop className="size-3 mr-1" />
                  Escritorio
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant={serpView === "mobile" ? "secondary" : "ghost"}
                  onClick={() => setSerpView("mobile")}
                  className="h-7 cursor-pointer rounded-lg text-xs"
                >
                  <Smartphone className="size-3 mr-1" />
                  Móvil
                </Button>
              </div>

              <div
                className={`rounded-xl border border-border bg-card p-4 font-sans text-card-foreground ${
                  serpView === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}
              >
                {/* Google Brand & URL header */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex size-4 items-center justify-center rounded-full border border-border bg-surface-sunken text-[9px] font-semibold text-foreground">
                    C
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">Cuaderno</span>
                    <span className="max-w-xs truncate font-mono text-xs text-text-tertiary">
                      {blogUrl}
                    </span>
                  </div>
                </div>

                {/* Google Title */}
                <h4 className="mt-2 cursor-pointer text-base leading-snug font-medium text-ia hover:underline sm:text-lg">
                  {metaTitle}
                </h4>

                {/* Google Description */}
                <p className="mt-1 text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2">
                  {metaDescription}
                </p>

                {/* Sitelinks simulation */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-xs text-ia">
                  <span>Artículos recientes</span>
                  <span>Sobre {authorName}</span>
                  <span>Explorar</span>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: AI Engine Answer Preview */}
            <TabsContent value="ai" className="mt-4 space-y-3">
              <div className="space-y-3 rounded-xl border border-ia-border bg-ia-tint p-4 font-sans text-card-foreground">
                <div className="flex items-center gap-2 border-b border-ia-border pb-2">
                  <span className="flex size-5 items-center justify-center rounded-full border border-ia-border bg-card text-ia">
                    <Bot className="size-3" />
                  </span>
                  <span className="text-xs font-semibold text-ia">
                    Síntesis Generativa (Perplexity / SearchGPT / Gemini)
                  </span>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-2">
                  <p>
                    Según la publicación en el blog de <strong>{authorName}</strong> ({geoCity ? `${geoCity}, ${geoCountry}` : "Cuaderno"}):
                  </p>
                  <p className="rounded-lg border border-border bg-card p-3 text-xs italic">
                    "{metaDescription}"
                  </p>
                </div>

                {/* Source Citation Badge */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Fuente verificada:</span>
                  <div className="inline-flex items-center gap-1 rounded-full border border-ia-border bg-card px-2 py-0.5 text-xs font-medium text-ia">
                    <span>1</span>
                    <span>{authorName} · {SITE_CONFIG.name}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Social Card Preview */}
            <TabsContent value="social" className="mt-4 space-y-3">
              <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex h-44 w-full flex-col justify-end border-b border-border bg-surface-sunken p-5">
                  <span className="font-mono text-xs font-semibold tracking-wider uppercase text-foreground">
                    {SITE_CONFIG.name}
                  </span>
                  <h4 className="mt-1 line-clamp-2 font-serif text-lg font-semibold text-foreground">
                    {metaTitle}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">Por {authorName}</p>
                </div>
                <div className="bg-surface-sunken p-3">
                  <span className="font-mono text-xs uppercase text-text-tertiary">CUADERNO.APP</span>
                  <p className="mt-0.5 line-clamp-1 text-xs font-medium text-foreground">
                    {metaTitle}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {metaDescription}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
