export interface TimezoneOption {
  value: string
  label: string
  offset: string
  group: string
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // UTC
  { value: "UTC", label: "UTC (Tiempo Universal Coordinado)", offset: "UTC+00:00", group: "Estándar" },

  // España y Europa
  { value: "Europe/Madrid", label: "Madrid / Barcelona / España peninsular", offset: "UTC+01:00", group: "España y Europa" },
  { value: "Atlantic/Canary", label: "Islas Canarias / España", offset: "UTC+00:00", group: "España y Europa" },
  { value: "Europe/Lisbon", label: "Lisboa / Portugal", offset: "UTC+00:00", group: "España y Europa" },
  { value: "Europe/London", label: "Londres / Reino Unido", offset: "UTC+00:00", group: "España y Europa" },
  { value: "Europe/Paris", label: "París / Francia", offset: "UTC+01:00", group: "España y Europa" },
  { value: "Europe/Berlin", label: "Berlín / Alemania", offset: "UTC+01:00", group: "España y Europa" },
  { value: "Europe/Rome", label: "Roma / Italia", offset: "UTC+01:00", group: "España y Europa" },
  { value: "Europe/Amsterdam", label: "Ámsterdam / Países Bajos", offset: "UTC+01:00", group: "España y Europa" },

  // América Latina
  { value: "America/Mexico_City", label: "Ciudad de México / México Centro", offset: "UTC-06:00", group: "América Latina" },
  { value: "America/Cancun", label: "Cancún / Quintana Roo (México)", offset: "UTC-05:00", group: "América Latina" },
  { value: "America/Tijuana", label: "Tijuana / Baja California (México)", offset: "UTC-08:00", group: "América Latina" },
  { value: "America/Bogota", label: "Bogotá / Colombia", offset: "UTC-05:00", group: "América Latina" },
  { value: "America/Lima", label: "Lima / Perú", offset: "UTC-05:00", group: "América Latina" },
  { value: "America/Buenos_Aires", label: "Buenos Aires / Argentina", offset: "UTC-03:00", group: "América Latina" },
  { value: "America/Santiago", label: "Santiago / Chile", offset: "UTC-04:00", group: "América Latina" },
  { value: "America/Sao_Paulo", label: "São Paulo / Brasil", offset: "UTC-03:00", group: "América Latina" },
  { value: "America/Caracas", label: "Caracas / Venezuela", offset: "UTC-04:00", group: "América Latina" },
  { value: "America/Montevideo", label: "Montevideo / Uruguay", offset: "UTC-03:00", group: "América Latina" },
  { value: "America/Guatemala", label: "Guatemala", offset: "UTC-06:00", group: "América Latina" },
  { value: "America/Costa_Rica", label: "San José / Costa Rica", offset: "UTC-06:00", group: "América Latina" },
  { value: "America/Panama", label: "Ciudad de Panamá / Panamá", offset: "UTC-05:00", group: "América Latina" },
  { value: "America/Guayaquil", label: "Guayaquil / Quito (Ecuador)", offset: "UTC-05:00", group: "América Latina" },
  { value: "America/La_Paz", label: "La Paz / Bolivia", offset: "UTC-04:00", group: "América Latina" },
  { value: "America/Asuncion", label: "Asunción / Paraguay", offset: "UTC-04:00", group: "América Latina" },
  { value: "America/Santo_Domingo", label: "Santo Domingo / Rep. Dominicana", offset: "UTC-04:00", group: "América Latina" },
  { value: "America/Havana", label: "La Habana / Cuba", offset: "UTC-05:00", group: "América Latina" },

  // América del Norte
  { value: "America/New_York", label: "Nueva York / Miami (EE.UU. Este)", offset: "UTC-05:00", group: "América del Norte" },
  { value: "America/Chicago", label: "Chicago / Houston (EE.UU. Centro)", offset: "UTC-06:00", group: "América del Norte" },
  { value: "America/Denver", label: "Denver (EE.UU. Montaña)", offset: "UTC-07:00", group: "América del Norte" },
  { value: "America/Los_Angeles", label: "Los Ángeles / San Francisco (EE.UU. Pacífico)", offset: "UTC-08:00", group: "América del Norte" },
  { value: "America/Phoenix", label: "Phoenix / Arizona (EE.UU.)", offset: "UTC-07:00", group: "América del Norte" },
  { value: "America/Toronto", label: "Toronto / Montreal (Canadá)", offset: "UTC-05:00", group: "América del Norte" },

  // Asia y Pacífico
  { value: "Asia/Tokyo", label: "Tokio / Japón", offset: "UTC+09:00", group: "Asia y Pacífico" },
  { value: "Asia/Shanghai", label: "Shanghái / Pekín (China)", offset: "UTC+08:00", group: "Asia y Pacífico" },
  { value: "Asia/Singapore", label: "Singapur", offset: "UTC+08:00", group: "Asia y Pacífico" },
  { value: "Asia/Dubai", label: "Dubái / EAU", offset: "UTC+04:00", group: "Asia y Pacífico" },
  { value: "Australia/Sydney", label: "Sídney / Australia", offset: "UTC+10:00", group: "Asia y Pacífico" },
]

export function formatDate(dateString: string | null | undefined, timeZone?: string): string {
  if (!dateString) return ""
  try {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
    if (timeZone) {
      options.timeZone = timeZone
    }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  } catch {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }
}

export function formatShortDate(dateString: string | null | undefined, timeZone?: string): string {
  if (!dateString) return ""
  try {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    }
    if (timeZone) {
      options.timeZone = timeZone
    }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  } catch {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }
}

export function formatDateTime(dateString: string | null | undefined, timeZone?: string): string {
  if (!dateString) return ""
  try {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    if (timeZone) {
      options.timeZone = timeZone
    }
    return new Date(dateString).toLocaleString("es-ES", options)
  } catch {
    return new Date(dateString).toLocaleString("es-ES")
  }
}

export function getFormattedCurrentTime(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date())
  } catch {
    return new Date().toLocaleString("es-ES")
  }
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return `${value}`
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
