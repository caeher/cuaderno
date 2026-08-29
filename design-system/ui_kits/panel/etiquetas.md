# Panel · Etiquetas

> **Fuente:** ninguna de las 9 pantallas dibuja esta vista. El sidebar sí la lista
> (`tag` Etiquetas, grupo de contenido), y `04-panel-editor-de-entrada.png` muestra las etiquetas
> como chips con `×`. Esta pantalla se **deriva** de Categorías, no se inventa.
> **Ruta:** `app/panel/etiquetas/` — **no existe todavía** (hoy vive dentro de `taxonomias/`).
> **Las pantallas mandan:** si una pantalla futura dibuja Etiquetas, manda ella.

━━━

## 1. Por qué es una pantalla distinta de Categorías

Comparten el 80 % del chasis y **la misma `data-table.md`**, pero tres diferencias reales
justifican separarlas — y justifican no clonar el archivo:

| | Categorías | Etiquetas |
|---|---|---|
| Cardinalidad | Pocas (5–15), curadas | Muchas (decenas o cientos), orgánicas |
| Relación | Una entrada, una categoría | Una entrada, muchas etiquetas |
| Color | Paleta cerrada `--cat-1…8`, obligatorio | **Sin color.** Neutro siempre |
| Orden | Manual, con handle de arrastre | **Sin orden manual**: por uso o alfabético |
| Operación típica | Crear y editar | **Fusionar, renombrar y limpiar** |
| Vista por defecto | Tabla | **Nube de chips**, con tabla como alternativa |

━━━

## 2. Composición

Forma **B — ancho completo**.

```
page-header:  Etiquetas · «Las palabras con las que conectas tus entradas»   [ + Nueva etiqueta ]

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🏷 Total │ │ 📈 Usos  │ │ # Más    │ │ ⚠ Sin    │
│    64    │ │   412    │ │ usada IA │ │ usar  12 │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

barra de lista: [ 🔍 Buscar etiquetas… ]   [ Ordenar: Más usadas ▾ ]   [ ☁ | ☰ ]
┌───────────────────────────────────────────────────────────────────────────┐
│  IA 48   Futuro 31   Trabajo 22   Diseño 18   SEO 14   Convex 9   …       │  ← nube
└───────────────────────────────────────────────────────────────────────────┘
Mostrando 1 a 24 de 64 etiquetas                                  ‹ 1 2 3 ›
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` + `core/button.md` `Nueva etiqueta` (negro) |
| Métricas | `layout/content-grid.md` (4 col) × `data-display/stat-card.md` |
| Alternador de vista | *Pendiente* `core/segmented-control.md` — **nube / tabla** (no lista/grilla: aquí el par es otro) |
| Nube | `core/chip.md` en su variante **contador**, envueltos en `flex-wrap` con gap `--sp-3` |
| Tabla | `data-display/data-table.md`, `selectable`, filas de **56px**, **sin `reorderable`** |
| Pie | `navigation/pagination.md` |
| Crear / editar / fusionar | *Pendiente* `feedback/dialog.md` + `forms/form-field.md` + `forms/combobox.md` |

### Las cuatro stat cards

| Icono / tinte | Label | Cifra | Contexto |
|---|---|---|---|
| `tag` / `--cat-1` | Total de etiquetas | `64` | — |
| `trending-up` / `--cat-3` | Usos en total | `412` | en 48 entradas |
| `hash` / `--cat-5` | Etiqueta más usada | `IA` (`--fs-h3` si es larga) | `48 entradas` |
| `triangle-alert` / `--cat-8` | Sin usar | `12` | etiquetas huérfanas |

`Sin usar` es accionable: la tarjeta filtra la lista a las etiquetas con `postCount === 0` y
habilita la acción en lote `Eliminar sin usar`. Es la tarea de mantenimiento real de esta pantalla.

**El icono `triangle-alert` va en `--text-secondary` dentro de un cuadro `--cat-8` neutro, no en
`--warn`.** Doce etiquetas sin usar no es una advertencia del sistema: es información.

### La nube de chips — vista por defecto

