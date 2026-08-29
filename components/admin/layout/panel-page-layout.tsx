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
    <div className="flex flex-1 flex-col">
      <AdminTopbar title={title}>{action}</AdminTopbar>
      <div className={cn("flex flex-1 flex-col gap-6 p-6 md:p-8", className)}>
        {children}
      </div>
    </div>
  )
}
