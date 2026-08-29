# Radio — opción exclusiva

> Elegir **exactamente una** opción de un conjunto pequeño y visible. Si las opciones no caben a la
> vista o son más de siete, el control correcto es un `select`.
> Referencia directa: `09` → Lectura → «Tu página de inicio muestra»: *Tus últimas entradas* /
> *Una página estática*. También el formato de entrada por defecto y las opciones de privacidad.

Ruta destino: `components/ui/radio.tsx` + `components/ui/radio-group.tsx` — **no existen**.

━━━

## 0. Adopción (añadir el primitivo que falta)

Es el único control de formulario del sistema que no está en `components/ui/`. **No se escribe a
mano**: `@base-ui/react` ya incluye `Radio` y `RadioGroup` (el mismo paquete que ya usan checkbox,
switch y select), y `field.tsx` ya contempla `[data-slot=radio-group]` en su CSS — la casa está
construida, falta el mueble.

1. Añadir `components/ui/radio-group.tsx` y `components/ui/radio.tsx` envolviendo
   `RadioGroup` y `Radio` de `@base-ui/react/radio-group` con el estilo de §1.
2. Copiar de `checkbox.tsx` la zona táctil ampliada y el patrón de foco: los dos controles tienen
   que sentirse iguales al dedo.
3. **No usar `DropdownMenuRadioItem` para esto**: ese es el radio *dentro de un menú* y ya existe.

━━━

## 1. Anatomía

```
   ◉  Tus últimas entradas          1 · círculo de 18px
   ○  Una página estática           2 · punto interior de 8px
                                    3 · etiqueta, gap --sp-3
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Círculo** | 18×18px, `border-radius: var(--radius-pill)`, borde 1.5px `--border-hairline`, fondo `--surface`. Mismo diámetro que la caja del checkbox: **la forma es lo único que los distingue**, y por eso el radio es siempre redondo y el checkbox siempre cuadrado. Invertirlos rompe una convención de 40 años. |
| 2 | **Punto** | 8px, `--accent`, centrado. Aparece de golpe; sin animación de escala. |
| 3 | **Etiqueta** | `--fs-body`, `--text-primary`, gap `var(--sp-3)`, toda ella zona de clic. |
| 4 | **Descripción** *(opcional)* | `--fs-sm`, `--text-secondary`, debajo de la etiqueta, alineada con ella (no con el círculo). Cuando existe, el círculo se alinea arriba (`align-items: start`). |

**Etiqueta en índigo cuando está seleccionada** *(opcional, y es lo que hace `09`)*: la etiqueta de
la opción activa pasa a `--accent` con peso 500. Es coherente —marca dónde estás— pero **si se
activa, se activa en todos los grupos de radio del producto**. Un formulario con dos grupos que se
comportan distinto se lee como un bug.

**Un solo tamaño**, igual que el checkbox.

━━━

## 2. Variantes

| `variant` | Aspecto | Cuándo |
|---|---|---|
| `lista` *(por defecto)* | Círculo + etiqueta en una fila | `09` y el 95% de los casos |
| `tarjeta` | Cada opción es una tarjeta con borde `--border-hairline`, `--radius-control`, padding `--sp-4`; seleccionada: borde `--accent-border` y fondo `--accent-tint` | Elecciones con peso visual: plantilla del blog, plan de suscripción. `field.tsx` ya tiene el CSS de `has-data-checked` para esto |

| Prop | Tipo | Por defecto |
|---|---|---|
| `orientacion` | `vertical \| horizontal` | `vertical` |
| `variant` | `lista \| tarjeta` | `lista` |
| `deshabilitado` | `boolean` | `false` |

**`vertical` por defecto, y casi siempre.** Un grupo horizontal solo funciona con 2 o 3 etiquetas de
una palabra; con etiquetas largas obliga a leer en zigzag y se rompe al traducir al español, que es
un 20% más largo que el inglés.

━━━

## 3. Estados

| Estado | Círculo | Punto |
|---|---|---|
| **Sin seleccionar** | Borde 1.5px `--border-hairline`, fondo `--surface` | — |
| **Sin seleccionar · hover** | Borde `--border-strong`, fondo `--surface-sunken` | — |
| **Seleccionado** | Borde 1.5px `--accent`, fondo `--surface` | Punto 8px `--accent` |
| **Seleccionado · hover** | Borde `--accent-hover` | Punto `--accent-hover` |
| **Foco** | `box-shadow: var(--focus-ring)`, `outline: none` | |
| **Deshabilitado** | Fondo `--surface-sunken`, borde `--border-hairline`, etiqueta `--text-tertiary` | Si estaba seleccionado, el punto queda en `--text-tertiary`: se sigue viendo cuál era la opción |
| **Error** (grupo obligatorio sin elegir) | Borde `--danger` en **todos** los círculos del grupo | El mensaje va bajo el grupo, no bajo una opción |

**El radio no se puede desmarcar.** Una vez elegida una opción, solo se cambia por otra. Si el
usuario tiene que poder volver a «ninguna», falta una opción explícita llamada «Ninguna» — un radio
que se apaga al volver a pulsarlo confunde a todo el mundo.

**El fondo del círculo seleccionado se queda en `--surface`**, no se rellena de índigo: el anillo
más el punto ya lo comunican, y un círculo relleno se confundiría con un checkbox redondo.

Transición: `border-color` y `background-color`, `--dur-fast`. El punto no escala.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Círculo | 18×18px, `--radius-pill` |
| Borde sin seleccionar | `--border-hairline` (1.5px) → `--border-strong` en hover |
| Fondo | `--surface` → `--surface-sunken` en hover; deshabilitado `--surface-sunken` |
| Borde seleccionado | `--accent` → `--accent-hover` |
| Punto | `--accent`, 8px |
| Etiqueta | `--fs-body`, `--text-primary`; seleccionada (opcional) `--accent` peso 500 |
| Descripción | `--fs-sm`, `--text-secondary` |
| Gap círculo–etiqueta | `--sp-3` |
| Gap entre opciones | `--sp-3` (`lista`) · `--sp-2` (`tarjeta`) |
| Tarjeta seleccionada | borde `--accent-border`, fondo `--accent-tint`, `--radius-control` |
| Error | `--danger` |
| Foco | `--focus-ring` |
| Zona táctil | `--touch-target` vía `::after` |
| Duración / curva | `--dur-fast` / `--ease-out` |

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **El grupo es la unidad, no la opción.** `RadioGroup` de Base UI pone `role="radiogroup"` y
  `aria-labelledby`; el grupo va dentro de un `<fieldset>` con `<legend>` («Tu página de inicio
  muestra»). Sin leyenda, un lector de pantalla anuncia dos opciones sin decir de qué pregunta son.
- **Una sola parada de tabulación por grupo.** `Tab` entra en la opción seleccionada (o en la
  primera si no hay ninguna) y **sale del grupo**; dentro se navega con las flechas, que además
  seleccionan al moverse. Es distinto del checkbox a propósito, y Base UI ya lo implementa: **no se
  toca**.
- **Nunca hay un grupo sin selección inicial** en una configuración que ya tiene un valor efectivo.
  `09` muestra «Tus últimas entradas» ya marcado porque es lo que el blog está haciendo ahora.
  Presentar dos opciones vacías obliga a adivinar cuál está activa.
- **La etiqueta es zona de clic** y la descripción también, si existe.
- **Zona táctil de 44px** por `::after`, con gap mínimo `--sp-3` entre opciones.
- **El color no es el único canal**: seleccionado se distingue por el **punto**, no por el índigo.
- **Contraste**: `--accent` sobre `--surface` ≈ 4.6:1 para el punto (objeto gráfico, mínimo 3:1).
  El círculo vacío tiene el mismo problema de borde que el checkbox y la misma respuesta (ver
  `forms/checkbox.md` §5).
- **`variant="tarjeta"`**: la tarjeta entera es el `<label>`; el círculo sigue existiendo y sigue
  siendo visible. Una tarjeta que solo cambia de borde al elegirse, sin control visible, es
  ilegible en alto contraste y en escala de grises.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/radio-group.tsx — el primitivo que falta, envuelto igual que checkbox
"use client"
import { RadioGroup as RadioGroupPrimitive, Radio as RadioPrimitive } from "@base-ui/react/radio-group"
import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("flex flex-col gap-[var(--sp-3)]", className)}
      {...props}
    />
  )
}

function Radio({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(
        "relative flex size-[18px] shrink-0 items-center justify-center",
        "rounded-[var(--radius-pill)] border-[1.5px] border-[var(--border-hairline)]",
        "bg-[var(--surface)] outline-none",
        "transition-[border-color,background-color,box-shadow]",
        "duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "after:absolute after:-inset-x-3 after:-inset-y-[13px]",   // zona táctil de 44px
        "hover:border-[var(--border-strong)] hover:bg-[var(--surface-sunken)]",
        "focus-visible:shadow-[var(--focus-ring)]",
        "data-checked:border-[var(--accent)] data-checked:hover:border-[var(--accent-hover)]",
        "data-disabled:cursor-not-allowed data-disabled:bg-[var(--surface-sunken)]",
        "aria-invalid:border-[var(--danger)]",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        className="size-2 rounded-[var(--radius-pill)] bg-[var(--accent)]
                   data-disabled:bg-[var(--text-tertiary)]"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, Radio }
```

