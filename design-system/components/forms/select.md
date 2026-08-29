# Select — selector de una opción

> Elige **un valor de una lista cerrada**. Ahí está la frontera con el `dropdown-menu`: el menú
> ejecuta acciones, el select fija un valor y lo muestra cuando está cerrado.
> Referencias: `09` (Idioma del sitio, Zona horaria, Entradas por página, Categoría por defecto,
> Formato de entrada), `04` (Estado, Visibilidad), `02` (Últimos 30 días), `03` y `05`
> (Más recientes), `08` (rango de fechas).

Ruta destino: `components/ui/select.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/select.tsx` ya envuelve `Select` de `@base-ui/react/select` con `Trigger`, `Value`,
`Content`, `Item`, `Group`, `GroupLabel`, `Separator` y los botones de scroll. **Se conserva
completo.** Cambios:

1. **Trigger = input.** `h-8` → 40px (`sm`: 32px), `rounded-lg` → `--radius-input`, `border-input` →
   `--border-hairline`, `bg-transparent` → `--surface`, foco → `--focus-ring`. Un select y un input
   en la misma grilla (`09`, columna izquierda input, columna derecha select) tienen que ser
   idénticos salvo por el chevron.
2. `w-fit` → `w-full` por defecto: en un formulario de dos columnas un select que se encoge al
   contenido rompe la grilla. El `w-fit` se conserva como variante `auto` para los selects de
   toolbar («Últimos 30 días»).
3. **Popup = dropdown-menu.** Mismos tokens que `core/dropdown-menu.md` §4: `--surface`,
   `--border-hairline`, `--radius-control`, `--shadow-float`, item de 36px con `--radius-input`.
4. `SelectItem`: `focus:bg-accent` → `--surface-sunken` (colisión de `--accent`, ver
   `core/button.md` §0). `ItemIndicator` → `Check` en `--accent`.
5. `alignItemWithTrigger` se deja en `true` (el valor elegido aparece sobre el disparador, que es lo
   que hace que un select de 40 zonas horarias no obligue a buscar).

━━━

## 1. Anatomía

```
   ┌────────────────────────────────────────┐
   │  Español                            ⌄  │   ← Trigger: Value + chevron
   └────────────────────────────────────────┘
   ┌────────────────────────────────────────┐
   │  IDIOMAS                               │   ← GroupLabel (opcional)
   │  Español                          ✓    │   ← Item seleccionado
   │  English                               │
   │  Português                             │
   └────────────────────────────────────────┘
```

| Parte | Regla |
|---|---|
| **Trigger** | Idéntico a un `input` (§0.1) + `ChevronDown` de 16px en `--text-tertiary`, a `var(--sp-3)` del borde derecho. Rota 180° al abrir, `--dur-fast`. |
| **Value** | `--fs-body`, `--text-primary`, una línea con `text-overflow: ellipsis`. Puede llevar un adorno (punto de categoría, bandera, badge de estado) que **se repite igual** en el item de la lista. |
| **Placeholder** | `--text-secondary`, mismo criterio que en `input.md` §5. Solo cuando no hay valor por defecto legítimo. |
| **Popup** | Ancho ≥ el del disparador (`w-(--anchor-width)`), `max-height: var(--available-height)` con scroll propio. |
| **Item** | Alto 36px, padding `0 var(--sp-3)`, `--radius-input`, `--fs-body`. El check va a la **derecha**, 16px, en `--accent`. |
| **GroupLabel** | `--fs-label` mayúsculas, `--text-tertiary`. Solo con dos o más grupos. |

━━━

## 2. Variantes y props

| Prop | Tipo | Por defecto | Efecto |
|---|---|---|---|
| `size` | `sm \| md` | `md` | 32 / 40 px |
| `ancho` | `full \| auto` | `full` | `auto` para los selects de toolbar de `02`, `03`, `08` |
| `placeholder` | string | — | |
| `invalido`, `deshabilitado` | | | Igual que `input.md` §3 |
| `buscable` | `boolean` | `false` | Ver §2.1 |

