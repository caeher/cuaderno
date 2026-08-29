# Split view — contenido principal + panel derecho

> **Fuente:** `02-panel-resumen.png` (SEO Analyzer · Sugerencia de IA · Publicaciones programadas),
> `04-panel-editor-de-entrada.png` (panel de publicación), `07-panel-seo-analyzer.png` (Tu SEO Score ·
> Factores evaluados · Siguiente paso), `09-panel-ajustes.png` (Cuenta · Tu plan · Exportar e importar ·
> Eliminar sitio).
> Anchos medidos sobre los propios renders (1536 px).
> **Las pantallas mandan.**

━━━

## 1. Propósito

Cuatro pantallas comparten la misma estructura: una **columna principal** que hace el trabajo y una
**columna derecha persistente** que la acompaña con contexto, diagnóstico y acciones de segundo orden.

El panel derecho es siempre lo mismo, sea cual sea la pantalla: **lo que el producto sabe sobre lo que
estás haciendo.** Por eso concentra el índigo (destello de IA, `Ver análisis completo →`, badge
`Programada`) y el verde (anillo de score, checks de factores). Nunca lleva el CTA primario de la
pantalla — ese vive en el `page-header` o en el topbar.

Diferencia con `content-grid.md` § 2 (`main-aside`): allí son dos tarjetas hermanas dentro del flujo;
aquí la columna derecha es una **región propia** (`<aside>`), con su propio scroll y su propio
comportamiento sticky, que persiste a lo largo de toda la pantalla.

## 2. Anatomía

```
┌ columna principal ─────────────────────┐ ┌ aside ─────────┐
│ page-header                            │ │ ┌────────────┐ │
│ tabs                                   │ │ │ tarjeta 1  │ │
│ ┌────────────────────────────────────┐ │ │ └────────────┘ │
│ │ tarjeta / tabla / editor           │ │ │ ┌────────────┐ │
│ └────────────────────────────────────┘ │ │ │ tarjeta 2  │ │
│ ┌────────────────────────────────────┐ │ │ └────────────┘ │
│ │ …                                  │ │ │ ┌────────────┐ │
│ └────────────────────────────────────┘ │ │ │ tarjeta 3  │ │
└────────────────────────────────────────┘ └────────────────┘
        min-width: 0                    gap 24     280 / 320px
```

| Propiedad | Token / valor |
|---|---|
| Contenedor | `display: grid; grid-template-columns: minmax(0, 1fr) var(--aside-w)` |
| Gap | `var(--sp-6)` (24px) |
| `min-width: 0` en la columna principal | **obligatorio** — sin él, una tabla ancha empuja el aside fuera de la pantalla |
| Gap vertical entre tarjetas del aside | `var(--sp-4)` (16px) — más apretado que el ritmo de 24 del contenido: el aside es una pila, no una grilla |
| Alineación | `align-items: start`, para que el aside no se estire al alto del contenido |

### Anchos del aside

| Variante | Ancho | Pantallas |
|---|---|---|
| `insight` | `280px` | `02` (Resumen), `07` (SEO Analyzer), `09` (Ajustes) |
| `editor` | `320px` | `04` (editor de entrada) |

Se expresan como token local del contenedor (`--aside-w`), no como clase suelta, para que el valor viva
en un solo sitio por pantalla.

## 3. Comportamiento sticky

El aside acompaña al scroll cuando su contenido es más corto que el principal:

```css
position: sticky;
top: calc(var(--topbar-h) + var(--sp-6));
max-height: calc(100dvh - var(--topbar-h) - var(--sp-10));
overflow-y: auto;
overscroll-behavior: contain;
```

- `overscroll-behavior: contain` evita que al llegar al final del aside el scroll se propague y arrastre
  la página entera.
- Si el aside es **más alto** que el viewport, deja de ser sticky y scrollea con la página: un panel
  sticky con scroll interno propio es incómodo con rueda de ratón.
- El aside no lleva sombra ni borde de columna: cada tarjeta trae su propio `1px --border-hairline`.

