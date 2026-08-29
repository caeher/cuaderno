# Chip — etiqueta manipulable

> Un chip es **un dato que el usuario puso y puede quitar o alternar**. Ahí está la frontera con el
> badge: el badge describe un estado que decide el sistema y no se toca; el chip es contenido del
> usuario y siempre tiene una acción encima.
> Referencias: `04` (Etiquetas: `IA ×`, `Futuro ×`, `Trabajo ×`), `06` (categorías con punto de
> color), `03` y `07` (chips de filtro alternables), `09` (chips de valor en campos multivalor).

Ruta destino: `components/ui/chip.tsx` — **no existe**, se compone de piezas que sí existen.

━━━

## 0. Adopción (componer, no inventar)

No hace falta un primitivo nuevo:

- **`chip` de tipo `etiqueta` (removible)**: es la caja de `components/ui/badge.tsx` con un
  `<button>` de cierre dentro. Se copia el `cva` base del badge y se le añade el botón; el badge no
  se modifica.
- **`chip` de tipo `filtro` (alternable)**: se adopta `components/ui/toggle.tsx` /
  `toggle-group.tsx` (Base UI `Toggle`), que ya trae `data-pressed` y el manejo de teclado de un
  grupo. Solo se restila.
- **`chip` de tipo `entrada`** (los que se generan al escribir en un campo multivalor): la caja es
  la misma; el contenedor es un `input-group.tsx` con los chips en el addon `inline-start`.

Alias de shadcn que tocan estas piezas: `--muted` → `--surface-sunken`, `--border` →
`--border-hairline`, `--ring` → `--accent`. Ver la tabla completa y la colisión de `--accent` en
`core/button.md` §0.

━━━

## 1. Anatomía

