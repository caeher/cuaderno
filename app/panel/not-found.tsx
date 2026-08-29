import Link from "next/link"
import { FileQuestion, ArrowLeft, LayoutDashboard, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PanelNotFound() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex max-w-lg flex-col items-center">
        <div className="relative mb-6 flex size-18 items-center justify-center rounded-2xl border border-border bg-card shadow-xs">
          <FileQuestion className="size-9 text-primary/80 stroke-[1.5]" />
          <span className="absolute -bottom-2 -right-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-[11px] font-mono font-medium text-muted-foreground shadow-xs">
            404
          </span>
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Panel de administración
        </div>

        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Recurso o post no encontrado
        </h1>

        <p className="mt-2.5 max-w-md text-sm text-muted-foreground leading-relaxed">
          El artículo, borrador o sección del panel que estás buscando no existe, ha sido eliminado o pertenece a otra cuenta.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="default"
            size="sm"
            className="gap-2 cursor-pointer"
            render={<Link href="/panel/posts" />}
          >
            <FileText className="size-4" />
            <span>Ver mis posts</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer"
            render={<Link href="/panel/posts/nuevo" />}
          >
            <Plus className="size-4" />
            <span>Crear nuevo post</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 cursor-pointer"
            render={<Link href="/panel" />}
          >
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
