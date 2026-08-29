# Color

> Fuente: las 9 pantallas de `../ui-ux-panels/`. Donde el código y una pantalla no coincidan, gana la pantalla.
> Estos nombres de token son el contrato completo. **No se inventan nombres nuevos.** Si un color que ves en una pantalla no tiene token, no crees uno: usa el token semántico más cercano y levanta la discrepancia.

━━━

## 1. La regla de los tres colores

Cuaderno tiene tres colores con carga de significado y ninguno más. No son "primario, secundario, terciario": son **tres idiomas distintos** que nunca se traducen entre sí.

| Color | Token | Significa | El usuario aprende |
|---|---|---|---|
| Negro `#111111` | `--action` | **Acción del usuario.** Lo que yo ejecuto. | "Si es negro, lo hago yo y pasa algo." |
| Índigo `#6366F1` | `--accent` | **El producto pensando y la navegación.** Dónde estoy, adónde voy, qué sugiere la IA. | "Si es índigo, es el sistema hablándome o llevándome." |
| Verde `#10B981` | `--perf` | **Rendimiento y éxito.** Lo que se mide y salió bien. | "Si es verde, es un resultado." |

**El test, en este orden:**

1. ¿El usuario va a **ejecutar** algo con esto? → **negro**.
2. ¿Es **navegación** (dónde estoy / adónde voy) o **el producto pensando** (IA, sugerencia, análisis)? → **índigo**.
3. ¿Es un **número o estado de rendimiento** (score, delta, "salió bien")? → **verde**.
4. ¿Ninguna de las tres? → **no lleva color**. Va en `--text-primary`, `--text-secondary` o `--border-hairline`.

El paso 4 es el que más se incumple. La mayoría de la UI de Cuaderno es negro sobre papel con hairlines: el color es la excepción, no el fondo.

**Si el índigo aparece donde no hay navegación ni IA, o el verde donde no se mide rendimiento, está mal puesto.**

━━━

## 2. Negro `--action` — la acción del usuario

**Sí, exactamente aquí.** Un solo botón negro por pantalla: el CTA primario del header de página.

| Pantalla | Botón negro |
|---|---|
| 01 Landing | `Comenzar gratis` (nav y hero) |
| 02 Resumen | `+ Nueva entrada` (split button con chevron) |
| 03 Entradas | `+ Nueva entrada` |
| 04 Editor | `Publicar` (split button) |
| 05 Páginas | `+ Nueva página` |
| 06 Categorías | `+ Nueva categoría` |
| 07 SEO Analyzer | `Analizar` |
| 08 Analíticas | *(ninguno — es una pantalla de lectura)* |
| 09 Ajustes | `Guardar cambios` |

Estados: reposo `--action`, hover `--action-hover`, presionado `--action-pressed`, texto siempre `--text-on-dark`. Deshabilitado: `--action` al 40% de opacidad, cursor `not-allowed`, sin cambiar de color.

**No, aquí no.**
- No hay dos botones negros compitiendo en la misma pantalla. El segundo baja a **secundario**: fondo `--surface`, borde 1px `--border-hairline`, texto `--text-primary`. Así son `Ver demo`, `Vista previa`, `Filtros`, `Aplicar sugerencia`, `Exportar contenido`, `Importar contenido`, `Cambiar imagen`, `Cambiar contraseña`, `Ver todas las entradas`, `Ver entradas afectadas`.
- No hay botón negro dentro de una tarjeta lateral. El rail derecho no ejecuta la acción primaria de la pantalla.
- La acción destructiva no es negra: es roja (§5).
- Un enlace de texto nunca es negro-como-botón. Es `--text-primary` con subrayado en hover, o índigo si navega (§3).

**Caso límite resuelto — `Aplicar sugerencia` (02).** Es una acción del usuario, pero vive dentro de una tarjeta de IA en el rail. Va **secundaria** (blanco + hairline), no negra. La jerarquía de posición manda sobre la de tipo: fuera del header de página, ninguna acción es primaria.

