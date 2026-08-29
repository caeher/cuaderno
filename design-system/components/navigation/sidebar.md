# Sidebar del panel

> **Fuente:** `02-panel-resumen.png`, `03-panel-entradas.png`, `06-panel-categorias.png`, `07-panel-seo-analyzer.png`, `08-panel-analiticas.png`, `09-panel-ajustes.png` — el sidebar aparece idéntico en las 6 pantallas de panel y en la captura embebida de `01-landing-home.png`.
> Medidas verificadas sobre `03-panel-entradas.png` (render de 1536 px de ancho).
> **Las pantallas mandan:** donde este documento y el código actual (`components/admin/admin-sidebar.tsx`) difieran, el código se adapta.

━━━

## 1. Propósito

Columna fija de navegación primaria del panel. Es el único lugar del producto donde vive la
navegación de secciones, y por eso es el sitio donde el **índigo `--accent` significa navegación**:
el item activo es el único elemento índigo permanente de la pantalla.

Contiene, de arriba abajo: marca → navegación de contenido → divisor → herramientas de IA →
(empuje al pie) selector de blog → tarjeta Cuaderno Pro → toggle de tema.

## 2. Anatomía

```
┌─ 260px (--sidebar-w) ──────────────┐
│                                    │  ← --bg-sidebar, borde derecho 1px --border-hairline
│  ▢ cuaderno                        │  96px: bloque de marca (sin divisor)
│                                    │
│  ▣ Resumen            ← activo     │  44px · pill --accent-tint + texto --accent
│  ▢ Entradas                        │  44px · pitch 48px (44 + --sp-1)
│  ▢ Páginas                         │
│  ▢ Categorías                      │  GRUPO 1 — contenido (8 items)
│  ▢ Etiquetas                       │
│  ▢ Comentarios                     │
│  ▢ Diseño                          │
│  ▢ Ajustes                         │
│  ─────────────────────             │  divisor 1px --border-hairline
│  ▢ IA Writer                       │
│  ▢ SEO Analyzer                    │  GRUPO 2 — herramientas de IA (3 items)
│  ▢ Analíticas                      │
│                                    │
│           (flex spacer)            │
│                                    │
│  ┌ 🌐 Mi blog             ⌄ ┐      │  selector de blog
│  └   miblog.cuaderno.com   ┘      │
│  ┌ ✦                        ┐      │
│  │ Cuaderno Pro             │      │  tarjeta Pro (--accent-tint)
│  │ Desbloquea funciones...  │      │
│  │ [ Ver planes → ]         │      │
│  └──────────────────────────┘      │
│  ┌ ◯── ☀ Modo claro       ⌃⌄ ┐    │  toggle de tema
│  └────────────────────────────┘    │
└────────────────────────────────────┘
```

### 2.1 Bloque de marca

| Parte | Especificación |
|---|---|
| Contenedor | alto `96px`, `padding-inline: var(--sp-4)`, sin borde inferior — **en las pantallas no hay divisor bajo el logo** |
| Isotipo | libro abierto, `20×20`, trazo 1.5px, color `--text-primary` |
| Wordmark | `cuaderno` **en minúsculas**, `--fs-h2` (20px), `font-weight: 600`, `letter-spacing: -0.01em`, color `--text-primary` |
| Gap | `var(--sp-3)` entre isotipo y wordmark |
| Enlace | apunta a `/panel`, no a `/` |

El wordmark **nunca** se pinta en índigo. El índigo del sidebar está reservado al item activo, a la
tarjeta Pro y al destello ✦.

### 2.2 Item de navegación

| Propiedad | Token / valor |
|---|---|
| Alto | `44px` (`--touch-target`) |
| Pitch vertical | `48px` → alto + `var(--sp-1)` de gap |
| Padding inline del sidebar | `var(--sp-4)` |
| Padding inline del item | `var(--sp-5)` |
| Radio | `var(--radius-control)` |
| Icono | `20×20`, trazo 1.5px (lucide) |
| Gap icono ↔ etiqueta | `var(--sp-3)` |
| Etiqueta | `--fs-body` (14/1.55) |
| Ancho del pill | `228px` = `--sidebar-w` − 2 × `--sp-4` |

Posición resultante, medida desde el borde izquierdo del sidebar: icono en `36px`, etiqueta en `68px`.

### 2.3 Grupos y divisor

