"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Category, Post, Tag } from "@/lib/domain/entities"
import { savePostAction } from "@/app/actions/blog-actions"
import { DesignerProvider, useDesigner } from "@/components/designer/hooks/use-designer-store"
import { DesignerTopbar } from "@/components/designer/designer-topbar"
import { SidebarPanel } from "@/components/designer/panels/sidebar-panel"
import { DesignerCanvas } from "@/components/designer/canvas/designer-canvas"
import { serializeBlockTree } from "@/lib/domain/block-schema"

interface DesignerStudioProps {
  post?: Post | null
  allTags: Tag[]
  allCategories?: Category[]
}

export function DesignerStudio({ post, allTags, allCategories = [] }: DesignerStudioProps) {
  return (
    <DesignerProvider initialBlocks={post?.designData || null}>
      <DesignerStudioInner post={post} allTags={allTags} allCategories={allCategories} />
    </DesignerProvider>
  )
}

function DesignerStudioInner({ post, allTags, allCategories = [] }: DesignerStudioProps) {
  const router = useRouter()
  const { blocks, isPreviewMode } = useDesigner()

  const [title, setTitle] = React.useState(post?.title || "Nuevo artículo con diseño visual")
  const [excerpt, setExcerpt] = React.useState(post?.excerpt || "")
  const [coverUrl, setCoverUrl] = React.useState(post?.coverUrl || "")
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(post?.categoryId ?? null)
  const [selectedTags, setSelectedTags] = React.useState<string[]>(post?.tags || [])
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async (status: "draft" | "published") => {
    try {
      setIsSaving(true)
      const serializedDesign = serializeBlockTree(blocks)

      const res = await savePostAction({
        id: post?.id,
        title,
        excerpt: excerpt || `Artículo diseñado visualmente: ${title}`,
        content: post?.content || "", // Fallback plain content
        coverUrl,
        categoryId: selectedCategoryId,
        tags: selectedTags.length > 0 ? selectedTags : ["diseno"],
        status,
        designData: serializedDesign,
        editorMode: "elementor",
      })


      if (res.success) {
        toast.success(status === "published" ? "¡Artículo publicado con éxito!" : "Borrador guardado", {
          description: title,
        })
        if (!post?.id && res.post?.id) {
          router.push(`/panel/posts/${res.post.id}/designer`)
        }
      } else {
        toast.error("Error al guardar el diseño del post")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Studio Bar */}
      <DesignerTopbar
        postTitle={title}
        onTitleChange={setTitle}
        onSave={handleSave}
        isSaving={isSaving}
        postStatus={post?.status || "draft"}
        backUrl={post?.id ? `/panel/posts/${post.id}` : "/panel/posts"}
      />

      {/* Main Workspace Area (Sidebar + Canvas) */}
      <div className="relative flex flex-1 overflow-hidden">
        {!isPreviewMode && <SidebarPanel />}
        <DesignerCanvas />
      </div>
    </div>
  )
}
