# AI Thinking — el estado "la IA está pensando"

> El destello ✦ índigo es la firma del producto pensando. Aparece en `02-panel-resumen`
> (`Sugerencia de IA ✦`), en `04-panel-editor-de-entrada` (botón `Escribir con IA`, placeholder
> `Escribe "/" para ver las opciones o escribe con IA…`), en `07-panel-seo-analyzer`
> (`✦ Ejemplo:` y `✦ Siguiente paso recomendado`) y en el sidebar (grupo de herramientas de IA).
>
> **El problema real: las llamadas tardan 10–15 segundos.** Eso es una eternidad en una interfaz.
> Un spinner durante 13 segundos comunica "esto se colgó". Este componente existe para convertir esa
> espera en algo que se siente **trabajado, no roto**: el producto dice qué está haciendo, deja
> cancelar, y cuando puede, muestra el texto llegando en vivo.

Ruta destino: `components/admin/ai/ai-thinking.tsx`

━━━

## 1. Anatomía

```
  ✦   Analizando tu contenido…                              Cancelar
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Destello ✦** | Icono lucide `Sparkles` en `--accent`. 16px (`boton`, `linea`) / 20px (`panel`). Pulsa: `opacity 1 → .55 → 1` y `scale 1 → 1.08 → 1` en **1600ms** `--ease-out`, infinito. **Es el mismo icono del sidebar y del botón `Escribir con IA`** — la continuidad visual es lo que hace que la espera se lea como "la IA", no como "cargando" |
| 2 | **Etiqueta de etapa** | `--fs-body` (14) en `panel`, `--fs-sm` (13) en `linea`/`boton`. Peso 500, `--text-secondary`. Cambia con el tiempo (§2) |
| 3 | **Barra de progreso** | 3px, `--radius-pill`, pista `--accent-tint`, relleno `--accent`. **Determinada por etapa**, no indeterminada: ver §2.2 |
| 4 | **Líneas fantasma** | Solo en `panel`. Barras de texto en `--accent-tint` (no `--surface-sunken`: el tinte índigo dice "esto lo está escribiendo la IA"), anchos 100% / 92% / 68%, alto 10px, `--radius-pill` |
| 5 | **Cancelar** | Enlace `--fs-sm` peso 500 en `--text-secondary` → `--danger` en hover. **Aparece a los 8 s**, con fade en `--dur-base`. Antes no: ofrecer cancelar de entrada invita a dudar |

━━━

## 2. Etapas — el corazón del componente

Una espera de 13 segundos con un solo mensaje se siente colgada. Con cuatro mensajes que avanzan, se
siente trabajada. Las etapas son **honestas sobre lo que ocurre**, no relleno decorativo.

### 2.1 Guion por defecto

| Desde | Etiqueta | Barra |
|---|---|---|
| 0 s | `Preparando…` | 8% |
| 1.5 s | `Analizando tu contenido…` | 30% |
| 5 s | `Redactando…` | 60% |
| 10 s | `Puliendo el resultado…` | 85% |
| 16 s | `Está tardando más de lo normal…` | 92%, **se detiene** |
| 30 s | Se aborta y se muestra `alert` `destructivo` con `Reintentar` | — |

Reglas del guion:

- **La barra nunca llega al 100% antes de tener la respuesta.** Se queda en 92% y espera. Una barra
  llena con la pantalla sin cambiar es la peor mentira que puede contar una interfaz.
- **Las etapas se personalizan por operación**: `Escribir con IA` usa
  `Leyendo tu entrada… → Buscando el tono… → Redactando…`; el SEO Analyzer usa
  `Descargando la página… → Evaluando 8 factores… → Comparando con la competencia…`. Un guion
  genérico en todas partes delata que las etapas son mentira.
- **Ninguna etapa afirma algo falso.** Si el backend no compara con la competencia, esa etapa no
  existe.
- **Con streaming, el guion se abandona en cuanto llega el primer token** (§3).

### 2.2 Por qué barra por etapas y no indeterminada

Una barra indeterminada (el segmento que va y viene) no distingue 2 s de 20 s: comunica "esperá" sin
más. La barra por etapas da una expectativa razonable y avanza aunque el backend no reporte
progreso — que es el caso real, porque un LLM no informa de su avance. Es una **estimación honesta**
mientras no mienta llegando al final.

━━━

## 3. Variantes

| Variante | Dónde | Composición |
|---|---|---|
| `boton` | `04` — `Escribir con IA`; `07` — `Analizar` | El botón conserva **exactamente su ancho** (`min-width` fijado antes de cambiar el contenido) y sustituye su label: destello pulsando + `Pensando…`. `aria-disabled="true"`, `pointer-events: none`. **Prohibido** dejar el botón clicable: dos llamadas de 13 s en paralelo son dinero y confusión |
| `linea` | Editor TipTap, donde se insertará el texto | Una línea en el propio flujo del documento: destello + etapa + barra de 3px al ancho del párrafo. El cursor del editor no se mueve. Al llegar el texto, se sustituye en el sitio |
| `panel` | `02` — tarjeta `Sugerencia de IA`; `07` — `Siguiente paso recomendado` | Destello + etapa + barra + 3 líneas fantasma en `--accent-tint`. Ocupa el alto que ocupará el resultado |
| `inline-chip` | Junto a un campo (generar extracto, generar meta descripción) | Píldora compacta: destello 14px + `Generando…`, fondo `--accent-tint`, `--radius-pill`, alto 24px. Sin barra ni cancelar |

### 3.1 Streaming — la mejor versión de este componente

Cuando la llamada devuelve tokens en streaming, **el estado de espera dura solo hasta el primer
token**. En cuanto llega:

- Desaparecen la barra y las líneas fantasma.
- El texto se escribe en su sitio final con un **cursor** de 2×18px en `--accent` parpadeando a
  1000ms al final del contenido.
- El destello sigue pulsando junto al texto hasta que la respuesta cierra.
- `Cancelar` se mantiene y ahora significa "quedarme con lo escrito hasta aquí".

**Una llamada de 13 s con streaming se siente como 2 s.** Si la API lo permite, esta es la variante
por defecto y las etapas son solo el puente hasta el primer token.

━━━

## 4. Estados

| Estado | Comportamiento |
|---|---|
| **Inactivo** | El componente no existe en el DOM |
| **Pensando (0–8 s)** | Destello + etapa + barra. Sin `Cancelar` |
| **Pensando largo (8 s+)** | Aparece `Cancelar` con fade `--dur-base` |
| **Tardando (16 s+)** | Cambia la etiqueta, la barra se detiene en 92%. Nada parpadea más rápido: acelerar la animación transmite pánico |
| **Escribiendo (streaming)** | §3.1 |
| **Resuelto** | El bloque se sustituye por el resultado con crossfade `--dur-base --ease-out`. **Sin celebración**: ni confeti, ni destello ampliado, ni toast de éxito. El resultado es el mensaje |
| **Cancelado** | Desaparece sin dejar rastro; nada se inserta. Toast `info`: `Generación cancelada` |
| **Error** | El bloque se sustituye por un `alert` `destructivo` **en el mismo sitio**, con `Reintentar` y el motivo en lenguaje llano (`El servicio de IA no respondió`, no un código HTTP) |
| **Sin créditos / límite de plan** | `alert` `atencion` con `Ver planes` en `--accent`. Nunca se presenta como error del usuario |
| **`prefers-reduced-motion`** | El destello **no pulsa** (queda estático en `--accent`), la barra **no anima** su ancho (salta entre etapas), el cursor de streaming no parpadea. El componente sigue siendo íntegramente comprensible: el mensaje son las palabras |

━━━

## 5. Tokens

| Rol | Token |
|---|---|
| Destello ✦ | `--accent` |
| Etiqueta de etapa | `--fs-body` / `--fs-sm`, `--text-secondary` |
| Barra — pista | `--accent-tint`, `--radius-pill`, 3px |
| Barra — relleno | `--accent` |
| Líneas fantasma | `--accent-tint`, `--radius-pill` |
| Cursor de streaming | `--accent`, 2×18px |
| `Cancelar` | `--fs-sm`, `--text-secondary` → `--danger` |
| Chip `inline-chip` | `--accent-tint`, texto `--accent`, `--radius-pill` |
| Contenedor `panel` | `--surface`, `--border-hairline`, `--radius-card`, `--sp-5` |
| Botón ocupado | Conserva sus tokens; texto e icono no cambian de color |
| Error | Tokens de `alert` `destructivo` |
| Pulso del destello | 1600ms `--ease-out` |
| Parpadeo del cursor | 1000ms `step-end` |
| Transición de barra | `--dur-base` `--ease-out` |
| Crossfade al resultado | `--dur-base` `--ease-out` |

**El índigo aquí es doctrinal, no estético.** Toda espera de IA se pinta en `--accent` y ninguna otra
espera del sistema lo hace: `skeleton` usa `--surface-sunken`, los spinners de guardado usan
`--text-tertiary`. Así el usuario aprende, sin que nadie se lo explique, que **índigo = la IA está
trabajando**.

━━━

## 6. Accesibilidad

> Una espera de 13 segundos es un problema de accesibilidad antes que de estética: quien no ve la
> pantalla no tiene ni idea de si el botón funcionó.

- **`role="status"` + `aria-live="polite"` + `aria-busy="true"`** en el contenedor. **Nunca
  `assertive`**: interrumpir cuatro veces en 13 segundos es hostil.
- **Se anuncia el inicio, un recordatorio y el final. Nada más.**
  - Al arrancar: `Generando texto con IA. Esto puede tardar unos segundos.`
  - A los 10 s, una sola vez: `Sigue trabajando.`
  - Al terminar: `Texto generado. 240 palabras añadidas.` o `La generación falló. Puedes reintentar.`
  - **Las etapas visuales NO se anuncian una a una.** Cuatro anuncios en 13 s son ruido. Las
    etiquetas de etapa van dentro de un `<span aria-hidden="true">` y el texto anunciado se controla
    aparte. Este es el detalle que más se hace mal.
- **`Cancelar` es alcanzable con teclado desde el momento en que aparece**, y el foco no se mueve
  solo hacia él.
- **Al resolverse, el foco va al resultado** si el usuario puede editarlo (texto insertado en el
  editor: el cursor queda al final del texto nuevo). Si no, el foco se queda donde estaba. **Nunca
  se pierde en el `<body>`** — el fallo clásico al reemplazar un nodo enfocado.
- **El botón ocupado conserva su nombre accesible** y añade el estado:
  `aria-label="Escribir con IA"` + `aria-busy="true"`. Cambiar el nombre accesible a `Pensando…`
  hace que el usuario pierda de vista qué botón pulsó.
- **`aria-disabled="true"` en vez de `disabled`**: un botón `disabled` desaparece del orden de
  tabulación y el foco del usuario se cae al `<body>` en mitad de la espera.
- **El destello no es el mensaje.** Siempre hay texto (`Pensando…`, `Analizando tu contenido…`)
  junto a él. Un icono animado sin texto no comunica nada a quien usa lector de pantalla ni a quien
  no reconoce el símbolo ✦.
- **La barra de progreso es decorativa** (`aria-hidden`): su valor es una estimación, y un
  `role="progressbar"` con `aria-valuenow` inventado sería mentirle al lector de pantalla. El estado
  real lo lleva `aria-busy` + los anuncios.
- **Contraste**: `--accent` sobre `--surface` supera 3:1 (elemento gráfico). Las líneas fantasma en
  `--accent-tint` son decorativas y no necesitan contraste; el texto de etapa va en
  `--text-secondary`, que sí cumple 4.5:1.
- **`prefers-reduced-motion`**: sin pulso, sin animación de barra, sin cursor parpadeante. La espera
  se comunica solo con palabras — y sigue funcionando, que es la prueba de que el diseño es sólido.

━━━

## 7. Marcado de ejemplo

```tsx
// components/admin/ai/ai-thinking.tsx
"use client";
import { Sparkles } from "lucide-react";

