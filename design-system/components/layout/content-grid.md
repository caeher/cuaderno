# Content grid

> **Fuente:** `02-panel-resumen.png` (4 stat cards + grilla inferior), `05-panel-paginas.png` (4 stat
> cards), `06-panel-categorias.png` (4 stat cards), `07-panel-seo-analyzer.png` (4 métricas),
> `08-panel-analiticas.png` (5 métricas + grilla de 2 × 2 tarjetas de gráfico).
> **Las pantallas mandan.**

━━━

## 1. Propósito

La rejilla que ordena tarjetas dentro de `<main>`. No es un sistema de columnas genérico: es un
contrato corto con **cuatro configuraciones** que cubren las 9 pantallas. Si hace falta una quinta,
primero se revisa si alguna de estas sirve.

El gap es siempre `var(--sp-6)` (24px), horizontal y vertical. Ese 24 es el ritmo del panel y no se
ajusta por pantalla.

## 2. Configuraciones

| Configuración | Uso | Columnas por breakpoint |
|---|---|---|
| `metrics-4` | fila de stat cards | `xl: 4` · `md: 2` · `base: 1` |
| `metrics-5` | métricas de Analíticas | `2xl: 5` · `xl: 3` · `md: 2` · `base: 1` |
| `halves` | dos tarjetas de igual peso (gráfico + donut, populares + dispositivos) | `xl: 2` · `base: 1` |
| `main-aside` | tarjeta ancha + tarjeta estrecha (`Rendimiento en el tiempo` + `Acciones rápidas`) | `xl: 2fr 1fr` · `base: 1` |

`main-aside` **no** es lo mismo que `split-view`: aquí las dos piezas son tarjetas hermanas dentro del
flujo de la página; en `split-view` el panel derecho es una columna persistente que acompaña a toda la
pantalla. Ver `split-view.md` § 1.

```
metrics-4 (xl)              halves (xl)                 main-aside (xl)
┌────┐┌────┐┌────┐┌────┐   ┌──────────┐┌──────────┐    ┌───────────────┐┌──────┐
│    ││    ││    ││    │   │          ││          │    │               ││      │
└────┘└────┘└────┘└────┘   └──────────┘└──────────┘    └───────────────┘└──────┘
```

## 3. Tokens

| Propiedad | Token / valor |
|---|---|
| Display | `display: grid` |
| Gap | `var(--sp-6)` en ambos ejes |
| Ancho mínimo de celda | `200px` — por debajo, se baja de columnas antes que comprimir |
| Alineación | `align-items: stretch` — **todas las tarjetas de una fila miden lo mismo de alto** |
| Separación entre grillas consecutivas | `var(--sp-6)`, heredado del gap vertical de `<main>` |

Las columnas se declaran explícitas (`repeat(4, minmax(0, 1fr))`), no con `auto-fit`: `auto-fit`
produce filas huérfanas de 3+1 cuando el contenido no encaja, y en un panel de métricas eso se lee como
un error de datos.

`minmax(0, 1fr)` en vez de `1fr` es obligatorio: sin el `0`, un número largo o una tabla dentro de una
celda desborda la grilla.

## 4. La tarjeta dentro de la grilla

La rejilla no dibuja tarjetas, pero fija su envoltorio para que todas las pantallas coincidan:

| Propiedad | Token |
|---|---|
| Superficie | `--surface` |
| Borde | `1px solid var(--border-hairline)` |
| Radio | `var(--radius-card)` (14px) |
| Padding | `var(--sp-5)` (20px) |
| Sombra | `--shadow-rest` — **casi imperceptible**; el borde es lo que define la tarjeta |
| Altura mínima | `120px` en stat cards, para que una métrica sin delta no achique su celda |

Regla de color dentro de la grilla:
- El cuadro tintado del icono usa el tinte que corresponde al significado de la métrica —
  `--accent-tint` para lo que hace el producto, `--perf-tint` para rendimiento, `--warn-tint` /
  `--neutral-tint` para el resto.
- El delta positivo va en `--perf` con `↑`; el negativo en `--danger` con `↓`.
- Números en `--fs-display` o `--fs-h1` según densidad, **siempre con
  `font-variant-numeric: tabular-nums`**.

## 5. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1536px` | `metrics-5` alcanza sus 5 columnas |
| `≥ 1280px` | `metrics-4` → 4 · `metrics-5` → 3 · `halves` y `main-aside` → 2 columnas |
| `768–1279px` | todas las grillas de métricas → 2 columnas; `halves` y `main-aside` → 1 columna |
| `< 768px` | una columna en todo. El orden del DOM es el orden de lectura, así que las métricas más importantes van primero |

Al colapsar, **no se cambia el orden con CSS**. Si en móvil una tarjeta debe ir antes, se reordena en el
DOM (ver `panel-shell.md` § 7): `order` desincroniza el recorrido de teclado.

En `main-aside` a una columna, la tarjeta ancha va primero y la estrecha (`Acciones rápidas`) debajo, a
ancho completo.

## 6. Contenido ancho dentro de una celda

Tablas y gráficos que no caben:

