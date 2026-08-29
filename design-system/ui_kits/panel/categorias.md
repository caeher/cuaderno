# Panel · Categorías

> **Fuente:** `../../ui-ux-panels/06-panel-categorias.png`.
> **Ruta:** `app/panel/taxonomias/` → **separar en `app/panel/categorias/`** y
> `app/panel/etiquetas/`. Son dos taxonomías con dos comportamientos distintos y merecen dos
> pantallas (ver `etiquetas.md`).
> **Las pantallas mandan.**

━━━

## 1. Composición

Forma **B — ancho completo**, con fila de métricas.

```
page-header:  Categorías · «Organiza tus entradas por temas»        [ + Nueva categoría ]

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📁 Total │ │ 📈 Entr. │ │ # Más    │ │ 🏷 Sin   │
│    11    │ │   248    │ │ popular  │ │ categoría│
│          │ │          │ │   IA     │ │     3    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

barra de lista:  [ 🔍 Buscar categorías… ]     [ Ordenar: Nombre (A-Z) ▾ ]  [ ☰ | ▦ ]
┌───────────────────────────────────────────────────────────────────────────┐
│ ⠿ │ Nombre                │ Descripción           │ Entradas │  ✎    🗑   │
│───┼───────────────────────┼───────────────────────┼──────────┼────────────│
│ ⠿ │ ● Inteligencia Artif. │ Todo sobre IA aplicada│    48    │  ✎    🗑   │
└───────────────────────────────────────────────────────────────────────────┘
Mostrando 1 a 8 de 11 categorías                                    ‹ 1 2 ›
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` + `core/button.md` `Nueva categoría` (negro) |
| Métricas | `layout/content-grid.md` (4 col) × `data-display/stat-card.md` |
| Barra de lista | `forms/search-input.md` · `core/dropdown-menu.md` · *Pendiente* `core/segmented-control.md` |
| Tabla | `data-display/data-table.md`, `reorderable`, filas de **56px** |
| Punto de color | `data-display/category-dot.md` — **el componente protagonista de esta pantalla** |
| Acciones de fila | `core/icon-button.md` × 2 (`pencil`, `trash-2`) **visibles**, no ocultas tras `ellipsis` |
| Pie | `navigation/pagination.md` |
| Crear / editar | *Pendiente* `feedback/dialog.md` con `forms/form-field.md`, `forms/input.md`, `forms/textarea.md` y selector de color |

### Las cuatro stat cards

| Icono / tinte | Label | Cifra | Contexto |
|---|---|---|---|
| `folder` / `--cat-1` | Total de categorías | `11` | — |
| `trending-up` / `--cat-3` | Entradas en total | `248` | en todas las categorías |
| `hash` / `--cat-5` | Categoría más popular | `Inteligencia Artificial` en `--fs-h3` (no cabe en `--fs-h1`) | `48 entradas` |
| `tag` / `--cat-4` | Sin categoría | `3` | entradas por clasificar |

La tercera es la variante **de texto** de `stat-card.md`: cuando el valor es un nombre y no una
cifra, baja a `--fs-h3`/600 con `text-overflow: ellipsis` a una línea y el número real pasa a la
línea de contexto. Estirar un nombre largo en `--fs-h1` rompe la fila.

`Sin categoría` es accionable: la tarjeta entera enlaza a Entradas filtradas por sin-categoría.

### Las columnas

| Columna | Ancho | Contenido | Se oculta en |
|---|---|---|---|
| Handle `⠿` | 32px | `grip-vertical`, solo con `Orden manual` | `<768` |
| Nombre | auto | `category-dot` 8px + nombre `--fs-body`/500 + slug debajo `--fs-sm`/`--text-tertiary` | nunca |
| Descripción | `minmax(0, 1fr)` | `--fs-sm`/`--text-secondary`, **una línea** con `ellipsis` | 768–1023 |
| Entradas | auto | Cifra `tabular-nums` `--fs-body`, enlazada a Entradas filtradas | nunca |
| Acciones | 88px | `pencil` + `trash-2` | nunca |