type Etapa = { desde: number; etiqueta: string; barra: number };

export const GUION_ESCRITURA: Etapa[] = [
  { desde: 0,     etiqueta: "Preparando…",                       barra: 8  },
  { desde: 1500,  etiqueta: "Leyendo tu entrada…",               barra: 30 },
  { desde: 5000,  etiqueta: "Redactando…",                       barra: 60 },
  { desde: 10000, etiqueta: "Puliendo el resultado…",            barra: 85 },
  { desde: 16000, etiqueta: "Está tardando más de lo normal…",   barra: 92 },
];

export function AiThinking({
  guion = GUION_ESCRITURA, variante = "panel", onCancelar,
}: AiThinkingProps) {
  const transcurrido = useTranscurrido();                       // ms desde el montaje
  const etapa = [...guion].reverse().find((e) => transcurrido >= e.desde) ?? guion[0];
  const mostrarCancelar = transcurrido >= 8000 && Boolean(onCancelar);

  // se anuncia el inicio, UN recordatorio a los 10 s, y el final. Las etapas NO se anuncian.
  const anuncio =
    transcurrido < 10000
      ? "Generando texto con IA. Esto puede tardar unos segundos."
      : "Sigue trabajando.";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="rounded-[var(--radius-card)] border border-[var(--border-hairline)]
                 bg-[var(--surface)] p-[var(--sp-5)]"
    >
      <div className="flex items-center gap-[var(--sp-3)]">
        <Sparkles
          size={20} strokeWidth={1.75} aria-hidden="true"
          className="shrink-0 text-[var(--accent)]
                     animate-[destello_1600ms_var(--ease-out)_infinite]
                     motion-reduce:animate-none"
        />
        {/* visible pero no anunciado: el guion es visual, el anuncio se controla aparte */}
        <span aria-hidden="true"
              className="flex-1 text-[length:var(--fs-body)] font-medium text-[var(--text-secondary)]">
          {etapa.etiqueta}
        </span>

        {mostrarCancelar && (
          <button
            onClick={onCancelar}
            className="text-[length:var(--fs-sm)] font-medium text-[var(--text-secondary)]
                       hover:text-[var(--danger)] rounded-[var(--radius-input)]
                       focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* barra decorativa: su valor es una estimación, no un progreso real */}
      <div aria-hidden="true"
           className="mt-[var(--sp-4)] h-[3px] w-full overflow-hidden
                      rounded-[var(--radius-pill)] bg-[var(--accent-tint)]">
        <div
          style={{ width: `${etapa.barra}%` }}
          className="h-full rounded-[var(--radius-pill)] bg-[var(--accent)]
                     [transition:width_var(--dur-base)_var(--ease-out)]
                     motion-reduce:transition-none"
        />
      </div>

      {/* líneas fantasma en tinte índigo: "esto lo está escribiendo la IA" */}
      <div aria-hidden="true" className="mt-[var(--sp-4)] flex flex-col gap-[var(--sp-2)]">
        {["100%", "92%", "68%"].map((w) => (
          <div key={w} style={{ width: w }}
               className="h-2.5 rounded-[var(--radius-pill)] bg-[var(--accent-tint)]
                          animate-[pulso_1600ms_ease-in-out_infinite] motion-reduce:animate-none" />
        ))}
      </div>

      <p className="sr-only">{anuncio}</p>
    </div>
  );
}

