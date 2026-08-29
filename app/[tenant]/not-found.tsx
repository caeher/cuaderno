import Link from "next/link"
import { NotFoundView } from "@/components/errors"
import { Button } from "@/components/ui/button"
import { Compass } from "lucide-react"

export default function TenantNotFound() {
  return (
    <NotFoundView
      title="Artículo o página no encontrada"
      description="El artículo o sección que buscas no existe en este blog o ha sido retirado por el autor."
      badge="404 · Blog del autor"
      homeUrl="/"
      homeLabel="Ir a la portada de Cuaderno"
      showBack={true}
      showSuggestions={true}
      customActions={
        <Button
          variant="outline"
          size="default"
          className="gap-2 cursor-pointer"
          render={<Link href="/explorar" />}
        >
          <Compass className="size-4" />
          <span>Explorar otros blogs</span>
        </Button>
      }
    />
  )
}
