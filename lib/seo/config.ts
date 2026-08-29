/**
 * SEO & GEO Configuration & Constants
 *
 * Central configuration for metadata, Generative Engine Optimization (GEO),
 * and Geographic / Local search parameters.
 */

export const SITE_CONFIG = {
  name: "Cuaderno",
  tagline: "Escribe, publica y haz crecer tu propio blog",
  description:
    "Cuaderno es la plataforma editorial moderna para autores independientes y equipos. Publica artículos con diseño editorial, optimización SEO de primer nivel y preparación nativa para motores de búsqueda de IA.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://cuaderno.app",
  locale: "es_ES",
  alternateLocales: ["es_MX", "es_CL", "es_CO", "es_AR", "es_PE"],
  twitterHandle: "@cuaderno",
  creator: "Cuaderno Editorial",
  defaultKeywords: [
    "blog",
    "publicación editorial",
    "artículos de tecnología",
    "diseño de producto",
    "ingeniería de software",
    "gastronomía",
    "running",
    "escritura digital",
    "cuaderno blog",
  ],
}

/**
 * Common geographic presets for Spanish-speaking regions.
 * Used to automatically populate `geo.region`, `geo.placename`, `geo.position`, and `ICBM`.
 */
export interface GeoPreset {
  country: string
  regionCode: string // ISO 3166-2
  placename: string
  coordinates: string // "latitude;longitude"
  countryCode: string
}

export const GEO_PRESETS: Record<string, GeoPreset> = {
  madrid: {
    country: "España",
    countryCode: "ES",
    regionCode: "ES-MD",
    placename: "Madrid, España",
    coordinates: "40.4168;-3.7038",
  },
  barcelona: {
    country: "España",
    countryCode: "ES",
    regionCode: "ES-CT",
    placename: "Barcelona, España",
    coordinates: "41.3879;2.1699",
  },
  mexico_city: {
    country: "México",
    countryCode: "MX",
    regionCode: "MX-CMX",
    placename: "Ciudad de México, México",
    coordinates: "19.4326;-99.1332",
  },
  oaxaca: {
    country: "México",
    countryCode: "MX",
    regionCode: "MX-OAX",
    placename: "Oaxaca, México",
    coordinates: "17.0732;-96.7266",
  },
  santiago: {
    country: "Chile",
    countryCode: "CL",
    regionCode: "CL-RM",
    placename: "Santiago, Chile",
    coordinates: "-33.4489;-70.6693",
  },
  bogota: {
    country: "Colombia",
    countryCode: "CO",
    regionCode: "CO-DC",
    placename: "Bogotá, Colombia",
    coordinates: "4.7110;-74.0721",
  },
  buenos_aires: {
    country: "Argentina",
    countryCode: "AR",
    regionCode: "AR-C",
    placename: "Buenos Aires, Argentina",
    coordinates: "-34.6037;-58.3816",
  },
  lima: {
    country: "Perú",
    countryCode: "PE",
    regionCode: "PE-LIM",
    placename: "Lima, Perú",
    coordinates: "-12.0464;-77.0428",
  },
}

/**
 * Finds matching geographic preset by search string (e.g. "Madrid", "Barcelona, España", "Ciudad de México")
 */
export function resolveGeoLocation(locationString?: string | null): GeoPreset | null {
  if (!locationString) return null
  const normalized = locationString.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  for (const preset of Object.values(GEO_PRESETS)) {
    const presetNorm = preset.placename.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (normalized.includes(presetNorm) || presetNorm.includes(normalized)) {
      return preset
    }
  }

  // Fallback checks for common country/city names
  if (normalized.includes("madrid") || normalized.includes("espana") || normalized.includes("spain")) {
    return GEO_PRESETS.madrid
  }
  if (normalized.includes("barcelona") || normalized.includes("catalunya")) {
    return GEO_PRESETS.barcelona
  }
  if (normalized.includes("mexico") || normalized.includes("cdmx")) {
    return GEO_PRESETS.mexico_city
  }
  if (normalized.includes("oaxaca")) {
    return GEO_PRESETS.oaxaca
  }
  if (normalized.includes("santiago") || normalized.includes("chile")) {
    return GEO_PRESETS.santiago
  }
  if (normalized.includes("bogota") || normalized.includes("colombia")) {
    return GEO_PRESETS.bogota
  }
  if (normalized.includes("buenos aires") || normalized.includes("argentina")) {
    return GEO_PRESETS.buenos_aires
  }
  if (normalized.includes("lima") || normalized.includes("peru")) {
    return GEO_PRESETS.lima
  }

  return null
}

/**
 * List of known Generative AI Crawler User-Agents for GEO policies.
 */
export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Cohere-ai",
  "Diffbot",
  "Bytespider",
  "FacebookBot",
]