━━━

## 3. Índigo `--accent` — el producto pensando y la navegación

Dos familias de uso, una sola justificación: **el índigo nunca es del usuario, siempre es del sistema.**

**Navegación — "dónde estoy / adónde voy":**
- Item activo del sidebar: fondo `--accent-tint`, icono y texto `--accent`, weight 600. El inactivo es `--text-secondary` sin fondo.
- Subrayado de tab activo (2px `--accent`) y su etiqueta en `--accent`: tabs de Entradas, de SEO Analyzer, de Analíticas, del rail del editor (`Entrada` / `Bloque`).
- Item activo de la nav secundaria de Ajustes: fondo `--accent-tint`, texto e icono `--accent`.
- Enlaces de salto: `Ver todas`, `Ver todas las entradas`, `Ver análisis completo →`, `Ver planes →`, `Ver blog →`, `Añadir nueva categoría`, `Añadir etiqueta`, `Editar` (del enlace permanente), `Gestionar plan`.
- Página activa de la paginación: fondo `--accent-tint`, texto `--accent`. Las demás, `--text-secondary` sobre transparente.
- Toggle lista/grilla en su estado seleccionado: fondo `--accent-tint`, icono `--accent`.
- Punto de notificación sin leer sobre la campana: círculo 6px `--accent`.
- Línea y área del gráfico de líneas (08, 02): trazo `--accent`, área con `--accent` al 8%. La serie de comparación va punteada en `--text-tertiary`.

**IA — "el producto pensando":**
- El destello ✦ (icono `sparkles`) siempre en `--accent`. Es la firma visual de la IA y no aparece nunca sin ella.
- Grupo de IA del sidebar (IA Writer, SEO Analyzer, Analíticas) — mismo tratamiento que el resto de la nav; el índigo aquí es navegación, no IA.
- Tarjeta `Sugerencia de IA` y `Siguiente paso recomendado`: título con ✦ índigo. El cuerpo sigue en `--text-secondary`.
- Tarjeta `Cuaderno Pro`: fondo `--accent-tint`, borde `--accent-border`, ✦ y `Ver planes →` en `--accent`. Es la superficie más índigo del sistema porque Pro **es** el acceso a la IA.
- `Escribir con IA` en la toolbar del editor: botón secundario con icono ✦ índigo y texto `--text-primary`. El botón no se pinta índigo entero: el destello basta.
- Texto recién generado por IA en el documento: resalte `--accent-tint` que se desvanece en 600ms.
- Línea de ejemplo bajo el input del SEO Analyzer (`✦ Ejemplo: https://…`): ✦ índigo, texto `--text-tertiary`.
- Ítems de "problemas detectados" que son **sugerencias del producto** (p. ej. `Enlaces internos sugeridos`): icono `--accent`.

**No, aquí no.**
- Índigo en un CTA primario. `Publicar` no es índigo, es negro. Esta es la regla que más fácil se rompe al portar componentes de shadcn, cuyo `primary` por defecto hay que reasignar a `--action`.
- Índigo en un dato de rendimiento. El SEO Score no es índigo.
- Índigo como color de "seleccionado" en filas de tabla o checkboxes de contenido. El checkbox marcado usa `--action` (así lo muestra la pantalla 04: el check de `Inteligencia Artificial` es oscuro/índigo saturado — se resuelve en `--action`; el check es una decisión del usuario, no navegación).
- Índigo como decoración de fondo, degradado o glow.

━━━

## 4. Verde `--perf` — rendimiento y éxito

- **Anillo de SEO Score** (02, 03, 07): trazo `--perf`, pista `--border-hairline`, la cifra en `--text-primary` con `tabular-nums`.
- **Badge `Publicado`**: texto `--perf-strong` sobre `--perf-tint`.
- **Deltas positivos**: `↑ 18%` en `--perf-strong`.
- **Checks de factores evaluados** (`Palabra clave · Bien`, `Legibilidad · Bien`): icono check y veredicto `Bien` / `Excelente` en `--perf-strong`.
- **Checks de beneficios del plan** (09 › Tu plan): `--perf`.
- **Punto de estado verde** junto a `SEO 95` en tablas compactas.

