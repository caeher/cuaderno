# Textarea — campo de texto largo

> El input de varias líneas. Todo lo que dice `forms/input.md` sobre borde, foco, error, etiqueta y
> placeholder **aplica igual**; este archivo documenta solo lo que cambia: el alto, el
> redimensionado y el contador.
> Referencias: `09` (Descripción corta del sitio), `04` (Extracto de la entrada, en el sidebar de
> publicación), `06` (descripción de una categoría), `09` (meta descripción por defecto).

Ruta destino: `components/ui/textarea.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/textarea.tsx` es un `<textarea>` nativo estilado, con `field-sizing-content` ya
puesto — que es exactamente el comportamiento correcto. **Se conserva.** Cambios:

1. `rounded-lg` → `--radius-input`; `border-input` → `--border-hairline`; `bg-transparent` →
   `--surface`.
2. `min-h-16` (64px) → `min-height: 96px` (§1).
3. `px-2.5 py-2` → `var(--sp-3)` en los cuatro lados.
4. `text-base md:text-sm` → `--fs-body` con la regla de iOS de `input.md` §5.
5. Anillo de foco y de error idénticos a `input.md` §3.
6. Añadir `resize: vertical` explícito (§2) — hoy queda al valor por defecto del navegador, que
   permite el redimensionado horizontal y rompe la grilla del formulario.

━━━

## 1. Anatomía

```
   ┌────────────────────────────────────────────────┐
   │  Un espacio para compartir ideas, experiencias │
   │  y conocimiento sobre tecnología, IA y         │
   │  productividad.                                │
   │                                             ◢  │  ← agarre de redimensionado
   └────────────────────────────────────────────────┘
     Recomendado: 150–160 caracteres          142/160  ← ayuda y contador
```

| Parte | Regla |
|---|---|
| **Caja** | `min-height: 96px` (≈4 líneas de `--fs-body` con `--lh-body`), fondo `--surface`, borde 1px `--border-hairline`, `--radius-input`, padding `var(--sp-3)`. |
| **Texto** | `--fs-body` (14/1.55). La interlínea de lectura del sistema: un extracto de tres líneas tiene que leerse como un párrafo, no como un formulario. |
| **Agarre** | Solo vertical. El nativo del navegador; no se dibuja uno propio. |
| **Contador** *(opcional)* | Abajo a la derecha, fuera de la caja, `--fs-sm`, `--text-tertiary`, `tabular-nums`. Ver §3 para los umbrales. |
| **Ayuda** | Abajo a la izquierda, misma línea que el contador. La provee `FieldDescription`. |

**Alto por contexto**: 96px por defecto (`09`, `06`); 128px cuando el campo es el contenido
principal de su tarjeta; 72px en el sidebar estrecho de `04`, donde el ancho es de 260px y cuatro
líneas ocupan demasiado.

━━━

## 2. Variantes y props

| Prop | Tipo | Por defecto | Efecto |
|---|---|---|---|
| `filas` | number | `4` | Alto inicial en líneas. |
| `autoAlto` | `boolean` | `true` | `field-sizing: content` — la caja crece con el texto hasta `maxAlto`. Es el comportamiento por defecto porque un extracto que hay que scrollear dentro de un cuadro de 4 líneas es un extracto que nadie relee. |
| `maxAlto` | number (px) | `320` | Tope del crecimiento; a partir de ahí, scroll interno. |
| `redimensionable` | `vertical \| none` | `vertical` | **Nunca `horizontal` ni `both`**: rompe la grilla del formulario y el ancho de línea legible. Se pone en `none` cuando `autoAlto` está activo y hay contador, para que las dos cosas no se peleen. |
| `maxCaracteres` | number | — | Activa el contador. |
| `invalido`, `deshabilitado`, `soloLectura` | | | Idénticos a `input.md`. |

━━━

## 3. Estados

Todos los de `input.md` §3, más:

| Estado | Comportamiento |
|---|---|
| **Creciendo** | Con `autoAlto`, la caja crece línea a línea **sin transición**: animar el alto de un campo mientras se escribe hace saltar todo lo que hay debajo. |
| **Contador normal** | `--text-tertiary`. |
| **Contador cerca del límite** (≥90%) | `--warn`. Avisa antes de que duela. |
| **Contador pasado** | `--danger`, y el campo entra en estado de error. **El texto no se corta**: `maxLength` duro borra lo que la persona acaba de pegar sin decir nada. Se deja escribir, se marca el exceso y se bloquea el envío. |
| **Scroll interno** | Al llegar a `maxAlto`. La barra de scroll es la nativa; sin `scrollbar` estilada. |
| **Solo lectura** | Fondo `--surface-sunken`, foco conservado, seleccionable. |

