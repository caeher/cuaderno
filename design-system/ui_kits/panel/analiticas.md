# Panel · Analíticas

> **Fuente:** `../../ui-ux-panels/08-panel-analiticas.png`.
> **Ruta:** `app/panel/analiticas/` — **no existe todavía**. Tampoco existe fuente de datos de
> analítica en `convex/schema.ts`.
> **Las pantallas mandan.**

━━━

## 1. Composición

Forma **B — ancho completo**, apilada en tres bandas con gap `--sp-6`:

```
page-header:  Analíticas · «Qué funciona en tu blog»      [ 📅 1 may – 30 may 2026 ▾ ]
──────────────────────────────────────────────────────────────────────────────
tabs:  Resumen  Audiencia  Contenido  Adquisición  Comportamiento  Tiempo real
──────────────────────────────────────────────────────────────────────────────
banda 1 → 5 stat cards
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│ Vistas ││ Visit. ││ T. med.││ Rebote ││ Coment.│
└────────┘└────────┘└────────┘└────────┘└────────┘
banda 2 → 1fr 1fr
┌────────────────────────────┐┌────────────────────────────┐
│ Visitas         Diario ▾  ││ Fuentes de tráfico          │
│ line-chart + comparación   ││ donut-chart + leyenda       │
└────────────────────────────┘└────────────────────────────┘
banda 3 → 1fr 1fr
┌────────────────────────────┐┌────────────────────────────┐
│ Entradas más populares      ││ Dispositivos                │
│ data-table compacta         ││ progress-bar × 3            │
└────────────────────────────┘└────────────────────────────┘
                    ⟳ Los datos se actualizan cada 24 horas
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` con **selector de rango** como acción — `core/dropdown-menu.md` + `calendar-days` (+ *Pendiente* `forms/date-time-picker.md` para el rango personalizado). **No es un botón negro**: no crea nada |
| Tabs | `navigation/tabs.md`, 6 secciones |
| Banda 1 | `layout/content-grid.md` (**5 columnas**) × `data-display/stat-card.md` |
| Banda 2 izq. | Tarjeta (padding `--sp-6`) + `data-display/line-chart.md` + selector `Diario ▾` |
| Banda 2 der. | Tarjeta + `data-display/donut-chart.md` con leyenda |
| Banda 3 izq. | Tarjeta + `data-display/data-table.md` (`density="compacta"`, sin thumbnail) |
| Banda 3 der. | Tarjeta + `data-display/progress-bar.md` × 3 |
| Pie | Línea `--fs-sm`/`--text-tertiary` con `refresh-cw` 16 |

### El selector de rango

`Últimos 7 días` · `Últimos 30 días` · `Últimos 90 días` · `Este año` · `Personalizado…`
El personalizado abre `react-day-picker` (ya está en `package.json`) en un popover con dos meses.

El rango elegido **se refleja en la URL** (`?desde=2026-05-01&hasta=2026-05-30`) para que un enlace
compartido reproduzca exactamente la misma vista.

### Las cinco métricas

| Icono / tinte | Label | Valor | Delta |
|---|---|---|---|
| `eye` / `--cat-2` | Vistas de página | `24 812` | `↑ 12.4 %` |
| `users` / `--cat-1` | Visitantes únicos | `8 412` | `↑ 6.1 %` |
| `clock` / `--cat-6` | Tiempo medio de lectura | `3:42` | `↑ 0:18` |
| `target` / `--cat-4` | Tasa de rebote | `42.1 %` | `↓ 4.3 %` |
| `message-square` / `--cat-5` | Comentarios | `128` | `↑ 9` |

Línea de contexto en las cinco: `vs. 1 abr – 30 abr 2026` en `--fs-sm`/`--text-tertiary`.

**El color del delta sigue la dirección aritmética, no la deseabilidad.** `↓ 4.3 %` en la tasa de
rebote va en `--danger` aunque bajar el rebote sea bueno (`guidelines/color.md` §8). Es predecible
y no obliga al usuario a recordar qué métricas son "buenas al bajar". El matiz se explica en el
texto de contexto y en el tooltip, nunca con el color.

### El gráfico de visitas

`line-chart.md`: línea `--accent` con área tenue (degradado del acento al 12 % → 0 %), y la serie
de comparación en **gris punteado**, que nunca compite por atención. Selector `Diario ▾` /
`Semanal ▾` / `Mensual ▾` en la cabecera de la tarjeta. Alto 280 (220 mínimo en móvil).

