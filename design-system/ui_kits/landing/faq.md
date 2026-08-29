# Landing · FAQ — acordeón de preguntas frecuentes

> **Fuente:** la pantalla oficial no dibuja esta sección. Patrón derivado en
> `../../guidelines/landing.md` §5: *acordeón de filas separadas por hairline, pregunta `--fs-h3`,
> `chevron-down` que rota en `--dur-fast`*.
> **Estado en el código:** no existe.

━━━

## 1. Anatomía

Sección sobre `--surface`, hairline superior, padding vertical `--sp-16`.
Dos columnas **~34 / 66**, gap `--sp-12`, alineadas arriba — la misma proporción de la franja de
features, para que la página tenga dos ritmos y no doce.

```
┌────────────────────┬──────────────────────────────────────────────────┐
│ PREGUNTAS          │  ¿Necesito saber programar?                  ⌄  │
│                    │ ─────────────────────────────────────────────── │
│ Todo lo que        │  ¿Puedo usar mi propio dominio?              ⌄  │
│ suelen preguntar   │ ─────────────────────────────────────────────── │
│                    │  ¿Qué pasa con lo que ya escribí?            ⌃  │
│ ¿No está aquí?     │  Puedes importar…                               │
│ Escríbenos →       │ ─────────────────────────────────────────────── │
└────────────────────┴──────────────────────────────────────────────────┘
```

### Columna izquierda

Eyebrow `PREGUNTAS` (`--fs-label`/600/`+0.06em`/`--text-tertiary`) → `--sp-4` → `<h2>`
`Todo lo que suelen preguntar` (`--fs-h1`/600) → `--sp-5` → una línea de apoyo en
`--fs-body`/`--text-secondary` con el enlace `Escríbenos →` en `--accent`.

En `≥1280` esta columna es `position: sticky; top: calc(92px + var(--sp-8))` — acompaña al scroll
del acordeón, igual que el rail del panel acompaña al contenido.

### Columna derecha — el acordeón

Lista de filas separadas por hairline `--border-hairline` de ancho completo. Sin borde exterior,
sin radio, sin fondo: **el acordeón no es una tarjeta**, es una lista.

**Fila cerrada:**

| Propiedad | Valor |
|---|---|
| Alto mínimo | 64px (44 de zona táctil garantizada) |
| Padding | `--sp-5` vertical, 0 horizontal |
| Disparador | `<button>` a ancho completo, `display: flex; justify-content: space-between; align-items: center; gap: var(--sp-4)`, `text-align: left` |
| Pregunta | `--fs-h3`/600/`--text-primary` |
| Chevron | `chevron-down` 20 en `--text-tertiary`, `flex-shrink: 0` |
| Hover | Pregunta a `--text-primary`, chevron a `--text-secondary`. **Sin fondo de hover**: el hairline y el peso ya delimitan la fila |
| Foco | `--focus-ring` sobre el disparador completo |

**Fila abierta:**

- El chevron rota **180°** en `--dur-fast` con `--ease-out`. Se anula bajo `prefers-reduced-motion`
  (salta al estado final, sin transición).
- El panel de respuesta se despliega con transición de altura en `--dur-base`; texto en
  `--fs-body`/1.6/`--text-secondary`, `max-width: 68ch`, padding inferior `--sp-5`, sin padding
  superior (lo aporta el hueco bajo la pregunta).
- La pregunta abierta **no cambia de color ni de peso**. Nada de índigo aquí: no hay navegación
  ni IA en juego.

**Comportamiento:** varias filas pueden estar abiertas a la vez. No es un acordeón exclusivo —
cerrar la respuesta que el usuario acaba de leer para abrir otra es hostil.
La **primera fila arranca abierta**, para que la sección no se lea como una lista de botones.

━━━

## 2. Las preguntas canónicas

Ocho, en este orden. El orden es la decisión: primero se responde la objeción que frena la
conversión, luego lo operativo, luego lo contractual.

