# Panel · SEO Analyzer

> **Fuente:** `../../ui-ux-panels/07-panel-seo-analyzer.png`.
> **Ruta:** `app/panel/seo/` — **no existe todavía**. Tampoco existe `posts.seoScore`.
> **Las pantallas mandan.**

━━━

## 1. Composición

Forma **A — con rail derecho**: `minmax(0, 1fr) 320px`, gap `--sp-6`, rail sticky.

```
page-header:  SEO Analyzer · «Mide y mejora cómo te encuentra Google»   (sin acción primaria)
──────────────────────────────────────────────────────────────────────────────
tabs:  Resumen  Entradas  Palabras clave  Enlaces  Técnico  Historial
──────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────┐ ┌──────────────────────┐
│ [ https://miblog.cuaderno.com/…    ] [Analizar]│ │ Tu SEO Score         │
│  ✦ Analiza cualquier entrada de tu blog       │ │      ( 92 )          │
├──────────────────────────────────────────────┤ │   Excelente          │
│ ┌────────┐┌────────┐┌────────┐┌────────┐     │ ├──────────────────────┤
│ │ Score  ││ Palabra││ Tráfico││ Enlaces│     │ │ Factores evaluados   │
│ │  92 ◔  ││ clave  ││ orgán. ││ internos│    │ │ ✓ Título   Excelente │
│ └────────┘└────────┘└────────┘└────────┘     │ │ ✓ Meta     Bien      │
├──────────────────────────────────────────────┤ │ ⚠ Encabez. Mejorable │
│ Problemas y oportunidades detectadas         │ │ …                    │
│ ⛔ Falta meta descripción       3 entradas › │ ├──────────────────────┤
│ ⚠ Encabezados sin jerarquía     5 entradas › │ │ ✦ Siguiente paso     │
│ ✓ Buena densidad de palabra clave           › │ │   recomendado        │
└──────────────────────────────────────────────┘ └──────────────────────┘
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` **sin acción primaria** — el CTA vive junto al input |
| Tabs | `navigation/tabs.md`, 6 secciones, subrayado `--accent` |
| Analizador | `forms/input.md` (alto 40, `--radius-input`) + `core/button.md` **negro** `Analizar` con `chart-column` |
| Métricas | `layout/content-grid.md` (4 col) × `data-display/stat-card.md`, la primera con `score-ring` y la de tráfico con **sparkline** (variante §2.1) |
| Problemas | Tarjeta + `data-display/issue-row.md` — el componente propio de esta pantalla |
| Rail · Score | `data-display/score-ring.md` tamaño `lg` + veredicto |
| Rail · Factores | `data-display/metric-list.md` |
| Rail · Siguiente paso | Tarjeta `--accent-tint` / `--accent-border` con `sparkles` — **es IA** |
| Pie | `navigation/pagination.md` si la lista de problemas supera 10 filas |

### El analizador

Fila de un input y un botón, dentro de una tarjeta con padding `--sp-5`:

- Input a ancho completo menos el botón, gap `--sp-3`. Prefijo fijo `miblog.cuaderno.com/` en
  `--text-tertiary` dentro del campo, y el usuario escribe solo el slug. Evita que pegue la URL de
  otro sitio.
- Botón **negro** `Analizar` — es la acción del usuario, no el producto pensando: el índigo llega
  cuando aparece el resultado.
- Bajo la fila, `--sp-3`: línea de ejemplo con `sparkles` 16 índigo —
  `Analiza cualquier entrada de tu blog y recibe recomendaciones concretas.` en
  `--fs-sm`/`--text-secondary`.

### Las cuatro métricas

| Icono / tinte | Label | Valor | Variante |
|---|---|---|---|
| `trending-up` / `--cat-3` | SEO Score | `92` + `score-ring` `sm` en `--perf` | con anillo |
| `key-round` / `--cat-1` | Palabras clave posicionadas | `34` | delta `↑ 6` |
| `globe` / `--cat-2` | Tráfico orgánico | `4 128` | con **sparkline** bajo la cifra |
| `link` / `--cat-4` | Enlaces internos | `128` | delta `↑ 12` |

### La lista de problemas y oportunidades

Cada fila es un `issue-row.md`: icono de severidad **relleno** en círculo tintado, título
`--fs-body`/600, descripción `--fs-sm`/`--text-secondary`, conteo en píldora del mismo canal y
`chevron-right`.

**Orden fijo por severidad**, no por fecha ni por alfabeto: `crítico` → `advertencia` → `info` →
`oportunidad`. Dentro de cada grupo, por número de entradas afectadas descendente.

