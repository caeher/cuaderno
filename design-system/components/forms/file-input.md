# File Input — subida de archivo

> El `<input type="file">` nativo es imposible de estilar de forma consistente entre navegadores y
> su texto («Ningún archivo seleccionado») no se puede traducir. Por eso en Cuaderno **el input
> nativo está siempre oculto y lo dispara un botón del sistema**.
> Referencias: `09` → Usuario → «Imagen de perfil» (avatar + «Cambiar imagen» + papelera), `04` →
> sidebar de publicación → «Imagen destacada» (miniatura + «Cambiar imagen» + «Eliminar»), y la
> subida de medios de la biblioteca.

Ruta destino: `components/ui/file-input.tsx` — **no existe**, se compone.

━━━

## 0. Adopción (componer, no inventar)

No hace falta un primitivo nuevo:

- El disparador es `components/ui/button.tsx` (`secundario`, `md` o `sm`).
- La miniatura es un `<img>` con `--radius-thumb`, o `components/ui/avatar.tsx` cuando es una foto de
  persona (`09`).
- El borrado es `core/icon-button.md` en variante `destructivo`.
- El progreso reutiliza la barra de progreso del sistema.
- El `<input type="file">` va oculto con `sr-only` (**no** con `display: none`, que en algunos
  navegadores lo saca del orden de tabulación y del alcance del lector de pantalla).

`components/ui/input.tsx` ya trae reglas `file:*` en su `className`: **se borran**. Ese input nativo
estilado no se usa en ninguna pantalla y mantenerlo invita a usarlo.

━━━

## 1. Anatomía

### 1.1 Variante `reemplazo` — hay un archivo (el caso de `04` y `09`)

```
   ┌────────────┐
   │  ▒▒▒▒▒▒▒▒  │   [ Cambiar imagen ]   [ 🗑 ]
   │  ▒▒▒▒▒▒▒▒  │
   └────────────┘
        1                   2               3
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Vista previa** | Imagen 160×90 con `--radius-thumb` en `04` (proporción 16:9 de la imagen destacada); avatar `xl` de 48px en `09`. Borde 1px `--border-hairline`. `object-fit: cover`. |
| 2 | **Botón de cambio** | `Button variant="secundario"`, etiqueta «Cambiar imagen». Es quien dispara el input oculto. |
| 3 | **Botón de borrado** | `icon-button` `destructivo` con `Trash2` (`09`), o `Button variant="fantasma"` con texto «Eliminar» en `--danger` (`04`). Ambas formas están en las pantallas; se elige por el espacio disponible. |

### 1.2 Variante `vacio` — no hay archivo

```
   ┌───────────────────────────────────────────────┐
   │              ⬆                                │   borde discontinuo 1.5px --border-strong
   │     Arrastra una imagen o selecciónala        │   --radius-card
   │     PNG, JPG o WebP · hasta 5 MB              │   fondo --surface-sunken
   └───────────────────────────────────────────────┘
