# Checkbox — casilla

> Elegir cero, una o varias cosas de una lista. Aparece en `04` (Categorías de la entrada, en el
> sidebar de publicación), `09` (opciones de notificaciones y privacidad), `03` y `05` (selección
> múltiple de filas para acciones en lote) y en los `CheckboxItem` de un `dropdown-menu`.

Ruta destino: `components/ui/checkbox.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/checkbox.tsx` ya envuelve `Checkbox` de `@base-ui/react/checkbox` con `Root` +
`Indicator` y trae la zona táctil ampliada (`after:-inset-x-3 after:-inset-y-2`), que es correcta y
**se conserva**. Cambios:

1. `size-4` (16px) → **18px** (§1).
2. `rounded-[4px]` → **5px** (§4, con su justificación).
3. `border-input` → `--border-hairline`, con grosor **1.5px** en reposo.
4. `data-checked:bg-primary` (que sería negro con el puente de tokens) → **`--accent`**. Ver §2 — es
   la decisión de color más importante de este archivo.
5. `focus-visible:ring-3 ring-ring/50` → `--focus-ring`.
6. Añadir el estado **indeterminado** (§3), que el archivo actual no contempla y que la selección
   múltiple de `03` necesita.

━━━

## 1. Anatomía

```
   ┌───┐
   │ ✓ │  Inteligencia Artificial          1 · caja de 18px
   └───┘                                   2 · check de 12px
     │                                     3 · etiqueta, gap --sp-3
     1
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Caja** | 18×18px, `border-radius: 5px`, borde 1.5px `--border-hairline`, fondo `--surface`. Nunca cambia de tamaño entre estados: el borde de 1.5px se conserva al marcar, solo cambia de color. |
| 2 | **Indicador** | `Check` de lucide, 12px, `stroke-width: 3`, color `--text-on-dark`. Aparece **sin transición de dibujo**: la casilla se marca de golpe. |
| 3 | **Etiqueta** | `--fs-body`, `--text-primary`, gap `var(--sp-3)`. **Toda la etiqueta es zona de clic** (va dentro del `<label>`). Alineada al centro de la caja en etiquetas de una línea, y al inicio (`align-items: start` con `margin-top: 1px` en la caja) cuando hay dos líneas o texto de ayuda debajo. |

**Un solo tamaño.** No hay `sm` ni `lg`: una casilla de 14px es imposible de acertar y una de 24px
domina la fila. 18px es la medida de `04` y funciona igual en un sidebar de 260px y en una tabla.

━━━

## 2. Por qué el marcado es índigo y no negro

Es la pregunta que va a hacer todo el que lea la ley de color, así que queda contestada acá:

- **El negro es la acción que compromete**: «Publicar», «Guardar cambios», «Analizar». Un botón
  negro cambia el estado del mundo cuando se pulsa.
- **Marcar una casilla no compromete nada.** Es fijar un valor que todavía no se ha enviado; el
  compromiso llega después, con el botón negro. Un checkbox negro tendría el mismo peso visual que
  el CTA de la pantalla y competiría con él.
- **Las pantallas lo confirman**: en `04` la categoría marcada es índigo (`#4F46E5` medido) y el
  botón «Publicar» es negro, a diez centímetros uno del otro. Lo mismo hace el radio de `09`.
- La familia entera —checkbox, radio, switch, chip de filtro, indicador de select, item activo del
  sidebar— comparte el índigo porque todos **fijan o marcan un estado**. Que uno de ellos fuera
  negro haría el formulario incoherente.

━━━

## 3. Estados

