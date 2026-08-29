# Score Ring — anillo de SEO Score

> El anillo verde con el número al centro. Aparece en `02-panel-resumen` (tarjeta SEO Analyzer y
> stat card), `03-panel-entradas` (columna SEO Score, una por fila) y `07-panel-seo-analyzer`
> (anillo grande del panel derecho + anillo dentro de la stat card).
> Es la encarnación literal de la ley de color: **verde = rendimiento medido**.

Ruta destino: `components/admin/score-ring.tsx`

━━━

## 1. Anatomía

```
        ╭───────╮
      ╱           ╲          ← track: arco de 360°, --border-hairline
     │     78      │         ← valor: tabular-nums, peso 700
     │    /100     │         ← sufijo (opcional, tamaños lg/xl)
      ╲           ╱
        ╰───────╯
       ┌────────┐
       │ Bueno  │            ← etiqueta cualitativa (badge o texto)
       └────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Track** | Círculo completo, `stroke: var(--border-hairline)`, mismo grosor que el progreso, `stroke-linecap: round`. Siempre visible: el anillo debe leerse como "78 **de 100**", no como una forma suelta |
| 2 | **Progreso** | Arco desde `-90°` (12 en punto) en sentido horario. Grosor idéntico al track. `stroke-linecap: round`. Color según §2.2 |
| 3 | **Valor** | Número entero 0–100, `tabular-nums`, peso 700, `--text-primary`. **Nunca decimales** |
| 4 | **Sufijo `/100`** | Solo en `lg` y `xl`. `--fs-sm`, peso 400, `--text-tertiary`, debajo del número |
| 5 | **Etiqueta cualitativa** | `Excelente` · `Bueno` · `Mejorable` · `Crítico` · `Sin analizar`. En `lg`/`xl` va como badge bajo el anillo; en `md` como texto pequeño dentro; en `sm` **no se dibuja** pero vive en el `aria-label`. **Es el canal no-cromático obligatorio** |

━━━

## 2. Variantes

### 2.1 Tamaños

| `size` | Diámetro | Grosor | Valor | Sufijo | Etiqueta | Dónde |
|---|---|---|---|---|---|---|
| `sm` | 32px | 3px | `--fs-sm` (13) | no | solo en `aria-label` | Celda de tabla (`03`) |
| `md` | 56px | 4px | `--fs-h3` (16) | no | texto interno 10px o badge externo | Stat card (`02`, `07`) |
| `lg` | 80px | 6px | `--fs-h1` (30) | sí | badge bajo el anillo | Tarjeta lateral (`02`) |
| `xl` | 112px | 8px | `--fs-display` (44) | sí | badge bajo el anillo | Panel `Tu SEO Score` (`07`) |

Nota de implementación: el SVG se dibuja siempre en un `viewBox="0 0 100 100"` y se escala con
`width`/`height`; así el grosor se declara una vez en unidades del viewBox (`3 / 4 / 6 / 8` × 100 /
diámetro) y no hay redondeos raros entre tamaños.

### 2.2 Umbrales y color

| Rango | Etiqueta | Color del progreso | Justificación |
|---|---|---|---|
| 90–100 | `Excelente` | `--perf-strong` | Rendimiento sobresaliente |
| 70–89 | `Bueno` | `--perf` | Es lo que pintan `02` (92) y `07` (78): ambos verdes |
| 50–69 | `Mejorable` | `--warn` | Mismo canal que el badge `Borrador` y que el veredicto `Mejorable` de `metric-list` |
| 0–49 | `Crítico` | `--danger` | Único caso en que el anillo se pone rojo |
| `null` | `Sin analizar` | — (solo track) | `03` lo muestra así en las filas `Borrador` y `Programado`: anillo vacío con `—` al centro en `--text-tertiary` |

> Las pantallas nunca muestran un score bajo, así que los tramos `Mejorable` y `Crítico` son una
> **extensión coherente**, no una invención: reutilizan exactamente los canales `--warn` y
> `--danger` que el sistema ya usa para "atención" y "problema". Ningún hex nuevo entra al sistema
> por esta puerta.

### 2.3 `tone="neutro"`

Cuando el anillo mide progreso de una tarea y **no** rendimiento (p. ej. "3 de 5 pasos de
configuración completados" en Ajustes), el progreso se pinta en `--accent` y la etiqueta se sustituye
por `3 de 5`. Regla dura: si el número no es un juicio de calidad, **no puede ser verde**.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Arco estático en su valor final |
| **Entrada** | El arco crece de 0 al valor con `stroke-dashoffset` en **600ms `--ease-out`**, una sola vez, al montar. El número **no** hace count-up: aparece ya final. Es la única animación con licencia para durar más que `--dur-base`, porque el arco es la métrica y merece leerse dibujándose |
| **Actualización** | Al recalcular, el arco transiciona al nuevo valor en `--dur-base --ease-out`; si cruza un umbral, el color transiciona a la vez y la etiqueta hace crossfade en `--dur-fast` |
| **Cargando** | Track visible + arco indeterminado: un segmento de 25% girando a 1200ms lineal, en `--border-strong`. El centro muestra `—`. En `sm` (tabla) se usa el skeleton circular en lugar de girar 24 veces a la vez |
| **Sin analizar** | Solo track, centro `—` en `--text-tertiary`, etiqueta `Sin analizar` |
| **Interactivo** | En `03` el anillo es parte de la fila enlazada y no tiene interacción propia. Si se le da `href` (ir al análisis), `hover` engrosa el track a `--border-strong` y el foco pinta `--focus-ring` en el contenedor, **nunca** en el `<svg>` |
| **`prefers-reduced-motion`** | Sin animación de entrada ni giro: el arco aparece en su valor y el estado de carga pasa a ser un pulso de opacidad del track |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Track | `--border-hairline` |
| Track (hover interactivo) | `--border-strong` |
| Progreso 90–100 | `--perf-strong` |
| Progreso 70–89 | `--perf` |
| Progreso 50–69 | `--warn` |
| Progreso 0–49 | `--danger` |
| Progreso `tone="neutro"` | `--accent` |
| Valor | `--text-primary`, `tabular-nums` |
| Valor sin dato | `--text-tertiary` |
| Sufijo `/100` | `--fs-sm`, `--text-tertiary` |
| Badge `Excelente`/`Bueno` | `--perf-strong` / `--perf` sobre `--perf-tint` |
| Badge `Mejorable` | `--warn` sobre `--warn-tint` |
| Badge `Crítico` | `--danger` sobre `--danger-tint` |
| Badge `Sin analizar` | `--neutral` sobre `--neutral-tint` |
| Badge — forma | `--radius-pill`, `--fs-label`, padding `2px 10px` |
| Foco | `--focus-ring` |
| Movimiento | `--dur-base` / `--ease-out`; entrada 600ms |

**No hace falta librería de gráficos.** El anillo son dos `<circle>` y un `stroke-dasharray`: ~40
líneas de SVG, cero dependencias, tematizable con variables CSS y perfectamente accesible. Meter
Recharts (o cualquier otra) aquí sería pagar ~100 KB por un círculo.

━━━

## 5. Accesibilidad

- **El color nunca es el único canal — y aquí hay tres canales redundantes**: el número al centro, la
  longitud del arco y la etiqueta cualitativa. Un usuario con acromatopsia lee `78` y `Bueno` sin
  percibir el verde.
- En `sm` la etiqueta no se dibuja, así que **el `aria-label` es obligatorio** y debe incluirla:
  `aria-label="SEO Score 95 de 100, excelente"`.
- Marcado: `<svg role="img" aria-label="…">` con los `<circle>` en `aria-hidden`. Alternativa
  igualmente válida: contenedor con `role="meter"` + `aria-valuenow` / `aria-valuemin="0"` /
  `aria-valuemax="100"` / `aria-valuetext="78 de 100, bueno"`. **Preferir `role="img"` en tabla**
  (menos verboso para 24 filas) y `role="meter"` en el panel grande de `07`.
- Sin dato: `aria-label="SEO Score sin analizar"`. Nunca `aria-label="0 de 100"` — cero es un
  veredicto, "sin analizar" es la ausencia de veredicto.
- Estado de carga: contenedor con `aria-busy="true"` y `aria-label="Calculando SEO Score"`.
- Contraste del trazo: `--perf` sobre `--surface` supera 3:1 (mínimo de componente gráfico, WCAG
  1.4.11). El track en `--border-hairline` **no** lo cumple, y no necesita cumplirlo: es
  decorativo, la información la lleva el arco de progreso y el texto.
- El número al centro nunca baja de 13px (`sm`), y a ese tamaño va en peso 700 sobre `--surface`.
- `prefers-contrast: more`: el track sube a `--border-strong` y el arco engrosa 1px.

━━━

## 6. Marcado de ejemplo

```tsx
// components/admin/score-ring.tsx
const SIZES = {
  sm: { px: 32,  grosor: 3, valor: "text-[length:var(--fs-sm)]",      sufijo: false, badge: false },
  md: { px: 56,  grosor: 4, valor: "text-[length:var(--fs-h3)]",      sufijo: false, badge: false },
  lg: { px: 80,  grosor: 6, valor: "text-[length:var(--fs-h1)]",      sufijo: true,  badge: true  },
  xl: { px: 112, grosor: 8, valor: "text-[length:var(--fs-display)]", sufijo: true,  badge: true  },
} as const;