**Los grupos no llevan etiqueta.** Las pantallas no muestran ningún `Contenido` / `Cuenta` sobre las
listas: el único separador semántico es el hairline. El código actual sí pinta `SidebarGroupLabel` —
hay que quitarlo.

| Parte | Especificación |
|---|---|
| Padding-top de la lista | `var(--sp-4)` (la primera pill arranca en `y = 112`) |
| Divisor | `1px` sólido `--border-hairline`, inset `var(--sp-4)` a cada lado (alineado con los pills) |
| Margen del divisor | `margin-block: var(--sp-4)` |

**Grupo 1 — contenido** (8 items, orden exacto de las pantallas):

| Etiqueta | Icono lucide | Ruta |
|---|---|---|
| Resumen | `home` | `/panel` |
| Entradas | `file-text` | `/panel/entradas` |
| Páginas | `file` | `/panel/paginas` |
| Categorías | `folder-tree` | `/panel/categorias` |
| Etiquetas | `tag` | `/panel/etiquetas` |
| Comentarios | `message-square` | `/panel/comentarios` |
| Diseño | `brush` | `/panel/diseno` |
| Ajustes | `settings` | `/panel/ajustes` |

**Grupo 2 — herramientas de IA** (3 items):

| Etiqueta | Icono lucide | Ruta |
|---|---|---|
| IA Writer | `sparkles` | `/panel/ia-writer` |
| SEO Analyzer | `search-check` | `/panel/seo` |
| Analíticas | `bar-chart-3` | `/panel/analiticas` |

`Nuevo post` **no es un item de sidebar**. La creación vive en el CTA negro del `page-header`.

### 2.4 Selector de blog

Reemplaza al `OrganizationSwitcher` de Clerk, que hoy pinta un control que no existe en ninguna pantalla.

| Parte | Especificación |
|---|---|
| Contenedor | `--surface`, borde `1px --border-hairline`, `var(--radius-control)`, `padding: var(--sp-3)`, alto `56px` |
| Avatar del blog | cuadro `32×32`, `var(--radius-input)`, fondo `--surface-sunken`, icono `globe` `16px` en `--text-secondary` |
| Título | `Mi blog` · `--fs-body`, `600`, `--text-primary`, truncado a una línea |
| Dominio | `miblog.cuaderno.com` · `--fs-label` (12px), `--text-secondary`, truncado |
| Indicador | `chevron-down` `16px`, `--text-tertiary`, a la derecha |
| Hover | fondo `--surface-sunken`, borde `--border-strong` |
| Interacción | abre un menú (popover) con los blogs del usuario + `Crear blog nuevo` al pie |

### 2.5 Tarjeta Cuaderno Pro

Único bloque promocional del panel. Es índigo porque anuncia capacidad de IA, no porque sea un CTA:
**su botón nunca es negro**.

| Parte | Especificación |
|---|---|
| Contenedor | fondo `--accent-tint`, `var(--radius-card)`, `padding: var(--sp-4)`, **sin sombra**, borde `1px --accent-border` |
| Destello | `sparkle` `20×20` en `--accent`, margen inferior `var(--sp-3)` |
| Título | `Cuaderno Pro` · `--fs-h3` (16px), `600`, `--text-primary` |
| Cuerpo | `--fs-sm` (13/1.5), `--text-secondary`, 2–3 líneas |
| Botón | `Ver planes →` · fondo `--surface`, texto `--accent`, `--fs-sm` `500`, `var(--radius-control)`, alto `36px`, `--shadow-rest`, flecha `arrow-right` `14px` |
| Hover del botón | fondo `--surface`, texto `--accent-hover`, la flecha se desplaza `2px` a la derecha en `--dur-fast` |

Se oculta por completo cuando el plan activo ya es Pro (en `09-panel-ajustes.png` el panel derecho
muestra `Tu plan · Pro`; la tarjeta del sidebar sigue visible en ese render, pero la regla de producto
es ocultarla para cuentas Pro y dejar el hueco al toggle de tema).

### 2.6 Toggle de tema

Fila al pie del sidebar. Combina un switch (claro ↔ oscuro) y un selector de tres opciones.