```

| Parte | Regla |
|---|---|
| **Zona** | Alto mínimo 140px, `--radius-card`, borde **discontinuo** 1.5px `--border-strong`, fondo `--surface-sunken`. El discontinuo es la única línea punteada del sistema, y significa exactamente una cosa: «acá se puede soltar algo». |
| **Icono** | `Upload` de 24px, `--text-tertiary`. |
| **Texto principal** | `--fs-body`, `--text-primary`: «Arrastra una imagen o selecciónala». |
| **Restricciones** | `--fs-sm`, `--text-tertiary`: formatos aceptados y tamaño máximo. **Siempre visibles antes de elegir**, nunca solo en el mensaje de error. Descubrir el límite después de esperar la subida es el peor momento para enterarse. |

━━━

## 2. Variantes y props

| Prop | Tipo | Por defecto | Efecto |
|---|---|---|---|
| `variant` | `reemplazo \| vacio` | automático según haya archivo | |
| `accept` | string | — | **Obligatorio.** `image/png,image/jpeg,image/webp`. Filtra el diálogo del sistema. |
| `maxTamano` | number (bytes) | — | **Obligatorio.** Se valida en cliente antes de subir. |
| `multiple` | `boolean` | `false` | Solo en la biblioteca de medios. La imagen destacada y el avatar son de uno. |
| `relacionAspecto` | string | — | Proporción de la vista previa: `16/9` en `04`, `1/1` en `09`. |
| `alSeleccionar` | `(files: FileList) => void` | — | |
| `alEliminar` | `() => void` | — | |

**Recorte**: cuando la imagen tiene una proporción obligatoria (imagen destacada, avatar), tras
seleccionar se abre un recortador en un `dialog`. La vista previa muestra siempre **el resultado
recortado**, no el original: enseñar una vista previa que no coincide con lo que se publicará es una
mentira barata que se descubre tarde.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Vacío** | Zona punteada, borde `--border-strong`. |
| **Vacío · hover** | Borde `--accent-border`, fondo `--accent-tint`. |
| **Arrastrando encima** | Borde **continuo** 2px `--accent`, fondo `--accent-tint`, icono a `--accent`. Es índigo porque es el producto respondiendo a un gesto, no un juicio de éxito. |
| **Arrastrando un archivo no aceptado** | Borde `--danger`, fondo `--danger-tint`, texto «Este tipo de archivo no se admite». Se decide con `dataTransfer.items`, **antes de soltar**. |
| **Subiendo** | Barra de progreso indeterminada bajo la vista previa + `%` en `--fs-sm` con `tabular-nums`. **La subida se puede cancelar**: un `icon-button` de `X` junto al progreso, y cancelar aborta la petición de verdad. |
| **Subida completa** | La vista previa se sustituye por la imagen final. Sin check verde ni celebración: el archivo se ve, y eso es la confirmación. |
| **Error de subida** | `alert` `destructivo` bajo el control, con el motivo exacto («La imagen pesa 8,2 MB y el máximo es 5 MB») y un botón «Reintentar». El archivo elegido **no se pierde**. |
| **Deshabilitado** | Zona en `--surface-sunken` sin borde punteado, texto `--text-tertiary`, sin arrastre. |

**El error dice el dato**, no la regla: «pesa 8,2 MB y el máximo es 5 MB» en vez de «Archivo
demasiado grande».

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Vista previa — radio / borde | `--radius-thumb` / `--border-hairline` |
| Zona vacía — radio / fondo | `--radius-card` / `--surface-sunken` |
| Zona vacía — borde | 1.5px discontinuo `--border-strong` |
| Zona en hover | borde `--accent-border`, fondo `--accent-tint` |
| Zona con archivo encima | borde 2px continuo `--accent`, fondo `--accent-tint` |
| Zona rechazando | borde `--danger`, fondo `--danger-tint` |
| Icono | `Upload` 24px, `--text-tertiary` → `--accent` al arrastrar |
| Texto principal | `--fs-body`, `--text-primary` |
| Restricciones | `--fs-sm`, `--text-tertiary` |
| Progreso | pista `--surface-sunken`, relleno `--accent`, alto 4px, `--radius-pill` |
| Porcentaje | `--fs-sm`, `tabular-nums`, `--text-secondary` |
| Botones | `secundario` (cambiar) · `destructivo` (eliminar) |
| Foco | `--focus-ring` en la zona completa y en cada botón |
| Duración / curva | `--dur-fast` / `--ease-out` |

**El progreso es índigo, no verde.** El verde del sistema mide rendimiento de contenido publicado;
una barra que avanza es el producto trabajando, y eso es índigo.

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **El input nativo existe y es alcanzable.** Se oculta con `sr-only`, nunca con `display: none` ni
  `visibility: hidden`. El `<label>` lo envuelve o lo referencia con `htmlFor`, de forma que un
  lector de pantalla anuncia «Imagen destacada, botón de selección de archivo».
- **Arrastrar y soltar nunca es la única vía.** Siempre hay un botón que abre el diálogo del sistema.
  Arrastrar es imposible con teclado y muy difícil con motricidad reducida.
- **La zona de soltar es activable con teclado**: `Enter` y `Espacio` sobre la zona abren el diálogo,
  igual que el botón.
- **El progreso se anuncia**: `role="progressbar"` con `aria-valuenow`/`aria-valuemin`/`aria-valuemax`
  y `aria-label="Subiendo imagen destacada"`. Si es indeterminado, se omite `aria-valuenow`.
- **El error se enlaza** con `aria-describedby` y vive en un contenedor `role="alert"`.
- **`alt` obligatorio.** Toda imagen subida pide su texto alternativo en un campo que aparece junto a
  la vista previa. Una imagen destacada sin `alt` es una entrada que no se puede leer con lector de
  pantalla, y además penaliza en SEO — que es precisamente lo que este producto vende.
- **La vista previa no es decorativa**: `alt="Vista previa de la imagen destacada"` mientras no haya
  `alt` propio.
- **Eliminar confirma cuando es irreversible.** Quitar la imagen destacada de un borrador no
  necesita confirmación (se puede volver a poner); borrar un archivo de la biblioteca de medios sí,
  porque puede estar usado en otras entradas.
- **Zona táctil**: los botones cumplen `--touch-target`; la zona de soltar la supera de sobra.
- **Contraste**: el borde punteado `--border-strong` sobre `--surface-sunken` da ≈1.5:1 y **no cumple
  3:1**. No es un bloqueo porque la zona también se identifica por su icono, su título y su texto de
  restricciones; el borde es refuerzo, no el canal. Si se quisiera cumplir estrictamente, se sube a
  `--neutral`.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/file-input.tsx — el input nativo existe, está oculto y es alcanzable
"use client"
import { useRef, useState } from "react"
import { Upload, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function FileInput({
  id, etiqueta, accept, maxTamano, valor, alSeleccionar, alEliminar, relacionAspecto = "16/9",
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [encima, setEncima] = useState(false)

  const abrir = () => inputRef.current?.click()

  return (
    <div>
      {/* el nativo: oculto pero presente en el árbol de accesibilidad */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(ev) => ev.target.files && alSeleccionar(ev.target.files)}
      />

      {valor ? (
        <div className="flex items-center gap-[var(--sp-3)]">
          <img
            src={valor.url}
            alt="Vista previa de la imagen destacada"
            style={{ aspectRatio: relacionAspecto }}
            className="w-40 rounded-[var(--radius-thumb)] border border-[var(--border-hairline)] object-cover"
          />
          <div className="flex gap-[var(--sp-2)]">
            <Button variant="secundario" size="sm" onClick={abrir}>Cambiar imagen</Button>
            <Button variant="fantasma" size="sm" onClick={alEliminar}
                    className="text-[var(--danger)] hover:bg-[var(--danger-tint)]">
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          tabIndex={0}
          onDragOver={(ev) => { ev.preventDefault(); setEncima(true) }}
          onDragLeave={() => setEncima(false)}
          onDrop={(ev) => { ev.preventDefault(); setEncima(false); alSeleccionar(ev.dataTransfer.files) }}
          onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); abrir() } }}
          className={cn(
            "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-[var(--sp-2)]",
            "rounded-[var(--radius-card)] border-[1.5px] border-dashed border-[var(--border-strong)]",
            "bg-[var(--surface-sunken)] p-[var(--sp-6)] text-center outline-none",
            "transition-[background-color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
            "hover:border-[var(--accent-border)] hover:bg-[var(--accent-tint)]",
            "focus-visible:shadow-[var(--focus-ring)]",
            encima && "border-solid border-2 border-[var(--accent)] bg-[var(--accent-tint)]",
          )}
        >
          <Upload aria-hidden="true"
                  className={cn("size-6", encima ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]")} />
          <span className="text-[length:var(--fs-body)] text-[var(--text-primary)]">
            Arrastra una imagen o selecciónala
          </span>
          <span className="text-[length:var(--fs-sm)] text-[var(--text-tertiary)]">
            PNG, JPG o WebP · hasta {Math.round(maxTamano / 1_000_000)} MB
          </span>
        </label>
      )}
    </div>
  )
}
```

