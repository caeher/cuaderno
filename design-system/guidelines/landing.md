# Landing

> Fuente: `../ui-ux-panels/01-landing-home.png`. Donde el código y la pantalla no coincidan, gana la pantalla.
> **Esta pantalla no existe todavía en el código.** Se construye desde cero siguiendo esta anatomía.

━━━

## 0. Reglas de la landing

- La landing es **la única superficie del sistema que usa `--fs-display`**. El panel nunca grita.
- Fondo `--bg-page`; las secciones alternan con `--surface` y se separan con **hairline, nunca con sombra**. Las únicas sombras de la página son `--shadow-float` en la captura del hero y en los dropdowns de la nav.
- **La regla de los tres colores no se relaja aquí.** Negro para `Comenzar gratis`, índigo solo para lo que hace la IA y para navegación, verde solo para cifras de resultado. Sin degradados, sin glow, sin fondos de color de marca.
- Ancho de contenido: 1200px centrados (la nav llega a `--content-max`), padding-x `--sp-8`.
- **El héroe visual es el producto real**, no una ilustración. La captura del panel Resumen es el argumento de venta.
- Un `<h1>` único. Estructura semántica: `header > nav`, `main > section`, `footer`.
- Copy en español neutro, segunda persona, sin signos de exclamación, sin superlativos y **sin nombrar competidores**: el liderazgo se afirma mostrando funciones, no comparando.

━━━

## 1. Barra de navegación

**Estructura.** Tres zonas en una fila: lockup a la izquierda, navegación centrada, acciones a la derecha. Altura ~92px (la landing respira más que el panel, que usa `--topbar-h`), padding-x `--sp-8`.

| Elemento | Especificación |
|---|---|
| Lockup | Isotipo 24 + wordmark 20/600, `--text-primary` |
| Enlaces | `Funciones ▾` · `Precios` · `Plantillas` · `Recursos ▾` · `Blog` — `--fs-body`/500, `--text-secondary`, hover `--text-primary`, gap `--sp-8` |
| `Iniciar sesión` | Enlace de texto, `--fs-body`/500, `--text-secondary` |
| `Comenzar gratis` | Botón `--action`, alto 44, padding-x `--sp-5`, `--radius-control`, `--fs-body`/600, `--text-on-dark` |

`Funciones` y `Recursos` llevan `chevron-down` y abren un panel: `--surface`, `--radius-card`, hairline, `--shadow-float`, con items de dos líneas (nombre `--fs-body`/600 + descripción `--fs-sm`/`--text-secondary`) y un icono 20 en cuadro `--surface-sunken`. Se abren con clic y con teclado, se cierran con `Esc`, y **nunca por hover solo**.

**Al hacer scroll** la nav queda sticky, reduce su altura a 72px en `--dur-base`, adopta fondo `--bg-page` al 80% con `backdrop-filter: blur(12px)` y hairline inferior.

**Móvil** (`<1024`): lockup + `menu`. El CTA negro **permanece visible** en la barra; el resto entra al drawer a pantalla completa, con `Iniciar sesión` al final.

━━━

## 2. Hero

Dos columnas asimétricas, ~46 / 54, gap `--sp-12`, alineadas arriba. La columna derecha **sangra hacia fuera del contenedor** hasta el borde del viewport: la captura se corta a propósito, sugiriendo que el producto continúa.

**Columna izquierda, de arriba abajo:**

1. **Píldora de credenciales.** `Blog con IA · SEO avanzado · Sin límites` — alto 36, `--radius-pill`, fondo `--surface-sunken`, hairline, `--fs-sm`/500/`--text-secondary`, separadores con punto medio `·`. Es texto, no badges de colores.
2. **`--sp-6`**
3. **Titular en dos líneas.** `Escribe. Optimiza.` en `--text-primary` y `Destaca.` en `--text-tertiary`. `--fs-display`, weight 700, `line-height: 1.05`, `letter-spacing: -0.03em`, `text-wrap: balance`.
   **La tercera palabra atenuada es la decisión clave del hero:** la jerarquía se hace con valor tipográfico, no con color. No la pintes de índigo ni de verde.
