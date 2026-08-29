# Donut Chart — dona con leyenda de porcentajes

> El gráfico de `Fuentes de tráfico` en `08-panel-analiticas`: dona a la izquierda, leyenda a la
> derecha con punto de color, nombre, valor absoluto y porcentaje entre paréntesis.
> **La leyenda no es un adorno: es el gráfico.** La dona da la proporción de un vistazo; la leyenda
> da el dato exacto y es lo que hace el componente legible sin color.

Ruta destino: `components/admin/charts/donut-chart.tsx`

━━━

## 0. Librería

Misma decisión que en `line-chart.md` §0: **Recharts v3** (`<PieChart>` + `<Pie innerRadius>`),
SVG en el DOM, colores por `var(--token)` para que el modo oscuro sea gratis. La leyenda **no** usa
`<Legend>` de Recharts: se escribe a mano como lista HTML, porque tiene que ser una lista semántica
navegable, con números tabulares y alineación en dos columnas. Ver la justificación completa y las
alternativas descartadas en `line-chart.md` §0.

━━━

## 1. Anatomía

```
┌─────────────────────────────────────────────────────────────────┐
│ Fuentes de tráfico ⓘ                            [ Visitas ▾ ]   │
│                                                                 │
│         ╭─────────╮        ● Búsqueda orgánica  12.4K (50.0%)   │
│       ╱             ╲      ● Tráfico directo     6.2K (25.0%)   │
│      │    ╭─────╮    │     ● Referencias         3.7K (14.9%)   │
│      │    │     │    │     ● Redes sociales      1.8K  (7.3%)   │
│       ╲   ╰─────╯   ╱      ● Email               0.5K  (2.0%)   │
│         ╰─────────╯        ● Otros               0.2K  (0.8%)   │
└─────────────────────────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Tarjeta** | `--surface`, `--border-hairline`, `--radius-card`, padding `--sp-6`, `--shadow-rest` |
| 2 | **Título + ⓘ** | `--fs-h3` (16), peso 600, `--text-primary`; icono `Info` 14px `--text-tertiary` con tooltip que explica cómo se atribuye cada fuente |
| 3 | **Selector de métrica** | `Visitas / Visitantes / Conversiones`, alto 32px, `--radius-control` |
| 4 | **Dona** | Radio exterior 100px, radio interior **58%** del exterior (58px). Segmentos separados por `padding-angle: 1.5°` con `stroke: var(--surface)` de 2px — así el hueco es del color de la tarjeta y funciona en claro y oscuro sin tocar nada |
| 5 | **Centro** | **Vacío por defecto**, como en la pantalla. Opcional (`centro="total"`): total en `--fs-h2` peso 700 `tabular-nums` + etiqueta en `--fs-label` `--text-tertiary` |
| 6 | **Leyenda** | Lista vertical a la derecha. Cada ítem: punto 8×8 `--radius-pill` + nombre (`--fs-body`, `--text-secondary`) + valor y porcentaje alineados a la derecha (`--fs-body`, `--text-secondary`, `tabular-nums`). Gap vertical `--sp-3` |
| 7 | **Layout** | `grid-template-columns: 200px 1fr`, gap `--sp-6`. A ≤720px la leyenda pasa debajo de la dona |

### 1.1 Asignación de color

Los segmentos se ordenan **de mayor a menor** y reciben la rampa `--cat-*` en esta secuencia fija:

```
--cat-1 (índigo) → --cat-3 (verde) → --cat-7 (amarillo) → --cat-4 (naranja)
      → --cat-2 (azul) → --cat-5 (rosa) → --cat-6 (teal)
