# Dropdown Menu — menú desplegable

> La superficie que se despega del papel por una acción del usuario. Aparece detrás del `⋮` de cada
> fila (`03`, `05`, `06`), del avatar del topbar (`02`, `09`), del chevron de «Nueva entrada» (`02`)
> y de «Publicar» (`04`), y del selector de blog del sidebar.
> Un menú **ejecuta acciones**. Si lo que hay dentro son opciones de un valor de formulario, es un
> `select` (ver `forms/select.md`); si es texto o un formulario, es un `popover`.

Ruta destino: `components/ui/dropdown-menu.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/dropdown-menu.tsx` ya envuelve `Menu` de `@base-ui/react/menu` con las 15 piezas
(`Root`, `Trigger`, `Content`, `Group`, `Label`, `Item`, `Sub*`, `CheckboxItem`, `RadioGroup`,
`RadioItem`, `Separator`, `Shortcut`). **Se conserva todo el archivo y toda la API.** Cambios:

1. `DropdownMenuContent`: `ring-1 ring-foreground/10` → `border border-[var(--border-hairline)]`;
   `shadow-md` → `--shadow-float`; `rounded-lg` → `--radius-control`; `bg-popover` → `--surface`.
2. `DropdownMenuItem`: `focus:bg-accent` → `--surface-sunken`. **Es el punto donde la colisión de
   `--accent` muerde**: sin remapear `--color-accent` en `globals.css`, cada item resaltado se
   pintaría de índigo sólido. Ver `core/button.md` §0.
3. `DropdownMenuCheckboxItem` / `RadioItem`: el indicador pasa a `--accent` (§2.3).
4. `DropdownMenuLabel`: `text-xs` → `--fs-label` con `uppercase` y `letter-spacing: .06em`.
5. Alto mínimo de item: de `py-1` a 36px (§1).

━━━

## 1. Anatomía

