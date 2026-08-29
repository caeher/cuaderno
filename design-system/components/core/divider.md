# Divider — divisor

> El sistema se sostiene con **borde y aire**, no con profundidad. El divisor es la mitad «borde» de
> esa frase, y por eso es el componente más usado y el menos visible del producto.
> Referencias: separación entre el grupo de contenido y el grupo de herramientas de IA en el sidebar
> (`02`, `04`, `09`), línea bajo la fila de tabs (`03`, `07`), separación entre filas de tabla,
> separador de un `dropdown-menu`, borde inferior del topbar.

Ruta destino: `components/ui/separator.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/separator.tsx` ya envuelve `Separator` de `@base-ui/react/separator` y resuelve
orientación y semántica. **Se conserva íntegro.** Único cambio: `bg-border` → `bg-[var(--border-hairline)]`,
que se resuelve solo con el puente `--border` → `--border-hairline` en `globals.css`. Se añaden las
variantes de §2, que hoy no existen.

**Cuándo NO usar este componente**: cuando la línea es el borde de algo. El hairline bajo el topbar
es `border-bottom` del topbar; la línea entre dos filas de tabla es `border-bottom` de la fila. Un
`<div>` divisor de más entre elementos que ya tienen borde duplica la línea y la hace de 2px.

━━━

## 1. Anatomía

```
   ─────────────────────────────────────────────      1 · hairline horizontal

   ───────────────  o  ───────────────                2 · con etiqueta

   │                                                  3 · vertical (dentro de una fila)
```

| # | Variante | Composición |
|---|---|---|
| 1 | **Horizontal** | `height: 1px`, `width: 100%`, `background: var(--border-hairline)`. |
| 2 | **Con etiqueta** | La línea corre por detrás; la etiqueta va centrada sobre un fondo del mismo color que la superficie, con `padding: 0 var(--sp-3)`. Texto `--fs-label` en mayúsculas, `--text-tertiary`. |
| 3 | **Vertical** | `width: 1px`, `align-self: stretch`. Necesita que el contenedor tenga alto: dentro de un `flex` con `align-items: center` no se ve, y ese es el bug más común. |

**Grosor: 1px físico, siempre.** En pantallas de alta densidad se pinta con `background`, no con
`border`, para que el navegador no lo redondee a 0.5px y lo haga desaparecer a ratos.

━━━

## 2. Variantes

| `variant` | Color | Uso |
|---|---|---|
| `hairline` *(por defecto)* | `--border-hairline` | Todo. Es el 95% de los casos. |
| `fuerte` | `--border-strong` | Solo donde separa dos zonas de jerarquía distinta: el borde entre el sidebar y el contenido en modo oscuro, la línea sobre el pie de una tarjeta con acciones. |
| `etiquetado` | `--border-hairline` + texto | Separación de grupos en un formulario largo (`09`) o entre bloques del sidebar. |

| Prop | Tipo | Por defecto |
|---|---|---|
| `orientation` | `horizontal \| vertical` | `horizontal` |
| `variant` | ver arriba | `hairline` |
| `espaciado` | `none \| sm \| md \| lg` | `md` |

**Espaciado** — el margen que rodea al divisor es parte del componente, no del contenedor:

| `espaciado` | Margen | Uso |
|---|---|---|
| `none` | 0 | Dentro de una tabla o una lista de filas pegadas |
| `sm` | `--sp-2` | Menús, listas densas |
| `md` *(por defecto)* | `--sp-4` | Grupos del sidebar, secciones de una tarjeta |
| `lg` | `--sp-8` | Secciones mayores de una página de ajustes |

━━━

## 3. Estados

El divisor **no tiene estados**. No hay hover, ni foco, ni disabled, ni transición. Si algo con
forma de divisor responde al cursor, es un `resize handle` y es otro componente.

| Situación | Comportamiento |
|---|---|
| **Reposo** | Único estado. |
| **En modo oscuro** | Sube a `#26262A` por el contrato. No se «apaga» ni se baja la opacidad: un divisor con `opacity` sobre un fondo tintado cambia de color según lo que tenga detrás. |
| **Impresión** | Se mantiene. Es estructura, no decoración. |
| **Cargando** | No se oculta. La estructura de la página existe antes que los datos: un `skeleton` entre divisores se lee como una página cargando; sin divisores, como una página rota. |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Color | `--border-hairline` (`fuerte`: `--border-strong`) |
| Grosor | 1px |
| Margen | `--sp-2` / `--sp-4` / `--sp-8` según `espaciado` |
| Etiqueta | `--fs-label` en mayúsculas, `letter-spacing: .06em`, peso 600, `--text-tertiary` |
| Fondo de la etiqueta | El de la superficie donde vive: `--surface` en tarjeta, `--bg-sidebar` en sidebar, `--bg-page` en el lienzo |
| Sombra | **ninguna** |
| Transición | **ninguna** |

