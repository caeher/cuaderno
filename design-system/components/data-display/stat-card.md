# Stat Card — tarjeta de métrica

> El componente más repetido del panel. Aparece en **5 de las 9 pantallas**: `02-panel-resumen`,
> `05-panel-paginas`, `06-panel-categorias`, `07-panel-seo-analyzer`, `08-panel-analiticas`.
> Si dos pantallas pintan una métrica de forma distinta, es porque son **variantes del mismo
> componente**, no dos componentes.

Ruta destino: `components/admin/stat-card.tsx`

━━━

## 1. Anatomía

```
┌──────────────────────────────────────────────┐  ← tarjeta: --surface, borde --border-hairline,
│  ┌────┐                                      │     --radius-card, --shadow-rest, padding --sp-5
│  │ ◆  │  Visitas                             │  ← fila 1: cuadro de icono + label
│  └────┘                                      │
│                                              │
│  24.8K   ↑ 18.6%                             │  ← fila 2: valor + delta
│                                              │
│  vs. 1 Abr - 30 Abr 2024                     │  ← fila 3: texto de comparación
└──────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Cuadro de icono** | 36×36 (`sm`) / 40×40 (`md`). `--radius-control`. Fondo = tinte categórico. Icono lucide 18–20px, `stroke-width: 1.75`, color = el sólido del mismo canal. **Opcional**: `05-panel-paginas` lo sustituye por un `category-dot` y `06` lo omite en una de las tarjetas. |
| 2 | **Label** | `--fs-body` (14), peso 500, `--text-secondary`. Sentence case. Nunca mayúsculas. Una línea, `text-overflow: ellipsis`. |
| 3 | **Valor** | `--fs-h1` (30 / 1.15), peso 700, `--text-primary`, **`font-variant-numeric: tabular-nums` obligatorio**. Formato abreviado (`24.8K`, `3.2K`, `1.2M`) con el valor exacto en `title`/tooltip. |
| 4 | **Sufijo del valor** | Opcional, en línea con el valor: `/100`, `de 24`, `Posicionando`, `Visitas/mes`. `--fs-body`, peso 400, `--text-secondary`. Nunca tabular si es texto. |
| 5 | **Delta** | Flecha ↑/↓ + porcentaje. Ver §2.3. |
| 6 | **Texto de comparación** | `--fs-sm` (13), `--text-tertiary`. `vs. últimos 30 días`, `vs. 1 Abr - 30 Abr 2024`, `vs. mes anterior`, `Entradas sin categorizar`. |
| 7 | **Adorno** (opcional) | `score-ring` a la derecha (`02`), sparkline debajo del valor (`07`), enlace índigo `Ver todas →` (`06`). Mutuamente excluyentes: **máximo un adorno por tarjeta**. |

**Ritmo vertical**: `--sp-4` entre fila 1 y fila 2, `--sp-2` entre fila 2 y fila 3. Alto mínimo 116px
para que una grilla de tarjetas con y sin delta quede alineada (`align-items: stretch` en la grilla).

**Grilla**: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`, `gap: --sp-4`.
4 columnas en `02`/`05`/`06`/`07`, 5 en `08`. A ≤900px pasa a 2 columnas, a ≤560px a 1.

━━━

## 2. Variantes

### 2.1 Por contenido (`variant`)

| Variante | Dónde | Qué añade |
|---|---|---|
| `metrica` *(por defecto)* | `08` — Visitas, Visitantes únicos | Valor numérico + delta + comparación. |
| `score` | `02` — SEO Score prom. | Valor + sufijo `/100` + badge cualitativo + `score-ring` `sm` a la derecha. |
| `sparkline` | `07` — Entradas optimizadas | Valor + sufijo `de 24` + sparkline de 12–20 puntos bajo el valor. |
| `estado` | `05` — Publicadas / Borradores / Privadas | `category-dot` en vez del cuadro de icono; valor + `% del total` como sufijo; sin delta. |
| `texto` | `06` — Categoría más popular | El valor **no es un número**: es texto (`Inteligencia Artificial`) a `--fs-h2` (20), peso 600, hasta 2 líneas. Subtexto `23 entradas`. **Sin tabular-nums.** |
| `enlace` | `06` — Entradas en total | En lugar del texto de comparación, un enlace `Ver todas →` en `--accent`, `--fs-sm`, peso 500. |

