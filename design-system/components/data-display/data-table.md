# Data Table — tabla de datos

> La columna vertebral del panel. Aparece en `02-panel-resumen` (Entradas recientes),
> `03-panel-entradas`, `05-panel-paginas`, `06-panel-categorias` y `08-panel-analiticas`
> (Entradas más populares). **Una sola tabla configurable**, no cinco tablas parecidas.

Ruta destino: `components/admin/data-table/` — el primitivo `components/ui/table.tsx` (shadcn) ya
existe y se conserva como capa base; esta spec describe la capa de producto que lo envuelve.

━━━

## 1. Anatomía

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ ⠿  ☐  Título            Autor      Categorías   Estado     Fecha    SEO Score  ⚙  │ ← header
├───────────────────────────────────────────────────────────────────────────────────┤ ← hairline
│ ⠿  ☐ ▣  El futuro del   ◉ María    ⬭ IA         ⬭ Publicado 20 May   ◯95      ⋮  │ ← fila
│         trabajo: cómo…                                     10:30 AM               │
├───────────────────────────────────────────────────────────────────────────────────┤
│ ⠿  ☐ ▣  Guía completa…  ◉ María    ⬭ SEO        ⬭ Publicado 18 May   ◯90      ⋮  │
└───────────────────────────────────────────────────────────────────────────────────┘
  Mostrando 1 a 6 de 24 entradas                                    ‹ 1 2 3 … 4 ›