### 2.1 Cuándo un select deja de ser un select

| Situación | Componente correcto |
|---|---|
| ≤ 7 opciones cortas y excluyentes, todas visibles a la vez | `radio` (`forms/radio.md`) — es lo que hace `09` con «Tu página de inicio muestra» |
| 8 a 20 opciones | `select` |
| Más de 20, o hace falta escribir para encontrar (zonas horarias, categorías de un blog grande) | `select` con `buscable`: se compone con `input-group.tsx` dentro del popup. **Un select de 400 zonas horarias sin búsqueda es un castigo** |
| Se puede elegir más de una | Grupo de `checkbox`, o `chip` de tipo `filtro` |
| Ejecuta algo al elegir en vez de fijar un valor | `dropdown-menu` |

### 2.2 Item con adorno de estado

En `04` el select de Estado muestra el `badge` correspondiente («Publicado» verde) tanto en el
disparador como en la lista. **El badge no cambia de aspecto por estar dentro de un select**: es el
mismo componente y los mismos tokens de `core/badge.md`.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Igual que un input en reposo. |
| **Hover** | Borde `--border-strong`. Sin cambio de fondo. |
| **Foco** | `--focus-ring` + borde `--border-strong`. |
| **Abierto** | El disparador conserva el foco visible; el popup entra con `fade-in` + `zoom-in-95`, `--dur-base`. El item seleccionado ya viene resaltado y con el foco del teclado encima. |
| **Item resaltado** | Fondo `--surface-sunken`. Uno solo a la vez, compartido entre ratón y teclado. |
| **Item seleccionado** | `Check` en `--accent` a la derecha. **El texto no cambia de color ni de peso**: si el item seleccionado se pinta índigo y además lleva check, el índigo pierde su significado por sobreuso. |
| **Deshabilitado** | Fondo `--surface-sunken`, texto `--text-tertiary`, chevron a `--text-tertiary`. |
| **Item deshabilitado** | `opacity: .5`, se salta con las flechas. |
| **Error** | Borde `--danger` + anillo rojo derivado (ver `input.md` §3). |
| **Cargando opciones** | El disparador se deshabilita y muestra `Loader2` en lugar del chevron, `aria-busy="true"`. Nunca un popup vacío: un select que se abre sin nada dentro parece roto. |
| **Sin opciones** | Popup con una línea en `--text-tertiary`: «No hay categorías todavía» + un item de acción para crear una. |
| **Cerrando** | `--dur-fast`. El foco vuelve al disparador. |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Trigger — alto / radio / fondo / borde | 40px (`sm`: 32) · `--radius-input` · `--surface` · `--border-hairline` → `--border-strong` |
| Trigger — texto / placeholder | `--fs-body` `--text-primary` / `--text-secondary` |
| Chevron | `--text-tertiary`, 16px |
| Popup — fondo / borde / radio / sombra | `--surface` · `--border-hairline` · `--radius-control` · `--shadow-float` |
| Popup — padding | `--sp-1` |
| Item — alto / padding / radio | 36px · `--sp-3` · `--radius-input` |
| Item — resaltado | `--surface-sunken` |
| Indicador de selección | `--accent` |
| GroupLabel | `--fs-label` mayúsculas, `--text-tertiary` |
| Separator | `--border-hairline` |
| Foco | `--focus-ring`; error: `color-mix(in oklab, var(--danger) 25%, transparent)` |
| Duración | `--dur-base` al abrir, `--dur-fast` al cerrar |

**Los valores numéricos van con `tabular-nums`** (entradas por página, «RSS: mostrar las últimas
20»): son cifras comparables, y la regla del sistema no hace excepciones por vivir dentro de un
control.

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **Base UI implementa el patrón `listbox` completo**: `role="combobox"` en el disparador,
  `role="listbox"`/`option` en la lista, `aria-expanded`, `aria-activedescendant`, navegación con
  flechas, `Home`/`End`, búsqueda por primera letra, `Escape`. **No se reimplementa.**
- **Etiqueta visible obligatoria**, igual que el input. «Idioma del sitio» encima del control, no
  dentro.
