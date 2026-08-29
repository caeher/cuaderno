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

      {/* Featured Star Toggle */}
      {onToggleFeatured && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFeatured}
          title={isFeatured ? "Post destacado" : "Marcar como destacado"}
          className={`cursor-pointer ${isFeatured ? "text-warn hover:text-warn-ink" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Star className={`size-4 ${isFeatured ? "fill-warn text-warn" : ""}`} />
        </Button>
      )}

      {/* Status Selector */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as PostStatus)}
        className="h-9 cursor-pointer rounded-lg border border-border bg-card px-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
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
          className="cursor-pointer border border-border bg-card text-foreground hover:bg-muted"
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
        className="cursor-pointer font-medium"
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
