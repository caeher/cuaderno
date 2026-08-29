"use client"

import * as React from "react"
import { Globe, Clock, Sparkles, MapPin, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import {
  TIMEZONE_OPTIONS,
  formatDate,
  formatDateTime,
  getFormattedCurrentTime,
} from "@/lib/format"

export interface TimezoneSettingsSectionProps {
  timezone: string
  onTimezoneChange: (tz: string) => void
}

export function TimezoneSettingsSection({
  timezone,
  onTimezoneChange,
}: TimezoneSettingsSectionProps) {
  const [currentTime, setCurrentTime] = React.useState("")
  const [searchFilter, setSearchFilter] = React.useState("")

  // Update clock every second
  React.useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getFormattedCurrentTime(timezone || "UTC"))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [timezone])

  // Detect user's browser timezone
  const handleAutoDetect = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected) {
        onTimezoneChange(detected)
        toast.success(`Zona horaria detectada: ${detected}`)
      } else {
        toast.error("No se pudo detectar la zona horaria del navegador")
      }
    } catch {
      toast.error("Error al detectar la zona horaria")
    }
  }

  // Grouped options for select
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, typeof TIMEZONE_OPTIONS> = {}
    for (const opt of TIMEZONE_OPTIONS) {
      if (!groups[opt.group]) {
        groups[opt.group] = []
      }
      groups[opt.group].push(opt)
    }
    return groups
  }, [])

  const selectedOption = TIMEZONE_OPTIONS.find((opt) => opt.value === timezone)

  return (
    <FieldSet className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <FieldLegend className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Globe className="size-4 text-text-tertiary" />
            Zona Horaria y Región
          </FieldLegend>
          <FieldDescription className="text-sm text-muted-foreground">
            Configura la zona horaria del blog para la publicación programada y el cálculo de fechas.
          </FieldDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoDetect}
          className="cursor-pointer gap-1.5 text-xs"
        >
          <Sparkles className="size-3.5 text-ia" />
          Detectar mi zona horaria
        </Button>
      </div>

      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="timezone-select">Zona Horaria Predeterminada</FieldLabel>
          <select
            id="timezone-select"
            value={timezone || "UTC"}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {/* If the current timezone is not in the predefined list (e.g. from browser auto-detect), show it at top */}
            {!TIMEZONE_OPTIONS.some((o) => o.value === timezone) && timezone && (
              <option value={timezone}>
                {timezone} (Detectada)
              </option>
            )}

            {Object.entries(groupedOptions).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    [{opt.offset}] {opt.label} ({opt.value})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <FieldDescription>
            {selectedOption ? (
              <span className="mt-1 flex items-center gap-1.5 font-medium text-muted-foreground">
                <MapPin className="size-3 text-text-tertiary" />
                Desplazamiento actual: <strong>{selectedOption.offset}</strong> — {selectedOption.label}
              </span>
            ) : (
              <span>Zona IANA activa: <code>{timezone || "UTC"}</code></span>
            )}
          </FieldDescription>
        </Field>

        {/* Live Clock and Date Preview Card */}
        <div className="rounded-xl border border-border bg-surface-sunken p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                <Clock className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Hora en vivo en el blog
                </span>
                <span className="font-mono text-base font-bold capitalize tabular-nums text-foreground">
                  {currentTime || "Cargando..."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-card px-2.5 py-1 font-mono text-xs">
                {timezone || "UTC"}
              </Badge>
            </div>
          </div>

          <div className="mt-3 grid gap-2 border-t border-border pt-3 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 text-text-tertiary" />
              <span>Ejemplo formato largo:</span>
              <strong className="text-foreground">{formatDate(new Date().toISOString(), timezone)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-text-tertiary" />
              <span>Ejemplo post / log:</span>
              <strong className="text-foreground">{formatDateTime(new Date().toISOString(), timezone)}</strong>
            </div>
          </div>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
