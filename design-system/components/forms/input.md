# Input — campo de texto

> El control base de todo formulario del producto. **Un input y un botón en la misma fila deben
> medir exactamente lo mismo**: el campo de URL con el botón «Analizar» de `07` es la prueba, y por
> eso la medida por defecto es 40px, la del botón `md`.
> Referencias: `09` (Título del sitio, Dirección del sitio, Nombre, Correo electrónico), `04`
> (título de la entrada, enlace permanente), `07` (URL a analizar), `06` (nombre de categoría).

Ruta destino: `components/ui/input.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/input.tsx` ya envuelve `Input` de `@base-ui/react/input`. **Se conserva.** Cambios:

1. `h-8` → 40px (`md`), con `sm` de 32px como variante.
2. `rounded-lg` → `--radius-input` (8px).
3. `border-input` → `--border-hairline`; `bg-transparent` → `--surface`. Un input transparente sobre
   una tarjeta blanca solo se distingue por el borde; sobre el papel `--bg-page` se vería hundido y
   sobre `--surface-sunken` desaparecería.
4. `focus-visible:ring-3 ring-ring/50` → `--focus-ring` + borde a `--border-strong` (§3).
5. `text-base md:text-sm` → `--fs-body` fijo. 14px ya evita el zoom automático de iOS (el umbral es
   16px solo por debajo de él; 14px con `font-size: 16px` en móvil es el ajuste, ver §5).
6. `placeholder:text-muted-foreground` → `--text-secondary` (§4, y la razón está en §5).
7. `aria-invalid:*` → borde `--danger` + anillo rojo derivado (§3).

Alias implicados: `--input`/`--border` → `--border-hairline`, `--ring` → `--accent`,
`--muted-foreground` → `--text-secondary`. Ver `core/button.md` §0 y la colisión de `--accent`.

━━━

## 1. Anatomía

```
   ┌────────────────────────────────────────────────┐
   │  🔗   https://miblog.cuaderno.com        .com  │
   └────────────────────────────────────────────────┘
       │              │                        │
       1              2                        3
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Adorno inicial** *(opcional)* | Icono lucide 16px en `--text-tertiary`, o texto fijo (`https://`). Va dentro de la caja, con `padding-left: var(--sp-3)`. Se compone con `input-group.tsx`; **no se simula con `background-image`**. |
| 2 | **Campo** | `--fs-body` (14px), `--text-primary`. Padding `0 var(--sp-3)`. `width: 100%` salvo que el formulario diga otra cosa. |
| 3 | **Adorno final** *(opcional)* | Sufijo fijo (`.com`, `min`), contador de caracteres, `icon-button` de acción (limpiar, mostrar contraseña), o el `⌘K` del buscador. |

**Caja**: alto 40px (`md`) / 32px (`sm`), fondo `--surface`, borde 1px `--border-hairline`,
`border-radius: var(--radius-input)`, `transition` de `border-color` y `box-shadow` en `--dur-fast`.

**Nunca dos alturas distintas en el mismo formulario.** `sm` es para toolbars y filas de tabla
editables; un formulario de ajustes usa `md` en todos sus campos.

━━━

## 2. Variantes y props

| Prop | Tipo | Por defecto | Efecto |
|---|---|---|---|
| `size` | `sm \| md` | `md` | 32 / 40 px |
| `type` | nativo | `text` | `email`, `url`, `password`, `number`, `tel`, `date`. **El `type` correcto es lo que hace aparecer el teclado correcto en móvil**: escribir un email con `type="text"` es un error funcional, no de estilo. |
| `invalido` | `boolean` | `false` | Pinta `aria-invalid="true"` y el estado de error de §3. |
| `deshabilitado` | `boolean` | `false` | |
| `soloLectura` | `boolean` | `false` | Distinto de deshabilitado: ver §3. |
| `adornoInicio` / `adornoFin` | `ReactNode` | — | Se resuelven con `InputGroupAddon`. |

**Numérico**: todo input que contenga una cifra comparable lleva
`font-variant-numeric: tabular-nums` (`inputMode="numeric"` cuando corresponde). Es la misma regla
que rige las métricas y las tablas.

**Ancho**: los campos no se dimensionan «a ojo». En una grilla de dos columnas
(`09`) cada campo ocupa su celda entera; los campos cortos de verdad (código postal, número de
entradas por página) usan un `select` o un input de ancho fijo declarado en `ch`, no en px.

