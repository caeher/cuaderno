# Skeleton — esqueletos de carga

> Un skeleton no es "algo mientras carga": es una **promesa de la forma que viene**. Si el esqueleto
> no coincide con el contenido real, el layout salta y la promesa se rompe.
>
> Cuaderno necesita tres patrones, uno por cada forma que se repite en las 9 pantallas: **tabla**
> (`02`, `03`, `05`, `06`, `08`), **grilla de métricas** (`02`, `05`, `06`, `07`, `08`) y **gráfico**
> (`02`, `08`). Todo lo demás se compone con la primitiva.

Ruta destino: `components/admin/skeletons/` — la primitiva `components/ui/skeleton.tsx` (shadcn) ya
existe y es la base.

━━━

## 1. La primitiva

| Propiedad | Valor |
|---|---|
| Fondo | `--surface-sunken` |
| Radio | El **del elemento que sustituye**: `--radius-thumb` para un thumbnail, `--radius-pill` para un badge o una barra de texto, `--radius-card` para una tarjeta, `50%` para un avatar o un anillo |
| Animación | **Pulso de opacidad**: `1 → 0.55 → 1` en **1600ms**, `ease-in-out`, infinito. Sin shimmer |
| `prefers-reduced-motion` | Sin animación; el bloque queda estático en `--surface-sunken` |

**Por qué pulso y no shimmer.** El shimmer (barrido de brillo diagonal) es un gradiente en
movimiento constante: sobre un sistema que se sostiene con hairline y aire, y con `--shadow-rest`
casi inexistente, un brillo recorriendo la pantalla es el elemento más ruidoso del panel. El pulso
es más barato (una propiedad animable en el compositor), más tranquilo, y no necesita una capa
`::after` con `overflow: hidden` por bloque.

**Desfase**: los bloques de un mismo grupo comparten fase — **no** se escalona la animación. Doce
bloques latiendo a destiempo parecen una avería.

━━━

## 2. Cuándo usarlo (y cuándo no)

| Duración esperada | Qué mostrar |
|---|---|
| **< 300 ms** | **Nada.** Un skeleton que parpadea 200ms es peor que la espera. Se retrasa su aparición 300ms con un temporizador |
| **300 ms – 3 s** | Skeleton del patrón correspondiente |
| **3 s – 10 s** | Skeleton + texto de contexto bajo el bloque (`Cargando tus analíticas…`) en `--fs-sm` `--text-tertiary` |
| **> 10 s (llamada de IA)** | **No es skeleton**: es `ai-thinking.md`, con etapas, destello y cancelación |
| **Recarga de datos ya visibles** | **No es skeleton**: el contenido existente baja a `opacity: .55` con `pointer-events: none`. Reemplazar una tabla llena por su esqueleto al reordenar es un retroceso visible |

━━━

## 3. Los tres patrones

### 3.1 `SkeletonTabla`

Reproduce `data-table.md` §1. Se le pasan `filas` y `columnas` para que coincida con la tabla real.

```
┌───────────────────────────────────────────────────────────┐
│ ▬▬▬▬▬   ▬▬▬▬    ▬▬▬▬▬▬    ▬▬▬▬    ▬▬▬▬   ▬▬▬▬▬            │ ← header REAL (no fantasma)
├───────────────────────────────────────────────────────────┤
│ ▣  ▬▬▬▬▬▬▬▬▬▬▬▬   ◉ ▬▬▬▬   ⬭▬▬▬▬   ⬭▬▬▬▬  ▬▬▬▬   ◯   ⋮   │
│    ▬▬▬▬▬▬▬                                                │
├───────────────────────────────────────────────────────────┤
```

- **El header se dibuja de verdad**, con sus etiquetas reales. Los nombres de columna se conocen
  antes que los datos; fingirlos es gratuito y peor.
- Alto de fila **idéntico** al de la tabla real (74 / 62 / 53px según `density`).
- Por fila: thumbnail 44×44 `--radius-thumb` · dos barras de título (100% y 62% de 240px, alto 10px,
  `--radius-pill`, gap 6px) · avatar 24px circular + barra de 72px · chip 90×20 `--radius-pill` ·
  badge 72×22 `--radius-pill` · barra de fecha 76×10 + barra de hora 52×8 · círculo 32px · nada en la
  celda del menú ⋮.
