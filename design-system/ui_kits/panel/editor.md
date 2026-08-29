# Panel · Editor de entrada

> **Fuente:** `../../ui-ux-panels/04-panel-editor-de-entrada.png`.
> **Ruta:** `app/panel/posts/[id]/` → **renombrar a `app/panel/entradas/[id]/`**.
> **Las pantallas mandan.**

━━━

## 1. Composición

Forma **A con rail**, pero con dos particularidades que solo tiene esta pantalla:
el rail mide **340px** (no 320) y **la topbar cambia** (`navigation/topbar.md` §6, variante editor).

```
┌ sidebar │ topbar-editor ──────────────────────────────────────────────────┐
│         │ ← Volver a entradas        ✓ Guardado  [Vista previa] [Publicar ▾] │
│         ├────────────────────────────────────────────┬─────────────────────┤
│         │ Título de la entrada  (input sin borde)    │ Publicación         │
│         │ Enlace permanente: /como-escribir-con-ia   │  Estado    Borrador │
│         │ ┌────────────────────────────────────────┐ │  Visibilidad Público│
│         │ │ Párrafo ▾ B I U S ⌗ 🔗 ☰ ❝ ⇥ 🖼 ⊞ ✦IA │ │  Publicar  Ahora ▾  │
│         │ ├────────────────────────────────────────┤ ├─────────────────────┤
│         │ │                                        │ │ Categorías          │
│         │ │  contenido TipTap                      │ ├─────────────────────┤
│         │ │                                        │ │ Etiquetas  IA× Fut× │
│         │ │                                        │ ├─────────────────────┤
│         │ └────────────────────────────────────────┘ │ Imagen destacada    │
│         │ Palabras: 1 248 · Tiempo de lectura: 5 min ├─────────────────────┤
│         │                                            │ Extracto            │
│         │                              [🗑 Mover a la papelera]             │
└─────────┴────────────────────────────────────────────┴─────────────────────┘
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` **variante editor** |
| Retorno | Enlace de retorno `← Volver a entradas` (`navigation/breadcrumb.md` §6). **No breadcrumb** |
| Estado de guardado | Texto `--fs-sm` + `circle-check` / `loader-circle` — ver §3 |
| Acciones | `core/button.md`: `Vista previa` (secundario, `eye`) + `Publicar` (**negro, split** con `core/dropdown-menu.md`) |
| Documento | `forms/input.md` variante *sin marco* para el título · barra TipTap con `core/icon-button.md` · `core/dropdown-menu.md` para `Párrafo ▾` |
| Contadores | Fila `--fs-sm`/`--text-tertiary`, `tabular-nums`, bajo el documento |
| Rail | `layout/split-view.md` (340px, sticky) con 5 bloques en *pendiente* `core/accordion.md` |
| Destructivo | `core/button.md` `variant="destructive-ghost"`, `trash-2`, al pie del rail |

### El título y el enlace permanente

- **Título**: input sin borde, sin fondo, `--fs-h1`/600/`--text-primary`, placeholder
  `Título de la entrada` en `--text-tertiary`. Crece en altura con el contenido (`textarea`
  autoajustable), nunca scrollea. Es el `<h1>` accesible de la pantalla.
- **Enlace permanente**: fila `--fs-sm`/`--text-secondary` con `Enlace permanente:` + el slug en
  `--text-primary` y un `Editar` en `--accent`. **En `--font-sans`, no en monoespaciada**
  (`guidelines/tipografia.md` §1). Se autogenera del título hasta que el usuario lo toca; a partir
  de ahí queda fijado y no vuelve a regenerarse.

### La barra de TipTap

Sticky bajo la topbar, alto 48, fondo `--surface`, hairline arriba y abajo, padding-x `--sp-3`.
Grupos separados por divisores verticales de 1px `--border-hairline` con `--sp-2` de margen:

1. `Párrafo ▾` (selector de bloque, `--fs-body`, con `chevron-down`)
2. `bold` · `italic` · `underline` · `strikethrough` · `code`
3. `link` · `list` · `list-ordered` · `quote` · `align-left`
4. `image` · `table` · `columns-3`
5. **`Escribir con IA`** — al final, `sparkles` 16 índigo + texto. Es el único elemento con color
   de la barra: `--accent-tint` de fondo, `--accent` de texto, `--radius-control`.

Cada botón: `core/icon-button.md` de 32×32 con `aria-label` y `aria-pressed` cuando la marca está
activa. El activo lleva fondo `--surface-sunken` y icono `--text-primary`.

### El rail de publicación — cinco bloques

