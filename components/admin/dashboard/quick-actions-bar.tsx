"use client"

import * as React from "react"
import Link from "next/link"
import { PlusCircle, Palette, MessageSquare, Globe, Settings, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface QuickActionsBarProps {
  authorUsername?: string
}

export function QuickActionsBar({ authorUsername = "admin" }: QuickActionsBarProps) {
  return (
    <Card className="bg-gradient-to-r from-card via-card to-muted/30 border-dashed">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones directas</h4>
            <p className="text-xs text-foreground font-medium">¿Qué quieres hacer hoy?</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" render={<Link href="/panel/posts/nuevo" />}>
            <PlusCircle data-icon="inline-start" />
            Nuevo post
          </Button>

          <Button size="sm" variant="outline" className="text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/30" render={<Link href="/panel/posts/nuevo/designer" />}>
            <Palette data-icon="inline-start" />
            Diseñador Visual
          </Button>

          <Button size="sm" variant="outline" render={<Link href="/panel/comentarios" />}>
            <MessageSquare data-icon="inline-start" />
            Comentarios
          </Button>

          <Button size="sm" variant="ghost" render={<Link href={`/autor/${authorUsername}`} target="_blank" rel="noreferrer" />}>
            <Globe data-icon="inline-start" />
            Ver blog
          </Button>

          <Button size="sm" variant="ghost" render={<Link href="/panel/configuracion" />}>
            <Settings data-icon="inline-start" />
            Ajustes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