```
  ┌───────────────────────────────────┐
  │  ACCIONES                         │  ← 1 · GroupLabel (opcional)
  ├───────────────────────────────────┤
  │  ✎  Editar                  ⌘E    │  ← 2 · Item: icono · etiqueta · atajo
  │  ⧉  Duplicar                      │
  │  ↗  Ver en el sitio               │
  ├───────────────────────────────────┤  ← 3 · Separator
  │  🗑  Mover a la papelera           │  ← 4 · Item destructivo
  └───────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **GroupLabel** | `--fs-label` (12px), **mayúsculas**, `letter-spacing: .06em`, peso 600, `--text-tertiary`. Padding `var(--sp-2) var(--sp-3) var(--sp-1)`. Solo cuando hay dos o más grupos: un menú de cinco items no necesita título. |
| 2 | **Item** | Alto **36px**, padding `0 var(--sp-3)`, gap `var(--sp-2)`, `--fs-body`, `--text-primary`, `border-radius: var(--radius-input)`. Icono lucide 16px, `--text-secondary`. |
| 3 | **Separator** | 1px `--border-hairline`, margen `var(--sp-1)` vertical y `calc(var(--sp-1) * -1)` horizontal para que llegue de borde a borde del popup. |
| 4 | **Item destructivo** | Texto e icono `--danger`. **Siempre el último del menú y siempre después de un separador.** |
| 5 | **Atajo** | Alineado a la derecha, `--fs-sm`, `--text-tertiary`, `tabular-nums`. Solo en menús de escritorio; en móvil se oculta. |

**Popup**: fondo `--surface`, borde 1px `--border-hairline`, `--radius-control`, `--shadow-float`,
padding `var(--sp-1)`, `min-width: 200px`, `max-width: 320px`, `max-height: var(--available-height)`
con scroll propio. Se ancla con `sideOffset: 6` (hoy 4).

Un menú de más de 10 items se parte en grupos con `GroupLabel`; de más de 20, no es un menú: es una
pantalla.

━━━

## 2. Variantes

### 2.1 Por origen

| Origen | Alineación | Ancho |
|---|---|---|
| `⋮` de fila (`03`, `05`, `06`) | `align="end"`, `side="bottom"` | Contenido, mín. 200px |
| Avatar del topbar (`02`, `09`) | `align="end"` | 240px fijo |
| Chevron de un CTA partido (`02`, `04`) | `align="end"`, alineado al borde derecho del botón | Igual o mayor que el botón |
| Selector de blog del sidebar | `align="start"`, `side="top"` | Ancho del disparador (`w-(--anchor-width)`) |

### 2.2 Tipos de item

| Tipo | Componente | Indicador |
|---|---|---|
| Acción | `DropdownMenuItem` | — |
| Acción destructiva | `DropdownMenuItem variant="destructivo"` | Icono `Trash2` en `--danger` |
| Alternable | `DropdownMenuCheckboxItem` | `Check` 16px a la izquierda, en `--accent` |
| Exclusivo | `DropdownMenuRadioItem` | Punto de 6px a la izquierda, en `--accent` |
| Submenú | `DropdownMenuSubTrigger` | `ChevronRight` 16px a la derecha, `--text-tertiary` |

### 2.3 Por qué el indicador de selección es índigo

Marcar una casilla o elegir una opción dentro de un menú es **decir dónde estás**, no ejecutar. El
negro se reserva para el botón que confirma. Es exactamente la misma razón por la que el checkbox de
`04` y el radio de `09` son índigo (ver `forms/checkbox.md` §2).

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Cerrado** | El popup no está en el DOM (Base UI lo desmonta). |
| **Abriendo** | `.appear`-equivalente de Base UI: `fade-in` + `zoom-in-95` + desplazamiento de 2px desde el lado del anclaje, `--dur-base` con `--ease-out`. El disparador queda en estado hover mientras dure (`aria-expanded="true"`). |
| **Item resaltado** (teclado o ratón) | Fondo `--surface-sunken`, texto `--text-primary`. **Un solo item resaltado a la vez**: el ratón y el teclado comparten el mismo resaltado, no dos distintos. |
| **Item destructivo resaltado** | Fondo `--danger-tint`, texto `--danger`. |
| **Item deshabilitado** | `opacity: .5`, no recibe resaltado, se salta con las flechas. |
| **Item con submenú abierto** | Se queda resaltado mientras el submenú está abierto. |
| **Cerrando** | `fade-out` + `zoom-out-95`, `--dur-fast`. Más rápido que al abrir: cerrar es una confirmación, no una presentación. |
| **Sin espacio abajo** | Base UI voltea el lado (`side` automático). El menú nunca se sale de la ventana ni provoca scroll de página. |

**El foco vuelve al disparador** al cerrar, siempre. Si el menú se cerró porque se ejecutó una
acción que quitó la fila del DOM, el foco va a la fila siguiente — nunca al `<body>`.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Popup — fondo | `--surface` |
| Popup — borde | `--border-hairline` (1px) |
| Popup — radio | `--radius-control` |
| Popup — sombra | `--shadow-float` |
| Popup — padding | `--sp-1` |
| Item — alto | 36px |
| Item — padding / gap | `--sp-3` / `--sp-2` |
| Item — radio | `--radius-input` |
| Item — tipografía | `--fs-body`, peso 400 |
| Item — texto / icono | `--text-primary` / `--text-secondary` |
| Item — fondo resaltado | `--surface-sunken` |
| Item destructivo | `--danger`, fondo resaltado `--danger-tint` |
| Indicador de selección | `--accent` |
| GroupLabel | `--fs-label` mayúsculas, `--text-tertiary` |
| Separator | `--border-hairline` |
| Atajo | `--fs-sm`, `--text-tertiary`, `tabular-nums` |
| Duración | `--dur-base` al abrir, `--dur-fast` al cerrar; `--ease-out` |

**Modo oscuro**: sin reglas propias. `--shadow-float` es una sombra negra translúcida y en oscuro
casi desaparece — es correcto: ahí lo que separa el popup del fondo es el borde hairline, que en
oscuro sube a `#26262A`. Por eso el borde no es opcional.

━━━

## 5. Accesibilidad

- **Base UI ya implementa el patrón `menu` de WAI-ARIA**: `role="menu"`, `role="menuitem"`,
  navegación con flechas, `Home`/`End`, búsqueda por primera letra, `Escape` para cerrar, foco
  atrapado mientras está abierto. **No se reimplementa nada de eso a mano.**
