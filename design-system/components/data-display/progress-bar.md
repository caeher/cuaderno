# Progress Bar — barra horizontal de proporción

> Las barras de `Dispositivos` en `08-panel-analiticas`: icono, nombre, valor, porcentaje y una barra
> índigo fina debajo. También es el componente para cuotas de plan (`09-panel-ajustes`), progreso de
> onboarding y cualquier "X de Y".
>
> **No necesita librería de gráficos**: son dos `div` y un `width` en porcentaje. Ver
> `line-chart.md` §0 — Recharts se reserva para línea y dona.

Ruta destino: `components/admin/progress-bar.tsx`

━━━

## 1. Anatomía

```
┌──────────────────────────────────────────────────────────┐
│  ┌────┐                                                  │
│  │ 🖥 │  Escritorio                    12.6K      50.6%   │ ← fila: icono + nombre + valor + %
│  └────┘                                                  │
│  ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← barra: relleno + pista
└──────────────────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Icono** (opcional) | Cuadro 32×32, `--radius-control`, fondo `--surface-sunken`, icono lucide 16px `--text-secondary`. En `08`: `Monitor`, `Smartphone`, `Tablet` |
| 2 | **Nombre** | `--fs-body` (14), peso 500, `--text-primary`. Trunca con ellipsis |
| 3 | **Valor absoluto** | `--fs-body`, peso 600, `--text-primary`, `tabular-nums`, alineado a la derecha |
| 4 | **Porcentaje** | `--fs-body`, `--text-secondary`, `tabular-nums`, un decimal (`50.6%`), ancho fijo de 56px para que la columna quede a plomo |
| 5 | **Pista** | Alto **6px**, `--radius-pill`, fondo `--surface-sunken`, ancho 100%. Siempre visible (es el "de 100%") |
| 6 | **Relleno** | Mismo alto y radio, ancho = `valor / total * 100%`, color según §2.2. Mínimo visible: **3px** cuando el valor es > 0 pero redondearía a nada |
| 7 | **Separación** | `--sp-2` entre la fila de texto y la barra; `--sp-5` entre barras consecutivas |

━━━

## 2. Variantes

### 2.1 Forma

| Variante | Uso | Diferencias |
|---|---|---|
| `distribucion` *(def.)* | `08` — Dispositivos | Icono + nombre + valor + % + barra. Un grupo de barras que **suman 100%** |
| `cuota` | `09` — almacenamiento, entradas del plan | Sin icono. Texto `2,4 GB de 10 GB usados` a la izquierda, `24%` a la derecha. Cambia de canal al acercarse al límite (§2.2) |
| `progreso` | Onboarding, importación, exportación | Una sola barra con etiqueta arriba (`Importando 34 de 120 entradas`). Admite estado indeterminado (§3) |
| `inline` | Dentro de una celda de tabla | Alto 4px, sin fila de texto; el número vive en la celda contigua. `aria-label` obligatorio |
| `apilada` | Comparar composición en una sola barra | Segmentos contiguos con la rampa `--cat-*` (misma secuencia que `donut-chart.md` §1.1) separados por 2px de `--surface`. Requiere leyenda debajo |

### 2.2 Color del relleno

| Variante | Color | Por qué |
|---|---|---|
| `distribucion` | `--accent` | Es lo que pinta `08`. Una cuota de dispositivos **no es un juicio de rendimiento**: es la misma "voz del dato" que la línea del gráfico, así que hereda su índigo. Pintarla de verde diría "el 50% de escritorio está bien", y eso no lo sabe nadie |
| `progreso` | `--accent` | El producto trabajando |
| `cuota` (0–79%) | `--accent` | Normal |
| `cuota` (80–94%) | `--warn` | Aviso: te estás acercando al límite |
| `cuota` (95–100%) | `--danger` | Límite alcanzado; se acompaña de un `alert` con la acción para resolverlo |
| `logro` | `--perf` | **Único caso verde**: cuando la barra mide algo conseguido contra una meta explícita (p. ej. `18 de 24 entradas optimizadas`). Ahí sí hay rendimiento |
| `apilada` | `--cat-*` | Rampa categórica, nunca canales semánticos |

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Barra en su ancho final |
| **Entrada** | El relleno crece de 0 a su ancho en **600ms `--ease-out`**, escalonado `40ms` entre barras del mismo grupo. Solo al montar |
| **Actualización** | `width` transiciona en `--dur-base --ease-out`. Si cruza un umbral de `cuota`, el color transiciona a la vez |
| **Hover** (en `distribucion` clicable) | Toda la fila toma fondo `--surface-sunken` y `--radius-control`; la barra sube a 8px de alto en `--dur-fast` |
| **Foco** | `--focus-ring` en la fila, no en la barra |
| **Cargando** | Pista visible + `skeleton` de la fila de texto. Si es `progreso` indeterminado: un segmento del 30% recorre la pista de izquierda a derecha en 1400ms lineal e infinito |
| **Valor 0** | Solo pista, y el número `0` con `0.0%`. **No** se dibuja un relleno de 3px: cero es cero |
| **Valor 100%** | El relleno cubre la pista entera; el `--radius-pill` de ambos coincide |
| **Sin datos** | Pista al 100% en `--surface-sunken`, valores en `—`, `aria-label` `Sin datos` |
| **`prefers-reduced-motion`** | Sin crecimiento de entrada ni escalonado; el indeterminado se sustituye por un pulso de opacidad de la pista |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Cuadro de icono | `--surface-sunken`, `--radius-control`, icono `--text-secondary` |
| Nombre | `--fs-body`, `--text-primary` |
| Valor | `--fs-body`, `--text-primary`, `tabular-nums` |
| Porcentaje | `--fs-body`, `--text-secondary`, `tabular-nums` |
| Pista | `--surface-sunken`, `--radius-pill`, alto 6px (4px en `inline`, 8px en hover) |
| Relleno `distribucion` / `progreso` / `cuota` normal | `--accent` |
| Relleno `cuota` 80–94% | `--warn` |
| Relleno `cuota` ≥95% | `--danger` |
| Relleno `logro` | `--perf` |
| Relleno `apilada` | `--cat-1`, `--cat-3`, `--cat-7`, `--cat-4`, `--cat-2`, `--cat-5`, `--cat-6`, `--cat-8` |
| Separador de segmentos apilados | `--surface`, 2px |
| Fila en hover | `--surface-sunken`, `--radius-control` |
| Foco | `--focus-ring` |
| Gaps | `--sp-2` (texto ↔ barra), `--sp-5` (entre barras), `--sp-3` (icono ↔ nombre) |
| Movimiento | 600ms entrada, `--dur-base` actualización, `--dur-fast` hover, `--ease-out` |

━━━

## 5. Accesibilidad

- **El color nunca es el único canal**: cada barra lleva **siempre** su nombre, su valor absoluto y
  su porcentaje escritos al lado. La barra es el refuerzo visual de un dato que ya está en texto —
  si se borraran todas las barras, la pantalla seguiría siendo legible.
- **Semántica**: `role="progressbar"` con `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`
  y `aria-valuetext="12.612 visitas, 50,6 por ciento"`. `aria-labelledby` apunta al `<span>` del
  nombre — nunca se repite el nombre en un `aria-label`.
- **Indeterminado**: se **omite** `aria-valuenow` (así el lector anuncia "en curso" en vez de "0%") y
  se añade `aria-busy="true"` en el contenedor.
- **Un grupo de barras es una lista**: `<ul>` con `aria-label="Distribución por dispositivo"`. El
  total de la distribución se anuncia una vez en un `<p class="sr-only">`, no barra por barra.
- **Contraste**: `--accent` sobre `--surface-sunken` supera 3:1 (WCAG 1.4.11). El único par
  problemático sería `--warn` sobre `--surface-sunken` en modo claro — por eso `cuota` en estado de
  aviso **añade siempre texto** (`Te queda un 12% de tu plan`), no confía en el color de la barra.
- **6px de alto es fino**: por eso el `--radius-pill` y el mínimo de 3px de relleno son obligatorios.
  Un relleno de 1px es invisible y comunica "cero" cuando el valor no es cero.
- **Zona táctil**: si la fila es interactiva, el objetivo es la fila completa (≥`--touch-target`),
  nunca la barra de 6px.
- **`prefers-contrast: more`**: la pista pasa a `--border-strong` y la barra sube a 8px.
- En la variante `apilada`, **leyenda obligatoria** con nombre + porcentaje por segmento (mismo
  criterio que `donut-chart.md` §5), y tramas SVG bajo `prefers-contrast: more`.

━━━

## 6. Marcado de ejemplo

```tsx
// components/admin/progress-bar.tsx
export function ProgressBar({
  id, nombre, icono: Icono, valor, total, valorAbreviado, variante = "distribucion", href,
}: ProgressBarProps) {
  const pct = total > 0 ? (valor / total) * 100 : 0;
  const ancho = pct > 0 && pct < 1 ? "3px" : `${pct}%`;   // mínimo visible

  const relleno =
    variante === "logro"                     ? "--perf"
    : variante === "cuota" && pct >= 95      ? "--danger"
    : variante === "cuota" && pct >= 80      ? "--warn"
    : "--accent";

  const Fila = href ? "a" : "div";

  return (
    <li>
      <Fila
        {...(href ? { href } : {})}
        className={[
          "block rounded-[var(--radius-control)] p-[var(--sp-2)]",
          href && "hover:bg-[var(--surface-sunken)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
        ].filter(Boolean).join(" ")}
      >
        <div className="flex items-center gap-[var(--sp-3)]">
          {Icono && (
            <span aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-control)]
                             bg-[var(--surface-sunken)] text-[var(--text-secondary)]">
              <Icono size={16} strokeWidth={1.75} />
            </span>
          )}

          <span id={`${id}-nombre`}
                className="flex-1 truncate text-[length:var(--fs-body)] font-medium text-[var(--text-primary)]">
            {nombre}
          </span>

          <span className="text-[length:var(--fs-body)] font-semibold text-[var(--text-primary)]
                           [font-variant-numeric:tabular-nums]">
            {valorAbreviado}
          </span>
          <span className="w-14 text-right text-[length:var(--fs-body)] text-[var(--text-secondary)]
                           [font-variant-numeric:tabular-nums]">
            {pct.toFixed(1)}%
          </span>
        </div>

        {/* pista + relleno: el dato ya está escrito arriba; esto es refuerzo visual */}
        <div
          role="progressbar"
          aria-labelledby={`${id}-nombre`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Number(pct.toFixed(1))}
          aria-valuetext={`${valor.toLocaleString("es")} de ${total.toLocaleString("es")}, ${pct.toFixed(1)} por ciento`}
          className="mt-[var(--sp-2)] h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)]
                     bg-[var(--surface-sunken)]"
        >
          <div
            style={{ width: ancho, background: `var(${relleno})` }}
            className="h-full rounded-[var(--radius-pill)]
                       [transition:width_var(--dur-base)_var(--ease-out),background_var(--dur-base)_var(--ease-out)]
                       motion-reduce:transition-none"
          />
        </div>
      </Fila>
    </li>
  );
}

// grupo
<ul aria-label="Distribución por dispositivo" className="flex flex-col gap-[var(--sp-5)]">
  {dispositivos.map((d) => <ProgressBar key={d.id} {...d} />)}
</ul>
```

━━━

## 7. Reglas duras

1. **Cero dependencias.** Dos `div` y un `width`.
2. **La pista siempre se dibuja.** Sin ella no hay "de cuánto".
3. **El número escrito manda; la barra acompaña.**
4. **Verde solo en `logro`.** Una distribución no es un logro.
5. **Mínimo 3px de relleno para valores > 0**, y 0px exactos para el cero.
6. **`aria-valuetext` con el dato humano**, no solo el porcentaje crudo.
