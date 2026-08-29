import * as React from "react"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { cn } from "@/lib/utils"

export interface PanelPageLayoutProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PanelPageLayout({
  title,
  action,
  children,
  className,
}: PanelPageLayoutProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-background">
      <AdminTopbar title={title}>{action}</AdminTopbar>
      <div
        className={cn(
          // Gutter del panel: 16px en móvil, 24px desde md, 40px desde xl.
          // Ancho máximo de contenido 1440px para que las tablas no se estiren.
          "mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-6 px-4 py-6 md:p-6 xl:p-10",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
