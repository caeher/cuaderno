"use client"

import * as React from "react"
import { useDesigner, type DesignerTab } from "@/components/designer/hooks/use-designer-store"
import { WidgetLibrary } from "@/components/designer/panels/widget-library"
import { BlockInspector } from "@/components/designer/panels/block-inspector"
import { NavigatorPanel } from "@/components/designer/panels/navigator-panel"
import { TemplateLibraryPanel } from "@/components/designer/panels/template-library-panel"
import {
  LayoutGrid,
  SlidersHorizontal,
  Layers,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function SidebarPanel() {
  const { activeTab, setActiveTab, selectedBlockId } = useDesigner()

  const tabs: Array<{ id: DesignerTab; label: string; icon: React.ElementType; badge?: boolean }> = [
    { id: "widgets", label: "Bloques", icon: LayoutGrid },
    { id: "inspector", label: "Inspector", icon: SlidersHorizontal, badge: Boolean(selectedBlockId) },
    { id: "navigator", label: "Capas", icon: Layers },
    { id: "templates", label: "Plantillas", icon: Sparkles },
  ]

  return (
    <aside className="flex h-full w-80 md:w-96 flex-none border-r border-border bg-card shadow-sm z-20">
      {/* Icon Navigation Bar on left edge */}
      <div className="flex w-14 flex-none flex-col items-center gap-2 border-r border-border bg-muted/40 py-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-xl transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <tab.icon className="size-5" />
              {tab.badge && !isActive && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>
          )
        })}
      </div>

      {/* Main Tab View */}
      <div className="flex-1 min-w-0 bg-card overflow-hidden">
        {activeTab === "widgets" && <WidgetLibrary />}
        {activeTab === "inspector" && <BlockInspector />}
        {activeTab === "navigator" && <NavigatorPanel />}
        {activeTab === "templates" && <TemplateLibraryPanel />}
      </div>
    </aside>
  )
}