```

### 1.1 Contenedor

| Propiedad | Valor |
|---|---|
| Fondo | `--surface` |
| Borde | 1px `--border-hairline`, `--radius-card`, `overflow: hidden` (para que las esquinas recorten la primera y última fila) |
| Sombra | `--shadow-rest` |
| Ancho | 100% del contenido, `max-width: var(--content-max)` |
| Desbordamiento | `overflow-x: auto` con `scroll-snap` desactivado; la primera columna de contenido puede quedar `position: sticky; left: 0` en móvil |

### 1.2 Header

- Alto **48px**, fondo `--surface` (no `--surface-sunken`: las pantallas lo muestran blanco), borde
  inferior 1px `--border-hairline`.
- Etiquetas: `--fs-sm` (13), peso 500, `--text-secondary`, **sentence case** — `Título`, `Autor`,
  `SEO Score`. **Nunca mayúsculas ni tracking ampliado.**
- `position: sticky; top: var(--topbar-h); z-index: 1` cuando la tabla supera el alto de la ventana.
- **Botón ⚙ de columnas** al extremo derecho (`03`, `05`): icono `Settings2` 16px,
  `--text-tertiary` → `--text-secondary` en hover. Abre un popover con la lista de columnas
  ocultables (checkbox por columna). Ver §2.4.
- Columna ordenable: la etiqueta se vuelve `<button>`; al ordenar aparece `ChevronUp`/`ChevronDown`
  12px en `--accent` a la derecha del texto. El estado se refleja en `aria-sort`.

### 1.3 Fila

| Propiedad | Valor |
|---|---|
| Alto | **74px** con thumbnail y título de 2 líneas (`03`, `05`); **62px** en variante compacta (`02`, `08`); **53px** en variante densa (`06`) |
| Separador | Borde inferior 1px `--border-hairline`. **La última fila no lleva borde** (lo aporta el contenedor) |
| Padding horizontal | `--sp-5` en la primera y última celda, `--sp-4` entre celdas |
| Hover | Fondo `--surface-sunken`, transición `background-color var(--dur-fast) var(--ease-out)` |
| Seleccionada | Fondo `--accent-tint`; el checkbox queda marcado en `--accent` |
| Sin zebra | **Prohibido el rayado alternado.** El sistema separa con hairline y aire, no con bandas |

### 1.4 Celdas canónicas

| Celda | Composición |
|---|---|
| **Handle de arrastre `⠿`** | 20×20, icono lucide `GripVertical` 16px, `--text-tertiary` → `--text-secondary` en hover, `cursor: grab` / `grabbing`. Solo en listas reordenables (`05`, `06`). Ver §3.3 |
| **Checkbox de selección** | 16×16, `--radius-input` (parcial: 4px es aceptable en un check), borde `--border-strong`, marcado = fondo `--accent` + check blanco. El del header es tri-estado (`indeterminate` cuando hay selección parcial) |
| **Thumbnail** | 44×44, `--radius-thumb`, `object-fit: cover`, borde 1px `--border-hairline`. Fallback: cuadro `--surface-sunken` con icono `Image` en `--text-tertiary`. En `05` se sustituye por un cuadro 36×36 `--surface-sunken` con icono `FileText` en `--text-secondary` |
| **Título en dos líneas** | `--fs-body` (14/1.55), peso 500, `--text-primary`, `-webkit-line-clamp: 2`, `overflow-wrap: anywhere`. Enlace a la entrada; `hover` → `color: var(--accent)`, sin subrayado. Ancho de columna flexible (`1fr`), mínimo 240px |
| **Autor** | Avatar 24×24 circular + nombre `--fs-body` `--text-secondary`. Gap `--sp-2` |
| **Categorías** | 1–2 chips (ver `core/chip.md` variante `categoria` y `category-dot.md` §3); si hay más, `+N` en `--text-tertiary` con tooltip que lista el resto |
| **Estado** | Badge semántico: `Publicado` (canal verde) · `Borrador` (ámbar) · `Programado` (índigo) · `Privada` (neutro, con icono `Lock` 12px) · `Papelera` (rojo). **Fuente canónica: `core/badge.md`** — de ahí salen la forma, los tintes y el color de texto exacto. Esta tabla no redefine el badge, lo consume |
| **Fecha en dos líneas** | Línea 1: `20 May 2024`, `--fs-body`, `--text-primary`, `tabular-nums`. Línea 2: `10:30 AM`, `--fs-sm`, `--text-tertiary`, `tabular-nums`. Cuando no hay fecha: `—` en ambas |
| **Métrica numérica** | Alineada a la **derecha**, `tabular-nums` (`Visitas` en `08`, `Entradas` en `06`) |
| **SEO Score** | `score-ring` tamaño `sm` (32px). Sin dato → anillo vacío en `--border-hairline` con `—` al centro. Ver `score-ring.md` |
| **Menú ⋮** | Botón 32×32, `--radius-control`, icono `MoreVertical` 16px `--text-tertiary`. Hover: fondo `--surface-sunken`, icono `--text-secondary`. Abre `dropdown-menu` alineado a la derecha. La acción destructiva va al final, separada por un `separator`, en `--danger` |
| **Acciones inline** | `06` usa dos botones icono (`Pencil`, `Trash2`) en vez del menú ⋮. Regla: **≤2 acciones → botones inline; ≥3 → menú ⋮** |

### 1.5 Pie

- Texto `Mostrando 1 a 6 de 24 entradas` a la izquierda, `--fs-sm`, `--text-secondary`,
  `tabular-nums`. Paginación a la derecha: componente aparte, spec en `navigation/pagination.md`.
- El pie va **fuera** del contenedor con borde, separado por `--sp-4`, tal como en `03` y `06`.

━━━

## 2. Variantes

### 2.1 Densidad (`density`)

| Valor | Alto de fila | Dónde |
|---|---|---|
| `comoda` *(def.)* | 74px | `03`, `05` — filas con thumbnail y título de 2 líneas |
| `compacta` | 62px | `02`, `08` — tablas embebidas en una tarjeta de dashboard |
| `densa` | 53px | `06` — una línea por fila, sin thumbnail |

### 2.2 Selección (`selectable`)

Apagada por defecto. Encendida (`03`) añade la columna de checkbox y habilita la **barra de acciones
masivas**: aparece anclada sobre el header, fondo `--action`, texto `--text-on-dark`,
`--radius-control`, `--shadow-float`, con el conteo (`3 seleccionadas`) y los botones de acción.
Entra con `translateY(-4px) + opacity` en `--dur-base --ease-out`.

### 2.3 Reordenable (`reorderable`)

Enciende la columna del handle `⠿`. Ver §3.3.

### 2.4 Columnas configurables (`columns`)

Cada columna se declara con `{ id, label, ocultable, alineacion, ancho, orden }`. El botón ⚙ del
header lista las `ocultable: true`. La preferencia se guarda por usuario y por tabla
(`localStorage: cuaderno:tabla:<id>:columnas`). Las columnas `Título` y el menú de acciones son
**no ocultables**.

### 2.5 Vista de rejilla

`03`, `05` y `06` muestran un conmutador lista/rejilla arriba a la derecha (`toggle-group`). La
rejilla **no es esta tabla**: es un componente hermano (`card-grid`) que consume los mismos datos y
la misma configuración de columnas. Esta spec no lo cubre; solo fija que el conmutador vive fuera de
la tabla y que el estado se comparte.

━━━

## 3. Estados

### 3.1 De la tabla

| Estado | Comportamiento |
|---|---|
| **Cargando (primera vez)** | `skeleton` patrón `tabla`: header real + 6 filas fantasma con la misma altura (ver `feedback/skeleton.md` §3.1) |
| **Recargando (filtro/orden)** | La tabla existente baja a `opacity: .55` y queda `pointer-events: none`; **no** se reemplaza por skeleton. Evita el parpadeo al teclear en el buscador |
| **Vacía** | `empty-state` variante `tarjeta` **dentro** del contenedor de la tabla, conservando el header. Copy según causa: sin contenido → `Todavía no hay entradas` + CTA `Nueva entrada`; sin resultados → `Ningún resultado para "…"` + `Limpiar filtros` |
| **Error** | `alert` `destructivo` dentro del contenedor, con botón `Reintentar` |
| **Parcialmente vacía** (tab con 0) | El tab muestra el contador `Papelera (0)` y al entrar se ve el `empty-state` correspondiente |

### 3.2 De la fila

`reposo` · `hover` (fondo `--surface-sunken`) · `foco` (`--focus-ring` en el enlace del título, no en
la fila entera) · `seleccionada` (`--accent-tint`) · `arrastrando` (§3.3) · `optimista` (una fila
recién creada entra con `opacity 0 → 1` en `--dur-base`; una fila borrada sale con
`opacity → 0` + `height → 0` en `--dur-base`, y solo entonces se confirma en el servidor).

### 3.3 Arrastre

| Sub-estado | Visual |
|---|---|
| **Reposo** | Handle `⠿` en `--text-tertiary`, `opacity: 0` hasta el hover de la fila en escritorio; **siempre visible en táctil** |
| **Hover del handle** | `--text-secondary`, `cursor: grab` |
| **Arrastrando** | La fila se eleva: `--shadow-float`, `--radius-control`, borde `--border-strong`, `opacity: .95`, `cursor: grabbing`. El resto de filas se desplazan con `transform` en `--dur-fast --ease-out` |
| **Hueco de destino** | Fondo `--surface-sunken` con borde punteado 1px `--accent-border` |
| **Soltar** | La fila aterriza en `--dur-base --ease-out` y se guarda el orden. Toast `Orden actualizado` con acción `Deshacer` |
| **Inválido** | Sin destino válido, la fila vuelve a su sitio en `--dur-base`; sin color de error (no es un fallo del usuario) |

Librería sugerida para el arrastre: **`@dnd-kit/core` + `@dnd-kit/sortable`** — tiene sensor de
teclado nativo (`Espacio` toma, `↑/↓` mueve, `Espacio` suelta, `Esc` cancela), que es exactamente lo
que exige §5. No está en `package.json`: hay que añadirla.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Contenedor | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-rest` |
| Header — fondo / texto | `--surface` / `--text-secondary`, `--fs-sm` |
| Separador de fila | `--border-hairline` |
| Fila hover | `--surface-sunken` |
| Fila seleccionada | `--accent-tint` |
| Título | `--fs-body`, `--text-primary` → `--accent` en hover |
| Texto secundario (autor, slug) | `--text-secondary` |
| Hora, `+N`, handle | `--text-tertiary` |
| Thumbnail | `--radius-thumb`, `--border-hairline`, fallback `--surface-sunken` |
| Badge de estado (fondo, texto, forma) | Definidos en `core/badge.md`; la tabla solo elige la variante (`publicado`, `borrador`, `programado`, `privada`, `peligro`) |
| Checkbox marcado | `--accent` + `--text-on-dark` |
| Checkbox borde | `--border-strong` |
| Botón ⋮ hover | `--surface-sunken` |
| Acción destructiva del menú | `--danger` sobre `--danger-tint` en hover |
| Arrastre | `--shadow-float`, `--border-strong`, hueco `--accent-border` |
| Barra de acciones masivas | `--action`, `--text-on-dark`, `--shadow-float` |
| Foco | `--focus-ring` |
| Números | `tabular-nums` en fecha, hora, métricas, conteos y paginación |
| Movimiento | `--dur-fast` (hover), `--dur-base` (entrada/salida de fila, arrastre) |

