import * as React from "react"

export interface JsonLdScriptProps {
  data: Record<string, any> | Array<Record<string, any>>
}

/**
 * Safe JSON-LD script renderer for Server Components.
 * Escapes '<' to prevent XSS injection according to Next.js best practices.
 */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  if (!data) return null

  const sanitizedJson = JSON.stringify(data).replace(/</g, "\\u003c")

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJson }}
    />
  )
}