━━━

## 3. Estados

| Estado | Borde | Fondo | Texto | Extra |
|---|---|---|---|---|
| **Reposo** | `--border-hairline` | `--surface` | `--text-primary` | |
| **Hover** | `--border-strong` | `--surface` | | Solo el borde. Sin cambio de fondo. |
| **Foco** | `--border-strong` | `--surface` | | `box-shadow: var(--focus-ring)`, `outline: none` |
| **Con contenido** | `--border-hairline` | | `--text-primary` | Igual que reposo: un campo lleno no se distingue de uno vacío por el borde, se distingue por el texto. |
| **Placeholder** | | | `--text-secondary` | Nunca contiene la etiqueta del campo (§5) |
| **Deshabilitado** | `--border-hairline` | `--surface-sunken` | `--text-tertiary` | `cursor: not-allowed`, `opacity: 1` — el fondo hundido ya comunica; bajar la opacidad encima lo vuelve ilegible |
| **Solo lectura** | `--border-hairline` | `--surface-sunken` | `--text-secondary` | **Recibe foco y se puede copiar.** Es el estado del enlace permanente de `04` antes de pulsar «Editar». `readOnly`, no `disabled` |
| **Error** | `--danger` | `--surface` | `--text-primary` | Anillo de foco rojo: `box-shadow: 0 0 0 3px color-mix(in oklab, var(--danger) 25%, transparent)`. Mensaje debajo, ver `forms/form-field.md` |
| **Éxito** | `--border-hairline` | | | **No existe un borde verde.** El verde del sistema mide rendimiento, no «este campo está bien». La confirmación de un formulario es un `toast`, no doce bordes verdes |
| **Cargando / validando** | `--border-hairline` | | | `Loader2` de 16px en el adorno final, `aria-busy="true"`. El campo sigue siendo editable |

**El anillo de foco rojo se deriva del contrato**, no de un token nuevo: `--danger` mezclado al 25%
con transparente reproduce la forma de `--focus-ring` en el canal del error.

**El foco no se roba.** Ningún campo hace `autoFocus` salvo el primero de un modal que el usuario
acaba de abrir a propósito, y el buscador de la paleta ⌘K.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Alto | 40px (`sm`: 32px) |
| Radio | `--radius-input` |
| Fondo | `--surface` (deshabilitado y solo lectura: `--surface-sunken`) |
| Borde | `--border-hairline` → `--border-strong` en hover y foco; `--danger` en error |
| Padding horizontal | `--sp-3` |
| Gap con adornos | `--sp-2` |
| Texto | `--fs-body`, `--text-primary` |
| Placeholder | `--text-secondary` |
| Texto deshabilitado | `--text-tertiary` |
| Adornos (icono, sufijo) | `--text-tertiary`; 16px, `stroke-width: 1.75` |
| Foco | `--focus-ring`; error: `color-mix(in oklab, var(--danger) 25%, transparent)` |
| Duración / curva | `--dur-fast` / `--ease-out` |
| Sombra | **ninguna** |

**Modo oscuro**: sin reglas propias. `--surface` oscuro sobre `--bg-page` oscuro se distingue por el
hairline, que en oscuro sube a `#26262A`; por eso el input **no** puede quedarse en `transparent`.

━━━

## 5. Accesibilidad

- **Todo input tiene `<label>`.** Sin excepción y sin `placeholder` haciendo de etiqueta: el
  placeholder desaparece al escribir y con él la única pista de qué se estaba llenando. Es el error
  de accesibilidad más frecuente y el más caro en un formulario largo como el de `09`. Se compone
  con `forms/form-field.md`.
- **`id` ↔ `htmlFor`** reales. Un label que envuelve al input también vale; un `aria-label` solo se
  acepta cuando la etiqueta visible es imposible (el buscador del topbar, que ya lleva icono y
  atajo).
- **Placeholder en `--text-secondary`, no en `--text-tertiary`.** `--text-tertiary` sobre `--surface`
  da ≈2.6:1 y **falla AA**. El contrato reserva el terciario para metadatos que duplican
  información; un placeholder es texto que hay que poder leer. Las pantallas lo confirman: el
  «Buscar...» de `02` está en el rango del secundario.