```
   ┌──────────────────┐   ┌────────────────────────┐   ┌─────────────────────┐
   │  Futuro      ×   │   │  ●  Inteligencia Art.  │   │  Publicadas (20)    │
   └──────────────────┘   └────────────────────────┘   └─────────────────────┘
       │        │             │                            │
       2        3             1                            2
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Adorno inicial** *(opcional)* | Punto de categoría de 8px (`--cat-1`…`--cat-8`, `border-radius: var(--radius-pill)`) o icono lucide de 14px. `aria-hidden="true"`. |
| 2 | **Etiqueta** | Texto tal cual lo escribió el usuario — **no se normaliza la caja**: si escribió «IA», dice «IA», no «Ia». `--fs-sm`, peso 500, `max-width: 200px`, `text-overflow: ellipsis`. |
| 3 | **Botón de cierre** *(solo `etiqueta` y `entrada`)* | `X` de 14px, `stroke-width: 2`, color `--text-tertiary` → `--text-secondary` en hover. Es un `<button>` propio, con su propio foco y su propio `aria-label`. |

**Caja**: `inline-flex`, `align-items: center`, `gap: var(--sp-2)`, alto **28px**, padding
`0 var(--sp-3)` (a la derecha baja a `var(--sp-2)` cuando lleva botón de cierre),
`border-radius: var(--radius-pill)`, fondo `--surface-sunken`, texto `--text-primary`.

Un tamaño `sm` de 24px existe solo para chips dentro de una celda de tabla. No hay `lg`.

━━━

## 2. Variantes

| `variant` | Interacción | Aspecto | Dónde |
|---|---|---|---|
| `etiqueta` *(por defecto)* | Quitar (`×`) | Fondo `--surface-sunken`, texto `--text-primary` | `04` — etiquetas de la entrada |
| `categoria` | Quitar, o ninguna si es de solo lectura | Igual + punto `--cat-N` a la izquierda | `06`, `04` |
| `filtro` | Alternar (encendido/apagado) | Apagado: fondo `--surface`, borde `--border-hairline`, texto `--text-secondary`. Encendido: fondo `--accent-tint`, borde `--accent-border`, texto `--accent-pressed` | `03`, `07` |
| `entrada` | Quitar, y se crea al escribir | Igual que `etiqueta`, dentro de la caja del input | Campos multivalor de `09` |
| `contador` | Ninguna | Fondo `--surface-sunken`, texto `--text-secondary`, `tabular-nums` | El `(20)` de un tab, el conteo de una fila |

**Por qué el `filtro` encendido es índigo y no negro**: encender un filtro no compromete nada — es
navegación dentro de una lista, exactamente lo mismo que el item activo del sidebar. El negro se
reserva para la acción que ejecuta («Analizar», «Guardar cambios»). Un chip de filtro negro le
robaría el peso visual al CTA de la pantalla.

### Props

| Prop | Tipo | Por defecto | Efecto |
|---|---|---|---|
| `variant` | ver arriba | `etiqueta` | |
| `size` | `sm \| md` | `md` | 24px / 28px |
| `color` | `1..8` | — | Índice de `--cat-N` para el punto. Solo en `categoria`. |
| `removible` | `boolean` | `true` en `etiqueta`/`entrada` | Muestra el botón `×`. |
| `onRemover` | `() => void` | — | Obligatorio si `removible`. |
| `presionado` | `boolean` | — | Solo en `filtro`. Controla `data-pressed`. |
| `deshabilitado` | `boolean` | `false` | |

━━━

## 3. Estados

| Estado | `etiqueta` / `categoria` / `entrada` | `filtro` |
|---|---|---|
| **Reposo** | Fondo `--surface-sunken` | Apagado: `--surface` + `--border-hairline` |
| **Hover en la caja** | Sin cambio — la caja no es pulsable, solo lo es el `×` | Fondo `--surface-sunken`, borde `--border-strong` |
| **Hover en el `×`** | El icono sube a `--text-secondary` y su caja de 20px toma fondo `--border-hairline` | — |
| **Pressed** | El `×` no se hunde | `filtro` no se hunde: cambia de color de golpe |
| **Encendido** | — | Fondo `--accent-tint`, borde `--accent-border`, texto `--accent-pressed` |
| **Foco** | `box-shadow: var(--focus-ring)` **en el `×`**, no en la caja | `--focus-ring` en la caja completa |
| **Deshabilitado** | `opacity: .5`, `pointer-events: none`; el `×` desaparece del orden de tabulación | Igual |
| **Al quitarse** | El chip desaparece **sin animación de salida**. El foco pasa al chip siguiente; si era el último, al control que crea chips («Añadir etiqueta»). Perder el foco al borrar es el bug clásico de este componente. |
| **Al crearse** | Entra con `.appear` (`--dur-base`), que ya respeta `prefers-reduced-motion`. |

Transiciones: solo `background-color`, `border-color`, `color`, `box-shadow`, `--dur-fast`.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Radio | `--radius-pill` |
| Alto | 28px (`sm`: 24px) |
| Padding | `--sp-3` / `--sp-2` con cierre |
| Gap | `--sp-2` |
| Tipografía | `--fs-sm`, peso 500; `contador` con `tabular-nums` |
| Fondo base | `--surface-sunken` |
| Texto | `--text-primary` (`contador`: `--text-secondary`) |
| Cierre `×` | `--text-tertiary` → `--text-secondary`; fondo hover `--border-hairline` |
| Filtro apagado | `--surface` + `--border-hairline`, texto `--text-secondary` |
| Filtro encendido | `--accent-tint` + `--accent-border`, texto `--accent-pressed` |
| Punto de categoría | `--cat-1` … `--cat-8`, 8px, `--radius-pill` |
| Foco | `--focus-ring` |
| Duración / curva | `--dur-fast` / `--ease-out`; entrada con `.appear` (`--dur-base`) |
| Sombra | **ninguna** |

**El punto de categoría es contenido, no marca.** `--cat-N` etiqueta un dato del usuario; no
significa «bien» ni «esto es IA». Por eso puede usar toda la rampa sin romper la ley de color: el
`--cat-1` es índigo por coincidencia cromática, no porque la categoría tenga que ver con la IA.

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **La caja no es un botón, el `×` sí.** En `etiqueta` el chip es un `<span>` con un `<button>`
  dentro. Meter la etiqueta y el cierre en un mismo botón hace imposible leer el texto sin
  activarlo.
- **`aria-label` del cierre con el dato dentro**: `aria-label="Quitar la etiqueta Futuro"`. Nunca
  «Quitar» a secas: en una fila de siete chips el lector de pantalla anunciaría siete botones
  idénticos.
- **`filtro` es `<button aria-pressed>`**, no un checkbox disfrazado. Un grupo de filtros va dentro
  de un contenedor con `role="group"` y `aria-label` («Filtrar por estado»).
- **Teclado**: `Tab` recorre los chips removibles; sobre un chip enfocado, `Backspace` o `Delete`
  lo quitan (además del clic en el `×`). En `entrada`, `Backspace` con el input vacío quita el
  último chip — es el gesto que todo el mundo espera.
- **El foco no se pierde al borrar.** Al quitar un chip, el foco se mueve al siguiente; si no hay,
  al anterior; si no queda ninguno, al control de añadir.
- **Zona táctil**: la caja de 28px queda por debajo de `--touch-target`; el `×` extiende su zona
  activa con `::after { inset: -8px }`. En móvil, dos chips contiguos nunca dejan sus zonas de
  cierre a menos de 8px una de otra.
- **El punto de color no informa solo.** El nombre de la categoría está siempre presente en texto;
  el punto es `aria-hidden="true"`. Ocho categorías distinguidas solo por color son ilegibles para
  un daltónico y para cualquiera con un monitor mal calibrado.
- **Contraste**: `--accent-pressed` sobre `--accent-tint` ≈ 7.5:1. `--text-tertiary` se usa solo en
  el icono `×`, nunca en el texto del chip.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/chip.tsx
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const CAJA =
  "inline-flex h-7 items-center gap-[var(--sp-2)] rounded-[var(--radius-pill)] " +
  "px-[var(--sp-3)] text-[length:var(--fs-sm)] font-medium " +
  "transition-[background-color,border-color,color,box-shadow] " +
  "duration-[var(--dur-fast)] ease-[var(--ease-out)]"

export function Chip({ etiqueta, color, onRemover, deshabilitado }: ChipProps) {
  return (
    <span
      data-slot="chip"
      className={cn(
        CAJA,
        "bg-[var(--surface-sunken)] text-[var(--text-primary)]",
        onRemover && "pr-[var(--sp-2)]",
        deshabilitado && "pointer-events-none opacity-50",
      )}
    >
      {color && (
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-[var(--radius-pill)]"
          style={{ background: `var(--cat-${color})` }}
        />
      )}
      <span className="max-w-[200px] truncate">{etiqueta}</span>
      {onRemover && (
        <button
          type="button"
          onClick={onRemover}
          aria-label={`Quitar la etiqueta ${etiqueta}`}
          className={cn(
            "relative grid size-5 shrink-0 place-items-center rounded-[var(--radius-pill)]",
            "text-[var(--text-tertiary)] outline-none",
            "after:absolute after:-inset-2",           // zona táctil
            "hover:bg-[var(--border-hairline)] hover:text-[var(--text-secondary)]",
            "focus-visible:shadow-[var(--focus-ring)]",
          )}
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </span>
  )
}

// filtro alternable — se apoya en Toggle de Base UI (components/ui/toggle.tsx)
export function ChipFiltro({ etiqueta, presionado, onPresionar }: ChipFiltroProps) {
  return (
    <Toggle
      pressed={presionado}
      onPressedChange={onPresionar}
      className={cn(
        CAJA,
        "border border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-secondary)]",
        "hover:border-[var(--border-strong)] hover:bg-[var(--surface-sunken)]",
        "focus-visible:shadow-[var(--focus-ring)]",
        "data-pressed:border-[var(--accent-border)] data-pressed:bg-[var(--accent-tint)]",
        "data-pressed:text-[var(--accent-pressed)]",
      )}
    >
      {etiqueta}
    </Toggle>
  )
}
```

```tsx
// 04 · sidebar de publicación, sección Etiquetas
<div role="group" aria-label="Etiquetas de la entrada" className="flex flex-wrap gap-[var(--sp-2)]">
  {etiquetas.map((e) => (
    <Chip key={e.id} etiqueta={e.nombre} onRemover={() => quitar(e.id)} />
  ))}
</div>
<Button variant="enlace" icono={Plus}>Añadir etiqueta</Button>
```

━━━

## 7. Reglas duras

1. **Chip ≠ badge.** Si no se puede quitar ni alternar, es un badge. Si se puede, es un chip. No hay
   caso intermedio.
2. **El texto del usuario se respeta tal cual.** Sin `capitalize`, sin `uppercase`, sin recortar
   acentos.
3. **El `×` es un botón real con su propio `aria-label` incluyendo el dato.**
4. **El foco nunca se pierde al borrar un chip.**
5. **El filtro encendido es índigo, jamás negro.** El negro es de la acción que ejecuta.
6. **El punto de color nunca es el único canal**: el nombre siempre está en texto.
7. **Sin sombra, sin borde en las variantes de contenido.** Solo `filtro` lleva borde.