Cursor y tooltip: línea vertical `--border-strong` + tooltip `--surface` con hairline,
`--shadow-float`, fecha en `--fs-sm`/`--text-secondary` y los dos valores en `tabular-nums`.

### El donut de fuentes

`donut-chart.md`: dona a la izquierda, **leyenda a la derecha** con punto de color, nombre, valor
absoluto y porcentaje entre paréntesis. `Búsqueda orgánica` · `Directo` · `Redes sociales` ·
`Referencias` · `Otros`.

**La leyenda no es un adorno: es el gráfico.** La dona da la proporción de un vistazo; la leyenda
da el dato exacto y es lo que hace el componente legible sin color. Todo lo que cae bajo el 1 % se
agrupa en `Otros` (`--cat-8`); nunca se dibujan segmentos invisibles.

### Entradas más populares

`data-table.md` compacta, filas de 56px, 5 filas: `#` · `Título` (una línea, `ellipsis`) ·
`Vistas` (`tabular-nums`) · `Tiempo medio` · `SEO Score` (`score-ring` `sm`). Enlace
`Ver todas →` en `--accent` en la cabecera de la tarjeta.

### Dispositivos

`progress-bar.md` × 3: `monitor` Escritorio · `smartphone` Móvil · `tablet` Tablet.
Cada fila: icono 20 + nombre + valor `tabular-nums` + porcentaje, y barra índigo fina debajo
(alto 6, `--radius-pill`, pista `--surface-sunken`).

**No necesita librería de gráficos**: son dos `div` y un `width` en porcentaje.

━━━

## 2. Datos que muestra

**Ninguna de estas cifras tiene fuente hoy.** `posts.views` es un contador acumulado sin serie
temporal: no permite calcular ni deltas, ni el gráfico, ni fuentes, ni dispositivos.

Esta pantalla exige una fuente de eventos. Dos caminos, y hay que elegir uno antes de construir:

| | **A — eventos propios en Convex** | **B — proveedor externo** |
|---|---|---|
| Cómo | Tabla `pageViews` + agregados diarios en `analyticsDaily` | Plausible / Umami / similar, consultado desde el servidor |
| A favor | Dato propio, sin terceros, coherente con el resto del stack | Cero coste de mantenimiento, bots y sesiones ya resueltos |
| En contra | Hay que resolver bots, sesiones, unicidad y retención | Dependencia externa, y el dato no vive en Convex |
| Privacidad | Se controla entera | Depende del proveedor; elegir uno sin cookies |

Esquema mínimo para el camino A:

```ts
analyticsDaily: defineTable({
  tenantId: v.string(),
  date: v.string(),                // "2026-05-30"
  postDocId: v.optional(v.id("posts")),  // null = agregado del sitio
  views: v.number(),
  visitors: v.number(),
  avgSeconds: v.number(),
  bounces: v.number(),
  source: v.optional(v.string()),  // "organico" | "directo" | "social" | "referencia"
  device: v.optional(v.string()),  // "escritorio" | "movil" | "tablet"
}).index("by_tenant_and_date", ["tenantId", "date"])
```

Se consultan **agregados diarios**, nunca eventos crudos: una pantalla que suma un millón de filas
en cada carga no es una pantalla, es un incidente.

**Recharts no está en `package.json`.** Línea y dona lo exigen: `pnpm add recharts`
(`data-display/line-chart.md` §0). Las barras de dispositivos no lo usan.

━━━

## 3. Estados

### Carga

- Tabs, selector de rango, títulos de tarjeta, labels de métrica y **ejes del gráfico** se pintan
  de inmediato. Solo el dato lleva skeleton.
- Stat cards: cifra → barra 96×34, delta → barra 56×18, línea de contexto ya visible.
- Gráfico: ejes, rejilla y etiquetas dibujados en `--text-tertiary`; el área de la serie es un
  bloque skeleton **con el alto final exacto**. Layout shift cero.
- Donut: anillo completo en `--surface-sunken` + leyenda con cinco filas fantasma que conservan la
  altura real.
- Tabla: 5 filas de 56px.
- Dispositivos: **pistas grises al 0 % con los tres nombres visibles**, para que la forma del
  bloque no cambie al llegar el dato.
- **Cambio de rango**: los gráficos conservan su alto y bajan a `opacity: .6` mientras recargan.
  Nunca se vuelve al skeleton completo.

### Vacío

