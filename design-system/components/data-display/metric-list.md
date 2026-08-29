# Metric List — lista de factores evaluados

> La lista `Factores evaluados` del panel derecho de `07-panel-seo-analyzer` (Título · Meta
> descripción · Encabezados · Palabra clave · Enlaces internos · Imágenes · Legibilidad · Datos
> estructurados) y su versión reducida en la tarjeta `SEO Analyzer` de `02-panel-resumen`.
>
> Cada fila es un **factor** con un **veredicto**. No es una tabla: es un checklist de diagnóstico
> que se lee en dos segundos.

Ruta destino: `components/admin/metric-list.tsx`

━━━

## 1. Anatomía

```
┌────────────────────────────────────────────────┐
│ Factores evaluados                             │ ← título de la tarjeta
├────────────────────────────────────────────────┤
│ ✓  Título                              Bien    │ ← icono + factor ......... veredicto
│ ✓  Meta descripción                    Bien    │
│ ✓  Encabezados                         Bien    │
│ ✓  Palabra clave                       Bien    │
│ ⚠  Enlaces internos               Mejorable    │
│ ⚠  Imágenes                       Mejorable    │
│ ✓  Legibilidad                         Bien    │
│ ●  Datos estructurados         No detectado    │
└────────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Tarjeta** | `--surface`, `--border-hairline`, `--radius-card`, padding `--sp-5`, `--shadow-rest` |
| 2 | **Título** | `--fs-h3` (16), peso 600, `--text-primary`. Margen inferior `--sp-4`. Opcional: enlace `Ver todos →` en `--accent` a la derecha |
| 3 | **Icono de veredicto** | 16px, `stroke-width: 2`, alineado al centro óptico del texto. Ver §2 |
| 4 | **Nombre del factor** | `--fs-body` (14), `--text-primary`. Gap `--sp-3` con el icono. Trunca con ellipsis |
| 5 | **Veredicto** | Texto alineado a la **derecha**, `--fs-body`, peso 500, color del canal. **Nunca es un badge con fondo**: la lista se leería como un semáforo cargado. Ver §2 |
| 6 | **Fila** | Alto **26px** (`02`) / **28px** (`07`), gap vertical `--sp-1`. **Sin separadores** entre filas: son ocho líneas, el aire basta |
| 7 | **Detalle expandible** (opcional) | Si el factor tiene explicación, la fila es un `<button>` que despliega un párrafo `--fs-sm` `--text-secondary` con `--sp-2` de sangría bajo el icono, y añade `ChevronDown` 14px `--text-tertiary` a la izquierda del veredicto |

━━━

## 2. Veredictos

| Veredicto | Icono lucide | Color icono | Color texto | Cuándo |
|---|---|---|---|---|
| `Excelente` | `CheckCircle2` | `--perf-strong` | `--perf-strong` | Factor óptimo, no hay nada que hacer (`02` lo usa en `Enlaces internos`) |
| `Bien` | `CheckCircle2` | `--perf` | `--perf` | Cumple el criterio |
| `Mejorable` | `AlertTriangle` | `--warn` | `--warn` | Cumple parcialmente; hay una acción concreta que lo sube |
| `Deficiente` | `AlertCircle` | `--danger` | `--danger` | No cumple y penaliza |
| `No detectado` | `Circle` (relleno) | `--neutral` | `--text-secondary` | Ausente, pero **no es un fallo**: por eso el texto va en `--text-secondary` y no en gris del canal. `Datos estructurados` en `07` |
| `Analizando` | `Loader2` (girando) | `--text-tertiary` | `--text-tertiary` | Mientras llega la evaluación del factor |

**La forma del icono cambia con el veredicto** (círculo con check / triángulo / círculo con
exclamación / círculo relleno). Eso no es decorativo: es el canal no-cromático exigido por §5.

━━━

## 3. Variantes

| Variante | Uso | Diferencias |
|---|---|---|
| `completa` *(def.)* | `07` — panel derecho | 8 factores, alto 28px, icono + nombre + veredicto |
| `resumen` | `02` — tarjeta SEO Analyzer | 4 factores (los de mayor impacto), alto 26px, iconos `Check` simples sin círculo, mismo esquema de color |
| `con-detalle` | Vista ampliada del SEO Analyzer | Filas expandibles con explicación y acción (`Añadir 2 enlaces internos →`) |
| `con-puntos` | Cuando cada factor aporta puntaje | Añade una columna `+12` / `−4` en `tabular-nums` entre el nombre y el veredicto |
| `checklist` | Onboarding, publicación | El icono pasa a `Check`/`Circle` vacío, el veredicto se sustituye por una acción en `--accent` (`Completar →`) |

Máximo recomendado: **10 filas**. Por encima de eso el componente correcto es `data-table`.

━━━

## 4. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Lista estática |
| **Cargando (toda la lista)** | `skeleton`: 8 filas con círculo de 16px + barra de nombre de ancho variable (60–75%) + barra de veredicto de 48px a la derecha. Se conserva el alto exacto de la lista final |
| **Cargando (por factor)** | Cada fila puede resolverse por separado: el icono es `Loader2` girando y el veredicto dice `Analizando…` en `--text-tertiary`. Es el caso real del SEO Analyzer, donde los factores llegan de forma escalonada |
| **Fila hover** (si expandible) | Fondo `--surface-sunken`, `--radius-control`, `--dur-fast` |
| **Fila expandida** | El `ChevronDown` rota 180° en `--dur-fast`; el detalle entra con `height`+`opacity` en `--dur-base --ease-out` |
| **Foco** | `--focus-ring` en la fila completa cuando es interactiva |
| **Actualización de veredicto** | El icono hace crossfade en `--dur-base`; el texto del veredicto **no** anima. Si mejora, no hay celebración: es un diagnóstico, no un juego |
| **Vacío** | `Todavía no hemos analizado esta entrada` + botón `Analizar` (negro, `--action`) |
| **`prefers-reduced-motion`** | Sin rotación de chevron ni crossfade; el `Loader2` se sustituye por el texto `Analizando…` |

━━━

## 5. Tokens

| Rol | Token |
|---|---|
| Tarjeta | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-rest`, `--sp-5` |
| Título | `--fs-h3`, `--text-primary` |
| Enlace `Ver todos →` | `--fs-sm`, `--accent` → `--accent-hover` |
| Nombre del factor | `--fs-body`, `--text-primary` |
| Veredicto `Excelente` | `--perf-strong` |
| Veredicto `Bien` | `--perf` |
| Veredicto `Mejorable` | `--warn` |
| Veredicto `Deficiente` | `--danger` |
| Veredicto `No detectado` | icono `--neutral`, texto `--text-secondary` |
| Veredicto `Analizando` | `--text-tertiary` |
| Columna de puntos | `--fs-body`, `--text-secondary`, `tabular-nums` |
| Detalle expandido | `--fs-sm`, `--text-secondary` |
| Fila hover | `--surface-sunken`, `--radius-control` |
| Chevron | `--text-tertiary` |
| Foco | `--focus-ring` |
| Gaps | `--sp-3` (icono ↔ nombre), `--sp-1` (entre filas), `--sp-4` (título ↔ lista) |
| Movimiento | `--dur-fast` (hover, chevron), `--dur-base` (expandir) |

