# Card — tarjeta

> El contenedor de todo el panel. Fondo blanco sobre papel, hairline de 1px y una sombra casi
> invisible: la tarjeta se despega del lienzo **por el borde, no por la profundidad**.
> Aparece en las nueve pantallas. Las tarjetas especializadas (`stat-card`, tarjetas de gráfico, la
> tarjeta de plan) heredan de esta y solo añaden contenido.

Ruta destino: `components/ui/card.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/card.tsx` ya trae `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`,
`CardContent` y `CardFooter`, con la variable interna `--card-spacing`. **Esa estructura es
exactamente la que piden las pantallas y se conserva.** Cambios:

1. `ring-1 ring-foreground/10` → `border border-[var(--border-hairline)]` + `shadow-[var(--shadow-rest)]`.
   El `ring` no es un borde: no ocupa espacio en el layout y hace que dos tarjetas contiguas
   separadas por `--sp-4` no midan lo mismo que una tabla con borde real.
2. `rounded-xl` → `--radius-card` (14px), en el Root y en los `*:[img:first-child]`.
3. `--card-spacing`: `--spacing(4)` → `var(--sp-6)` en `default` y `var(--sp-5)` en `sm`.
4. `CardTitle`: `text-base` → `--fs-h2` (20px) peso 600. `CardDescription`: `--fs-sm`,
   `--text-secondary`.
5. `CardFooter`: `bg-muted/50` → `--surface-sunken`, `border-t` → `--border-hairline`.
6. `bg-card` → `--surface` (se resuelve con el puente `--card` → `--surface` en `globals.css`).

━━━

## 1. Anatomía

```
┌──────────────────────────────────────────────────────────┐  ← --surface · borde --border-hairline
│                                                          │    --radius-card · --shadow-rest
│  Entradas recientes                      Ver todas →     │  ← CardHeader: CardTitle + CardAction
│  Gestiona y organiza tu contenido                        │  ← CardDescription (opcional)
│                                                          │
│  ────────────────────────────────────────────────────    │  ← divisor opcional
│                                                          │
│  [ contenido ]                                           │  ← CardContent
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [ acciones ]                                            │  ← CardFooter (--surface-sunken)
└──────────────────────────────────────────────────────────┘
```

| Parte | Regla |
|---|---|
| **Root** | `--surface`, borde 1px `--border-hairline`, `--radius-card`, `--shadow-rest`, `overflow: hidden`. `display: flex; flex-direction: column; gap: var(--card-spacing)`. Padding vertical `var(--card-spacing)`; el horizontal lo ponen las secciones, para que una imagen o una tabla puedan sangrar a los bordes. |
| **CardHeader** | Grid de `[1fr auto]` cuando hay `CardAction`. Título arriba, descripción debajo, gap `--sp-1`. |
| **CardTitle** | `--fs-h2` (20/1.3), peso 600, `--text-primary`. Sentence case. En una tarjeta `sm` baja a `--fs-h3` (16). |
| **CardDescription** | `--fs-sm`, `--text-secondary`. Una línea. Si hacen falta dos párrafos, no es una descripción de tarjeta. |
| **CardAction** | Esquina superior derecha. Es un `Button variant="enlace"` («Ver todas →», `02`), un `select` («Últimos 30 días», `02`) o un `icon-button`. **Nunca un CTA primario negro**: el negro va en la cabecera de la página, no dentro de cada tarjeta. |
| **CardContent** | Padding horizontal `var(--card-spacing)`. Una tabla dentro de una tarjeta lo anula y llega a los bordes; el hairline de la tarjeta hace de borde exterior de la tabla. |
| **CardFooter** | Fondo `--surface-sunken`, borde superior `--border-hairline`, padding `var(--card-spacing)`. Sin radio propio: lo hereda del `overflow: hidden` del Root. |

**Padding**: `md` (por defecto) = `--sp-6` (24px). `sm` = `--sp-5` (20px), que es el de `stat-card`.
No existe un `lg`: una tarjeta que necesita 32px de aire interior necesita en realidad ser una
sección de página.

**Grilla de tarjetas**: `gap: var(--sp-4)` entre tarjetas de métrica, `var(--sp-6)` entre bloques
mayores. `align-items: stretch` siempre — dos tarjetas hermanas de distinto alto rompen la lectura
de una fila.

━━━

## 2. Variantes

