# Design System de Cuaderno

> El sistema de diseño de **Cuaderno**, la plataforma de publicación multi-tenant.
> Todo el producto y toda esta documentación están en **español**.
>
> **Fuente oficial:** las 9 pantallas de [`ui-ux-panels/`](./ui-ux-panels/README.md).
> **Regla número uno: las pantallas mandan.** Donde el código y una pantalla no coincidan, gana la
> pantalla y el código se adapta.

━━━

## 1. Qué es este sistema

No es una paleta ni una carpeta de componentes bonitos. Es **un contrato**: un conjunto cerrado de
decisiones —tres colores, siete tamaños de letra, diez escalones de espacio, dos sombras, dos
duraciones— que hace que 20 pantallas construidas por gente distinta en momentos distintos se lean
como un solo producto.

Tres ideas lo sostienen:

1. **Las pantallas mandan.** Si una decisión visual no se puede rastrear a una de las 9 imágenes de
   `ui-ux-panels/` o a un token que sale de ellas, no es una decisión: es una invención.
2. **El sistema se sostiene con borde y aire, no con profundidad.** Hairline de 1px siempre visible,
   sombras casi inexistentes. Si una pantalla pide una tercera sombra, lo que falta es borde o
   espacio.
3. **Cada componente define sus cuatro estados** —carga, vacío, error, con dato— o no entra a
   `main`. El estado de carga no es pulido posterior: es parte del componente.

━━━

## 2. La regla de color que gobierna todo

**Tres colores, tres significados. Uno solo cada uno.**

| Color | Token | Significa | Dónde aparece |
|---|---|---|---|
| **Negro** `#111111` | `--action` | **La acción del usuario** | Todo CTA primario: `Nueva entrada`, `Publicar`, `Analizar`, `Guardar cambios`, `Comenzar gratis` |
| **Índigo** `#6366F1` | `--accent` | **El producto pensando, y la navegación** | Item activo del sidebar, tarjeta Cuaderno Pro, destello ✦ de IA, enlaces `Ver todas`, badge `Programado`, subrayado de tab activo, línea del gráfico, paginación activa |
| **Verde** `#10B981` | `--perf` | **Rendimiento y éxito** | Anillos de SEO Score, badge `Publicado`, deltas positivos ↑, checks de factores en orden |

**La prueba de que está mal puesto:** si el índigo aparece donde no hay navegación ni IA, o el verde
donde no se está midiendo rendimiento, está mal puesto.

Corolarios que se aplican en todo el sistema:

- **Un solo botón negro por zona de decisión.** Si hay dos compitiendo en la misma pantalla, uno de
  los dos no era primario.
- **`Guardado` no es verde.** Confirmar una escritura no es rendimiento medido.
- **El anillo en curso es índigo, no verde.** El verde llega con el resultado.
- **El color del delta sigue la dirección aritmética, no la deseabilidad.** `↓ 4.3 %` de rebote va en
  rojo aunque bajar el rebote sea bueno.
- **Los estados de contenido son un vocabulario cerrado**, separado del acento:
  `Publicado` verde · `Borrador` ámbar · `Programado` índigo · `Privada` gris.
- **Ningún color es el único portador de un significado.** Todo badge lleva su palabra, toda
  severidad su título, todo gráfico su leyenda.

Detalle completo en [`guidelines/color.md`](./guidelines/color.md).

━━━

## 3. Cómo se usa

### En código