**Excepción del editor (`04`):** ahí el aside es sticky desde el borde del topbar y la columna principal
(el lienzo de TipTap) es la que scrollea. Además, el aside del editor arranca con tabs
`Entrada` / `Bloque` (`tabs.md` variante `panel`), que son lo primero de la pila.

## 4. Contenido típico del aside

| Pantalla | Tarjetas, en orden |
|---|---|
| `02` | `SEO Analyzer` (anillo verde + 4 factores + `Ver análisis completo →`) · `Sugerencia de IA ✦` (texto + `Aplicar sugerencia`) · `Publicaciones programadas` (fecha + badge `Programada` + `Ver todas →`) |
| `04` | tabs `Entrada`/`Bloque` · `Estado y visibilidad` · `Categorías` · `Etiquetas` · `Imagen destacada` · `Extracto` |
| `07` | `Tu SEO Score` (anillo + `Ver recomendación completa`) · `Factores evaluados` (lista con `Bien`/`Mejorable`/`No detectado`) · `Siguiente paso recomendado ✦` |
| `09` | `Cuenta` (filas con `chevron-right` + `Cerrar sesión` en `--danger`) · `Tu plan` (badge `Pro` + checks verdes + `Gestionar plan`) · `Exportar e importar` · `Eliminar sitio` (zona de peligro) |

Patrones internos que se repiten y deben existir como componentes propios (no reimplementarse por
pantalla): **cabecera de tarjeta con enlace `Ver todas →` en `--accent`**, **secciones plegables** (el
editor usa `chevron-up`/`chevron-down` por bloque), **lista de factores con icono de estado**, y
**zona de peligro** con borde y texto en `--danger`.

Tarjetas del aside:

| Propiedad | Token |
|---|---|
| Superficie | `--surface` |
| Borde | `1px solid var(--border-hairline)` |
| Radio | `var(--radius-card)` |
| Padding | `var(--sp-4)` (16px) — más apretado que las tarjetas del contenido (`var(--sp-5)`) |
| Título | `--fs-h3` (16/1.4), `600`, `--text-primary` |
| Enlace de cabecera | `--fs-sm`, `--accent`, con `arrow-right` de 14px; hover `--accent-hover` |
| Zona de peligro | borde `1px --danger`, texto y glifo `--danger`, fondo `--danger-tint` solo en hover del botón |

## 5. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1280px` (xl) | dos columnas, aside sticky, anchos del § 2 |
| `1024–1279px` (lg) | **una columna**: el aside baja íntegro bajo el contenido principal, a ancho completo, con sus tarjetas en `content-grid` `halves` (2 columnas) para no dejar una tira vertical de 1000px |
| `768–1023px` (md) | igual que lg, pero las tarjetas del aside a 2 columnas solo si caben; si no, 1 |
| `< 768px` | una columna en todo, tarjetas del aside apiladas a ancho completo |

**Excepción del editor (`04`) por debajo de `1280px`:** el panel de publicación no baja al pie — el
usuario necesita `Estado`, `Categorías` e `Imagen destacada` mientras escribe. Se convierte en un
**panel deslizante** desde la derecha (ancho `320px`, `--shadow-float`, scrim `rgba(10,10,10,.40)` en
la capa `50`), abierto por un botón `Ajustes de la entrada` en el topbar del editor. En `< 768px` ocupa
el ancho completo del viewport.

**El orden del DOM ya es el correcto:** contenido principal antes que aside. Al colapsar no hace falta
reordenar nada, y por eso este layout nunca debe usar `order` de CSS.

## 6. Accesibilidad de teclado y foco

- El aside es `<aside aria-label="…">` con etiqueta específica por pantalla: `"Diagnóstico del blog"`
  (02), `"Ajustes de la entrada"` (04), `"Resumen SEO"` (07), `"Cuenta y plan"` (09). Un `<aside>` sin
  etiqueta es un landmark mudo.
- La columna principal es `<div>` dentro del `<main>` del chasis; **no** se añade un segundo `<main>`.
- Orden de tabulación: todo el contenido principal y después el aside. Coincide con el DOM y con la
  lectura en escritorio; es también el orden correcto en móvil una vez colapsado.
