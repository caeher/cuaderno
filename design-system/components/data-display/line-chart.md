# Line Chart — gráfico de líneas con área

> La línea índigo con área tenue y la serie comparativa punteada. Aparece en `08-panel-analiticas`
> (tarjeta `Visitas`, con selector `Diario ▾` y leyenda de dos periodos) y en `02-panel-resumen`
> (tarjeta `Rendimiento en el tiempo`, con selector `Últimos 30 días ▾`).
> Aquí el índigo **no** es una decisión estética: es el color del producto mostrándote su lectura de
> los datos. La serie de comparación nunca compite por atención — es gris y punteada.

Ruta destino: `components/admin/charts/line-chart.tsx`

━━━

## 0. Librería de gráficos — recomendación

**El repo no tiene ninguna librería de gráficos** (`package.json` verificado: no hay recharts, visx,
nivo, chart.js ni d3). Hay que añadir una, y esta es la elección para todo el sistema:

### ✅ Recomendada: **Recharts v3** (`pnpm add recharts`)

Por qué gana para Cuaderno, en orden de peso:

1. **Es la que asume shadcn/ui.** El repo ya usa shadcn (`components.json`, 33 primitivos en
   `components/ui/`). El componente oficial `shadcn add chart` es un envoltorio de Recharts que
   inyecta los colores por **variables CSS** (`--color-<serie>`). Eso encaja con el contrato de
   tokens sin adaptador: se declara `--color-visitas: var(--accent)` y el gráfico ya es del sistema.
2. **Renderiza SVG en el DOM, no canvas.** Decisivo por dos razones: el **modo oscuro** funciona solo
   (los `stroke` apuntan a variables CSS que cambian con `data-theme`, sin repintar ni re-montar), y
   la **accesibilidad** es posible (los nodos existen, se les puede poner `role` y `aria-label`).
   Chart.js y uPlot pintan en canvas: un canvas es opaco para el lector de pantalla y hay que
   re-dibujarlo a mano en cada cambio de tema.
3. **Composición declarativa en React 19.** `<LineChart><Area/><Line/><XAxis/></LineChart>` — cada
   pieza es un componente al que se le pasan tokens; no hay una config-object gigante que haya que
   traducir del diseño.
4. **Cubre exactamente los tres gráficos que piden las pantallas** — línea con área, donut y
   sparkline — sin plugins.
5. **Riesgo bajo**: es la librería de gráficos React más usada, con soporte de React 19 en la v3.

Contras asumidos y cómo se mitigan:

| Contra | Mitigación |
|---|---|
| ~100 KB gzip (arrastra parte de d3) | Carga diferida: `next/dynamic` con `ssr: false` + `loading` = skeleton de gráfico. El panel de Analíticas es la única ruta que lo paga, y ya es una ruta "pesada por naturaleza" |
| Tipos algo laxos | Envolver en `components/admin/charts/*` con props tipadas del dominio (`serie`, `comparacion`, `granularidad`); ninguna pantalla importa `recharts` directamente |
| Estilos por defecto ajenos al sistema | Se apagan todos: `<CartesianGrid>` fuera, ticks propios, tooltip propio (§1.5). Recharts aporta escalas y layout, no apariencia |

### Descartadas (y por qué)

| Opción | Por qué no |
|---|---|
| **Tremor** | Trae su propio sistema visual (sombras, radios, paleta). Habría que pelearse con él en cada componente; el diseño de Cuaderno es demasiado específico |
| **Chart.js** | Canvas: mata la accesibilidad del gráfico y obliga a re-dibujar al cambiar de tema |
| **Nivo** | Excelente, pero pesado y con una API por gráfico; para tres gráficos simples es sobreingeniería |
| **visx** | Máximo control, pero hay que escribir ejes, tooltips y escalas a mano. Es la opción correcta **si algún día** el sistema necesita un gráfico que Recharts no puede; hoy sería trabajo sin retorno |
| **uPlot** | Rapidísimo con millones de puntos. Aquí hay 30 puntos. Imperativo y canvas |
| **SVG a mano** | **Sí**, para `score-ring`, `progress-bar` y el **sparkline** de la stat card: son formas, no gráficos. No para líneas con ejes, escalas y tooltip |

