# Panel · Resumen — el dashboard

> **Fuente:** `../../ui-ux-panels/02-panel-resumen.png`.
> **Ruta:** `app/panel/page.tsx` — **existe**.
> **Las pantallas mandan:** donde el código actual y la pantalla difieran, se adapta el código.

━━━

## 1. Composición

Forma **A — con rail derecho** (`layout/content-grid.md`, `layout/split-view.md`):
`grid-template-columns: minmax(0, 1fr) 320px`, gap `--sp-6`, `align-items: start`.

```
┌ panel-shell ─────────────────────────────────────────────────────────────┐
│ sidebar │ topbar                                                          │
│ 260px   ├───────────────────────────────────────────────────────────────  │
│         │ page-header: Resumen · «Aquí tienes el rendimiento de tu blog»  │
│         │                                        [ + Nueva entrada ▾ ]    │
│         │ ┌────────────────────────────────────┐ ┌──────────────────────┐ │
│         │ │ 4 × stat-card                      │ │ SEO Analyzer         │ │
│         │ └────────────────────────────────────┘ │  score-ring +        │ │
│         │ ┌────────────────────────────────────┐ │  metric-list corta   │ │
│         │ │ Entradas recientes    Ver todas → │ ├──────────────────────┤ │
│         │ │ data-table (6 filas)               │ │ ✦ Sugerencia de IA   │ │
│         │ └────────────────────────────────────┘ ├──────────────────────┤ │
│         │ ┌────────────────────────────────────┐ │ Publicaciones        │ │
│         │ │ Rendimiento en el tiempo   30d ▾  │ │ programadas          │ │
│         │ │ line-chart                         │ └──────────────────────┘ │
│         │ └────────────────────────────────────┘                          │
│         │ ┌────────────────────────────────────────────────────────────┐  │
│         │ │ Acciones rápidas                                            │  │
│         │ └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` (variante estándar) |
| Cabecera | `layout/page-header.md` con acción primaria `core/button.md` (split con `core/dropdown-menu.md`) |
| Métricas | `layout/content-grid.md` (4 columnas) × `data-display/stat-card.md` |
| Entradas recientes | Tarjeta con cabecera (`Ver todas →` en `--accent`) + `data-display/data-table.md` (`density="cómoda"`, 6 filas) + `core/badge.md` + `data-display/score-ring.md` (tamaño `sm`) + `core/avatar.md` + `core/dropdown-menu.md` en la columna de acciones |
| Rendimiento | Tarjeta + `data-display/line-chart.md` + selector `Últimos 30 días ▾` (`core/dropdown-menu.md`) |
| Acciones rápidas | Fila de 4 tarjetas-botón: icono 24 en cuadro 48 `--surface-sunken` + título `--fs-h3` + descripción `--fs-sm`. Toda la tarjeta es un enlace |
| Rail | `layout/split-view.md` con tres tarjetas apiladas, gap `--sp-6`, `position: sticky; top: calc(var(--topbar-h) + var(--sp-6))` |

### Las cuatro stat cards

| Icono / tinte | Label | Cifra | Delta | Contexto |
|---|---|---|---|---|
| `eye` / `--cat-2` | Visualizaciones | `24.8K` | `↑ 12.4 %` | vs. últimos 30 días |
| `users` / `--cat-1` | Visitantes | `8 412` | `↑ 6.1 %` | vs. últimos 30 días |
| `file-text` / `--cat-3` | Entradas publicadas | `48` | `↑ 3` | este mes |
| `trending-up` / `--cat-4` | SEO Score promedio | `86` + `score-ring` `sm` | `↑ 4` | vs. últimos 30 días |

La cuarta es la variante `con anillo` de `stat-card.md` §2.1. El anillo va en `--perf` porque 86
cae en la banda verde (`color.md` §7).

### Las tres tarjetas del rail

1. **SEO Analyzer** — `score-ring` grande + veredicto (`92 · Excelente`) + `metric-list.md` de 4
   factores + enlace `Ver análisis completo →` en `--accent`.
2. **Sugerencia de IA** — `sparkles` índigo + título `--fs-h3` + cuerpo `--fs-sm` de 3 líneas +
   `Aplicar sugerencia` (secundario) y `Descartar` (fantasma). Fondo `--accent-tint`, borde
   `--accent-border`: es el producto pensando.
3. **Publicaciones programadas** — lista de 3 filas: `calendar` 16 + título truncado a una línea +
   fecha en `--fs-sm`/`--text-tertiary` + `core/badge.md` `Programado` (índigo). Enlace
   `Ver todas →`.