**No, aquí no.**
- Verde en el botón de guardar. `Guardar cambios` es negro. Guardar es una acción, no un resultado.
- Verde en el indicador de autoguardado del editor. La pantalla 04 pinta `✓ Guardado` en gris (`--text-secondary`, check en `--text-tertiary`) y esa decisión es correcta: es un estado inerte del sistema, no un logro del usuario. **No lo pases a verde.**
- Verde en toasts de confirmación genéricos. El toast `Cambios guardados` es neutro: `--surface`, hairline, texto `--text-primary`.
- Verde como color de marca o de superficie amplia.

━━━

## 5. Rojo, ámbar y neutro — los que no son marca

**Rojo `--danger` — destructivo e irreversible.** `Mover a la papelera`, `Eliminar` (imagen destacada, categoría), `Eliminar mi sitio`, `Cerrar sesión`, error de validación, delta negativo. Los botones destructivos son **texto rojo con borde `--danger`** sobre `--surface` (así los muestran 04 y 09), no bloques rojos rellenos. El rojo relleno se reserva al botón de confirmación final dentro del diálogo de borrado.

**Ámbar `--warn` — atención sin peligro.** Badge `Borrador`, veredicto `Mejorable`, severidad media en la lista de problemas del SEO Analyzer, aviso de guardado fallido, "sin conexión".

**Neutro `--neutral` — ausencia de estado.** Badge `Privada`, `No detectado`, valor sin dato (`—`), fila deshabilitada.

**Discrepancia conocida.** La pantalla 07 pinta el ítem informativo (`Imágenes sin texto alternativo`) con un icono azul que **no tiene token en el contrato**. Resolución: los ítems informativos usan `--neutral`; los que son sugerencia del producto usan `--accent`. No se crea un token `--info`.

━━━

## 6. Estados del contenido — el color semántico del ciclo editorial

Estos badges son un componente único (`<EstadoBadge estado="publicado" />`) y no se reimplementan por pantalla. Píldora `--radius-pill`, alto 24px, padding-x `--sp-2`, `--fs-sm` weight 500.

| Estado | Fondo | Texto | Icono | Dónde |
|---|---|---|---|---|
| `Publicado` | `--perf-tint` | `--perf-strong` | punto o ninguno | 02, 03, 05 |
| `Borrador` | `--warn-tint` | `#B45309` (ámbar oscurecido para contraste) | ninguno | 03, 05 |
| `Programado` / `Programada` | `--accent-tint` | `--accent-pressed` | `calendar` 14px | 02, 03 |
| `Privada` | `--neutral-tint` | `--neutral` | `lock` 14px | 05 |
| `Papelera` | `--danger-tint` | `--danger` | ninguno | 03 (tab) |

Nota sobre `Programado`: es la única vez que el índigo etiqueta contenido y no navegación. Se sostiene porque **es el sistema quien va a actuar**, no el usuario — el índigo sigue significando "el producto haciendo algo".

`Borrador` sobre `--warn-tint` con `--warn` puro no alcanza 4.5:1. Usa el ámbar oscurecido: `color-mix(in oklch, var(--warn) 70%, black)`.

**Nunca el color solo.** El badge siempre lleva su palabra. Un punto de color sin texto solo es admisible en las stat cards de la pantalla 05, donde el label (`Publicadas`, `Borradores`, `Privadas`) está escrito al lado.

━━━

## 7. Bandas del SEO Score

Una sola escala, usada por el anillo, el punto de la tabla y el veredicto de texto.