| Estado | Caja | Indicador |
|---|---|---|
| **Sin marcar** | Borde 1.5px `--border-hairline`, fondo `--surface` | — |
| **Sin marcar · hover** | Borde `--border-strong`, fondo `--surface-sunken` | — |
| **Marcado** | Fondo `--accent`, borde `--accent` | `Check` blanco |
| **Marcado · hover** | Fondo `--accent-hover`, borde `--accent-hover` | |
| **Indeterminado** | Fondo `--accent`, borde `--accent` | Guion horizontal de 10×2px, `--text-on-dark`, `border-radius: 1px` |
| **Foco** | `box-shadow: var(--focus-ring)`, `outline: none` — en **los tres** estados de marcado | |
| **Deshabilitado · sin marcar** | Fondo `--surface-sunken`, borde `--border-hairline`, etiqueta `--text-tertiary` | — |
| **Deshabilitado · marcado** | Fondo `--neutral-tint`, borde `--border-hairline`, check en `--text-tertiary` | Se sigue viendo que está marcado: un deshabilitado marcado que parece vacío es información perdida |
| **Error** | Borde `--danger` cuando está sin marcar y es obligatorio (aceptar términos) | El mensaje va debajo del grupo, no de cada casilla |
| **Cargando** | La casilla se deshabilita y el grupo entero muestra `aria-busy` | Nunca un spinner dentro de la caja de 18px |

**Indeterminado** es el estado de la casilla de cabecera de una tabla cuando hay algunas filas
seleccionadas y otras no (`03`, `05`). Es un estado real de la propiedad DOM (`indeterminate`), no
un tercer valor del dato: el ciclo al pulsar es *indeterminado → todas marcadas → ninguna marcada*.

Transición: solo `background-color` y `border-color`, `--dur-fast`. **El check no se anima.**

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Caja | 18×18px |
| Radio | **5px** — ver la nota de abajo |
| Borde sin marcar | `--border-hairline` (1.5px) → `--border-strong` en hover |
| Fondo sin marcar | `--surface` → `--surface-sunken` en hover |
| Fondo marcado | `--accent` → `--accent-hover` en hover |
| Indicador | `--text-on-dark`, `Check` 12px `stroke-width: 3` |
| Etiqueta | `--fs-body`, `--text-primary` |
| Gap caja–etiqueta | `--sp-3` |
| Gap entre casillas de un grupo | `--sp-3` |
| Deshabilitado | fondo `--surface-sunken` / `--neutral-tint`, texto `--text-tertiary` |
| Error | borde `--danger` |
| Foco | `--focus-ring` |
| Zona táctil | `--touch-target` vía `::after { inset: -13px -12px }` |
| Duración / curva | `--dur-fast` / `--ease-out` |

> **Nota sobre el radio — el único valor del sistema que no sale de la escala.** El contrato tiene
> `--radius-input: 8px` como escalón más pequeño, y 8px sobre una caja de 18px la convierte casi en
> un círculo: se confunde con un radio, que es exactamente la distinción que el usuario necesita
> hacer de un vistazo. Las pantallas muestran ≈5px. Se documenta acá como valor literal y **queda
> propuesto al dueño de los tokens** como futuro `--radius-check`; hasta entonces, 5px y solo en
> este componente.

**Modo oscuro**: sin reglas propias. `--accent` sube a `#818CF8` en oscuro, y el check blanco sigue
cumpliendo contraste sobre él.

━━━

## 5. Accesibilidad

- **`<input type="checkbox">` real** por debajo (Base UI lo garantiza). Un `<div role="checkbox">`
  hecho a mano se rompe con el autocompletado, con el envío nativo del formulario y con las
  extensiones de accesibilidad.
- **La etiqueta es parte del control.** Va dentro del `<label>` o enlazada con `htmlFor`. Nadie
  debería tener que acertarle a un cuadrado de 18px cuando hay un texto de 200px al lado.
- **Zona táctil de 44px** con `::after`, sin cambiar la caja visible. En un grupo, el gap mínimo
  entre casillas es `--sp-3` (12px) para que las zonas no se solapen.
- **Un grupo es un `<fieldset>` con `<legend>`.** «Categorías» en `04` no es un texto suelto encima
  de cuatro casillas: es la leyenda del grupo, y sin ella el lector de pantalla anuncia cuatro
  casillas huérfanas. `FieldSet` + `FieldLegend` de `field.tsx` ya lo resuelven.
- **Indeterminado se anuncia solo** si se usa la propiedad DOM `indeterminate` o
  `aria-checked="mixed"`. Un guion dibujado con CSS no comunica nada.
