# Icon Button — botón de solo icono

> Un botón cuadrado sin etiqueta visible. Es el control más denso del panel y el más fácil de
> arruinar: sin `aria-label` es invisible para un lector de pantalla, y sin zona táctil ampliada es
> inutilizable en móvil. Las dos cosas son obligatorias, no recomendaciones.
> Referencias: `02` y `09` (toggle de tema, campana de notificaciones), `03` y `05` (menú `⋮` de
> fila, alternador lista/grilla), `04` (toda la barra de TipTap, papelera de la imagen destacada),
> `09` (papelera junto a «Cambiar imagen»), `08` (controles del gráfico).

Ruta destino: `components/ui/button.tsx` — **ya existe**, como tamaños `icon-*`.

━━━

## 0. Adopción (no reescribir)

No es un componente aparte: es `Button` con un `size` de icono. `components/ui/button.tsx` ya trae
`icon`, `icon-xs`, `icon-sm`, `icon-lg`. Cambios:

1. Renombrar los tamaños a `icono-sm` / `icono-md` / `icono-lg` con las medidas de §1 y borrar
   `icon-xs` (24px es demasiado pequeño para un control real; lo que hoy lo usa es un adorno, no un
   botón).
2. Las variantes de color son **las mismas de `button.md` §2.1**, sin ninguna variante propia. Un
   icon-button no puede tener un aspecto que un botón con texto no tenga.
3. Añadir al `cva` base la zona táctil de §5: `after:absolute after:-inset-1.5`.
4. Regla de tipos: la variante `primario` en tamaño icono está permitida solo para el botón flotante
   de «Acciones rápidas» (`02`). En una barra de herramientas, un icono negro relleno compite con el
   CTA de la pantalla.

━━━

## 1. Anatomía

```
   ┌──────────┐
   │    ⋮     │      Una caja cuadrada. El icono va centrado. No hay nada más.
   └──────────┘
```

| Parte | Regla |
|---|---|
| **Caja** | Cuadrada, `border-radius: var(--radius-control)`. `display: grid; place-items: center`. La caja **nunca** cambia de ancho según el icono. |
| **Icono** | Lucide, `stroke-width: 1.75` (2 en tamaños `sm`). Un solo icono; nunca dos apilados ni un icono con un número encima — para eso está el punto de estado. |
| **Punto de estado** *(opcional)* | 6px, arriba a la derecha, `--accent` para «hay algo nuevo» (la campana de `02`), `--danger` para «hay algo mal». Con `ring: 2px solid var(--surface)`. |

### Tamaños

| `size` | Caja | Icono | Radio | Dónde |
|---|---|---|---|---|
| `icono-sm` | 32×32 | 16px | `--radius-control` | Menú `⋮` de fila, barra de TipTap (`03`, `04`, `05`) |
| `icono-md` *(por defecto)* | 40×40 | 20px | `--radius-control` | Topbar: tema, campana (`02`, `09`) |
| `icono-lg` | 44×44 | 20px | `--radius-control` | Móvil y controles primarios de `08` |

`icono-lg` es el único que cumple `--touch-target` por geometría; los otros dos lo cumplen por zona
ampliada (§5).

━━━

## 2. Variantes

Las mismas que `button.md` §2.1, con estos usos canónicos:

| `variant` | Uso en las pantallas |
|---|---|
| `fantasma` *(por defecto)* | El 90% de los casos: `⋮` de fila, topbar, barra de TipTap. Sin fondo ni borde en reposo — una barra de nueve iconos con nueve bordes es una reja. |
| `secundario` | Cuando el icono va solo, fuera de una barra, y necesita anunciar que es pulsable: la papelera junto a «Cambiar imagen» (`09`). |
| `destructivo` | Papelera de la imagen destacada (`04`) cuando la acción es inmediata y no abre confirmación. |
| `ia` | Botón de acción de IA dentro de la barra del editor cuando no cabe la etiqueta. Requiere tooltip obligatorio con el texto completo. |
| `primario` | **Solo** el botón flotante de «Acciones rápidas» de `02`. |

### 2.1 Estado presionado (`aria-pressed`)

El alternador lista/grilla de `03` y `05` y los botones de formato de la barra de TipTap (`04`) son
**alternables**, no botones sueltos:

- Apagado: `fantasma` normal.
- **Encendido: fondo `--accent-tint`, icono `--accent`.** Es índigo porque marca *dónde estás* —
  la misma razón por la que el item activo del sidebar es índigo. Nunca negro: el negro ejecuta.
- Un grupo de alternadores se implementa con `components/ui/toggle-group.tsx`, que ya resuelve el
  teclado y `aria-pressed`.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | `fantasma`: transparente, icono `--text-secondary`. |
| **Hover** | Fondo `--surface-sunken`, icono `--text-primary`. En `destructivo`, fondo `--danger-tint` e icono `--danger`. |
| **Pressed** | Fondo `--surface-sunken`; **sin `translateY`** — un icono de 16px que se mueve 1px parece un glitch, no una pulsación. |
| **Foco** | `box-shadow: var(--focus-ring)`, `outline: none`. |
| **Encendido** (`aria-pressed="true"`) | Fondo `--accent-tint`, icono `--accent`. Se mantiene bajo hover. |
| **Menú abierto** (`aria-expanded="true"`) | Se queda con el fondo de hover mientras el popup está abierto: el usuario tiene que ver de qué fila salió el menú. |
| **Deshabilitado** | `opacity: .5`, `pointer-events: none`. **Y aun así lleva tooltip**, explicando por qué no se puede — un icono apagado sin explicación es el peor estado del producto. Para que el tooltip funcione se usa `aria-disabled="true"` con el foco conservado, no el atributo `disabled`. |
| **Cargando** | El icono se reemplaza por `Loader2` girando; la caja no cambia de tamaño. `aria-busy="true"`. |