4. **`--sp-5`**
5. **Párrafo de valor.** 16/1.6, `--text-secondary`, máximo 46ch, con `control total` en weight 600 / `--text-primary`.
6. **`--sp-8`**
7. **Par de CTAs**, gap `--sp-3`: `Comenzar gratis` (negro, alto 48, padding-x `--sp-6`) y `Ver demo` (secundario: `--surface`, hairline, `--text-primary`, icono `play` 16 a la izquierda).
8. **`--sp-10`**
9. **Tres micro-features en fila**, gap `--sp-6`. Cada una: icono 20 en cuadro 40 (`--radius-control`, `--surface-sunken`, icono `--text-secondary`) + dos líneas — título `--fs-sm`/600/`--text-primary`, descripción `--fs-sm`/400/`--text-secondary`.
   `zap` **IA que escribe** / por ti · `trending-up` **SEO que te posiciona** / mejor · `users` **Diseño que convierte** / más visitantes.

**Columna derecha — la captura.** Tarjeta `--surface`, `--radius-card`, hairline, `--shadow-float`, ligeramente elevada respecto al titular. Contiene una captura real de la pantalla 02 (Resumen) con su sidebar, sus stat cards, la tabla de entradas recientes y el rail de SEO Analyzer y Sugerencia de IA.

**Es un artefacto vivo:** cuando el panel cambie de aspecto, esta imagen se regenera. Una captura desactualizada es una promesa falsa. Se entrega en AVIF + WebP con `width`/`height` explícitos, `priority` y `sizes`; **nunca** un `<iframe>` con el producto real ni un vídeo en autoplay.

━━━

## 3. Franja de features — «Un blog, infinitas posibilidades»

Bloque sobre `--surface` con `--radius-card` en las esquinas superiores, hairline superior, padding vertical `--sp-16`. El contraste con el `--bg-page` del hero es lo que separa las secciones; no hay divisor grueso.

Dos columnas, ~30 / 70:

**Izquierda (columna de título):**
- Eyebrow `TODO LO QUE NECESITAS` en `--fs-label` (12/600, mayúsculas, `+0.06em`), `--text-tertiary`.
- `--sp-4`
- `Un blog, infinitas posibilidades` en `--fs-h1`, weight 600, en dos líneas, `--text-primary`.

**Derecha:** cuatro columnas iguales, gap `--sp-8`. Cada feature:
icono 24 en cuadro 48 (`--radius-control`, `--surface-sunken`) → `--sp-4` → título `--fs-h3` → `--sp-2` → descripción `--fs-body`/`--text-secondary`, dos líneas.

| Icono | Título | Descripción |
|---|---|---|
| `square-pen` | Editor con IA | Escribe mejor y más rápido con asistencia inteligente. |
| `search` | SEO Avanzado | Herramientas integradas para posicionarte en Google. |
| `layout-dashboard` | Diseño sin límites | Personaliza tu blog a tu manera, sin código. |
| `message-circle` | Comentarios y comunidad | Fomenta la conversación y construye tu audiencia. |

Los cuadros de icono aquí van en `--surface-sunken` neutro, **no** en los tintes `--cat-N` de las stat cards: esto es marketing, no métrica.

━━━

## 4. Cierre de la franja

Línea centrada a ancho completo, separada `--sp-12` de la grilla, con hairline superior: `Pensado para creadores, escritores y marcas que quieren crecer.` en 17/500 / `--text-secondary`. Es la bisagra entre la promesa de producto y la prueba social que viene debajo.

━━━

## 5. Bajo el pliegue — cómo continuar sin inventar

La pantalla oficial cubre hasta aquí. Todo lo que siga se construye **derivando**, no inventando. Cuatro reglas:

1. Las secciones alternan `--bg-page` y `--surface`, separadas por hairline. Nunca por sombra ni por bloque de color de marca.
2. **Un solo CTA negro por sección**, como máximo.
3. Índigo únicamente donde hay IA o navegación. Verde únicamente en cifras de resultado.
4. Toda sección reutiliza componentes ya definidos: tarjeta, stat card, badge, anillo de score, tabla. La landing **muestra el sistema**, no uno paralelo.

Orden recomendado y patrón de cada sección:

| Sección | Patrón |
|---|---|
| **Prueba social** | Banda de `--surface-sunken`, logos en `--text-tertiary` a una sola tinta, o tres cifras en `--fs-h1` `tabular-nums` con label `--fs-sm` |
| **Bloque IA** | Fondo `--accent-tint`, borde `--accent-border`, ✦ índigo, texto a la izquierda y captura del editor con `Escribir con IA` a la derecha |
| **Bloque SEO** | Anillo de score verde grande + lista de factores con checks `--perf`, junto a la captura del SEO Analyzer |
| **Plantillas** | Grilla de 3 con miniaturas 16:9, `--radius-card`, hairline; enlace `Ver todas las plantillas →` en `--accent` |
| **Precios** | Tres planes en columnas iguales. El recomendado lleva borde `--accent-border` y badge `Pro` índigo — **no** fondo de color. CTA negro solo en el recomendado; los otros dos, secundarios. Cada beneficio con `circle-check` en `--perf` |
| **FAQ** | Acordeón de filas separadas por hairline, pregunta `--fs-h3`, `chevron-down` que rota en `--dur-fast` |
| **CTA final** | Banda `--action` a ancho completo, `--text-on-dark`, titular en `--fs-h1` y botón **blanco** (`--surface` + `--text-primary`) — es la única inversión de la página |
| **Footer** | Hairline superior, cuatro columnas de enlaces (`--fs-sm`/`--text-secondary`), lockup + una línea descriptiva a la izquierda, y una fila inferior con copyright, legales y selector de idioma |

━━━

## 6. Responsive

- **≥1280** — anatomía canónica; el display escala con `clamp(32px, 4.4vw, 60px)`.
- **1024–1279** — el hero conserva dos columnas; la captura se recorta más y pierde la elevación. Features 4 → 2 columnas.
- **768–1023** — hero a una columna: píldora, titular, párrafo, CTAs y micro-features; la captura pasa debajo, centrada y a ancho completo. Los dos CTAs se reparten en fila. Features en 2 columnas.
- **<768** — todo apilado. Titular a 32px con tracking `-0.02em`. Los dos CTAs a ancho completo y apilados (`Comenzar gratis` arriba), gap `--sp-3`. Micro-features en columna con el icono a la izquierda. Features en 1 columna. Precios en 1 columna con el plan recomendado primero. Nav en drawer. `--touch-target: 44px` en todo enlace de nav y footer.
- Sin scroll horizontal en `<body>` en ningún ancho: la sangría de la captura se resuelve con `overflow-x: clip` en la sección, no en el documento.

━━━

## 7. Rendimiento y SEO de la propia landing

La página que vende SEO tiene que puntuar. No es una metáfora: es el argumento.

- Captura del hero con `priority`, dimensiones explícitas y AVIF/WebP. Es el LCP; nada debe adelantarla.
- Fuente vía `next/font` con `display: swap` y `size-adjust` — CLS cero, sin FOIT.
- **Ninguna animación de entrada que mueva el layout.** Se permite un `opacity`/`translateY(8px)` sutil en `--dur-base`, anulado bajo `prefers-reduced-motion`.
- Cero JavaScript en el camino crítico salvo el de la nav; secciones bajo el pliegue con `loading="lazy"` en sus imágenes.
- `<html lang="es">`, un `<h1>`, jerarquía `h2`/`h3` sin saltos, `alt` descriptivo en la captura (`Panel de Cuaderno mostrando el resumen de rendimiento de un blog`), metadatos Open Graph y Twitter, `canonical`, y JSON-LD `SoftwareApplication` + `Organization`.
- Contraste verificado en claro **y** oscuro: la landing hereda el tema del sistema como el resto del producto.

━━━

## 8. Voz del copy

- Segunda persona, presente de indicativo: `tu blog`, `escribe`, `personaliza`.
- Frases cortas. Una idea por línea. Cero adverbios de relleno.
- **Sin signos de exclamación. Sin superlativos. Sin nombrar competidores ni compararse con nadie**: la ventaja se muestra con funciones y con la captura del producto.
- Español consistente: la sigla es **`IA`**, nunca `AI`.

**Dos correcciones pendientes sobre la pantalla** — la maqueta manda en el diseño, pero estas dos son erratas de render, no decisiones:

1. ~~El titular aparece como `Opttimiza.` con doble `t`~~ → **RESUELTO (Eduardo, 2026-08-29):** el titular es **`Escribe. Optimiza. Destaca.`**
2. ~~El párrafo del hero dice `el blog AI con esteroides`~~ → **RESUELTO (Eduardo, 2026-08-29).** Rompía dos normas del propio sistema: usaba `AI` en vez de `IA` —la píldora inmediatamente encima ya dice `Blog con IA`— y recurría a una muletilla. **Copy definitivo:** `Cuaderno es el blog con IA que te da control total sobre tu contenido, diseño y SEO para que puedas enfocarte en lo que importa: tus ideas.`
