# Switch — interruptor

> Enciende o apaga **una cosa que ya está activa en el mundo**. Se aplica al instante y no necesita
> «Guardar»; ahí está la frontera con el checkbox, que fija un valor a la espera de un envío.
> Referencias: el toggle de tema del sidebar (`02`, `04`, `09` — «Modo claro») y del topbar, y los
> ajustes booleanos de `09` (comentarios abiertos, indexación por buscadores, notificaciones).

Ruta destino: `components/ui/switch.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/switch.tsx` ya envuelve `Switch` de `@base-ui/react/switch` con `Root` + `Thumb` y
trae la zona táctil ampliada. **Se conserva.** Cambios:

1. Medidas raras (`h-[18.4px] w-[32px]`) → **20×36** en `md` y **16×28** en `sm` (§1). Los decimales
   vienen de una conversión de escala y producen medio píxel borroso en el borde del riel.
2. `data-unchecked:bg-input` → `--border-strong`. El riel apagado tiene que **verse**: con
   `--border-hairline` sobre `--surface` desaparece y el control parece no existir.
3. `data-checked:bg-primary` (negro con el puente de tokens) → **`--accent`** (§2).
4. `bg-background` del pulgar → `--surface`, con `--shadow-rest` para que se despegue del riel.
5. `focus-visible:ring-3` → `--focus-ring`.

━━━

## 1. Anatomía

```
   ┌─────────────┐        ┌─────────────┐
   │ ●           │        │           ● │
   └─────────────┘        └─────────────┘
     apagado                encendido
```

| Parte | Regla |
|---|---|
| **Riel** | 36×20px (`md`) / 28×16px (`sm`), `border-radius: var(--radius-pill)`. Apagado: `--border-strong`. Encendido: `--accent`. |
| **Pulgar** | Círculo de 16px (`md`) / 12px (`sm`), `--surface`, `--shadow-rest`, 2px de margen dentro del riel. Se desplaza `calc(100% + 2px)`. |
| **Etiqueta** | A la **izquierda** del switch en una fila de ajustes (patrón «etiqueta … control» alineado a los extremos de la fila), o a la derecha cuando el switch va suelto en un menú. Nunca dentro del riel: un switch con «SÍ/NO» escrito dentro es ilegible a 20px de alto. |
| **Descripción** *(opcional)* | Bajo la etiqueta, `--fs-sm`, `--text-secondary`. Explica qué pasa al encenderlo. |

**Movimiento**: el pulgar se desplaza en `--dur-fast` con `--ease-out`, y el riel cambia de color en
la misma duración. Es la única animación de posición del sistema de formularios, y está justificada:
el desplazamiento **es** el significado del control.

━━━

## 2. Switch, checkbox o botón

| Pregunta | Control |
|---|---|
| ¿Se aplica al instante, sin «Guardar»? | **switch** |
| ¿Es un valor que se envía con el formulario? | `checkbox` |
| ¿Se elige uno entre varios? | `radio` |
| ¿Ejecuta algo (enviar, borrar, analizar)? | `button` |

**Encendido en índigo, no en negro** — misma razón que el checkbox (`forms/checkbox.md` §2): fija un
estado, no ejecuta una acción. Y en `09` el toggle de tema convive en el sidebar con la tarjeta
Cuaderno Pro y con el item activo, todos índigo: es la familia de «así está configurado esto».

**Un switch nunca es destructivo.** Si apagarlo borra datos o rompe el sitio (desactivar el blog,
quitar el dominio), no es un switch: es un botón `destructivo` con confirmación.

━━━

## 3. Estados

| Estado | Riel | Pulgar |
|---|---|---|
| **Apagado** | `--border-strong` | `--surface`, a la izquierda |
| **Apagado · hover** | `--neutral` | |
| **Encendido** | `--accent` | `--surface`, a la derecha |
| **Encendido · hover** | `--accent-hover` | |
| **Foco** | `box-shadow: var(--focus-ring)` en el riel, `outline: none` | |
| **Deshabilitado** | `--surface-sunken` con borde 1px `--border-hairline`; encendido y deshabilitado: `--accent-tint` | Pulgar `--surface` sin sombra. Opacidad del conjunto .6 |
| **Guardando** | El switch **se mueve inmediatamente** a la nueva posición y se deshabilita hasta que la petición vuelve. `aria-busy="true"` | |
| **Error al guardar** | **Vuelve a su posición anterior** con la misma transición y se muestra un `toast` destructivo que explica qué pasó y ofrece reintentar. Un switch que se queda encendido cuando el servidor dijo que no es una mentira sobre el estado del blog | |

**Nunca hay un spinner dentro del riel.** No cabe, y el propio movimiento ya es la confirmación
visual. La confirmación real es que el cambio persiste al recargar.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Riel | 36×20px (`sm`: 28×16), `--radius-pill` |
| Riel apagado | `--border-strong` → `--neutral` en hover |
| Riel encendido | `--accent` → `--accent-hover` en hover |
| Pulgar | 16px (`sm`: 12), `--surface`, `--radius-pill`, `--shadow-rest` |
| Deshabilitado | riel `--surface-sunken` + borde `--border-hairline`; encendido `--accent-tint` |
| Etiqueta | `--fs-body`, `--text-primary` |
| Descripción | `--fs-sm`, `--text-secondary` |
| Foco | `--focus-ring` |
| Zona táctil | `--touch-target` vía `::after` |
| Duración / curva | `--dur-fast` / `--ease-out` |

