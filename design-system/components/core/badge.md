# Badge — insignia de estado

> El badge **dice en qué estado está una cosa**. No es decoración, no es un botón y no se puede
> pulsar. Aparece en `02`, `03`, `05`, `06`, `07`, `09`.
> Los cuatro estados del contenido — Publicado, Borrador, Programado, Privada — son un vocabulario
> cerrado: se pintan igual en las seis pantallas o el usuario deja de poder leer una tabla de un
> vistazo.

Ruta destino: `components/ui/badge.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/badge.tsx` ya usa `useRender` de Base UI + `cva`. Se conserva el archivo y la API.
Cambios:

1. Reescribir `badgeVariants` con las variantes de §2 (los nombres viejos `default`, `secondary`,
   `destructive`, `outline`, `ghost`, `link` desaparecen: un badge no es un enlace ni tiene hover).
2. Subir el alto de `h-5` (20px) a 24px y el radio de `rounded-4xl` a `--radius-pill`.
3. Quitar del `cva` base `focus-visible:*` y `aria-invalid:*`: **el badge no recibe foco**. Si algo
   con forma de badge necesita foco, es un `chip` (ver `chip.md`).

━━━

## 1. Anatomía

```
   ┌──────────────────┐        ┌───────────────────┐
   │  Publicado       │        │  🔒  Privada      │
   └──────────────────┘        └───────────────────┘
          │                       │        │
          1                       2        1
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Etiqueta** | Una palabra, sentence case: «Publicado», «Borrador», «Programado», «Privada». Nunca mayúsculas, nunca plural si describe una fila singular. `white-space: nowrap`. |
| 2 | **Icono inicial** *(opcional)* | 12px, `stroke-width: 2`. Solo en los estados que lo piden: `Lock` en Privada (`05`), `Clock` en Programado cuando el badge va suelto fuera de una tabla. `aria-hidden="true"`. |

**Caja**: `inline-flex`, `align-items: center`, `gap: var(--sp-1)`, alto **24px**,
padding `0 var(--sp-2) + 2px` (10px efectivos), `border-radius: var(--radius-pill)`,
tipografía `--fs-sm` (13px) peso 500, `line-height: 1`.

Tamaño `sm` (alto 20px, `--fs-label` 12px, padding `0 var(--sp-2)`) solo dentro de celdas de tabla
muy densas y en el contador de un tab. No existe un tamaño `lg`.

━━━

## 2. Variantes

### 2.1 Los cuatro estados del contenido — vocabulario cerrado

| `variant` | Etiqueta | Fondo | Texto | Icono | Dónde |
|---|---|---|---|---|---|
| `publicado` | Publicado | `--perf-tint` | ver §2.3 (canal verde) | — | `02`, `03`, `05` |
| `borrador` | Borrador | `--warn-tint` | ver §2.3 (canal ámbar) | — | `03`, `05` |
| `programado` | Programado / Programada | `--accent-tint` | `--accent-pressed` | — | `02`, `03` |
| `privada` | Privada | `--neutral-tint` | ver §2.3 (canal neutro) | `Lock` 12px | `05` |

**Por qué cada uno lleva ese color** — es la ley de color del sistema aplicada al ciclo de vida de
una entrada, no una paleta:

- **Publicado es verde** porque verde = rendimiento y éxito: es lo único de la lista que ya está
  produciendo resultado.
- **Programado es índigo** porque índigo = el producto haciendo algo por vos: hay una máquina
  esperando una hora para publicar.
- **Borrador es ámbar** porque es trabajo sin terminar: advierte, no castiga.
- **Privada es neutra** porque no es un juicio, es una configuración de visibilidad.

> ⚠️ **Discrepancia conocida entre pantallas.** En `05-panel-paginas` el badge Borrador es ámbar;
> en `02-panel-resumen` la misma etiqueta aparece en gris neutro. **Gana `05`**: coincide con el
> contrato de tokens y con el README de las pantallas, y deja el gris libre para «Privada», que sí
> es un estado neutro. El gris de `02` es el outlier y se corrige al implementar.

### 2.2 Badges neutros (no describen estado de contenido)

| `variant` | Fondo | Texto | Uso |
|---|---|---|---|
| `neutro` | `--neutral-tint` | canal neutro (§2.3) | Contadores, «Sin categoría», metadatos de fila |
| `acento` | `--accent-tint` | `--accent-pressed` | «Pro» en la tarjeta de plan (`09`), «Nuevo», cualquier etiqueta de producto |
| `rendimiento` | `--perf-tint` | canal verde (§2.3) | Calificación cualitativa de una métrica: «Excelente», «Bien» (`02`, `07`) |
| `advertencia` | `--warn-tint` | canal ámbar (§2.3) | Severidad media en la lista de problemas de SEO (`07`) |
| `peligro` | `--danger-tint` | canal rojo (§2.3) | Severidad alta (`07`), «En papelera» (`03`) |
| `contorno` | `--surface` + borde `--border-hairline` | `--text-secondary` | Etiqueta sin carga semántica dentro de una tarjeta ya tintada |

### 2.3 La regla del texto del badge — una fórmula, una excepción

Un tinte del contrato es demasiado claro para llevar encima su propio sólido: `--perf-strong` sobre
`--perf-tint` da ≈3.4:1 y `--warn` sobre `--warn-tint` da ≈1.8:1. Ambos fallan AA. Por eso el texto
del badge **no es el sólido del canal**: es el sólido oscurecido contra la tinta del sistema.

```css
color: color-mix(in oklab, var(--perf-strong) 60%, var(--text-primary));  /* publicado */
color: color-mix(in oklab, var(--warn)        60%, var(--text-primary));  /* borrador */
color: color-mix(in oklab, var(--neutral)     60%, var(--text-primary));  /* privada, neutro */
color: color-mix(in oklab, var(--danger)      60%, var(--text-primary));  /* peligro */
```

No inventa tokens: usa los del contrato y los mezcla contra `--text-primary`. Y funciona sola en
modo oscuro, porque ahí `--text-primary` es casi blanco y la mezcla **aclara** el texto en vez de
oscurecerlo, que es exactamente lo que hace falta sobre un tinte oscuro.

**La excepción es el índigo**: el contrato ya trae un escalón oscuro suficiente
(`--accent-pressed` sobre `--accent-tint` ≈ 7.5:1), así que `programado` y `acento` lo usan directo,
sin mezcla. Es lo que muestran `02` y `09` pixel a pixel.

━━━

## 3. Estados

El badge **no tiene estados de interacción**. No hay hover, no hay pressed, no hay foco, no hay
disabled. Es texto con fondo.

| Situación | Comportamiento |
|---|---|
| **Reposo** | Único estado real. |
| **Cargando** | El badge no se pinta: en su lugar va un `skeleton` de 24px de alto y 72px de ancho con `--radius-pill`. Nunca un badge «vacío» ni un «—» dentro del badge. |
| **Dentro de un enlace** | Si toda la fila es un enlace, el badge va dentro y no captura el clic: `pointer-events: none`. |
| **Truncado** | No existe. Las etiquetas del vocabulario cerrado son de una palabra; si una etiqueta no cabe, el problema es la columna, no el badge. |

Ninguna transición. Un badge que cambia de estado **cambia de color de golpe**: el usuario acaba de
publicar y necesita verlo, no verlo aparecer.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Radio | `--radius-pill` |
| Alto | 24px (`sm`: 20px) |
| Padding horizontal | `--sp-2` + 2px |
| Gap icono–etiqueta | `--sp-1` |
| Tipografía | `--fs-sm`, peso 500 (`sm`: `--fs-label`, peso 600, sin mayúsculas — este es el único uso de `--fs-label` sin `text-transform: uppercase`) |
| Fondo publicado / rendimiento | `--perf-tint` |
| Fondo borrador / advertencia | `--warn-tint` |
| Fondo programado / acento | `--accent-tint` |
| Fondo privada / neutro | `--neutral-tint` |
| Fondo peligro | `--danger-tint` |
| Texto | fórmula de §2.3 sobre `--perf-strong` · `--warn` · `--neutral` · `--danger`; `--accent-pressed` sin mezcla |
| Fondo contorno | `--surface` + borde `--border-hairline`, texto `--text-secondary` |
| Sombra | **ninguna** |
| Borde | **ninguno**, salvo la variante `contorno` |

**Modo oscuro**: sin reglas propias. Los tintes se redefinen en el bloque oscuro de `colors.css` y
la fórmula de §2.3 se ajusta sola al voltear `--text-primary`.

━━━

## 5. Accesibilidad

- **El badge es texto, no un icono de color.** «Publicado» se lee tal cual con un lector de
  pantalla y se distingue sin ver el tono. Esa es la razón de que el vocabulario sea de palabras y
  no de puntos de color.
- **Elemento**: `<span>`. Nunca `<button>`, nunca `<a>`, nunca `tabindex`. Un badge que se puede
  pulsar es un `chip` mal etiquetado.
- **Sin `role="status"`.** El badge describe el estado de una fila, no anuncia un cambio. Cuando el
  estado cambia por una acción del usuario, quien lo anuncia es el `toast`.
- **Contraste**: todas las combinaciones de §2.3 superan 4.5:1 sobre su tinte. **Está prohibido**
  pintar el texto con el sólido crudo del canal (`--warn` sobre `--warn-tint` es ilegible: 1.8:1).
- **Icono decorativo**: `aria-hidden="true"`. El `Lock` de «Privada» duplica lo que ya dice la
  palabra; si el icono desapareciera, no se perdería información.
- **En una tabla**, la celda de estado lleva encabezado «Estado». El badge no necesita `aria-label`
  adicional: repetir «Estado: Publicado» en cada fila es ruido para el lector de pantalla.
- **Zoom al 200%**: el badge no se trunca ni se rompe en dos líneas — alto fijo y `nowrap`; si no
  cabe, la tabla hace scroll horizontal en su propio contenedor.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/badge.tsx — el cva restilado
import { cva } from "class-variance-authority"

const badgeVariants = cva(
  [
    "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-[var(--sp-1)]",
    "rounded-[var(--radius-pill)] px-2.5 text-[length:var(--fs-sm)] font-medium leading-none",
    "whitespace-nowrap [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        publicado:
          "bg-[var(--perf-tint)] text-[color-mix(in_oklab,var(--perf-strong)_60%,var(--text-primary))]",
        borrador:
          "bg-[var(--warn-tint)] text-[color-mix(in_oklab,var(--warn)_60%,var(--text-primary))]",
        programado: "bg-[var(--accent-tint)] text-[var(--accent-pressed)]",
        privada:
          "bg-[var(--neutral-tint)] text-[color-mix(in_oklab,var(--neutral)_60%,var(--text-primary))]",
        neutro:
          "bg-[var(--neutral-tint)] text-[color-mix(in_oklab,var(--neutral)_60%,var(--text-primary))]",
        acento: "bg-[var(--accent-tint)] text-[var(--accent-pressed)]",
        rendimiento:
          "bg-[var(--perf-tint)] text-[color-mix(in_oklab,var(--perf-strong)_60%,var(--text-primary))]",
        advertencia:
          "bg-[var(--warn-tint)] text-[color-mix(in_oklab,var(--warn)_60%,var(--text-primary))]",
        peligro:
          "bg-[var(--danger-tint)] text-[color-mix(in_oklab,var(--danger)_60%,var(--text-primary))]",
        contorno:
          "border border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-secondary)]",
      },
      size: {
        md: "h-6 px-2.5 text-[length:var(--fs-sm)]",
        sm: "h-5 px-2 text-[length:var(--fs-label)] font-semibold",
      },
    },
    defaultVariants: { variant: "neutro", size: "md" },
  },
)
```