> **Regla del sistema**: Recharts solo para `line-chart` y `donut-chart`. Todo lo demás
> (anillo, barras, sparkline) es SVG/CSS propio y **cero dependencias**.

━━━

## 1. Anatomía

```
┌───────────────────────────────────────────────────────────────────┐
│ Visitas ⓘ                                          [ Diario ▾ ]   │ ← header de tarjeta
│                                                                   │
│ ── 1 May - 29 May 2024      - - - 1 Abr - 30 Abr 2024             │ ← leyenda
│                                                                   │
│ 1.2K ┤                                    ╱╲                      │ ← eje Y (ticks, sin línea)
│  900 ┤            ╱╲          ╱╲         ╱  ╲    ╱───             │
│  600 ┤   ╱╲   ╱──╯  ╲──╱─╲───╯  ╲──╱────╯    ╲──╯                 │ ← serie principal (índigo)
│  300 ┤ ─╯  ╲─╯· · · · · · · · · · · · · · · · · · · ·             │ ← comparación (punteada)
│    0 ┤▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒             │ ← área bajo la serie
│      └──────────────────────────────────────────────              │
│      1 May   6 May   11 May   16 May   21 May   26 May   29 May   │ ← eje X
└───────────────────────────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Tarjeta contenedora** | `--surface`, borde `--border-hairline`, `--radius-card`, padding `--sp-6`. El gráfico no flota: siempre vive en una tarjeta |
| 2 | **Título + ⓘ** | `--fs-h3` (16), peso 600, `--text-primary`. Icono `Info` 14px en `--text-tertiary` con tooltip que explica **cómo se mide** la métrica |
| 3 | **Control de granularidad** | `select` `Diario / Semanal / Mensual` (`08`) o rango `Últimos 30 días` (`02`). Alto 32px, `--radius-control`, borde `--border-hairline` |
| 4 | **Leyenda** | Arriba a la izquierda, sobre el área de trazado. Muestra de 16×2px: **línea sólida** índigo para la serie actual, **línea punteada** gris para la comparación. Texto `--fs-sm`, `--text-secondary`. La forma del trazo es el canal accesible (§5) |
| 5 | **Eje Y** | 4–5 ticks incluido el 0. `--fs-label` (12), `--text-tertiary`, `tabular-nums`, abreviados (`1.2K`). **Sin línea de eje.** Alineados a la derecha, ancho reservado 40px |
| 6 | **Eje X** | Etiquetas cada N puntos (máx. 7 visibles). `--fs-label`, `--text-tertiary`. **Sin línea de eje, sin ticks.** Primera y última siempre presentes |
| 7 | **Rejilla** | **Ninguna por defecto.** El sistema se sostiene con aire. Excepción: si la serie supera 3 órdenes de magnitud, se permite una línea horizontal en `--border-hairline` por tick, `stroke-dasharray: 2 4` |
| 8 | **Serie principal** | Trazo 2px `--accent`, `stroke-linejoin: round`, `stroke-linecap: round`. Sin puntos visibles en reposo |
| 9 | **Área** | Degradado vertical de `--accent` al 12% de opacidad arriba a 0% abajo. Solo bajo la serie principal — **la comparación nunca lleva área** |
| 10 | **Serie comparativa** | Trazo 1.5px `--border-strong`, `stroke-dasharray: 4 4`. Opcional (`comparacion={null}` la apaga) |
| 11 | **Cursor + tooltip** | §1.5 |

### 1.5 Cursor y tooltip

Al pasar el ratón (o mover el foco con teclado) sobre el área de trazado:

- Línea vertical de referencia en `--border-strong`, 1px, `stroke-dasharray: 3 3`, de arriba abajo.
- Punto activo sobre cada serie: círculo r=4 relleno `--surface` con `stroke` del color de su serie
  (2px). En la comparación, `stroke: --border-strong`.
- **Tooltip propio** (no el de Recharts por defecto): `--surface`, borde `--border-hairline`,
  `--radius-control`, `--shadow-float`, padding `--sp-3`, ancho máx. 220px. Contenido:
  - Fecha completa en `--fs-sm` peso 600 `--text-primary` (`14 de mayo de 2024`).
  - Una fila por serie: muestra de color (8×8, `--radius-pill` para la actual; 8×2 punteada para la
    comparación) + nombre + valor en `tabular-nums` alineado a la derecha.
  - Fila final opcional: delta entre ambas (`↑ 18,6%`) con el color del canal (`--perf`/`--danger`).
- Se posiciona con `--dur-fast`; **no** hace fade (el retardo hace sentir el gráfico lento).

━━━

## 2. Variantes

| Variante | Uso | Diferencias |
|---|---|---|
| `completo` *(def.)* | `08` — tarjeta Visitas | Todo lo anterior. Alto del área de trazado 240px |
| `compacto` | `02` — Rendimiento en el tiempo | Alto 180px, eje Y con 3 ticks, leyenda solo si hay comparación |
| `sparkline` | Dentro de `stat-card` (`07`) | 100×28px, **sin ejes, sin leyenda, sin tooltip, sin área**, trazo 2px. Color `--perf` si mide rendimiento, `--accent` si no. **Se dibuja con SVG propio, no con Recharts** |
| `multiserie` | Futuro (comparar entradas) | Hasta 4 series con la secuencia de la rampa `--cat-1, --cat-3, --cat-7, --cat-4`; cada una con su `stroke-dasharray` distinto (§5) |

Series soportadas simultáneamente: **máximo 4**. Más de cuatro líneas es una tabla disfrazada.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Cargando** | `skeleton` patrón `grafico` (ver `feedback/skeleton.md` §3.3): la tarjeta conserva alto exacto, con bloque redondeado en `--surface-sunken` donde va el trazado y barras cortas donde van los ejes |
| **Vacío** | `empty-state` compacto dentro de la tarjeta: icono `LineChart` en cuadro `--accent-tint`, `Todavía no hay datos suficientes`, subtexto `Vuelve cuando tu blog haya recibido visitas`. **Nunca** una línea plana en cero: mentiría |
| **Un solo punto** | No se traza línea: se dibuja el punto y una nota `Se necesitan al menos 2 días de datos para ver la tendencia` |
| **Error** | `alert` `destructivo` dentro de la tarjeta con `Reintentar` |
| **Hover** | §1.5 |
| **Foco de teclado** | El área de trazado es focusable; `←`/`→` mueven el punto activo, `Home`/`End` van al primero/último, `Esc` sale. El tooltip sigue al foco y su contenido se anuncia (§5) |
| **Cambio de rango** | Las series transicionan de forma con `--dur-base --ease-out`. Los ejes hacen crossfade en `--dur-fast` |
| **Entrada** | El trazo se dibuja de izquierda a derecha en 600ms `--ease-out` (`stroke-dashoffset`), una sola vez. El área hace fade-in a la vez |
| **`prefers-reduced-motion`** | Sin dibujado ni transición de forma: el gráfico aparece terminado |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Tarjeta | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-rest`, padding `--sp-6` |
| Título | `--fs-h3`, `--text-primary` |
| Icono ⓘ | `--text-tertiary` |
| Leyenda | `--fs-sm`, `--text-secondary` |
| Ticks de eje | `--fs-label`, `--text-tertiary`, `tabular-nums` |
| Serie principal | `--accent`, trazo 2px |
| Área | `--accent` con `stop-opacity` 0.12 → 0 |
| Serie comparativa | `--border-strong`, trazo 1.5px, `dasharray 4 4` |
| Rejilla (si se usa) | `--border-hairline`, `dasharray 2 4` |
| Cursor vertical | `--border-strong`, `dasharray 3 3` |
| Punto activo | Relleno `--surface`, borde del color de la serie |
| Tooltip | `--surface`, `--border-hairline`, `--radius-control`, `--shadow-float`, `--sp-3` |
| Delta en tooltip | `--perf` / `--danger` |
| Serie 2ª–4ª (multiserie) | `--cat-3`, `--cat-7`, `--cat-4` |
| Sparkline de rendimiento | `--perf` |
| Foco | `--focus-ring` |
| Movimiento | `--dur-fast` (tooltip), `--dur-base` (cambio de datos), 600ms (dibujado inicial), `--ease-out` |

