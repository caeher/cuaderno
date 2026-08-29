# Tooltip — etiqueta emergente

> Dice el nombre de algo que no tiene etiqueta visible. **No es un lugar para explicar nada**: si el
> texto no cabe en una línea corta, lo que hace falta es un `popover` o un texto de ayuda en el
> formulario.
> Obligatorio en todo `icon-button` (barra de TipTap de `04`, topbar de `02`, `⋮` de `03`), en el
> valor exacto de una métrica abreviada (`24.8K` → `24.842`) y en los factores del SEO Analyzer
> (`07`).

Ruta destino: `components/ui/tooltip.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/tooltip.tsx` ya envuelve `Tooltip` de `@base-ui/react/tooltip` con `Provider`,
`Root`, `Trigger`, `Content` y `Arrow`. **Se conserva.** Cambios:

1. `bg-foreground` / `text-background` → `--action` / `--text-on-dark`. En el contrato ya son el
   negro y el blanco del sistema, así que el tooltip queda igual de oscuro en tema claro y en
   oscuro: es el único elemento del producto que **no invierte** con el tema, y es deliberado (un
   tooltip claro sobre fondo claro no se despega).
2. `rounded-md` → `--radius-input`; `text-xs` → `--fs-sm`; `px-3 py-1.5` → `var(--sp-3) var(--sp-2)`.
3. Añadir `box-shadow: var(--shadow-float)`.
4. `TooltipProvider delay={0}` → `delay={250}`, `closeDelay={0}` (§3).

━━━

## 1. Anatomía

```
        ┌──────────────────────┐
        │  Más acciones        │      1 · texto
        └───────────▽──────────┘      2 · flecha de 10px
                    │
                [ disparador ]
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Texto** | **Una línea, dos como máximo.** `--fs-sm` (13px), peso 500, `--text-on-dark`. Sin punto final. `max-width: 260px`. Sentence case. |
| 2 | **Flecha** | 10px, mismo fondo que la caja, apuntando al disparador. La provee `TooltipPrimitive.Arrow`; no se dibuja a mano. |

**Caja**: fondo `--action`, `border-radius: var(--radius-input)`, padding `var(--sp-2) var(--sp-3)`,
`--shadow-float`, `sideOffset: 8` (hoy 4). Sin borde: sobre negro un hairline no aporta nada.

**Qué NO va en un tooltip**: enlaces, botones, formularios, listas, imágenes, texto de más de dos
líneas, ni información que solo exista ahí. Nada de eso se puede alcanzar con el teclado ni en
táctil, así que sería información perdida para una parte de los usuarios.

━━━

## 2. Variantes

Una sola. El tooltip no tiene variantes de color: ni rojo para errores, ni índigo para IA. Un error
se muestra en el campo (`forms/form-field.md`), no al pasar el cursor.

| Prop | Tipo | Por defecto | Nota |
|---|---|---|---|
| `side` | `top \| bottom \| left \| right` | `top` | En una barra de herramientas, `bottom` para no tapar el texto que se está editando (`04`). |
| `align` | `start \| center \| end` | `center` | |
| `sideOffset` | number | `8` | |
| `delay` | number | `250` | Se hereda del `Provider`; solo se baja a `0` dentro de un grupo (§3). |

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Oculto** | No está en el DOM. |
| **Apertura por cursor** | Tras **250ms** de reposo del puntero sobre el disparador. Esa espera es lo que evita que una barra de nueve iconos dispare nueve tooltips mientras el cursor la cruza. |
| **Apertura por foco** | **Inmediata (0ms)** al recibir foco por teclado. Quien navega con `Tab` ya decidió detenerse ahí; hacerle esperar 250ms es castigarlo. Base UI distingue los dos casos. |
| **Grupo** | Con el `Provider`, una vez abierto el primer tooltip, los siguientes del mismo grupo abren en 0ms hasta que el cursor sale del grupo. Es el comportamiento que hace usable la barra del editor. |
| **Cierre** | Inmediato al salir el cursor, al perder el foco, al pulsar `Escape` o al hacer clic. `--dur-fast`. |
| **Táctil** | **No aparece.** No hay hover en un dedo, y un tooltip que se muestra al tocar tapa justo lo que se acaba de tocar. En móvil la etiqueta va visible o el control lleva texto. |
| **Deshabilitado el disparador** | El tooltip **sí** aparece: es donde se explica por qué está apagado. Requiere `aria-disabled="true"` en vez de `disabled`, para que el elemento siga recibiendo foco. |
| **Movimiento reducido** | Sin `zoom`: solo `opacity`. Ya lo cubre el bloque `prefers-reduced-motion` de `effects.css`. |

Animación: `fade-in` + `zoom-in-95` + 2px de desplazamiento desde el lado del anclaje, `--dur-fast`.
Nunca `--dur-base`: un tooltip lento se siente roto.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Fondo | `--action` |
| Texto | `--text-on-dark`, `--fs-sm`, peso 500 |
| Radio | `--radius-input` |
| Padding | `var(--sp-2) var(--sp-3)` |
| Sombra | `--shadow-float` |
| Ancho máximo | 260px |
| Flecha | 10px, `--action` |
| Duración / curva | `--dur-fast` / `--ease-out` |
| Retardo | 250ms cursor · 0ms foco |
| Borde | **ninguno** |

**Modo oscuro**: el tooltip **no cambia**. Es la única excepción del sistema y hay una razón: sobre
`--bg-page` oscuro un tooltip claro parece un modal, y sobre `--surface` oscuro uno oscuro
desaparece. El negro con texto blanco funciona en los dos temas. Si en modo oscuro `--action` dejara
de ser oscuro, el tooltip debería fijar su propio par de valores — pero eso sería un cambio del
contrato, no de este componente.

━━━

## 5. Accesibilidad

- **El tooltip nunca es la única fuente de información.** Todo lo que dice está también en el
  `aria-label` del disparador, o es redundante con algo visible. Regla operativa: si al borrar todos
  los tooltips del producto alguien se queda sin poder hacer algo, el diseño está mal.
- **El texto del tooltip = el `aria-label` del `icon-button`.** Mismo string, misma fuente en
  código. Dos textos distintos para el mismo botón hacen que la persona que ve y la que escucha
  usen productos diferentes.
- **No se duplica el anuncio.** Base UI enlaza el popup con `aria-describedby`. Si el disparador ya
  tiene `aria-label` con ese mismo texto, se le pasa `aria-describedby={undefined}` al contenido
  para que el lector no lo diga dos veces.
- **`Escape` cierra** aunque el cursor siga encima.
- **El tooltip no roba el foco** nunca: no es focusable, no contiene nada focusable.
- **No tapa al disparador.** `sideOffset: 8` y volteo automático de lado; si no hay espacio arriba,
  se pinta abajo.
- **Contraste**: `--text-on-dark` sobre `--action` ≈ 19:1.
- **Táctil**: sin tooltip. Si un control solo se entiende con tooltip, en móvil se le pone etiqueta.
- **Zoom al 400%**: el tooltip se reposiciona dentro de la ventana y no se corta. Lo resuelve el
  `Positioner`; no se le fija `position: fixed` a mano.

━━━

## 6. Marcado de ejemplo

```tsx
// app/layout.tsx — un solo Provider en la raíz, con los dos retardos del sistema
<TooltipProvider delay={250} closeDelay={0}>
  {children}