- **Anchos de título alternados** entre filas (100%, 78%, 92%, 65%, 85%, 72%) para que no parezca una
  cuadrícula perfecta — un esqueleto demasiado regular se lee como una tabla de verdad vacía.
- Filas por defecto: **6** (lo que muestra `03` por página).

### 3.2 `SkeletonMetricas`

Reproduce la grilla de `stat-card.md`.

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ▣  ▬▬▬▬▬▬    │ │ ▣  ▬▬▬▬▬     │ │ ▣  ▬▬▬▬▬▬▬   │ │ ▣  ▬▬▬▬▬     │
│              │ │              │ │              │ │              │
│ ▬▬▬▬▬  ▬▬▬   │ │ ▬▬▬▬  ▬▬▬    │ │ ▬▬▬  ▬▬▬     │ │ ▬▬▬▬▬  ▬▬▬   │
│ ▬▬▬▬▬▬▬▬▬    │ │ ▬▬▬▬▬▬▬▬     │ │ ▬▬▬▬▬▬▬▬▬    │ │ ▬▬▬▬▬▬▬      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

- La **tarjeta es real** (borde `--border-hairline`, `--radius-card`, `--shadow-rest`, padding
  `--sp-5`, `min-height: 116px`): lo fantasma es su contenido. Así la grilla no salta ni un píxel.
- Por tarjeta: cuadro 40×40 `--radius-control` · barra de label 96×12 · barra de valor 88×24
  (`--radius-pill`) · barra de delta 52×16 · barra de comparación 140×10.
- Número de tarjetas = el real de la pantalla (4 en `02`/`05`/`06`/`07`, 5 en `08`), nunca un número
  genérico.

### 3.3 `SkeletonGrafico`

Reproduce la tarjeta de `line-chart.md` / `donut-chart.md`.

- Tarjeta real; dentro: barra de título 140×14 arriba a la izquierda, bloque de control 96×32
  `--radius-control` arriba a la derecha.
- **Línea**: bloque `--radius-control` del alto exacto del área de trazado (240px `completo`, 180px
  `compacto`), más 5 barras de 28×10 en la columna del eje Y y 6 barras de 40×10 bajo el eje X.
- **Dona**: círculo de 200px con agujero (`border: 42px solid var(--surface-sunken)`,
  `border-radius: 50%`) + 6 filas de leyenda (punto 8px + barra 120×12 + barra 72×12).
- **Nunca** se dibuja una línea o una dona falsa con datos inventados: sugiere un dato que no existe.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Bloque | `--surface-sunken` |
| Tarjeta contenedora (real) | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-rest` |
| Radios de bloque | `--radius-pill` (texto, badges, barras), `--radius-thumb` (thumbnails), `--radius-control` (cuadros, bloques grandes), `50%` (avatares, anillos) |
| Texto de contexto (>3 s) | `--fs-sm`, `--text-tertiary` |
| Duración del pulso | 1600ms `ease-in-out` (excepción documentada a `--dur-*`: son duraciones de interacción, no de latido) |
| Retardo de aparición | 300ms |

━━━

## 5. Accesibilidad

- **El contenedor que se está llenando lleva `aria-busy="true"`**, y los bloques del esqueleto van
  `aria-hidden="true"`. Un lector de pantalla no debe recorrer 40 divs vacíos.
- **Se anuncia el inicio y el fin, no el intermedio**: una región `aria-live="polite"` dice
  `Cargando entradas…` al superar los 300ms y `24 entradas cargadas` al terminar. Dos frases en toda
  la espera.
- **El esqueleto no es focusable** ni contiene nada focusable. Al terminar, el foco no se mueve solo:
  se queda donde el usuario lo dejó (normalmente el filtro o el buscador que disparó la carga).
- **`prefers-reduced-motion: reduce`**: sin pulso. La ausencia de contenido más el `aria-busy`
  siguen comunicando el estado; la animación no es el mensaje.
- **Contraste**: `--surface-sunken` sobre `--surface` es una diferencia deliberadamente sutil. No
  necesita cumplir contraste de texto (no hay texto), pero sí debe ser **perceptible en modo
  oscuro** — el contrato de tokens debe garantizar que `--surface-sunken` en oscuro no colapse contra
  `--surface`.
- **Nunca un `<Spinner>` como sustituto en estas tres zonas.** Un spinner no dice cuánto contenido
  viene ni de qué forma; el skeleton sí, y evita el salto de layout (CLS).
- **Cero desplazamiento de layout**: el esqueleto ocupa **exactamente** el alto del contenido final.
  Es el criterio de aceptación medible de este componente.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/skeleton.tsx — primitiva
export function Skeleton({ className, radio = "pill" }: SkeletonProps) {
  const RADIO = {
    pill:    "rounded-[var(--radius-pill)]",
    thumb:   "rounded-[var(--radius-thumb)]",
    control: "rounded-[var(--radius-control)]",
    card:    "rounded-[var(--radius-card)]",
    circulo: "rounded-full",
  } as const;

  return (
    <div
      aria-hidden="true"
      className={`animate-[pulso_1600ms_ease-in-out_infinite] bg-[var(--surface-sunken)]
                  motion-reduce:animate-none ${RADIO[radio]} ${className}`}
    />
  );
}

/* en el CSS global, junto a los tokens */
@keyframes pulso { 0%, 100% { opacity: 1 } 50% { opacity: .55 } }
```

