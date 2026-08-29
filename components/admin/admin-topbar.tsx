import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import type { ReactNode } from "react"

export function AdminTopbar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1 size-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" />
      <Separator orientation="vertical" className="h-5 bg-border" />
      <h1 className="flex-1 truncate text-[15px] font-medium tracking-tight text-foreground">
        {title}
      </h1>
      {children}
    </header>
  )
}