### 2.2 Tinte del cuadro de icono (`tone`)

El tinte del cuadro es una **etiqueta categórica, no un juicio semántico**. Sirve para que el ojo
distinga cinco tarjetas de un vistazo; no dice "esto va bien" ni "esto va mal". Por eso puede usar la
rampa `--cat-*` sin romper la ley de color: quien juzga es el **delta**, no el cuadro.

| `tone` | Fondo | Icono | Uso en las pantallas |
|---|---|---|---|
| `accent` *(por defecto)* | `--accent-tint` | `--accent` | Todas las tarjetas de `02`; Visitas y Tasa de rebote en `08` |
| `perf` | `--perf-tint` | `--perf-strong` | Visitantes únicos (`08`), Entradas en total (`06`) |
| `warn` | `--warn-tint` | `--warn` | Vistas de página (`08`), Tiempo medio de lectura (`08`), Categoría más popular (`06`) |
| `neutral` | `--neutral-tint` | `--neutral` | Sin categoría (`06`), Total de páginas (`05`) |

> **Prohibido**: usar `--danger-tint` en el cuadro de icono. El rojo del sistema es destructivo o
> pérdida medida; una métrica no es destructiva por existir.

### 2.3 Delta (`delta`)

| Prop | Valores | Efecto |
|---|---|---|
| `delta.valor` | número | `18.6` → se pinta `18.6%`. `0` → se pinta `Sin cambios` en `--text-tertiary`, sin flecha. |
| `delta.direccion` | `sube` \| `baja` \| `plano` | Flecha `↑` / `↓` / `→` (lucide `ArrowUp`, `ArrowDown`, `Minus`). |
| `delta.estilo` | `plano` *(def.)* \| `pill` | `plano`: texto coloreado junto al valor (`07`, `08`). `pill`: fondo tinte + `--radius-pill` + padding `2px 8px` (`02`). |
| `delta.polaridad` | `directa` *(def.)* \| `inversa` | `directa`: sube = `--perf`, baja = `--danger` — **es lo que pintan las pantallas**. `inversa` invierte el color para métricas donde bajar es bueno (tasa de rebote, tiempo de carga). Es opt-in porque `08` pinta la tasa de rebote en rojo aunque baje; si se activa, la flecha sigue apuntando a la dirección real del dato. |

Tipografía del delta: `--fs-sm` (13), peso 600, `tabular-nums`. Flecha 12px, `stroke-width: 2.5`,
`vertical-align: -1px`.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Como se describe arriba. `--shadow-rest`. |
| **Cargando** | `skeleton` con el patrón `metrica` (ver `feedback/skeleton.md`). La tarjeta conserva su alto exacto: **nunca colapsa ni salta el layout**. |
| **Sin datos** | Valor `—` en `--text-tertiary`, sin delta, texto de comparación → `Sin datos todavía`. El cuadro de icono se mantiene en `neutral`. |
| **Interactiva** (`href` presente) | La tarjeta entera es un `<a>`: `hover` sube el borde a `--border-strong` y la sombra a `--shadow-float` en `--dur-base --ease-out`. `cursor: pointer`. Sin cambio de fondo. |
| **Foco** | `box-shadow: var(--focus-ring)` en la tarjeta, `outline: none`. Solo cuando es interactiva. |
| **Error de carga** | La tarjeta **no** muestra el error: se muestra un `alert` `destructivo` sobre la grilla completa y las tarjetas quedan en `Sin datos`. Cinco errores repetidos son ruido, uno es información. |