```tsx
// 09 · Lectura → «Tu página de inicio muestra»
<FieldSet>
  <FieldLegend variant="label">Tu página de inicio muestra</FieldLegend>
  <RadioGroup value={inicio} onValueChange={setInicio}>
    <Field orientation="horizontal">
      <Radio id="inicio-entradas" value="entradas" />
      <FieldLabel htmlFor="inicio-entradas">Tus últimas entradas</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <Radio id="inicio-pagina" value="pagina" />
      <FieldContent>
        <FieldLabel htmlFor="inicio-pagina">Una página estática</FieldLabel>
        <FieldDescription>Elegí cuál de tus páginas se muestra al entrar al blog.</FieldDescription>
      </FieldContent>
    </Field>
  </RadioGroup>
</FieldSet>
```

━━━

## 7. Reglas duras

1. **Redondo siempre.** Cuadrado es checkbox. La forma es lo que distingue «una» de «varias».
2. **Punto índigo, círculo sin rellenar.**
3. **Una sola parada de tabulación por grupo**, flechas para moverse dentro. No se reimplementa.
4. **`<fieldset>` + `<legend>` obligatorios.**
5. **Nunca un grupo sin selección inicial** cuando ya hay un valor efectivo.
6. **No se puede desmarcar.** Si hace falta «ninguna», es una opción más.
7. **Vertical por defecto.**
8. **≥8 opciones → `select`.** Este control existe para que se vean todas a la vez.