━━━

## 4. Tokens

Los mismos de `input.md` §4, con estas diferencias:

| Rol | Token |
|---|---|
| Alto mínimo | 96px (sidebar de `04`: 72px) |
| Alto máximo | 320px, luego scroll |
| Padding | `--sp-3` en los cuatro lados |
| Interlínea | `--lh-body` (1.55) |
| Contador | `--fs-sm`, `tabular-nums`; `--text-tertiary` → `--warn` → `--danger` |
| Redimensionado | solo vertical |

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **Etiqueta visible obligatoria**, igual que el input.
- **El contador se anuncia con moderación.** Su contenedor lleva `aria-live="polite"` pero
  **solo se actualiza en los umbrales** (90% y 100%), no en cada tecla: un lector de pantalla
  diciendo «142 de 160» en cada pulsación hace el campo inusable. En reposo el contador es
  `aria-hidden` y el límite se comunica en el texto de ayuda («Recomendado: 150–160 caracteres»),
  que sí se enlaza con `aria-describedby`.
- **Sin `maxLength` duro** cuando el límite es una recomendación de SEO. Truncar en silencio lo que
  alguien pegó es pérdida de datos.
- **`Enter` inserta salto de línea**, nunca envía el formulario. Si el formulario necesita envío por
  teclado, es `⌘/Ctrl + Enter`, y esa combinación se declara en el texto de ayuda.
- **Redimensionar no rompe el layout**: el textarea nunca crece más allá de su columna. El
  redimensionado horizontal está desactivado por eso.
- **Ancho de línea**: en una tarjeta ancha el textarea se limita a `max-width: 70ch`. Un párrafo de
  140 caracteres por línea no se puede leer, y este campo es de lectura además de escritura.
- **Contraste y foco**: idénticos a `input.md` §5, incluido el `--focus-ring` obligatorio.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/textarea.tsx — restilado
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-24 max-h-80 w-full max-w-[70ch] resize-y",
        "rounded-[var(--radius-input)] border border-[var(--border-hairline)] bg-[var(--surface)]",
        "p-[var(--sp-3)] text-[length:var(--fs-body)] leading-[var(--lh-body)] text-[var(--text-primary)]",
        "outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "placeholder:text-[var(--text-secondary)]",
        "hover:border-[var(--border-strong)]",
        "focus-visible:border-[var(--border-strong)] focus-visible:shadow-[var(--focus-ring)]",
        "read-only:bg-[var(--surface-sunken)]",
        "disabled:cursor-not-allowed disabled:bg-[var(--surface-sunken)] disabled:text-[var(--text-tertiary)]",
        "aria-invalid:border-[var(--danger)]",
        "max-sm:text-[16px]",
        className,
      )}
      {...props}
    />
  )
}
```

```tsx
// 09 · Descripción corta del sitio, con ayuda enlazada y contador que solo habla en los umbrales
<Field>
  <FieldLabel htmlFor="descripcion">Descripción corta</FieldLabel>
  <Textarea
    id="descripcion"
    aria-describedby="descripcion-ayuda"
    value={valor}
    onChange={(e) => setValor(e.target.value)}
  />
  <div className="flex items-baseline justify-between gap-[var(--sp-3)]">
    <FieldDescription id="descripcion-ayuda">
      Recomendado: 150–160 caracteres. Se usa como meta descripción del sitio.
    </FieldDescription>
    <span
      aria-live="polite"
      aria-hidden={valor.length < 144}
      className={cn(
        "shrink-0 text-[length:var(--fs-sm)] tabular-nums",
        valor.length > 160
          ? "text-[var(--danger)]"
          : valor.length >= 144
            ? "text-[var(--warn)]"
            : "text-[var(--text-tertiary)]",
      )}
    >
      {valor.length}/160
    </span>
  </div>
</Field>
```

━━━

## 7. Reglas duras

1. **Redimensionado solo vertical.**
2. **Sin transición de alto** al crecer.
3. **Sin `maxLength` duro** cuando el límite es una recomendación: se marca, no se trunca.
4. **El contador no habla en cada tecla.**
5. **`Enter` no envía.**
6. **`max-width: 70ch`** para que siga siendo legible.
7. **Todo lo demás es idéntico a `input.md`**: mismo borde, mismo foco, mismo error, misma etiqueta
   obligatoria. Si alguien estila un textarea distinto de un input, el formulario se ve roto.