```tsx
// 03 · celda de estado de la tabla de entradas — el estado sale del dato, no de la pantalla
const BADGE_ESTADO = {
  publicado:  { variant: "publicado",  texto: "Publicado" },
  borrador:   { variant: "borrador",   texto: "Borrador" },
  programado: { variant: "programado", texto: "Programado" },
  privada:    { variant: "privada",    texto: "Privada", icono: Lock },
} as const

export function BadgeEstado({ estado }: { estado: keyof typeof BADGE_ESTADO }) {
  const { variant, texto, icono: Icono } = BADGE_ESTADO[estado]
  return (
    <Badge variant={variant}>
      {Icono && <Icono aria-hidden="true" />}
      {texto}
    </Badge>
  )
}
```

━━━

## 7. Reglas duras

1. **Vocabulario cerrado.** Publicado, Borrador, Programado, Privada. Ninguna pantalla inventa un
   quinto estado ni renombra uno existente («Activo», «En vivo», «Draft» → no existen).
2. **Un estado, un color, en las nueve pantallas.** El mapa vive en un único objeto en código
   (`BADGE_ESTADO`), no en el `className` de cada tabla.
3. **El badge no se pulsa.** Sin hover, sin foco, sin `onClick`. Si necesita pulsarse es un `chip`.
4. **Nunca el sólido del canal como texto** sobre su propio tinte: es ilegible y falla AA.
5. **Sin sombra y sin borde**, salvo `contorno`.
6. **Sin transición al cambiar de estado.** El cambio se ve, no se anima.