```

`--cat-8` (gris) está **reservado** para el bucket `Otros` y no se usa nunca en un segmento con
identidad propia. Esta secuencia reproduce exactamente lo que pinta `08` y garantiza que dos
segmentos contiguos —los que más fácil se confunden— no compartan tono.

> El uso de `--cat-1` (índigo) y `--cat-3` (verde) aquí **no** rompe la ley de color: no son los
> canales semánticos `--accent` ni `--perf`, son la rampa **categórica**, cuyo único trabajo es
> distinguir categorías entre sí. Por eso el sistema tiene dos familias separadas y por eso los
> segmentos deben apuntar a `--cat-*` y jamás a `--accent`/`--perf`.

### 1.2 Bucket `Otros`

Máximo **6 segmentos con identidad + 1 de `Otros`**. Lo que caiga por debajo del 1% o fuera del
top 6 se agrega en `Otros` (`--cat-8`), que siempre va **último** en la leyenda aunque su valor
supere al anterior. En hover, `Otros` muestra en el tooltip las 3 fuentes principales que agrupa.

━━━

## 2. Variantes

| Variante | Uso | Diferencias |
|---|---|---|
| `con-leyenda` *(def.)* | `08` — Fuentes de tráfico | Dona 200px + leyenda lateral |
| `compacta` | Tarjeta estrecha o móvil | Dona 140px, leyenda debajo en dos columnas |
| `con-total` | Cuando el total es la lectura principal | Añade total y etiqueta al centro |
| `mini` | Junto a una métrica en una fila | Dona 40px sin leyenda; el desglose vive en el tooltip. Requiere `aria-label` completo |

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Segmentos estáticos |
| **Hover de segmento** | El segmento crece 4px hacia fuera (`outerRadius + 4`) en `--dur-fast --ease-out`; los demás bajan a `opacity: .55`. El ítem correspondiente de la leyenda toma fondo `--surface-sunken` y `--radius-control` |
| **Hover de leyenda** | **Simétrico**: resalta el segmento igual que el hover directo. La leyenda es un control, no una etiqueta |
| **Selección** (opcional) | Clic en un ítem lo aísla: el resto baja a `opacity: .3` y aparece un chip `Filtrado: Búsqueda orgánica ✕` sobre la tarjeta |
| **Tooltip** | `--surface`, `--border-hairline`, `--radius-control`, `--shadow-float`, padding `--sp-3`. Muestra nombre, valor absoluto exacto (`12.412`, no `12.4K`) y porcentaje |
| **Cargando** | `skeleton` patrón `grafico`: círculo en `--surface-sunken` + 6 líneas de leyenda. Alto idéntico al del gráfico lleno |
| **Vacío** | `empty-state` compacto: `Sin datos de tráfico todavía`. **Nunca** una dona gris al 100% |
| **Un solo valor** | Dona completa en `--cat-1` con leyenda de un ítem al `100.0%`. Válido, no es un caso de error |
| **Entrada** | Los segmentos barren desde `-90°` en 600ms `--ease-out`, una sola vez |
| **Foco de teclado** | Cada ítem de la leyenda es focusable y resalta su segmento; `Enter` filtra. Los segmentos SVG **no** son focusables (duplicaría paradas de tabulación) |
| **`prefers-reduced-motion`** | Sin barrido de entrada ni crecimiento en hover; el resalte se hace solo con opacidad |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Tarjeta | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-rest`, `--sp-6` |
| Título | `--fs-h3`, `--text-primary` |
| Separación entre segmentos | `stroke: var(--surface)` 2px |
| Segmentos (por rango desc.) | `--cat-1`, `--cat-3`, `--cat-7`, `--cat-4`, `--cat-2`, `--cat-5`, `--cat-6` |
| Bucket `Otros` | `--cat-8` |
| Punto de leyenda | mismo `--cat-*` del segmento, 8×8, `--radius-pill` |
| Nombre en leyenda | `--fs-body`, `--text-secondary` |
| Valor + porcentaje | `--fs-body`, `--text-secondary`, `tabular-nums` |
| Ítem de leyenda en hover/foco | `--surface-sunken`, `--radius-control` |
| Centro (variante `con-total`) | `--fs-h2` peso 700 `--text-primary` + `--fs-label` `--text-tertiary` |
| Tooltip | `--surface`, `--border-hairline`, `--radius-control`, `--shadow-float`, `--sp-3` |
| Foco | `--focus-ring` |
| Movimiento | `--dur-fast` (hover), 600ms entrada, `--ease-out` |

━━━

## 5. Accesibilidad

> Una dona es el gráfico **más hostil** para daltonismo: seis áreas adyacentes cuya única diferencia
> es el tono. Por eso en Cuaderno la dona nunca viaja sola.

- **La leyenda con texto y porcentaje es obligatoria** (salvo la variante `mini`, que exige
  `aria-label` con el desglose completo). Cualquiera puede leer el gráfico entero sin percibir un
  solo color: los números están escritos.
- **Orden estable**: los ítems van siempre de mayor a menor, y la dona empieza en las 12 y va en
  sentido horario. El **orden** es un segundo canal: el primer ítem de la lista es el segmento que
  arranca arriba.
- **`prefers-contrast: more` y opción "Patrones en gráficos"**: cada segmento recibe además una
  trama SVG (`<pattern>`: diagonales, puntos, cuadrícula, diagonales inversas, líneas horizontales,
  liso) y el punto de la leyenda replica la misma trama. Los `<pattern>` se definen una vez en el
  `<defs>` del componente y se referencian por `fill="url(#trama-2)"`.
- **Tabla equivalente**: `<table class="sr-only">` con fuente, valor absoluto y porcentaje; el SVG va
  `aria-hidden="true"`. Botón `Ver datos como tabla` para revelarla visualmente.
- **Resumen narrativo** en el contenedor: `role="img"` +
  `aria-label="Fuentes de tráfico: búsqueda orgánica 50,0% (12.412 visitas), tráfico directo 25,0%
  (6.203), referencias 14,9% (3.698), redes sociales 7,3% (1.812), email 2,0% (497), otros 0,8% (198)."`
- **Contraste entre segmentos adyacentes**: la separación de 1.5° con `stroke` del color de la
  tarjeta garantiza un borde visible aunque dos colores tengan luminancia parecida. **Sin esa
  separación, la dona es ilegible en escala de grises** — no es decoración, es accesibilidad.
