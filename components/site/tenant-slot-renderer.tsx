import * as React from "react"
import type {
  GlobalTemplateContext,
  HomeSlotContext,
  PostSlotContext,
  TemplateSlotType,
  TenantTemplate,
} from "@/lib/domain/template-schema"
import { validateAndNormalizeBlockTree } from "@/lib/domain/template-validator"
import { BlockRenderer } from "./block-renderer"
import { TemplateContextProvider, type TemplateContextValue } from "./template-context"

export interface TenantSlotRendererProps {
  slotType: TemplateSlotType
  template: TenantTemplate | null | undefined
  context: HomeSlotContext | PostSlotContext | GlobalTemplateContext
  fallback: React.ReactNode
  className?: string
}

/**
 * Server-safe slot renderer for published tenant templates.
 *
 * Renders the published block tree for the requested slot type if available,
 * valid, and non-empty. Otherwise, transparently falls back to the default classic theme.
 */
export function TenantSlotRenderer({
  slotType,
  template,
  context,
  fallback,
  className,
}: TenantSlotRendererProps) {
  // 1. If no template exists or it's not published, render default theme fallback
  if (!template || !template.isPublished || !template.publishedSlots) {
    return <>{fallback}</>
  }

  const rawBlocks = template.publishedSlots[slotType]

  // 2. If the specific slot has no blocks, render fallback
  if (!rawBlocks || !Array.isArray(rawBlocks) || rawBlocks.length === 0) {
    return <>{fallback}</>
  }

  try {
    // 3. Validate and normalize block tree AST
    const validation = validateAndNormalizeBlockTree(rawBlocks)
    if (!validation.isValid || validation.normalized.length === 0) {
      console.warn(
        `[TenantSlotRenderer] Published template for slot "${slotType}" failed validation. Falling back to default theme. Errors:`,
        validation.errors
      )
      return <>{fallback}</>
    }

    // 4. Construct context value
    const contextValue: TemplateContextValue = {
      slotType,
      global: {
        tenant: "tenant" in context ? context.tenant : (context as any).author,
        homeUrl: context.homeUrl,
        isSubdomain: context.isSubdomain,
        siteTitle: context.siteTitle,
        siteDescription: context.siteDescription,
      },
      home: slotType === "home" ? (context as HomeSlotContext) : undefined,
      post: slotType === "post" ? (context as PostSlotContext) : undefined,
      isStudioCanvas: false,
    }

    // 5. Render block tree inside the dynamic route context provider
    return (
      <TemplateContextProvider value={contextValue}>
        <BlockRenderer blocks={validation.normalized} className={className} />
      </TemplateContextProvider>
    )
  } catch (error) {
    console.error(
      `[TenantSlotRenderer] Unhandled error while rendering slot "${slotType}". Falling back to default theme:`,
      error
    )
    return <>{fallback}</>
  }
}
