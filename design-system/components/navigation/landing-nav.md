# Landing nav — navegación de marketing

> **Fuente:** `01-landing-home.png`, franja superior.
> **Estado:** la landing **no existe todavía en el código** (`components/site/navbar.tsx` pinta otra
> cosa: `Explorar` · `Autores` · `Cómo funciona`). Esta especificación define lo que hay que construir.
> **Las pantallas mandan.**

━━━

## 1. Propósito

Única navegación del sitio público de marketing. Su trabajo es **llevar a `Comenzar gratis`** sin
estorbar al hero. Por eso: sin fondo, sin borde, sin sombra en el estado inicial — la nav flota sobre el
papel y el único elemento con peso visual es el botón negro.

Es la barra que introduce la regla de color a un visitante que aún no conoce el producto:
**negro = la acción**, todo lo demás es texto tranquilo.

## 2. Anatomía

```
┌──────────────────────── 1440px máx · gutter 64px ────────────────────────┐
│ ▢ cuaderno     Funciones ⌄  Precios  Plantillas  Recursos ⌄  Blog        │
│                                              Iniciar sesión [Comenzar gratis] │
└──────────────────────────────────────────────────────────────────────────┘
   ↑ marca         ↑ enlaces centrados                    ↑ acciones a la derecha
```

Layout de tres columnas: marca a la izquierda, **enlaces centrados ópticamente** (no a la izquierda del
todo, como en el código actual), acciones a la derecha. En `01` el bloque de enlaces queda centrado en
el ancho de la ventana, no entre marca y acciones — se consigue con
`grid-template-columns: 1fr auto 1fr`.

| Propiedad | Token / valor |
|---|---|
| Alto | `80px` — **token nuevo `--nav-h-landing`**; el panel usa `--topbar-h` (64px), la landing respira más |
| Ancho máximo | `--content-max` (1440px), centrado |
| Gutter | `var(--sp-16)` (64px) en `≥ 1280px`, `var(--sp-8)` en `768–1279px`, `var(--sp-6)` en `< 768px` |
| Fondo inicial | transparente sobre `--bg-page` |
| Borde inicial | ninguno |
| Sombra | ninguna, nunca |
| Posición | `position: sticky; top: 0; z-index: 40` |

### Estado tras el scroll

Al superar `24px` de scroll: fondo `color-mix(in srgb, var(--bg-page) 85%, transparent)` con
`backdrop-filter: blur(12px)` y borde inferior `1px solid var(--border-hairline)`. Transición
`--dur-base --ease-out` sobre `background-color` y `border-color`. **No se añade sombra**: la landing
obedece la misma disciplina que el panel — borde y aire.

## 3. Piezas

### 3.1 Marca

Isotipo de libro abierto `22×22` + wordmark `cuaderno` en minúsculas, `--fs-h2` (20px), `600`,
`letter-spacing: -0.01em`, `--text-primary`, gap `var(--sp-3)`. Enlaza a `/`.

### 3.2 Enlaces

| Enlace | Tipo | Destino |
|---|---|---|
| `Funciones` | **dropdown** | mega-menú, § 3.3 |
| `Precios` | simple | `/precios` |
| `Plantillas` | simple | `/plantillas` |
| `Recursos` | **dropdown** | mega-menú, § 3.3 |
| `Blog` | simple | `/blog` |

| Propiedad | Token / valor |
|---|---|
| Tipografía | `--fs-body` (14/1.55), `500` |
| Color | `--text-primary` (la landing no usa gris para su navegación principal) |
| Gap entre enlaces | `var(--sp-8)` (32px) |
| Chevron de dropdown | `chevron-down` `14px`, `--text-tertiary`, gap `var(--sp-1)` |
| Alto de zona activable | `40px`, `padding-inline: var(--sp-2)`, `var(--radius-control)` |
| Hover | color `--text-secondary`; el chevron rota `180°` en `--dur-fast --ease-out` cuando el menú abre |
| Página actual | `aria-current="page"` + peso `600`; **sin subrayado índigo** — el subrayado índigo es del panel (`tabs.md`), aquí sería ruido |

### 3.3 Dropdowns

`Funciones` y `Recursos` abren un panel bajo la nav, alineado al centro del disparador.