Transiciones: solo `border-color` y `box-shadow`, `--dur-fast`. El **valor nunca anima al cambiar**
(ni count-up ni fade): una métrica que se mueve sola es una métrica en la que no se confía.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Fondo tarjeta | `--surface` |
| Borde | `--border-hairline` (1px) → `--border-strong` en hover interactivo |
| Radio | `--radius-card` |
| Sombra | `--shadow-rest` → `--shadow-float` en hover interactivo |
| Padding | `--sp-5` (20px); `--sp-6` en `08` cuando la tarjeta lleva sufijo largo |
| Gap interno | `--sp-4` / `--sp-2` |
| Cuadro de icono — radio | `--radius-control` |
| Cuadro de icono — fondo/icono | `--accent-tint`/`--accent` · `--perf-tint`/`--perf-strong` · `--warn-tint`/`--warn` · `--neutral-tint`/`--neutral` |
| Label | `--fs-body`, `--text-secondary` |
| Valor | `--fs-h1`, `--text-primary`, `tabular-nums` |
| Sufijo | `--fs-body`, `--text-secondary` |
| Delta positivo | `--perf` (texto) sobre `--perf-tint` (pill) |
| Delta negativo | `--danger` (texto) sobre `--danger-tint` (pill) |
| Delta plano | `--text-tertiary` sobre `--neutral-tint` |
| Comparación | `--fs-sm`, `--text-tertiary` |
| Enlace `Ver todas →` | `--fs-sm`, `--accent` → `--accent-hover` |
| Sparkline | `--perf` (trazo 2px, sin área) en `07`; `--accent` si la métrica no mide rendimiento |
| Foco | `--focus-ring` |
| Duración | `--dur-fast` / `--ease-out` |

**Modo oscuro**: la tarjeta no define ningún color propio — todo sale de los tokens, así que hereda
el tema sin una sola regla extra. El único cuidado: los tintes (`--accent-tint`, `--perf-tint`,
`--warn-tint`) deben estar redefinidos en el bloque oscuro del contrato de tokens, no aquí.

━━━

## 5. Accesibilidad

- **El color nunca es el único canal.** El delta lleva **siempre** flecha (↑ ↓ →) además del color;
  el signo del porcentaje se lee sin ver el color. Un daltónico deuteranope distingue la tarjeta.
- **Semántica**: la tarjeta es una `<article>` (o `<a>` si es interactiva). El valor va en un
  elemento con `aria-label` que dice el número exacto y la unidad — la pantalla muestra `24.8K`, el
  lector de pantalla debe oír `24.842 visitas`.
- **El delta se anuncia como frase, no como símbolo**: `aria-label="Sube 18,6% respecto a 1 de abril
  – 30 de abril de 2024"`. La flecha decorativa lleva `aria-hidden="true"`.
- **El cuadro de icono es decorativo**: `aria-hidden="true"`. El icono nunca es el único portador de
  significado; el label de texto siempre está presente.
- **Sparkline y ring**: ver `line-chart.md` §5 y `score-ring.md` §5 — ambos exponen tabla oculta o
  `aria-label` narrativo. Dentro de una stat card basta con que el `aria-label` de la tarjeta resuma
  la tendencia (`tendencia al alza en los últimos 30 días`).
- **Contraste**: `--text-secondary` sobre `--surface` cumple 4.5:1; `--text-tertiary` se usa solo en
  texto de apoyo de ≥13px que **duplica** información ya disponible, nunca para dato único.
- **Zona táctil**: si la tarjeta es interactiva, toda ella es el target (mucho mayor que
  `--touch-target`). Si solo el enlace `Ver todas →` lo es, ese enlace necesita `min-height:
  var(--touch-target)` en móvil.
- **`prefers-reduced-motion`**: no hay animación de entrada ni contadores, así que no hay nada que
  desactivar. Es un objetivo de diseño, no una casualidad.

━━━

## 6. Marcado de ejemplo

