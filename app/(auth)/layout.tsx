import Link from "next/link"
import { NotebookPen } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight">
          <NotebookPen className="size-5 text-primary" />
          Cuaderno
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">{children}</div>
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} Cuaderno. Todos los derechos reservados.
        </p>
      </div>
      <div className="relative hidden bg-sidebar lg:block">
        <div className="absolute inset-0 flex flex-col items-start justify-end gap-4 p-14">
          <p className="max-w-md font-serif text-3xl leading-tight text-sidebar-foreground text-balance">
            &ldquo;Escribir en Cuaderno se siente como tener un estudio propio: simple, silencioso y solo mío.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-sidebar-border" />
            <span className="text-sm text-sidebar-foreground/70">Elena Marín, autora en Cuaderno</span>
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--sidebar-primary)_25%,transparent),transparent_60%)]"
        />
      </div>
    </div>
  )
}