| Rango | Veredicto | Color del anillo y del texto |
|---|---|---|
| 90–100 | `Excelente` | `--perf` |
| 75–89 | `Bueno` | `--perf` |
| 50–74 | `Mejorable` | `--warn` |
| 1–49 | `Bajo` | `--danger` |
| sin analizar | `—` | `--border-hairline` (anillo vacío), texto `--text-tertiary` |

Las pantallas muestran `92 · Excelente` y `78 · Bueno`, ambos en verde: el verde cubre de 75 hacia arriba. Nunca pintes un score sin veredicto escrito.

Veredictos por factor: `Excelente` y `Bien` → `--perf-strong`; `Mejorable` → `--warn`; `No detectado` → `--neutral`.

━━━

## 8. Deltas

`↑` en `--perf-strong`, `↓` en `--danger`, ambos con `tabular-nums` y `--fs-sm` weight 500.

**El color sigue la dirección aritmética, no la deseabilidad.** La pantalla 08 pinta `↓ 4.3%` de la tasa de rebote en rojo aunque bajar el rebote sea bueno. Se mantiene: es predecible y no obliga al usuario a recordar qué métricas son "buenas al bajar". El matiz se explica en el texto de contexto (`vs. 1 Abr - 30 Abr 2024`) y en el tooltip, no en el color.

Delta cero o ausente: se oculta la fila entera. Nunca `0%` en gris, nunca `—%`.

━━━

## 9. Puntos de categoría

`--cat-1` … `--cat-8` son **color de contenido, no de marca**. Identifican categorías creadas por el usuario y no cargan significado semántico.

- **Asignación estable**: se fija al crear la categoría y se persiste en el registro. Nunca se recalcula por índice de render — la categoría "SEO" es azul en todas las pantallas y en todas las sesiones.
- Ciclo de asignación por defecto: `--cat-1` → `--cat-8` → vuelve a empezar. El usuario puede reasignar entre los ocho; no puede introducir un color libre.
- **Punto**: círculo relleno 8px (pantalla 06).
- **Chip en tabla** (pantalla 03): fondo `color-mix(in oklch, var(--cat-N) 12%, var(--surface))`, texto `color-mix(in oklch, var(--cat-N) 75%, black)`, `--radius-pill`, `--fs-sm`.
- Coincidencias con la paleta semántica (`--cat-1` = índigo, `--cat-3` = verde) son deliberadas y no crean significado: un chip verde de categoría no habla de rendimiento.
- Estas ocho pinturas **también** visten los cuadros de icono de las stat cards (02, 06, 08: índigo, verde, naranja, ámbar). Ahí son variación decorativa; el significado lo carga la cifra y su delta, nunca el cuadrito.

━━━

## 10. Superficies, bordes y sombras

```
--bg-page       #FAFAF9   fondo del área de contenido
--bg-sidebar    #FFFFFF   sidebar
--surface       #FFFFFF   tarjetas, topbar, inputs, tablas
--surface-sunken #F5F5F4  hover de fila, cuadros de icono, chips ⌘K, skeletons
--border-hairline #EAEAE8 1px, SIEMPRE visible: separa tarjetas, filas y regiones
--border-strong  #D6D6D3  borde de input en foco-menos-accent, divisores de énfasis
```

El sistema se sostiene con **borde y aire**, no con profundidad. `--shadow-rest` es casi imperceptible y es opcional en tarjetas estáticas; `--shadow-float` se reserva a lo que flota de verdad: dropdowns, popovers, toasts, diálogos y la captura del producto en el hero de la landing. Una tarjeta del panel con `--shadow-float` está mal.

Foco: `--focus-ring` (`0 0 0 3px rgba(99,102,241,.25)`) en **todo** lo enfocable, sin excepción y sin `outline: none` huérfano. El anillo de foco es índigo aunque el elemento sea negro o rojo: el foco es navegación.

━━━

## 11. Texto