**Modo oscuro**: los `stroke` y `stop-color` apuntan a `var(--accent)` / `var(--border-strong)`, así
que el gráfico cambia de tema **sin JavaScript y sin re-montar**. Este es el motivo técnico concreto
por el que se descartó canvas. Único ajuste: la opacidad del área sube de 0.12 a 0.18 en oscuro
(sobre fondo oscuro el mismo alfa se ve menos), declarado como token propio
`--chart-area-opacity` en las dos ramas del contrato, nunca como valor suelto en el componente.

━━━

## 5. Accesibilidad

> **La regla que gobierna todo gráfico de Cuaderno: nada se comunica solo por color. Siempre hay una
> segunda señal — patrón de trazo, etiqueta directa, o texto.**

- **Patrón, no solo color**: la serie actual es **sólida**, la comparativa es **punteada**. En
  multiserie cada serie recibe un `stroke-dasharray` distinto (`0` · `6 3` · `2 3` · `10 3 2 3`). Un
  usuario con daltonismo separa las series sin distinguir los colores.
- **Leyenda con forma real**: la muestra de la leyenda replica el trazo (sólido/punteado), no es un
  cuadrado de color. La leyenda misma es texto legible por lector de pantalla.
- **Tabla equivalente obligatoria**: junto al SVG va un `<table>` con `class="sr-only"` que contiene
  todos los puntos (fecha, valor actual, valor comparativo). Es la ruta primaria del lector de
  pantalla; el SVG lleva `aria-hidden="true"`. Además, un botón `Ver datos como tabla` la revela
  visualmente para cualquiera — sirve tanto a accesibilidad como a quien quiera copiar cifras.
