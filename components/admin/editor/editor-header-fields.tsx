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
    <FieldGroup className={cn("gap-3", className)}>
      <Field>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Título del post..."
          className="h-auto border-none px-0 font-serif text-3xl font-semibold tracking-tight shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 md:text-4xl"
        />
      </Field>
      <Field>
        <Textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="Escribe un resumen breve o bajada para las tarjetas y el SEO..."
          rows={2}
          className="resize-none border-none px-0 text-base leading-relaxed text-muted-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
        />
      </Field>
    </FieldGroup>
  )
}