| Severidad | Icono | Color | Ejemplo |
|---|---|---|---|
| Crítico | `circle-alert` | `--danger` / `--danger-tint` | `Falta meta descripción` · 3 entradas |
| Advertencia | `triangle-alert` | `--warn` / `--warn-tint` | `Encabezados sin jerarquía` · 5 entradas |
| Info | `info` | `--cat-2` / tinte azul | `Imágenes sin texto alternativo` · 8 entradas |
| Oportunidad | `circle-check` | `--perf` / `--perf-tint` | `Buena densidad de palabra clave` |

**El conteo y el chevron no son adorno**: cada fila navega a Entradas filtradas por ese problema.
Una fila que no lleva a ningún sitio es un diagnóstico sin tratamiento.

### El rail

1. **Tu SEO Score** — anillo `lg` centrado con la cifra dentro, veredicto debajo
   (`92 · Excelente`) en el color de la banda, y línea `--fs-sm`/`--text-tertiary` con
   `Analizado hace 2 horas`.
2. **Factores evaluados** — `metric-list.md` con los ocho factores: `Título` · `Meta descripción` ·
   `Encabezados` · `Palabra clave` · `Enlaces internos` · `Imágenes` · `Legibilidad` ·
   `Datos estructurados`. Cada uno con su veredicto (`Excelente` y `Bien` → `--perf-strong`;
   `Mejorable` → `--warn`; `No detectado` → `--neutral`).
3. **Siguiente paso recomendado** — tarjeta `--accent-tint`, borde `--accent-border`, `sparkles`
   índigo, título `--fs-h3`, cuerpo `--fs-sm` de 2–3 líneas y botón secundario `Aplicar` +
   fantasma `Descartar`. **Es IA, por eso es índigo.**

━━━

## 2. Las bandas del score — una sola escala en todo el producto

| Rango | Veredicto | Color |
|---|---|---|
| 90–100 | `Excelente` | `--perf` |
| 75–89 | `Bueno` | `--perf` |
| 50–74 | `Mejorable` | `--warn` |
| 1–49 | `Bajo` | `--danger` |
| sin analizar | `—` | anillo `--border-hairline`, texto `--text-tertiary` |

**Nunca se pinta un score sin veredicto escrito.** El número solo no dice si 74 es bueno o malo.
Esta escala es la misma que usan la columna `SEO Score` de Entradas y la stat card de Resumen.

━━━

## 3. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| SEO Score por entrada | `posts.seoScore` | ⚠️ **no existe** |
| Fecha del último análisis | `posts.seoAnalyzedAt` | ⚠️ **no existe** |
| Factores evaluados | resultado del análisis por entrada | ⚠️ **no existe** — requiere `seoAnalyses` |
| Problemas agregados | agregación de los análisis del tenant | ⚠️ **no existe** |
| Palabras clave posicionadas | integración externa (Search Console o similar) | ⚠️ **no existe** |
| Tráfico orgánico | fuente de analítica | ⚠️ **no existe** |
| Enlaces internos | análisis de `posts.content` | ⚠️ calculable en servidor, sin implementar |
| Siguiente paso | endpoint de IA | ⚠️ no implementado |

### Deuda de datos que esta pantalla exige

```ts
posts: { seoScore: v.optional(v.number()), seoAnalyzedAt: v.optional(v.string()) }

seoAnalyses: defineTable({
  tenantId: v.optional(v.string()),
  postDocId: v.id("posts"),
  score: v.number(),
  factors: v.array(v.object({
    key: v.string(),                 // "titulo" | "meta" | "encabezados" | …
    verdict: v.union(v.literal("excelente"), v.literal("bien"),
                     v.literal("mejorable"), v.literal("no-detectado")),
    detail: v.optional(v.string()),
  })),
  issues: v.array(v.object({
    key: v.string(),
    severity: v.union(v.literal("critico"), v.literal("advertencia"),
                      v.literal("info"), v.literal("oportunidad")),
  })),
  analyzedAt: v.string(),
}).index("by_post", ["postDocId", "analyzedAt"])
  .index("by_tenant", ["tenantId", "analyzedAt"])
```

Los `key` de factores y problemas son **identificadores estables**; el texto en español vive en la
capa de presentación. Guardar la frase en la base de datos convierte cada retoque de copy en una
migración.

━━━

## 4. Estados

### Carga de la pantalla

- Tabs, input, botón `Analizar` y **los nombres de los ocho factores** se pintan ya.
- Métricas: icono y label visibles; cifra → barra 96×34; el anillo con pista
  `--border-hairline` al 100 %.
- Lista de problemas: 5 filas fantasma con círculo de severidad gris, dos barras de texto
  (55 % y 85 %) y píldora de conteo.