━━━

## 5. Accesibilidad

- **Es una tabla de verdad**: `<table>` + `<thead>` + `<tbody>` + `<th scope="col">`. Nada de
  `div` con `role="grid"` salvo que se implemente el patrón de grid completo — y no hace falta.
- **Orden**: el `<th>` ordenable lleva `aria-sort="ascending" | "descending" | "none"` y su contenido
  es un `<button>`. El cambio de orden se anuncia con `aria-live="polite"`:
  `Ordenado por fecha, descendente`.
- **Selección**: cada checkbox lleva un label accesible por fila —
  `aria-label="Seleccionar «El futuro del trabajo»"`. El del header:
  `aria-label="Seleccionar todas las entradas de esta página"` + `aria-checked="mixed"` en parcial.
  El conteo de la barra masiva vive en una región `aria-live="polite"`.
- **El estado no se comunica solo por color.** El badge lleva **siempre la palabra**
  (`Publicado`, `Borrador`, `Programado`, `Privada`). El color es refuerzo, no mensaje. `Privada`
  añade además un icono de candado — segundo canal para el gris, que es el badge de menor contraste.
- **El SEO Score no se comunica solo por color.** El anillo lleva el número al centro y un
  `aria-label` con veredicto: `SEO Score 95 de 100, excelente`. Ver `score-ring.md` §5.
