# Iconografía

> Fuente: las 9 pantallas de `../ui-ux-panels/`. Donde el código y una pantalla no coincidan, gana la pantalla.
> Set: **Lucide** (`lucide-react`, ya instalado). Es un set outline sobre grid de 24 con terminaciones redondeadas: coincide con las pantallas sin retocar nada salvo el grosor.

━━━

## 1. Estilo

- **Outline, sin relleno.** Grid de 24px, trazo **1.5px**, `stroke-linecap: round`, `stroke-linejoin: round`.
- Lucide entrega `strokeWidth: 2` por defecto. **Hay que bajarlo a 1.5 globalmente**, no icono por icono:

```tsx
// components/ui/icon.tsx
import type { LucideIcon } from 'lucide-react'

export function Icon({ as: C, size = 20, className }: { as: LucideIcon; size?: 16|20|24; className?: string }) {
  return <C size={size} strokeWidth={1.5} absoluteStrokeWidth className={className} aria-hidden />
}
```

`absoluteStrokeWidth` mantiene el trazo en 1.5px reales aunque el icono se escale: sin él, un icono de 16px queda con trazo de 1px y desaparece sobre `--bg-page`.

- **El color siempre es `currentColor`.** Ningún icono lleva `fill` ni `stroke` hardcodeado. El icono se pinta cambiando el color del contenedor.
- **Excepción de relleno — solo severidad.** Los indicadores de severidad de la pantalla 07 son sólidos: círculo relleno con `!` (crítico), triángulo relleno (advertencia), círculo relleno con check (oportunidad). Es la única familia con relleno del sistema, y existe porque debe leerse de un vistazo en una lista larga.
- **Excepción de forma — el punto de estado.** El círculo relleno de 8px (punto de categoría, punto de SEO en tabla compacta) no es un icono: es una forma primitiva, se dibuja con un `<span>` y `border-radius: 50%`.

## 2. Tamaños

| Tamaño | Uso | Ejemplos |
|---|---|---|
| **16px** | Dentro de texto, botones, celdas, badges, chevrons | `+` de `Nueva entrada`, `→` de `Ver todas`, `lock` de `Privada`, checks de factores |
| **20px** | Nav del sidebar, topbar, iconos de acción de fila, iconos de tarjeta | `home`, `search`, `bell`, `sun`, `pencil`, `trash-2` |
| **24px** | Cuadros tintados de stat card y features de la landing | `eye` de Visualizaciones, `search` de SEO Avanzado |

Nada de 17, 18 o 22px. Escalar un icono de 24 a 17 destruye el ajuste al grid de píxeles. Cuando el icono va dentro de un cuadro tintado, el cuadro mide 40px (`--radius-input`) para iconos de 20, y 48px (`--radius-control`) para iconos de 24.

**Alineación:** los iconos van en un contenedor `flex` con `align-items: center` y `flex-shrink: 0`; gap con el texto de `--sp-2` en botones y badges, `--sp-3` en filas de nav. No se corrigen con `translateY` salvo el chevron de un split button.

## 3. Color por contexto

| Contexto | Color |
|---|---|
| Nav del sidebar, inactivo | `--text-secondary` |
| Nav del sidebar, activo | `--accent` |
| Topbar (buscar, tema, campana) | `--text-secondary`; hover `--text-primary` |
| Icono dentro de botón negro | `--text-on-dark` |
| Icono dentro de botón secundario | `--text-primary` |
| Acciones de fila (`pencil`, `trash-2`, `⋯`) | `--text-tertiary`; hover `--text-secondary`; `trash-2` en hover `--danger` |
| Handle de arrastre | `--text-tertiary`; hover `--text-secondary` |
| Checks de rendimiento y de plan | `--perf-strong` |
| Destello ✦ de IA | `--accent`, siempre |
| Cuadros tintados de stat card | color y tinte de la paleta `--cat-N` (decorativo, ver `color.md` §9) |
| Icono de estado vacío | `--text-tertiary` sobre círculo `--surface-sunken` |

## 4. Inventario — lo que necesitan las 9 pantallas

Nombres de Lucide. Un concepto, un icono: si un icono ya está asignado, no se reutiliza para otra idea, y una idea no cambia de icono entre pantallas.

**Navegación del panel — grupo de contenido (sidebar)**
`house` Resumen · `file-text` Entradas · `file` Páginas · `folder` Categorías · `tag` Etiquetas · `message-square` Comentarios · `paintbrush` Diseño · `settings` Ajustes

**Navegación del panel — grupo de IA (bajo el divisor)**
`sparkles` IA Writer · `scan-search` SEO Analyzer · `chart-column` Analíticas

**Topbar**
`search` buscador · `sun` / `moon` toggle de tema · `bell` notificaciones (con punto `--accent` de 6px arriba a la derecha) · `chevron-down` menú de usuario · avatar como imagen circular de 32px, no icono

**Pie del sidebar**
`globe` selector de blog · `chevrons-up-down` abrir el selector · `sparkle` tarjeta Cuaderno Pro · `arrow-right` `Ver planes` · `sun` / `moon` toggle de tema (pantallas 05–09) · `chevrons-up-down` ciclo claro/oscuro/sistema