- Los encabezados del aside son `<h2>` (cuelgan del `<h1>` del `page-header`), y sus sublistas `<h3>`.
  Aunque estén a la derecha, en el árbol de accesibilidad van después del contenido principal.
- Secciones plegables del editor: `<button aria-expanded aria-controls>` sobre un `<h3>`; `Enter` /
  `Espacio` alternan; el estado se conserva entre sesiones.
- Panel deslizante del editor (`< 1280px`): `role="dialog"`, `aria-modal="true"`, foco atrapado, foco
  inicial en el primer control, `Esc` cierra y devuelve el foco al botón que lo abrió.
- El aside con scroll propio es focalizable (`tabIndex={0}`) y lleva `role="region"` con `aria-label`
  para que se pueda recorrer con teclado sin tabular por todos sus enlaces.
- Nada del aside puede ser la **única** vía a una acción crítica: `Publicar` está en el topbar,
  `Mover a la papelera` en el aside pero también en el menú `⋮` de la lista de entradas.
- Bajo `prefers-reduced-motion: reduce`, el panel deslizante aparece sin desplazamiento.

## 7. Marcado de referencia

```tsx
<div
  style={{ "--aside-w": "280px" } as React.CSSProperties}
  className="grid grid-cols-1 gap-[var(--sp-6)] xl:grid-cols-[minmax(0,1fr)_var(--aside-w)]
             xl:items-start"
>
  <div className="min-w-0 flex flex-col gap-[var(--sp-6)]">
    <TablaEntradasRecientes />
    <TarjetaRendimiento />
  </div>

  <aside
    aria-label="Diagnóstico del blog"
    className="flex flex-col gap-[var(--sp-4)]
               max-xl:grid max-xl:grid-cols-1 max-xl:md:grid-cols-2
               xl:sticky xl:top-[calc(var(--topbar-h)+var(--sp-6))]
               xl:max-h-[calc(100dvh-var(--topbar-h)-var(--sp-10))]
               xl:overflow-y-auto xl:[overscroll-behavior:contain]"
  >
    <TarjetaSeoAnalyzer />
    <TarjetaSugerenciaIA />
    <TarjetaProgramadas />
  </aside>
</div>
```

```tsx
// cabecera de tarjeta del aside, con enlace en --accent
<div className="flex items-center justify-between gap-[var(--sp-3)]">
  <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">SEO Analyzer</h2>
  <Link
    href="/panel/seo"
    className="inline-flex items-center gap-[var(--sp-1)] rounded-[var(--radius-input)]
               text-[13px] text-[var(--accent)]
               transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
               hover:text-[var(--accent-hover)]
               focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
  >
    Ver análisis completo
    <ArrowRightIcon className="size-3.5" aria-hidden />
  </Link>
</div>
```

## 8. Modo oscuro

Sin redefiniciones propias. Tres controles:

1. El aside es una pila de `--surface` sobre `--bg-page`; en oscuro esos dos valores se acercan y el
   `--border-hairline` de cada tarjeta pasa a ser el único separador. No se puede suavizar.
2. El anillo de score en `--perf` y los checks verdes deben mantener ≥ 3:1 contra `--surface` oscuro; el
   verde es aquí información, no decoración.
3. La zona de peligro usa `--danger` sobre `--surface`: comprobar que el rojo oscuro no se confunda con
   el texto normal a tamaño `--fs-sm`.

## 9. Notas de implementación

- El anillo de score (SVG con `stroke-dasharray`) necesita `role="img"` y un `aria-label` con el valor
  y su lectura: `"SEO Score 92 de 100, excelente"`.
- Las cifras del aside (`92/100`, `24 May 2024, 10:00 AM`) van con `tabular-nums`.
- El aside de `09` incluye una acción destructiva (`Eliminar mi sitio`): requiere diálogo de
  confirmación con escritura del nombre del sitio, foco inicial en `Cancelar`, y el botón destructivo
  **nunca** como acción por defecto de `Enter`.
- El `Sugerencia de IA ✦` y el `Siguiente paso recomendado ✦` son las dos únicas superficies del panel
  donde el destello índigo aparece dentro de una tarjeta: es la firma de "esto lo pensó el producto".
