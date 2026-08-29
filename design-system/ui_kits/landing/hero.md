# Landing · Hero — el argumento de venta

> **Fuente:** `../../ui-ux-panels/01-landing-home.png`, primer pliegue.
> **Estado en el código:** no existe. Se construye desde cero.
> **Las pantallas mandan.** Reglas de la sección en `../../guidelines/landing.md` §2.

━━━

## 1. Anatomía

Dos columnas asimétricas **~46 / 54**, gap `--sp-12`, alineadas arriba (`align-items: start`).
La columna derecha **sangra fuera del contenedor** hasta el borde del viewport: la captura se corta
a propósito, sugiriendo que el producto continúa. Esa sangría se resuelve con `overflow-x: clip`
**en la sección**, nunca en el documento.

Padding vertical de la sección: `--sp-16` arriba, `--sp-16` abajo. Fondo `--bg-page`.

### Columna izquierda, de arriba abajo

| # | Pieza | Especificación |
|---|---|---|
| 1 | **Píldora de credenciales** | `Blog con IA · SEO avanzado · Sin límites`. Alto 36, `--radius-pill`, fondo `--surface-sunken`, hairline `--border-hairline`, padding-x `--sp-4`. Separadores con punto medio `·` en `--text-tertiary`. **Es texto, no badges de colores.** |
| 2 | `--sp-6` | |
| 3 | **Titular en dos líneas** | `Escribe. Optimiza.` en `--text-primary` + `Destaca.` en `--text-tertiary`. `--fs-display`, 700, `line-height: 1.05`, `letter-spacing: -0.03em`, `text-wrap: balance`. Es el `<h1>` único de la página. |
| 4 | `--sp-5` | |
| 5 | **Párrafo de valor** | 16/1.6, `--text-secondary`, `max-width: 46ch`. `control total` en 600 / `--text-primary`. |
| 6 | `--sp-8` | |
| 7 | **Par de CTAs** | Fila, gap `--sp-3`. `Comenzar gratis` (negro, alto 48, padding-x `--sp-6`) + `Ver demo` (secundario: `--surface`, hairline, `--text-primary`, icono `play` 16 a la izquierda). |
| 8 | `--sp-10` | |
| 9 | **Tres micro-features** | Fila, gap `--sp-6`. Cada una: icono 20 en cuadro 40 (`--radius-control`, `--surface-sunken`, icono `--text-secondary`) + dos líneas. |

**Las tres micro-features (orden fijo):**

| Icono | Título | Descripción |
|---|---|---|
| `zap` | IA que escribe | por ti |
| `trending-up` | SEO que te posiciona | mejor |
| `users` | Diseño que convierte | más visitantes |

### Columna derecha

La captura del producto en tarjeta elevada. Su anatomía completa vive en `product-shot.md`.

━━━

## 2. La decisión clave del hero

**La tercera palabra atenuada.** `Destaca.` va en `--text-tertiary`, no en índigo ni en verde.
La jerarquía del titular se hace con **valor tipográfico**, no con color. Pintarla de acento
rompería la regla de los tres colores en el primer pliegue de la página que la enseña.

━━━

## 3. Jerarquía tipográfica

| Elemento | Token | Weight | Tracking | Color |
|---|---|---|---|---|
| Píldora | `--fs-sm` | 500 | 0 | `--text-secondary` |
| Titular, línea 1 | `--fs-display` | 700 | −0.03em | `--text-primary` |
| Titular, línea 2 | `--fs-display` | 700 | −0.03em | `--text-tertiary` |
| Párrafo | 16 / 1.6 | 400 | 0 | `--text-secondary` |
| Énfasis del párrafo | 16 / 1.6 | 600 | 0 | `--text-primary` |
| CTA primario | `--fs-body` | 600 | 0 | `--text-on-dark` |
| CTA secundario | `--fs-body` | 600 | 0 | `--text-primary` |
| Micro-feature, título | `--fs-sm` | 600 | 0 | `--text-primary` |
| Micro-feature, descripción | `--fs-sm` | 400 | 0 | `--text-secondary` |

**El hero es la única superficie del sistema que usa `--fs-display`.** El panel nunca grita.

