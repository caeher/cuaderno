"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { TenantTemplate, TemplateRevision } from "@/lib/domain/template-schema"
import {
  getTenantTemplateRevisionsAction,
  publishTenantTemplateAction,
  rollbackTenantTemplateAction,
  saveTenantTemplateDraftAction,
} from "@/app/actions/template"
import { DesignerProvider, useDesigner } from "@/components/designer/hooks/use-designer-store"
import { DesignerTopbar } from "@/components/designer/designer-topbar"
import { SidebarPanel } from "@/components/designer/panels/sidebar-panel"
import { DesignerCanvas } from "@/components/designer/canvas/designer-canvas"
import { TemplateRevisionsModal } from "@/components/designer/panels/template-revisions-modal"
import { TemplateContextProvider } from "@/components/site/template-context"

interface DesignerStudioProps {
  template: TenantTemplate
  tenantSlug?: string
}

export function DesignerStudio({ template, tenantSlug }: DesignerStudioProps) {
  return (
    <DesignerProvider initialTemplate={template}>
      <DesignerStudioInner template={template} tenantSlug={tenantSlug} />
    </DesignerProvider>
  )
}

function DesignerStudioInner({ template, tenantSlug }: DesignerStudioProps) {
  const router = useRouter()
  const { activeSlot, settings, isPreviewMode, getAllDraftSlots } = useDesigner()

  const [templateName, setTemplateName] = React.useState(template.name || "Plantilla del Blog")
  const [isSaving, setIsSaving] = React.useState(false)
  const [isPublished, setIsPublished] = React.useState(template.isPublished)
  const [currentVersion, setCurrentVersion] = React.useState(template.version)

  // Revisions Modal State
  const [isRevisionsOpen, setIsRevisionsOpen] = React.useState(false)
  const [revisions, setRevisions] = React.useState<TemplateRevision[]>([])
  const [isLoadingRevisions, setIsLoadingRevisions] = React.useState(false)

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true)
      const currentDraftSlots = getAllDraftSlots()

      const res = await saveTenantTemplateDraftAction(template.tenantId, {
        name: templateName,
        draftSlots: currentDraftSlots,
        settings,
      })

      if (res.success) {
        toast.success("Borrador de plantilla guardado", {
          description: "Los cambios se han guardado de forma segura.",
        })
      } else {
        toast.error("Error al guardar el borrador")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setIsSaving(true)
      const currentDraftSlots = getAllDraftSlots()

      // First ensure latest draft is saved
      await saveTenantTemplateDraftAction(template.tenantId, {
        name: templateName,
        draftSlots: currentDraftSlots,
        settings,
      })

      const res = await publishTenantTemplateAction(
        template.tenantId,
        `Publicación de plantilla (${activeSlot})`,
        tenantSlug
      )

      if (res.success && res.template) {
        setIsPublished(true)
        setCurrentVersion(res.template.version)
        toast.success("¡Plantilla publicada en producción!", {
          description: `Versión ${res.template.version} activa para todos los lectores del blog.`,
        })
      } else {
        toast.error("Error al publicar la plantilla")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado al publicar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenRevisions = async () => {
    try {
      setIsLoadingRevisions(true)
      setIsRevisionsOpen(true)
      const res = await getTenantTemplateRevisionsAction(template.tenantId)
      if (res.success && res.revisions) {
        setRevisions(res.revisions)
      }
    } catch (error) {
      console.error(error)
      toast.error("No se pudo cargar el historial")
    } finally {
      setIsLoadingRevisions(false)
    }
  }

  const handleRollback = async (revisionId: string) => {
    try {
      const res = await rollbackTenantTemplateAction(template.tenantId, revisionId, tenantSlug)
      if (res.success) {
        toast.success("Versión restaurada con éxito")
        router.refresh()
      } else {
        toast.error("Error al restaurar versión")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error al restaurar la versión")
    }
  }

  return (
    <TemplateContextProvider
      value={{
        slotType: activeSlot,
        isStudioCanvas: true,
      }}
    >
      <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground overflow-hidden">
        {/* Top Studio Bar */}
        <DesignerTopbar
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onOpenRevisions={handleOpenRevisions}
          isSaving={isSaving}
          isPublished={isPublished}
          backUrl="/panel"
        />

        {/* Main Workspace Area (Sidebar + Canvas) */}
        <div className="relative flex flex-1 overflow-hidden">
          {!isPreviewMode && <SidebarPanel />}
          <DesignerCanvas />
        </div>

        {/* Revisions History Modal */}
        <TemplateRevisionsModal
          isOpen={isRevisionsOpen}
          onClose={() => setIsRevisionsOpen(false)}
          revisions={revisions}
          currentVersion={currentVersion}
          onRollback={handleRollback}
          isLoading={isLoadingRevisions}
        />
      </div>
    </TemplateContextProvider>
  )
}
