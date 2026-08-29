# Search Input — buscador

> El campo de búsqueda con el atajo **⌘K visible**. Que el atajo se vea dentro del control es una
> decisión de producto: enseña el atajo sin un tour y sin un tooltip, cada vez que alguien mira el
> topbar.
> Referencias: `02` y `09` (topbar: «Buscar…» + ⌘K), `03` («Buscar entradas…»), `05` («Buscar
> páginas…»), `06`, y el buscador de la navegación secundaria de ajustes.

Ruta destino: `components/ui/search-input.tsx` — **no existe**, se compone.

━━━

## 0. Adopción (componer, no inventar)

Se compone con dos piezas que ya existen: `components/ui/input-group.tsx` (que resuelve addons al
inicio y al final, y ya reenvía al input el clic sobre el addon) e `components/ui/input.tsx`.
`InputGroupAddon` incluso trae ya reglas para `[&>kbd]` — el hueco del ⌘K está previsto.

1. `InputGroup`: `h-8` → 40px, `rounded-lg` → `--radius-input`, `border-input` →
   `--border-hairline`, fondo `--surface`, foco con `--focus-ring` (el `has-[…]:focus-visible` ya
   está resuelto en el archivo).
2. `InputGroupAddon align="inline-start"` → icono `Search`. `align="inline-end"` → el `<kbd>` o el
   botón de limpiar.
3. Estilar el `kbd` con los tokens de §1. Hoy usa `rounded-[calc(var(--radius)-5px)]`, que depende
   del `--radius` de shadcn y no del contrato.

━━━

## 1. Anatomía