- **La categoría no se comunica solo por color.** El punto de color siempre va acompañado del
  nombre; el punto es `aria-hidden`. Ver `category-dot.md` §5.
- **Arrastre accesible (obligatorio)**: el handle es un `<button>` con
  `aria-label="Reordenar «Sobre mí». Pulsa Espacio para tomar el elemento"`, `aria-roledescription="elemento ordenable"`.
  Teclado: `Espacio` toma/suelta, `↑`/`↓` mueve, `Esc` cancela. Cada movimiento se anuncia en
  `aria-live="assertive"`: `«Sobre mí» movido a la posición 3 de 8`. **Una lista reordenable solo
  con ratón es una lista rota.**
- **Menú ⋮**: `aria-label="Acciones para «El futuro del trabajo»"` — nunca solo `Acciones`, porque
  en una tabla de 24 filas habría 24 botones con el mismo nombre accesible.
- **Foco visible**: `--focus-ring` en el enlace del título, el checkbox, el handle y el botón ⋮. La
  fila entera **no** es focusable: un `tabindex` por fila multiplica las paradas de tabulación.
- **Scroll horizontal**: el contenedor con `overflow-x: auto` lleva `tabindex="0"` y
  `aria-label="Tabla de entradas, desplazable horizontalmente"` para que se pueda desplazar con
  teclado.
- **Zona táctil**: `⋮`, `⠿`, checkbox y botones de acción alcanzan `--touch-target` (44px) mediante
  padding invisible, aunque su caja visual sea de 16–32px.
- **`prefers-reduced-motion: reduce`**: se anulan los `transform` de reordenamiento y las
  transiciones de entrada/salida de fila; el cambio se aplica de golpe.

━━━

## 6. Marcado de ejemplo

