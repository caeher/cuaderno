"use client"

import * as React from "react"
import Link from "next/link"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { cn } from "@/lib/utils"

export function SiteFooterBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { global } = useTemplateContext()

  const tenant = global?.tenant || {
    name: "Cuaderno Blog",
    username: "cuaderno",
  }

  const showLegalLinks = node.props?.showLegalLinks ?? true
  const copyrightText =
    node.props?.copyrightText || `© ${new Date().getFullYear()} ${tenant.name}. Todos los derechos reservados.`

  return (
    <footer
      style={css}
      className={cn(
        "site-footer-widget w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground border-t border-border/40 py-8",
        node.style?.customClass
      )}
    >
      <div>{copyrightText}</div>

      {showLegalLinks && (
        <div className="flex items-center gap-4">
          <Link href="/legal/privacidad" className="hover:text-foreground transition-colors">
            Privacidad
          </Link>
          <Link href="/legal/terminos" className="hover:text-foreground transition-colors">
            Términos
          </Link>
          <Link href="/legal/cookies" className="hover:text-foreground transition-colors">
            Cookies
          </Link>
        </div>
      )}
    </footer>
  )
}