```
   ┌───────────────────────────────────────────────────┐
   │  🔍   Buscar...                            ⌘K     │
   └───────────────────────────────────────────────────┘
      │        │                                  │
      1        2                                  3
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Icono** | `Search` de 16px, `--text-tertiary`, a `var(--sp-3)` del borde. Decorativo (`aria-hidden`). Se mantiene siempre, también con texto escrito. |
| 2 | **Campo** | `--fs-body`, `--text-primary`. Placeholder **específico**: «Buscar entradas…», «Buscar páginas…». «Buscar…» a secas solo en el buscador global del topbar, que efectivamente busca en todo. |
| 3 | **Atajo `⌘K`** | `<kbd>`: `--fs-label` (12px) peso 600, `--text-tertiary`, fondo `--surface-sunken`, borde 1px `--border-hairline`, radio 6px, padding `2px var(--sp-2)`, alto 20px. **Se oculta al enfocar el campo** —ya no hace falta— y se sustituye por el botón de limpiar cuando hay texto. |

**Caja**: 40px de alto (`md`) / 32px (`sm`), `--radius-input`, fondo `--surface`, borde
`--border-hairline`. En el topbar el ancho es fijo (360px en `02`); en una lista ocupa el ancho de su
columna con `max-width: 320px`.

**El atajo se muestra según la plataforma**: `⌘K` en macOS, `Ctrl K` en Windows y Linux. Se detecta
en cliente; hasta que se detecta se renderiza vacío, nunca `⌘K` por defecto — sería mentira para la
mayoría de los usuarios.

━━━

## 2. Variantes

| `variant` | Comportamiento | Dónde |
|---|---|---|
| `global` | Abre la **paleta de comandos** (`⌘K`). El input del topbar **no busca ahí**: es el disparador de un modal, y por eso puede ser `readOnly` y capturar el clic para abrir la paleta | `02`, `09` — topbar |
| `filtro` *(por defecto)* | Filtra la lista de la pantalla en vivo, con **debounce de 300ms**. Sin botón «Buscar» | `03`, `05`, `06` |
| `formulario` | Busca al pulsar `Enter` o el botón que lo acompaña. Va dentro de un `<form role="search">` | `07` — análisis de una URL |

### Props

| Prop | Tipo | Por defecto |
|---|---|---|
| `variant` | ver arriba | `filtro` |
| `size` | `sm \| md` | `md` |
| `atajo` | `boolean` | `true` en `global`, `false` en el resto |
| `placeholder` | string | — (obligatorio y específico) |
| `alLimpiar` | `() => void` | — |

**El atajo solo en el buscador global.** Un `⌘K` en el buscador de una lista promete algo que no va a
pasar y, peor, sugiere que hay dos atajos distintos.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Vacío** | Icono + placeholder + `⌘K` (si aplica). |
| **Hover** | Borde `--border-strong`. |
| **Foco** | Borde `--border-strong` + `--focus-ring`. El `⌘K` desaparece. |
| **Con texto** | Aparece un `icon-button` de limpiar (`X` 16px, `fantasma`, `icono-sm`) en el addon final, en lugar del `⌘K`. |
| **Buscando** | `Loader2` de 16px **reemplaza al icono de lupa** a la izquierda; no aparece un segundo indicador a la derecha. La lupa y el spinner ocupan el mismo sitio porque son el mismo estado. `aria-busy="true"`. |
| **Sin resultados** | El input **no cambia**: no se pinta de rojo ni entra en error. «Sin resultados» no es un fallo del usuario. El mensaje va en la lista, repitiendo el término buscado y ofreciendo una salida («Limpiar búsqueda»). |
| **Deshabilitado** | Fondo `--surface-sunken`. Raro: un buscador deshabilitado casi siempre debería estar oculto. |

**`Escape` limpia el campo** si tiene texto; si ya está vacío, lo desenfoca. En la variante `global`,
`Escape` cierra la paleta.

**Debounce de 300ms** en `filtro`, y la lista **no se vacía mientras se espera**: se mantiene el
resultado anterior con `aria-busy`. Una lista que parpadea a vacío en cada tecla es inutilizable.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Caja | 40px (`sm`: 32), `--radius-input`, `--surface`, borde `--border-hairline` → `--border-strong` |
| Padding | `--sp-3` a cada lado; gap `--sp-2` entre addon y campo |
| Icono | `Search` 16px, `--text-tertiary` |
| Texto / placeholder | `--fs-body` `--text-primary` / `--text-secondary` |
| `kbd` | `--fs-label` peso 600, `--text-tertiary`, fondo `--surface-sunken`, borde `--border-hairline`, radio 6px, alto 20px |
| Botón limpiar | `icon-button` `fantasma` `icono-sm` |
| Foco | `--focus-ring` |
| Duración / curva | `--dur-fast` / `--ease-out` |
| Ancho | 360px en topbar; `max-width: 320px` en listas |

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **`type="search"`** y contenedor con `role="search"`. Es una región de referencia: quien navega
  por landmarks encuentra el buscador sin recorrer el topbar entero.
- **Etiqueta obligatoria, aunque esté oculta.** El icono de lupa no es una etiqueta:
  `<label class="sr-only">Buscar entradas</label>` o `aria-label`. Sin ella el campo se anuncia como
  «cuadro de texto» a secas.
- **El `⌘K` es texto real dentro de un `<kbd>`**, nunca un `::after` con `content`. Va
  `aria-hidden="true"` porque el atajo se comunica mejor en la etiqueta —
  `aria-label="Buscar. Atajo: Control K"` — ya que el símbolo `⌘` leído en voz alta no dice nada.
- **Los resultados en vivo se anuncian con moderación**: la región de resultados lleva
  `aria-live="polite"` y `role="status"`, y anuncia **el conteo**, no la lista: «12 entradas
  encontradas». Se dispara **después** del debounce, nunca en cada tecla.
- **El botón de limpiar es un botón real** con `aria-label="Limpiar búsqueda"`; al pulsarlo el foco
  vuelve al campo.
- **`Escape` limpia**, y ese comportamiento se documenta en la ayuda del campo o de la paleta.
- **En la variante `global` el input es el disparador de un modal**: lleva `aria-haspopup="dialog"` y
  `aria-expanded`. Si es `readOnly`, sigue recibiendo foco y respondiendo a `Enter`.
- **El atajo no secuestra el teclado**: `⌘K` se ignora mientras el foco está dentro de un input, de
  un textarea o del editor TipTap. Quitarle `⌘K` a alguien que está escribiendo un párrafo es el
  atajo peor implementado que existe.
- **Zona táctil**: 44px en móvil, igual que el input. El `⌘K` **no se muestra en táctil**: no hay
  teclado físico.
- **Contraste**: el `kbd` en `--text-tertiary` sobre `--surface-sunken` da ≈2.5:1 y **no cumple AA**.
  Es aceptable únicamente porque es información redundante y decorativa (`aria-hidden`) y porque
  desaparece al enfocar. Si alguna vez el atajo pasa a ser la única forma de descubrir la paleta,
  sube a `--text-secondary`.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/search-input.tsx
"use client"
import { useState } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton,
} from "@/components/ui/input-group"

export function SearchInput({
  etiqueta, placeholder, valor, onValor, atajo = false, buscando = false, size = "md",
}: SearchInputProps) {
  const [enfocado, setEnfocado] = useState(false)
  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)

  return (
    <div role="search" className="w-full max-w-[360px]">
      <InputGroup
        data-size={size}
        className={cn(
          "rounded-[var(--radius-input)] border-[var(--border-hairline)] bg-[var(--surface)]",
          "data-[size=md]:h-10 data-[size=sm]:h-8",
          "hover:border-[var(--border-strong)]",
          "has-[input:focus-visible]:border-[var(--border-strong)]",
          "has-[input:focus-visible]:shadow-[var(--focus-ring)]",
        )}
      >
        <InputGroupAddon align="inline-start" className="pl-[var(--sp-3)] text-[var(--text-tertiary)]">
          {buscando
            ? <Loader2 className="animate-spin" aria-hidden="true" />
            : <Search aria-hidden="true" />}
        </InputGroupAddon>

        <InputGroupInput
          type="search"
          aria-label={atajo ? `${etiqueta}. Atajo: ${mac ? "Comando" : "Control"} K` : etiqueta}
          placeholder={placeholder}
          value={valor}
          aria-busy={buscando}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          onChange={(ev) => onValor(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Escape" && valor) { ev.preventDefault(); onValor("") }
          }}
          className="text-[length:var(--fs-body)] placeholder:text-[var(--text-secondary)]"
        />

        <InputGroupAddon align="inline-end" className="pr-[var(--sp-3)]">
          {valor ? (
            <InputGroupButton size="icon-xs" aria-label="Limpiar búsqueda" onClick={() => onValor("")}>
              <X aria-hidden="true" />
            </InputGroupButton>
          ) : atajo && !enfocado ? (
            <kbd
              aria-hidden="true"
              className="inline-flex h-5 items-center rounded-[6px] border border-[var(--border-hairline)]
                         bg-[var(--surface-sunken)] px-[var(--sp-2)] text-[length:var(--fs-label)]
                         font-semibold text-[var(--text-tertiary)] max-sm:hidden"
            >
              {mac ? "⌘" : "Ctrl "}K
            </kbd>
          ) : null}
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

```tsx
// 03 · buscador de lista, con debounce y conteo anunciado una sola vez
<SearchInput
  etiqueta="Buscar entradas"
  placeholder="Buscar entradas..."
  valor={consulta}
  onValor={setConsulta}
  buscando={filtrando}
/>
<p role="status" aria-live="polite" className="sr-only">
  {filtrando ? "" : `${resultados.length} entradas encontradas`}
</p>
```

━━━

## 7. Reglas duras

1. **`role="search"` + etiqueta**, aunque la etiqueta esté oculta.
2. **El `⌘K` solo en el buscador global**, y solo en escritorio.
3. **El atajo se detecta por plataforma**; nunca `⌘` fijo.
4. **Debounce de 300ms** y la lista no parpadea a vacío.
5. **«Sin resultados» no es un error**: el campo no se pone rojo.
6. **`Escape` limpia**, y el foco vuelve al campo tras limpiar con el botón.
7. **El atajo no roba el teclado** mientras se escribe en otro campo o en el editor.
8. **El spinner reemplaza a la lupa**, no se suma a la derecha.