| Parte | Especificación |
|---|---|
| Contenedor | `--surface`, borde `1px --border-hairline`, `var(--radius-control)`, alto `48px`, `padding-inline: var(--sp-3)` |
| Switch | pista `36×20` `var(--radius-pill)`, apagada `--neutral-tint` con borde `--border-strong`; encendida `--action`; pulgar `16×16` blanco, `var(--radius-pill)`, transición `--dur-fast --ease-out` |
| Icono | `sun` (claro) / `moon` (oscuro) / `monitor` (sistema), `16px`, `--text-secondary` |
| Etiqueta | `Modo claro` / `Modo oscuro` / `Modo del sistema` · `--fs-sm`, `500`, `--text-primary` |
| Indicador | `chevrons-up-down` `14px`, `--text-tertiary` — abre el menú de 3 opciones |

El switch **no es índigo ni verde**: alternar tema es acción del usuario → `--action`.

## 3. Contenedor y tokens

| Propiedad | Token |
|---|---|
| Ancho expandido | `--sidebar-w` (260px) |
| Ancho colapsado | `--sidebar-w-collapsed` **(token nuevo: 72px)** |
| Fondo | `--bg-sidebar` |
| Borde derecho | `1px solid var(--border-hairline)` |
| Sombra | ninguna — el sidebar se separa del lienzo solo por el hairline |
| Posición | `position: sticky; top: 0; height: 100dvh` |
| Padding inline | `var(--sp-4)` |
| Padding-bottom del pie | `var(--sp-4)`, gap entre bloques del pie `var(--sp-4)` |
| Scroll | la zona de items hace `overflow-y: auto`; marca y pie quedan fijos |

## 4. Estados del item

| Estado | Fondo | Texto e icono | Notas |
|---|---|---|---|
| Reposo | transparente | `--text-secondary` | |
| Hover | `--surface-sunken` | `--text-primary` | transición `--dur-fast --ease-out` |
| Activo | `--accent-tint` | `--accent` | peso `500`; **el icono también en `--accent`** |
| Activo + hover | `--accent-tint` | `--accent-hover` | el fondo no cambia |
| Foco visible | el del estado actual | — | `box-shadow: var(--focus-ring)`, sin desplazar el layout |
| Deshabilitado | transparente | `--text-tertiary` | `cursor: not-allowed`, `aria-disabled="true"` |

Un item padre con hijos activos (p. ej. `Ajustes` mientras se ve `/panel/ajustes/usuarios`) usa el
estado activo completo: **no existe un tercer estado "semi-activo"**.

## 5. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1280px` (xl) | expandido, `--sidebar-w`, siempre visible |
| `1024–1279px` (lg) | expandido por defecto; el usuario puede colapsar a rail |
| `768–1023px` (md) | **rail**: `--sidebar-w-collapsed`, solo iconos centrados, etiqueta en tooltip a la derecha (`--dur-base`, retardo 400ms). Selector de blog → solo el avatar 32px. Tarjeta Pro → botón icónico ✦ de `40×40` en `--accent-tint`. Toggle de tema → botón icónico |
| `< 768px` (sm) | **off-canvas**: el sidebar sale del flujo y se abre como panel deslizante desde la izquierda, ancho `--sidebar-w`, con scrim `rgba(10,10,10,.40)` y `--shadow-float`. Lo dispara el botón hamburguesa del topbar. Se cierra con `Esc`, con click en el scrim y al navegar |

Reglas del rail:
- El pill activo se convierte en un cuadro `44×44` centrado, mismo `--accent-tint` / `--accent`.
- El divisor se mantiene, inset `var(--sp-3)`.
- El wordmark desaparece; queda solo el isotipo centrado.
- La transición de ancho es `--dur-base --ease-out`; se anula bajo `prefers-reduced-motion`.

## 6. Accesibilidad de teclado y foco

- Raíz `<nav aria-label="Navegación principal">`; cada grupo es una `<ul>`. El divisor es decorativo
  (`aria-hidden`), la separación semántica la da `aria-label` en cada `<ul>`
  (`"Contenido"`, `"Herramientas de IA"`) aunque no se dibuje texto.
- El item activo lleva `aria-current="page"`. No se marca con `aria-selected`.
- Orden de tabulación: marca → items en orden visual → selector de blog → botón de la tarjeta Pro →
  toggle de tema. **Un solo `Tab` por item**: no hay controles anidados focalizables.
- `↑` / `↓` mueven el foco dentro de la lista con roving tabindex; `Home` / `End` van al primero y al
  último; la navegación se ejecuta con `Enter`.
- Anillo de foco: `box-shadow: var(--focus-ring)` sobre el radio del propio item. Nunca `outline: none`
  sin sustituto.
- En modo off-canvas el foco queda atrapado dentro del panel (focus trap), y al cerrarlo vuelve al
  botón hamburguesa que lo abrió.
