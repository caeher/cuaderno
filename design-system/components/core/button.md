# Button — botón

> El componente donde la ley de color se ve o se rompe. **Negro = la acción del usuario.**
> Un solo botón negro por zona de decisión: si hay dos negros compitiendo en la misma pantalla,
> uno de los dos no era primario.
> Aparece en las 9 pantallas. Referencias directas: `02` (Nueva entrada), `04` (Publicar,
> Vista previa, Escribir con IA, Mover a la papelera), `09` (Guardar cambios, Gestionar plan,
> Exportar contenido, Eliminar mi sitio), `01` (Comenzar gratis, Ver demo).

Ruta destino: `components/ui/button.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/button.tsx` ya envuelve `Button` de `@base-ui/react/button` con `cva`. **Se conserva
el archivo, la API y el primitivo.** El trabajo es de tres pasos, en este orden:

1. **Puente de tokens** en `app/globals.css`: los alias de shadcn apuntan al contrato de Cuaderno.
   Este componente consume `--primary`, `--primary-foreground`, `--border`, `--muted`, `--ring`,
   `--destructive`. El mapeo es:

   | alias shadcn | token de Cuaderno |
   |---|---|
   | `--primary` | `--action` |
   | `--primary-foreground` | `--text-on-dark` |
   | `--border` | `--border-hairline` |
   | `--muted` | `--surface-sunken` |
   | `--destructive` | `--danger` |
   | `--ring` | `--accent` |

   > ⚠️ **Colisión de nombres, resolver antes de tocar nada.** shadcn llama `--accent` a la
   > superficie de hover de menús; Cuaderno llama `--accent` al índigo. Si se cargan los tokens de
   > Cuaderno tal cual, todo `bg-accent` de Base UI se vuelve índigo sólido. La resolución es del
   > lado de shadcn, nunca del contrato: en `@theme inline` de `globals.css` se remapea
   > `--color-accent: var(--surface-sunken)` y `--color-accent-foreground: var(--text-primary)`.

2. **Reescribir el `cva`** de `buttonVariants` con los nombres de variante y los tamaños de §2.
   Los nombres viejos (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) se
   mantienen como alias deprecados durante la migración y se borran al final.
3. **Nada de estilos sueltos en las pantallas.** Ningún `className` de pantalla puede pintar
   fondo, borde o color de texto de un botón. Si una pantalla lo necesita, falta una variante acá.

━━━

## 1. Anatomía