| # | Pregunta | Núcleo de la respuesta |
|---|---|---|
| 1 | ¿Necesito saber programar? | No. Se elige plantilla, se escribe y se publica. |
| 2 | ¿Puedo usar mi propio dominio? | Sí, en los planes de pago; SSL incluido y automático. |
| 3 | ¿Qué pasa con lo que ya escribí? | Importación desde los formatos habituales, y exportación en Markdown cuando quieras. |
| 4 | ¿Cómo funciona la IA? | Asiste al escribir y al optimizar; nunca publica sola y siempre la inicia el usuario. |
| 5 | ¿El contenido es mío? | Sí, íntegramente. Exportable en cualquier momento, sin permanencia. |
| 6 | ¿Qué incluye el SEO Analyzer? | Análisis por entrada, factores evaluados y siguiente paso recomendado. |
| 7 | ¿Puedo cambiar de plan? | En cualquier momento, en los dos sentidos, con prorrateo. |
| 8 | ¿Qué pasa si dejo de pagar? | El blog sigue en línea en el plan gratuito; no se borra nada. |

Respuestas de **dos a cuatro líneas**. Una respuesta que necesita seis líneas es una página de
documentación mal ubicada: se resume y se enlaza.

━━━

## 3. Jerarquía tipográfica

| Elemento | Token | Weight | Color |
|---|---|---|---|
| Eyebrow | `--fs-label` | 600 | `--text-tertiary` |
| Título de sección (`<h2>`) | `--fs-h1` | 600 | `--text-primary` |
| Línea de apoyo | `--fs-body` | 400 | `--text-secondary` |
| Enlace `Escríbenos →` | `--fs-body` | 500 | `--accent` |
| Pregunta (`<h3>` dentro del botón) | `--fs-h3` | 600 | `--text-primary` |
| Respuesta | `--fs-body` / 1.6 | 400 | `--text-secondary` |

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | 34/66, columna izquierda sticky. |
| **1024–1279** | 34/66, columna izquierda **deja de ser sticky**. |
| **768–1023** | Una columna: cabecera arriba a ancho completo, acordeón debajo. |
| **<768** | Una columna. Pregunta a `--fs-body`/600 (a `--fs-h3` en 375px el texto rompe en tres líneas y la fila crece demasiado). Alto mínimo de fila 56px, padding `--sp-4` vertical. Chevron a 20px con área táctil de 44px. Enlace `Escríbenos →` al final de la sección, no arriba. |

━━━

## 5. Accesibilidad

- Cada disparador es un `<button>` con `aria-expanded` y `aria-controls` apuntando al panel.
- El panel lleva `role="region"` y `aria-labelledby` apuntando al disparador.
- La pregunta es un `<h3>` **dentro** del `<button>`, no al revés: así conserva la jerarquía de
  encabezados del documento sin romper la semántica del control.
- Navegación con `Tab` entre disparadores; `Enter` y `Espacio` abren y cierran. No se capturan las
  flechas: es una lista de divulgaciones independientes, no un `tablist`.
- El contenido de las respuestas está **en el DOM siempre** (oculto con `hidden`), para que el
  buscador lo indexe y `Ctrl+F` lo encuentre.

━━━

## 6. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Icon** | `guidelines/iconografia.md` | `chevron-down` 20, con la rotación de 180° que el propio inventario autoriza |
| **Tipografía** | `guidelines/tipografia.md` | Escala completa |
| *Pendiente* | `core/accordion.md` | El acordeón — compartido con el rail del editor (pantalla 04) |

El acordeón del rail del editor y el de la FAQ **son el mismo componente** con distinta piel: filas
con hairline aquí, bloques con título de sección allá. Escribir dos acordeones es el error que este
sistema existe para evitar.

━━━

## 7. SEO de la sección

La página que vende SEO responde preguntas en HTML indexable, no en JavaScript.

- Marcado `FAQPage` de schema.org en **JSON-LD**, generado desde la misma fuente de datos que
  pinta las filas — nunca duplicado a mano, o divergen.
- Preguntas y respuestas renderizadas en el servidor. El acordeón solo controla la visibilidad.
- Una pregunta por `<h3>`, sin saltos de jerarquía (`h1` → `h2` → `h3`).

━━━

## 8. Reglas duras

1. **Cero botón negro en la sección.** El único enlace de acción es `Escríbenos →`, en índigo.
2. La pregunta abierta no cambia de color ni de peso.
3. Varias filas abiertas a la vez. No es un acordeón exclusivo.
4. Las respuestas viven en el DOM aunque estén cerradas.
5. Sin iconos por pregunta, sin numeración visible, sin fondo alternado por fila.
6. Ocho preguntas. Si hacen falta quince, la novena en adelante va a `/ayuda`.
