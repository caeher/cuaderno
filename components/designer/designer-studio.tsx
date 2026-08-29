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

  const sampleTenantUser = React.useMemo(() => ({
    id: template.tenantId || "u_tenant_sample",
    username: tenantSlug || "estudio",
    name: "Elena Martí",
    email: "elena@estudio.com",
    avatarUrl: "/placeholder.svg",
    coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop&q=80",
    bio: "Diseñadora de producto y escritora sobre sistemas de diseño y arquitectura de información.",
    tagline: "Notas de proceso y diseño editorial contemporáneo",
    socials: { twitter: "elenamarti", website: "https://elenamarti.com", github: "elenamarti" },
    role: "owner" as const,
    joinedAt: "2026-01-15",
    postCount: 14,
    followerCount: 240,
    subdomainEnabled: true,
  }), [template.tenantId, tenantSlug])

  const sampleCategories = React.useMemo(() => [
    { id: "cat_1", name: "Arquitectura", slug: "arquitectura", color: "#3b82f6", postCount: 6 },
    { id: "cat_2", name: "Tipografía", slug: "tipografia", color: "#8b5cf6", postCount: 4 },
    { id: "cat_3", name: "Producto", slug: "producto", color: "#10b981", postCount: 4 },
  ], [])

  const samplePosts = React.useMemo(() => [
    {
      id: "post_sample_1",
      authorId: sampleTenantUser.id,
      title: "El renacer del diseño editorial en la era digital",
      slug: "renacer-diseno-editorial",
      excerpt: "Cómo las publicaciones web modernas recuperan la elegancia y el ritmo visual de las revistas clásicas.",
      content: `
# El renacer del diseño editorial en la era digital

El diseño de contenidos en la web ha evolucionado drásticamente. Lo que antes eran columnas rígidas hoy son lienzos modulares capaces de comunicar ideas complejas con claridad y elegancia.

## La importancia del ritmo y la jerarquía

Cuando un lector se sumerge en un ensayo largo, el diseño debe acompañar la lectura sin distraer. Los espacios en blanco, las citas destacadas y la tipografía equilibrada son los verdaderos pilares de la experiencia.

- Tipografía legible adaptada a cualquier tamaño de pantalla.
- Bloques de código con sintaxis resaltada y soporte para múltiples lenguajes.
- Inserción de imágenes con pies de foto explicativos.

> "El buen diseño no es cómo se ve, sino cómo funciona y qué emociones despierta en quien lo usa."
      `.trim(),
      coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
      categoryId: "cat_1",
      tags: ["editorial", "diseno", "arquitectura"],
      status: "published" as const,
      featured: true,
      publishedAt: "2026-08-20T10:00:00Z",
      createdAt: "2026-08-20T10:00:00Z",
      updatedAt: "2026-08-25T14:30:00Z",
      views: 1420,
      likes: 86,
      readingTimeMinutes: 5,
      comments: 6,
    },
    {
      id: "post_sample_2",
      authorId: sampleTenantUser.id,
      title: "Tipografía Fluida y Sistemas de Espaciado",
      slug: "tipografia-fluida",
      excerpt: "Exploración práctica de unidades clamp() y ritmos verticales en interfaces contemporáneas.",
      content: "Exploración detallada sobre ritmos verticales y tipografía escalable en sistemas modernos.",
      coverUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80",
      categoryId: "cat_2",
      tags: ["tipografia", "css"],
      status: "published" as const,
      featured: false,
      publishedAt: "2026-08-15T09:00:00Z",
      createdAt: "2026-08-15T09:00:00Z",
      updatedAt: "2026-08-18T11:00:00Z",
      views: 940,
      likes: 42,
      readingTimeMinutes: 4,
      comments: 3,
    },
  ], [sampleTenantUser.id])

  const sampleComments = React.useMemo(() => [
    {
      id: "com_1",
      postId: "post_sample_1",
      authorId: "u_reader_1",
      authorName: "Carlos Vega",
      authorAvatarUrl: "/placeholder.svg",
      content: "Un artículo inspirador. Me encanta cómo se equilibran los espacios en blanco y la tipografía en esta maquetación.",
      createdAt: "2026-08-26T12:00:00Z",
      updatedAt: "2026-08-26T12:00:00Z",
      status: "approved" as const,
    },
    {
      id: "com_2",
      postId: "post_sample_1",
      authorId: "u_reader_2",
      authorName: "Sofía Navarro",
      authorAvatarUrl: "/placeholder.svg",
      content: "Excelente estructura visual. Las citas y los puntos clave facilitan mucho la comprensión rápida.",
      createdAt: "2026-08-27T08:30:00Z",
      updatedAt: "2026-08-27T08:30:00Z",
      status: "approved" as const,
    },
  ], [])

  return (
    <TemplateContextProvider
      value={{
        slotType: activeSlot,
        isStudioCanvas: true,
        global: {
          tenant: sampleTenantUser,
          homeUrl: `/${tenantSlug || "estudio"}`,
          isSubdomain: false,
          siteTitle: templateName || "Cuaderno",
          siteDescription: sampleTenantUser.bio,
        },
        home: {
          tenant: sampleTenantUser,
          homeUrl: `/${tenantSlug || "estudio"}`,
          isSubdomain: false,
          siteTitle: templateName || "Cuaderno",
          posts: samplePosts,
          featuredPost: samplePosts[0],
          categories: sampleCategories,
          totalPosts: samplePosts.length,
        },
        post: {
          tenant: sampleTenantUser,
          homeUrl: `/${tenantSlug || "estudio"}`,
          isSubdomain: false,
          post: samplePosts[0],
          author: sampleTenantUser,
          comments: sampleComments,
          relatedPosts: [samplePosts[1]],
        },
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
