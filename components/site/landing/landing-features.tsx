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
    <SectionContainer id="como-funciona" className="rounded-t-xl bg-card">
      <SectionHeading
        eyebrow="Cómo funciona"
        title="Tres pasos entre tu idea y tu primer lector"
        description="Sin plantillas que configurar ni plugins que mantener. Solo lo esencial para escribir y publicar."
      />
      <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {DEFAULT_STEPS.map((step) => (
          <div key={step.title} className="grid grid-cols-[3rem_1fr] items-start gap-x-4 gap-y-0 sm:block">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-surface-sunken">
              <step.icon className="size-6 text-muted-foreground" strokeWidth={1.5} />
            </span>
            <div className="sm:mt-4">
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  )
}