**Modo oscuro**: sin reglas propias. En oscuro `--border-strong` sube y el riel apagado sigue
distinguiéndose del fondo — que es justamente el motivo de no usar `--border-hairline`.

━━━

## 5. Accesibilidad

- **`role="switch"` con `aria-checked`**, no `role="checkbox"`. Lo pone Base UI. El lector de
  pantalla dice «activado/desactivado», que es lo que el usuario necesita oír de un ajuste, en vez
  de «marcado».
- **Etiqueta visible siempre** y enlazada. El toggle de tema del sidebar dice «Modo claro» al lado:
  un riel suelto no comunica qué enciende.
- **La etiqueta no cambia con el estado.** Es «Modo oscuro», no «Activar modo oscuro» cuando está
  apagado y «Desactivar modo oscuro» cuando está encendido: una etiqueta que se mueve obliga a
  releer el ajuste entero cada vez.
- **El estado no se comunica solo con color.** La **posición del pulgar** es el canal principal; el
  color lo refuerza. En escala de grises un switch sigue siendo legible, y por eso el riel apagado
  usa `--border-strong` y no un gris apenas más claro que el fondo.
- **Zona táctil de 44px** por `::after`; el riel visible se queda en 20px de alto.
- **Teclado**: `Espacio` alterna; `Enter` **no** lo hace (comportamiento nativo de `switch`).
- **El cambio se anuncia** si tiene consecuencia visible fuera del control: `aria-live="polite"` en
  la región afectada, o un `toast`. Encender «Modo oscuro» no necesita anuncio (se ve); desactivar
  la indexación por buscadores sí.
- **Contraste**: `--accent` sobre `--surface` ≈ 4.6:1 y `--border-strong` sobre `--surface` ≈ 1.6:1.
  Ese riel apagado **no cumple 3:1 como objeto gráfico**: lo compensa el pulgar blanco con
  `--shadow-rest`, que sí se distingue. Si una auditoría lo marca, la solución es dar al riel apagado
  un borde interior de 1px `--neutral`, no bajar el resto del sistema.
- **`prefers-reduced-motion`**: el pulgar salta en vez de deslizarse. Ya lo cubre `effects.css`.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/switch.tsx — restilado
function Switch({ className, size = "md", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center",
        "rounded-[var(--radius-pill)] outline-none",
        "transition-[background-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "after:absolute after:-inset-x-2 after:-inset-y-3",         // zona táctil de 44px
        "data-[size=md]:h-5 data-[size=md]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7",
        "data-unchecked:bg-[var(--border-strong)] data-unchecked:hover:bg-[var(--neutral)]",
        "data-checked:bg-[var(--accent)] data-checked:hover:bg-[var(--accent-hover)]",
        "focus-visible:shadow-[var(--focus-ring)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-60",
        "data-disabled:data-unchecked:bg-[var(--surface-sunken)]",
        "data-disabled:data-checked:bg-[var(--accent-tint)]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-[var(--radius-pill)] bg-[var(--surface)]",
          "shadow-[var(--shadow-rest)] transition-transform",
          "duration-[var(--dur-fast)] ease-[var(--ease-out)]",
          "group-data-[size=md]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "translate-x-0.5 data-checked:translate-x-[calc(100%+2px)]",
        )}
      />
    </SwitchPrimitive.Root>
  )
}
```

```tsx
// 09 · fila de ajuste: etiqueta y descripción a la izquierda, control a la derecha
<Field orientation="horizontal" className="justify-between">
  <FieldContent>
    <FieldLabel htmlFor="indexacion">Permitir que los buscadores indexen el sitio</FieldLabel>
    <FieldDescription>
      Al desactivarlo, tu blog deja de aparecer en los buscadores en unos días.
    </FieldDescription>
  </FieldContent>
  <Switch
    id="indexacion"
    checked={indexable}
    onCheckedChange={guardarIndexacion}   // se aplica al instante; sin botón «Guardar»
    aria-busy={guardando}
    disabled={guardando}
  />
</Field>

// 02 / 04 / 09 · toggle de tema del sidebar — la etiqueta no cambia con el estado
<Field orientation="horizontal">
  <Switch
    id="tema"
    checked={tema === "dark"}
    onCheckedChange={(v) => setTema(v ? "dark" : "light")}
  />
  <FieldLabel htmlFor="tema">
    <Sun aria-hidden="true" className="size-4" /> Modo oscuro
  </FieldLabel>
</Field>
```

━━━

## 7. Reglas duras

1. **Se aplica al instante.** Un switch dentro de un formulario con «Guardar cambios» es un checkbox
   mal elegido.
2. **Encendido en índigo, nunca en negro.**
3. **El riel apagado usa `--border-strong`**, no el hairline: tiene que verse.
4. **La etiqueta no cambia con el estado.**
5. **Sin texto dentro del riel** («SÍ/NO», «ON/OFF»).
6. **Al fallar el guardado, vuelve solo** y lo explica en un toast.
7. **Nunca destructivo.** Eso es un botón con confirmación.
8. **44px de zona táctil**, riel de 20px.