- **Zoom de iOS**: Safari hace zoom al enfocar un input con `font-size` menor a 16px. La solución no
  es subir el texto del sistema a 16px, sino declarar `@media (max-width: 640px) { input { font-size:
  16px } }` para inputs, textareas y selects. El resto del producto se queda en la escala.
- **Errores enlazados**: `aria-invalid="true"` + `aria-describedby` apuntando al mensaje. El mensaje
  vive en un contenedor con `role="alert"` (`FieldError` ya lo hace).
- **El error no aparece mientras se escribe.** Se valida al salir del campo (`blur`) o al enviar;
  después de eso sí se revalida en cada tecla, para que el usuario vea desaparecer el error mientras
  corrige.
- **`autocomplete` correcto**: `name`, `email`, `url`, `organization`, `new-password`. Es
  accesibilidad (WCAG 1.3.5) además de comodidad.
- **Zona táctil**: 40px queda por debajo de `--touch-target`; en móvil los campos suben a 44px con
  `@media (pointer: coarse)`. Es el único control del sistema que lo hace cambiando su caja real, no
  con una zona invisible, porque el input tiene que **verse** grande para invitar a tocarlo.
- **`readOnly` en vez de `disabled`** siempre que el valor deba poder leerse o copiarse. Un campo
  `disabled` no recibe foco y su contenido es invisible para el lector de pantalla.
- **Contraste**: `--text-primary` sobre `--surface` ≈ 19:1; borde `--border-hairline` sobre
  `--surface` es 1.1:1 y **no cumple 3:1 para un objeto de interfaz**. Por eso el foco no depende
  del borde: el `--focus-ring` de 3px en índigo es lo que cumple, y es obligatorio.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/input.tsx — restilado
function Input({ className, size = "md", ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      data-size={size}
      className={cn(
        "w-full min-w-0 rounded-[var(--radius-input)] border border-[var(--border-hairline)]",
        "bg-[var(--surface)] px-[var(--sp-3)] text-[length:var(--fs-body)] text-[var(--text-primary)]",
        "outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "placeholder:text-[var(--text-secondary)]",
        "data-[size=md]:h-10 data-[size=sm]:h-8",
        "hover:border-[var(--border-strong)]",
        "focus-visible:border-[var(--border-strong)] focus-visible:shadow-[var(--focus-ring)]",
        "read-only:bg-[var(--surface-sunken)] read-only:text-[var(--text-secondary)]",
        "disabled:cursor-not-allowed disabled:bg-[var(--surface-sunken)] disabled:text-[var(--text-tertiary)]",
        "aria-invalid:border-[var(--danger)]",
        "aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--danger)_25%,transparent)]",
        "max-sm:text-[16px]", // evita el zoom de iOS sin tocar la escala del sistema
        className,
      )}
      {...props}
    />
  )
}
```

```tsx
// 09 · campo simple dentro de la grilla de dos columnas de Ajustes
<Field>
  <FieldLabel htmlFor="titulo-sitio">Título del sitio</FieldLabel>
  <Input id="titulo-sitio" name="titulo" defaultValue="Mi blog" autoComplete="organization" />
</Field>

// 09 · campo con error enlazado
<Field data-invalid>
  <FieldLabel htmlFor="correo">Correo electrónico</FieldLabel>
  <Input
    id="correo"
    type="email"
    autoComplete="email"
    aria-invalid={!!error}
    aria-describedby={error ? "correo-error" : undefined}
  />
  <FieldError id="correo-error">{error}</FieldError>
</Field>

// 04 · enlace permanente en solo lectura, copiable, con botón «Editar» al lado
<InputGroup>
  <InputGroupInput readOnly value={enlace} aria-label="Enlace permanente" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton onClick={editarEnlace}>Editar</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

━━━

## 7. Reglas duras

1. **Etiqueta visible siempre.** El placeholder no es una etiqueta.
2. **Placeholder en `--text-secondary`.** El terciario falla AA.
3. **40px por defecto**, la misma medida que un botón `md`. Una fila con un campo de 36px y un botón
   de 40px está mal alineada y se nota.
4. **Fondo `--surface`, nunca transparente.**
5. **Sin borde verde de éxito.** El verde mide rendimiento.
6. **`readOnly` ≠ `disabled`.** Si hay que poder copiarlo, es `readOnly`.
7. **`type` y `autocomplete` correctos**: es funcionalidad, no metadatos.
8. **El error se enlaza con `aria-describedby`** y no aparece mientras se escribe por primera vez.
