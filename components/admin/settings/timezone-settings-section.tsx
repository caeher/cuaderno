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
    <FieldSet>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <FieldLegend className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            Zona Horaria y Región
          </FieldLegend>
          <FieldDescription>
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
          <Sparkles className="size-3.5 text-amber-500" />
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
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
              <span className="flex items-center gap-1.5 mt-1 font-medium text-foreground/80">
                <MapPin className="size-3 text-primary" />
                Desplazamiento actual: <strong>{selectedOption.offset}</strong> — {selectedOption.label}
              </span>
            ) : (
              <span>Zona IANA activa: <code>{timezone || "UTC"}</code></span>
            )}
          </FieldDescription>
        </Field>

        {/* Live Clock and Date Preview Card */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Hora en vivo en el blog
                </span>
                <span className="font-mono text-base font-bold text-foreground capitalize">
                  {currentTime || "Cargando..."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-background/80 px-2.5 py-1">
                {timezone || "UTC"}
              </Badge>
            </div>
          </div>

          <div className="mt-3 grid gap-2 border-t border-border/50 pt-3 sm:grid-cols-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span>Ejemplo formato largo:</span>
              <strong className="text-foreground">{formatDate(new Date().toISOString(), timezone)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>Ejemplo post / log:</span>
              <strong className="text-foreground">{formatDateTime(new Date().toISOString(), timezone)}</strong>
            </div>
          </div>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
