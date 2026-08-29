# Topbar del panel

> **Fuente:** `02-panel-resumen.png`, `03-panel-entradas.png`, `06`, `07`, `08`, `09` (variante estándar) y
> `04-panel-editor-de-entrada.png` (variante editor).
> Medidas verificadas sobre `03-panel-entradas.png`.
> **Las pantallas mandan:** `components/admin/admin-topbar.tsx` hoy solo pinta un trigger y un título;
> hay que construirlo entero.

━━━

## 1. Propósito

Barra superior fija del panel. Contiene **utilidades globales**, no navegación de sección y **no el
título de la página**: el H1 vive en el `page-header`, dentro del contenido. Ese es el error del
componente actual y la corrección más importante de este documento.

En las 6 pantallas de panel el topbar es idéntico: buscador ⌘K a la derecha, toggle de tema,
notificaciones con punto y menú de usuario. Solo el editor lo cambia (§ 6).

## 2. Anatomía — variante estándar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          ┌ 🔍 Buscar…        ⌘K ┐   ☀   🔔•   ◯ María Torres ⌄ │
└──────────────────────────────────────────────────────────────────────────────┘
   ↑ zona izquierda vacía          ↑ buscador        ↑ acciones     ↑ usuario
```

La zona izquierda está **deliberadamente vacía** en escritorio: el contenido respira y el ojo cae
directo sobre el H1 del `page-header`. En `< 1024px` esa zona la ocupa el botón hamburguesa.

| Slot | Contenido | Alineación |
|---|---|---|
| Izquierda | hamburguesa (solo `< 1024px`) | `justify-start` |
| Centro-derecha | buscador ⌘K | `margin-left: auto` |
| Acciones | toggle de tema · notificaciones | gap `var(--sp-2)` |
| Usuario | avatar + nombre + chevron | último |

## 3. Contenedor y tokens

| Propiedad | Token / valor |
|---|---|
| Alto | `--topbar-h` (64px) |
| Fondo | `--bg-page` — **el topbar es papel, no superficie blanca** |
| Borde inferior | `1px solid var(--border-hairline)` |
| Sombra | ninguna |
| Posición | `position: sticky; top: 0; z-index: 30` |
| Padding inline | `var(--sp-6)` (`var(--sp-4)` en `< 768px`) |
| Gap entre bloques | `var(--sp-5)` |
| Ancho | ocupa el ancho del área de contenido; el sidebar queda a su izquierda, no debajo |

Al hacer scroll el topbar **no gana sombra ni blur**: el hairline ya es el separador. Esa es la
disciplina del sistema — borde y aire, no profundidad.

## 4. Piezas

### 4.1 Buscador ⌘K

| Propiedad | Token / valor |
|---|---|
| Ancho | `280px` en `≥ 1280px`, `220px` en `1024–1279px` |
| Alto | `40px` |
| Fondo | `--surface` |
| Borde | `1px solid var(--border-hairline)` |
| Radio | `var(--radius-control)` |
| Padding inline | `var(--sp-3)` |
| Icono `search` | `16px`, `--text-tertiary`, gap `var(--sp-2)` |
| Placeholder | `Buscar…` · `--fs-body`, `--text-tertiary` |
| Chip ⌘K | `--fs-label`, `--text-tertiary`, fondo `--surface-sunken`, `var(--radius-input)`, `padding: 2px var(--sp-2)`, `font-variant-numeric: tabular-nums` |
| Hover | borde `--border-strong` |
| Foco | `box-shadow: var(--focus-ring)`, borde `--accent-border` |

Es un **botón que abre un command palette**, no un input de texto: se marca como
`<button aria-haspopup="dialog">` con apariencia de campo. Buscar es acción del usuario, pero el
control es neutro — aquí no entra ni índigo ni negro salvo en el foco.

El chip muestra `⌘K` en macOS y `Ctrl K` en el resto; se detecta en cliente tras montar para no
provocar mismatch de hidratación.

### 4.2 Toggle de tema

Botón icónico fantasma, `40×40`, `var(--radius-control)`, icono `sun` / `moon` de `20px` en
`--text-secondary`. Hover: fondo `--surface-sunken`, icono `--text-primary`. Comparte estado con el
toggle del sidebar (§ `sidebar.md` 2.6) — **son dos superficies del mismo control**, nunca dos estados
distintos. En `< 768px` el toggle del topbar es el único disponible.

### 4.3 Notificaciones

Botón icónico fantasma, `40×40`, icono `bell` de `20px` en `--text-secondary`.
El punto de no-leídas es un círculo de `8px` en `--accent`, posicionado arriba a la derecha del icono
(`top: 8px; right: 9px`), con un anillo de `2px` del color del topbar (`--bg-page`) para separarlo del
trazo de la campana. Es índigo porque señala algo que el producto trajo, no rendimiento ni error.

- Sin no-leídas: sin punto.
- Con no-leídas: punto sólido, sin número (las pantallas no muestran contador).
- Etiqueta accesible dinámica: `aria-label="Notificaciones, 3 sin leer"`; los cambios se anuncian por
  una región `aria-live="polite"` fuera del botón.

Abre un popover de `360px` anclado a la derecha, `--surface`, `var(--radius-card)`,
`1px --border-hairline`, `--shadow-float`.

### 4.4 Menú de usuario

| Parte | Especificación |
|---|---|
| Trigger | fila `40px`, gap `var(--sp-3)`, `padding: var(--sp-1) var(--sp-2)`, `var(--radius-control)` |
| Avatar | `36×36`, `var(--radius-pill)`, borde `1px --border-hairline`; fallback con iniciales sobre `--surface-sunken` en `--text-secondary` |
| Nombre | `--fs-body`, `500`, `--text-primary`; se oculta en `< 1024px` (queda solo el avatar) |
| Chevron | `chevron-down` `16px`, `--text-tertiary` |
| Hover | fondo `--surface-sunken` |
| Menú | ancho `240px`, `--surface`, `var(--radius-card)`, `1px --border-hairline`, `--shadow-float`, items de `36px` |

Contenido del menú: cabecera con nombre y correo (`--fs-sm` / `--text-secondary`), luego
`Perfil` · `Ajustes` · `Ver mi blog ↗`, divisor hairline, y `Cerrar sesión` en `--danger`.

## 5. Estados

| Estado | Aplicación |
|---|---|
| Hover en icónicos | fondo `--surface-sunken`, `--dur-fast --ease-out` |
| Pressed | fondo `--neutral-tint` |
| Foco visible | `box-shadow: var(--focus-ring)` sobre el radio del control |
| Menú abierto | el trigger conserva fondo `--surface-sunken` mientras `aria-expanded="true"` |
| Cargando (usuario) | esqueleto de `36×36` circular + barra de `96×12` en `--surface-sunken`, sin animación de pulso agresiva |

## 6. Variante editor

`04-panel-editor-de-entrada.png` sustituye el buscador por el flujo de guardado y publicación:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ ← Volver a entradas        ✓ Guardado  [ 👁 Vista previa ]  [ Publicar ⌄ ]  ☀ 🔔• ◯⌄ │
└───────────────────────────────────────────────────────────────────────────────────┘
```