**Nunca `opacity` para atenuar un divisor.** Si se ve demasiado fuerte, el token equivocado es el
token, no la opacidad. El contrato tiene exactamente dos pesos de borde y son suficientes.

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **Decorativo por defecto.** Base UI pinta `role="separator"` con `aria-orientation`. Cuando el
  divisor solo aporta ritmo visual (entre dos párrafos de una tarjeta), es mejor `role="presentation"`:
  un lector de pantalla anunciando «separador» quince veces en una página de ajustes es ruido puro.
- **Semántico cuando separa grupos de navegación.** En el sidebar, la línea entre el grupo de
  contenido y el grupo de herramientas de IA **sí** es información: son dos secciones distintas del
  menú. Ahí se usa `role="separator"`, o mejor todavía, dos `<nav>` con su propio `aria-label`
  («Contenido», «Herramientas de IA»), y el divisor pasa a decorativo.
- **La etiqueta del divisor es texto real**, no un `::before` con `content`: tiene que poder
  seleccionarse, traducirse y leerse.
- **Contraste**: un divisor **no necesita cumplir 3:1**. No es un objeto de interfaz que haya que
  distinguir para operar el producto: es tipografía de estructura. Lo que sí es obligatorio es que
  exista — un `--border-hairline` mal aplicado que deje una tarjeta sin borde rompe el sistema
  entero, y esa sí es una pérdida de información.
- **Nunca es el único indicador de agrupación.** El grupo también tiene título, o espacio suficiente
  (`--sp-8`), o ambos.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/separator.tsx — restilado y con espaciado
const dividerVariants = cva("shrink-0", {
  variants: {
    variant: {
      hairline: "bg-[var(--border-hairline)]",
      fuerte: "bg-[var(--border-strong)]",
    },
    orientation: {
      horizontal: "h-px w-full",
      vertical: "w-px self-stretch",
    },
    espaciado: {
      none: "",
      sm: "data-horizontal:my-[var(--sp-2)] data-vertical:mx-[var(--sp-2)]",
      md: "data-horizontal:my-[var(--sp-4)] data-vertical:mx-[var(--sp-4)]",
      lg: "data-horizontal:my-[var(--sp-8)] data-vertical:mx-[var(--sp-8)]",
    },
  },
  defaultVariants: { variant: "hairline", orientation: "horizontal", espaciado: "md" },
})
```

```tsx
// 02 · sidebar — la mejor versión no usa divisor semántico: usa dos <nav> y un divisor decorativo
<nav aria-label="Contenido">…</nav>
<Separator role="presentation" espaciado="md" />
<nav aria-label="Herramientas de IA">…</nav>

// 09 · separación etiquetada dentro de un formulario largo
<div className="relative my-[var(--sp-8)]">
  <Separator role="presentation" espaciado="none" className="absolute inset-x-0 top-1/2" />
  <span className="relative mx-auto block w-fit bg-[var(--surface)] px-[var(--sp-3)]
                   text-[length:var(--fs-label)] font-semibold uppercase tracking-[.06em]
                   text-[var(--text-tertiary)]">
    Zona de peligro
  </span>
</div>

// vertical dentro del topbar — el contenedor DEBE tener alto
<div className="flex h-[var(--topbar-h)] items-center gap-[var(--sp-3)]">
  <BotonTema />
  <Separator orientation="vertical" espaciado="none" className="h-5" />
  <BotonNotificaciones />
</div>
```

━━━

## 7. Reglas duras

1. **1px, `--border-hairline`, siempre visible.** El sistema entero depende de que esta línea exista.
2. **Nunca con `opacity`.** Se cambia el token, no la transparencia.
3. **No se duplica un borde.** Si el elemento vecino ya tiene `border-bottom`, no va divisor.
4. **El margen es del divisor**, vía `espaciado`; el contenedor no lo compensa a mano.
5. **Un divisor vertical necesita un contenedor con alto.** `self-stretch` no inventa altura.
6. **Sin estados y sin transición.**
7. **Decorativo salvo que separe grupos de navegación**, donde antes que `role="separator"` va la
   solución mejor: dos `<nav>` etiquetados.