Transiciones: `background-color`, `color`, `box-shadow`, `--dur-fast` / `--ease-out`.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Radio | `--radius-control` |
| Caja | 32 / 40 / 44 px |
| Icono en reposo | `--text-secondary` |
| Icono en hover | `--text-primary` |
| Fondo hover | `--surface-sunken` |
| Encendido | fondo `--accent-tint`, icono `--accent` |
| Destructivo | icono `--danger`, fondo hover `--danger-tint` |
| IA | icono `--accent`, fondo hover `--accent-tint` |
| Secundario | `--surface` + borde `--border-hairline` → `--border-strong` en hover |
| Punto de estado | `--accent` o `--danger`, `ring: 2px solid var(--surface)` |
| Foco | `--focus-ring` |
| Zona táctil | `--touch-target` (44px) como mínimo efectivo |
| Duración / curva | `--dur-fast` / `--ease-out` |
| Sombra | **ninguna** |

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **`aria-label` obligatorio, siempre, sin excepción.** Es la regla número uno de este componente.
  El texto es el mismo que el del tooltip: «Más acciones», «Cambiar tema», «Notificaciones»,
  «Negrita». Nunca «Botón», nunca el nombre del icono («Tres puntos»).
- **`aria-label` con el dato cuando la fila lo pide**: en una tabla de 20 filas, veinte botones
  «Más acciones» son indistinguibles. Se escribe `aria-label="Más acciones para El futuro del
  trabajo"`.
- **Tooltip obligatorio.** Todo icon-button lleva `tooltip` con la misma etiqueta. Un icono sin
  texto ni al pasar el cursor obliga a adivinar, y adivinar en la barra de un editor cuesta trabajo
  perdido. Ver `core/tooltip.md`.
- **Zona táctil de 44px.** `icono-sm` y `icono-md` la extienden sin cambiar la caja visible:
  `position: relative` + `::after { content:""; position:absolute; inset:-6px; }`. Dos icon-buttons
  contiguos nunca solapan sus zonas: el gap mínimo entre ellos es `--sp-1`.
- **Alternables usan `aria-pressed`**, no `aria-selected` ni una clase `.activo`. Un grupo lleva
  `role="group"` con `aria-label` («Formato de texto», «Vista de la lista»).
- **El punto de estado se anuncia**: `<span class="sr-only">3 notificaciones sin leer</span>`.
- **Contraste del icono**: `--text-secondary` sobre `--surface` ≈ 4.6:1. Los iconos son objetos
  gráficos y el mínimo AA es 3:1, así que hay margen; **`--text-tertiary` no se permite en un icono
  pulsable**, solo en adornos.
- **Teclado**: Enter y Espacio activan. Dentro de una barra de herramientas (`role="toolbar"`) la
  navegación es con flechas y solo un botón está en el orden de tabulación — es lo que espera
  cualquiera que use la barra del editor sin ratón.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/button.tsx — tamaños de icono en el cva, con zona táctil incluida
size: {
  "icono-sm": "relative size-8  after:absolute after:-inset-1.5 [&_svg:not([class*='size-'])]:size-4",
  "icono-md": "relative size-10 after:absolute after:-inset-1   [&_svg:not([class*='size-'])]:size-5",
  "icono-lg": "relative size-11 [&_svg:not([class*='size-'])]:size-5",
}
```

```tsx
// 03 · menú de fila — etiqueta con el dato dentro, y tooltip con la etiqueta corta
<Tooltip>
  <TooltipTrigger
    render={
      <DropdownMenuTrigger
        render={
          <Button
            variant="fantasma"
            size="icono-sm"
            aria-label={`Más acciones para ${entrada.titulo}`}
          >
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
    }
  />
  <TooltipContent>Más acciones</TooltipContent>
</Tooltip>

// 02 · campana con punto de notificación
<Button variant="fantasma" size="icono-md" aria-label="Notificaciones" className="relative">
  <Bell aria-hidden="true" />
  {sinLeer > 0 && (
    <>
      <span
        aria-hidden="true"
        className="absolute right-1.5 top-1.5 size-1.5 rounded-[var(--radius-pill)] bg-[var(--accent)] ring-2 ring-[var(--surface)]"
      />
      <span className="sr-only">{sinLeer} notificaciones sin leer</span>
    </>
  )}
</Button>

// 03 · alternador de vista — encendido en índigo, no en negro
<ToggleGroup value={vista} onValueChange={setVista} aria-label="Vista de la lista">
  <Toggle value="lista" aria-label="Vista de lista"
    className="data-pressed:bg-[var(--accent-tint)] data-pressed:text-[var(--accent)]">
    <List aria-hidden="true" />
  </Toggle>
  <Toggle value="grilla" aria-label="Vista de cuadrícula"
    className="data-pressed:bg-[var(--accent-tint)] data-pressed:text-[var(--accent)]">
    <LayoutGrid aria-hidden="true" />
  </Toggle>
</ToggleGroup>
```

━━━

## 7. Reglas duras

1. **`aria-label` obligatorio.** Un icon-button sin él es un bug de accesibilidad, no un detalle de
   estilo.
2. **Tooltip obligatorio**, con el mismo texto del `aria-label`.
3. **44px de zona táctil efectiva** en los tres tamaños.
4. **Sin `translateY` al pulsar.**
5. **Encendido en índigo, nunca en negro.**
6. **Caja cuadrada de medida fija.** El icono cambia; la caja no.
7. **Deshabilitado sigue explicando** por qué, vía `aria-disabled` + tooltip.
8. **Ninguna variante propia.** Si hace falta un aspecto nuevo, se añade en `button.md` y se hereda.