| Pieza | Especificación |
|---|---|
| Volver | `arrow-left` `16px` + `Volver a entradas`, `--fs-body`, `--text-secondary`; hover `--text-primary`. **No es un breadcrumb** (ver `breadcrumb.md` § 1) |
| Estado de guardado | `check-circle` `16px` + `Guardado` · `--fs-sm`, `--text-tertiary`. Ciclo: `Guardando…` (spinner 14px) → `Guardado` → `Sin guardar` en `--warn` si falla. Región `aria-live="polite"` |
| Vista previa | botón secundario: `--surface`, borde `1px --border-hairline`, texto `--text-primary`, alto `40px`, `var(--radius-control)`, icono `eye` `16px` |
| Publicar | **botón partido negro**: cuerpo `--action` / texto `--text-on-dark`, más disparador de `32px` con `chevron-down` separado por un hairline `rgba(255,255,255,.18)`; hover `--action-hover`, pressed `--action-pressed`; radio `var(--radius-control)` |
| Utilidades | tema, notificaciones y usuario idénticos a la variante estándar |

El menú del botón partido ofrece `Guardar borrador`, `Programar…` y `Publicar ahora`. Cuando la entrada
ya está publicada, la etiqueta del cuerpo pasa a `Actualizar`.

## 7. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1280px` | layout completo, buscador `280px`, nombre de usuario visible |
| `1024–1279px` | buscador `220px`, nombre de usuario oculto |
| `768–1023px` | aparece la hamburguesa a la izquierda; el buscador colapsa a **botón icónico** `search` de `40×40` que abre el mismo command palette |
| `< 768px` | hamburguesa + buscador icónico + notificaciones + avatar. **El toggle de tema se mueve al menú de usuario** como un item con switch. Padding inline `var(--sp-4)` |

El topbar nunca hace wrap a dos líneas: por debajo de `768px` las piezas se reducen a icono antes que
apilarse.

## 8. Accesibilidad de teclado y foco

