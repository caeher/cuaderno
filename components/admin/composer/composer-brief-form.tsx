"use client"

import * as React from "react"
import {
  Sparkles,
  SlidersHorizontal,
  Globe,
  Tag,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { ComposerBrief } from "@/lib/domain/entities"

export interface ComposerBriefFormProps {
  initialBrief?: ComposerBrief
  isSubmitting?: boolean
  disabled?: boolean
  onSubmit: (brief: ComposerBrief) => void
  className?: string
}

const OBJECTIVE_PRESETS = [
  "Tutorial técnico paso a paso",
  "Análisis comparativo de tecnologías",
  "Guía práctica para principiantes",
  "Opinión editorial informada",
  "Resumen de tendencias y novedades",
]

const AUDIENCE_PRESETS = [
  "Desarrolladores de software",
  "Diseñadores y creadores",
  "Emprendedores y fundadores",
  "Lectores y público general",
  "Equipos técnicos avanzados",
]

const TONE_PRESETS = [
  "Profesional y accesible",
  "Técnico y riguroso",
  "Divulgativo y cercano",
  "Inspiracional y motivador",
  "Periodístico e imparcial",
]

const LENGTH_PRESETS = [
  { label: "Corto (~600 palabras)", value: 600 },
  { label: "Estándar (~1,200 palabras)", value: 1200 },
  { label: "Extenso (~2,000 palabras)", value: 2000 },
  { label: "Guía completa (~3,000 palabras)", value: 3000 },
]

export function ComposerBriefForm({
  initialBrief = {},
  isSubmitting = false,
  disabled = false,
  onSubmit,
  className = "",
}: ComposerBriefFormProps) {
  const [topic, setTopic] = React.useState(initialBrief.topic || "")
  const [objective, setObjective] = React.useState(initialBrief.objective || OBJECTIVE_PRESETS[0])
  const [audience, setAudience] = React.useState(initialBrief.audience || AUDIENCE_PRESETS[0])
  const [tone, setTone] = React.useState(initialBrief.tone || TONE_PRESETS[0])
  const [language, setLanguage] = React.useState(initialBrief.language || "es")
  const [targetLength, setTargetLength] = React.useState(initialBrief.targetLength || 1200)
  const [cutoffDate, setCutoffDate] = React.useState(initialBrief.cutoffDate || "2026-01-01")
  const [wantsCoverImage, setWantsCoverImage] = React.useState(initialBrief.wantsCoverImage !== false)
  const [wantsExtraImages, setWantsExtraImages] = React.useState(initialBrief.wantsExtraImages || false)

  // Advanced options
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [preferredDomainsInput, setPreferredDomainsInput] = React.useState(
    (initialBrief.preferredDomains || []).join(", ")
  )
  const [excludedDomainsInput, setExcludedDomainsInput] = React.useState(
    (initialBrief.excludedDomains || []).join(", ")
  )
  const [seoKeywordsInput, setSeoKeywordsInput] = React.useState(
    (initialBrief.seoKeywords || []).join(", ")
  )
  const [constraints, setConstraints] = React.useState(initialBrief.constraints || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    const preferredDomains = preferredDomainsInput
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean)

    const excludedDomains = excludedDomainsInput
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean)

    const seoKeywords = seoKeywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)

    const brief: ComposerBrief = {
      topic: topic.trim(),
      objective: objective.trim(),
      audience: audience.trim(),
      tone: tone.trim(),
      language: language.trim(),
      targetLength: Number(targetLength),
      cutoffDate: cutoffDate.trim() || undefined,
      wantsCoverImage,
      wantsExtraImages,
      preferredDomains: preferredDomains.length > 0 ? preferredDomains : undefined,
      excludedDomains: excludedDomains.length > 0 ? excludedDomains : undefined,
      seoKeywords: seoKeywords.length > 0 ? seoKeywords : undefined,
      constraints: constraints.trim() || undefined,
    }

    onSubmit(brief)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-5 ${className}`}>
      {/* 1. Tema Principal */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="composer-topic" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          Tema o idea del artículo *
        </Label>
        <Input
          id="composer-topic"
          placeholder="Ej. Novedades y arquitectura de agentes en Next.js 16..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={disabled || isSubmitting}
          required
          className="text-sm font-medium"
        />
        <p className="text-[11px] text-muted-foreground">
          Indica el concepto central sobre el que Composer realizará la investigación y redacción.
        </p>
      </div>

      {/* 2. Objetivo Editorial */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold text-foreground">Objetivo del post</Label>
        <div className="flex flex-wrap gap-1.5">
          {OBJECTIVE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setObjective(preset)}
              disabled={disabled || isSubmitting}
              className={`rounded-md border px-2.5 py-1 text-xs transition-all cursor-pointer ${
                objective === preset
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <Input
          placeholder="O define un objetivo personalizado..."
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          disabled={disabled || isSubmitting}
          className="text-xs"
        />
      </div>

      {/* 3. Audiencia y Tono en 2 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold text-foreground">Audiencia objetivo</Label>
          <div className="flex flex-wrap gap-1.5">
            {AUDIENCE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAudience(preset)}
                disabled={disabled || isSubmitting}
                className={`rounded-md border px-2 py-1 text-[11px] transition-all cursor-pointer ${
                  audience === preset
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold text-foreground">Tono editorial</Label>
          <div className="flex flex-wrap gap-1.5">
            {TONE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTone(preset)}
                disabled={disabled || isSubmitting}
                className={`rounded-md border px-2 py-1 text-[11px] transition-all cursor-pointer ${
                  tone === preset
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Longitud e Idioma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold text-foreground">Longitud sugerida</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {LENGTH_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setTargetLength(preset.value)}
                disabled={disabled || isSubmitting}
                className={`rounded-md border p-2 text-left text-xs transition-all cursor-pointer ${
                  targetLength === preset.value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="composer-lang" className="text-xs font-semibold text-foreground">
              Idioma del artículo
            </Label>
            <select
              id="composer-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={disabled || isSubmitting}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="es">Español (predeterminado)</option>
              <option value="en">Inglés (English)</option>
              <option value="pt">Portugués</option>
              <option value="fr">Francés</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/70 p-2.5 bg-muted/20">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-purple-500" />
                Generar portada visual
              </span>
              <span className="text-[10px] text-muted-foreground">
                Crea una portada panorámica con IA adaptada al tema
              </span>
            </div>
            <Switch
              checked={wantsCoverImage}
              onCheckedChange={setWantsCoverImage}
              disabled={disabled || isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 5. Acordeón de Opciones Avanzadas */}
      <div className="rounded-lg border border-border/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between bg-muted/30 p-3 text-xs font-medium text-foreground hover:bg-muted/50 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            Opciones avanzadas de investigación y SEO
          </span>
          {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-4 p-4 border-t border-border/60 bg-card">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Globe className="size-3" /> Dominios prioritarios (separados por coma)
              </Label>
              <Input
                placeholder="acm.org, ieee.org, github.com, nature.com..."
                value={preferredDomainsInput}
                onChange={(e) => setPreferredDomainsInput(e.target.value)}
                disabled={disabled || isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Dominios a excluir (separados por coma)
              </Label>
              <Input
                placeholder="pinterest.com, reddit.com..."
                value={excludedDomainsInput}
                onChange={(e) => setExcludedDomainsInput(e.target.value)}
                disabled={disabled || isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Tag className="size-3" /> Palabras clave SEO
              </Label>
              <Input
                placeholder="Next.js 16, AI Agents, Convex, TipTap..."
                value={seoKeywordsInput}
                onChange={(e) => setSeoKeywordsInput(e.target.value)}
                disabled={disabled || isSubmitting}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Restricciones editoriales o directivas específicas
              </Label>
              <Textarea
                placeholder="Ej. No incluir menciones a marcas de la competencia, enfocar en TypeScript estricto..."
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                disabled={disabled || isSubmitting}
                rows={2}
                className="text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. Submit Button */}
      <Button
        type="submit"
        disabled={disabled || isSubmitting || !topic.trim()}
        className="cursor-pointer gap-2 text-sm font-semibold py-5 shadow-xs"
      >
        <Sparkles className="size-4" />
        {isSubmitting ? "Configurando sesión..." : "Iniciar investigación asistida"}
      </Button>
    </form>
  )
}