| Bloque | Contenido | Componentes |
|---|---|---|
| **Publicación** | `Estado` (`Borrador` ▾) · `Visibilidad` (`Público` ▾) · `Publicar` (`Ahora` ▾ / fecha) | `forms/select.md` · *Pendiente* `forms/date-time-picker.md` |
| **Categorías** | Lista de casillas con `category-dot` + `Añadir nueva categoría` | `forms/checkbox.md` · *Pendiente* `forms/combobox.md` |
| **Etiquetas** | `core/chip.md` con `×` (`IA ×`, `Futuro ×`, `Trabajo ×`) + input de añadir | `core/chip.md` |
| **Imagen destacada** | Miniatura 16:9 + `Cambiar imagen` y `trash-2`; o zona punteada `--border-strong` con `image` y `Añadir imagen destacada` | `forms/file-input.md` |
| **Extracto** | `textarea` de 3 líneas + contador `0 / 160` en `--fs-label`/`--text-tertiary` | `forms/textarea.md` |

Cada bloque es una sección del acordeón: título `--fs-h3` + `chevron-up` / `chevron-down` que rota
en `--dur-fast`. Todos abiertos por defecto salvo `Extracto`.

━━━

## 2. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Título | `posts.title` | ✅ |
| Slug | `posts.slug` | ✅ |
| Contenido | `posts.content` (+ `contentStorageId` si supera 500 KB) | ✅ |
| Estado | `posts.status` | ⚠️ falta `private` para `Visibilidad` |
| Programación | `posts.scheduledFor` | ✅ |
| Categoría(s) | `posts.categoryDocId` → `categories` | ⚠️ el rail muestra **casillas múltiples**; el esquema guarda una sola |
| Etiquetas | `posts.tags: v.array(v.string())` | ✅ (son strings, no ids: al renombrar una etiqueta hay que reescribir los posts) |
| Imagen destacada | `posts.coverUrl` | ✅ |
| Extracto | `posts.excerpt` | ✅ |
| Palabras | calculado en cliente por TipTap (`@tiptap/extension-character-count`) | ✅ |
| Tiempo de lectura | `posts.readingTimeMinutes`, recalculado en cliente al escribir | ✅ |
| Autoguardado | mutación de Convex con *debounce* | ⚠️ no implementado |
| `Escribir con IA` | endpoint de IA con streaming | ⚠️ no implementado |

━━━

## 3. Estados

### Carga del documento

- Título en skeleton **con la altura de su input real**; enlace permanente en skeleton.
- Seis líneas de párrafo con anchos **100 / 96 / 88 / 100 / 72 / 45 %**.
- **La toolbar se pinta completa pero deshabilitada** (`opacity: .5`, `pointer-events: none`). Si
  apareciera después, la página saltaría.
- El rail monta sus cinco acordeones **con los títulos visibles** y los campos en skeleton.
- Los contadores se pintan ya en `Palabras: 0 · Tiempo de lectura: 0 min` — se calculan en cliente
  y **nunca entran en skeleton ni desaparecen**.

### Autoguardado — en la topbar, `--fs-sm`

| Estado | Presentación |
|---|---|
| Sin cambios | `Guardado` + `circle-check` — texto `--text-secondary`, icono `--text-tertiary`. **No es verde**: guardar no es rendimiento medido (`guidelines/color.md` §4) |
| Guardando | `Guardando…` + `loader-circle` 14 en `--text-tertiary` |
| Sin conexión | `Sin conexión — se guardará al reconectar` en `--warn`, persistente |
| Falló | `No se pudo guardar` en `--danger` + botón `Reintentar`. **El contenido nunca se pierde**: queda en borrador local y se reintenta solo cada 15 s |

Los tres primeros se anuncian con `role="status"` `aria-live="polite"`; el fallo con
`aria-live="assertive"`.

### Vacío

- **Documento vacío**: placeholder de TipTap tal como lo muestra la pantalla —
  `Escribe “/” para ver las opciones o escribe con IA…`, en `--text-tertiary`.
- **Sin imagen destacada**: zona punteada `--border-strong`, `--radius-card`, alto 140,
  `image` 24 en `--text-tertiary` + `Añadir imagen destacada` + `--fs-sm` con el límite
  (`JPG, PNG o WebP · máximo 5 MB`).
- **Sin etiquetas / sin categorías**: el bloque conserva su título y muestra su input vacío. No se
  colapsa: un rail que cambia de alto al escribir es un rail roto.
- **Entrada nueva** (`/entradas/nueva`): no hay skeleton en absoluto. Todo vacío y enfocado en el
  título.

### Error