```tsx
// components/admin/skeletons/skeleton-tabla.tsx
const ANCHOS = ["100%", "78%", "92%", "65%", "85%", "72%"]; // evita la cuadrícula perfecta

export function SkeletonTabla({ filas = 6, columnas, densidad = "comoda" }: Props) {
  const alto = { comoda: "h-[74px]", compacta: "h-[62px]", densa: "h-[53px]" }[densidad];

  return (
    <div
      aria-busy="true"
      className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-hairline)]
                 bg-[var(--surface)] shadow-[var(--shadow-rest)]"
    >
      {/* el header es REAL: los nombres de columna se conocen antes que los datos */}
      <div className="flex h-12 items-center gap-[var(--sp-4)] border-b border-[var(--border-hairline)]
                      px-[var(--sp-5)]">
        {columnas.map((c) => (
          <span key={c.id}
                className="text-[length:var(--fs-sm)] font-medium text-[var(--text-secondary)]">
            {c.label}
          </span>
        ))}
      </div>

      {Array.from({ length: filas }).map((_, i) => (
        <div key={i}
             className={`flex ${alto} items-center gap-[var(--sp-4)] border-b
                         border-[var(--border-hairline)] px-[var(--sp-5)] last:border-0`}>
          <Skeleton radio="thumb" className="size-11 shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-2.5" style={{ width: ANCHOS[i % ANCHOS.length] }} />
            <Skeleton className="h-2.5 w-[62%]" />
          </div>
          <Skeleton radio="circulo" className="size-6 shrink-0" />
          <Skeleton className="h-5 w-[90px] shrink-0" />
          <Skeleton className="h-[22px] w-[72px] shrink-0" />
          <div className="flex w-20 shrink-0 flex-col gap-1.5">
            <Skeleton className="h-2.5 w-[76px]" />
            <Skeleton className="h-2 w-[52px]" />
          </div>
          <Skeleton radio="circulo" className="size-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}
```

Retardo de 300ms para que una respuesta rápida no parpadee:

```tsx
export function useEsqueletoDiferido(cargando: boolean, retardo = 300) {
  const [mostrar, setMostrar] = useState(false);
  useEffect(() => {
    if (!cargando) { setMostrar(false); return; }
    const t = setTimeout(() => setMostrar(true), retardo);
    return () => clearTimeout(t);
  }, [cargando, retardo]);
  return mostrar;
}
```

━━━

## 7. Reglas duras

1. **Mismo alto que el contenido real.** Cero salto de layout. Es medible: `CLS = 0`.
2. **Pulso, no shimmer.**
3. **Todos los bloques de un grupo laten en fase.**
4. **Header y tarjeta se dibujan de verdad**; solo el dato es fantasma.
5. **Nada bajo 300ms; nada por encima de 10s** (eso es `ai-thinking`).
6. **Recargar ≠ cargar**: contenido existente se atenúa, no se sustituye.
7. **Nunca gráficos falsos con forma de dato.**
