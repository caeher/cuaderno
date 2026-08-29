"use client"

import * as React from "react"
import type { GlobalTemplateContext, HomeSlotContext, PostSlotContext, TemplateSlotType } from "@/lib/domain/template-schema"

export interface TemplateContextValue {
  slotType: TemplateSlotType
  global?: GlobalTemplateContext
  home?: HomeSlotContext
  post?: PostSlotContext
  isStudioCanvas?: boolean
}

const TemplateContext = React.createContext<TemplateContextValue | null>(null)

export function TemplateContextProvider({
  value,
  children,
}: {
  value: TemplateContextValue
  children: React.ReactNode
}) {
  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
}

export function useTemplateContext(): TemplateContextValue {
  const ctx = React.useContext(TemplateContext)
  if (!ctx) {
    // Return dummy fallback if rendered outside a provider (e.g. standalone canvas)
    return {
      slotType: "home",
      isStudioCanvas: true,
    }
  }
  return ctx
}