**Por qué las acciones van visibles y no tras un `⋯`:** una categoría solo admite dos operaciones,
y ambas son frecuentes. Esconder dos iconos tras un menú añade un clic a la tarea principal de la
pantalla. En Entradas hay seis acciones y el menú sí se justifica.

`trash-2` va en `--text-tertiary` y pasa a `--danger` en hover (`guidelines/iconografia.md` §3).

━━━

## 2. El color de la categoría

Es la única pantalla donde el usuario **elige un color**, y por eso es donde el sistema puede
romperse. Reglas de `data-display/category-dot.md` y `guidelines/color.md` §9:

1. La paleta es **cerrada**: `--cat-1` … `--cat-8`. No hay selector de color libre, no hay campo
   hexadecimal, no hay rueda. Ocho opciones en un `radio-group` de puntos de 24px.
2. El color de categoría es **decorativo**: identifica, no significa. Que `--cat-3` sea el mismo
   verde que `--perf` es una coincidencia de paleta, no una semántica — por eso un punto de
   categoría **nunca** aparece donde pueda leerse como estado.
3. Al crear una categoría sin elegir color, se asigna el siguiente libre en orden. Si las ocho
   están en uso, se recicla la menos usada.
4. **El punto nunca viaja solo**: siempre lleva el nombre de la categoría al lado. El color no es
   el portador del significado.

`categories.color` guarda **el nombre del token** (`cat-1`…`cat-8`), no un hexadecimal. Guardar
`#6366F1` congelaría el modo claro dentro de la base de datos.

━━━

## 3. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Total de categorías | `categories` contadas por tenant | ✅ `convex/categories.ts` |
| Entradas en total | suma de `categories.postCount` | ✅ |
| Categoría más popular | `categories` ordenadas por `postCount` desc, primera | ✅ |
| Sin categoría | `posts` where `categoryDocId === undefined` | ✅ |
| Nombre, slug | `categories.name`, `categories.slug` | ✅ |
| Descripción | `categories.description` | ✅ (opcional) |
| Color | `categories.color` | ⚠️ hoy es `v.string()` libre. Debe **validarse contra `cat-1`…`cat-8`** en la mutación, no solo en la UI |
| Entradas | `categories.postCount` | ⚠️ contador desnormalizado: hay que mantenerlo en las mutaciones de `posts` o se desincroniza |
| Orden manual | — | ⚠️ **no existe `categories.order`**; hace falta para el handle de arrastre |
| Icono | `categories.icon` | ⚠️ existe en el esquema pero **la pantalla no lo usa**. O se elimina, o se documenta para el blog público |

━━━

## 4. Estados

### Carga

- `page-header`, barra de lista y cabecera de tabla se pintan ya; paginación deshabilitada.
- Stat cards: icono y label visibles; cifra → barra 96×34.
- `SkeletonTabla`: 6 filas de 56px con punto gris `--surface-sunken`, dos barras de nombre
  (60 % y 35 %), una barra de descripción al 80 %, cifra y hueco de acciones.
- Cambio de orden o de página: `opacity: .6`, altura conservada, sin volver al skeleton.

### Vacío

| Causa | Presentación |
|---|---|
| **Nunca hubo** | `feedback/empty-state.md`: `folder` · **`Aún no tienes categorías`** · `Organiza tus entradas por temas.` · botón **negro** `Nueva categoría` |
| **Búsqueda** | `search` · `Sin resultados para “diseño”` · `Prueba con otro término.` · botón **secundario** `Limpiar búsqueda` |
| **Categoría sin entradas** | La fila existe con `0` en la columna `Entradas`, en `--text-tertiary`. **No se oculta ni se marca como error**: una categoría recién creada está legítimamente vacía |