━━━

## 6. Accesibilidad

- **Tres canales por fila**: la **palabra** del veredicto, la **forma** del icono (check / triángulo
  / círculo) y el color. Quitando el color, la lista sigue siendo íntegramente legible — que es
  exactamente el criterio.
- **Es una lista, no una tabla**: `<ul>` con `aria-label="Factores evaluados"`. Cada `<li>` contiene
  el nombre y el veredicto como texto plano; el icono va `aria-hidden="true"`.
- **El veredicto se lee junto al factor.** El lector de pantalla debe oír `Enlaces internos,
  mejorable` como una sola unidad — no `Enlaces internos` … pausa … `Mejorable`. Se consigue
  poniendo ambos `<span>` dentro del mismo `<li>` sin elementos interactivos intermedios; si la fila
  es expandible, el `<button>` envuelve a los dos y su nombre accesible es
  `Enlaces internos, mejorable. Ver detalle`.
- **Carga escalonada**: la lista lleva `aria-busy="true"` mientras haya factores pendientes. Los
  veredictos que van llegando **no** se anuncian uno a uno (ocho anuncios seguidos son ruido); al
  terminar, una región `aria-live="polite"` dice una sola frase:
  `Análisis completo: 5 factores bien, 2 mejorables, 1 no detectado.`