- **El color no es el único canal**: marcado se distingue por el **check**, no por el índigo. En
  escala de grises la casilla marcada sigue siendo obvia.
- **Nunca `disabled` para «no disponible todavía»** sin explicación. Si una categoría no se puede
  elegir, hay un texto que dice por qué.
- **Contraste**: `--text-on-dark` sobre `--accent` ≈ 4.9:1 para el check (objeto gráfico, mínimo
  3:1: sobra). El borde sin marcar (`--border-hairline` sobre `--surface`, 1.1:1) **no cumple 3:1**
  — por eso la casilla vacía se apoya en el `--focus-ring` para el teclado y en el hover a
  `--border-strong` para el ratón. Si esto llegara a ser un bloqueo de auditoría, el arreglo es
  subir el borde en reposo a `--border-strong`, no bajar el resto.
- **Teclado**: `Espacio` alterna. `Tab` entra y sale del grupo casilla por casilla (a diferencia del
  radio, donde el grupo es una sola parada).

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/checkbox.tsx — restilado, con estado indeterminado
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[18px] shrink-0 items-center justify-center rounded-[5px]",
        "border-[1.5px] border-[var(--border-hairline)] bg-[var(--surface)] outline-none",
        "transition-[background-color,border-color,box-shadow]",
        "duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "after:absolute after:-inset-x-3 after:-inset-y-[13px]",   // zona táctil de 44px
        "hover:border-[var(--border-strong)] hover:bg-[var(--surface-sunken)]",
        "focus-visible:shadow-[var(--focus-ring)]",
        "data-checked:border-[var(--accent)] data-checked:bg-[var(--accent)]",
        "data-checked:hover:border-[var(--accent-hover)] data-checked:hover:bg-[var(--accent-hover)]",
        "data-indeterminate:border-[var(--accent)] data-indeterminate:bg-[var(--accent)]",
        "data-disabled:cursor-not-allowed data-disabled:border-[var(--border-hairline)]",
        "data-disabled:bg-[var(--surface-sunken)]",
        "data-disabled:data-checked:bg-[var(--neutral-tint)]",
        "aria-invalid:border-[var(--danger)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-[var(--text-on-dark)]"
        render={(p, state) => (
          <span {...p}>
            {state.indeterminate ? (
              <span aria-hidden="true" className="block h-0.5 w-2.5 rounded-[1px] bg-current" />
            ) : (
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}
```

```tsx
// 04 · Categorías de la entrada — grupo con leyenda real
<FieldSet>
  <FieldLegend variant="label">Categorías</FieldLegend>
  <FieldGroup>
    {categorias.map((c) => (
      <Field key={c.id} orientation="horizontal">
        <Checkbox
          id={`cat-${c.id}`}
          checked={seleccionadas.includes(c.id)}
          onCheckedChange={(v) => alternar(c.id, v)}
        />
        <FieldLabel htmlFor={`cat-${c.id}`}>{c.nombre}</FieldLabel>
      </Field>
    ))}
  </FieldGroup>
  <Button variant="enlace" icono={Plus}>Añadir nueva categoría</Button>
</FieldSet>

// 03 · casilla de cabecera de la tabla, con estado mixto
<Checkbox
  aria-label="Seleccionar todas las entradas"
  checked={todasMarcadas}
  indeterminate={algunasMarcadas && !todasMarcadas}
  onCheckedChange={alternarTodas}
/>
```

━━━

## 7. Reglas duras

1. **Marcado en índigo, nunca en negro.** Fijar un valor no es ejecutar una acción.
2. **18px, radio 5px, borde 1.5px.** Un solo tamaño en todo el producto.
3. **La etiqueta es zona de clic.**
4. **44px de zona táctil** vía `::after`.
5. **El grupo es un `<fieldset>` con `<legend>`.**
6. **Indeterminado es un estado real**, no un icono decorativo.
7. **El check no se anima.**
8. **Deshabilitado y marcado se sigue viendo marcado.**
