# Form Field — campo de formulario (etiqueta + ayuda + error)

> El envoltorio que convierte un control suelto en un campo usable: **etiqueta, control, ayuda y
> error**, enlazados entre sí. Es el componente que hace que la accesibilidad del formulario sea el
> camino por defecto en vez de una tarea aparte.
> Referencias: `09` (la pantalla de Ajustes entera: Información del sitio, Usuario, Lectura,
> Publicación), `04` (sidebar de publicación), `06` (alta de categoría), `07` (URL a analizar).

Ruta destino: `components/ui/field.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/field.tsx` ya trae las diez piezas necesarias — `FieldSet`, `FieldLegend`,
`FieldGroup`, `Field`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`,
`FieldSeparator` y `FieldError` (que ya renderiza `role="alert"` y sabe agrupar varios errores en una
lista). **Es la mejor pieza del `components/ui/` actual y se conserva entera.** Cambios:

1. `FieldLabel`: `text-sm` → `--fs-sm` peso **500**, color `--text-primary` (§1).
2. `FieldDescription`: `text-muted-foreground` → `--text-secondary`, `--fs-sm`.
3. `FieldError`: `text-destructive` → `--danger`, `--fs-sm` peso 500, con icono (§1).
4. `fieldVariants`: `gap-2` → `var(--sp-2)`; `FieldGroup` `gap-5` → `var(--sp-5)`;
   `FieldSet` `gap-4` → `var(--sp-4)`.
5. `FieldLabel` con `has-data-checked:border-primary/30 bg-primary/5` (la variante «tarjeta» de
   radio/checkbox) → `--accent-border` / `--accent-tint`.
6. `FieldLegend`: `data-[variant=legend]:text-base` → `--fs-h3` peso 600.

Alias implicados: `--destructive` → `--danger`, `--muted-foreground` → `--text-secondary`,
`--primary` → `--action`. Ver `core/button.md` §0.

━━━

## 1. Anatomía

```
   Título del sitio                          ← 1 · FieldLabel
   ┌──────────────────────────────────────┐
   │  Mi blog                             │  ← 2 · el control
   └──────────────────────────────────────┘
   Aparece en la pestaña del navegador.       ← 3 · FieldDescription
   ⚠ El título no puede estar vacío.          ← 4 · FieldError
```

| # | Parte | Regla |
|---|---|---|
| 1 | **FieldLabel** | `--fs-sm` (13px), peso 500, `--text-primary`. **Siempre visible y siempre encima del control** (o a la izquierda en `orientation="horizontal"`). Sentence case, sin dos puntos finales. Los campos obligatorios **no** se marcan con asterisco: se marcan los **opcionales** con «(opcional)» en `--text-tertiary`, porque en un formulario donde casi todo es obligatorio el asterisco se convierte en ruido. |
| 2 | **Control** | `input`, `textarea`, `select`, grupo de `checkbox`/`radio`, `switch`, `file-input`. Ocupa el ancho de su celda. |
| 3 | **FieldDescription** | `--fs-sm`, `--text-secondary`. **Antes del error, no después.** Explica qué se espera («Recomendado: 150–160 caracteres»). Va enlazada con `aria-describedby`, no suelta debajo. |
| 4 | **FieldError** | `--fs-sm`, peso 500, `--danger`, con `AlertCircle` de 14px a la izquierda. Aparece **debajo** de la descripción y no la reemplaza: el usuario necesita las dos cosas a la vez, el error y la regla que no cumplió. |

**Ritmo vertical**: `--sp-2` entre etiqueta y control, `--sp-2` entre control y ayuda, `--sp-1` entre
ayuda y error. Entre campos hermanos, `--sp-5`. Entre grupos (`FieldSet`), `--sp-8`.

**Grilla**: `09` usa dos columnas (`repeat(2, minmax(0, 1fr))`, gap `--sp-5`) y baja a una a ≤900px.
Un campo puede ocupar las dos columnas (`grid-column: 1 / -1`) cuando su contenido lo pide —la
descripción del sitio, por ejemplo—, pero **nunca por estética**: si un campo ocupa dos columnas es
porque su contenido es largo.

━━━

## 2. Variantes

### 2.1 `orientation` (ya existe en `fieldVariants`)

| Valor | Disposición | Cuándo |
|---|---|---|
| `vertical` *(por defecto)* | Etiqueta encima del control | Todo formulario de datos: `09`, `06`, `04` |
| `horizontal` | Etiqueta (y descripción) a la izquierda, control a la derecha | Filas de ajuste con `switch` o `checkbox`; el control va pegado al borde derecho con `justify-content: space-between` |
| `responsive` | `vertical` en estrecho, `horizontal` a partir de `@md` | Formularios que viven tanto en el panel ancho como en el sidebar de 260px de `04` |

### 2.2 Contenedores

| Pieza | Para qué |
|---|---|
| `FieldSet` + `FieldLegend` | Un grupo semántico de campos: «Categorías» (`04`), «Tu página de inicio muestra» (`09`). **Obligatorio** alrededor de todo grupo de `checkbox` o `radio`. |
| `FieldGroup` | Agrupación puramente visual con el ritmo del sistema. No aporta semántica. |
| `FieldSeparator` | Divisor entre bloques de un formulario largo. Ver `core/divider.md`. |
| `FieldContent` | Envuelve etiqueta + descripción cuando el control va al lado (orientación horizontal). |

### 2.3 Estructura de una pantalla de ajustes (`09`)

```
Card
 └ CardHeader: título de sección + CardAction («Guardar cambios», Button primario)
 └ CardContent
    └ FieldGroup (grilla de 2 columnas)
       ├ Field · vertical
       ├ Field · vertical
       └ Field · vertical (2 columnas)
