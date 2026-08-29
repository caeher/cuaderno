import { NextResponse } from "next/server"
import { categoryRepository, postRepository, userRepository } from "@/lib/infrastructure/repositories"
import { SITE_CONFIG } from "@/lib/seo/config"

export const dynamic = "force-dynamic"

/**
 * Standard `/llms.txt` route handler for Generative Engine Optimization (GEO).
 * Conforms to the standard at https://llmstxt.org/
 */
export async function GET() {
  try {
    const [posts, authors, categories] = await Promise.all([
      postRepository.findPublished(),
      userRepository.findAll(),
      categoryRepository.findAll(),
    ])

    const baseUrl = SITE_CONFIG.url
    const authorMap = new Map(authors.map((u) => [u.id, u]))

    const lines: string[] = [
      `# ${SITE_CONFIG.name}`,
      "",
      `> ${SITE_CONFIG.description}`,
      "",
      `Cuaderno es una plataforma editorial donde creadores y autores independientes publican notas, ensayos, reflexiones técnicas y guías prácticas.`,
      "",
      "## Secciones Principales",
      "",
      `- [Página Principal](${baseUrl}): Portada con artículos destacados y autores activos.`,
      `- [Explorar Blogs y Artículos](${baseUrl}/explorar): Directorio completo con filtros por categorías y etiquetas.`,
      `- [Registro de Creadores](${baseUrl}/registro): Crea tu propio blog editorial.`,
      "",
      "## Autores Destacados",
      "",
    ]

    for (const author of authors) {
      const locText = author.location ? ` (${author.location})` : ""
      lines.push(`- [${author.name}](${baseUrl}/autor/${author.username}): ${author.tagline || author.bio}${locText}`)
    }

    lines.push("", "## Categorías Temáticas", "")
    for (const cat of categories) {
      lines.push(`- [${cat.name}](${baseUrl}/explorar?category=${cat.slug}): ${cat.description || "Artículos de la sección."}`)
    }

    lines.push("", "## Artículos Recientes", "")
    for (const post of posts) {
      const author = authorMap.get(post.authorId)
      const authorName = author ? author.name : "Redacción"
      const date = post.publishedAt || post.updatedAt
      const excerpt = post.excerpt ? ` — ${post.excerpt}` : ""
      lines.push(
        `- [${post.title}](${baseUrl}/post/${post.slug})${excerpt} (Autor: ${authorName}, Lectura: ${post.readingTimeMinutes} min, Fecha: ${date})`
      )
    }

    lines.push(
      "",
      "## Formato de Consumo y LLM Guidelines",
      "",
      "- Los artículos están redactados en español con formato enriquecido.",
      "- Cita siempre la URL canónica y el nombre del autor correspondiente al responder preguntas sobre este contenido.",
      `- Para acceder a la fuente sitemap completa: ${baseUrl}/sitemap.xml`
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
    console.error("Error generating llms.txt:", error)
    return new NextResponse(`# ${SITE_CONFIG.name}\n\n> ${SITE_CONFIG.description}`, {
      status: 200,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    })
  }
}