```
      ┌───────────────────────────────────────┐
      │  ⊹   Nueva entrada             ⌄      │
      └───────────────────────────────────────┘
         │        │                    │
         1        2                    3
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Icono inicial** *(opcional)* | Lucide, `stroke-width: 1.75`. 14px en `sm`, 16px en `md`, 18px en `lg`. `aria-hidden="true"` **siempre**: el icono nunca es el único portador del significado. |
| 2 | **Etiqueta** | Verbo en infinitivo o imperativo, **sentence case**, sin punto final: «Nueva entrada», «Publicar», «Guardar cambios». Nunca mayúsculas, nunca `!`. `white-space: nowrap`. |
| 3 | **Chevron de menú** *(opcional, prop `menu`)* | `ChevronDown` 16px. Va precedido de un separador vertical de 1px: `color-mix(in oklab, var(--text-on-dark) 18%, transparent)` sobre relleno negro, `--border-hairline` sobre relleno claro (derivado del contrato, sin valores sueltos). Aparece en «Nueva entrada» (`02`) y «Publicar» (`04`). |

**Caja**: `inline-flex`, `align-items: center`, `justify-content: center`, `gap: var(--sp-2)`,
`border: 1px solid` (transparente en las variantes sin borde, para que ninguna variante cambie de
alto al ganar borde), `border-radius: var(--radius-control)`.

**Alto y padding por tamaño** — el alto es fijo, el ancho lo pone el contenido:

| `size` | Alto | Padding horizontal | Tipografía | Icono | Dónde |
|---|---|---|---|---|---|
| `sm` | 32px | `--sp-3` (12) | `--fs-sm`, peso 500 | 14px | Acciones dentro de tarjeta y de fila: «Cambiar imagen», «Editar» (`04`, `09`) |
| `md` *(por defecto)* | 40px | `--sp-4` (16) | `--fs-body`, peso 500 | 16px | Todo el panel: «Nueva entrada», «Publicar», «Guardar cambios» |
| `lg` | 44px | `--sp-5` (20) | `--fs-body`, peso 500 | 18px | Landing (`01`): «Comenzar gratis», «Ver demo» |

Cuando lleva `menu`, el padding derecho baja a `--sp-3` (`sm`: `--sp-2`).
Cuando es solo icono, **no es este componente**: es `icon-button.md`.

━━━

## 2. Variantes

### 2.1 `variant`

| Variante | Relleno | Borde | Texto | Cuándo |
|---|---|---|---|---|
| `primario` *(por defecto)* | `--action` | transparente | `--text-on-dark` | **La única acción que compromete la zona.** Uno por zona de decisión. |
| `secundario` | `--surface` | `--border-hairline` | `--text-primary` | La alternativa junto al primario: «Vista previa», «Exportar contenido», «Aplicar sugerencia». |
| `fantasma` | transparente | transparente | `--text-secondary` | Acciones de baja prioridad dentro de una fila o tarjeta densa. |
| `ia` | `--surface` | `--accent-border` | `--accent` | **El botón que invoca al modelo.** Lleva `Sparkles` en `--accent` y el destello mientras trabaja. También la acción de plan: «Gestionar plan» (`09`). |
| `destructivo` | `--surface` | `--danger` | `--danger` | «Mover a la papelera» (`04`), «Eliminar mi sitio» (`09`). Nunca relleno rojo sólido: en este sistema el rojo advierte, no grita. |
| `enlace` | ninguno | ninguno | `--accent` | «Ver todas →», «Ver análisis completo →». Sin alto fijo, sin padding; subrayado solo en hover. |

**El caso «Escribir con IA» (`04`)**: en la barra de herramientas del editor el botón es `secundario`
con el icono `Sparkles` en `--accent`, no `ia` completo. Regla: `ia` se usa cuando el botón es el
protagonista de su zona; dentro de una barra densa el índigo se queda solo en el icono, porque un
borde índigo más un subrayado de tab índigo más el item activo del sidebar índigo saturan la
pantalla y el índigo deja de significar nada.

**Prohibido**: relleno `--accent` sólido. El índigo es navegación e IA, no la acción. Un botón
índigo relleno le roba el trabajo al negro y rompe la ley de color de todo el producto.

### 2.2 Props

| Prop | Tipo | Por defecto | Efecto |
|---|---|---|---|
| `variant` | ver §2.1 | `primario` | |
| `size` | `sm \| md \| lg` | `md` | |
| `icono` | `LucideIcon` | — | Icono inicial. |
| `iconoFinal` | `LucideIcon` | — | Icono final (la flecha de `enlace`, por ejemplo). |
| `menu` | `boolean` | `false` | Añade separador + chevron. Requiere `aria-haspopup="menu"` y `aria-expanded`. |
| `cargando` | `boolean` | `false` | Ver §3. |
| `deshabilitado` | `boolean` | `false` | |
| `anchoCompleto` | `boolean` | `false` | `width: 100%`. Solo en sidebars estrechos y en móvil. |
| `render` | Base UI | — | Se conserva tal cual del componente actual: permite renderizar como `<a>` sin perder los estilos. |

━━━

## 3. Estados

| Estado | `primario` | `secundario` | `fantasma` | `ia` | `destructivo` |
|---|---|---|---|---|---|
| **Reposo** | `--action` | `--surface` + `--border-hairline` | transparente | `--surface` + `--accent-border` | `--surface` + `--danger` |
| **Hover** | `--action-hover` | fondo `--surface-sunken`, borde `--border-strong` | fondo `--surface-sunken`, texto `--text-primary` | fondo `--accent-tint` | fondo `--danger-tint` |
| **Pressed** | `--action-pressed` | fondo `--surface-sunken`, `translateY(1px)` | fondo `--surface-sunken` | fondo `--accent-tint`, borde `--accent` | fondo `--danger-tint` |
| **Foco** | `box-shadow: var(--focus-ring)`, `outline: none` — **igual en las cinco variantes**, sin excepción | | | | |
| **Deshabilitado** | `opacity: .5`, `pointer-events: none`, `cursor: not-allowed` — nunca se cambia el color por uno más claro «a mano» | | | | |
| **Cargando** | Ver abajo | | | | |

**Pressed**: `translateY(1px)` solo en `primario` y `secundario`. No se aplica en `enlace` ni
cuando `menu` está activo (un botón que abre un menú no debe hundirse mientras el menú está abierto).

**Cargando (`cargando`)**:
- El icono inicial se reemplaza por `Loader2` girando; **la etiqueta no cambia y el ancho del botón
  queda bloqueado** con el ancho de reposo. Un botón que se encoge al enviar es un botón que hace
  saltar el layout justo cuando el usuario está mirando.
- `aria-busy="true"` y `disabled`.
- Con `prefers-reduced-motion: reduce` el spinner no gira: se muestra estático al 60% de opacidad.
- En `ia`, en vez del spinner el icono `Sparkles` toma la clase `.destello-ia` (late en índigo,
  1400ms). Es el único movimiento del sistema que significa «el producto está pensando».

**Menú abierto** (`aria-expanded="true"`): el botón mantiene el estilo de hover mientras el popup
está abierto. El chevron rota 180° en `--dur-fast`.

Transiciones: solo `background-color`, `border-color`, `box-shadow` y `transform`, `--dur-fast` con
`--ease-out`. Nunca `transition: all`.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Radio | `--radius-control` (10px) — en las tres medidas |
| Relleno primario | `--action` → `--action-hover` → `--action-pressed` |
| Texto sobre primario | `--text-on-dark` |
| Superficie secundario / ia / destructivo | `--surface` |
| Fondo hover secundario y fantasma | `--surface-sunken` |
| Borde secundario | `--border-hairline` → `--border-strong` en hover |
| Borde ia | `--accent-border`; fondo hover `--accent-tint`; texto `--accent` |
| Borde destructivo | `--danger`; fondo hover `--danger-tint`; texto `--danger` |
| Texto | `--text-primary` (secundario) · `--text-secondary` → `--text-primary` (fantasma) · `--accent` (ia, enlace) · `--danger` (destructivo) |
| Separador del chevron | `color-mix(in oklab, var(--text-on-dark) 18%, transparent)` sobre negro · `--border-hairline` sobre claro |
| Foco | `--focus-ring` |
| Gap icono–etiqueta | `--sp-2` |
| Padding horizontal | `--sp-3` / `--sp-4` / `--sp-5` según tamaño |
| Tipografía | `--fs-sm` / `--fs-body`, peso 500 |
| Duración / curva | `--dur-fast` / `--ease-out` |
| Sombra | **ninguna.** El botón no lleva sombra en ningún estado. |

**Modo oscuro**: el botón no define ni un color propio. Todo sale del contrato, así que hereda el
tema sin una sola regla extra. El único punto de atención es el `primario`: en oscuro `--action`
sigue siendo el negro del contrato, así que `--text-on-dark` debe estar redefinido en el bloque
oscuro de `colors.css` para que el texto no desaparezca. Eso se resuelve en los tokens, no acá.

━━━

## 5. Accesibilidad

- **Elemento real.** `<button type="button">` salvo que navegue: si navega es `<a>` vía `render`.
  Un `<div onClick>` no es un botón — no recibe foco, no responde a Enter ni a Espacio, y el lector
  de pantalla no lo anuncia.
- **`type` explícito.** Dentro de un `<form>`, todo botón que no envía lleva `type="button"`. Es el
  bug más caro y más silencioso de un panel de ajustes.
- **Zona táctil.** El tamaño visual y el tamaño tocable son cosas distintas. `sm` (32px) y `md`
  (40px) quedan por debajo de `--touch-target` (44px): en móvil se extiende la zona activa con
  `::after { position:absolute; inset: -6px; }` sin tocar la caja visible.
- **Foco visible siempre.** `outline: none` solo se permite acompañado de `box-shadow:
  var(--focus-ring)`. Nunca se quita el foco «porque se ve feo».
- **El icono no habla.** `aria-hidden="true"` en todo icono decorativo. Si el botón fuera solo
  icono, no es este componente (ver `icon-button.md`, que exige `aria-label`).
- **Cargando se anuncia.** `aria-busy="true"` mientras carga; el resultado se comunica por un
  `toast` con `role="status"`, no cambiando la etiqueta del botón en silencio.
- **Destructivo confirma.** `destructivo` nunca ejecuta directo una acción irreversible: abre un
  `alert-dialog` cuyo botón de confirmación repite el verbo exacto («Eliminar mi sitio»), no un «Sí».
- **Contraste.** `--text-on-dark` sobre `--action` ≈ 19:1. `--accent` sobre `--surface` ≈ 4.6:1 —
  cumple para texto de 14px a peso 500, que es exactamente la medida de la variante `ia`; si alguien
  baja esa variante a 12px, deja de cumplir.
- **El color nunca es el único canal.** `destructivo` lleva icono `Trash2`; `ia` lleva `Sparkles`.
  Un daltónico protanope distingue las variantes por forma y por texto, no por el tono.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/button.tsx — el cva restilado sobre el componente que ya existe
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-[var(--sp-2)]",
    "rounded-[var(--radius-control)] border border-transparent whitespace-nowrap font-medium",
    "transition-[background-color,border-color,box-shadow,transform]",
    "duration-[var(--dur-fast)] ease-[var(--ease-out)] outline-none select-none",
    "focus-visible:shadow-[var(--focus-ring)]",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primario:
          "bg-[var(--action)] text-[var(--text-on-dark)] hover:bg-[var(--action-hover)] active:bg-[var(--action-pressed)] active:not-aria-[haspopup]:translate-y-px",
        secundario:
          "border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] active:not-aria-[haspopup]:translate-y-px aria-expanded:bg-[var(--surface-sunken)]",
        fantasma:
          "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)] aria-expanded:bg-[var(--surface-sunken)]",
        ia:
          "border-[var(--accent-border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--accent-tint)] active:border-[var(--accent)]",
        destructivo:
          "border-[var(--danger)] bg-[var(--surface)] text-[var(--danger)] hover:bg-[var(--danger-tint)]",
        enlace:
          "h-auto p-0 text-[var(--accent)] underline-offset-4 hover:text-[var(--accent-hover)] hover:underline",
      },
      size: {
        sm: "h-8  px-[var(--sp-3)] text-[length:var(--fs-sm)]   [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-10 px-[var(--sp-4)] text-[length:var(--fs-body)] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 px-[var(--sp-5)] text-[length:var(--fs-body)] [&_svg:not([class*='size-'])]:size-[18px]",
      },
      anchoCompleto: { true: "w-full" },
    },
    defaultVariants: { variant: "primario", size: "md" },
  },
)
```

