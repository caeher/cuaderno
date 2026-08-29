"use client"

import * as React from "react"
import Link from "next/link"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "../utils/style-converter"
import { useTemplateContext } from "@/components/site/template-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"

export function SiteNavbarBlock({ node }: { node: BlockNode }) {
  const css = blockStyleToCss(node.style)
  const { global } = useTemplateContext()

  const tenant = global?.tenant || {
    name: "Cuaderno Blog",
    avatarUrl: "/placeholder.svg",
    username: "cuaderno",
    tagline: "Historias y diseño",
  }

  const homeUrl = global?.homeUrl || "/"

  return (
    <header
      style={css}
      className={cn(
        "site-navbar-widget w-full flex items-center justify-between gap-4 border-b border-border/40",
        node.style?.customClass
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
          <AvatarFallback>{getInitials(tenant.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-serif font-bold text-sm text-foreground">{tenant.name}</span>
          {tenant.tagline && (
            <span className="text-[11px] text-muted-foreground">{tenant.tagline}</span>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <Link href={homeUrl} className="hover:text-foreground transition-colors">
          Inicio
        </Link>
        <Link href={`${homeUrl}#articulos`} className="hover:text-foreground transition-colors">
          Artículos
        </Link>
        <Link href={`${homeUrl}#autor`} className="hover:text-foreground transition-colors">
          Sobre mí
        </Link>
      </nav>
    </header>
  )
}