```

El **CTA negro vive en la cabecera de la tarjeta de sección**, no al final de la página: `09` tiene
cinco secciones y un botón por sección, cada uno guardando lo suyo. Un único «Guardar» al fondo de un
formulario de cinco bloques obliga a recordar qué se tocó.

━━━

## 3. Estados

Los estados los pinta el control; el campo los **coordina**:

| Estado | Qué hace el campo |
|---|---|
| **Reposo** | Etiqueta, control, descripción. |
| **Foco dentro** | El campo no cambia. El foco es del control (`--focus-ring`). Un contenedor que se ilumina entero al enfocar duplica la señal y ensucia el formulario. |
| **Inválido** | `data-invalid` en el `Field`. La etiqueta **no se pinta de rojo** — se pierde legibilidad y se pierde jerarquía; lo rojo es el borde del control y el mensaje. |
| **Deshabilitado** | `data-disabled` en el `Field`: etiqueta y descripción a `--text-tertiary`. `field.tsx` ya propaga esto con `group-data-[disabled=true]`. |
| **Solo lectura** | Solo cambia el control. La etiqueta se mantiene igual: el campo sigue siendo un campo. |
| **Guardando** | El botón de la sección entra en `cargando` y los controles de esa sección se deshabilitan. **No** se deshabilita el formulario entero. |
| **Guardado** | `toast` de confirmación. Sin bordes verdes ni checks en cada campo (ver `forms/input.md` §3). |
| **Error del servidor** | `alert` `destructivo` al inicio de la sección, con el foco movido a él, **más** el error en cada campo afectado. Un mensaje general sin señalar el campo obliga a buscar. |

### Cuándo validar

1. **Nunca mientras se escribe por primera vez.** Marcar «correo inválido» en la tercera letra es
   hostil.
2. **Al salir del campo** (`blur`), si se tocó.
3. **Al enviar**, todos a la vez; el foco va al primer campo con error.
4. **Después del primer error, sí en cada tecla**: para que el mensaje desaparezca en cuanto se
   corrige.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Etiqueta | `--fs-sm`, peso 500, `--text-primary` |
| Marca «(opcional)» | `--fs-sm`, peso 400, `--text-tertiary` |
| Descripción | `--fs-sm`, `--text-secondary` |
| Error | `--fs-sm`, peso 500, `--danger`, icono `AlertCircle` 14px |
| Leyenda de `FieldSet` | `--fs-h3` (16), peso 600, `--text-primary` |
| Gap etiqueta–control | `--sp-2` |
| Gap control–ayuda | `--sp-2` |
| Gap ayuda–error | `--sp-1` |
| Gap entre campos | `--sp-5` |
| Gap entre grupos | `--sp-8` |
| Gap de grilla | `--sp-5` |
| Etiqueta deshabilitada | `--text-tertiary` |
| Tarjeta seleccionable (`has-data-checked`) | borde `--accent-border`, fondo `--accent-tint`, `--radius-control` |

**Ningún color propio.** El campo no pinta fondos ni bordes: solo tipografía y espacio. Todo lo
demás lo aporta el control que envuelve.

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

Este componente **es** la capa de accesibilidad del formulario. Todo lo de aquí abajo es obligatorio:

- **`FieldLabel` con `htmlFor` = `id` del control.** Sin excepciones. Un campo sin etiqueta enlazada
  es un campo que no se puede rellenar con lector de pantalla.
- **La descripción se enlaza con `aria-describedby`**, no se deja suelta debajo. Si hay descripción y
  error a la vez, `aria-describedby` los referencia a **los dos**, en ese orden.
- **El error va en `role="alert"`** (ya lo hace `FieldError`) para que se anuncie al aparecer, y el
  control lleva `aria-invalid="true"`.
- **El error no reemplaza a la ayuda.** Se apilan.
- **Los campos opcionales se marcan; los obligatorios no.** «(opcional)» va **dentro** del `<label>`
  para que forme parte del nombre accesible: se oye «Descripción corta, opcional».
- **Todo grupo de `checkbox`/`radio` va en `<fieldset>` con `<legend>`.** `FieldSet` +
  `FieldLegend`. Es el fallo de accesibilidad más frecuente en formularios de ajustes.
- **Al enviar con errores, el foco va al primer campo inválido** y la página hace scroll hasta él.
  Nunca se deja el foco en el botón mientras el error está 800px más arriba.
- **`autocomplete` correcto** en cada campo (WCAG 1.3.5): `name`, `email`, `url`, `organization`.
- **El orden del DOM es el orden visual.** En una grilla de dos columnas, el `tab` recorre
  izquierda→derecha, fila a fila. Reordenar con `order` de CSS rompe la navegación por teclado.
- **Zoom al 200%**: la grilla cae a una columna y ningún texto se recorta. Las etiquetas envuelven a
  dos líneas sin desalinear el control.
- **Contraste**: etiqueta `--text-primary` ≈ 19:1; descripción `--text-secondary` ≈ 4.6:1; error
  `--danger` sobre `--surface` ≈ 3.8:1 — **cumple AA solo por ir a peso 500 con icono al lado**. El
  mensaje de error nunca baja de peso 500 ni pierde su icono.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/field.tsx — las tres piezas de texto restiladas
function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-[var(--sp-2)]",
        "text-[length:var(--fs-sm)] font-medium leading-snug text-[var(--text-primary)]",
        "group-data-[disabled=true]/field:text-[var(--text-tertiary)]",
        // variante «tarjeta» de radio/checkbox
        "has-data-checked:border-[var(--accent-border)] has-data-checked:bg-[var(--accent-tint)]",
        "has-[>[data-slot=field]]:rounded-[var(--radius-control)] has-[>[data-slot=field]]:border",
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-[length:var(--fs-sm)] font-normal leading-[var(--lh-sm)]",
        "text-[var(--text-secondary)]",
        "group-data-[disabled=true]/field:text-[var(--text-tertiary)]",
        className,
      )}
      {...props}
    />
  )
}

function FieldError({ className, children, errors, ...props }) {
  const contenido = /* … la lógica actual de field.tsx se conserva tal cual … */ null
  if (!contenido) return null
  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn(
        "flex items-start gap-[var(--sp-1)] text-[length:var(--fs-sm)] font-medium text-[var(--danger)]",
        className,
      )}
      {...props}
    >
      <AlertCircle size={14} aria-hidden="true" className="mt-[2px] shrink-0" />
      <span>{contenido}</span>
    </div>
  )
}
```

