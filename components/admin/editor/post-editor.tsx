"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Clock, FileText, Globe, Sparkles, Hash, Folder, Lightbulb } from "lucide-react"
import type { Category, Post, PostStatus, Tag } from "@/lib/domain/entities"
import { savePostAction } from "@/app/actions/blog-actions"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { CoverImagePicker } from "@/components/forms/cover-image-picker"
import { CategorySelect } from "@/components/forms/category-select"
import { TagMultiSelect } from "@/components/forms/tag-multi-select"
import { EditorHeaderFields } from "@/components/admin/editor/editor-header-fields"
import { EditorActionBar } from "@/components/admin/editor/editor-action-bar"
import { RichTextEditor } from "@/components/admin/tiptap/rich-text-editor"
import { Input } from "@/components/ui/input"

export interface PostEditorProps {
  mode: "create" | "edit"
  initialPost?: Post
  allTags: Tag[]
  allCategories?: Category[]
}

export function PostEditor({ mode, initialPost, allTags, allCategories = [] }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = React.useState(initialPost?.title ?? "")
  const [slug, setSlug] = React.useState(initialPost?.slug ?? "")
  const [excerpt, setExcerpt] = React.useState(initialPost?.excerpt ?? "")
  const [content, setContent] = React.useState(initialPost?.content ?? "")
  const [coverUrl, setCoverUrl] = React.useState(initialPost?.coverUrl ?? "")
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(
    initialPost?.categoryId ?? null
  )
  const [categoriesList, setCategoriesList] = React.useState<Category[]>(allCategories)
  const [tagsList, setTagsList] = React.useState<Tag[]>(allTags)
  const [selectedTags, setSelectedTags] = React.useState<string[]>(initialPost?.tags ?? [])
  const [status, setStatus] = React.useState<PostStatus>(initialPost?.status ?? "draft")
  const [isFeatured, setIsFeatured] = React.useState<boolean>(initialPost?.featured ?? false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isCustomSlug, setIsCustomSlug] = React.useState(false)

  // Real-time word & reading time calculation
  const { wordCount, readingTimeMinutes } = React.useMemo(() => {
    const plainText = content.replace(/<[^>]+>/g, " ").trim()
    const words = plainText ? plainText.split(/\s+/).length : 0
    const time = Math.max(1, Math.ceil(words / 200))
    return { wordCount: words, readingTimeMinutes: time }
  }, [content])

  async function handleSave(overrideStatus?: PostStatus) {
    const targetStatus = overrideStatus || status
    try {
      setIsSaving(true)
      const res = await savePostAction({
        id: initialPost?.id,
        title,
        slug: slug.trim() || undefined,
        excerpt,
        content,
        coverUrl,
        categoryId: selectedCategoryId,
        tags: selectedTags,
        status: targetStatus,
        featured: isFeatured,
        editorMode: "notion",
      })

      if (res.success) {
        toast.success(
          targetStatus === "published"
            ? "¡Post publicado con éxito!"
            : targetStatus === "scheduled"
            ? "Post programado"
            : "Borrador guardado",
          {
            description: title || "Sin título",
          }
        )
        router.push("/panel/posts")
      } else {
        toast.error("Error al guardar el post")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-16">
      <AdminTopbar title={mode === "create" ? "Nuevo post" : "Editar post"}>
        <EditorActionBar
          mode={mode}
          postId={initialPost?.id}
          publishedSlug={initialPost?.slug}
          status={status}
          onStatusChange={setStatus}
          isFeatured={isFeatured}
          onToggleFeatured={() => setIsFeatured(!isFeatured)}
          isSaving={isSaving}
          onSave={() => handleSave(status)}
        />
      </AdminTopbar>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 md:p-8">
        {/* Cover Image */}
        <CoverImagePicker value={coverUrl} onChange={setCoverUrl} aspectRatio="3/1" />

        {/* Title & Excerpt */}
        <EditorHeaderFields
          title={title}
          onTitleChange={setTitle}
          excerpt={excerpt}
          onExcerptChange={setExcerpt}
        />

        {/* Slug Customization Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Globe className="size-4 shrink-0 text-text-tertiary" />
          <span>Enlace permanente: /post/</span>
          {isCustomSlug ? (
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              placeholder={initialPost?.slug || "slug-del-articulo"}
              className="h-7 w-56 rounded-lg px-2 py-0 text-sm"
            />
          ) : (
            <span className="font-medium text-ia">
              {slug || initialPost?.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) : "tu-articulo")}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsCustomSlug(!isCustomSlug)}
            className="ml-auto cursor-pointer text-sm font-medium text-ia hover:underline"
          >
            {isCustomSlug ? "Listo" : "Personalizar enlace"}
          </button>
        </div>

        {/* Canvas Block Editor */}
        <div className="flex flex-col gap-2">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Escribe tu historia, o pulsa '/' para ver bloques y comandos..."
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-sm text-text-tertiary">
            <span className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 size-4 shrink-0" />
              <span>
                <strong className="font-medium text-muted-foreground">Consejos de Notion</strong>: Escribe{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">/</code> para insertar
                bloques, arrastra con el icono{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">::</code> en el margen
                para reordenar.
              </span>
            </span>
            <div className="flex items-center gap-4 tabular-nums">
              <span className="flex items-center gap-1.5">
                <FileText className="size-4" />
                {wordCount} palabras
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                ~{readingTimeMinutes} min de lectura
              </span>
            </div>
          </div>
        </div>

        {/* Taxonomies Section: Category (1) and Tags (N) */}
        <div className="grid gap-6 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <div>
            <CategorySelect
              allCategories={categoriesList}
              selectedCategoryId={selectedCategoryId}
              onChange={setSelectedCategoryId}
              onCategoryCreated={(newCat) => setCategoriesList((prev) => [...prev, newCat])}
            />
          </div>

          <div>
            <TagMultiSelect
              allTags={tagsList}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              onTagCreated={(newTag) => setTagsList((prev) => [...prev, newTag])}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

