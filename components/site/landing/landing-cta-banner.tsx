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
    <SectionContainer>
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-3xl font-medium leading-tight text-balance sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        <Button size="lg" className="mt-8" render={<Link href={buttonHref} />}>
          {buttonText}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </SectionContainer>
  )
}