**El rail nunca contiene el CTA primario.** `Nueva entrada` vive en el `page-header`.

━━━

## 2. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Visualizaciones, Visitantes | agregación de `posts.views` + eventos de analítica | ⚠️ **No hay tabla de eventos.** `posts.views` es un contador acumulado sin serie temporal: no permite calcular delta ni el gráfico de 30 días |
| Entradas publicadas | `posts` where `status === "published"`, contador por mes | ✅ `convex/posts.ts` |
| SEO Score promedio | media de `posts.seoScore` | ⚠️ **El campo no existe** en `convex/schema.ts` |
| Entradas recientes | `posts` ordenadas por `updatedAt` desc, límite 6 | ✅ |
| — thumbnail | `posts.coverUrl` | ✅ |
| — título, slug | `posts.title`, `posts.slug` | ✅ |
| — autor | `posts.authorDocId` → `users.name`, `users.avatarUrl` | ✅ |
| — categorías | `posts.categoryDocId` → `categories.name`, `categories.color` | ✅ |
| — estado | `posts.status` (`draft` · `published` · `scheduled`) | ⚠️ falta `private` para el badge `Privada` |
| — fecha | `posts.publishedAt` / `posts.updatedAt` | ✅ |
| — SEO Score | `posts.seoScore` | ⚠️ **no existe** |
| Rendimiento en el tiempo | serie diaria de vistas, 30 puntos + serie de comparación | ⚠️ **no existe fuente** |
| Sugerencia de IA | endpoint de IA, disparado por el usuario | ⚠️ no implementado |
| Publicaciones programadas | `posts` where `status === "scheduled"`, orden `scheduledFor` asc | ✅ |

### Deuda de datos que esta pantalla exige

1. `posts.seoScore: v.optional(v.number())` y `posts.seoAnalyzedAt: v.optional(v.string())`.
2. `status` amplía su unión con `v.literal("private")`.
3. Una fuente de series temporales para vistas y visitantes. Sin ella, la stat card muestra `—`
   con tooltip `Sin datos en este rango` y el gráfico su estado vacío — **nunca un `0` inventado**
   (ver `guidelines/estados.md` §5).
4. **Recharts no está en `package.json`.** El gráfico exige `pnpm add recharts`
   (`data-display/line-chart.md` §0).

━━━

## 3. Estados

### Carga

- **Sidebar, topbar, `page-header` y títulos de tarjeta se pintan de inmediato.** Solo el dato
  lleva skeleton (`guidelines/estados.md` §1).
- Stat cards: cuadro de icono y label ya visibles; cifra → barra 96×34; delta → barra 56×18; la
  línea de contexto se pinta ya (es texto fijo).
- Tabla: `SkeletonTabla` con **6 filas de 72px** y la geometría real — checkbox, thumbnail 56, dos
  barras de título (100 % y 65 %), chip de categoría, badge, fecha, anillo gris, hueco de acciones.
  La cabecera de la tabla se pinta ya.
- Gráfico: ejes, rejilla y etiquetas dibujados de inmediato en `--text-tertiary`; el área de la
  serie es un bloque skeleton con **la altura final exacta**.
- Rail: los tres títulos de tarjeta ya visibles; anillo con pista `--border-hairline` al 100 %;
  `Aplicar sugerencia` deshabilitado.
- Retardo de 150 ms antes de pintar el skeleton; una vez pintado, permanece mínimo 300 ms.
- `aria-busy="true"` en cada contenedor + `role="status"` con `Cargando el resumen`.

### Vacío

**Blog recién creado — el caso más importante de esta pantalla.** No se muestra un dashboard de
ceros: se muestra el camino.

- Stat cards: se pintan las cuatro con `—` en `--text-tertiary` y **sin fila de delta**
  (no `0 %`). Tooltip `Sin datos todavía`.
- Entradas recientes → `feedback/empty-state.md`, causa *nunca hubo*:
  `file-text` · **`Aún no tienes entradas`** · `Crea tu primera entrada y empieza a publicar.` ·
  botón **negro** `Nueva entrada`.
- Gráfico: ejes dibujados + `Sin datos en este rango` centrado + botón secundario `Ampliar rango`.
- Rail · SEO Analyzer: anillo gris, `—` al centro, `Sin analizar` debajo, acción `Analizar`
  (secundaria).
- Rail · Sugerencia de IA: `Nada que sugerir por ahora` + `Tu contenido está en buen estado.` +
  botón secundario `Volver a analizar`. **La tarjeta nunca desaparece:** un hueco en el rail se lee
  como bug.