function veredicto(v: number | null) {
  if (v === null) return { etiqueta: "Sin analizar", trazo: null,               badge: "neutral" } as const;
  if (v >= 90)    return { etiqueta: "Excelente",    trazo: "--perf-strong",   badge: "perf"    } as const;
  if (v >= 70)    return { etiqueta: "Bueno",        trazo: "--perf",          badge: "perf"    } as const;
  if (v >= 50)    return { etiqueta: "Mejorable",    trazo: "--warn",          badge: "warn"    } as const;
  return            { etiqueta: "Crítico",      trazo: "--danger",        badge: "danger"  } as const;
}

export function ScoreRing({ valor, size = "md", tone = "perf" }: ScoreRingProps) {
  const s = SIZES[size];
  const v = veredicto(valor);
  const trazo = tone === "neutro" ? "--accent" : v.trazo;

  // viewBox 0 0 100 100 → el grosor se normaliza al diámetro real
  const grosor = (s.grosor * 100) / s.px;
  const r = 50 - grosor / 2;
  const circunferencia = 2 * Math.PI * r;
  const avance = valor === null ? 0 : (valor / 100) * circunferencia;

  return (
    <div className="inline-flex flex-col items-center gap-[var(--sp-2)]">
      <div className="relative" style={{ width: s.px, height: s.px }}>
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label={
            valor === null
              ? "SEO Score sin analizar"
              : `SEO Score ${valor} de 100, ${v.etiqueta.toLowerCase()}`
          }
          className="size-full -rotate-90"
        >
          <circle cx="50" cy="50" r={r} fill="none"
                  stroke="var(--border-hairline)" strokeWidth={grosor} />
          {trazo && (
            <circle cx="50" cy="50" r={r} fill="none"
                    stroke={`var(${trazo})`} strokeWidth={grosor} strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={circunferencia - avance}
                    className="[transition:stroke-dashoffset_600ms_var(--ease-out),stroke_var(--dur-base)_var(--ease-out)]
                               motion-reduce:transition-none" />
          )}
        </svg>

        <div aria-hidden="true"
             className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className={`${s.valor} font-bold text-[var(--text-primary)] [font-variant-numeric:tabular-nums]
                            ${valor === null ? "text-[var(--text-tertiary)]" : ""}`}>
            {valor ?? "—"}
          </span>
          {s.sufijo && (
            <span className="mt-[2px] text-[length:var(--fs-sm)] text-[var(--text-tertiary)]">/100</span>
          )}
        </div>
      </div>

      {s.badge && <Badge tone={v.badge}>{v.etiqueta}</Badge>}
    </div>
  );
}
```

━━━

## 7. Reglas duras

1. **El track siempre se dibuja.** Un arco sin track no comunica "de 100".
2. **La etiqueta cualitativa existe siempre**, aunque sea solo en el `aria-label`.
3. **Verde solo si mide calidad.** Progreso de tarea → `tone="neutro"` (índigo).
4. **Sin decimales, sin count-up.**
5. **Cero dependencias.** SVG plano.
6. **`sm` en tabla no anima ni gira**: 24 anillos animándose a la vez convierten una lista en una
   máquina tragamonedas.