- Contenedor propio con `overflow-x: auto`, `tabIndex={0}`, `role="region"` y `aria-label`
  (`"Tabla de entradas recientes, desplazable horizontalmente"`).
- **`<main>` nunca hace scroll horizontal.** El desbordamiento se resuelve dentro de la celda.
- Los gráficos usan `ResizeObserver` o `viewBox` con `preserveAspectRatio` para reflowear; una relación
  de aspecto fija (`aspect-ratio: 16 / 7` en el gráfico de líneas de `08`) evita el salto de layout al
  montar.
- **No hay librería de gráficos en `package.json`.** `08-panel-analiticas.png` (líneas comparativas,
  donut, barras horizontales) y `02` (área) exigen añadir una; hasta entonces esas celdas se
  especifican pero no se pueden implementar fielmente. Sea cual sea la elegida, sus colores salen de
  `--cat-1…--cat-8` y de `--accent` para la serie principal, nunca de la paleta por defecto de la
  librería.

## 7. Accesibilidad de teclado y foco

- La grilla es un contenedor de presentación: **sin `role="grid"`**. `role="grid"` obliga a navegación
  bidimensional con flechas, que no es lo que el usuario espera de unas tarjetas.
- Cuando las tarjetas son una colección homogénea (métricas), se envuelven en `<ul>` / `<li>` con
  `list-style: none`; así el lector anuncia "lista de 4 elementos" y se puede saltar entera.
- Cada tarjeta lleva su `<h2>` (o `<h3>` si cuelga de una sección con `<h2>`). El orden de encabezados
  refleja el orden visual.
- Tarjeta entera pulsable: se marca el **título** como enlace y se extiende su área con un pseudo-
  elemento (`::after` con `inset: 0`), en vez de hacer focalizable el `<div>` completo. Así el enlace
  tiene un nombre accesible útil y el anillo `var(--focus-ring)` se dibuja sobre el radio de la tarjeta.
- El foco visible nunca se recorta: las tarjetas evitan `overflow: hidden` salvo que lo compensen con
  `outline-offset` o `box-shadow` sobre el propio contenedor.
- Los deltas de color (`↑ 18%` en `--perf`) llevan siempre glifo o texto además del color:
  `<span aria-label="sube 18 por ciento">`. El color no puede ser el único portador de significado.
- Si una celda se actualiza en vivo, se anuncia por `aria-live="polite"` a nivel de la métrica, nunca
  de la grilla completa.

## 8. Marcado de referencia

```tsx
// metrics-4
<ul className="grid list-none grid-cols-1 gap-[var(--sp-6)]
               md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))]">
  {metricas.map((m) => (
    <li
      key={m.id}
      className="flex min-h-[120px] flex-col justify-between rounded-[var(--radius-card)]
                 border border-[var(--border-hairline)] bg-[var(--surface)]
                 p-[var(--sp-5)] shadow-[var(--shadow-rest)]"
    >
      <div className="flex items-center gap-[var(--sp-3)]">
        <span className="grid size-9 place-items-center rounded-[var(--radius-input)]
                         bg-[var(--accent-tint)]">
          <m.icon className="size-[18px] text-[var(--accent)]" aria-hidden />
        </span>
        <h2 className="text-[14px] text-[var(--text-secondary)]">{m.titulo}</h2>
      </div>

      <div className="mt-[var(--sp-4)] flex items-baseline gap-[var(--sp-3)]">
        <span className="text-[30px] font-semibold leading-[1.15] tabular-nums
                         text-[var(--text-primary)]">
          {m.valor}
        </span>
        <span
          aria-label={`sube ${m.delta} por ciento`}
          className="rounded-[var(--radius-pill)] bg-[var(--perf-tint)] px-[var(--sp-2)]
                     py-0.5 text-[12px] font-medium tabular-nums text-[var(--perf-strong)]"
        >
          ↑ {m.delta}%
        </span>
      </div>

      <p className="mt-[var(--sp-2)] text-[13px] text-[var(--text-tertiary)]">{m.comparativa}</p>
    </li>
  ))}
</ul>
```

```tsx
// main-aside
<section className="grid grid-cols-1 gap-[var(--sp-6)] xl:grid-cols-[2fr_minmax(0,1fr)]">
  <TarjetaRendimiento />
  <TarjetaAccionesRapidas />
</section>
```

## 9. Modo oscuro

La grilla no define colores propios. Los dos puntos a vigilar están en la tarjeta:

1. `--surface` sobre `--bg-page` en oscuro se distinguen poco: el borde `--border-hairline` **no puede**
   suprimirse "porque en oscuro ya se ve el contraste". Se ve peor.
2. `--shadow-rest` es casi invisible en oscuro y eso está bien: no se sustituye por una sombra más
   fuerte. La separación la da el borde.

## 10. Notas de implementación

- Los `min-h` de las tarjetas evitan que la carga de datos cambie la altura de la fila; combinados con
  esqueletos del mismo alto, la grilla no salta (`CLS` cerca de 0).
- Todas las cifras pasan por `toLocaleString("es")`: `24.800` y `24,8K`, nunca `24,800`.
- Las abreviaturas (`24.8K`, `3.2K`) que se ven en las pantallas usan **coma decimal en español**:
  `24,8K`.
