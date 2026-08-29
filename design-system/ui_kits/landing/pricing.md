# Landing · Pricing — tres planes en columnas iguales

> **Fuente:** la pantalla oficial cubre hasta la franja de features. Esta sección se **deriva**, no
> se inventa: patrón definido en `../../guidelines/landing.md` §5.
> **Estado en el código:** no existe. Tampoco existe modelo de planes en `convex/schema.ts`.
> **Las pantallas mandan** donde apliquen; aquí manda la derivación documentada.

━━━

## 1. Anatomía

Sección sobre `--bg-page`, hairline superior, padding vertical `--sp-16`, ancho 1200px centrado.

```
                        PRECIOS
              Empieza gratis. Crece cuando quieras.
        Todos los planes incluyen dominio, SSL y actualizaciones.

  ┌──────────────┐   ┌──────────────┐ ← Pro    ┌──────────────┐
  │ Gratis       │   │ Pro          │          │ Estudio      │
  │ $0 /mes      │   │ $__ /mes     │          │ $__ /mes     │
  │ descripción  │   │ descripción  │          │ descripción  │
  │ [ Comenzar ] │   │ [ Empezar ]  │ ← negro  │ [ Hablemos ] │
  │ ──────────── │   │ ──────────── │          │ ──────────── │
  │ ✓ beneficio  │   │ ✓ beneficio  │          │ ✓ beneficio  │
  └──────────────┘   └──────────────┘          └──────────────┘

              ¿Facturación anual? Ahorra dos meses.
```

### Cabecera de la sección

| # | Pieza | Especificación |
|---|---|---|
| 1 | **Eyebrow** | `PRECIOS` — `--fs-label`/600, mayúsculas, `+0.06em`, `--text-tertiary`, centrado |
| 2 | `--sp-4` | |
| 3 | **Título (`<h2>`)** | `Empieza gratis. Crece cuando quieras.` — `--fs-h1`/600, `--text-primary`, centrado, `text-wrap: balance` |
| 4 | `--sp-3` | |
| 5 | **Bajada** | Una línea en `--fs-body`/`--text-secondary`, centrada, `max-width: 56ch` |
| 6 | `--sp-6` | |
| 7 | **Conmutador mensual / anual** | Grupo segmentado: dos celdas, alto 40, `--radius-control`, hairline; activo en `--accent-tint` con texto `--accent`. A su derecha, píldora `Ahorra 2 meses` en `--perf-tint`/`--perf-strong`/`--fs-label` |
| 8 | `--sp-10` | |

El conmutador es **navegación entre dos vistas del mismo dato**, por eso su activo va en índigo —
la misma lógica que el tab activo y el alternador lista/grilla del panel.

### La tarjeta de plan

Tres columnas iguales (`repeat(3, minmax(0, 1fr))`), gap `--sp-6`, `align-items: stretch`.

| Propiedad | Plan normal | Plan recomendado |
|---|---|---|
| Fondo | `--surface` | `--surface` |
| Borde | 1px `--border-hairline` | **1px `--accent-border`** |
| Radio | `--radius-card` | `--radius-card` |
| Padding | `--sp-6` | `--sp-6` |
| Sombra | ninguna | `--shadow-rest` |
| Badge | — | `Pro` en `--accent-tint`/`--accent`, `--radius-pill`, alto 24, anclado arriba a la derecha del borde superior |
| CTA | `Button variant="secondary"` | **`Button variant="primary"`** (negro) |

**El plan recomendado NO lleva fondo de color.** Se distingue con borde `--accent-border`, badge
índigo y el único CTA negro de la sección. Pintarlo de índigo convertiría el color de navegación
en color de marketing y rompería la gramática.

**Contenido de la tarjeta, de arriba abajo:**

1. Nombre del plan — `--fs-h3`/600/`--text-primary`
2. `--sp-2` → Descripción de una línea — `--fs-sm`/`--text-secondary`
3. `--sp-5` → **Precio**: cifra en `--fs-h1`/600/`tabular-nums`/`--text-primary` + sufijo `/mes`
   en `--fs-sm`/`--text-tertiary` alineado a la línea base
4. `--sp-2` → Línea de facturación — `--fs-sm`/`--text-tertiary`
   (`Facturado anualmente` / `Sin tarjeta de crédito`)
5. `--sp-5` → **CTA a ancho completo**, alto 44
6. `--sp-5` → hairline de ancho completo
7. `--sp-5` → **Lista de beneficios**: `<ul>` con gap `--sp-3`. Cada fila:
   `circle-check` 16 en `--perf` + texto `--fs-body`/`--text-secondary`, alineados arriba.
   Los beneficios que son límites llevan la cifra en `tabular-nums`.

Los checks van en `--perf` porque describen **lo que el plan cumple** — es la misma semántica que
los factores en orden del SEO Analyzer. Un beneficio no incluido no se pinta con `x` gris: se omite.

━━━

## 2. Los tres planes

> **Cifras pendientes de confirmar con negocio.** La estructura es la decisión de diseño; los
> importes son un marcador de posición explícito y no deben publicarse sin aprobación.