Cada etiqueta es un `core/chip.md` en variante contador:
alto 28, `--radius-pill`, fondo `--surface`, borde `--border-hairline`, `--fs-sm`/500 en
`--text-primary` + contador `--fs-label`/`--text-tertiary` en `tabular-nums`.

- **Sin escalado tipográfico por frecuencia.** Una nube donde el tamaño de letra codifica el uso es
  ilegible y rompe la escala de siete niveles. La frecuencia se lee en el contador.
- **Sin color por etiqueta.** Todas neutras: el color de este sistema significa algo, y "esta
  etiqueta existe" no es un significado.
- Hover: fondo `--surface-sunken`. Foco: `--focus-ring`. Clic: navega a Entradas filtradas.
- Selección múltiple: `Cmd`/`Ctrl` + clic marca chips (fondo `--accent-tint`, borde
  `--accent-border`) y abre la barra de acciones en lote.

### La vista de tabla

| Columna | Ancho | Contenido |
|---|---|---|
| Checkbox | 40px | `forms/checkbox.md` |
| Nombre | `minmax(0, 1fr)` | Nombre `--fs-body`/500 + slug `--fs-sm`/`--text-tertiary` |
| Entradas | auto | Cifra `tabular-nums`, enlazada a Entradas filtradas |
| Último uso | auto | Fecha `--fs-sm`, `tabular-nums`; `—` si nunca se usó |
| Acciones | 88px | `pencil` + `trash-2` visibles, como en Categorías |

### Acciones en lote — el motivo de esta pantalla

Barra en el lugar de la barra de lista (no encima), `--accent-tint`, borde `--accent-border`:

- **`Fusionar…`** — abre diálogo: `Fusionar 3 etiquetas en:` + `combobox` con etiqueta destino
  (existente o nueva). Cuerpo: `Las 3 etiquetas desaparecerán y sus 27 entradas pasarán a “IA”.
  Esta acción no se puede deshacer.` Es la operación que mantiene sana una taxonomía orgánica.
- **`Eliminar`** — con diálogo si alguna tiene entradas; directo con `Deshacer` si están todas
  huérfanas.
- **`Renombrar`** — solo con una etiqueta seleccionada.

━━━

## 3. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Total, nombre, slug | `tags.name`, `tags.slug` | ✅ `convex/tags.ts` |
| Entradas por etiqueta | `tags.postCount` | ⚠️ contador desnormalizado: hay que mantenerlo en cada mutación de `posts` |
| Usos en total | suma de `tags.postCount` | ✅ |
| Sin usar | `tags` where `postCount === 0` | ✅ |
| Último uso | — | ⚠️ **no existe.** Requiere `tags.lastUsedAt: v.optional(v.string())` |
| Color | `tags.color` | ⚠️ existe en el esquema y **esta pantalla no lo usa**. Se ignora en la UI; eliminarlo del esquema o documentar que es para el blog público |

### El problema de fondo: `posts.tags` son strings

`posts.tags: v.array(v.string())` guarda **nombres**, no ids. Consecuencias que esta pantalla hace
visibles:

1. **Renombrar** una etiqueta obliga a reescribir el array de todas las entradas que la usan.
2. **Fusionar** obliga a lo mismo, con deduplicación dentro de cada array.
3. Una etiqueta puede existir en `posts.tags` sin tener fila en `tags` (etiqueta fantasma) y al revés.

Dos salidas, y hay que elegir una **antes** de construir esta pantalla:

- **A — migrar a ids**: `posts.tagIds: v.array(v.id("tags"))`. Correcto, con migración de datos.
- **B — conservar strings** y aceptar que renombrar y fusionar son mutaciones de escritura masiva,
  ejecutadas en una acción de Convex por lotes, con estado de progreso en la UI.

La UI que describe este documento funciona con las dos. **La opción B exige un estado extra**
(§4, *Operación larga*).

━━━

## 4. Estados

### Carga

- `page-header`, barra de lista, alternador y cabecera se pintan ya.
- Stat cards: icono y label ya visibles; cifra → barra 96×34.
- **Nube**: 24 chips fantasma con anchos variados (60–140px) y alto 28, en `--surface-sunken`.
  Anchos irregulares, no todos iguales: un skeleton de nube con chips idénticos no promete la
  forma real.
