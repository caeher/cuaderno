import * as React from "react"
import { Globe2, LayoutDashboard, PenLine } from "lucide-react"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/site/section-heading"

const DEFAULT_STEPS = [
  {
    icon: PenLine,
    title: "Escribe sin fricción",
    description:
      "Un editor limpio para redactar tus posts, guardar borradores y programar publicaciones cuando estés listo.",
  },
  {
    icon: Globe2,
    title: "Subdominio o URL propia",
    description:
      "Tu blog en tu propio subdominio (ej: autor.cuaderno.app) o bajo ruta amigable — listo para compartir y posicionar.",
  },
  {
    icon: LayoutDashboard,
    title: "Gestiona todo desde un panel",
    description: "Estadísticas, comentarios y estado de cada post, organizado en un panel administrativo simple.",
  },
]

export function LandingFeatures() {
  return (
    <SectionContainer id="como-funciona" bordered={false}>
      <SectionHeading
        eyebrow="Cómo funciona"
        title="Tres pasos entre tu idea y tu primer lector"
        description="Sin plantillas que configurar ni plugins que mantener. Solo lo esencial para escribir y publicar."
      />
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {DEFAULT_STEPS.map((step, index) => (
          <div key={step.title} className="relative border-t border-border pt-6">
            <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            <step.icon className="mt-4 size-5 text-primary" />
            <h3 className="mt-4 font-serif text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  )
}