```tsx
// Uso — las cuatro formas que piden las pantallas

// 02 · CTA primario con menú desplegable
<Button icono={Plus} menu aria-haspopup="menu" aria-expanded={abierto}>
  Nueva entrada
</Button>

// 04 · alternativa junto al primario
<Button variant="secundario" icono={Eye}>Vista previa</Button>

// 04 · la barra del editor invoca a la IA: secundario + icono índigo
<Button variant="secundario">
  <Sparkles aria-hidden="true" className={cn("text-[var(--accent)]", pensando && "destello-ia")} />
  Escribir con IA
</Button>

// 04 · destructivo, ancho completo dentro del sidebar de publicación
<Button variant="destructivo" icono={Trash2} anchoCompleto onClick={abrirConfirmacion}>
  Mover a la papelera
</Button>
```

━━━

## 7. Reglas duras

1. **Un solo `primario` por zona de decisión.** Dos negros en la misma zona significan que nadie
   decidió cuál era la acción.
2. **Nunca relleno índigo.** El índigo es navegación e IA; el negro es la acción. Ni un solo
   `bg-[var(--accent)]` en un botón.
3. **El botón no lleva sombra.** En ningún estado, en ninguna variante.
4. **Ancho bloqueado al cargar.** La etiqueta no se reemplaza por «Cargando…».
5. **`type="button"` explícito** en todo botón dentro de un formulario que no envía.
6. **Un solo radio**: `--radius-control` en `sm`, `md` y `lg`. El botón no cambia de curvatura al
   cambiar de tamaño.
7. **Ninguna pantalla estiliza un botón.** Si hace falta un aspecto nuevo, se añade una variante
   acá y se usa por nombre.
