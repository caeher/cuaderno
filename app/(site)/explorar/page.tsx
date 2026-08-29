import type { Metadata } from "next"
import { getAllCategories, getAllTags, getPublishedFeed } from "@/lib/application/blog-use-cases"
import { userRepository } from "@/lib/infrastructure/repositories"
import { PageContainer, PageHeader } from "@/components/layout"
import { PostSearchFilter, PostGrid } from "@/components/site/posts"

import { JsonLdScript } from "@/components/seo/json-ld-script"
import { generateBreadcrumbsJsonLd } from "@/lib/seo/json-ld"
import { constructSiteMetadata } from "@/lib/seo/metadata"

interface ExplorarPageProps {
  searchParams: Promise<{ tag?: string; category?: string; q?: string }>
}

export async function generateMetadata({ searchParams }: ExplorarPageProps): Promise<Metadata> {
  const { tag, category, q } = await searchParams

  let title = "Explorar blogs y artículos"
  let description = "Descubre posts publicados por autores y creadores en Cuaderno."

  if (category) {
    title = `Artículos sobre ${category} · Explorar`
    description = `Descubre los mejores artículos de la sección ${category} en Cuaderno.`
  } else if (tag) {
    title = `Posts con etiqueta #${tag} · Explorar`
    description = `Artículos, guías y notas etiquetadas con #${tag} en Cuaderno.`
  } else if (q) {
    title = `Resultados para "${q}" · Explorar`
    description = `Resultados de búsqueda para "${q}" en los blogs de Cuaderno.`
  }

  return constructSiteMetadata({
    title,
    description,
    canonicalPath: "/explorar",
  })
}

export default async function ExplorarPage({ searchParams }: ExplorarPageProps) {
  const { tag, category, q } = await searchParams
  const [posts, tags, categories, authors] = await Promise.all([
    getPublishedFeed({ tag, category, query: q }),
    getAllTags(),
    getAllCategories(),
    userRepository.findAll(),
  ])
  const authorMap = new Map(authors.map((a) => [a.id, a]))

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Explorar", url: "/explorar" },
    ...(category ? [{ name: category, url: `/explorar?category=${category}` }] : []),
    ...(tag ? [{ name: `#${tag}`, url: `/explorar?tag=${tag}` }] : []),
  ])

  return (
    <>
      <JsonLdScript data={breadcrumbsJsonLd} />
      <PageContainer>
        <PageHeader
          title="Explorar"
          description="Posts publicados por autores en Cuaderno, organizados por categorías y etiquetas temáticas."
        />
        <div className="mt-8 flex flex-col gap-6">
          <PostSearchFilter
            tags={tags}
            categories={categories}
            activeTag={tag}
            activeCategory={category}
            searchQuery={q}
          />
          <PostGrid
            posts={posts}
            authorMap={authorMap}
            emptyStatePreset="search"
            className="mt-6"
          />
        </div>
      </PageContainer>
    </>
  )
}