```tsx
// 09 · sección «Información del sitio»: CTA en la cabecera, grilla de dos columnas
<Card>
  <CardHeader>
    <CardTitle render={<h2 />}>Información del sitio</CardTitle>
    <CardDescription>Gestiona los datos básicos de tu sitio.</CardDescription>
    <CardAction>
      <Button type="submit" form="form-sitio" cargando={guardando}>Guardar cambios</Button>
    </CardAction>
  </CardHeader>

  <CardContent>
    <form id="form-sitio" onSubmit={guardar} noValidate>
      <FieldGroup className="grid grid-cols-1 gap-[var(--sp-5)] md:grid-cols-2">
        <Field data-invalid={!!errores.titulo || undefined}>
          <FieldLabel htmlFor="titulo">Título del sitio</FieldLabel>
          <Input
            id="titulo"
            name="titulo"
            autoComplete="organization"
            aria-invalid={!!errores.titulo}
            aria-describedby="titulo-ayuda titulo-error"
          />
          <FieldDescription id="titulo-ayuda">
            Aparece en la pestaña del navegador y en los resultados de búsqueda.
          </FieldDescription>
          <FieldError id="titulo-error">{errores.titulo}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="url">Dirección del sitio (URL)</FieldLabel>
          <Input id="url" name="url" type="url" autoComplete="url" />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="descripcion">
            Descripción corta
            <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
          </FieldLabel>
          <Textarea id="descripcion" name="descripcion" />
        </Field>
      </FieldGroup>
    </form>
  </CardContent>
</Card>
```

━━━

## 7. Reglas duras

1. **Etiqueta visible y enlazada, siempre.** El placeholder no es una etiqueta.
2. **Se marcan los opcionales, no los obligatorios.**
3. **La ayuda va con `aria-describedby`**; el error también, y no la reemplaza.
4. **`<fieldset>` + `<legend>` en todo grupo de `checkbox` o `radio`.**
5. **No se valida mientras se escribe por primera vez.**
6. **Al enviar con errores, el foco va al primer campo inválido.**
7. **El CTA negro vive en la cabecera de la sección**, uno por sección.
8. **El campo no pinta colores**: solo tipografía y espacio. Los colores son del control.
