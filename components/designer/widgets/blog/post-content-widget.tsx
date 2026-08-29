"use client"

import * as React from "react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { PostContent } from "@/components/site/posts/post-content"
import { cn } from "@/lib/utils"

export function PostContentBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { post, isStudioCanvas } = useTemplateContext()

  const content = post?.post?.content || (isStudioCanvas ? `
# El renacer del diseño editorial en la era digital

El diseño de contenidos en la web ha evolucionado drásticamente. Lo que antes eran columnas rígidas hoy son lienzos modulares capaces de comunicar ideas complejas con claridad y elegancia.

## La importancia del ritmo y la jerarquía

Cuando un lector se sumerge en un ensayo largo, el diseño debe acompañar la lectura sin distraer. Los espacios en blanco, las citas destacadas y la tipografía equilibrada son los verdaderos pilares de la experiencia.

- Tipografía legible adaptada a cualquier tamaño de pantalla.
- Bloques de código con sintaxis resaltada y soporte para múltiples lenguajes.
- Inserción de imágenes con pies de foto explicativos.

> "El buen diseño no es cómo se ve, sino cómo funciona y qué emociones despierta en quien lo usa."
  `.trim() : "")

  return (
    <div style={css} className={cn("post-content-widget w-full", node.style?.customClass)}>
      {content ? (
        <PostContent content={content} />
      ) : (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
          {node.props?.placeholderText || "El contenido del artículo se renderizará automáticamente aquí."}
        </div>
      )}
    </div>
  )
}