- **El disparador declara la relación**: `aria-haspopup="menu"` y `aria-expanded`. Lo pone
  `DropdownMenuTrigger`; si el disparador es un `Button` con `render`, hay que verificar que los
  atributos llegan al elemento final.
- **El disparador `⋮` necesita contexto**: `aria-label="Más acciones para {título de la fila}"`. Ver
  `core/icon-button.md` §5.
- **Los iconos de item son decorativos** (`aria-hidden="true"`). La etiqueta de texto es siempre la
  que informa.
- **El atajo se anuncia, no se dibuja solo**: `<kbd>` dentro del item, no un `::after` con
  `content`. Un atajo pintado con CSS no existe para un lector de pantalla.
- **Destructivo se separa físicamente.** Un item que borra pegado a un item que duplica es un
  accidente esperando. Separador obligatorio y última posición.
- **Alto de item ≥ 36px** y ancho completo del popup: en móvil el item entero es la zona táctil, lo
  que supera `--touch-target` sin trucos.
- **El menú no es un tour**: nunca se abre solo, ni al cargar la página, ni al pasar el cursor. Solo
  con clic, `Enter`, `Espacio` o `Flecha abajo` sobre el disparador.
- **Contraste**: `--text-primary` sobre `--surface-sunken` ≈ 15:1; `--danger` sobre `--danger-tint`
  ≈ 4.0:1 — cumple para 14px a peso 500, que es como se pinta el item destructivo resaltado.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/dropdown-menu.tsx — Content e Item restilados
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={sideOffset} {...pos}>
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) min-w-[200px] max-w-[320px] overflow-y-auto",
            "rounded-[var(--radius-control)] border border-[var(--border-hairline)]",
            "bg-[var(--surface)] p-[var(--sp-1)] shadow-[var(--shadow-float)]",
            "origin-(--transform-origin) outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({ className, variant = "default", ...props }) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        "relative flex h-9 cursor-default select-none items-center gap-[var(--sp-2)]",
        "rounded-[var(--radius-input)] px-[var(--sp-3)] text-[length:var(--fs-body)]",
        "text-[var(--text-primary)] outline-hidden",
        "focus:bg-[var(--surface-sunken)]",
        "data-[variant=destructivo]:text-[var(--danger)]",
        "data-[variant=destructivo]:focus:bg-[var(--danger-tint)]",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[var(--text-secondary)]",
        "data-[variant=destructivo]:[&_svg]:text-[var(--danger)]",
        className,
      )}
      {...props}
    />
  )
}
```

```tsx
// 03 · menú de una fila de la tabla de entradas
<DropdownMenu>
  <DropdownMenuTrigger
    render={
      <Button variant="fantasma" size="icono-sm" aria-label={`Más acciones para ${entrada.titulo}`}>
        <MoreVertical aria-hidden="true" />
      </Button>
    }
  />
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={editar}>
      <Pencil aria-hidden="true" /> Editar
      <DropdownMenuShortcut><kbd>⌘E</kbd></DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={duplicar}>
      <Copy aria-hidden="true" /> Duplicar
    </DropdownMenuItem>
    <DropdownMenuItem onClick={verEnSitio}>
      <ExternalLink aria-hidden="true" /> Ver en el sitio
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructivo" onClick={confirmarPapelera}>
      <Trash2 aria-hidden="true" /> Mover a la papelera
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

━━━

## 7. Reglas duras

1. **Menú = acciones.** Valores de formulario van en `select`; contenido y formularios van en
   `popover`.
2. **Lo destructivo va último y tras un separador.** Siempre.
3. **El indicador de selección es índigo; nunca hay un item con relleno negro.**
4. **El foco vuelve al disparador al cerrar.**
5. **Borde hairline obligatorio** además de la sombra: en modo oscuro la sombra no separa nada.
6. **No se reimplementa el teclado.** Base UI ya lo trae; tocarlo solo introduce bugs.
7. **`⋮` sin contexto está prohibido**: el `aria-label` incluye el nombre de la fila.