```css
/* app/globals.css */
@import "../design-system/styles.css";   /* los cinco archivos de tokens, en orden */
@import "tailwindcss";
```

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google'
const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'], weight: ['400','500','600','700'],
  variable: '--font-sans-family', display: 'swap',
})
// + ThemeProvider de next-themes con attribute="data-theme"
```

**Tokens por nombre, siempre. Cero hexadecimales fuera de `tokens/`.**

```css
/* ✅ */ background: var(--surface); border: 1px solid var(--border-hairline);
/* ❌ */ background: #FFFFFF;        border: 1px solid #EAEAE8;
```

### Antes de escribir una pantalla

1. Abre la imagen de la pantalla en `ui-ux-panels/`.
2. Lee su UI kit en `ui_kits/` — te dice qué componentes la componen, qué datos muestra y sus estados.
3. Lee la spec de cada componente en `components/`.
4. Comprueba las reglas transversales en `guidelines/`.
5. Escribe. Sin inventar tokens, sin inventar componentes, sin inventar estados.

━━━

## 4. Índice completo

### Raíz

| Archivo | Qué es |
|---|---|
| [`readme.md`](./readme.md) | Este documento: qué es el sistema, la regla de color y el índice |
| [`SKILL.md`](./SKILL.md) | **Instrucciones para un agente** que va a escribir código con este sistema |
| [`styles.css`](./styles.css) | Única puerta de entrada: importa los cinco archivos de tokens en orden |
| [`_ds_manifest.json`](./_ds_manifest.json) | Inventario JSON de todos los archivos, con su categoría |

### Fuente oficial — las pantallas

| Archivo | Qué muestra | Estado en el código |
|---|---|---|
| [`ui-ux-panels/README.md`](./ui-ux-panels/README.md) | Índice de las 9 pantallas y el lenguaje visual destilado | — |
| `01-landing-home.png` | Landing de marketing | **No existe** |
| `02-panel-resumen.png` | Dashboard del panel | `app/panel/` |
| `03-panel-entradas.png` | Lista de entradas | `app/panel/posts/` → renombrar |
| `04-panel-editor-de-entrada.png` | Editor + rail de publicación | `app/panel/posts/[id]/` |
| `05-panel-paginas.png` | Lista de páginas | **No existe** |
| `06-panel-categorias.png` | Categorías | `app/panel/taxonomias/` → separar |
| `07-panel-seo-analyzer.png` | SEO Analyzer | **No existe** |
| `08-panel-analiticas.png` | Analíticas | **No existe** |
| `09-panel-ajustes.png` | Ajustes | `app/panel/configuracion/` → renombrar |

### Tokens — el contrato

| Archivo | Qué define |
|---|---|
| [`tokens/fonts.css`](./tokens/fonts.css) | `--font-sans` (Plus Jakarta Sans) y su fallback. **Va primero, siempre** |
| [`tokens/colors.css`](./tokens/colors.css) | Los tres colores, superficies, texto, estados y `--cat-1…8`. Modo claro y oscuro |
| [`tokens/typography.css`](./tokens/typography.css) | Siete escalones: `--fs-display` … `--fs-label` |
| [`tokens/spacing.css`](./tokens/spacing.css) | `--sp-1…16`, radios, `--sidebar-w`, `--topbar-h`, `--content-max`, `--touch-target` |
| [`tokens/effects.css`](./tokens/effects.css) | `--shadow-rest`, `--shadow-float`, `--dur-fast`, `--dur-base`, `--ease-out`, `--focus-ring` |

### Guidelines — las reglas transversales

| Archivo | Qué resuelve |
|---|---|
| [`guidelines/color.md`](./guidelines/color.md) | La gramática de tres colores, bandas de score, deltas, puntos de categoría |
| [`guidelines/tipografia.md`](./guidelines/tipografia.md) | La familia, los siete escalones y cuándo usa cada uno |
| [`guidelines/layout.md`](./guidelines/layout.md) | El chrome del panel, las dos formas de página, contenedores, capas y responsive |
| [`guidelines/estados.md`](./guidelines/estados.md) | Carga, vacío, error, con dato — y el quinto estado de la IA |
| [`guidelines/iconografia.md`](./guidelines/iconografia.md) | Lucide a 1.5px, tamaños, color por contexto y el inventario completo |
| [`guidelines/marca.md`](./guidelines/marca.md) | Isotipo, wordmark, lockups, tamaños mínimos y usos incorrectos |
| [`guidelines/landing.md`](./guidelines/landing.md) | Reglas propias de la landing y cómo continuarla sin inventar |

### Components — las piezas

| Grupo | Archivos |
|---|---|
| **core** | [`avatar`](./components/core/avatar.md) · [`badge`](./components/core/badge.md) · [`button`](./components/core/button.md) · [`card`](./components/core/card.md) · [`chip`](./components/core/chip.md) · [`divider`](./components/core/divider.md) · [`dropdown-menu`](./components/core/dropdown-menu.md) · [`icon-button`](./components/core/icon-button.md) · [`tooltip`](./components/core/tooltip.md) |
| **layout** | [`panel-shell`](./components/layout/panel-shell.md) · [`page-header`](./components/layout/page-header.md) · [`content-grid`](./components/layout/content-grid.md) · [`split-view`](./components/layout/split-view.md) |
| **navigation** | [`sidebar`](./components/navigation/sidebar.md) · [`topbar`](./components/navigation/topbar.md) · [`tabs`](./components/navigation/tabs.md) · [`pagination`](./components/navigation/pagination.md) · [`settings-nav`](./components/navigation/settings-nav.md) · [`landing-nav`](./components/navigation/landing-nav.md) · [`breadcrumb`](./components/navigation/breadcrumb.md) |
| **data-display** | [`stat-card`](./components/data-display/stat-card.md) · [`data-table`](./components/data-display/data-table.md) · [`score-ring`](./components/data-display/score-ring.md) · [`line-chart`](./components/data-display/line-chart.md) · [`donut-chart`](./components/data-display/donut-chart.md) · [`progress-bar`](./components/data-display/progress-bar.md) · [`metric-list`](./components/data-display/metric-list.md) · [`issue-row`](./components/data-display/issue-row.md) · [`category-dot`](./components/data-display/category-dot.md) |
| **feedback** | [`toast`](./components/feedback/toast.md) · [`alert`](./components/feedback/alert.md) · [`empty-state`](./components/feedback/empty-state.md) · [`skeleton`](./components/feedback/skeleton.md) · [`confirm-dialog`](./components/feedback/confirm-dialog.md) · [`ai-thinking`](./components/feedback/ai-thinking.md) |
| **forms** | [`form-field`](./components/forms/form-field.md) · [`input`](./components/forms/input.md) · [`textarea`](./components/forms/textarea.md) · [`select`](./components/forms/select.md) · [`checkbox`](./components/forms/checkbox.md) · [`radio`](./components/forms/radio.md) · [`switch`](./components/forms/switch.md) · [`search-input`](./components/forms/search-input.md) · [`file-input`](./components/forms/file-input.md) |

### UI kits — cómo se componen las pantallas

**Landing** (`ui_kits/landing/`) — una sección por archivo: anatomía, jerarquía tipográfica,
comportamiento responsive y qué componentes del sistema consume.

| Archivo | Sección |
|---|---|
| [`nav.md`](./ui_kits/landing/nav.md) | Barra de navegación de marketing |
| [`hero.md`](./ui_kits/landing/hero.md) | Píldora, titular de tres palabras, párrafo, CTA doble, tres micro-features |
| [`product-shot.md`](./ui_kits/landing/product-shot.md) | La captura del producto en tarjeta elevada |
| [`features-grid.md`](./ui_kits/landing/features-grid.md) | «Un blog, infinitas posibilidades» — 4 columnas con icono outline |
| [`pricing.md`](./ui_kits/landing/pricing.md) | Tres planes en columnas iguales |
| [`templates.md`](./ui_kits/landing/templates.md) | Escaparate de plantillas |
| [`testimonials.md`](./ui_kits/landing/testimonials.md) | Prueba social — cifras o testimonios |
| [`faq.md`](./ui_kits/landing/faq.md) | Acordeón de preguntas frecuentes |
| [`cta-final.md`](./ui_kits/landing/cta-final.md) | Banda negra de cierre — la única inversión de la página |
| [`footer.md`](./ui_kits/landing/footer.md) | Cierre y mapa del sitio |

**Panel** (`ui_kits/panel/`) — una pantalla por archivo: composición con componentes del sistema,
qué datos muestra y sus estados de carga, vacío y error.

| Archivo | Pantalla | Fuente | Ruta |
|---|---|---|---|
| [`resumen.md`](./ui_kits/panel/resumen.md) | Dashboard | `02` | `app/panel/` |
| [`entradas.md`](./ui_kits/panel/entradas.md) | Lista de entradas | `03` | `posts/` → `entradas/` |
| [`editor.md`](./ui_kits/panel/editor.md) | Editor de entrada | `04` | `posts/[id]/` |
| [`paginas.md`](./ui_kits/panel/paginas.md) | Lista de páginas | `05` | **por crear** |
| [`categorias.md`](./ui_kits/panel/categorias.md) | Categorías | `06` | `taxonomias/` → `categorias/` |
| [`etiquetas.md`](./ui_kits/panel/etiquetas.md) | Etiquetas | derivada | `taxonomias/` → `etiquetas/` |
| [`comentarios.md`](./ui_kits/panel/comentarios.md) | Comentarios | derivada | `app/panel/comentarios/` |
| [`seo-analyzer.md`](./ui_kits/panel/seo-analyzer.md) | SEO Analyzer | `07` | **por crear** |
| [`analiticas.md`](./ui_kits/panel/analiticas.md) | Analíticas | `08` | **por crear** |
| [`ajustes.md`](./ui_kits/panel/ajustes.md) | Ajustes | `09` | `configuracion/` → `ajustes/` |
| [`diseno.md`](./ui_kits/panel/diseno.md) | Diseño y estudio | derivada | `disenador/` → `diseno/` |

━━━

## 5. Pendientes conocidos

Los UI kits referencian specs que **todavía no están escritas**. Están nombradas de forma
consistente en todos los kits para que, al escribirlas, no haya que renombrar nada. Aparecen
marcadas como *Pendiente* en las tablas de «componentes que consume».

| Ruta prevista | Qué resuelve | La piden |
|---|---|---|
| `components/core/accordion.md` | Acordeón — rail del editor y FAQ de la landing | `editor`, `faq` |
| `components/core/segmented-control.md` | Grupo segmentado: lista/grilla, mensual/anual, nube/tabla | `entradas`, `paginas`, `categorias`, `etiquetas`, `pricing` |
| `components/core/sheet.md` | Drawer lateral y hoja inferior | Todo el responsive `<1024` |
| `components/core/popover.md` | Popover del selector de blog y del rango de fechas | `sidebar`, `analiticas` |
| `components/core/command-palette.md` | Paleta ⌘K que abre el buscador del topbar | `topbar` |
| `components/feedback/dialog.md` | Diálogo modal base — del que hereda `confirm-dialog` | `categorias`, `etiquetas`, `diseno` |
| `components/forms/combobox.md` | Campo multivalor con sugerencias (categorías, etiquetas) | `editor`, `etiquetas` |
| `components/forms/date-time-picker.md` | Programar publicación y rango de fechas | `editor`, `analiticas` |

Todo lo demás que los kits nombran **ya está escrito**: `core/card`, `core/divider`, `core/tooltip`,
`feedback/confirm-dialog`, `feedback/ai-thinking` y el grupo `forms/` completo
(`form-field`, `input`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `search-input`,
`file-input`).

**Deuda de datos.** Los kits del panel documentan, pantalla por pantalla, qué falta en
`convex/schema.ts`. Las cinco más grandes: `posts.seoScore` · `comments.status` · la tabla `pages` ·
una fuente de series temporales para analíticas · la separación entre `siteSettings` y `users`.

**Dependencias que faltan en `package.json`:** `recharts` (línea y dona). `next-themes` ya está
instalado pero **no hay `ThemeProvider` montado**, y el sistema nace con modo claro y oscuro.

━━━

## 6. Las reglas que no se negocian

1. **Las pantallas mandan.** Donde el código y una pantalla no coincidan, gana la pantalla.
2. **Tokens por nombre. Cero hexadecimales fuera de `tokens/`.**
3. **Tres colores, tres significados.** Un solo negro por zona de decisión.
4. **Borde y aire, no sombra.** Dos sombras en todo el sistema.
5. **Siete tamaños de letra.** Si un tamaño no está en la escala, no se usa.
6. **`tabular-nums` en toda métrica y toda tabla.**
7. **Cuatro estados por componente**, cinco si toca IA. Sin ellos no entra a `main`.
8. **Modo claro y oscuro desde el principio.** Ningún color se define sólo en el bloque oscuro.
9. **Mobile-first y sin scroll horizontal en `<body>`** en ningún ancho.
10. **Cero emoji en la UI.** El destello ✦ es el icono `sparkles`; el logo es `book-open`.
11. **Todo en español.** La sigla es `IA`, nunca `AI`.
12. **Sin nombrar competidores.** La ventaja se muestra con funciones, no comparando.