| Bloque | Presentación |
|---|---|
| Stat cards | `—` en `--text-tertiary` con tooltip `Sin datos en este rango`. **Nunca `0`** cuando lo que falta es el dato, y la fila de delta se **oculta entera** — nunca `0 %` |
| Gráfico | Ejes dibujados + `Sin datos en este rango` centrado + botón secundario `Ampliar rango` |
| Gráfico parcial | Línea **sólida** hasta donde hay datos y **punteada** donde faltan. Nunca se interpola inventando. Un solo punto: se dibuja el punto, no una línea |
| Donut | Anillo `--border-hairline` completo + `Sin tráfico registrado` |
| Populares | `feedback/empty-state.md` reducido: `chart-column` · `Sin visitas en este rango` · sin botón |
| Dispositivos | Pistas al 0 % con los tres nombres. La forma no cambia |
| **Blog nuevo** | Sobre las tres bandas, `feedback/alert.md` informativo: `Las analíticas empiezan a registrarse cuando publicas tu primera entrada.` + enlace `Nueva entrada` en `--accent`. Los bloques se pintan igual, en su estado vacío |

### Error

- **Cada bloque falla por su cuenta.** Una fuente caída no vacía la pantalla.
- Métrica caída: `—` con `triangle-alert` 16 en `--warn` junto al label y tooltip con el motivo.
  Las otras cuatro siguen con sus datos.
- Gráfico caído: dentro del área, conservando los ejes, `triangle-alert` en `--warn` ·
  `No pudimos cargar las visitas` · `Reintentar`.
- Datos previos sobreviven: banda `--warn-tint` con hairline sobre el bloque —
  `No pudimos actualizar los datos` + `Reintentar`.
- **Rango sin datos ≠ error.** Un rango vacío es un vacío, con su copy y su `Ampliar rango`. Pintar
  un error donde solo falta actividad enseña al usuario a desconfiar de la pantalla.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico: 5 métricas, dos bandas de `1fr 1fr`. |
| **1024–1279** | Métricas **5 → 3 + 2**. Las bandas se mantienen a dos columnas. Padding-x a `--sp-6`. |
| **768–1023** | Sidebar → drawer. Métricas en 2 columnas. **Cada banda pasa a una columna**: gráfico, luego donut, luego tabla, luego dispositivos. Tabs con scroll horizontal. |
| **<768** | Métricas en **carrusel horizontal con `scroll-snap`** (son 5 y apiladas empujarían todo lo demás fuera de pantalla). Gráficos con alto mínimo 220px: **es el único contenido del panel al que se le permite scroll horizontal propio**, con la leyenda apilada debajo. Donut sobre leyenda, en columna. La tabla de populares → tarjetas apiladas. Selector de rango a ancho completo bajo el `page-header`. |

━━━

## 5. Accesibilidad

- Todo gráfico lleva **una tabla equivalente accesible**: `<table>` visualmente oculta con los
  mismos datos, referenciada desde el gráfico con `aria-describedby`. Un gráfico sin alternativa
  textual es un dato que no existe para quien usa lector de pantalla.
- La leyenda del donut y los nombres de los dispositivos hacen que el color **nunca sea el único
  portador** de la información.
- Deltas: además de la flecha y el color, el texto lo dice
  (`aria-label="Aumento del 12,4 % respecto al periodo anterior"`).
- Números en `tabular-nums` en toda la pantalla, sin excepción.
- `prefers-reduced-motion`: la animación de entrada de la línea y del donut se anula; el gráfico
  aparece en su estado final.

━━━

## 6. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| No existe la ruta | `app/panel/analiticas/page.tsx` |
| `posts.views` acumulado | Serie diaria: `analyticsDaily` (camino A) o proveedor externo (camino B) |
| Sin librería de gráficos | `pnpm add recharts` |
| Sin selector de rango | `core/dropdown-menu.md` + `react-day-picker` (ya instalado), reflejado en la URL |
| Sin tabs | `navigation/tabs.md` con las 6 secciones |

━━━

## 7. Reglas duras

1. **Cero botones negros en esta pantalla.** No se crea nada: se lee. El selector de rango es
   secundario.
2. Índigo en la línea, el área y las barras de dispositivos: es el producto mostrando su lectura de
   los datos. Verde solo en deltas positivos y anillos de score.
3. La serie de comparación es **gris y punteada**. Nunca un segundo color saturado.
4. `—`, nunca `0`, cuando falta el dato. Delta ausente: se oculta la fila entera.
5. El color del delta sigue la dirección aritmética, no la deseabilidad.
6. Nunca se interpola un tramo sin datos: se pinta punteado.
7. Todo gráfico tiene su tabla accesible equivalente.
8. Rango vacío es vacío, no error.
