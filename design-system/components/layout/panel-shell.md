# Panel shell — composición de sidebar + topbar + contenido

> **Fuente:** las 6 pantallas de panel (`02`, `03`, `04`, `06`, `07`, `08`, `09`) comparten exactamente
> este chasis. Medidas verificadas sobre `03-panel-entradas.png` (render de 1536 px).
> **Las pantallas mandan.**

━━━

## 1. Propósito

El chasis de toda ruta bajo `/panel`. Define tres cosas que ningún otro documento debe volver a decidir:
**la escala de breakpoints**, **el gutter del contenido** y **la escala de `z-index`**. Todos los demás
componentes de navegación y layout se apoyan en lo que se fija aquí.

Regla estructural: **el topbar no cruza por encima del sidebar.** El sidebar ocupa la altura completa
del viewport y el topbar empieza donde termina el sidebar. Así se ve en las 6 pantallas y así queda el
logo alineado con el buscador.

## 2. Anatomía

```
┌──────────┬───────────────────────────────────────────────────────────┐
│          │  topbar · --topbar-h · sticky · --bg-page · borde inferior │
│ sidebar  ├───────────────────────────────────────────────────────────┤
│ 260px    │                                                           │
│ sticky   │   <main id="contenido-principal">                         │
│ h-100dvh │     page-header                                           │
│ --bg-    │     [tabs]                                                │
│ sidebar  │     contenido (content-grid / split-view)                 │
│          │     [paginación]                                          │
│          │   </main>                                                 │
└──────────┴───────────────────────────────────────────────────────────┘
   ↑ borde derecho 1px --border-hairline    ↑ lienzo --bg-page
```

| Región | Elemento | Especificación |
|---|---|---|
| Raíz | `<div>` | `display: flex; min-height: 100dvh; background: var(--bg-page)` |
| Sidebar | `<nav>` | `--sidebar-w`, sticky, `100dvh` — ver `navigation/sidebar.md` |
| Columna derecha | `<div>` | `flex: 1; min-width: 0` — **`min-width: 0` es obligatorio** o cualquier tabla ancha revienta el layout |
| Topbar | `<header>` | `--topbar-h`, sticky — ver `navigation/topbar.md` |
| Contenido | `<main>` | § 3 |

## 3. Gutter y ancho del contenido

| Rango | Padding de `<main>` |
|---|---|
| `≥ 1280px` | `var(--sp-10)` (40px) en los cuatro lados |
| `768–1279px` | `var(--sp-6)` (24px) |
| `< 768px` | `var(--sp-4)` (16px) inline, `var(--sp-6)` block |

`<main>` centra su contenido a `--content-max` (1440px) con `margin-inline: auto`. Por encima de
`1440 + 2 × gutter + --sidebar-w` el exceso se reparte a los lados: el contenido **no se estira sin
límite**, o las tablas quedan ilegibles en monitores anchos.

Gap vertical entre bloques de `<main>`: `var(--sp-6)` (24px). Es el ritmo de las pantallas —
`page-header` → tabs → tarjetas → paginación, todo separado por 24px salvo lo que indique cada
componente.

## 4. Escala de breakpoints (canónica)

Coincide con la de Tailwind, que es la que usa el repo. **Todos los documentos del design system se
refieren a estos nombres.**

| Nombre | Ancho | Qué cambia en el chasis |
|---|---|---|
| `base` | `< 640px` | sidebar off-canvas · topbar reducido a iconos · gutter `var(--sp-4)` · todo apilado |
| `sm` | `≥ 640px` | igual que base, con más aire tipográfico |
| `md` | `≥ 768px` | sidebar en **rail** (`--sidebar-w-collapsed`) · gutter `var(--sp-6)` · grillas a 2 columnas |
| `lg` | `≥ 1024px` | sidebar expandido · desaparece la hamburguesa · split-view aún apilado |
| `xl` | `≥ 1280px` | gutter `var(--sp-10)` · **split-view lado a lado** · grillas a 4–5 columnas |
| `2xl` | `≥ 1536px` | sin cambios estructurales; solo entra en juego `--content-max` |

`1280px` es el umbral que importa: por debajo, el panel derecho de Resumen, Editor, SEO y Ajustes baja
bajo el contenido principal (ver `split-view.md`).

## 5. Escala de `z-index` (canónica)

| Capa | Valor |
|---|---|
| Contenido | `0` |
| Cabecera de tabla pegajosa | `10` |
| Sidebar | `20` |
| Topbar | `30` |
| Nav de la landing | `40` |
| Scrim y panel off-canvas | `50` |
| Popovers, menús, tooltips | `60` |
| Toasts (`sonner`) | `70` |
| Diálogos modales | `80` |

Ningún componente inventa valores fuera de esta tabla. Si algo necesita colarse entre dos capas, se
revisa la tabla, no se escribe `z-[9999]`.

## 6. Comportamiento responsive del chasis

| Rango | Sidebar | Topbar | Contenido |
|---|---|---|---|
| `≥ 1280px` | expandido 260px | completo | gutter 40px, split-view lado a lado |
| `1024–1279px` | expandido, colapsable | buscador 220px, sin nombre de usuario | gutter 24px, split-view apilado |
| `768–1023px` | rail de iconos | aparece hamburguesa, buscador icónico | gutter 24px, grillas a 2 columnas |
| `< 768px` | fuera del flujo (off-canvas) | hamburguesa + buscador icónico + campana + avatar | gutter 16px, una columna |