- **Tabla**: `SkeletonTabla` de 6 filas de 56px.
- Cambio de orden, de página o de vista: `opacity: .6` conservando la altura. Alternar nube ↔ tabla
  **no vuelve a pedir el dato**.

### Vacío

| Causa | Presentación |
|---|---|
| **Nunca hubo** | `feedback/empty-state.md`: `tag` · **`Aún no tienes etiquetas`** · `Las etiquetas se crean al escribir una entrada.` · botón **secundario** `Nueva entrada`. Es el único vacío del panel cuyo CTA **no** es crear el objeto de la pantalla: crear una etiqueta suelta, sin entrada que la use, no sirve para nada |
| **Búsqueda** | `search` · `Sin resultados para “convex”` · `Prueba con otro término.` · botón secundario `Limpiar búsqueda` |
| **Filtro “sin usar” vacío** | Línea `No hay etiquetas sin usar.` en `--fs-sm`/`--text-secondary` con `--sp-8` de aire. Es una buena noticia, no un vacío que resolver |

### Error

- Lista caída: `triangle-alert` en `--warn` · `No pudimos cargar tus etiquetas` · `Reintentar`.
- Stat card caída: `—` con `triangle-alert` junto al label; las demás siguen.
- Datos previos sobreviven: banda `--warn-tint` sobre la lista.

### Operación larga (fusionar o renombrar con muchas entradas)

Es la única operación del panel que puede tardar más de dos segundos sin ser una llamada de IA.
Se le aplican las mismas cortesías (`guidelines/estados.md` §7):

- Botón ocupado con **ancho fijo** y contador a partir de los 5 s: `Fusionando… 6s`.
- Progreso textual bajo el diálogo: `Actualizando 27 entradas…`, no barra de progreso falsa.
- **La lista no se bloquea** mientras corre.
- Al terminar: toast `3 etiquetas fusionadas en “IA”` y la lista se refresca.
- Si falla a mitad: `feedback/alert.md` en el diálogo con `Se actualizaron 12 de 27 entradas` +
  `Reintentar las restantes`. **Nunca se deja al usuario sin saber qué quedó a medias.**

━━━

## 5. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Métricas en 4 columnas. Nube a ancho completo. |
| **1024–1279** | Métricas 4 → 2. |
| **768–1023** | Sidebar → drawer. Métricas en 2 columnas. La tabla oculta `Último uso`. |
| **<768** | Métricas en 1 columna. **La nube es la única vista**: es la que mejor aprovecha un ancho estrecho, y el alternador se oculta. Chips con área táctil de 44px de alto. Selección por pulsación larga. Barra de acciones en lote anclada abajo (`position: sticky; bottom: 0`) con `--shadow-float`. |

━━━

## 6. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| `app/panel/taxonomias/` | `app/panel/etiquetas/` propio |
| `components/admin/taxonomies/taxonomy-manager.tsx` | Nube de chips + `data-table.md` compartida con Categorías |
| `posts.tags` como strings | Decisión A (ids) o B (strings + mutación por lotes) **antes** de construir |
| Sin `lastUsedAt` | `tags.lastUsedAt: v.optional(v.string())` |
| `tags.color` sin uso | Eliminar del esquema o documentar su destino |
| Sin fusionar | Acción en lote `Fusionar…` con su diálogo y su estado largo |

━━━

## 7. Reglas duras

1. **Un solo botón negro**: `Nueva etiqueta`.
2. **Las etiquetas no tienen color.** Neutras siempre.
3. La nube no escala la tipografía por frecuencia. El contador lleva ese dato.
4. Sin orden manual, sin handle de arrastre.
5. Fusionar y eliminar con entradas **exigen diálogo**; eliminar huérfanas va con `Deshacer`.
6. Toda operación por lotes informa de su progreso y de lo que quedó a medias si falla.
7. El vacío inicial apunta a `Nueva entrada`, no a `Nueva etiqueta`.