- **Teclado**: `Tab` entra en la lista de leyenda, `↑`/`↓` recorren ítems, `Enter` filtra, `Esc`
  quita el filtro. Cada ítem anuncia `Búsqueda orgánica, 12.412 visitas, 50 por ciento del total`.
- **Los porcentajes se escriben con un decimal** (`50.0%`, `0.8%`) y `tabular-nums`, para que la
  columna quede alineada y sumen visiblemente 100.
- **Nunca menos de 2% visible sin etiqueta**: un segmento minúsculo sin su fila en la leyenda es un
  dato perdido. Por eso el bucket `Otros` existe.

━━━

## 6. Marcado de ejemplo

```tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const RAMPA = ["--cat-1", "--cat-3", "--cat-7", "--cat-4", "--cat-2", "--cat-5", "--cat-6"] as const;
const OTROS = "--cat-8";

export function DonutFuentes({ fuentes, resumen }: Props) {
  // fuentes ya vienen ordenadas de mayor a menor, con "Otros" al final
  const color = (i: number, esOtros: boolean) => `var(${esOtros ? OTROS : RAMPA[i % RAMPA.length]})`;

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-hairline)]
                        bg-[var(--surface)] p-[var(--sp-6)] shadow-[var(--shadow-rest)]">
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-[var(--sp-2)] text-[length:var(--fs-h3)]
                       font-semibold text-[var(--text-primary)]">
          Fuentes de tráfico
          <InfoTooltip texto="Cómo llegaron los visitantes a tu blog en el periodo seleccionado." />
        </h3>
        <MetricaSelect />
      </header>

      <div role="img" aria-label={resumen}
           className="mt-[var(--sp-5)] grid items-center gap-[var(--sp-6)]
                      grid-cols-1 sm:grid-cols-[200px_1fr]">
        <div className="h-[200px]" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* tramas para prefers-contrast: more / ajuste "Patrones en gráficos" */}
                <pattern id="trama-1" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M0 6 L6 0" stroke="var(--surface)" strokeWidth="1.5" />
                </pattern>
                {/* … trama-2 … trama-6 … */}
              </defs>

              <Pie
                data={fuentes} dataKey="valor" nameKey="nombre"
                innerRadius="58%" outerRadius="100%" paddingAngle={1.5}
                startAngle={90} endAngle={-270} stroke="var(--surface)" strokeWidth={2}
                activeIndex={activo} onMouseEnter={(_, i) => setActivo(i)}
              >
                {fuentes.map((f, i) => (
                  <Cell key={f.id}
                        fill={patrones ? `url(#trama-${i + 1})` : color(i, f.esOtros)}
                        style={{ opacity: activo === null || activo === i ? 1 : 0.55,
                                 transition: "opacity var(--dur-fast) var(--ease-out)" }} />
                ))}
              </Pie>
              <Tooltip content={<TooltipCuaderno />} isAnimationActive={false} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* la leyenda ES el gráfico: texto + número + porcentaje, legible sin color */}
        <ul className="flex flex-col gap-[var(--sp-3)]">
          {fuentes.map((f, i) => (
            <li key={f.id}>
              <button
                onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}
                onFocus={() => setActivo(i)} onBlur={() => setActivo(null)}
                aria-label={`${f.nombre}, ${f.exacto} visitas, ${f.pct} por ciento del total`}
                className="flex w-full items-center gap-[var(--sp-3)] rounded-[var(--radius-control)]
                           px-[var(--sp-2)] py-[var(--sp-1)] text-left
                           hover:bg-[var(--surface-sunken)]
                           focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
              >
                <span aria-hidden="true" className="size-2 shrink-0 rounded-[var(--radius-pill)]"
                      style={{ background: color(i, f.esOtros) }} />
                <span className="flex-1 truncate text-[length:var(--fs-body)] text-[var(--text-secondary)]">
                  {f.nombre}
                </span>
                <span className="text-[length:var(--fs-body)] text-[var(--text-secondary)]
                                 [font-variant-numeric:tabular-nums]">
                  {f.abreviado} ({f.pct.toFixed(1)}%)
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <TablaEquivalente filas={fuentes} columnas={["Fuente", "Visitas", "Porcentaje"]} />
    </section>
  );
}
```

━━━

## 7. Reglas duras

1. **Nunca una dona sin leyenda de texto** (excepto `mini`, que compensa con `aria-label`).
2. **Segmentos desde `--cat-*`, jamás desde `--accent`/`--perf`.** Categoría ≠ semántica.
3. **`--cat-8` es de `Otros` y de nadie más.**
4. **Máximo 7 arcos** (6 + `Otros`).
5. **Separación entre segmentos con `stroke` del color de la tarjeta**: sin ella la dona muere en
   escala de grises.
6. **Porcentajes con un decimal y `tabular-nums`.**
7. **Hover de leyenda y hover de segmento son el mismo estado.** Si solo funciona uno, está roto.