Off-canvas (`< 768px`):
- El panel entra desde la izquierda en `--dur-base --ease-out` con `--shadow-float`.
- Scrim `rgba(10,10,10,.40)` en la capa `50`, que cierra al pulsarlo.
- `body { overflow: hidden }` mientras está abierto.
- Se cierra al navegar; el foco vuelve a la hamburguesa.
- Bajo `prefers-reduced-motion: reduce` aparece sin desplazamiento, solo con `opacity`.

**Sin saltos de layout al hidratar.** El estado colapsado se guarda en `localStorage` y se aplica en un
script inline antes de pintar (igual que el tema); si no, el sidebar parpadea de 260px a 72px en cada
carga.

## 7. Accesibilidad de teclado y foco

- Landmarks completos y únicos: `<header role="banner">` (topbar),
  `<nav aria-label="Navegación principal">` (sidebar), `<main id="contenido-principal">`.
  Un lector de pantalla debe poder saltar entre los tres sin ambigüedad.
- **Enlace de salto** como primer elemento focalizable del documento:
  `<a href="#contenido-principal">Saltar al contenido</a>`, oculto con `sr-only` y visible al recibir
  foco (fondo `--surface`, borde `--border-hairline`, `var(--focus-ring)`, sobre la capa `60`).
- Orden de tabulación: salto → sidebar → topbar → `<main>`. Es el orden del DOM y coincide con la
  lectura visual en escritorio.
- En cada navegación de cliente el foco se traslada al `<h1>` del `page-header` (`tabIndex={-1}`) y el
  título de la ruta se anuncia por una región `aria-live="polite"`: sin eso, un cambio de página en App
  Router es silencioso para un lector de pantalla.
- `<main>` es `tabIndex={-1}` para poder recibir el foco del enlace de salto.
- El contenido de `<main>` **no** hace scroll horizontal: cualquier tabla o gráfico ancho scrollea
  dentro de su propio contenedor con `overflow-x: auto` y `tabIndex={0}` para que sea recorrible con
  teclado, más `role="region"` y `aria-label`.
- Nada del chasis captura `Tab` salvo el off-canvas y los diálogos.

## 8. Marcado de referencia

```tsx
// app/panel/layout.tsx
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-[var(--bg-page)]">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-[var(--sp-4)]
                   focus:top-[var(--sp-4)] focus:z-[60] focus:rounded-[var(--radius-control)]
                   focus:border focus:border-[var(--border-hairline)] focus:bg-[var(--surface)]
                   focus:px-[var(--sp-4)] focus:py-[var(--sp-2)] focus:text-[14px]
                   focus:shadow-[var(--focus-ring)]"
      >
        Saltar al contenido
      </a>

      <PanelSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <PanelTopbar />
        <main
          id="contenido-principal"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-[var(--content-max)] flex-1 flex-col
                     gap-[var(--sp-6)] px-[var(--sp-4)] py-[var(--sp-6)]
                     md:p-[var(--sp-6)] xl:p-[var(--sp-10)]"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
```

Cada página aporta, en este orden: `PageHeader` → (tabs) → contenido → (paginación). El chasis **no**
recibe el título: ver `page-header.md`.

## 9. Modo oscuro

El chasis solo consume `--bg-page`, `--bg-sidebar` y `--border-hairline`. El `ThemeProvider` se monta en
`app/layout.tsx` con `attribute="data-theme"` para casar con el contrato
(`:root[data-theme="dark"]` / `:root:not([data-theme="light"])`), `defaultTheme="system"` y
`disableTransitionOnChange` para que cambiar de tema no dispare las transiciones de color de todo el
panel a la vez.

`color-scheme` debe seguir al tema (claro/oscuro) para que scrollbars y controles nativos acompañen.

## 10. Deuda contra el código actual

1. `app/panel/layout.tsx` usa `SidebarProvider` + `SidebarInset` de shadcn. Sirve como base, pero la
   piel debe pasar a los tokens de este documento y el topbar debe montarse **en el layout**, no en cada
   página.
2. `components/admin/layout/panel-page-layout.tsx` mete el topbar dentro de cada página y le pasa el
   título. Hay que invertirlo: topbar en el layout, título en `PageHeader` dentro de la página.
3. No hay `ThemeProvider` montado (`next-themes` está instalado y solo lo usa
   `components/ui/sonner.tsx`): sin él, los dos toggles de tema de las pantallas no pueden existir.
4. No existe enlace de salto ni traslado de foco entre rutas.
5. No hay `--content-max`: el contenido se estira a todo lo ancho del monitor.

## 11. Tokens nuevos que exige la navegación

El contrato de tokens no cubre tres valores que las pantallas sí muestran. Se declaran junto al resto,
en los tres bloques de tema, y **no** como valores sueltos en los componentes:

| Token | Valor | Quién lo usa |
|---|---|---|
| `--sidebar-w-collapsed` | `72px` | `navigation/sidebar.md` (rail), `panel-shell.md` § 4 |
| `--nav-h-landing` | `80px` | `navigation/landing-nav.md` |
| `--aside-w` | local por pantalla: `280px` / `320px` | `layout/split-view.md` § 2 |

`--aside-w` es un token **local del contenedor** (se declara con `style` en el propio split view), no
global: cambia por pantalla y no tiene sentido en `:root`.