| | **Gratis** | **Pro** *(recomendado)* | **Estudio** |
|---|---|---|---|
| Para quién | Para empezar a escribir hoy | Para vivir de lo que escribes | Para equipos y marcas |
| Precio | `$0` /mes | `$__` /mes | `$__` /mes |
| Facturación | Sin tarjeta de crédito | Facturado anualmente | Facturado anualmente |
| CTA | `Comenzar gratis` (secundario) | `Empezar con Pro` (**negro**) | `Hablemos` (secundario) |
| Beneficios | Blog en `tublog.cuaderno.com` · Editor completo · Comentarios · Analíticas básicas · Pie `Hecho con Cuaderno` | Todo lo de Gratis · Dominio propio · IA sin límites prácticos · SEO Analyzer completo · Analíticas avanzadas · Sin pie de Cuaderno | Todo lo de Pro · Varios blogs · Usuarios y roles · Exportación programada · Soporte prioritario |

**Nomenclatura obligatoria:** el plan de pago se escribe `Cuaderno Pro` en prosa y `Pro` en el
badge. Nunca `PRO`, nunca `Premium`. Ver `../../guidelines/marca.md` §6.

### Pie de la sección

`--sp-10` bajo las tarjetas, centrado, `--fs-sm`/`--text-secondary`:
`Todos los planes incluyen SSL, copias de seguridad y actualizaciones.` +
enlace `Ver comparación completa →` en `--accent` (es navegación, por eso es índigo).

━━━

## 3. Jerarquía tipográfica

| Elemento | Token | Weight | Color |
|---|---|---|---|
| Eyebrow | `--fs-label` | 600 | `--text-tertiary` |
| Título de sección | `--fs-h1` | 600 | `--text-primary` |
| Bajada | `--fs-body` | 400 | `--text-secondary` |
| Nombre del plan | `--fs-h3` | 600 | `--text-primary` |
| Descripción del plan | `--fs-sm` | 400 | `--text-secondary` |
| **Precio** | `--fs-h1` | 600 | `--text-primary`, `tabular-nums` |
| Sufijo `/mes` | `--fs-sm` | 400 | `--text-tertiary` |
| Línea de facturación | `--fs-sm` | 400 | `--text-tertiary` |
| Beneficio | `--fs-body` | 400 | `--text-secondary` |
| Badge `Pro` | `--fs-label` | 600 | `--accent` |
| Enlace de comparación | `--fs-sm` | 500 | `--accent` |

El precio comparte token con el título de página del panel (`--fs-h1`) y con la cifra de la stat
card. Es coherente: en los tres casos es **el número que hay que leer primero**.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Tres columnas iguales, gap `--sp-6`. La tarjeta recomendada **no** se escala ni se eleva más allá de `--shadow-rest`. |
| **1024–1279** | Tres columnas, gap `--sp-4`, padding de tarjeta a `--sp-5`. |
| **768–1023** | **2 + 1**: el plan recomendado y el gratis arriba, `Estudio` debajo a ancho completo con su lista en dos columnas. |
| **<768** | **Una columna, con el plan recomendado primero** (`order: -1`). Es la única sección donde el orden del DOM se reordena visualmente: el usuario móvil debe ver el plan que le recomendamos sin scrollear. Las tarjetas mantienen su padding y su CTA a ancho completo. El conmutador mensual/anual a ancho completo, alto 44. |

El reorden se hace con `order` en CSS, no reordenando el HTML: el orden semántico
(Gratis → Pro → Estudio) se conserva para lectores de pantalla y el badge `Pro` sigue anunciando
cuál es el recomendado.

━━━

## 5. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Button** | `core/button.md` | CTA de cada plan — un solo `primary` en la sección |
| **Badge** | `core/badge.md` | Badge `Pro`, variante neutra de acento (§2.2 del componente) |
| **Icon** | `guidelines/iconografia.md` | `circle-check` 16 en `--perf` por beneficio |
| **Content grid** | `layout/content-grid.md` | Grilla de tres columnas |
| **Card** | `core/card.md` | Tarjeta de plan |
| *Pendiente* | `core/segmented-control.md` | Conmutador mensual / anual |

━━━

## 6. Estados

- **Precios cargando** (si vienen de servidor): la cifra pasa a barra skeleton de 96×34 dentro de
  la tarjeta; nombre, descripción, CTA y beneficios se pintan ya. Ver `feedback/skeleton.md`.
- **Plan actual del usuario** (si está autenticado): la tarjeta de su plan sustituye el CTA por
  `Tu plan actual` deshabilitado, en `--surface-sunken`/`--text-tertiary`, y pierde el badge.
- **Conmutador anual activo**: la cifra cambia con crossfade en `--dur-fast`; la altura de la
  tarjeta **no** cambia (el sufijo y la línea de facturación reservan su alto).

━━━

## 7. Reglas duras

1. **Un solo CTA negro en la sección**, en el plan recomendado.
2. El plan recomendado se marca con borde `--accent-border` + badge, **nunca con fondo de color**.
3. Los checks son `--perf`. Nunca índigo, nunca negro.
4. Toda cifra en `tabular-nums`. Un precio que salta de ancho al cambiar de mensual a anual es un bug.
5. Nada de precios tachados, cuentas atrás, "solo por hoy" ni escasez fabricada.
6. Sin comparativas contra competidores. Ni tabla, ni nombre, ni alusión.
7. Los importes no se publican sin aprobación de negocio: hoy son marcador de posición.