- Rail · Programadas: una línea `No hay publicaciones programadas.` en `--fs-sm`/`--text-secondary`
  con `--sp-8` de aire. Sin icono ni botón.
- Acciones rápidas: se pintan siempre. Son el sustituto real del dashboard vacío.

### Error

- **Un error nunca vacía la pantalla entera.** Cada bloque falla por su cuenta.
- Métrica caída: esa tarjeta muestra `—` con `triangle-alert` 16 en `--warn` junto al label y
  tooltip con el motivo. Las otras tres siguen con sus datos.
- Tabla caída: `feedback/empty-state.md` con `triangle-alert` en `--warn`,
  `No pudimos cargar tus entradas`, una línea de causa si se conoce, y botón secundario
  `Reintentar`. La cabecera de la tarjeta y el enlace `Ver todas →` permanecen.
- Gráfico caído: mismo patrón dentro del área del gráfico, conservando los ejes.
- Rail · IA caída: `No pudimos generar la sugerencia` + `Reintentar`.
- **Si ya había datos en pantalla, el error no los borra**: banda `--warn-tint` con hairline sobre
  el contenido antiguo — `No pudimos actualizar los datos` + `Reintentar`
  (`guidelines/estados.md` §2).
- Nunca se muestra el mensaje crudo del servidor ni un código de error como titular.

### IA

`Sugerencia de IA` **no se dispara al montar la pantalla** (`estados.md` §7, regla 1). Se genera
por acción explícita (`Volver a analizar`) o desde una tarea programada del servidor. En curso:
cuerpo en skeleton, botón en `Generando…` con `Detener`, contador `Generando… 6s` a partir de los
5 segundos, timeout a 30 s con `Reintentar`.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico: rail 320 sticky, métricas en 4 columnas. |
| **1024–1279** | **El rail baja** a ancho completo bajo el contenido y reparte sus tres tarjetas en `repeat(auto-fit, minmax(280px, 1fr))`; deja de ser sticky. Métricas 4 → 2. Tabla oculta `Autor`. Padding-x del contenido a `--sp-6`. |
| **768–1023** | Sidebar → drawer con botón `menu`. Buscador de la topbar → botón de icono que abre ⌘K. Métricas en 2 columnas. La tabla oculta también `Categorías`. |
| **<768** | Topbar 56px. `page-header` apilado con `Nueva entrada` a ancho completo abajo. Métricas en 1 columna. **La tabla se convierte en tarjetas apiladas**, nunca en scroll horizontal: thumbnail 48 + título a 2 líneas + `Estado · Fecha` + `⋯`. Gráfico con alto mínimo 220px, leyenda debajo. Acciones rápidas en 2 columnas. |

━━━

## 5. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| `components/admin/dashboard/welcome-header.tsx` | `layout/page-header.md`: `Resumen` + subtítulo + acción. Sin saludo personalizado |
| `components/admin/dashboard/dashboard-stats-grid.tsx` + `components/admin/stat-card.tsx` | `data-display/stat-card.md` con cuadro tintado `--cat-N`, delta y contexto |
| `components/admin/dashboard/recent-posts-card.tsx` | `data-display/data-table.md` (misma tabla que Entradas, `density="cómoda"`, 6 filas) |
| `components/admin/dashboard/recent-comments-widget.tsx` | **No está en la pantalla.** Los comentarios tienen su propia pantalla; el rail lleva SEO / IA / Programadas |
| `components/admin/dashboard/quick-actions-bar.tsx` | Bloque `Acciones rápidas` al pie, en tarjetas-enlace |
| Sin gráfico | Tarjeta `Rendimiento en el tiempo` con `line-chart.md` (requiere Recharts) |
| Sin rail | `layout/split-view.md` con las tres tarjetas |

━━━

## 6. Reglas duras

1. **Un solo botón negro en la pantalla**: `Nueva entrada`, en el `page-header`.
2. El rail no contiene el CTA primario nunca.
3. Índigo solo en: item activo del sidebar, `Ver todas →`, badge `Programado`, tarjeta de IA y
   línea del gráfico. Verde solo en: anillos de score, badge `Publicado` y deltas positivos.
4. Ninguna llamada de IA al montar la pantalla.
5. `—`, nunca `0`, cuando lo que falta es el dato. Nunca `NaN`, `null` ni `undefined` en pantalla.
6. Todas las cifras en `tabular-nums`.
7. Cada uno de los siete bloques define sus cuatro estados o no entra a `main`.
