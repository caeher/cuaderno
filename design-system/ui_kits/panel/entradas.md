# Panel · Entradas — lista de entradas

> **Fuente:** `../../ui-ux-panels/03-panel-entradas.png`.
> **Ruta:** `app/panel/posts/` → **renombrar a `app/panel/entradas/`** (el producto es íntegramente
> en español; una ruta en inglés dentro del panel es deuda visible en la barra de direcciones).
> **Las pantallas mandan.**

━━━

## 1. Composición

Forma **B — ancho completo** (`layout/content-grid.md`): una sola columna; la estructura la dan
las tarjetas.

```
page-header:  Entradas · «Gestiona todo lo que publicas»   [ Filtros ] [ + Nueva entrada ]
──────────────────────────────────────────────────────────────────────────────
tabs:  Todas (24)  Publicadas (18)  Borradores (4)  Programadas (2)  Papelera (1)
──────────────────────────────────────────────────────────────────────────────  ← hairline
barra de lista:  [ 🔍 Buscar entradas… ]        [ Más recientes ▾ ]  [ ☰ | ▦ ]
┌────────────────────────────────────────────────────────────────────────────┐
│ ☐ │ ▢ │ Título                │ Autor │ Categorías │ Estado │ Fecha │ SEO │⋯│
│───┼───┼───────────────────────┼───────┼────────────┼────────┼───────┼─────┼─│
│ ☐ │▢▢│ Cómo escribir con IA  │ 👤 M. │ ● IA       │ ✅ Pub │ 12may │ (92)│⋯│
└────────────────────────────────────────────────────────────────────────────┘
Mostrando 1 a 6 de 24 entradas                              ‹ 1 2 3 … 4 ›
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` + `core/button.md` (`Filtros` secundario con `sliders-horizontal`, `Nueva entrada` primario) |
| Tabs | `navigation/tabs.md` con contador, subrayado 2px `--accent` pegado al hairline |
| Barra de lista | `forms/search-input.md` (240–280px) · `core/dropdown-menu.md` (orden) · *Pendiente* `core/segmented-control.md` (lista / grilla, activo en `--accent-tint`) |
| Tabla | `data-display/data-table.md` (`density="cómoda"`, `selectable`, filas de 72px) |
| Celdas | `core/avatar.md` · `data-display/category-dot.md` (variante chip) · `core/badge.md` · `data-display/score-ring.md` (`sm`) · `core/dropdown-menu.md` tras `ellipsis` |
| Pie | `navigation/pagination.md` + línea `Mostrando…`, **fuera de la tarjeta**, con `--sp-4` de separación |
| Acciones en lote | Barra que sustituye a la barra de lista cuando hay filas seleccionadas |

### Las columnas

| Columna | Ancho | Contenido | Se oculta en |
|---|---|---|---|
| Checkbox | 40px fijo | `forms/checkbox.md` | nunca |
| Thumbnail | 56px | `posts.coverUrl` en 56×56, `--radius-thumb`, `object-fit: cover` | `<768` (pasa a la tarjeta) |
| Título | `minmax(0, 1fr)` | Título a 1–2 líneas `--fs-body`/500 + `slug` debajo en `--fs-sm`/`--text-tertiary` | nunca |
| Autor | auto | Avatar 24 + nombre `--fs-sm` | **1024–1279 (primero)** |
| Categorías | auto | Hasta 2 chips con punto `--cat-N`; `+N` si hay más | **768–1023 (segundo)** |
| Estado | auto | `core/badge.md` — vocabulario cerrado | nunca |
| Fecha | auto | Dos líneas: fecha `--fs-sm` + hora `--fs-sm`/`--text-tertiary`, `tabular-nums` | nunca |
| SEO Score | auto | `score-ring` `sm` + número; `—` si no hay análisis | 768–1023 |
| Acciones | 56px fijo | `ellipsis` → menú | nunca |

**Menú de fila (`ellipsis`):** `Editar` · `Ver entrada` · `Duplicar` · `Cambiar estado ▸` ·
separador · `Mover a la papelera` (destructivo, `--danger`).

### La barra de selección múltiple

Aparece **en el lugar de la barra de lista** cuando hay ≥1 fila marcada (no se apila encima: eso
mueve la tabla). Alto 40, fondo `--accent-tint`, borde `--accent-border`, `--radius-control`:
`3 entradas seleccionadas` a la izquierda; a la derecha `Publicar`, `Cambiar categoría ▾`,
`Mover a la papelera` (texto `--danger`) y `x` para limpiar la selección.

━━━

## 2. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Contadores de los tabs | `posts` agrupado por `status` | ⚠️ falta `private` y falta un estado de papelera (`deletedAt` o `status: "trashed"`) |
| Thumbnail | `posts.coverUrl` | ✅ |
| Título / enlace | `posts.title`, `posts.slug` | ✅ |
| Autor | `posts.authorDocId` → `users.name`, `users.avatarUrl` | ✅ |
| Categorías | `posts.categoryDocId` → `categories.name`, `categories.color` | ⚠️ la pantalla muestra **varias** categorías por entrada; el esquema tiene **una** (`categoryDocId`). Decidir: multi-categoría (`categoryIds: v.array(...)`) o mostrar una sola |
| Estado | `posts.status` | ⚠️ falta `private` |
| Fecha | `posts.publishedAt` · `posts.scheduledFor` · `posts.updatedAt` según estado | ✅ |
| SEO Score | `posts.seoScore` | ⚠️ **no existe** |
| Búsqueda | índice de texto sobre `title` + `excerpt` | ⚠️ no hay índice de búsqueda en `convex/schema.ts` |
| Orden | `updatedAt` · `publishedAt` · `title` · `views` | ✅ (falta índice para `views`) |
| Paginación | cursor de Convex, 6 por página en la pantalla | ✅ |