| Propiedad | Token / valor |
|---|---|
| Superficie | `--surface`, `var(--radius-card)`, borde `1px --border-hairline`, `--shadow-float` |
| Ancho | `Funciones` 640px en 2 columnas · `Recursos` 320px en 1 columna |
| Padding | `var(--sp-5)` |
| Separación de la nav | `var(--sp-2)` bajo el borde inferior |
| Item | fila de `56px`, `var(--radius-control)`, `padding: var(--sp-3)`, gap `var(--sp-3)` |
| Icono del item | cuadro `36×36`, `var(--radius-input)`, fondo `--surface-sunken`, icono `18px` `--text-secondary` |
| Título del item | `--fs-body`, `500`, `--text-primary` |
| Descripción | `--fs-sm`, `--text-secondary`, una línea |
| Hover del item | fondo `--surface-sunken`; el icono pasa a fondo `--accent-tint` con glifo `--accent` |

Contenido de `Funciones`, derivado de la grilla "Un blog, infinitas posibilidades" de la misma pantalla:
`Editor con IA` · `SEO Avanzado` · `Diseño sin límites` · `Comentarios y comunidad`.
Contenido de `Recursos`: `Documentación` · `Guías` · `Plantillas` · `Soporte`.

Apertura por **click, no por hover** (el hover-intent es hostil en táctil y con lectores de pantalla).
Animación de entrada: `opacity 0→1` + `translateY(-4px)→0` en `--dur-base --ease-out`; anulada bajo
`prefers-reduced-motion: reduce`.

### 3.4 Acciones

| Acción | Especificación |
|---|---|
| `Iniciar sesión` | enlace de texto: `--fs-body`, `500`, `--text-primary`, `padding-inline: var(--sp-3)`, alto `40px`; hover `--text-secondary` |
| `Comenzar gratis` | **botón primario negro**: fondo `--action`, texto `--text-on-dark`, `--fs-body` `500`, alto `40px`, `padding-inline: var(--sp-5)`, `var(--radius-control)`, `--shadow-rest`; hover `--action-hover`; pressed `--action-pressed`; foco `var(--focus-ring)` |
| Gap | `var(--sp-3)` |

Es el único botón negro de la barra. Si algún día se añade un segundo CTA, uno de los dos deja de ser
negro: **el negro no compite consigo mismo**.

## 4. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1280px` | tal cual § 2, gutter `var(--sp-16)` |
| `1024–1279px` | gap entre enlaces baja a `var(--sp-6)`; gutter `var(--sp-8)` |
| `768–1023px` | los enlaces centrales desaparecen; quedan marca + `Iniciar sesión` + `Comenzar gratis` + hamburguesa |
| `< 768px` | marca + `Comenzar gratis` + hamburguesa (`44×44`). Alto de la barra `64px`, gutter `var(--sp-6)` |

### Menú móvil

Panel a pantalla completa (`inset: 0`), fondo `--bg-page`, que entra con `opacity` + `translateY(8px)`
en `--dur-base`. Contiene: los 5 enlaces en `--fs-h2` (20px) con `--touch-target` de alto y separados
por hairline; los dropdowns se convierten en acordeones (`chevron-down` que rota); al pie,
`Iniciar sesión` a ancho completo (secundario) y `Comenzar gratis` a ancho completo (negro).
Mientras está abierto, `body { overflow: hidden }`.

## 5. Accesibilidad de teclado y foco

- `<header role="banner">` + `<nav aria-label="Navegación principal">`.
- **Enlace de salto** como primer elemento focalizable del documento:
  `<a href="#contenido" class="sr-only focus:not-sr-only">Saltar al contenido</a>`, que al recibir foco
  se muestra con fondo `--surface`, borde `--border-hairline` y `var(--focus-ring)`.
- Dropdowns: disparador `<button aria-expanded aria-controls aria-haspopup="true">`.
  `Enter` / `Espacio` / `↓` abren y ponen el foco en el primer item; `↑`/`↓` recorren;
  `Esc` cierra y devuelve el foco al disparador; `Tab` desde el último item cierra y sigue al siguiente
  enlace de la nav. El foco **no** queda atrapado en escritorio (es un menú, no un diálogo).