- **Publicar falla**: el botón vuelve a su estado normal y el toast explica el motivo. El usuario
  no pierde el trabajo ni la posición del cursor.
- **Imagen falla**: recuadro `--danger-tint` con `El archivo supera 5 MB` y `Elegir otra`.
- **Documento no encontrado (404)**: se mantiene el chrome completo (sidebar y topbar) y el área
  de contenido muestra el vacío correspondiente con `Volver a entradas`. Nunca una página desnuda.
- **Cambios sin guardar al navegar**: diálogo `Tienes cambios sin guardar` con `Descartar`
  (secundario) y `Guardar` (negro).

### Publicar

El botón entra en ocupado (`loader-circle` + `Publicando…`) con **ancho fijo** para que no salte,
se deshabilita, y al terminar aparece el toast `Entrada publicada` con acción `Ver entrada`.

El split `▾` abre: `Guardar como borrador` · `Programar…` · `Publicar en privado` ·
`Vista previa en una pestaña nueva`.

### IA — el estado que decide si el producto se siente vivo

1. **`Escribir con IA` nunca se dispara al montar.** Siempre lo inicia el usuario.
2. **Nunca se bloquea el editor.** El usuario sigue escribiendo mientras la IA trabaja.
3. **Siempre cancelable**: el botón ocupado ofrece `Detener`; cancelar deja el documento
   exactamente como estaba.
4. **Señal de vida a partir de los 5 s**: `Escribiendo…` → `Escribiendo… 6s`, contador en
   `tabular-nums`.
5. **Timeout a 30 s** con `La generación tardó demasiado` y `Reintentar`.
6. **El fallo de la IA nunca invalida la pantalla.**
7. **Nunca se muestran tokens, modelos ni coste.** Eso es telemetría interna.

**Con streaming** (preferido): el texto entra en el documento a medida que llega, con resalte
`--accent-tint` que se desvanece en 600 ms al cerrar el bloque, y un cursor `▍` índigo al final del
texto en curso. El botón permanece en `Detener`.

**Sin streaming**: en el punto de inserción se dibuja un skeleton de párrafo de tres líneas con
shimmer **teñido de `--accent`** — la única vez que un skeleton lleva color, y sirve para distinguir
"la IA está escribiendo aquí" de "estamos cargando datos".

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico: documento + rail 340 sticky. |
| **1024–1279** | Rail a 320. El documento conserva `max-width: 760px` para que la línea de lectura no se estire. |
| **768–1023** | **El rail se convierte en hoja inferior**, abierta desde `Publicar ▾` o desde un botón `Opciones`. El documento ocupa el ancho completo. Sidebar → drawer. |
| **<768** | Topbar de 56px: `←` + `✓` + `Publicar`. `Vista previa` entra al menú `⋯`. **Toolbar de TipTap sticky bajo la topbar, con scroll horizontal y `Escribir con IA` anclado al final visible.** Contadores al pie, siempre visibles. Hoja inferior para el rail, a 90 % de alto. |

━━━

## 5. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| `components/admin/post-editor.tsx` **y** `components/admin/editor/post-editor.tsx` | Un solo editor. Dos archivos con el mismo nombre son deuda activa |
| `components/admin/editor/editor-action-bar.tsx` | Las acciones viven en la **topbar variante editor**, no en una barra propia |
| `components/admin/editor/editor-header-fields.tsx` | Título sin marco + fila de enlace permanente |
| `components/admin/tiptap/editor-status-bar.tsx` | Contadores al pie + estado de guardado en la topbar |
| Sin rail | `layout/split-view.md` a 340px con los cinco acordeones |
| Sin `Escribir con IA` | Botón índigo al final de la toolbar + estados de §3 |
| Sin autoguardado | Mutación con *debounce* + los cuatro estados de la tabla |
| `app/panel/posts/[id]/designer/` | El diseñador visual es otra pantalla (`diseno.md`), no una variante del editor |

━━━

## 6. Reglas duras

1. **Un solo botón negro**: `Publicar`. `Vista previa` es secundario.
2. `Guardado` **no es verde**. Verde es rendimiento medido, no confirmación de escritura.
3. El índigo de la toolbar es exclusivo de `Escribir con IA`.
4. Ninguna llamada de IA al montar. Toda llamada de IA es cancelable.
5. La toolbar se pinta desde el primer render, deshabilitada si hace falta. Nunca aparece después.
6. Los contadores nunca entran en skeleton.
7. El slug va en `--font-sans`, nunca en monoespaciada.
8. `Mover a la papelera` es reversible: toast con `Deshacer`, sin diálogo.