</TooltipProvider>
```

```tsx
// components/ui/tooltip.tsx — Popup restilado
<TooltipPrimitive.Popup
  data-slot="tooltip-content"
  className={cn(
    "z-50 inline-flex w-fit max-w-[260px] origin-(--transform-origin) items-center",
    "rounded-[var(--radius-input)] bg-[var(--action)] px-[var(--sp-3)] py-[var(--sp-2)]",
    "text-[length:var(--fs-sm)] font-medium text-[var(--text-on-dark)]",
    "shadow-[var(--shadow-float)]",
    "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
    "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
    className,
  )}
  {...props}
>
  {children}
  <TooltipPrimitive.Arrow className="size-2.5 rotate-45 rounded-[2px] bg-[var(--action)]" />
</TooltipPrimitive.Popup>
```

```tsx
// 04 · barra del editor — el mismo string alimenta el aria-label y el tooltip
const ETIQUETA = "Negrita"

<Tooltip>
  <TooltipTrigger
    render={
      <Button variant="fantasma" size="icono-sm" aria-label={ETIQUETA} aria-pressed={activo}>
        <Bold aria-hidden="true" />
      </Button>
    }
  />
  <TooltipContent side="bottom" aria-describedby={undefined}>
    {ETIQUETA} <kbd className="ml-[var(--sp-2)] opacity-70">⌘B</kbd>
  </TooltipContent>
</Tooltip>

// 02 · valor exacto detrás de una métrica abreviada
<Tooltip>
  <TooltipTrigger render={<span tabIndex={0} className="tabular-nums">24.8K</span>} />
  <TooltipContent>24.842 visualizaciones</TooltipContent>
</Tooltip>
```

━━━

## 7. Reglas duras

1. **Una línea, dos como máximo.** Si no cabe, no es un tooltip.
2. **Nunca información exclusiva.** Todo lo que dice existe en otro sitio.
3. **Mismo string que el `aria-label`** del disparador.
4. **Nada interactivo dentro**: ni enlaces, ni botones, ni cierre.
5. **250ms con cursor, 0ms con foco.**
6. **No aparece en táctil.**
7. **Un solo `TooltipProvider`** en la raíz de la app. Providers anidados rompen el
   comportamiento de grupo y devuelven la barra del editor a nueve tooltips independientes.
8. **Sin variantes de color.** Un tooltip rojo no es un mensaje de error; es un error de diseño.