- **Resumen narrativo**: el contenedor lleva `role="img"` con `aria-label` que resume la forma:
  `Visitas del 1 al 29 de mayo de 2024: 24.842 en total, tendencia al alza, máximo de 1.240 el 26 de
  mayo. Sube un 18,6% respecto al periodo anterior.` Un resumen vale más que 30 pares de números.
- **Exploración con teclado**: el área de trazado es `tabindex="0"`. `←`/`→` recorren puntos,
  `Home`/`End` saltan a los extremos. El punto activo se anuncia en una región `aria-live="polite"`
  con throttle de 150ms: `14 de mayo: 680 visitas, 520 en el periodo anterior`.
- **Contraste**: `--accent` sobre `--surface` supera 3:1 (WCAG 1.4.11, componentes gráficos). El área
  al 12% **no** cumple y no debe: es decoración; la información la lleva el trazo.
- **Objetivo del cursor**: el área activa de hover cubre toda la banda vertical del punto, no solo el
  píxel del trazo. Nunca hay que "cazar" la línea con el ratón.
- **`prefers-contrast: more`**: el trazo sube a 3px, la comparativa a 2px y se activan las líneas de
  rejilla horizontales.
- **`prefers-reduced-motion: reduce`**: sin dibujado progresivo ni morphing entre rangos.
- El tooltip **nunca** es la única vía al dato: la tabla oculta siempre lo contiene.

━━━

## 6. Marcado de ejemplo

