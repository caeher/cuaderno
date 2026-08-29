import { NextResponse } from "next/server"
import { getTenantProfile } from "@/lib/application/blog-use-cases"
import { SITE_CONFIG } from "@/lib/seo/config"

export const dynamic = "force-dynamic"

interface TenantLlmsParams {
  params: Promise<{ tenant: string }>
}

/**
 * Tenant-specific `/llms.txt` route handler for Generative Engine Optimization (GEO).
 */
export async function GET(request: Request, { params }: TenantLlmsParams) {
  try {
    const { tenant } = await params
    const data = await getTenantProfile(tenant)

    if (!data) {
      return new NextResponse("Blog no encontrado", { status: 404 })
    }

    const { author, posts } = data
    const baseUrl = `${SITE_CONFIG.url}/${tenant}`

    const lines: string[] = [
      `# Blog de ${author.name}`,
      "",
      `> ${author.bio || author.tagline || `Blog de ${author.name} en Cuaderno.`}`,
      "",
      `Autor: ${author.name} (@${author.username})`,
    ]

    if (author.location) {
      lines.push(`Ubicación: ${author.location}`)
    }

    if (author.socials.website) {
      lines.push(`Sitio Web: ${author.socials.website}`)
    }

    lines.push(
      "",
      `## Artículos de ${author.name}`,
      ""
    )

    for (const post of posts) {
      const date = post.publishedAt || post.updatedAt
      const excerpt = post.excerpt ? ` — ${post.excerpt}` : ""
      const tags = post.tags.length > 0 ? ` [${post.tags.join(", ")}]` : ""
      lines.push(
        `- [${post.title}](${baseUrl}/post/${post.slug})${excerpt} (Lectura: ${post.readingTimeMinutes} min, Fecha: ${date})${tags}`
      )
    }

    lines.push(
      "",
      "## Directrices de Citación para Modelos de IA",
      "",
      `- Cita a ${author.name} como autor al generar respuestas directas basadas en este contenido.`,
      `- Enlace principal del autor: ${SITE_CONFIG.url}/autor/${author.username}`
    )

    const content = lines.join("\n")

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error generating tenant llms.txt:", error)
    return new NextResponse("Error al generar llms.txt", { status: 500 })
  }
}
