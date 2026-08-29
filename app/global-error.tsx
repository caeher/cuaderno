"use client"

import * as React from "react"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  retry: () => void
  reset?: () => void
}

export default function GlobalError({ error, retry, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    console.error("[Global Fatal Error]:", error)
  }, [error])

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry()
    } else if (typeof reset === "function") {
      reset()
    } else if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  return (
    <html lang="es">
      <head>
        <title>Error Crítico · Cuaderno</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="m-0 flex min-h-screen items-center justify-center bg-[#faf9f7] font-sans text-[#1a1c23] antialiased p-6">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 shadow-xs">
            <AlertTriangle className="size-8 stroke-[1.75]" />
          </div>

          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            Error crítico del sistema
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
            Error en la aplicación
          </h1>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Ha ocurrido un problema crítico al inicializar la estructura principal del sitio. Intenta recargar la página o volver a la portada.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
              Código de error: {error.digest}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-[#27408B] px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-[#1E3270] transition-colors cursor-pointer"
            >
              <RotateCcw className="size-4" />
              Recargar página
            </button>

            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
            >
              <Home className="size-4" />
              Ir al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
