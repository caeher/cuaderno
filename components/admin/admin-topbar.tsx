import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import type { ReactNode } from "react"

export function AdminTopbar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="flex-1 truncate text-sm font-medium text-foreground">{title}</h1>
      {children}
    </header>
  )
}