/* CSS global */
@keyframes destello {
  0%, 100% { opacity: 1;   transform: scale(1) }
  50%      { opacity: .55; transform: scale(1.08) }
}
```

Variante `boton` — el ancho se congela antes de cambiar el contenido:

```tsx
<button
  ref={btn}
  onClick={generar}
  aria-label="Escribir con IA"       // el nombre accesible NO cambia
  aria-busy={pensando}
  aria-disabled={pensando}
  style={pensando ? { minWidth: anchoCongelado } : undefined}
  className="inline-flex h-9 items-center justify-center gap-[var(--sp-2)]
             rounded-[var(--radius-control)] border border-[var(--border-hairline)]
             bg-[var(--surface)] px-[var(--sp-4)] text-[length:var(--fs-sm)] font-medium
             text-[var(--text-primary)] aria-disabled:pointer-events-none
             focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
>
  <Sparkles size={16} strokeWidth={1.75} aria-hidden="true"
            className={`text-[var(--accent)] ${pensando
              ? "animate-[destello_1600ms_var(--ease-out)_infinite] motion-reduce:animate-none" : ""}`} />
  <span aria-hidden="true">{pensando ? "Pensando…" : "Escribir con IA"}</span>
</button>
```

━━━

## 8. Reglas duras

1. **La barra nunca llega al 100% antes que la respuesta.**
2. **Las etapas no se anuncian una a una.** Inicio, un recordatorio a los 10 s, final.
3. **`aria-disabled`, no `disabled`.** El foco no se puede caer en mitad de una espera de 13 s.
4. **`Cancelar` a los 8 s**, no antes.
5. **Streaming siempre que la API lo permita.** Es la mejor mejora de percepción disponible.
6. **Índigo solo para la IA.** Si un skeleton normal se pinta de `--accent-tint`, la señal se pierde.
7. **Sin celebración al terminar.** El resultado es el premio.
8. **Nada acelera cuando tarda.** Una animación que se apura transmite pánico.
9. **Ninguna etapa miente sobre lo que hace el backend.**