```tsx
// components/admin/stat-card.tsx  (extracto)
import { ArrowUp, ArrowDown, Minus, type LucideIcon } from "lucide-react";

type Tone = "accent" | "perf" | "warn" | "neutral";

const TONE: Record<Tone, string> = {
  accent:  "bg-[var(--accent-tint)]  text-[var(--accent)]",
  perf:    "bg-[var(--perf-tint)]    text-[var(--perf-strong)]",
  warn:    "bg-[var(--warn-tint)]    text-[var(--warn)]",
  neutral: "bg-[var(--neutral-tint)] text-[var(--neutral)]",
};

export function StatCard({
  icono: Icono, label, valor, valorExacto, sufijo, delta, comparacion,
  tone = "accent", href, adorno,
}: StatCardProps) {
  const Root = href ? "a" : "article";

  return (
    <Root
      {...(href ? { href } : {})}
      className={[
        "flex min-h-[116px] flex-col gap-[var(--sp-4)] rounded-[var(--radius-card)]",
        "border border-[var(--border-hairline)] bg-[var(--surface)] p-[var(--sp-5)]",
        "shadow-[var(--shadow-rest)] transition-[border-color,box-shadow]",
        "duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        href && "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-float)]",
        href && "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
      ].filter(Boolean).join(" ")}
    >
      {/* fila 1 — icono + label */}
      <div className="flex items-center gap-[var(--sp-3)]">
        <span
          aria-hidden="true"
          className={`grid size-10 place-items-center rounded-[var(--radius-control)] ${TONE[tone]}`}
        >
          <Icono size={18} strokeWidth={1.75} />
        </span>
        <span className="truncate text-[length:var(--fs-body)] font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      </div>

      {/* fila 2 — valor + delta */}
      <div className="flex flex-1 items-baseline gap-[var(--sp-3)]">
        <span
          aria-label={`${valorExacto ?? valor} ${label.toLowerCase()}`}
          className="text-[length:var(--fs-h1)] font-bold leading-[1.15] text-[var(--text-primary)] [font-variant-numeric:tabular-nums]"
        >
          {valor}
        </span>
        {sufijo && (
          <span className="text-[length:var(--fs-body)] text-[var(--text-secondary)]">{sufijo}</span>
        )}
        {delta && <Delta {...delta} comparacion={comparacion} />}
      </div>

      {adorno /* score-ring | sparkline | enlace "Ver todas →" */}

      {/* fila 3 — comparación */}
      {comparacion && (
        <p className="text-[length:var(--fs-sm)] text-[var(--text-tertiary)]">{comparacion}</p>
      )}
    </Root>
  );
}

function Delta({ valor, direccion, estilo = "plano", polaridad = "directa", comparacion }: DeltaProps) {
  const bueno = polaridad === "directa" ? direccion === "sube" : direccion === "baja";
  const Flecha = direccion === "sube" ? ArrowUp : direccion === "baja" ? ArrowDown : Minus;

  const color =
    direccion === "plano" ? "text-[var(--text-tertiary)]"
    : bueno ? "text-[var(--perf)]" : "text-[var(--danger)]";

  const fondo =
    estilo !== "pill" ? ""
    : direccion === "plano" ? "bg-[var(--neutral-tint)]"
    : bueno ? "bg-[var(--perf-tint)]" : "bg-[var(--danger-tint)]";

  const verbo = direccion === "sube" ? "Sube" : direccion === "baja" ? "Baja" : "Sin cambios";

  return (
    <span
      aria-label={`${verbo} ${valor}%${comparacion ? ` ${comparacion}` : ""}`}
      className={[
        "inline-flex items-center gap-[var(--sp-1)] text-[length:var(--fs-sm)] font-semibold",
        "[font-variant-numeric:tabular-nums]", color, fondo,
        estilo === "pill" && "rounded-[var(--radius-pill)] px-[var(--sp-2)] py-[2px]",
      ].filter(Boolean).join(" ")}
    >
      <Flecha size={12} strokeWidth={2.5} aria-hidden="true" />
      {valor}%
    </span>
  );
}
```

━━━

## 7. Reglas duras

1. **Un adorno por tarjeta.** Ring, sparkline o enlace — nunca dos.
2. **Tabular-nums siempre** en el valor y en el delta. Cinco tarjetas en fila con números
   proporcionales se ven rotas al actualizarse.
3. **El delta juzga; el cuadro de icono etiqueta.** Si el índigo del cuadro empieza a significar
   "bien", el sistema perdió su ley de color.
4. **Nunca abreviar sin dar el exacto.** `24.8K` en pantalla, `24.842` en `aria-label` y `title`.
5. **Alto fijo en carga.** El skeleton ocupa el mismo alto que la tarjeta llena.
6. **Sin sombras de elevación.** La tarjeta se sostiene con hairline y aire, como todo el sistema.