| Token | Uso |
|---|---|
| `--text-primary` | Títulos, cifras, contenido, celdas principales de tabla |
| `--text-secondary` | Subtítulos de página, descripciones, labels de formulario, nav inactiva, cabeceras de tabla |
| `--text-tertiary` | Placeholders, metadatos (`vs. últimos 30 días`), ejes del gráfico, valores vacíos `—`, la palabra atenuada del titular del hero |
| `--text-on-dark` | Sobre `--action` y sobre superficies oscuras |

Mínimos: 4.5:1 para texto normal, 3:1 para texto ≥18px o ≥14px bold, 3:1 para bordes de control y para el trazo del anillo de score. `--text-tertiary` sobre `--bg-page` no llega a 4.5:1 — solo para texto no esencial, nunca para el único portador de una instrucción.

━━━

## 12. Modo oscuro

Las pantallas muestran el toggle en sidebar y topbar: **el sistema nace con los dos temas.** Regla estructural: cada token se define completo en `:root`; el bloque oscuro solo **redefine**. Ningún color existe únicamente dentro del bloque oscuro.

```css
:root { /* paleta clara completa — la fuente de verdad */ }

:root[data-theme="dark"],
:root:not([data-theme="light"]) { /* dentro de @media (prefers-color-scheme: dark) */
  --bg-page: #0C0C0D;  --bg-sidebar: #151517;  --surface: #151517;
  --surface-sunken: #1D1D20;
  --border-hairline: #26262A;  --border-strong: #35353B;
  --text-primary: #F5F5F4;  --text-secondary: #A1A1A6;  --text-tertiary: #6E6E76;
  --accent: #818CF8;  --accent-hover: #A5B4FC;  --accent-tint: #1E1E3A;  --accent-border: #33336B;
  --perf: #34D399;  --perf-strong: #6EE7B7;  --perf-tint: #113026;
  --warn: #FBBF24;  --warn-tint: #3A2C0C;
  --danger: #F87171; --danger-tint: #3A1A1A;
  --neutral: #9CA3AF; --neutral-tint: #26262A;
}
```

Reglas que cambian en oscuro:

1. **El negro deja de ser negro.** `--action` sobre `#0C0C0D` desaparece. En oscuro el CTA primario invierte: fondo `--text-primary` (#F5F5F4), texto `--bg-page`. Sigue siendo "el color más contrastado disponible" — que es lo que el negro significaba en claro.
2. **Índigo y verde suben luminosidad** (`#818CF8`, `#34D399`) para conservar el contraste; los tints bajan a versiones profundas y desaturadas, nunca son el mismo color con opacidad.
3. **El hairline sigue siendo visible.** `#26262A` sobre `#151517` es sutil pero perceptible: si desaparece, el sistema se derrumba, porque no hay sombras que lo sustituyan.
4. **Los `--cat-N` no cambian de matiz**, solo se aclaran ~10% de luminosidad para no vibrar sobre el fondo profundo.
5. `--focus-ring` conserva el índigo, subiendo la opacidad a `.35`.
6. Las imágenes y thumbnails no se atenúan ni se filtran: el contenido del usuario se ve tal cual.

Implementación: `next-themes` con `attribute="data-theme"` y `defaultTheme="system"`. El toggle del sidebar es de **tres estados** (claro / oscuro / sistema); el de la topbar alterna claro↔oscuro directo. El tema se aplica antes del primer paint para evitar el destello.

━━━

## 13. Checklist de revisión de color

1. ¿Hay exactamente **un** botón negro en la pantalla, y está en el header de página?
2. ¿Cada índigo señala navegación o IA? ¿Cada verde señala un resultado medido?
3. ¿Algún elemento comunica solo por color, sin texto ni icono?
4. ¿Todo lo enfocable muestra `--focus-ring`?
5. ¿Todos los hairlines siguen visibles en oscuro?
6. ¿Se usó algún hex literal en lugar de un token? (Ninguno debe existir fuera de la definición de `:root`.)
7. ¿Se inventó un token? (No.)