```tsx
// 09 · Imagen de perfil — la vista previa es un avatar, no una miniatura rectangular
<Field orientation="horizontal">
  <FieldLabel htmlFor="foto-perfil">Imagen de perfil</FieldLabel>
  <div className="flex items-center gap-[var(--sp-3)]">
    <Avatar size="xl">
      <AvatarImage src={usuario.foto} alt="" />
      <AvatarFallback>{iniciales(usuario.nombre)}</AvatarFallback>
    </Avatar>
    <Button variant="secundario" size="sm" onClick={abrirSelector}>Cambiar imagen</Button>
    <Button variant="secundario" size="icono-sm" aria-label="Quitar imagen de perfil" onClick={quitar}
            className="text-[var(--danger)] hover:bg-[var(--danger-tint)]">
      <Trash2 aria-hidden="true" />
    </Button>
  </div>
</Field>
```

━━━

## 7. Reglas duras

1. **El input nativo se oculta con `sr-only`**, nunca con `display: none`.
2. **Arrastrar nunca es la única vía.** Siempre hay botón.
3. **Las restricciones se ven antes de elegir**, no en el error.
4. **El error dice el dato concreto** y no pierde el archivo elegido.
5. **La subida se puede cancelar de verdad.**
6. **`alt` obligatorio** para toda imagen publicada.
7. **El progreso es índigo**, no verde.
8. **La vista previa muestra el recorte final**, no el original.
