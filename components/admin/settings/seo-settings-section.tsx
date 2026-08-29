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
        <h3 className="text-base font-medium text-foreground flex items-center gap-2">
          <Search className="size-4 text-primary" />
          Optimización SEO y GEO (Generative Engine Optimization)
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configura cómo los motores de búsqueda tradicionales (Google, Bing) y los motores de IA generativa (Perplexity, SearchGPT, Gemini, Claude) descubren, citan y posicionan tu blog.
        </p>
      </div>

      {/* Real-time Health & Audit Score Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-background shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                Puntuación de Salud SEO & GEO
              </CardTitle>
              <CardDescription className="text-xs">
                Auditoría técnica en tiempo real para máxima visibilidad en buscadores y LLMs
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-bold font-mono ${
                    healthScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : healthScore >= 50
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {healthScore}
                </span>
                <span className="text-xs text-muted-foreground font-mono">/100</span>
              </div>
              <Badge
                variant={healthScore >= 80 ? "default" : healthScore >= 50 ? "secondary" : "destructive"}
                className="text-[11px]"
              >
                {healthScore >= 80 ? "Excelente" : healthScore >= 50 ? "Mejorable" : "Requiere atención"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                healthScore >= 80
                  ? "bg-emerald-500"
                  : healthScore >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {auditChecks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-2 rounded-md border transition-colors ${
                  check.passed
                    ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                    : "bg-muted/40 border-border/60 text-muted-foreground"
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{check.title}</p>
                  <p className="text-[11px] text-muted-foreground">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Classic Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe2 className="size-4 text-blue-500" />
            Metadatos SEO del Blog
          </CardTitle>
          <CardDescription className="text-xs">
            Personaliza el título y la descripción con los que tu blog aparece en los resultados de Google y Bing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="metaTitle" className="text-xs font-medium">
                Meta Título del Blog
              </Label>
              <span className={`text-[11px] font-mono ${metaTitle.length > 60 ? "text-amber-500" : "text-muted-foreground"}`}>
                {metaTitle.length}/60 caracteres
              </span>
            </div>
            <Input
              id="metaTitle"
              value={seoSettings.metaTitle ?? ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              placeholder={`${authorName} — Blog de ${authorName}`}
              className="text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Aparece en la pestaña del navegador y como encabezado azul en Google. Recomendado: 30-60 caracteres.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="metaDescription" className="text-xs font-medium">
                Meta Descripción
              </Label>
              <span className={`text-[11px] font-mono ${metaDescription.length > 160 ? "text-amber-500" : "text-muted-foreground"}`}>
                {metaDescription.length}/160 caracteres
              </span>
            </div>
            <Textarea
              id="metaDescription"
              value={seoSettings.metaDescription ?? ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              placeholder={defaultBio || `Blog personal y publicaciones de ${authorName} en Cuaderno.`}
              rows={3}
              className="text-xs resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Resumen que los buscadores muestran bajo el título. Recomendado: 80-160 caracteres.
            </p>
          </div>

          {/* Keywords / Tags */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Palabras Clave Principales (Tags)</Label>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="gap-1 text-xs py-1 px-2.5">
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
                className="text-xs h-8"
              />
              <Button type="button" size="xs" variant="outline" onClick={handleAddKeyword} className="h-8 text-xs cursor-pointer">
                <Plus className="size-3 mr-1" />
                Añadir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: GEO & Generative AI Crawlers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="size-4 text-purple-500" />
            GEO (Generative Engine Optimization) & Motores de IA
          </CardTitle>
          <CardDescription className="text-xs">
            Optimiza tu blog para ser citado y consultado por SearchGPT, Perplexity, Gemini y Claude.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div className="space-y-0.5 pr-4">
              <Label className="text-xs font-medium text-foreground">
                Permitir rastreo a Motores de IA (GPTBot, PerplexityBot, ClaudeBot)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Permite a los asistentes de inteligencia artificial leer tus artículos para sintetizar respuestas directas y citar tu autoría con enlaces de fuente.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowAiCrawlers}
              onChange={(e) => updateField("allowAiCrawlers", e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div className="space-y-0.5 pr-4">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                Generar estándar <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">/llms.txt</code>
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Genera automáticamente un índice Markdown legible por máquinas con el resumen estructurado de tus artículos y datos de autoría según el protocolo llmstxt.org.
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableLlmsTxt}
              onChange={(e) => updateField("enableLlmsTxt", e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Quick Endpoints Preview Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
              render={<a href="/llms.txt" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-3 mr-1 text-purple-500" />
              Ver /llms.txt global
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
              render={<a href={`/${username}/llms.txt`} target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-3 mr-1 text-purple-500" />
              Ver /{username}/llms.txt
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
              render={<a href="/sitemap.xml" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-3 mr-1 text-blue-500" />
              Ver /sitemap.xml
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
              render={<a href="/robots.txt" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-3 mr-1 text-emerald-500" />
              Ver /robots.txt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Geographic SEO & Local Targeting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe2 className="size-4 text-emerald-500" />
            SEO Geográfico y Búsqueda Regional (GEO)
          </CardTitle>
          <CardDescription className="text-xs">
            Inyecta metaetiquetas geográficas (<code className="text-[10px]">geo.region</code>, <code className="text-[10px]">geo.position</code>, <code className="text-[10px]">ICBM</code>) y Schema.org <code className="text-[10px]">homeLocation</code> para mejorar el ranking en tu país o ciudad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Preajustes Rápidos de Región:</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {Object.entries(GEO_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => handleApplyPreset(key)}
                  className="text-[11px] h-7 cursor-pointer"
                >
                  📍 {preset.placename}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="geoCountry" className="text-xs font-medium">País</Label>
              <Input
                id="geoCountry"
                value={geoCountry}
                onChange={(e) => updateField("geoCountry", e.target.value)}
                placeholder="España"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="geoCity" className="text-xs font-medium">Ciudad / Región</Label>
              <Input
                id="geoCity"
                value={geoCity}
                onChange={(e) => updateField("geoCity", e.target.value)}
                placeholder="Madrid"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="geoCoordinates" className="text-xs font-medium">Coordenadas (Lat;Long)</Label>
              <Input
                id="geoCoordinates"
                value={geoCoordinates}
                onChange={(e) => updateField("geoCoordinates", e.target.value)}
                placeholder="40.4168;-3.7038"
                className="text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Live Interactive Previews */}
      <Card className="border-dashed bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            Previsualizador en Tiempo Real
          </CardTitle>
          <CardDescription className="text-xs">
            Comprueba cómo se mostrará tu blog en Google, en asistentes de Inteligencia Artificial y en Redes Sociales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/60">
              <TabsTrigger value="google" className="gap-1.5 text-xs py-1.5 px-3 cursor-pointer">
                <Search className="size-3.5 text-blue-500" />
                <span>Google SERP</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5 text-xs py-1.5 px-3 cursor-pointer">
                <Bot className="size-3.5 text-purple-500" />
                <span>Cita en Motores de IA</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-1.5 text-xs py-1.5 px-3 cursor-pointer">
                <Share2 className="size-3.5 text-pink-500" />
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
                  className="text-xs h-7 cursor-pointer"
                >
                  <Laptop className="size-3 mr-1" />
                  Escritorio
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant={serpView === "mobile" ? "secondary" : "ghost"}
                  onClick={() => setSerpView("mobile")}
                  className="text-xs h-7 cursor-pointer"
                >
                  <Smartphone className="size-3 mr-1" />
                  Móvil
                </Button>
              </div>

              <div
                className={`p-4 rounded-xl border bg-card text-card-foreground shadow-xs font-sans ${
                  serpView === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}
              >
                {/* Google Brand & URL header */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                    C
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-foreground">Cuaderno</span>
                    <span className="text-[11px] text-muted-foreground font-mono truncate max-w-xs">
                      {blogUrl}
                    </span>
                  </div>
                </div>

                {/* Google Title */}
                <h4 className="mt-2 text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
                  {metaTitle}
                </h4>

                {/* Google Description */}
                <p className="mt-1 text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2">
                  {metaDescription}
                </p>

                {/* Sitelinks simulation */}
                <div className="mt-3 pt-2 border-t border-border/40 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-600 dark:text-blue-400">
                  <span>Artículos recientes</span>
                  <span>Sobre {authorName}</span>
                  <span>Explorar</span>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: AI Engine Answer Preview */}
            <TabsContent value="ai" className="mt-4 space-y-3">
              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-card-foreground shadow-xs font-sans space-y-3">
                <div className="flex items-center gap-2 border-b border-purple-500/15 pb-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
                    <Bot className="size-3" />
                  </span>
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Síntesis Generativa (Perplexity / SearchGPT / Gemini)
                  </span>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-2">
                  <p>
                    Según la publicación en el blog de <strong>{authorName}</strong> ({geoCity ? `${geoCity}, ${geoCountry}` : "Cuaderno"}):
                  </p>
                  <p className="bg-background/80 p-3 rounded-lg border border-border/60 text-xs italic">
                    "{metaDescription}"
                  </p>
                </div>

                {/* Source Citation Badge */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground">Fuente verificada:</span>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px] font-medium text-purple-600 dark:text-purple-300">
                    <span>1</span>
                    <span>{authorName} · {SITE_CONFIG.name}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Social Card Preview */}
            <TabsContent value="social" className="mt-4 space-y-3">
              <div className="max-w-md mx-auto rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="h-44 w-full bg-gradient-to-br from-primary/15 via-muted to-primary/5 flex flex-col justify-end p-5 border-b">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                    {SITE_CONFIG.name}
                  </span>
                  <h4 className="mt-1 font-serif text-lg font-bold text-foreground line-clamp-2">
                    {metaTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Por {authorName}</p>
                </div>
                <div className="p-3 bg-muted/20">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">CUADERNO.APP</span>
                  <p className="text-xs font-medium text-foreground line-clamp-1 mt-0.5">
                    {metaTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
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
