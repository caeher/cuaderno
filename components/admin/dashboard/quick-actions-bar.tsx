"use client"

import * as React from "react"
import Link from "next/link"
import { PlusCircle, Palette, MessageSquare, Globe, Settings } from "lucide-react"

export interface QuickActionsBarProps {
  authorUsername?: string
}

export function QuickActionsBar({ authorUsername = "admin" }: QuickActionsBarProps) {
  const actions = [
    {
      href: "/panel/posts/nuevo",
      icon: PlusCircle,
      title: "Nueva entrada",
      description: "Empieza a escribir ahora mismo.",
      external: false,
    },
    {
      href: "/panel/disenador",
      icon: Palette,
      title: "Diseñador visual",
      description: "Ajusta el aspecto de tu blog.",
      external: false,
    },
    {
      href: "/panel/comentarios",
      icon: MessageSquare,
      title: "Comentarios",
      description: "Responde a tus lectores.",
      external: false,
    },
    {
      href: `/autor/${authorUsername}`,
      icon: Globe,
      title: "Ver blog",
      description: "Ábrelo como lo ven tus lectores.",
      external: true,
    },
    {
      href: "/panel/configuracion",
      icon: Settings,
      title: "Ajustes",
      description: "Dominio, SEO y preferencias.",
      external: false,
    },
  ]

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-medium text-foreground">Acciones rápidas</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ia-border hover:bg-ia-tint"
            >
              <span className="flex size-12 items-center justify-center rounded-lg bg-surface-sunken text-foreground transition-colors group-hover:bg-card group-hover:text-ia">
                <Icon className="size-6" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{action.title}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
