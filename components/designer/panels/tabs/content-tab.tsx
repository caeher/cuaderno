"use client"

import * as React from "react"
import { useDesigner } from "@/components/designer/hooks/use-designer-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ImageIcon, Sparkles, Info } from "lucide-react"

export function ContentTab() {
  const { getSelectedBlock, updateBlockProps } = useDesigner()
  const block = getSelectedBlock()

  if (!block) return null

  const props = block.props || {}

  const handlePropChange = (key: string, value: any) => {
    updateBlockProps(block.id, { [key]: value })
  }

  return (
    <div className="flex flex-col gap-5 p-4 text-xs">
      {/* HEADING PROPS */}
      {block.type === "heading" && (
        <>
          <Field>
            <FieldLabel>Texto del Encabezado</FieldLabel>
            <Input
              value={props.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              placeholder="Escribe el título..."
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Nivel Jerárquico (HTML Tag)</FieldLabel>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handlePropChange("level", lvl)}
                  className={`rounded border py-1.5 font-mono text-xs font-semibold transition-colors ${
                    (props.level || 2) === lvl
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  H{lvl}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {/* TEXT PROPS */}
      {block.type === "text" && (
        <Field>
          <FieldLabel>Contenido del Párrafo</FieldLabel>
          <Textarea
            value={props.text || ""}
            onChange={(e) => handlePropChange("text", e.target.value)}
            placeholder="Escribe tu texto..."
            rows={5}
            className="text-xs leading-relaxed"
          />
        </Field>
      )}

      {/* BUTTON PROPS */}
      {block.type === "button" && (
        <>
          <Field>
            <FieldLabel>Texto del Botón</FieldLabel>
            <Input
              value={props.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Enlace de Destino (URL)</FieldLabel>
            <Input
              value={props.url || ""}
              onChange={(e) => handlePropChange("url", e.target.value)}
              placeholder="https://..."
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Estilo del Botón</FieldLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "primary", label: "Primario" },
                { id: "secondary", label: "Secundario" },
                { id: "outline", label: "Contorno" },
                { id: "gradient", label: "Degradado" },
              ].map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handlePropChange("variant", variant.id)}
                  className={`rounded-md border p-1.5 text-xs font-medium transition-colors ${
                    (props.variant || "primary") === variant.id
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Icono</FieldLabel>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "", label: "Ninguno" },
                { id: "ArrowRight", label: "Flecha →" },
                { id: "ArrowDown", label: "Flecha ↓" },
                { id: "Sparkles", label: "Brillo ✨" },
                { id: "ExternalLink", label: "Externo ↗" },
              ].map((ico) => (
                <button
                  key={ico.id}
                  type="button"
                  onClick={() => handlePropChange("iconName", ico.id)}
                  className={`rounded border p-1 text-[11px] transition-colors ${
                    (props.iconName || "") === ico.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {ico.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Abrir en nueva pestaña</span>
            <input
              type="checkbox"
              checked={Boolean(props.openInNewTab)}
              onChange={(e) => handlePropChange("openInNewTab", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </>
      )}

      {/* IMAGE PROPS */}
      {block.type === "image" && (
        <>
          <Field>
            <FieldLabel>URL de la Imagen</FieldLabel>
            <Input
              value={props.src || ""}
              onChange={(e) => handlePropChange("src", e.target.value)}
              placeholder="https://..."
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Texto Alternativo (Alt Text / SEO)</FieldLabel>
            <Input
              value={props.alt || ""}
              onChange={(e) => handlePropChange("alt", e.target.value)}
              placeholder="Descripción de la imagen"
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Pie de foto (Caption)</FieldLabel>
            <Input
              value={props.caption || ""}
              onChange={(e) => handlePropChange("caption", e.target.value)}
              placeholder="Texto explicativo al pie"
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Proporción de Aspecto (Aspect Ratio)</FieldLabel>
            <div className="grid grid-cols-4 gap-1">
              {["16/9", "4/3", "1/1", "auto"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => handlePropChange("aspectRatio", ratio)}
                  className={`rounded border p-1.5 font-mono text-[11px] ${
                    (props.aspectRatio || "16/9") === ratio
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {/* BANNER PROPS */}
      {block.type === "banner" && (
        <>
          <Field>
            <FieldLabel>Título del Banner</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Subtítulo o Bajada</FieldLabel>
            <Textarea
              value={props.subtitle || ""}
              onChange={(e) => handlePropChange("subtitle", e.target.value)}
              rows={2}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>URL Imagen de Fondo</FieldLabel>
            <Input
              value={props.backgroundImage || ""}
              onChange={(e) => handlePropChange("backgroundImage", e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Texto del Botón CTA</FieldLabel>
            <Input
              value={props.buttonText || ""}
              onChange={(e) => handlePropChange("buttonText", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Enlace del Botón (URL)</FieldLabel>
            <Input
              value={props.buttonUrl || ""}
              onChange={(e) => handlePropChange("buttonUrl", e.target.value)}
              className="text-xs"
            />
          </Field>
        </>
      )}

      {/* QUOTE PROPS */}
      {block.type === "quote" && (
        <>
          <Field>
            <FieldLabel>Cita / Testimonio</FieldLabel>
            <Textarea
              value={props.quote || ""}
              onChange={(e) => handlePropChange("quote", e.target.value)}
              rows={3}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Autor de la Cita</FieldLabel>
            <Input
              value={props.author || ""}
              onChange={(e) => handlePropChange("author", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Cargo o Fuente</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              placeholder="Ej: Diseñador Principal"
              className="text-xs"
            />
          </Field>
        </>
      )}

      {/* COUNTER PROPS */}
      {block.type === "counter" && (
        <>
          <Field>
            <FieldLabel>Número o Métrica Principal</FieldLabel>
            <Input
              value={props.number || ""}
              onChange={(e) => handlePropChange("number", e.target.value)}
              placeholder="10k+, 98%, 500"
              className="text-xs font-mono font-bold"
            />
          </Field>
          <Field>
            <FieldLabel>Etiqueta descriptiva</FieldLabel>
            <Input
              value={props.label || ""}
              onChange={(e) => handlePropChange("label", e.target.value)}
              placeholder="Lectores este mes"
              className="text-xs"
            />
          </Field>
        </>
      )}

      {/* ICON BOX PROPS */}
      {block.type === "icon_box" && (
        <>
          <Field>
            <FieldLabel>Icono</FieldLabel>
            <div className="grid grid-cols-4 gap-1">
              {["Sparkles", "Zap", "Smartphone", "CheckCircle", "HelpCircle", "Info"].map((ico) => (
                <button
                  key={ico}
                  type="button"
                  onClick={() => handlePropChange("icon", ico)}
                  className={`rounded border p-1 text-[11px] ${
                    (props.icon || "Sparkles") === ico
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Título de la Característica</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Descripción</FieldLabel>
            <Textarea
              value={props.description || ""}
              onChange={(e) => handlePropChange("description", e.target.value)}
              rows={3}
              className="text-xs"
            />
          </Field>
        </>
      )}

      {/* ACCORDION PROPS */}
      {block.type === "accordion" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <FieldLabel>Elementos del Acordeón</FieldLabel>
            <button
              type="button"
              onClick={() => {
                const current = (props.items as Array<{ id: string; title: string; content: string }>) || []
                handlePropChange("items", [
                  ...current,
                  { id: `acc_${Date.now()}`, title: "Nueva Pregunta", content: "Respuesta detallada..." },
                ])
              }}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
            >
              <Plus className="size-3" />
              Añadir elemento
            </button>
          </div>
          {((props.items as Array<{ id: string; title: string; content: string }>) || []).map((item, idx) => (
            <div key={item.id} className="flex flex-col gap-1.5 rounded-lg border border-border/80 bg-muted/20 p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = (props.items as Array<{ id: string; title: string; content: string }>) || []
                    handlePropChange("items", current.filter((x) => x.id !== item.id))
                  }}
                  className="text-destructive hover:opacity-80"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <Input
                value={item.title}
                onChange={(e) => {
                  const current = (props.items as Array<{ id: string; title: string; content: string }>) || []
                  handlePropChange(
                    "items",
                    current.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x))
                  )
                }}
                placeholder="Pregunta o título..."
                className="text-xs"
              />
              <Textarea
                value={item.content}
                onChange={(e) => {
                  const current = (props.items as Array<{ id: string; title: string; content: string }>) || []
                  handlePropChange(
                    "items",
                    current.map((x) => (x.id === item.id ? { ...x, content: e.target.value } : x))
                  )
                }}
                rows={2}
                placeholder="Contenido desplegable..."
                className="text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {/* CALLOUT PROPS */}
      {block.type === "callout" && (
        <>
          <Field>
            <FieldLabel>Tipo de Aviso</FieldLabel>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: "tip", label: "Tip ✨" },
                { id: "info", label: "Info ℹ️" },
                { id: "warning", label: "Aviso ⚠️" },
                { id: "error", label: "Error 🛑" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handlePropChange("type", t.id)}
                  className={`rounded border p-1 text-[11px] ${
                    (props.type || "tip") === t.id
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Título del Cuadro</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Mensaje</FieldLabel>
            <Textarea
              value={props.message || ""}
              onChange={(e) => handlePropChange("message", e.target.value)}
              rows={3}
              className="text-xs"
            />
          </Field>
        </>
      )}

      {/* NEWSLETTER PROPS */}
      {block.type === "newsletter_box" && (
        <>
          <Field>
            <FieldLabel>Título de Suscripción</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Descripción</FieldLabel>
            <Textarea
              value={props.description || ""}
              onChange={(e) => handlePropChange("description", e.target.value)}
              rows={2}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Texto del Botón</FieldLabel>
            <Input
              value={props.buttonText || ""}
              onChange={(e) => handlePropChange("buttonText", e.target.value)}
              className="text-xs"
            />
          </Field>
        </>
      )}

      {/* AUTHOR BOX PROPS */}
      {block.type === "author_box" && (
        <>
          <Field>
            <FieldLabel>Nombre del Autor</FieldLabel>
            <Input
              value={props.name || ""}
              onChange={(e) => handlePropChange("name", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Titular / Rol</FieldLabel>
            <Input
              value={props.role || ""}
              onChange={(e) => handlePropChange("role", e.target.value)}
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Biografía</FieldLabel>
            <Textarea
              value={props.bio || ""}
              onChange={(e) => handlePropChange("bio", e.target.value)}
              rows={3}
              className="text-xs"
            />
          </Field>
        </>
      )}

      {/* VIDEO PROPS */}
      {block.type === "video" && (
        <Field>
          <FieldLabel>URL del Video (YouTube o MP4 directo)</FieldLabel>
          <Input
            value={props.url || ""}
            onChange={(e) => handlePropChange("url", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="text-xs"
          />
        </Field>
      )}

      {/* DYNAMIC BLOG POST GRID PROPS */}
      {block.type === "blog_post_grid" && (
        <>
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Feed de Posts</span>
              <span className="text-muted-foreground leading-normal">
                Renderiza automáticamente los artículos publicados del tenant activo según los filtros configurados.
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Columnas en Escritorio</FieldLabel>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => handlePropChange("columns", cols)}
                  className={`rounded border p-1.5 font-mono text-xs font-semibold ${
                    (Number(props.columns) || 2) === cols
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cols} col
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <FieldLabel>Límite de Artículos a Mostrar</FieldLabel>
            <Input
              type="number"
              min={1}
              max={50}
              value={props.limit || 10}
              onChange={(e) => handlePropChange("limit", Number(e.target.value))}
              className="text-xs font-mono"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar resumen (Excerpt)</span>
            <input
              type="checkbox"
              checked={props.showExcerpt !== false}
              onChange={(e) => handlePropChange("showExcerpt", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar fecha de publicación</span>
            <input
              type="checkbox"
              checked={props.showDate !== false}
              onChange={(e) => handlePropChange("showDate", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </>
      )}

      {/* DYNAMIC POST CONTENT PROPS */}
      {block.type === "post_content" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Contenido del Post</span>
              <span className="text-muted-foreground leading-normal">
                Aquí se inyectará el texto redactado del artículo. El estilo tipográfico aplicado afectará a todos los posts del blog.
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Texto de Reemplazo / Fallback</FieldLabel>
            <Input
              value={props.placeholderText || ""}
              onChange={(e) => handlePropChange("placeholderText", e.target.value)}
              placeholder="El contenido del artículo se renderizará automáticamente aquí."
              className="text-xs"
            />
          </Field>
        </div>
      )}

      {/* DYNAMIC POST TITLE PROPS */}
      {block.type === "post_title" && (
        <>
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Título del Post</span>
              <span className="text-muted-foreground leading-normal">
                Muestra el título del artículo en lectura. Puedes ajustar su jerarquía HTML y estilo tipográfico.
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Nivel de Encabezado HTML</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handlePropChange("level", lvl)}
                  className={`rounded border py-1.5 font-mono text-xs font-semibold ${
                    (props.level || 1) === lvl
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  H{lvl}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {/* DYNAMIC POST META PROPS */}
      {block.type === "post_meta" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Metadatos del Post</span>
              <span className="text-muted-foreground leading-normal">
                Selecciona qué metadatos automáticos se muestran en la cabecera del artículo.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Autor</span>
            <input
              type="checkbox"
              checked={props.showAuthor !== false}
              onChange={(e) => handlePropChange("showAuthor", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Fecha de Publicación</span>
            <input
              type="checkbox"
              checked={props.showDate !== false}
              onChange={(e) => handlePropChange("showDate", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Tiempo Estimado de Lectura</span>
            <input
              type="checkbox"
              checked={props.showReadingTime !== false}
              onChange={(e) => handlePropChange("showReadingTime", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Categoría Principal</span>
            <input
              type="checkbox"
              checked={props.showCategory !== false}
              onChange={(e) => handlePropChange("showCategory", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </div>
      )}

      {/* DYNAMIC POST COVER PROPS */}
      {block.type === "post_cover" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Portada del Artículo</span>
              <span className="text-muted-foreground leading-normal">
                Renderiza la imagen de cabecera subida en el artículo con las proporciones seleccionadas.
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Proporción de Aspecto (Aspect Ratio)</FieldLabel>
            <div className="grid grid-cols-3 gap-1">
              {["16/9", "21/9", "4/3"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => handlePropChange("aspectRatio", ratio)}
                  className={`rounded border p-1.5 font-mono text-[11px] ${
                    (props.aspectRatio || "16/9") === ratio
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Bordes Redondeados</span>
            <input
              type="checkbox"
              checked={props.rounded !== false}
              onChange={(e) => handlePropChange("rounded", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </div>
      )}

      {/* DYNAMIC POST TAKEAWAYS PROPS */}
      {block.type === "post_takeaways" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Resumen Ejecutivo</span>
              <span className="text-muted-foreground leading-normal">
                Muestra los puntos clave resumidos para lectores rápidos y motores de búsqueda.
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Título de la Sección</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              placeholder="Resumen ejecutivo"
              className="text-xs"
            />
          </Field>
        </div>
      )}

      {/* DYNAMIC POST ACTION BAR PROPS */}
      {block.type === "post_action_bar" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Barra de Acciones</span>
              <span className="text-muted-foreground leading-normal">
                Permite a los lectores dar me gusta, ver comentarios e interactuar con el artículo.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Botón Me Gusta</span>
            <input
              type="checkbox"
              checked={props.showLikes !== false}
              onChange={(e) => handlePropChange("showLikes", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Contador de Comentarios</span>
            <input
              type="checkbox"
              checked={props.showCommentsCount !== false}
              onChange={(e) => handlePropChange("showCommentsCount", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Botón Compartir</span>
            <input
              type="checkbox"
              checked={props.showShare !== false}
              onChange={(e) => handlePropChange("showShare", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </div>
      )}

      {/* DYNAMIC COMMENTS SECTION PROPS */}
      {block.type === "comments_section" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Comentarios</span>
              <span className="text-muted-foreground leading-normal">
                Muestra la conversación e hilo de respuestas asociadas al artículo en vivo.
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Título de la Sección de Comentarios</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              placeholder="Comentarios"
              className="text-xs"
            />
          </Field>
        </div>
      )}

      {/* DYNAMIC CATEGORY FILTER PROPS */}
      {block.type === "category_filter" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Filtro de Categorías</span>
              <span className="text-muted-foreground leading-normal">
                Genera la barra de taxonomías activas del blog para navegación y filtrado.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar contador de artículos por categoría</span>
            <input
              type="checkbox"
              checked={props.showCount !== false}
              onChange={(e) => handlePropChange("showCount", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </div>
      )}

      {/* DYNAMIC SITE NAVBAR PROPS */}
      {block.type === "site_navbar" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Cabecera Global</span>
              <span className="text-muted-foreground leading-normal">
                Barra superior con logo, título del tenant y navegación global del blog.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar barra de búsqueda</span>
            <input
              type="checkbox"
              checked={props.showSearch !== false}
              onChange={(e) => handlePropChange("showSearch", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar interruptor de tema claro/oscuro</span>
            <input
              type="checkbox"
              checked={props.showThemeToggle !== false}
              onChange={(e) => handlePropChange("showThemeToggle", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </div>
      )}

      {/* DYNAMIC SITE FOOTER PROPS */}
      {block.type === "site_footer" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px]">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-primary">Bloque Dinámico: Pie de Página Global</span>
              <span className="text-muted-foreground leading-normal">
                Pie de página institucional con derechos reservados y enlaces legales automáticos.
              </span>
            </div>
          </div>
          <Field>
            <FieldLabel>Texto de Derechos Reservados</FieldLabel>
            <Input
              value={props.copyrightText || ""}
              onChange={(e) => handlePropChange("copyrightText", e.target.value)}
              placeholder="Todos los derechos reservados"
              className="text-xs"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Enlaces Legales (Privacidad, Cookies, Términos)</span>
            <input
              type="checkbox"
              checked={props.showLegalLinks !== false}
              onChange={(e) => handlePropChange("showLegalLinks", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </div>
      )}

      {/* DYNAMIC SOCIAL SHARE PROPS */}
      {block.type === "social_share" && (
        <Field>
          <FieldLabel>Texto de la Llamada a Compartir</FieldLabel>
          <Input
            value={props.label || ""}
            onChange={(e) => handlePropChange("label", e.target.value)}
            placeholder="¿Te ha gustado este artículo? Compártelo..."
            className="text-xs"
          />
        </Field>
      )}

      {/* DYNAMIC POST GRID PROPS */}
      {block.type === "post_grid" && (
        <>
          <Field>
            <FieldLabel>Título de la Sección de Recomendados</FieldLabel>
            <Input
              value={props.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              placeholder="Artículos recomendados para seguir leyendo"
              className="text-xs"
            />
          </Field>
          <Field>
            <FieldLabel>Cantidad de Artículos</FieldLabel>
            <Input
              type="number"
              min={1}
              max={6}
              value={props.count || 2}
              onChange={(e) => handlePropChange("count", Number(e.target.value))}
              className="text-xs font-mono"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Resumen</span>
            <input
              type="checkbox"
              checked={props.showExcerpt !== false}
              onChange={(e) => handlePropChange("showExcerpt", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs font-medium">Mostrar Autor</span>
            <input
              type="checkbox"
              checked={props.showAuthor !== false}
              onChange={(e) => handlePropChange("showAuthor", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
          </div>
        </>
      )}
    </div>
  )
}