- **Contraste**: `--warn` sobre `--surface` es el par más justo del sistema en modo claro. Por eso el
  veredicto va en **peso 500** y a 14px (nunca 12px), y por eso `--warn` no se usa aquí como fondo.
  `--perf` y `--danger` sobre `--surface` superan 4.5:1.
- **`No detectado` no es un error**: su texto va en `--text-secondary`, no en `--danger` ni en
  `--warn`. Marcar en rojo la ausencia de datos estructurados asustaría sin motivo.
- **Zona táctil**: una fila expandible ocupa 28px de alto visual; el `<button>` recibe padding
  vertical hasta `--touch-target` en pantallas táctiles.
- **`prefers-contrast: more`**: los iconos suben a `stroke-width: 2.5` y el veredicto añade subrayado
  punteado del color de su canal.

━━━

## 7. Marcado de ejemplo

```tsx
// components/admin/metric-list.tsx
import { CheckCircle2, AlertTriangle, AlertCircle, Circle, Loader2 } from "lucide-react";

const VEREDICTO = {
  excelente:  { icono: CheckCircle2,  color: "text-[var(--perf-strong)]",   texto: "Excelente"     },
  bien:       { icono: CheckCircle2,  color: "text-[var(--perf)]",          texto: "Bien"          },
  mejorable:  { icono: AlertTriangle, color: "text-[var(--warn)]",          texto: "Mejorable"     },
  deficiente: { icono: AlertCircle,   color: "text-[var(--danger)]",        texto: "Deficiente"    },
  ausente:    { icono: Circle,        color: "text-[var(--neutral)]",       texto: "No detectado",
                textoColor: "text-[var(--text-secondary)]" },
  analizando: { icono: Loader2,       color: "text-[var(--text-tertiary)]", texto: "Analizando…"   },
} as const;

export function MetricList({ titulo, factores, pendientes, resumen }: MetricListProps) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-hairline)]
                        bg-[var(--surface)] p-[var(--sp-5)] shadow-[var(--shadow-rest)]">
      <h3 className="mb-[var(--sp-4)] text-[length:var(--fs-h3)] font-semibold text-[var(--text-primary)]">
        {titulo}
      </h3>

      <ul aria-label={titulo} aria-busy={pendientes > 0} className="flex flex-col gap-[var(--sp-1)]">
        {factores.map((f) => {
          const v = VEREDICTO[f.veredicto];
          const Icono = v.icono;
          return (
            <li key={f.id} className="flex h-7 items-center gap-[var(--sp-3)]">
              <Icono
                size={16} strokeWidth={2} aria-hidden="true"
                className={`${v.color} shrink-0 ${f.veredicto === "analizando" ? "animate-spin motion-reduce:animate-none" : ""}
                            ${f.veredicto === "ausente" ? "fill-current" : ""}`}
              />
              <span className="flex-1 truncate text-[length:var(--fs-body)] text-[var(--text-primary)]">
                {f.nombre}
              </span>
              <span className={`text-[length:var(--fs-body)] font-medium ${v.textoColor ?? v.color}`}>
                {v.texto}
              </span>
            </li>
          );
        })}
      </ul>

      {/* un solo anuncio al terminar, nunca uno por factor */}
      <p aria-live="polite" className="sr-only">{pendientes === 0 ? resumen : ""}</p>
    </section>
  );
}
```

━━━

## 8. Reglas duras

1. **La palabra del veredicto siempre visible.** Nunca solo el icono.
2. **La forma del icono cambia con el veredicto.** Ocho checks de distinto color no comunican nada a
   quien no distingue el color.
3. **El veredicto es texto, no badge.** Ocho píldoras de colores convierten un diagnóstico sereno en
   una alarma.
4. **`No detectado` es neutro**, jamás rojo ni ámbar.
5. **Un solo anuncio al completar el análisis**, no uno por factor.
6. **Máximo 10 filas**; por encima, `data-table`.