- Raíz `<header role="banner">`, con `<nav aria-label="Utilidades">` envolviendo las acciones.
- Orden de tabulación: hamburguesa (si existe) → buscador → tema → notificaciones → usuario.
- **Atajo global** `⌘K` / `Ctrl+K` abre el command palette desde cualquier parte del panel. Se ignora
  cuando el foco está en un `input`, `textarea` o en el lienzo de TipTap, salvo que se combine con
  `Shift`. `Esc` lo cierra y devuelve el foco al buscador.
- Popovers y menús: `Esc` cierra y restituye el foco al trigger; `↑`/`↓` recorren items;
  `Home`/`End` van a los extremos; el foco queda contenido mientras están abiertos.
- Todos los botones icónicos llevan `aria-label` en español (`Cambiar tema`, `Notificaciones`,
  `Abrir menú de usuario`, `Abrir navegación`) y `title` para el tooltip.
- Un `<a href="#contenido-principal" class="sr-only focus:not-sr-only">Saltar al contenido</a>` es el
  primer elemento focalizable del documento (ver `panel-shell.md` § 6).
- Objetivo táctil mínimo `--touch-target` (44px) en `< 768px`: los botones de `40px` crecen a `44px`.

## 9. Marcado de referencia

```tsx
<header
  role="banner"
  className="sticky top-0 z-30 flex h-[var(--topbar-h)] items-center gap-[var(--sp-5)]
             border-b border-[var(--border-hairline)] bg-[var(--bg-page)]
             px-[var(--sp-4)] md:px-[var(--sp-6)]"
>
  <button
    type="button"
    aria-label="Abrir navegación"
    aria-expanded={sidebarOpen}
    className="grid size-11 place-items-center rounded-[var(--radius-control)]
               text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]
               focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none lg:hidden"
  >
    <MenuIcon className="size-5" aria-hidden />
  </button>

  <button
    type="button"
    aria-haspopup="dialog"
    aria-label="Buscar en el panel"
    onClick={openCommandPalette}
    className="ml-auto hidden h-10 w-[220px] items-center gap-[var(--sp-2)]
               rounded-[var(--radius-control)] border border-[var(--border-hairline)]
               bg-[var(--surface)] px-[var(--sp-3)] text-left
               hover:border-[var(--border-strong)]
               focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none
               md:flex xl:w-[280px]"
  >
    <SearchIcon className="size-4 text-[var(--text-tertiary)]" aria-hidden />
    <span className="flex-1 text-[14px] text-[var(--text-tertiary)]">Buscar…</span>
    <kbd className="rounded-[var(--radius-input)] bg-[var(--surface-sunken)] px-[var(--sp-2)]
                    py-0.5 text-[12px] tabular-nums text-[var(--text-tertiary)]">
      ⌘K
    </kbd>
  </button>

  <nav aria-label="Utilidades" className="flex items-center gap-[var(--sp-2)] md:ml-0 ml-auto">
    <ThemeToggleButton />
    <button
      type="button"
      aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`}
      className="relative grid size-11 place-items-center rounded-[var(--radius-control)]
                 text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]
                 focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none md:size-10"
    >
      <BellIcon className="size-5" aria-hidden />
      {unread > 0 && (
        <span
          aria-hidden
          className="absolute right-[9px] top-2 size-2 rounded-full bg-[var(--accent)]
                     ring-2 ring-[var(--bg-page)]"
        />
      )}
    </button>
    <UserMenu />
  </nav>
</header>
```

## 10. Modo oscuro

El topbar toma `--bg-page`, así que sigue al lienzo automáticamente. Dos cuidados:

1. El anillo del punto de notificaciones usa `--bg-page`, no un blanco fijo: si se codifica `#FFFFFF`
   el punto queda con un halo claro en oscuro.
2. El buscador es `--surface` sobre `--bg-page`; en oscuro ambos se acercan, así que el borde
   `--border-hairline` es obligatorio para que el campo no se disuelva.

## 11. Deuda contra el código actual

`components/admin/admin-topbar.tsx`:

1. Alto `h-14` (56px) en vez de `--topbar-h` (64px).
2. Renderiza `<h1>{title}</h1>`: el título debe salir del topbar y pasar al `page-header`
   (ver `layout/page-header.md`).
3. Faltan buscador ⌘K, toggle de tema, notificaciones y menú de usuario — es decir, todo.
4. `SidebarTrigger` + `Separator` vertical no aparecen en ninguna pantalla: la hamburguesa solo existe
   por debajo de `1024px` y sin separador.
5. No hay `ThemeProvider` montado (`next-themes` está en `package.json` pero solo lo consume
   `components/ui/sonner.tsx`): el toggle no puede funcionar hasta montarlo en `app/layout.tsx` con
   `attribute="data-theme"` para casar con el contrato de tokens.
