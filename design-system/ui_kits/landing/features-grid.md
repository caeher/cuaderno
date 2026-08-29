# Landing · Features grid — «Un blog, infinitas posibilidades»

> **Fuente:** `../../ui-ux-panels/01-landing-home.png`, franja bajo el hero.
> **Estado en el código:** no existe.
> **Las pantallas mandan.** Reglas de la sección en `../../guidelines/landing.md` §3–§4.

━━━

## 1. Anatomía

Bloque sobre `--surface` con `--radius-card` en las **esquinas superiores**, hairline superior
`--border-hairline`, padding vertical `--sp-16`. El contraste entre el `--bg-page` del hero y el
`--surface` de esta franja es lo que separa las secciones: **no hay divisor grueso y no hay sombra**.

Dos columnas **~30 / 70**, gap `--sp-12`, alineadas arriba.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TODO LO QUE NECESITAS      ┌────┐   ┌────┐   ┌────┐   ┌────┐             │
│                            │ ▢  │   │ ▢  │   │ ▢  │   │ ▢  │             │
│ Un blog,                   Editor   SEO      Diseño   Comentarios        │
│ infinitas posibilidades    con IA   Avanzado sin      y comunidad        │
│                            desc.    desc.    límites  desc.              │
│                                                                          │
│ ──────────────────────────────────────────────────────────────────────── │
│        Pensado para creadores, escritores y marcas que quieren crecer.   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Columna izquierda — título

| # | Pieza | Especificación |
|---|---|---|
| 1 | **Eyebrow** | `TODO LO QUE NECESITAS` — `--fs-label` (12/600), mayúsculas, tracking `+0.06em`, `--text-tertiary` |
| 2 | `--sp-4` | |
| 3 | **Título de sección** | `Un blog, infinitas posibilidades` — `--fs-h1`, weight 600, en dos líneas, `--text-primary`, `text-wrap: balance`. Es el `<h2>` de la sección. |

### Columna derecha — cuatro features

Cuatro columnas iguales (`repeat(4, minmax(0, 1fr))`), gap `--sp-8`.

Cada feature, de arriba abajo:
icono 24 en cuadro 48 (`--radius-control`, `--surface-sunken`, icono `--text-secondary`)
→ `--sp-4` → título `--fs-h3` → `--sp-2` → descripción `--fs-body`/`--text-secondary`, dos líneas.

| Icono | Título | Descripción |
|---|---|---|
| `square-pen` | Editor con IA | Escribe mejor y más rápido con asistencia inteligente. |
| `search` | SEO Avanzado | Herramientas integradas para posicionarte en Google. |
| `layout-dashboard` | Diseño sin límites | Personaliza tu blog a tu manera, sin código. |
| `message-circle` | Comentarios y comunidad | Fomenta la conversación y construye tu audiencia. |

**Los cuadros de icono van en `--surface-sunken` neutro**, no en los tintes `--cat-N` de las stat
cards. Esto es marketing, no métrica: los tintes de categoría significan "esta cifra pertenece a
esta serie", y aquí no hay cifra.

### Cierre de la franja

Línea centrada a ancho completo, separada `--sp-12` de la grilla, con hairline superior:

> `Pensado para creadores, escritores y marcas que quieren crecer.`

17/500 en `--text-secondary`. Es la bisagra entre la promesa de producto y la prueba social que
viene debajo.

━━━

## 2. Jerarquía tipográfica

| Elemento | Token | Weight | Tracking | Color |
|---|---|---|---|---|
| Eyebrow | `--fs-label` | 600 | +0.06em | `--text-tertiary` |
| Título de sección (`<h2>`) | `--fs-h1` | 600 | −0.02em | `--text-primary` |
| Título de feature (`<h3>`) | `--fs-h3` | 600 | 0 | `--text-primary` |
| Descripción de feature | `--fs-body` | 400 | 0 | `--text-secondary` |
| Línea de cierre | 17 / 1.5 | 500 | 0 | `--text-secondary` |

La sección **no usa `--fs-display`**: ese token es exclusivo del hero. Un segundo display en la
misma página anula la jerarquía del `<h1>`.

Los 17px de la línea de cierre son el único valor fuera de la escala de siete niveles, heredado
del render; si se quiere disciplina estricta, baja a `--fs-h3` (16/600) sin pérdida visual.

━━━

## 3. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico: 30/70, cuatro columnas de features. |
| **1024–1279** | Se conserva 30/70. Features **4 → 2 columnas**, gap `--sp-8`, `row-gap` `--sp-10`. |
| **768–1023** | El título pasa **arriba**, a ancho completo, centrado a la izquierda; las features debajo en **2 columnas**. |
| **<768** | Todo apilado. Features en **1 columna**, cada una con el icono a la izquierda y el par título+descripción a la derecha (`grid-template-columns: 48px 1fr`, gap `--sp-4`). Padding vertical de la sección a `--sp-12`. Línea de cierre a `--fs-body`, centrada, con `text-wrap: balance`. |

Las descripciones de dos líneas se controlan con `text-wrap: pretty`, nunca con `<br>` manual.

━━━

## 4. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Icon** | `guidelines/iconografia.md` | `square-pen`, `search`, `layout-dashboard`, `message-circle` a 24px |
| **Content grid** | `layout/content-grid.md` | La grilla de 4 columnas reutiliza sus reglas de `minmax(0, 1fr)` y gap |
| **Tipografía** | `guidelines/tipografia.md` | Escala completa |

**No consume `Stat Card`** aunque la forma se le parezca: la stat card lleva cifra, delta y
contexto, y su cuadro de icono va tintado. Aquí no hay dato, solo promesa. Reutilizar el componente
arrastraría el tinte `--cat-N` a una superficie de marketing y rompería el significado del color.

━━━

## 5. Reglas duras

1. **Cero color semántico en esta franja.** Ni índigo, ni verde, ni negro salvo el texto. No hay
   CTA aquí: el siguiente botón negro llega en `pricing.md` o en `cta-final.md`.
2. Los cuadros de icono son `--surface-sunken`. Nunca `--cat-N`, nunca `--accent-tint`.
3. Cuatro features exactas. Una quinta rompe la grilla en todos los breakpoints; si aparece una
   función nueva, sustituye a una existente o se va a una página de `Funciones`.
4. Las descripciones son de una frase y terminan en punto.
5. La franja no lleva sombra. Se separa del hero por el cambio de superficie y el hairline.