- Menú móvil: sí atrapa el foco, con `role="dialog"` y `aria-modal="true"`; `Esc` lo cierra.
- Hover y apertura no se activan solo con el ratón: todo estado del dropdown es alcanzable por teclado.
- Objetivos táctiles: `--touch-target` (44px) por debajo de `768px`.
- Contraste: `--text-primary` sobre `--bg-page`, y `--text-on-dark` sobre `--action` (≥ 15:1).
- La nav sticky no puede tapar el destino de un ancla: los `id` de sección llevan
  `scroll-margin-top: calc(var(--nav-h-landing) + var(--sp-4))`.

## 6. Marcado de referencia

```tsx
<header
  role="banner"
  data-scrolled={scrolled || undefined}
  className="sticky top-0 z-40 h-16 transition-colors duration-[var(--dur-base)]
             ease-[var(--ease-out)] lg:h-[var(--nav-h-landing)]
             data-[scrolled]:border-b data-[scrolled]:border-[var(--border-hairline)]
             data-[scrolled]:bg-[color-mix(in_srgb,var(--bg-page)_85%,transparent)]
             data-[scrolled]:backdrop-blur-md"
>
  <nav
    aria-label="Navegación principal"
    className="mx-auto grid h-full max-w-[var(--content-max)] grid-cols-[1fr_auto_1fr]
               items-center px-[var(--sp-6)] lg:px-[var(--sp-8)] xl:px-[var(--sp-16)]"
  >
    <Link href="/" className="flex items-center gap-[var(--sp-3)] justify-self-start">
      <BookOpenIcon className="size-[22px] text-[var(--text-primary)]" aria-hidden />
      <span className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
        cuaderno
      </span>
    </Link>

    <ul className="hidden items-center gap-[var(--sp-6)] justify-self-center xl:gap-[var(--sp-8)] lg:flex">
      <li><NavDropdown label="Funciones" items={funciones} /></li>
      <li><NavLink href="/precios">Precios</NavLink></li>
      <li><NavLink href="/plantillas">Plantillas</NavLink></li>
      <li><NavDropdown label="Recursos" items={recursos} /></li>
      <li><NavLink href="/blog">Blog</NavLink></li>
    </ul>

    <div className="flex items-center gap-[var(--sp-3)] justify-self-end">
      <Link
        href="/iniciar-sesion"
        className="hidden h-10 items-center rounded-[var(--radius-control)] px-[var(--sp-3)]
                   text-[14px] font-medium text-[var(--text-primary)]
                   hover:text-[var(--text-secondary)]
                   focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none md:inline-flex"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/registro"
        className="inline-flex h-10 items-center rounded-[var(--radius-control)]
                   bg-[var(--action)] px-[var(--sp-5)] text-[14px] font-medium
                   text-[var(--text-on-dark)] shadow-[var(--shadow-rest)]
                   transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                   hover:bg-[var(--action-hover)] active:bg-[var(--action-pressed)]
                   focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
      >
        Comenzar gratis
      </Link>
      <MobileMenuTrigger className="lg:hidden" />
    </div>
  </nav>
</header>
```

## 7. Modo oscuro

La landing hereda los tres bloques de tema del contrato de tokens. Dos cuidados propios:

1. El fondo translúcido tras el scroll se calcula con `color-mix` sobre `--bg-page`, nunca sobre un
   blanco fijo: en oscuro un blanco al 85% arruina el hero.
2. El botón `Comenzar gratis` usa `--action`, que en oscuro **no debe volverse blanco por inversión
   automática**: sigue siendo la acción y mantiene su relación con `--text-on-dark` definida en el
   contrato.

## 8. Deuda contra el código actual

`components/site/navbar.tsx`:

1. Enlaces distintos a los de la pantalla (`Explorar`, `Autores`, `Cómo funciona` en vez de
   `Funciones`, `Precios`, `Plantillas`, `Recursos`, `Blog`).
2. Sin dropdowns.
3. Marca con icono `PenLine` sobre cuadro primario y wordmark en serif capitalizado; la pantalla pide
   isotipo de libro abierto, sin cuadro, y wordmark **en minúsculas** sans.
4. Alto `h-16` y `max-w-6xl` (1152px) frente a `--nav-h-landing` (80px) y `--content-max` (1440px).
5. Fondo con `backdrop-blur` y borde **desde el inicio**; la pantalla los pide solo tras el scroll.
6. CTA `Empezar a escribir` en vez de `Comenzar gratis`, y `OrganizationSwitcher` de Clerk en la barra
   pública, que no aparece en ninguna pantalla.