**Qué fecha se muestra según el estado** — la columna es una, el significado cambia:
`Publicado` → `publishedAt` · `Programado` → `scheduledFor` (con `calendar` 16 delante) ·
`Borrador` → `updatedAt` precedido de `Editado`.

━━━

## 3. Estados

### Carga

- `page-header`, tabs **con sus contadores**, barra de lista y cabecera de la tabla se pintan ya.
  La paginación se pinta **deshabilitada**.
- `SkeletonTabla`: 6 filas de 72px con la geometría real — checkbox, thumbnail 56, dos barras de
  título (100 % y 65 %), chip de categoría, badge, fecha en dos líneas, anillo gris y hueco de
  acciones.
- **Cambio de página, de tab, de orden o de filtro: no se vuelve al skeleton.** La tabla baja a
  `opacity: .6` con `pointer-events: none` durante `--dur-base` y **conserva su altura**. Volver al
  skeleton en cada clic hace parpadear la lista.
- Al alternar lista ↔ grilla **no se vuelve a pedir el dato ni se muestra skeleton**: es un cambio
  de presentación.

### Vacío

Tres vacíos distintos. Confundirlos es el error clásico de esta pantalla.

| Causa | Icono | Título | Cuerpo | Acción |
|---|---|---|---|---|
| **Nunca hubo** | `file-text` | `Aún no tienes entradas` | `Crea tu primera entrada y empieza a publicar.` | Botón **negro** `Nueva entrada` |
| **Filtro o búsqueda** | `search` | `Sin resultados para “inteligencia”` | `Prueba con otro término o quita los filtros.` | Botón **secundario** `Limpiar filtros` — **aquí nunca va el CTA de creación**: el usuario está buscando, no creando |
| **Tab de estado** | ninguno | — | `No hay entradas programadas.` / `La papelera está vacía.` en `--fs-sm`/`--text-secondary` con `--sp-8` de aire | ninguna |

En los tres casos **permanecen** la cabecera, las tabs y sus contadores.

### Error

- `feedback/empty-state.md` con `triangle-alert` en `--warn`, `No pudimos cargar tus entradas`,
  una línea de causa si se conoce y botón secundario **`Reintentar`**.
- Cabecera, tabs y contadores permanecen.
- Si ya había filas en pantalla, **no se borran**: banda `--warn-tint` sobre la tabla con
  `No pudimos actualizar los datos` + `Reintentar`.

### Estados de fila

- **Creación optimista:** la fila entra con fondo `--accent-tint` que se desvanece en 600 ms. Si el
  servidor la rechaza, se retira y salta un toast de error con `Reintentar`.
- **Acción en curso** (publicar, duplicar): la fila baja a `opacity: .6`; el menú `⋯` muestra
  `loader-circle`.
- **Eliminación:** la fila desaparece de inmediato y salta el toast `Movida a la papelera · Deshacer`
  durante 8 s. **Sin diálogo de confirmación** para acciones reversibles.
- **Thumbnail ausente:** cuadro `--surface-sunken` con `image` 20 en `--text-tertiary`. Nunca un
  rectángulo roto ni una imagen genérica.
- **Sin SEO Score:** anillo en `--border-hairline` completo y `—` en `--text-tertiary` — así lo
  muestran las pantallas 02 y 03 para borradores y programadas.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Todas las columnas. Paginación completa. |
| **1024–1279** | Se oculta `Autor`. Padding-x del contenido a `--sp-6`. |
| **768–1023** | Se ocultan también `Categorías` y `SEO Score`. Sidebar → drawer. Tabs con scroll horizontal, sin cortar la etiqueta activa. |
| **<768** | **La tabla se convierte en tarjetas apiladas.** Nunca scroll horizontal. Cada tarjeta: thumbnail 48 + título a 2 líneas + fila de metadatos `Estado · Fecha` + `⋯` a la derecha. Selección múltiple por pulsación larga o modo selección explícito. `page-header` apilado con `Nueva entrada` a ancho completo. Barra de lista en dos filas: buscador arriba, orden + vista abajo. Paginación centrada, solo `‹ Página 2 de 4 ›`. |

`Título`, `Estado`, `Fecha` y las acciones **no se ocultan nunca**.

━━━

## 5. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| Ruta `app/panel/posts/` | `app/panel/entradas/` con redirección permanente desde la antigua |
| `components/admin/posts/posts-data-table.tsx` | `data-display/data-table.md` — la **misma** tabla que usan Resumen, Páginas y Categorías |
| `components/admin/delete-post-button.tsx` + `posts/delete-post-dialog.tsx` | Acción dentro del menú `⋯` + toast con `Deshacer`. **Sin diálogo**: mover a la papelera es reversible |
| Sin tabs de estado | `navigation/tabs.md` con contador por estado |
| Sin barra de lista | Buscador + orden + alternador lista/grilla |
| Sin paginación | `navigation/pagination.md` + línea `Mostrando…` |
| Sin vista de grilla | Variante `grid` de `data-table.md` §2.5 |

━━━

## 6. Reglas duras

1. **Un solo botón negro**: `Nueva entrada`. `Filtros` es secundario.
2. El vacío por filtro **nunca** ofrece `Nueva entrada`.
3. La tabla no vuelve al skeleton al paginar ni al filtrar.
4. Sin bordes verticales, sin cebra. El borde de la tarjeta es el borde de la tabla.
5. El badge de estado usa el vocabulario cerrado de `core/badge.md`. No se inventan estados.
6. Verde solo en `Publicado` y en los anillos de score. Índigo solo en `Programado`, tab activo,
   alternador de vista activo y paginación activa.
7. En móvil, tarjetas apiladas. Jamás scroll horizontal de tabla.
