import * as React from "react"
import type { User } from "@/lib/domain/entities"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/site/section-heading"
import { AuthorCard } from "@/components/site/authors/author-card"

export interface AuthorShowcaseSectionProps {
  authors: User[]
  title?: string
  eyebrow?: string
  description?: string
}

export function AuthorShowcaseSection({
  authors,
  title = "Conoce a quienes ya publican en Cuaderno",
  eyebrow = "Autores",
  description = "Cada uno con su propio espacio, su propio tono y su propia comunidad de lectores.",
}: AuthorShowcaseSectionProps) {
  return (
    <SectionContainer id="autores">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {authors.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </SectionContainer>
  )
}
