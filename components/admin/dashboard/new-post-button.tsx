"use client"

import * as React from "react"
import Link from "next/link"
import { PlusCircle, Palette, FileText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NewPostButton({
  variant = "default",
  size = "sm",
}: {
  variant?: "default" | "outline"
  size?: "sm" | "default"
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size={size} variant={variant} className="cursor-pointer gap-1.5">
            <PlusCircle className="size-4" />
            <span>Nuevo post</span>
            <ChevronDown className="size-3 opacity-60 ml-0.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Elige el modo de creación</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/panel/posts/nuevo" />} className="cursor-pointer py-2">
            <div className="flex size-7 items-center justify-center rounded bg-primary/10 text-primary mr-2">
              <FileText className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-xs">Editor Notion / Tiptap</span>
              <span className="text-[10px] text-muted-foreground">Escritura rápida por bloques</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/panel/posts/nuevo/designer" />}
            className="cursor-pointer py-2 text-violet-600 dark:text-violet-400"
          >
            <div className="flex size-7 items-center justify-center rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 mr-2">
              <Palette className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-xs">Diseñador Visual Studio</span>
              <span className="text-[10px] text-muted-foreground">Lienzo libre estilo Elementor</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
