# Landing · Nav — barra de navegación de marketing

> **Fuente:** `../../ui-ux-panels/01-landing-home.png`, franja superior.
> **Estado en el código:** la landing **no existe**. `components/site/navbar.tsx` pinta otra cosa
> (`Explorar` · `Autores` · `Cómo funciona`). Esta sección se construye desde cero.
> **Las pantallas mandan.** Especificación de componente en `../../components/navigation/landing-nav.md`.

━━━

## 1. Anatomía

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [book-open] cuaderno    Funciones ▾  Precios  Plantillas  Recursos ▾  Blog   │
│                                            Iniciar sesión  [ Comenzar gratis ]│
└──────────────────────────────────────────────────────────────────────────────┘
   ↑ lockup                ↑ navegación centrada            ↑ acciones a la derecha
```

Tres zonas en una fila (`display: grid; grid-template-columns: auto 1fr auto`), alineadas por su
centro vertical.

| Propiedad | Valor |
|---|---|
| Altura en reposo | **92px** — la landing respira más que el panel, que usa `--topbar-h` |
| Altura tras scroll | **72px**, transición en `--dur-base` con `--ease-out` |
| Ancho | `--content-max` con `padding-inline: var(--sp-8)` |
| Fondo en reposo | `--bg-page`, sin borde |
| Fondo tras scroll | `--bg-page` al 80% + `backdrop-filter: blur(12px)` + hairline inferior `--border-hairline` |
| Posición | `position: sticky; top: 0; z-index: 30` |

**Zona 1 — lockup.** Isotipo `book-open` 24px + gap `--sp-2` + wordmark `cuaderno` en 20/600,
tracking `-0.02em`, `--text-primary`. Envuelto en un `<a href="/">` con
`aria-label="Cuaderno — inicio"`. Ver `../../guidelines/marca.md` §3.

**Zona 2 — enlaces.** `Funciones ▾` · `Precios` · `Plantillas` · `Recursos ▾` · `Blog`.
Gap `--sp-8`. Alto de zona táctil 40px (44 en `<1024`), padding-x `--sp-2`, `--radius-control`.

**Zona 3 — acciones.** `Iniciar sesión` (enlace de texto) + `Comenzar gratis`
(`Button variant="primary"`, alto 44, padding-x `--sp-5`). Gap `--sp-5`.

### Dropdowns de `Funciones` y `Recursos`

Panel `--surface`, `--radius-card`, hairline, `--shadow-float` — **la única sombra de la nav**.
Ancho 420px, padding `--sp-4`, items en dos columnas.

Cada item: icono 20 en cuadro 40 (`--radius-input`, `--surface-sunken`, icono `--text-secondary`)
+ dos líneas — nombre `--fs-body`/600/`--text-primary` y descripción `--fs-sm`/`--text-secondary`.

- Se abren **con clic y con teclado**, nunca por hover solo.
- Se cierran con `Esc`, con clic fuera y al navegar; el foco vuelve al disparador.
- `aria-expanded` en el disparador, `role="menu"` en el panel.

| Menú | Items |
|---|---|
| `Funciones ▾` | `square-pen` Editor con IA · `search` SEO Analyzer · `layout-dashboard` Diseño sin código · `message-circle` Comentarios · `chart-column` Analíticas · `globe` Dominio propio |
| `Recursos ▾` | `book-open` Documentación · `graduation-cap` Guías · `life-buoy` Soporte · `map` Novedades |

━━━

## 2. Jerarquía tipográfica

| Elemento | Token | Weight | Color |
|---|---|---|---|
| Wordmark | 20px (fuera de escala, atado al isotipo — ver `marca.md` §3) | 600 | `--text-primary` |
| Enlace de nav | `--fs-body` | 500 | `--text-secondary` → hover `--text-primary` |
| Nombre de item de dropdown | `--fs-body` | 600 | `--text-primary` |
| Descripción de item | `--fs-sm` | 400 | `--text-secondary` |
| `Iniciar sesión` | `--fs-body` | 500 | `--text-secondary` |
| `Comenzar gratis` | `--fs-body` | 600 | `--text-on-dark` |

Ningún elemento de la nav usa `--fs-h3` o mayor: la nav no compite con el `<h1>` del hero.

━━━

## 3. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Anatomía canónica. Nav centrada real (la zona 2 se centra respecto al viewport, no respecto al hueco). |
| **1024–1279** | Se mantienen las tres zonas; gap de enlaces baja a `--sp-6`. |
| **<1024** | Lockup a la izquierda + `Comenzar gratis` + `menu`. **El CTA negro permanece visible en la barra**; el resto entra al drawer. |
| **Drawer** | Pantalla completa desde la derecha, `--surface`, padding `--sp-6`. Enlaces apilados a `--fs-h3`/500, alto 56 cada uno, hairline entre ellos. Los grupos `Funciones` y `Recursos` se expanden en acordeón en lugar de abrir panel. `Iniciar sesión` al final, a ancho completo, secundario. Cierre con `x`, con `Esc` y con clic en el overlay (negro al 40%). |
| **Todos** | `--touch-target: 44px` mínimo real en cada enlace. Sin scroll horizontal en `<body>`. |

Al abrir el drawer se bloquea el scroll del documento (`overflow: hidden` en `<body>`) y se atrapa
el foco dentro; al cerrarlo vuelve al botón `menu`.

━━━

## 4. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Landing nav** | `navigation/landing-nav.md` | Es la especificación de este bloque |
| **Button** | `core/button.md` | `Comenzar gratis` (`primary`), `Iniciar sesión` (`ghost` en drawer) |
| **Icon Button** | `core/icon-button.md` | `menu` y `x` del drawer |
| **Dropdown Menu** | `core/dropdown-menu.md` | Base de los paneles `Funciones` y `Recursos` |
| **Icon** | `guidelines/iconografia.md` | `book-open`, `chevron-down`, `menu`, `x` y los iconos de item |
| *Pendiente* | `core/sheet.md` | Drawer móvil — spec por escribir |

━━━

## 5. Reglas duras

1. **Un solo botón negro en la barra.** `Iniciar sesión` nunca es un botón.
2. La nav es el único lugar de la landing, junto al product shot, donde se permite `--shadow-float`.
3. Los dropdowns **no** se abren por hover. Teclado y clic, siempre.
4. Ningún enlace de nav se pinta de `--accent`: el índigo aquí solo aparece en el indicador de foco.
5. El wordmark es texto vivo, no una imagen: hereda tema claro/oscuro.
6. La nav no cambia entre landing, precios, plantillas y blog. Es una sola pieza.
