# Landing · Templates — «Empieza con una plantilla»

> **Fuente:** la pantalla oficial no dibuja esta sección; la nav sí la anuncia (`Plantillas`).
> Patrón derivado en `../../guidelines/landing.md` §5: *grilla de 3 con miniaturas 16:9,
> `--radius-card`, hairline; enlace `Ver todas las plantillas →` en `--accent`*.
> **Estado en el código:** existe `convex/templates.ts` y la tabla `tenantTemplates` (el diseñador
> del panel ya consume plantillas). Esta sección es su escaparate público.

━━━

## 1. Anatomía

Sección sobre `--surface`, hairline arriba y abajo, padding vertical `--sp-16`.

```
  PLANTILLAS                                        Ver todas las plantillas →
  Empieza con una plantilla, hazla tuya en minutos.

  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
  │   16:9        │  │   16:9        │  │   16:9        │
  ├───────────────┤  ├───────────────┤  ├───────────────┤
  │ Diario        │  │ Revista       │  │ Portafolio    │
  │ Para escribir │  │ Para publicar │  │ Para mostrar  │
  └───────────────┘  └───────────────┘  └───────────────┘
```

### Cabecera de la sección

Fila de dos zonas (`display: flex; justify-content: space-between; align-items: end`):

| Zona | Contenido |
|---|---|
| Izquierda | Eyebrow `PLANTILLAS` (`--fs-label`/600/`+0.06em`/`--text-tertiary`) → `--sp-4` → `<h2>` `Empieza con una plantilla, hazla tuya en minutos.` (`--fs-h1`/600, dos líneas, `text-wrap: balance`) |
| Derecha | Enlace `Ver todas las plantillas →` — `--fs-body`/500/`--accent`, icono `arrow-right` 16, alineado a la línea base del `<h2>` |

`--sp-10` hasta la grilla.

**El enlace es índigo porque es navegación**, exactamente como el `Ver todas →` de las tarjetas del
panel. No es un CTA: no compite con el negro de `pricing.md` ni con el de `cta-final.md`.

### La tarjeta de plantilla

Tres columnas iguales, gap `--sp-6`.

| Propiedad | Valor |
|---|---|
| Contenedor | `--surface`, borde 1px `--border-hairline`, `--radius-card`, `overflow: hidden` |
| Sombra | ninguna en reposo; `--shadow-rest` en hover, con `translateY(-2px)` en `--dur-fast` |
| Miniatura | **16:9**, `aspect-ratio` reservado, `object-fit: cover`, hairline inferior que la separa del pie |
| Pie | Padding `--sp-4`. Nombre `--fs-h3`/600/`--text-primary` → `--sp-1` → descripción `--fs-sm`/`--text-secondary`, una línea |
| Toda la tarjeta | Es un enlace (`<a>` envolviendo el contenido) → `--focus-ring` en `:focus-visible` sobre el contenedor |

**Badge opcional** sobre la miniatura, arriba a la izquierda con `--sp-3` de margen:
`Nueva` en `--accent-tint`/`--accent`, o `Pro` cuando la plantilla requiere plan de pago. Máximo
un badge por tarjeta. Nunca se pinta `Gratis`: la ausencia de badge ya lo dice.

### Las tres plantillas del escaparate

| Nombre | Descripción | Para quién |
|---|---|---|
| **Diario** | Una columna, tipografía grande, sin distracciones. | Escritura personal |
| **Revista** | Portada con destacados y secciones por categoría. | Publicación editorial |
| **Portafolio** | Rejilla visual con proyectos y notas de proceso. | Marca personal |

Se muestran **tres, no todas**. El catálogo completo vive en `/plantillas`.

━━━

## 2. Jerarquía tipográfica

| Elemento | Token | Weight | Color |
|---|---|---|---|
| Eyebrow | `--fs-label` | 600 | `--text-tertiary` |
| Título de sección (`<h2>`) | `--fs-h1` | 600 | `--text-primary` |
| Enlace `Ver todas` | `--fs-body` | 500 | `--accent` |
| Nombre de plantilla (`<h3>`) | `--fs-h3` | 600 | `--text-primary` |
| Descripción | `--fs-sm` | 400 | `--text-secondary` |
| Badge | `--fs-label` | 600 | `--accent` |

━━━

## 3. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Tres columnas, gap `--sp-6`. Cabecera en dos zonas. |
| **1024–1279** | Tres columnas, gap `--sp-4`. |
| **768–1023** | **2 columnas**; la tercera plantilla ocupa una celda y queda un hueco a su derecha — se rellena con una cuarta plantilla del catálogo, no con espacio vacío. |
| **<768** | **Carrusel horizontal** con `scroll-snap-type: x mandatory`, tarjetas de `min-width: 78vw`, padding lateral `--sp-4` y `scroll-padding-inline`. Es contenido que scrollea **dentro de su contenedor**, no en el `<body>`. El enlace `Ver todas las plantillas →` baja bajo el carrusel, a ancho completo y centrado. |

El carrusel no lleva flechas ni puntos: el recorte de la tarjeta siguiente ya comunica que hay más.
Bajo `prefers-reduced-motion` el `scroll-behavior` deja de ser `smooth`.

━━━

## 4. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Badge** | `core/badge.md` | `Nueva` / `Pro` sobre la miniatura — variante neutra de acento |
| **Icon** | `guidelines/iconografia.md` | `arrow-right` 16 en el enlace de sección |
| **Content grid** | `layout/content-grid.md` | Grilla de tres columnas y su comportamiento responsive |
| **Card** | `core/card.md` | Tarjeta de plantilla, variante enlazable |

━━━

## 5. Datos y entrega de las miniaturas

- Fuente: `convex/templates.ts` → `tenantTemplates` (`name`, `tenantType`, revisiones en
  `tenantTemplateRevisions`). El escaparate público consume una **lista curada** de plantillas
  marcadas como destacadas, no el catálogo entero del tenant.
- Miniaturas: capturas reales de la plantilla renderizada con contenido de demostración, en
  **AVIF + WebP**, `width`/`height` explícitos, `loading="lazy"` (están bajo el pliegue).
- Igual que el product shot, son **artefactos vivos**: si la plantilla cambia, la miniatura se
  regenera en el mismo PR.
- `alt` descriptivo por plantilla: `alt="Plantilla Revista de Cuaderno, portada con destacados"`.

━━━

## 6. Reglas duras

1. **Cero botón negro en esta sección.** El único enlace de acción es índigo y es navegación.
2. Miniaturas 16:9 con `aspect-ratio` reservado. Un salto de layout aquí arrastra todo lo que sigue.
3. Máximo un badge por tarjeta. Nunca se pinta `Gratis`.
4. Tres plantillas en el escaparate, no seis. El catálogo tiene su propia página.
5. Sin sombra en reposo. El `--shadow-rest` de hover es la única profundidad permitida.
6. La tarjeta entera es el enlace: no hay un `Ver plantilla →` dentro de una tarjeta que ya es clicable.