- **El valor se lee al cerrar.** El disparador expone el texto del valor, no un icono. Un select
  cuyo valor solo se distingue por un color (un punto de categoría sin nombre) es ilegible para
  quien no ve y para quien no distingue tonos.
- **Zona táctil**: items de 36px de alto y ancho completo del popup. El disparador sube a 44px en
  móvil, igual que el input.
- **En móvil se puede caer al nativo.** Un `<select>` del sistema operativo es más usable con una
  rueda táctil que un popup propio. Si se hace, se hace para todos los selects, no para algunos.
- **`aria-invalid` + `aria-describedby`** para el error, igual que en el input.
- **El popup no atrapa el scroll de la página**: tiene el suyo. Y no se cierra al hacer scroll
  dentro de él, solo al hacerlo fuera.
- **Contraste**: `--accent` sobre `--surface` ≈ 4.6:1 para el check (basta: es un objeto gráfico y
  el mínimo es 3:1). El item seleccionado se distingue por el check, no solo por el resaltado.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/select.tsx — Trigger restilado (idéntico a un input + chevron)
function SelectTrigger({ className, size = "md", ancho = "full", children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex items-center justify-between gap-[var(--sp-2)]",
        "rounded-[var(--radius-input)] border border-[var(--border-hairline)] bg-[var(--surface)]",
        "px-[var(--sp-3)] text-[length:var(--fs-body)] text-[var(--text-primary)]",
        "whitespace-nowrap outline-none select-none",
        "transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        ancho === "full" ? "w-full" : "w-fit",
        "data-[size=md]:h-10 data-[size=sm]:h-8",
        "data-placeholder:text-[var(--text-secondary)]",
        "hover:border-[var(--border-strong)]",
        "focus-visible:border-[var(--border-strong)] focus-visible:shadow-[var(--focus-ring)]",
        "disabled:cursor-not-allowed disabled:bg-[var(--surface-sunken)] disabled:text-[var(--text-tertiary)]",
        "aria-invalid:border-[var(--danger)]",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-[var(--text-tertiary)] transition-transform
                       duration-[var(--dur-fast)] group-data-[popup-open]:rotate-180"
          />
        }
      />
    </SelectPrimitive.Trigger>
  )
}
```

```tsx
// 09 · select simple, misma altura y mismo borde que el input de al lado
<Field>
  <FieldLabel htmlFor="idioma">Idioma del sitio</FieldLabel>
  <Select value={idioma} onValueChange={setIdioma}>
    <SelectTrigger id="idioma"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="es">Español</SelectItem>
      <SelectItem value="en">English</SelectItem>
      <SelectItem value="pt">Português</SelectItem>
    </SelectContent>
  </Select>
</Field>

// 04 · select de Estado — el badge es el mismo componente dentro y fuera del popup
<Select value={estado} onValueChange={setEstado}>
  <SelectTrigger id="estado" ancho="auto" aria-label="Estado de la entrada">
    <SelectValue><BadgeEstado estado={estado} /></SelectValue>
  </SelectTrigger>
  <SelectContent>
    {(["publicado", "borrador", "programado", "privada"] as const).map((e) => (
      <SelectItem key={e} value={e}><BadgeEstado estado={e} /></SelectItem>
    ))}
  </SelectContent>
</Select>
```

━━━

## 7. Reglas duras

1. **El disparador es un input con chevron.** Misma altura, mismo borde, mismo radio, mismo foco.
2. **`w-full` en formulario**, `w-fit` solo en toolbar.
3. **≤7 opciones excluyentes → `radio`.** >20 → `buscable`. Ejecuta algo → `dropdown-menu`.
4. **El item seleccionado se marca con check índigo**, no cambiando el color del texto.
5. **Nunca un popup vacío.** Hay estado de carga y estado sin opciones, ambos con texto.
6. **Etiqueta visible obligatoria.**
7. **`tabular-nums` en valores numéricos**, también dentro del control.
8. **No se reimplementa el teclado**: Base UI ya trae el patrón `listbox` completo.
