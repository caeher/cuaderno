import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SectionContainer } from "@/components/layout/section-container"
import { Button } from "@/components/ui/button"

export interface LandingCtaBannerProps {
  title?: string
  description?: string
  buttonText?: string
  buttonHref?: string
}

export function LandingCtaBanner({
  title = "Tu primer post está a un formulario de distancia",
  description = "Crea tu cuenta, elige tu nombre de usuario y empieza a escribir hoy mismo. Es gratis.",
  buttonText = "Crear mi blog",
  buttonHref = "/registro",
}: LandingCtaBannerProps) {
  return (
    <SectionContainer bordered={false} className="bg-primary">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance text-primary-foreground sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-primary-foreground/70">
          {description}
        </p>
        <Button
          size="lg"
          className="mt-8 h-12 bg-card px-6 text-base font-semibold text-foreground hover:bg-muted focus-visible:border-primary-foreground/50 focus-visible:ring-primary-foreground/35"
          render={<Link href={buttonHref} />}
        >
          {buttonText}
          <ArrowRight data-icon="inline-end" strokeWidth={1.5} />
        </Button>
      </div>
    </SectionContainer>
  )
}