Escalado del display: `clamp(32px, 4.4vw, 60px)`. El token `--fs-display` (44px) es el valor de
referencia a 1280; el `clamp` lo hace fluido sin salirse de la escala en ninguno de sus extremos.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Anatomía canónica: 46/54, display fluido hasta 60px, captura sangrada y elevada. |
| **1024–1279** | Dos columnas conservadas. La captura se recorta más y **pierde la elevación** (`--shadow-float` → `--shadow-rest`). Micro-features siguen en fila. |
| **768–1023** | Una columna: píldora → titular → párrafo → CTAs → micro-features → captura debajo, centrada y a ancho completo. Los dos CTAs se reparten en fila. |
| **<768** | Todo apilado. Titular a **32px** con tracking `-0.02em`. Los dos CTAs a **ancho completo y apilados**, `Comenzar gratis` arriba, gap `--sp-3`. Micro-features en columna, icono a la izquierda del par de líneas. Párrafo sin `max-width` (lo limita el padding). |

En ningún ancho hay scroll horizontal en `<body>`.
Animación de entrada permitida: `opacity` + `translateY(8px)` en `--dur-base`, **anulada** bajo
`prefers-reduced-motion`. Ninguna animación que mueva el layout: es el LCP de la página.

━━━

## 5. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Button** | `core/button.md` | `Comenzar gratis` (`primary`, `size="lg"`), `Ver demo` (`secondary` con `icon` izquierdo) |
| **Icon** | `guidelines/iconografia.md` | `play`, `zap`, `trending-up`, `users` |
| **Product shot** | `ui_kits/landing/product-shot.md` | Columna derecha completa |
| **Card** | `core/card.md` | Tarjeta contenedora de la captura |

La píldora de credenciales **no es un `Badge`** (`core/badge.md`): el badge describe estado de
contenido y tiene vocabulario cerrado. Aquí es una píldora de texto neutro, sin componente propio.
Tampoco es un `Chip` (`core/chip.md`): no se puede quitar ni alternar.

━━━

## 6. Copy canónico

```
Blog con IA · SEO avanzado · Sin límites

Escribe. Optimiza.
Destaca.

Cuaderno es el blog con IA que te da control total sobre tu contenido,
diseño y SEO para que puedas enfocarte en lo que importa: tus ideas.

[ Comenzar gratis ]  [ ▷ Ver demo ]

⚡ IA que escribe      📈 SEO que te posiciona     👥 Diseño que convierte
   por ti                 mejor                       más visitantes
```

**Dos correcciones sobre el render** (son erratas, no decisiones de diseño — ver `landing.md` §8):

1. ~~La pantalla dice `Opttimiza.` con doble `t`~~ → **RESUELTO (Eduardo, 2026-08-29):** el titular es **`Escribe. Optimiza. Destaca.`**
2. ~~La pantalla dice `el blog AI con esteroides`~~ → **RESUELTO (Eduardo, 2026-08-29):** copy definitivo `Cuaderno es el blog con IA que te da control total sobre tu contenido, diseño y SEO para que puedas enfocarte en lo que importa: tus ideas.` Rompía dos normas del sistema: usaba `AI` en vez de
   `IA` (la píldora justo encima ya dice `Blog con IA`) y recurre a una muletilla. El párrafo de
   arriba es el reemplazo. **Confirmar con Eduardo antes de implementar.**

Los iconos del bloque de copy son ilustrativos de este documento: en la UI son `zap`,
`trending-up` y `users` de Lucide. **Cero emoji en el producto.**

━━━

## 7. Reglas duras

1. **Un solo `<h1>` en toda la página**, y es este.
2. La segunda línea del titular va en `--text-tertiary`. Nunca en `--accent`, nunca en `--perf`.
3. `Comenzar gratis` es el único negro del pliegue. `Ver demo` es secundario, siempre.
4. Sin degradados, sin glow, sin fondo de color de marca detrás del titular.
5. La captura es una imagen del producto real, nunca un `<iframe>` ni un vídeo en autoplay.
6. Sin signos de exclamación, sin superlativos, sin nombrar competidores.
7. La sigla es **`IA`**, nunca `AI`.
