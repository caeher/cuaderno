const HOST_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const RESERVED_PROVIDER_SUFFIXES = [
  "localhost",
  "lvh.me",
  "vercel.app",
  "now.sh",
  "convex.site",
  "convex.cloud",
]

function stripOptionalPort(value: string): string | null {
  if (!value.includes(":")) return value
  const match = value.match(/^([^:]+):([0-9]{1,5})$/)
  if (!match) return null
  const port = Number(match[2])
  return port > 0 && port <= 65535 ? match[1]! : null
}

function canonicalHostname(value: string, allowPort: boolean): string | null {
  let candidate = value.trim()
  if (!candidate || /[\u0000-\u0020\u007f\\/?#@]/.test(candidate)) return null
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) return null

  if (allowPort) {
    const withoutPort = stripOptionalPort(candidate)
    if (!withoutPort) return null
    candidate = withoutPort
  } else if (candidate.includes(":")) {
    return null
  }

  if (candidate.endsWith(".")) candidate = candidate.slice(0, -1)
  if (!candidate || candidate.includes("..")) return null

  try {
    candidate = new URL(`http://${candidate}`).hostname.toLowerCase()
  } catch {
    return null
  }

  if (candidate.endsWith(".")) candidate = candidate.slice(0, -1)
  if (candidate.length > 253 || !candidate.includes(".")) return null
  const labels = candidate.split(".")
  if (labels.some((label) => label.length > 63 || !HOST_LABEL.test(label))) return null
  // Reject IPv4 literals, including shortened forms canonicalized by WHATWG URL.
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(candidate)) return null
  return candidate
}

/** Canonical claimant input. Apex and www remain separate hostnames. */
export function normalizeCustomDomainHostname(value: string): string | null {
  return canonicalHostname(value, false)
}

/** Parse a Host header; a request port is removed but never stored as part of a claim. */
export function normalizeCustomDomainHostHeader(value: string | null | undefined): string | null {
  if (!value) return null
  return canonicalHostname(value, true)
}

function normalizePlatformRoot(value: string): string | null {
  let root = value.trim().replace(/^https?:\/\//i, "")
  root = root.split(/[/?#]/, 1)[0] ?? ""
  const rootWithoutPort = stripOptionalPort(root)
  if (!rootWithoutPort) return null
  if (rootWithoutPort.toLowerCase() === "localhost") return "localhost"
  return canonicalHostname(rootWithoutPort, false)
}

/**
 * Validate a normalized custom hostname against the platform's configured root.
 * Missing platform configuration fails closed so a platform hostname is never
 * accidentally accepted as a tenant claim.
 */
export function validateCustomDomainHostname(
  value: string,
  platformRootDomain: string | undefined
): string {
  const hostname = normalizeCustomDomainHostname(value)
  if (!hostname) throw new Error("Introduce un nombre de host válido, sin protocolo, ruta, puerto ni credenciales.")

  const platformRoot = platformRootDomain ? normalizePlatformRoot(platformRootDomain) : null
  if (!platformRoot) {
    throw new Error("El dominio raíz de la plataforma no está configurado para verificar dominios personalizados.")
  }

  if (
    hostname === platformRoot ||
    hostname.endsWith(`.${platformRoot}`) ||
    RESERVED_PROVIDER_SUFFIXES.some((reserved) => hostname === reserved || hostname.endsWith(`.${reserved}`))
  ) {
    throw new Error("Ese host pertenece a la plataforma o está reservado.")
  }

  return hostname
}
