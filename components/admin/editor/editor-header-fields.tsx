import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export interface EditorHeaderFieldsProps {
  title: string
  onTitleChange: (title: string) => void
  excerpt: string
  onExcerptChange: (excerpt: string) => void
  className?: string
}

export function EditorHeaderFields({
  title,
  onTitleChange,
  excerpt,
  onExcerptChange,
  className,
}: EditorHeaderFieldsProps) {
  return (
    <FieldGroup className={cn("gap-4", className)}>
      <Field>
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Título del post..."
            className="h-auto border-none bg-transparent p-0 text-2xl font-semibold leading-snug tracking-tight text-foreground shadow-none placeholder:text-text-tertiary focus-visible:ring-0 md:text-3xl"
          />
        </div>
      </Field>
      <Field>
        <Textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="Escribe un resumen breve o bajada para las tarjetas y el SEO..."
          rows={2}
          className="resize-none border-none bg-transparent px-0 text-base leading-relaxed text-muted-foreground shadow-none placeholder:text-text-tertiary focus-visible:ring-0"
        />
      </Field>
    </FieldGroup>
  )
}