| `variant` | Fondo | Borde | Uso |
|---|---|---|---|
| `base` *(por defecto)* | `--surface` | `--border-hairline` | Todo el panel |
| `acento` | `--accent-tint` | `--accent-border` | **La tarjeta «Cuaderno Pro» del sidebar** (`02`, `04`, `09`) y cualquier bloque donde hable el producto: sugerencia de IA, siguiente paso del SEO Analyzer (`07`). Es índigo porque es el producto proponiendo algo, no porque sea importante. |
| `hundida` | `--surface-sunken` | ninguno | Bloque anidado dentro de otra tarjeta: un ejemplo de código, una vista previa. Sin borde: dos hairlines anidados a 16px de distancia se ven como un error de render. |
| `interactiva` | `--surface` | `--border-hairline` → `--border-strong` | La tarjeta entera es un `<a>`. Ver §3. |

**No hay variante `peligro`.** La «Zona de peligro» de `09` es una tarjeta `base` con un título, un
texto de advertencia y un `Button variant="destructivo"`. El rojo está en la acción, no en el
contenedor: una tarjeta roja grita antes de que el usuario haya hecho nada.

### Props

| Prop | Tipo | Por defecto |
|---|---|---|
| `variant` | ver arriba | `base` |
| `size` | `sm \| md` | `md` |
| `href` | string | — | Convierte el Root en `<a>` y activa los estados de §3 |

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | `--shadow-rest`. Es una sombra de 1px al 4% de opacidad: casi no se ve, y así debe ser. |
| **Hover — no interactiva** | **Ningún cambio.** Una tarjeta que reacciona al cursor sin ser pulsable enseña una mentira. |
| **Hover — interactiva** | Borde a `--border-strong` y sombra a `--shadow-float`, en `--dur-base` con `--ease-out`. **El fondo no cambia**: mover el fondo de una tarjeta grande produce un parpadeo de toda la zona. |
| **Pressed — interactiva** | Vuelve a `--shadow-rest` (se «apoya» otra vez en el papel). Sin `translate`. |
| **Foco — interactiva** | `box-shadow: var(--focus-ring)`, `outline: none`. El anillo va en el Root, con el radio de la tarjeta. |
| **Cargando** | La tarjeta se pinta completa —borde, padding, cabecera— y solo el contenido se sustituye por `skeleton`. **La tarjeta conserva su alto**: una grilla que se estira mientras cargan cuatro tarjetas es la peor primera impresión del panel. |
| **Vacía** | Estado vacío dentro del `CardContent`: icono en `--text-tertiary`, una frase, y como mucho un botón `secundario`. Nunca una tarjeta vacía sin explicación. |
| **Con error** | Un `alert` `destructivo` dentro del `CardContent`. La tarjeta no se pinta de rojo ni cambia de borde. |

Transiciones: solo `border-color` y `box-shadow`. Nunca `transform` ni `background-color`.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Fondo | `--surface` (`acento`: `--accent-tint`; `hundida`: `--surface-sunken`) |
| Borde | `--border-hairline` (`acento`: `--accent-border`; `hundida`: ninguno) → `--border-strong` en hover interactivo |
| Radio | `--radius-card` |
| Sombra | `--shadow-rest` → `--shadow-float` en hover interactivo |
| Padding (`--card-spacing`) | `--sp-6` (`sm`: `--sp-5`) |
| Gap interno | `--card-spacing` entre secciones, `--sp-1` entre título y descripción |
| Título | `--fs-h2` peso 600, `--text-primary` (`sm`: `--fs-h3`) |
| Descripción | `--fs-sm`, `--text-secondary` |
| Pie | `--surface-sunken` + borde superior `--border-hairline` |
| Foco | `--focus-ring` |
| Duración / curva | `--dur-base` (hover interactivo) · `--ease-out` |

**Una sola sombra de reposo en todo el producto.** Si una tarjeta parece necesitar más elevación
para destacarse, lo que le falta es espacio alrededor (`--sp-8`) o una cabecera, no sombra. La única
sombra fuerte del sistema (`--shadow-float`) está reservada a lo que el usuario acaba de abrir:
menús, popovers, modales, la paleta ⌘K.

**Modo oscuro**: sin reglas propias. En oscuro el hairline sube a `#26262A` y hace casi todo el
trabajo, porque `--shadow-rest` es negro sobre negro y desaparece — otra razón por la que el borde
nunca es opcional.

━━━

## 5. Accesibilidad

- **Elemento**: `<section>` cuando la tarjeta es una región con título (lleva
  `aria-labelledby` apuntando al `CardTitle`); `<article>` cuando es una unidad de contenido
  independiente (`stat-card`); `<a>` cuando es interactiva. Un `<div>` suelto no aporta estructura.
- **El título de la tarjeta es un encabezado real.** `CardTitle` renderiza `<h2>` o `<h3>` según el
  nivel de la página, no un `<div>` con tamaño de encabezado. En `02` hay seis tarjetas: quien
  navega por encabezados debe poder saltar entre ellas.