- Rail: anillo con pista gris y cifra en skeleton; `metric-list` con nombres visibles y veredictos
  en skeleton; tarjeta de IA con título y `sparkles` ya visibles y el botón deshabilitado.

### Analizando — el estado más visible de la pantalla

Sigue las siete reglas de IA de `guidelines/estados.md` §7:

- **Anillo indeterminado**: rotación lenta de un arco en **`--accent`, no en verde**. Aún no hay
  resultado que medir; pintarlo de verde promete un veredicto que no existe.
- **Progreso textual por fase**, bajo el input: `Leyendo la URL…` → `Evaluando encabezados…` →
  `Comprobando enlaces internos…`. **Nada de barra de progreso falsa.**
- Lista de factores en skeleton, con los nombres ya visibles.
- Botón en `Analizando…` con `loader-circle`, **ancho fijo**, y `Detener` disponible. A partir de
  los 5 s, contador: `Analizando… 6s` en `tabular-nums`.
- Timeout a 30 s: `El análisis tardó demasiado` + `Reintentar`.
- **El análisis nunca se dispara al montar la pantalla.** Siempre lo inicia el usuario.

### Vacío

| Causa | Presentación |
|---|---|
| **Nunca se analizó nada** | Anillo con pista gris, `—` al centro, `Sin analizar` debajo y acción secundaria `Analizar`. Métricas a `—` en `--text-tertiary`, **sin fila de delta**. Lista de problemas → `feedback/empty-state.md`: `scan-search` · `Todavía no hay análisis` · `Analiza una entrada para ver problemas y oportunidades.` · sin botón (el CTA ya está en el analizador, arriba) |
| **Sin problemas detectados** | `circle-check` en `--perf` · **`No encontramos problemas`** · `Tu contenido cumple los factores evaluados.` Es un resultado excelente y se comunica como tal |
| **Blog sin entradas** | `file-text` · `Primero publica algo` · `El analizador necesita una entrada para trabajar.` · botón **negro** `Nueva entrada` |

### Error

- **URL inválida**: borde `--danger` en el input + mensaje `Introduce una URL válida de tu blog` en
  `--fs-sm`/`--danger` debajo. **El botón `Analizar` NO se deshabilita** — el usuario debe poder
  reintentar sin adivinar qué está mal.
- **Análisis fallido**: `feedback/alert.md` en línea sobre la lista, `No pudimos completar el
  análisis` + `Reintentar`. El score anterior **permanece visible** con la etiqueta
  `Último análisis: hace 2 días` en `--text-tertiary`.
- **Una métrica caída** no rompe la fila: `—` con `triangle-alert` 16 en `--warn` junto al label.
- **Integración externa caída** (palabras clave, tráfico orgánico): esa tarjeta muestra `—` y un
  `info` con tooltip `Sin conexión con la fuente de datos`. Las demás siguen.
- Nunca se muestra el mensaje crudo del servidor ni un código de error como titular.

━━━

## 5. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico: rail 320 sticky, métricas en 4 columnas. |
| **1024–1279** | El rail **baja** a ancho completo bajo el contenido, con sus tres tarjetas en `repeat(auto-fit, minmax(280px, 1fr))`; deja de ser sticky. Métricas 4 → 2. |
| **768–1023** | Sidebar → drawer. Tabs con scroll horizontal. Métricas en 2 columnas. En `issue-row`, la descripción se trunca a una línea. |
| **<768** | Métricas en 1 columna. El analizador se apila: input a ancho completo, botón `Analizar` debajo a ancho completo, alto 44. `issue-row` a dos líneas con el conteo bajo el título y el chevron a la derecha, área táctil 44px. El anillo del rail baja a tamaño `md`. |

━━━

## 6. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| No existe la ruta | `app/panel/seo/page.tsx` |
| `components/admin/settings/seo-settings-section.tsx` | Son **ajustes** de SEO, no el analizador. Se quedan en Ajustes |
| Sin `posts.seoScore` | Campo + `seoAnalyses` + la mutación que los escribe |
| Sin columna SEO en Entradas | Depende de este mismo campo |
| Sin motor de análisis | Acción de Convex que evalúe los 8 factores sobre `posts.content` |

━━━

## 7. Reglas duras

1. **Un solo botón negro**: `Analizar`.
2. El anillo en curso es **índigo**, no verde. El verde llega con el resultado.
3. Nunca un score sin veredicto escrito al lado.
4. Progreso por fases textuales. Nunca una barra de progreso inventada.
5. `Analizar` no se deshabilita ante una URL inválida.
6. El resultado anterior sobrevive a un análisis fallido, etiquetado con su antigüedad.
7. Ningún análisis se dispara al montar la pantalla, y todos son cancelables.
8. Los `key` de factores y problemas son estables; el español vive en la UI.