### Error

- Tabla caída: `triangle-alert` en `--warn` · `No pudimos cargar tus categorías` · `Reintentar`.
- Una stat card caída muestra `—` con `triangle-alert` junto al label; las otras siguen.
- Datos previos sobreviven: banda `--warn-tint` sobre la tabla.

### Crear y editar

Diálogo modal, no pantalla aparte — es un formulario de cuatro campos:

`Nombre` (obligatorio) · `Slug` (autogenerado, editable) · `Descripción` (opcional, 160 caracteres
con contador) · `Color` (radio-group de 8 puntos).

- **Slug duplicado**: borde `--danger` en el campo, mensaje `Ya existe una categoría con ese enlace`
  bajo el campo, `aria-invalid` y `aria-describedby`. El foco salta al primer campo con error.
- **Guardando**: el botón `Guardar` con `loader-circle` y **ancho fijo**; el formulario **no** se
  deshabilita entero.
- **Éxito**: el diálogo se cierra, la fila entra o se actualiza de forma optimista con fondo
  `--accent-tint` que se desvanece en 600 ms, y salta toast neutro `Categoría guardada`.

### Eliminar — la excepción destructiva de esta pantalla

Borrar una categoría **no es reversible desde la papelera**: afecta a las entradas que la usan. Por
eso aquí **sí hay diálogo de confirmación**, al contrario que en Entradas y Páginas.

`feedback/confirm-dialog.md`:
título `¿Eliminar “Inteligencia Artificial”?` · cuerpo `48 entradas quedarán sin categoría. Esta
acción no se puede deshacer.` · un `forms/select.md` opcional `Mover las entradas a: [ Ninguna ▾ ]` ·
`Cancelar` (secundario) y `Eliminar categoría` (destructivo, `--danger`).

Si la categoría **no tiene entradas**, el diálogo se salta: se elimina de inmediato con toast
`Categoría eliminada · Deshacer` durante 8 s. La confirmación se reserva a lo que tiene consecuencias.

━━━

## 5. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Todo visible. Métricas en 4 columnas. |
| **1024–1279** | Métricas 4 → 2. Padding-x a `--sp-6`. |
| **768–1023** | Sidebar → drawer. Métricas en 2 columnas. Se oculta `Descripción`. |
| **<768** | Métricas en 1 columna. **Tabla → tarjetas apiladas**: punto + nombre + descripción a una línea + `48 entradas` + los dos iconos de acción a la derecha, con área táctil de 44px. Arrastre desactivado; `Mover arriba` / `Mover abajo` desde un menú `⋯`. Diálogos de crear/editar a **hoja inferior** a pantalla casi completa. |

━━━

## 6. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| `app/panel/taxonomias/` (una sola pantalla) | `app/panel/categorias/` + `app/panel/etiquetas/` |
| `components/admin/taxonomies/taxonomy-manager.tsx` | Dos pantallas, **una sola** `data-table.md` |
| `categories.color` libre | Validado contra `cat-1`…`cat-8` en la mutación |
| Sin `order` | `categories.order: v.number()` + índice `by_tenant_and_order` |
| Sin stat cards | Cuatro tarjetas de `stat-card.md` |
| Sin paginación | `navigation/pagination.md` |
| Borrado sin consecuencias visibles | Diálogo con conteo de entradas afectadas y reasignación opcional |

━━━

## 7. Reglas duras

1. **Un solo botón negro**: `Nueva categoría`.
2. Paleta cerrada de ocho. Sin selector libre, sin campo hexadecimal.
3. Se guarda el **nombre del token**, nunca un hexadecimal.
4. El punto de color nunca viaja sin su nombre al lado.
5. Un punto de categoría nunca aparece donde pueda confundirse con un estado.
6. Diálogo de confirmación **solo** si la categoría tiene entradas.
7. `0` entradas es un dato válido, no un error ni un vacío.