```tsx
<div
  tabIndex={0}
  aria-label="Tabla de entradas, desplazable horizontalmente"
  className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border-hairline)]
             bg-[var(--surface)] shadow-[var(--shadow-rest)]"
>
  <table className="w-full border-collapse text-left">
    <caption className="sr-only">Entradas del blog. 24 resultados, mostrando 1 a 6.</caption>

    <thead>
      <tr className="h-12 border-b border-[var(--border-hairline)]">
        <th scope="col" className="w-12 pl-[var(--sp-5)]">
          <Checkbox
            checked={todoSeleccionado ? true : algunoSeleccionado ? "indeterminate" : false}
            aria-label="Seleccionar todas las entradas de esta página"
          />
        </th>
        <th scope="col" aria-sort="none"
            className="px-[var(--sp-4)] text-[length:var(--fs-sm)] font-medium text-[var(--text-secondary)]">
          Título
        </th>
        <th scope="col" className="px-[var(--sp-4)] …">Autor</th>
        <th scope="col" className="px-[var(--sp-4)] …">Categorías</th>
        <th scope="col" className="px-[var(--sp-4)] …">Estado</th>
        <th scope="col" aria-sort="descending" className="px-[var(--sp-4)] …">
          <button className="inline-flex items-center gap-[var(--sp-1)]">
            Fecha <ChevronDown size={12} className="text-[var(--accent)]" aria-hidden="true" />
          </button>
        </th>
        <th scope="col" className="px-[var(--sp-4)] …">SEO Score</th>
        <th scope="col" className="w-14 pr-[var(--sp-5)]">
          <ColumnasPopover /> {/* botón ⚙ */}
          <span className="sr-only">Configurar columnas</span>
        </th>
      </tr>
    </thead>

    <tbody>
      {entradas.map((e) => (
        <tr
          key={e.id}
          data-seleccionada={seleccion.has(e.id) || undefined}
          className="h-[74px] border-b border-[var(--border-hairline)] last:border-0
                     transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                     hover:bg-[var(--surface-sunken)]
                     data-[seleccionada]:bg-[var(--accent-tint)]"
        >
          <td className="pl-[var(--sp-5)]">
            <Checkbox checked={seleccion.has(e.id)} aria-label={`Seleccionar «${e.titulo}»`} />
          </td>

          <th scope="row" className="px-[var(--sp-4)] font-normal">
            <div className="flex items-center gap-[var(--sp-3)]">
              <img src={e.imagen} alt="" width={44} height={44}
                   className="size-11 shrink-0 rounded-[var(--radius-thumb)] border
                              border-[var(--border-hairline)] object-cover" />
              <a href={`/panel/entradas/${e.id}`}
                 className="line-clamp-2 max-w-[260px] text-[length:var(--fs-body)] font-medium
                            text-[var(--text-primary)] hover:text-[var(--accent)]
                            focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">
                {e.titulo}
              </a>
            </div>
          </th>

          <td className="px-[var(--sp-4)]"><Autor {...e.autor} /></td>
          <td className="px-[var(--sp-4)]"><CategoriaChips items={e.categorias} /></td>
          <td className="px-[var(--sp-4)]"><EstadoBadge estado={e.estado} /></td>

          <td className="px-[var(--sp-4)] [font-variant-numeric:tabular-nums]">
            <div className="text-[length:var(--fs-body)] text-[var(--text-primary)]">{e.fecha}</div>
            <div className="text-[length:var(--fs-sm)] text-[var(--text-tertiary)]">{e.hora ?? "—"}</div>
          </td>

          <td className="px-[var(--sp-4)]"><ScoreRing valor={e.seo} size="sm" /></td>

          <td className="pr-[var(--sp-5)]">
            <AccionesMenu aria-label={`Acciones para «${e.titulo}»`} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<div className="mt-[var(--sp-4)] flex items-center justify-between">
  <p className="text-[length:var(--fs-sm)] text-[var(--text-secondary)] [font-variant-numeric:tabular-nums]">
    Mostrando 1 a 6 de 24 entradas
  </p>
  <Paginacion pagina={1} total={4} />
</div>
```

━━━

## 7. Reglas duras

1. **Una sola implementación.** `02`, `03`, `05`, `06` y `08` consumen el mismo componente con
   distinta `density` y distintas `columns`. Copiar la tabla por pantalla es el error que esta spec
   existe para impedir.
2. **Sin zebra, sin sombras internas, sin bordes verticales.** Solo hairlines horizontales.
3. **Toda columna numérica alineada a la derecha y con `tabular-nums`.**
4. **El badge lleva la palabra.** Nunca un punto de color solo para el estado.
5. **Arrastre con teclado o no hay arrastre.**
6. **La acción destructiva del menú ⋮ va al final, separada y en `--danger`**, y dispara el flujo de
   `feedback/confirm-dialog.md`.
