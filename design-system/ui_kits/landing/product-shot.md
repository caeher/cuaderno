# Landing · Product shot — la captura del producto en tarjeta elevada

> **Fuente:** `../../ui-ux-panels/01-landing-home.png`, columna derecha del hero.
> **Estado en el código:** no existe.
> **Las pantallas mandan.** Reglas de la sección en `../../guidelines/landing.md` §2.

━━━

## 1. Qué es

**El héroe visual de la landing es el producto real, no una ilustración.** La captura de la pantalla
`02-panel-resumen` — con su sidebar, sus stat cards, la tabla de entradas recientes y el rail de
SEO Analyzer y Sugerencia de IA — es el argumento de venta. Todo lo que la landing promete se ve ahí.

Es también **un artefacto vivo**: cuando el panel cambie de aspecto, esta imagen se regenera. Una
captura desactualizada es una promesa falsa.

━━━

## 2. Anatomía

```
                 ┌───────────────────────────────────────────────  →  sangra al viewport
                 │ ▓▓▓▓ sidebar │  topbar                        │
                 │              │  ┌────┐┌────┐┌────┐┌────┐      │
                 │              │  └────┘└────┘└────┘└────┘      │
                 │              │  ┌──────────────┐ ┌─────────┐  │
                 │              │  │ tabla        │ │ rail    │  │
                 └───────────────────────────────────────────────
```

| Propiedad | Valor |
|---|---|
| Contenedor | `--surface`, `--radius-card`, borde 1px `--border-hairline` |
| Sombra | `--shadow-float` — junto a los dropdowns de la nav, **la única sombra de la página** |
| Padding interno | **0.** La captura llega al borde interior del radio; el borde de la tarjeta es el marco |
| Recorte | `overflow: hidden` en la tarjeta, para que el radio recorte la imagen |
| Elevación óptica | La tarjeta arranca ~`--sp-6` **por encima** de la línea base del titular |
| Sangría | La columna se extiende más allá de `--content-max` hasta el borde del viewport; la sección la contiene con `overflow-x: clip` |
| Relación de aspecto | 16:10 con `aspect-ratio`, para reservar el alto antes de que la imagen cargue |

**Sin marco de navegador.** No se dibuja la barra de un browser con los tres círculos ni una barra
de URL falsa: el sistema se sostiene con borde y aire, y un chrome de macOS pintado es decoración
que envejece.

━━━

## 3. Contenido obligatorio de la captura

La imagen debe mostrar, todos a la vez y legibles:

1. El **sidebar** con el item `Resumen` activo en `--accent-tint` — enseña la navegación.
2. La fila de **4 stat cards** con sus cuadros tintados y sus deltas.
3. La **tabla de entradas recientes** con badges `Publicado` / `Borrador` y anillos de SEO Score.
4. El **rail derecho** con las tarjetas `SEO Analyzer` y `Sugerencia de IA` — enseña el índigo del
   producto pensando y el verde del rendimiento en el mismo golpe de vista.

Los tres colores del sistema aparecen en la captura, cada uno haciendo su trabajo. Ese es el motivo
por el que la captura vale más que cualquier ilustración.

**Datos de la captura:** contenido plausible de un blog real, en español, sin `lorem ipsum`, sin
nombres de personas reales y sin datos de un tenant de producción. Se genera desde una cuenta de
demostración con contenido preparado.

━━━

## 4. Jerarquía tipográfica

La captura **no aporta tipografía propia a la página**: es una imagen. La tipografía que se ve
dentro es la del panel (`--fs-h1` en las cifras, `--fs-body` en la tabla), y debe leerse a la
escala de la landing.

**Regla de legibilidad:** el texto más pequeño de la captura (`--fs-label`, 12px en el panel real)
debe quedar por encima de **9px efectivos** en el render de escritorio. Si no se llega, se recorta
más la captura en lugar de reducirla: mejor mostrar menos producto que mostrarlo ilegible.

━━━

## 5. Entrega y rendimiento

Es el **LCP de la página**. Nada debe adelantarla.

- Formatos: **AVIF + WebP**, con PNG de respaldo. `<picture>` con `type` por fuente.
- `width` y `height` explícitos → CLS cero.
- `priority` (Next.js `Image`) y `sizes` correcto por breakpoint.
- Render a **2×** para pantallas de densidad alta; se sirve el 1× por `srcset`.
- `alt` descriptivo, no decorativo:
  `alt="Panel de Cuaderno mostrando el resumen de rendimiento de un blog"`
- `loading="eager"`. Ninguna imagen bajo el pliegue compite con ella (todas van `lazy`).
- **Nunca** un `<iframe>` con el producto real, **nunca** un vídeo en autoplay, **nunca** un GIF.

**Modo oscuro.** Se entregan dos capturas — una del panel en claro y otra en oscuro — y se
seleccionan con `<source media="(prefers-color-scheme: dark)">` más un override por
`:root[data-theme="dark"]`. Una captura clara sobre un fondo oscuro delata que el modo oscuro es
un añadido; el sistema nace con los dos temas.

━━━

## 6. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Sangría completa al viewport, `--shadow-float`, elevada respecto al titular. |
| **1024–1279** | Sigue sangrando, se recorta más por la derecha y **baja a `--shadow-rest`**. |
| **768–1023** | Pasa **debajo** del bloque de texto, centrada, a ancho completo del contenedor, sin sangría y sin elevación. Se usa un recorte más cerrado (sidebar + métricas + inicio de la tabla). |
| **<768** | Recorte vertical: solo sidebar colapsado + métricas + dos filas de tabla. Radio a `--radius-card`, hairline, sin sombra. Alto máximo 320px para no empujar el CTA fuera del primer pliegue. |

Los recortes son **archivos distintos**, no un `object-position` sobre la misma imagen: servir una
imagen de escritorio a un móvil desperdicia el LCP.

━━━

## 7. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Card** | `core/card.md` | Tarjeta contenedora con radio, hairline y `overflow: hidden` |
| **Efectos** | `tokens/effects.css` | `--shadow-float`, `--shadow-rest` |
| **Espacio** | `tokens/spacing.css` | `--radius-card`, `--sp-6` |

No consume ningún componente de datos: **es una imagen, no un panel embebido**. Renderizar el panel
real dentro de la landing duplicaría el bundle, arrastraría Convex y Clerk al camino crítico y
haría imposible garantizar el LCP.

━━━

## 8. Reglas duras

1. La captura se regenera **en el mismo PR** que cambia el aspecto del panel Resumen. Es checklist
   de release, no tarea de mantenimiento.
2. Nunca se retoca la captura para que se vea "mejor" de lo que es el producto.
3. Sin marco de navegador, sin perspectiva 3D, sin reflejo, sin degradado detrás.
4. Sin `<iframe>`, sin vídeo, sin GIF, sin animación.
5. Dos versiones — claro y oscuro — o el modo oscuro de la landing queda delatado.
6. `alt` descriptivo obligatorio: es contenido, no decoración.