```tsx
// components/admin/charts/line-chart.tsx
"use client";
import {
  AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export function LineChartVisitas({ datos, serie, comparacion, resumen }: Props) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-hairline)]
                        bg-[var(--surface)] p-[var(--sp-6)] shadow-[var(--shadow-rest)]">
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-[var(--sp-2)] text-[length:var(--fs-h3)]
                       font-semibold text-[var(--text-primary)]">
          {serie.nombre}
          <InfoTooltip texto="Sesiones únicas por día, según la zona horaria de tu blog." />
        </h3>
        <GranularidadSelect />
      </header>

      {/* leyenda: la FORMA del trazo es el canal accesible, no el color */}
      <ul className="mt-[var(--sp-4)] flex gap-[var(--sp-6)] text-[length:var(--fs-sm)]
                     text-[var(--text-secondary)]">
        <li className="flex items-center gap-[var(--sp-2)]">
          <svg width="16" height="2" aria-hidden="true">
            <line x1="0" y1="1" x2="16" y2="1" stroke="var(--accent)" strokeWidth="2" />
          </svg>
          {serie.etiqueta}
        </li>
        {comparacion && (
          <li className="flex items-center gap-[var(--sp-2)]">
            <svg width="16" height="2" aria-hidden="true">
              <line x1="0" y1="1" x2="16" y2="1" stroke="var(--border-strong)"
                    strokeWidth="2" strokeDasharray="4 4" />
            </svg>
            {comparacion.etiqueta}
          </li>
        )}
      </ul>

      {/* el SVG es decorativo: la verdad accesible está en el resumen y en la tabla */}
      <div
        role="img"
        aria-label={resumen}
        tabIndex={0}
        onKeyDown={moverPuntoActivo}
        className="mt-[var(--sp-4)] h-60 focus-visible:outline-none
                   focus-visible:shadow-[var(--focus-ring)] rounded-[var(--radius-control)]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="areaVisitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--accent)"
                      stopOpacity="var(--chart-area-opacity)" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <YAxis
              width={40} tickLine={false} axisLine={false} tickCount={5}
              tickFormatter={abreviar}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            />
            <XAxis
              dataKey="fecha" tickLine={false} axisLine={false} minTickGap={40}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            />

            <Tooltip
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={<TooltipCuaderno />}
              isAnimationActive={false}
            />

            {comparacion && (
              <Line
                type="monotone" dataKey="anterior" dot={false}
                stroke="var(--border-strong)" strokeWidth={1.5} strokeDasharray="4 4"
              />
            )}
            <Area
              type="monotone" dataKey="actual" fill="url(#areaVisitas)"
              stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" dot={false}
              activeDot={{ r: 4, fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ruta primaria del lector de pantalla + "Ver datos como tabla" */}
      <TablaEquivalente datos={datos} serie={serie} comparacion={comparacion} />

      {/* punto activo al navegar con teclado */}
      <p aria-live="polite" className="sr-only">{anuncioPuntoActivo}</p>
    </section>
  );
}
```

Carga diferida en la página (para no pagar Recharts en el bundle del panel entero):

```tsx
const LineChartVisitas = dynamic(
  () => import("@/components/admin/charts/line-chart").then((m) => m.LineChartVisitas),
  { ssr: false, loading: () => <SkeletonGrafico alto={240} /> },
);
```

━━━

## 7. Reglas duras

1. **La comparación nunca lleva área** ni color propio: es contexto, no protagonista.
2. **Sin rejilla por defecto.**
3. **Máximo 4 series**, cada una con patrón de trazo propio.
4. **Tabla equivalente siempre.** Un gráfico sin tabla oculta no se mergea.
5. **`isAnimationActive={false}` en el tooltip**: el retardo por defecto de Recharts hace sentir el
   panel lento.
6. **Ningún hex dentro del componente.** Todo `var(--token)`, para que el tema oscuro sea gratis.