- El colapso a rail se anuncia con `aria-expanded` en el trigger del topbar y se persiste en
  `localStorage`; el estado del servidor no debe provocar salto de layout al hidratar.
- Contraste verificado: `--accent` sobre `--accent-tint` ≥ 4.5:1; `--text-secondary` sobre
  `--bg-sidebar` ≥ 4.5:1.

## 7. Marcado de referencia

```tsx
<nav
  aria-label="Navegación principal"
  data-state={collapsed ? "collapsed" : "expanded"}
  className="group/sidebar sticky top-0 flex h-dvh w-[var(--sidebar-w)] shrink-0 flex-col
             border-r border-[var(--border-hairline)] bg-[var(--bg-sidebar)] px-[var(--sp-4)]
             transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)]
             data-[state=collapsed]:w-[var(--sidebar-w-collapsed)]"
>
  {/* marca */}
  <Link href="/panel" className="flex h-24 items-center gap-[var(--sp-3)]">
    <BookOpenIcon className="size-5 text-[var(--text-primary)]" aria-hidden />
    <span className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]
                     group-data-[state=collapsed]/sidebar:sr-only">
      cuaderno
    </span>
  </Link>

  {/* grupo 1 — contenido */}
  <ul aria-label="Contenido" className="flex flex-col gap-[var(--sp-1)] pt-[var(--sp-4)]">
    {contenido.map((item) => (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className="flex h-11 items-center gap-[var(--sp-3)] rounded-[var(--radius-control)]
                     px-[var(--sp-5)] text-[14px] text-[var(--text-secondary)]
                     transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                     hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]
                     focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none
                     aria-[current=page]:bg-[var(--accent-tint)]
                     aria-[current=page]:font-medium aria-[current=page]:text-[var(--accent)]"
        >
          <item.icon className="size-5 shrink-0" aria-hidden />
          <span className="truncate group-data-[state=collapsed]/sidebar:sr-only">{item.title}</span>
        </Link>
      </li>
    ))}
  </ul>

  <hr aria-hidden className="my-[var(--sp-4)] border-t border-[var(--border-hairline)]" />

  {/* grupo 2 — herramientas de IA */}
  <ul aria-label="Herramientas de IA" className="flex flex-col gap-[var(--sp-1)]">
    {/* …mismo item… */}
  </ul>

  <div className="mt-auto flex flex-col gap-[var(--sp-4)] pb-[var(--sp-4)]">
    <BlogSwitcher />
    <ProCard />
    <ThemeToggle />
  </div>
</nav>
```

## 8. Modo oscuro

No se redefine nada aquí: el sidebar consume `--bg-sidebar`, `--border-hairline`, `--accent-tint` y
`--accent`, y los tres bloques del contrato de tokens (`:root`,
`@media (prefers-color-scheme: dark)` con `:root:not([data-theme="light"])`, y `:root[data-theme="dark"]`)
ya cambian esos valores. Dos comprobaciones obligatorias en oscuro:

1. El pill activo debe seguir leyéndose como índigo, no como gris azulado: `--accent-tint` oscuro debe
   mantener ≥ 3:1 contra `--bg-sidebar` y el texto `--accent` ≥ 4.5:1 contra el pill.
2. El hairline derecho no puede desaparecer: es el único elemento que separa sidebar de lienzo.

## 9. Deuda contra el código actual

`components/admin/admin-sidebar.tsx` diverge de las pantallas en:

1. Pinta `SidebarGroupLabel` (`Contenido`, `Cuenta`) — las pantallas no tienen etiquetas de grupo.
2. Falta el grupo entero de herramientas de IA (IA Writer, SEO Analyzer, Analíticas).
3. Falta la tarjeta Cuaderno Pro.
4. Falta el toggle de tema (y no hay `ThemeProvider` montado pese a que `next-themes` es dependencia).
5. Usa `OrganizationSwitcher` de Clerk donde las pantallas piden el selector de blog propio.
6. Tiene `Nuevo post` como item de navegación; en las pantallas eso es el CTA del `page-header`.
7. Falta `Páginas`; `Etiquetas` está fusionado con `Categorías`; el pie usa `UserButton` cuando el
   menú de usuario pertenece al topbar.
8. Rutas a renombrar: `posts → entradas`, `taxonomias → categorias` + `etiquetas`,
   `configuracion → ajustes`, `disenador → diseno`.