**Acciones de tabla y lista**
`ellipsis` menú de fila · `pencil` editar · `trash-2` eliminar · `grip-vertical` handle de arrastre · `check` casilla marcada · `settings-2` configurar columnas (engranaje de la cabecera) · `list` vista lista · `layout-grid` vista grilla · `sliders-horizontal` `Filtros` · `chevron-down` selector de orden · `chevron-left` / `chevron-right` paginación · `plus` crear

> **Inconsistencia resuelta.** La pantalla 02 usa el menú de fila vertical (⋮) y las 03/05 el horizontal (⋯). Se estandariza en **`ellipsis` (⋯)** para todas las filas de tabla. `ellipsis-vertical` queda libre y sin uso.

**Estados**
`circle` (relleno, 8px) punto de estado y de categoría · `lock` `Privada` · `calendar` `Programado` y publicaciones programadas · `clock` tiempo · `circle-check` factor en orden y beneficio del plan · `circle-alert` crítico · `triangle-alert` advertencia · `info` informativo · `x` cerrar y quitar etiqueta · `loader-circle` acción en curso (única animación permitida)

**Métricas y analíticas**
`eye` Visualizaciones / Vistas de página · `users` Visitantes · `message-square` Comentarios · `trending-up` SEO Score promedio y series al alza · `chart-line` Visitas · `clock` Tiempo medio de lectura · `target` Tasa de rebote · `arrow-up` / `arrow-down` deltas · `monitor` Escritorio · `smartphone` Móvil · `tablet` Tablet · `calendar-days` selector de rango · `refresh-cw` `Los datos se actualizan cada 24 horas` · `info` tooltip junto al título de un gráfico

**Editor (pantalla 04)**
`arrow-left` `Volver a entradas` · `circle-check` `Guardado` · `eye` `Vista previa` · `chevron-down` split de `Publicar` · `bold` · `italic` · `underline` · `strikethrough` · `code` · `link` · `list` · `list-ordered` · `quote` · `align-left` · `image` · `table` · `columns-3` · `sparkles` `Escribir con IA` · `chevron-down` selector de bloque (`Párrafo`) · `chevron-up` / `chevron-down` acordeones del rail · `plus` `Añadir nueva categoría` / `Añadir etiqueta` · `x` quitar etiqueta

**SEO Analyzer (pantalla 07)**
`chart-column` botón `Analizar` · `sparkles` línea de ejemplo y `Siguiente paso recomendado` · `circle-alert` `triangle-alert` `info` `circle-check` severidades · `link` `Enlaces internos sugeridos` · `chevron-right` abrir un problema · `key-round` Palabras clave · `globe` Tráfico orgánico

**Categorías (pantalla 06)**
`folder` Total de categorías · `trending-up` Entradas en total · `hash` Categoría más popular · `tag` Sin categoría

**Ajustes — nav secundaria (pantalla 09)**
`globe` General · `square-pen` Escritura · `book-open` Lectura · `message-square` Comentarios · `image` Medios · `link` Enlaces permanentes · `shield` Privacidad · `users` Usuarios · `bell` Notificaciones · `settings` Integraciones · `sliders-horizontal` Avanzado

**Ajustes — rail derecho**
`user` Perfil · `shield-check` Seguridad · `monitor-smartphone` Sesiones activas · `log-out` `Cerrar sesión` · `chevron-right` abrir · `circle-check` beneficios del plan · `upload` `Exportar contenido` · `download` `Importar contenido` · `trash-2` `Eliminar mi sitio`

**Landing (pantalla 01)**
`book-open` isotipo (ver `marca.md`) · `chevron-down` desplegables de nav · `play` `Ver demo` · `zap` `IA que escribe por ti` · `trending-up` `SEO que te posiciona mejor` · `users` `Diseño que convierte más visitantes` · `square-pen` `Editor con IA` · `search` `SEO Avanzado` · `layout-dashboard` `Diseño sin límites` · `message-circle` `Comentarios y comunidad` · `arrow-right` enlaces de sección · `menu` nav móvil

## 5. Reglas de uso

- **Cero emoji en la UI del producto.** El destello ✦ es el icono `sparkles`, no `✨`. El libro del logo es `book-open`, no `📖`.
- **Un icono nunca viaja solo sin nombre accesible.** Botón de solo icono: `aria-label` obligatorio (`aria-label="Eliminar categoría"`). Icono decorativo junto a texto: `aria-hidden="true"` y el texto hace el trabajo.
- **Ningún icono es el único portador de un significado.** Todo badge lleva su palabra; toda severidad lleva su título; todo estado lleva su etiqueta.
- **No se rota un icono para inventar otro.** `chevron-right` girado no es `chevron-down`: existen los dos.
- **No se anima ningún icono** salvo `loader-circle` (giro continuo) y los chevrons de acordeón (rotación de 180° en `--dur-fast` con `--ease-out`). Ambos respetan `prefers-reduced-motion`.
- **No se añaden iconos fuera de este inventario sin ampliarlo aquí.** Si una pantalla nueva necesita un concepto nuevo, se elige en Lucide, se documenta en la sección que corresponda y se verifica que no duplique una metáfora existente.
- **No se mezclan sets.** Nada de Heroicons, Feather, Phosphor ni SVG sueltos de internet. El isotipo de la marca es la única forma dibujada a mano del sistema.
- Los iconos se importan **uno a uno** (`import { House } from 'lucide-react'`), nunca con `import * as Icons`: el barrel arrastra el set completo al bundle.
