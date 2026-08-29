# Panel · Páginas — lista de páginas estáticas

> **Fuente:** `../../ui-ux-panels/05-panel-paginas.png`.
> **Ruta:** `app/panel/paginas/` — **no existe todavía**. Tampoco existe la tabla `pages` en
> `convex/schema.ts`. Esta pantalla se construye entera, datos incluidos.
> **Las pantallas mandan.**

━━━

## 1. Composición

Forma **B — ancho completo**, con una fila de métricas encima de la tabla.

```
page-header:  Páginas · «Sobre mí, contacto y todo lo que no es una entrada»   [ + Nueva página ]

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ ▢ Total  │ │ ● Public.│ │ ● Borrad.│ │ ● Privad.│   ← 4 stat cards
│    12    │ │     8    │ │     3    │ │     1    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

barra de lista:  [ 🔍 Buscar páginas… ]          [ Ordenar: Orden manual ▾ ] [ ☰ | ▦ ]
┌───────────────────────────────────────────────────────────────────────────┐
│ ⠿ │ ☐ │ Título / slug         │ Estado │ Fecha  │ Autor │            ⋯   │
│───┼───┼───────────────────────┼────────┼────────┼───────┼────────────────│
│ ⠿ │ ☐ │ Sobre mí  /sobre-mi   │ ✅ Pub │ 2 may  │ 👤 M. │            ⋯   │
└───────────────────────────────────────────────────────────────────────────┘
Mostrando 1 a 8 de 12 páginas                                    ‹ 1 2 ›
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` + `core/button.md` `Nueva página` (negro) |
| Métricas | `layout/content-grid.md` (4 col) × `data-display/stat-card.md` **variante punto de estado** (§2.1: punto en lugar de cuadro de icono) |
| Barra de lista | `forms/search-input.md` · `core/dropdown-menu.md` (orden) · *Pendiente* `core/segmented-control.md` |
| Tabla | `data-display/data-table.md` con **`reorderable`** (§2.3) y `selectable`; filas de **56px** (sin thumbnail) |
| Handle | `grip-vertical` en columna de 32px antes del contenido, `--text-tertiary`, hover `--text-secondary` |
| Estado | `core/badge.md` — mismo vocabulario cerrado que las entradas |
| Pie | `navigation/pagination.md` |

### Las cuatro stat cards — variante punto

Esta pantalla usa la variante de `stat-card.md` donde el cuadro de icono se sustituye por un
**punto de estado de 8px**. El punto toma el color del badge que representa, y así la fila de
métricas y la columna `Estado` de la tabla hablan el mismo idioma:

| Punto | Label | Cifra |
|---|---|---|
| `file` 20 en cuadro `--cat-8` | Total de páginas | `12` |
| `●` `--perf` | Publicadas | `8` |
| `●` `--warn` | Borradores | `3` |
| `●` `--neutral` | Privadas | `1` |

Estas cifras **no llevan delta**: son un censo, no una tendencia. Un `↑ 2 %` sobre "páginas
privadas" no significa nada.

### Las columnas

| Columna | Ancho | Contenido | Se oculta en |
|---|---|---|---|
| Handle `⠿` | 32px | `grip-vertical` — solo visible si el orden activo es `Orden manual` | `<768` |
| Checkbox | 40px | `forms/checkbox.md` | nunca |
| Título / slug | `minmax(0, 1fr)` | Título `--fs-body`/500 + slug debajo `--fs-sm`/`--text-tertiary`, **en `--font-sans`** | nunca |
| Estado | auto | `core/badge.md` | nunca |
| Fecha | auto | `--fs-sm`, `tabular-nums` | nunca |
| Autor | auto | `core/avatar.md` 24 + nombre | 1024–1279 |
| Acciones | 56px | `ellipsis` → menú | nunca |

**Menú de fila:** `Editar` · `Ver página` · `Duplicar` · `Fijar en el menú del blog` · separador ·
`Mover a la papelera` (`--danger`).

### Reordenar

- El handle solo se muestra cuando el orden activo es `Orden manual`. Con cualquier otro orden
  (`Título A–Z`, `Más recientes`) **el handle desaparece**: arrastrar dentro de un orden calculado
  no tiene sentido y frustra.
- Al arrastrar: la fila se eleva con `--shadow-float`, el resto de filas se separa dejando el hueco,
  y una línea de 2px `--accent` marca el destino. Ver `data-table.md` §3.3.
- Al soltar: **reordenación optimista** + toast `Orden actualizado · Deshacer`. Si el servidor
  rechaza, la fila vuelve a su sitio con transición en `--dur-base` y salta un toast de error.
- Accesible por teclado: con el handle enfocado, `Espacio` levanta la fila, `↑`/`↓` la mueven,
  `Espacio` la suelta, `Esc` cancela. Cada movimiento se anuncia con `aria-live`
  (`Sobre mí, posición 3 de 12`).

━━━

## 2. Datos que muestra

**No hay tabla `pages`.** Esta pantalla exige crearla. Esquema propuesto, deliberadamente parecido
a `posts` para que la tabla del sistema sea la misma:

```ts
pages: defineTable({
  tenantId: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  authorId: v.string(),
  authorDocId: v.optional(v.id("users")),
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  excerpt: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("published"), v.literal("private")),
  order: v.number(),          // orden manual — lo consume el handle de arrastre
  showInMenu: v.boolean(),    // «Fijar en el menú del blog»
  parentId: v.optional(v.id("pages")), // jerarquía, para una fase posterior
  publishedAt: v.optional(v.string()),
  updatedAt: v.string(),
  seoScore: v.optional(v.number()),
  contentStorageId: v.optional(v.id("_storage")),
})
  .index("by_tenant_and_order", ["tenantId", "order"])
  .index("by_slug_and_tenant", ["slug", "tenantId"])
```

| Dato | Fuente | Estado |
|---|---|---|
| Total / Publicadas / Borradores / Privadas | `pages` agrupado por `status` | ⚠️ tabla por crear |
| Título, slug | `pages.title`, `pages.slug` | ⚠️ |
| Estado | `pages.status` — aquí **`private` sí existe** desde el principio | ⚠️ |
| Fecha | `pages.publishedAt` / `pages.updatedAt` | ⚠️ |
| Autor | `pages.authorDocId` → `users` | ⚠️ |
| Orden | `pages.order` | ⚠️ |

**Una página no es una entrada.** No tiene categorías, ni etiquetas, ni fecha de programación, ni
aparece en el feed. Reutilizar `posts` con una bandera `isPage` ensuciaría todas las consultas del
blog público; la tabla separada es la decisión.

El **editor de páginas es el mismo componente** que el de entradas (`editor.md`) con el rail
reducido a tres bloques: `Publicación`, `Imagen destacada` y `Extracto`. Sin `Categorías`, sin
`Etiquetas`.

━━━

## 3. Estados

### Carga

- `page-header`, barra de lista y cabecera de tabla se pintan ya; paginación deshabilitada.
- Stat cards: punto y label visibles; cifra → barra 96×34. **Sin fila de delta que reservar.**
- `SkeletonTabla`: 6 filas de **56px** (sin thumbnail), con handle, checkbox, dos barras de título
  (100 % y 55 %), badge, fecha y hueco de acciones.
- Cambio de orden o de página: la tabla baja a `opacity: .6` conservando la altura. **Sin volver al
  skeleton.**

### Vacío

| Causa | Presentación |
|---|---|
| **Nunca hubo** | `feedback/empty-state.md`: `file` · **`Aún no tienes páginas`** · `Crea tu página “Sobre mí” y empieza por ahí.` · botón **negro** `Nueva página`. Las stat cards se pintan igual, todas a `0` — aquí `0` **sí** es el dato correcto: son un censo, no una métrica sin fuente |
| **Búsqueda** | `search` · `Sin resultados para “contacto”` · `Prueba con otro término.` · botón **secundario** `Limpiar búsqueda`. Nunca el CTA de creación |
| **Filtro de estado** | Línea `No hay páginas privadas.` en `--fs-sm`/`--text-secondary` con `--sp-8` de aire |

### Error

- Tabla caída: `triangle-alert` en `--warn` · `No pudimos cargar tus páginas` · `Reintentar`. Las
  stat cards y la barra de lista permanecen.
- Una stat card caída no rompe la fila: muestra `—` con `triangle-alert` 16 junto al label.
- Reordenación rechazada: la fila vuelve a su posición con transición y salta toast de error con
  `Reintentar`. **El orden en pantalla nunca queda desincronizado del servidor sin avisar.**
- Datos previos sobreviven: banda `--warn-tint` sobre la tabla, nunca pantalla en blanco.

### Fila

- **Creación optimista** con fondo `--accent-tint` que se desvanece en 600 ms.
- **Eliminación**: la fila desaparece y salta `Movida a la papelera · Deshacer` durante 8 s.
- **Página fijada en el menú**: chip `En el menú` en `--accent-tint`/`--accent` junto al título.
  Es navegación del blog, por eso es índigo.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Todo visible. Métricas en 4 columnas. |
| **1024–1279** | Métricas 4 → 2. Se oculta `Autor`. Padding-x a `--sp-6`. |
| **768–1023** | Sidebar → drawer. Métricas en 2 columnas. |
| **<768** | Métricas en 1 columna. **Tabla → tarjetas apiladas**: título + slug + `Estado · Fecha` + `⋯`. **El reordenado por arrastre se desactiva**; en su lugar, el menú `⋯` ofrece `Mover arriba` / `Mover abajo`. Arrastrar en una lista con scroll táctil es una trampa. |

━━━

## 5. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| No existe la ruta | `app/panel/paginas/page.tsx` + `app/panel/paginas/[id]/page.tsx` |
| No existe la tabla | `pages` en `convex/schema.ts` + `convex/pages.ts` con queries y mutaciones |
| El blog público no las sirve | Ruta `app/[tenant]/[pageSlug]/` que resuelva páginas por slug |
| El menú del blog es fijo | Se alimenta de `pages.showInMenu` ordenado por `pages.order` |
| — | La tabla es `data-table.md`, la **misma** que Entradas y Categorías |

━━━

## 6. Reglas duras

1. **Un solo botón negro**: `Nueva página`.
2. Las stat cards de esta pantalla **no llevan delta**. Es un censo.
3. `0` es un dato válido aquí; `—` se reserva para cuando falta la fuente, no cuando el conteo es cero.
4. El handle solo existe con `Orden manual` activo.
5. El reordenado es optimista, reversible con `Deshacer` y accesible por teclado.
6. Sin arrastre en móvil: `Mover arriba` / `Mover abajo` en el menú.
7. El slug va en `--font-sans`. La monoespaciada es para código, no para "cosas técnicas".
