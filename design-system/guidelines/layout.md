# Layout

> Fuente: las 9 pantallas de `../ui-ux-panels/`. Donde el código y una pantalla no coincidan, gana la pantalla.
> Todo valor de espacio sale de la escala `--sp-*`. Ritmo vertical de 4px. Ningún número suelto.

━━━

## 1. El chrome del panel

```
┌──────────────┬──────────────────────────────────────────────────────┐
│              │  topbar 64px                          hairline abajo │
│  sidebar     ├──────────────────────────────────────────────────────┤
│  260px       │                                                      │
│  --bg-sidebar│  área de contenido — --bg-page                       │
│  hairline    │  padding-x --sp-8 · max-width --content-max          │
│  a la derecha│                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

```css
.panel-shell { display: grid; grid-template-columns: var(--sidebar-w) minmax(0, 1fr); min-height: 100dvh; }
```

`minmax(0, 1fr)` no es opcional: sin él, una tabla ancha revienta la columna y el `body` scrollea en horizontal.

### 1.1 Sidebar — 260px

Fondo `--bg-sidebar`, borde derecho 1px `--border-hairline`, altura completa, scroll propio (`overflow-y: auto`) con el pie fijo abajo. Padding horizontal `--sp-4`.

**Cabecera.** Lockup horizontal (isotipo 26 + wordmark 22/600), altura de bloque igual a `--topbar-h` para que la línea base del logo case con la del buscador. Padding `--sp-5 --sp-4`.

**Grupo 1 — contenido.** Resumen · Entradas · Páginas · Categorías · Etiquetas · Comentarios · Diseño · Ajustes.

**Divisor.** 1px `--border-hairline`, márgenes `--sp-4` arriba y abajo, ancho: el del sidebar menos el padding. **El divisor es el único separador; los grupos no llevan rótulo.** Si alguna vez se rotulan, van en `--fs-label` / `--text-tertiary`.

**Grupo 2 — IA.** IA Writer · SEO Analyzer · Analíticas.

**Item de nav.** Altura 40px (44 en `<1024`), `--radius-control`, padding-x `--sp-3`, icono 20 + gap `--sp-3` + texto `--fs-body`.

| Estado | Fondo | Texto e icono |
|---|---|---|
| Reposo | transparente | `--text-secondary`, weight 500 |
| Hover | `--surface-sunken` | `--text-primary` |
| Activo | `--accent-tint` | `--accent`, weight 600 |
| Foco | + `--focus-ring` | — |

Sin barra lateral de acento, sin negrita adicional, sin icono relleno: las pantallas resuelven el activo solo con tinte y color.

**Pie del sidebar** (fijo abajo, separado del scroll, gap `--sp-3`):
1. **Selector de blog** — tarjeta de 56px de alto, `--surface`, borde `--border-hairline`, `--radius-control`, padding `--sp-3`. Dentro: `globe` 20 en `--text-secondary`, luego dos líneas (`Mi blog` en `--fs-body`/600, `miblog.cuaderno.com` en `--fs-sm`/`--text-tertiary` truncado), y `chevrons-up-down` a la derecha.
2. **Tarjeta Cuaderno Pro** — fondo `--accent-tint`, borde `--accent-border`, `--radius-card`, padding `--sp-4`. `sparkle` índigo 20, título `--fs-body`/600, cuerpo `--fs-sm`/`--text-secondary` en 2–3 líneas, y `Ver planes →` como botón de superficie blanca con texto `--accent`. Se oculta por completo cuando el plan ya es Pro.
3. **Toggle de tema** (pantallas 05–09) — fila de 44px, `--radius-control`, borde `--border-hairline`: switch + `sun`/`moon` + `Modo claro`, con `chevrons-up-down` para ciclar claro / oscuro / sistema.

### 1.2 Topbar — 64px

`position: sticky; top: 0; z-index: 30`. Fondo `--surface`, hairline inferior, padding-x `--sp-6`, contenido alineado a la derecha con gap `--sp-4`.

- **Buscador** — 320px (380 en `≥1440`), alto 40, `--radius-control`, borde `--border-hairline`, fondo `--surface`. `search` 16 en `--text-tertiary`, placeholder `Buscar…` en `--fs-body`/`--text-tertiary`, y a la derecha el chip `⌘K`: alto 20, `--surface-sunken`, `--radius-input`, `--fs-label`, `--text-tertiary`. En foco: `--focus-ring` y borde `--border-strong`. Abre la paleta de comandos.
- **Toggle de tema** — botón de icono 40×40, `--radius-control`, `sun`/`moon`.
- **Notificaciones** — botón de icono 40×40, `bell` + punto `--accent` de 6px.
- **Menú de usuario** — avatar 32 circular + nombre `--fs-body`/500 + `chevron-down`. En `<1024` el nombre desaparece y queda solo el avatar.

**La topbar del editor es la única excepción** (pantalla 04): a la izquierda `← Volver a entradas`; a la derecha `✓ Guardado` (estado, `--text-secondary`), `Vista previa` (secundario), `Publicar` (negro, split con `chevron-down`), y después el trío tema / campana / usuario. No hay buscador. Ninguna otra pantalla altera la topbar.

### 1.3 Header de página

```
Resumen                                          [ + Nueva entrada ▾ ]
Aquí tienes el rendimiento de tu blog.
```

- Padding superior `--sp-8`, inferior `--sp-6`.
- H1 en `--fs-h1`, gap de `--sp-2` hasta el subtítulo en `--fs-sm`/`--text-secondary`.
- Acciones alineadas **al centro vertical del H1**, no del bloque.
- Máximo dos acciones: la primaria negra y una secundaria a su izquierda (`Filtros`, `Vista previa`).
- Cuando hay tabs (03, 07, 08), van **debajo** del header, con `--sp-6` de separación y un hairline de ancho completo bajo la fila de tabs; el tab activo lleva subrayado de 2px `--accent` pegado a ese hairline.

━━━

## 2. Grilla de contenido

Área de contenido: `max-width: var(--content-max)` centrada, `padding-inline: var(--sp-8)` (sube a `--sp-12` en `≥1440`), `padding-bottom: var(--sp-12)`.

**El sistema tiene dos formas de página, no doce.**

**Forma A — con rail derecho** (02 Resumen, 07 SEO Analyzer, 09 Ajustes, 04 Editor):

```css
.pagina-con-rail { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: var(--sp-6); align-items: start; }
```

El rail es de **ancho fijo 320px** (340 en el editor) y `position: sticky; top: calc(var(--topbar-h) + var(--sp-6))`. Nunca contiene el CTA primario. Ajustes añade una tercera columna a la izquierda: `200px minmax(0,1fr) 300px`, con la nav secundaria vertical de 11 secciones (mismo estilo de item que el sidebar, activo en `--accent-tint`).

**Forma B — ancho completo** (03 Entradas, 05 Páginas, 06 Categorías, 08 Analíticas): una sola columna; la estructura interna la dan las tarjetas.

**Fila de métricas.** `grid-template-columns: repeat(N, minmax(0, 1fr))`, gap `--sp-4`. N = 4 en 02/05/06, N = 5 en 08.

**Analíticas** apila tres bandas: métricas (5 col) → `1fr 1fr` (gráfico + donut) → `1fr 1fr` (populares + dispositivos), todas con gap `--sp-6`.

━━━

## 3. Los contenedores

**Tarjeta.** `--surface`, borde 1px `--border-hairline`, `--radius-card`, padding `--sp-5` (`--sp-6` si contiene un gráfico). Sombra: ninguna por defecto; `--shadow-rest` como máximo. Gap entre tarjetas `--sp-6`. Cabecera de tarjeta: título `--fs-h2` a la izquierda y, a la derecha, un enlace `Ver todas →` en `--accent` o un selector (`Últimos 30 días ▾`), separados del cuerpo por `--sp-4`.

**Stat card.** Padding `--sp-5`. Fila superior: cuadro de icono 40×40 (`--radius-input`, tinte `--cat-N`) + label en `--fs-sm`/`--text-secondary`. Debajo, con `--sp-3`: cifra en `--fs-h1` `tabular-nums` + delta a su derecha alineado a la línea base. Abajo, con `--sp-2`: contexto en `--fs-sm`/`--text-tertiary` (`vs. últimos 30 días`). Variantes vistas en las pantallas: con anillo de score a la derecha (02), con sparkline bajo la cifra (07), con punto de estado en lugar de cuadro (05).

**Tabla.** Vive dentro de una tarjeta; el borde de la tarjeta es el borde de la tabla y **no hay bordes verticales**.
- Cabecera: `--fs-sm`/500/`--text-secondary`, fondo transparente, hairline inferior, alto 48.
- Fila: **72px** con thumbnail, **56px** sin él. Separador: hairline. Hover: `--surface-sunken`. Sin cebra.
- Columnas fijas: checkbox 40px a la izquierda; acciones 56px a la derecha, alineadas al final.
- Thumbnail 56×56, `--radius-thumb`, `object-fit: cover`.
- Handle `grip-vertical` (05, 06) en una columna de 32px antes del contenido, visible en `--text-tertiary` y activo al arrastrar.
- Padding-x de la tabla `--sp-5`; entre columnas, `--sp-4`.
- Pie: `Mostrando 1 a 6 de 24 entradas` en `--fs-sm`/`--text-secondary` a la izquierda, paginación a la derecha, ambos fuera de la tarjeta, con `--sp-4` de separación.
- Cabecera `sticky` dentro de la tarjeta cuando la tabla supera 12 filas.

**Barra de herramientas de lista** (03, 05, 06), entre las tabs y la tabla, alto 40, separada `--sp-4` arriba y abajo: buscador a la izquierda (240–280px); a la derecha, selector de orden (`Más recientes ▾`, `Ordenar: Nombre (A-Z) ▾`) y el par de botones lista/grilla en un grupo segmentado con `--radius-control` y hairline, con el activo en `--accent-tint`.

**Controles.**
| Control | Alto | Radio |
|---|---|---|
| Botón primario / secundario | 40 (44 en `<1024`) | `--radius-control` |
| Botón de icono | 40×40 | `--radius-control` |
| Input, select, textarea | 40 (textarea min 96) | `--radius-input` |
| Badge / chip / píldora | 24 | `--radius-pill` |
| Item de nav | 40 | `--radius-control` |
| Tarjeta | — | `--radius-card` |
| Thumbnail | 56 | `--radius-thumb` |

Los formularios de Ajustes van en **dos columnas** dentro de la tarjeta (`1fr 1fr`, gap `--sp-5` horizontal y `--sp-4` vertical), con label `--fs-body`/500 arriba del campo separado por `--sp-2`. Un campo largo (`Descripción corta`) ocupa una columna completa en altura, no las dos.

━━━

## 4. Capas

No son tokens de diseño; viven en el código como constantes.

`0` base · `10` cabecera sticky de tabla · `30` topbar y sidebar · `40` overlay y drawer móvil · `50` dropdown, popover, bubble menu del editor · `60` toast · `70` diálogo modal.

━━━

## 5. Comportamiento responsive

Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

### ≥1280 — canónico
Tal cual las pantallas: sidebar 260 fijo, rail 320, métricas en 4 o 5 columnas.

### 1024–1279 — escritorio estrecho
- Sidebar y topbar sin cambios.
- **El rail baja**: pasa a ancho completo debajo del contenido principal y reparte sus tarjetas en `repeat(auto-fit, minmax(280px, 1fr))`. Deja de ser sticky.
- Métricas: 4 → 2 columnas; las 5 de Analíticas → 3 + 2.
- Padding-x del contenido a `--sp-6`.
- Tablas: se ocultan primero `Autor`, luego `Categorías`. `Título`, `Estado`, `Fecha` y las acciones no se ocultan nunca.

### 768–1023 — tablet
- **El sidebar se convierte en drawer.** Aparece un botón `menu` a la izquierda de la topbar (elemento que las pantallas no muestran: es la extensión mínima necesaria, y se resuelve con el icono `menu`, sin inventar nada más). El drawer se desliza desde la izquierda a 260px sobre un overlay de negro al 40%, se cierra con `Esc`, con clic fuera y al navegar, y devuelve el foco al botón.
- El buscador de la topbar colapsa a botón de icono que abre la paleta ⌘K.
- Métricas en 2 columnas. Forma A pierde el rail (baja, apilado).
- Ajustes: la nav secundaria pasa de columna a fila de chips con scroll horizontal, encima del formulario.
- Formularios a una sola columna.
- Editor: el rail de publicación se convierte en **hoja inferior** que se abre desde `Publicar ▾` o desde un botón `Opciones`; el documento ocupa el ancho completo.

### <768 — móvil
- Drawer a pantalla completa. Topbar de 56px con `menu`, lockup centrado y avatar.
- Header de página apilado: H1, subtítulo, y las acciones abajo a ancho completo (la primaria arriba).
- **Las tablas de gestión se convierten en tarjetas apiladas**, nunca en scroll horizontal. Cada tarjeta: thumbnail 48 + título en 2 líneas + fila de metadatos (`Estado · Fecha`) + `⋯` a la derecha. Selección múltiple mediante pulsación larga o modo selección explícito.
- Métricas en 1 columna, o en carrusel horizontal con `scroll-snap` cuando son 5.
- Gráficos: alto mínimo 220px; es el único contenido al que se le permite scroll horizontal propio, con la leyenda apilada debajo.
- Tabs con scroll horizontal, sin cortar la etiqueta activa.
- Editor: toolbar de TipTap sticky bajo la topbar, con scroll horizontal y el botón `Escribir con IA` anclado al final visible.
- `--touch-target: 44px` como mínimo real en toda fila, botón de icono, casilla y menú.

### Reglas transversales
- **Ni un solo scroll horizontal en `<body>`.** Lo que no cabe, scrollea dentro de su propio contenedor con `overflow-x: auto`.
- La topbar y el sidebar **no se desmontan** al navegar: solo cambia el área de contenido.
- El foco se mueve al `<h1>` de la pantalla nueva tras cada navegación; hay un enlace `Saltar al contenido` como primer elemento enfocable del documento.
- `prefers-reduced-motion`: se anulan las transiciones de entrada del drawer, el shimmer de los skeletons y la animación del anillo de score; se conservan los cambios de color en `--dur-fast`.
- Zoom al 200% sin pérdida de contenido: nada se posiciona con alturas fijas en px que recorten texto.
