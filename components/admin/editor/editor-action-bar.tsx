"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, Save, Send, Palette, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { PostStatus } from "@/lib/domain/entities"

export interface EditorActionBarProps {
  mode: "create" | "edit"
  publishedSlug?: string | null
  postId?: string
  status: PostStatus
  onStatusChange: (status: PostStatus) => void
  isSaving: boolean
  onSave: () => void
  isFeatured?: boolean
  onToggleFeatured?: () => void
}

export function EditorActionBar({
  mode,
  publishedSlug,
  postId,
  status,
  onStatusChange,
  isSaving,
  onSave,
  isFeatured,
  onToggleFeatured,
}: EditorActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Switch to Visual Designer Button */}
      <Button
        variant="outline"
        size="sm"
        className="text-xs text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60"
        render={
          <Link
            href={postId ? `/panel/posts/${postId}/designer` : "/panel/posts/nuevo/designer"}
          />
        }
      >
        <Palette data-icon="inline-start" />
        <span className="hidden sm:inline">Diseñador</span> Visual
      </Button>

      {/* Featured Star Toggle */}
      {onToggleFeatured && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFeatured}
          title={isFeatured ? "Post destacado" : "Marcar como destacado"}
          className={`cursor-pointer ${isFeatured ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground"}`}
        >
          <Star className={`size-4 ${isFeatured ? "fill-amber-400 text-amber-500" : ""}`} />
        </Button>
      )}

      {/* Status Selector */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as PostStatus)}
        className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer font-medium"
      >
        <option value="draft">Borrador</option>
        <option value="published">Publicado</option>
        <option value="scheduled">Programado</option>
      </select>

      {/* View Live Article */}
      {status === "published" && publishedSlug && (
        <Button
          variant="ghost"
          size="sm"
          render={<a href={`/post/${publishedSlug}`} target="_blank" rel="noreferrer" />}
        >
          <Eye data-icon="inline-start" />
          <span className="hidden sm:inline">Ver en blog</span>
        </Button>
      )}

      {/* Save Button */}
      <Button
        size="sm"
        onClick={onSave}
        disabled={isSaving}
        className="cursor-pointer"
      >
        {isSaving ? (
          <Spinner className="size-3.5" />
        ) : status === "published" ? (
          <Send data-icon="inline-start" />
        ) : (
          <Save data-icon="inline-start" />
        )}
        {status === "published" ? "Publicar" : "Guardar borrador"}
      </Button>
    </div>
  )
}