- **Un solo destino por tarjeta interactiva.** Una tarjeta que es enlace **no puede** contener otros
  enlaces o botones dentro: son inalcanzables con teclado y ambiguos con ratón. Si hace falta una
  acción secundaria, la tarjeta deja de ser enlace y el título pasa a serlo (patrón de «enlace
  extendido»: `<a>` en el título con un `::after` que cubre la tarjeta).
- **Zona táctil**: una tarjeta interactiva supera `--touch-target` por tamaño. Si dentro hay un
  enlace pequeño («Ver todas →»), ese enlace necesita 44px de alto en móvil.
- **Orden de lectura**: cabecera, contenido, pie. El `CardAction` está a la derecha visualmente pero
  va **después** del título en el DOM: el lector de pantalla debe oír de qué es la acción antes de
  oír la acción.
- **`overflow: hidden` no puede recortar el anillo de foco.** El foco vive en el Root, por fuera del
  recorte. Un elemento enfocado dentro de la tarjeta nunca queda medio tapado por el radio.
- **Contraste**: `--text-secondary` sobre `--surface` ≈ 4.6:1 y sobre `--surface-sunken` ≈ 4.4:1 —
  por eso la descripción en un pie hundido va a `--fs-sm` con peso 500, no con peso 400.
- **Cargando se anuncia una sola vez**: el contenedor de la grilla lleva `aria-busy="true"`
  mientras cargan; no lo lleva cada tarjeta, o el lector anuncia «ocupado» cuatro veces.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/card.tsx — el Root restilado
function Card({ className, variant = "base", size = "md", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden",
        "rounded-[var(--radius-card)] border py-(--card-spacing)",
        "text-[length:var(--fs-body)] text-[var(--text-primary)]",
        "[--card-spacing:var(--sp-6)] data-[size=sm]:[--card-spacing:var(--sp-5)]",
        "data-[variant=base]:border-[var(--border-hairline)] data-[variant=base]:bg-[var(--surface)]",
        "data-[variant=base]:shadow-[var(--shadow-rest)]",
        "data-[variant=acento]:border-[var(--accent-border)] data-[variant=acento]:bg-[var(--accent-tint)]",
        "data-[variant=hundida]:border-transparent data-[variant=hundida]:bg-[var(--surface-sunken)]",
        "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0",
        className,
      )}
      {...props}
    />
  )
}
```

```tsx
// 02 · «Entradas recientes» — sección con encabezado real y acción a la derecha
<Card asChild={false}>
  <section aria-labelledby="titulo-entradas-recientes">
    <CardHeader>
      <CardTitle id="titulo-entradas-recientes" render={<h2 />}>
        Entradas recientes
      </CardTitle>
      <CardAction>
        <Button variant="enlace" iconoFinal={ArrowRight} render={<Link href="/panel/entradas" />}>
          Ver todas
        </Button>
      </CardAction>
    </CardHeader>
    {/* la tabla sangra a los bordes: el hairline de la tarjeta es su borde exterior */}
    <CardContent className="px-0">
      <TablaEntradas filas={entradas} />
    </CardContent>
  </section>
</Card>

// 02 / 04 / 09 · tarjeta «Cuaderno Pro» del sidebar — índigo porque habla el producto
<Card variant="acento" size="sm">
  <CardHeader>
    <Sparkles aria-hidden="true" className="text-[var(--accent)]" />
    <CardTitle render={<h3 />}>Potencia tu blog</CardTitle>
    <CardDescription>Desbloquea funcionalidades avanzadas con Cuaderno Pro.</CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="secundario" size="sm" iconoFinal={ArrowRight}>Ver planes</Button>
  </CardContent>
</Card>
```

━━━

## 7. Reglas duras

1. **Borde hairline siempre.** Una tarjeta sin borde no existe en este sistema, ni siquiera en modo
   oscuro, ni siquiera con sombra.
2. **`--shadow-rest` y nada más.** `--shadow-float` es solo para lo que el usuario acaba de abrir.
3. **Sin CTA primario dentro de una tarjeta.** El negro vive en la cabecera de la página.
4. **La tarjeta no reacciona al cursor si no es pulsable.**
5. **Alto conservado al cargar.** El `skeleton` va dentro; la tarjeta no colapsa.
6. **Una tarjeta enlace no contiene otros enlaces.**
7. **El título es un encabezado real** (`<h2>`/`<h3>`), no un `<div>` grande.
8. **`--radius-card` en el Root y en cualquier imagen a sangre.** Un solo radio por tarjeta.
