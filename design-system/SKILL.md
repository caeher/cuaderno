---
name: cuaderno-design-system
description: >-
  Sistema de diseño de Cuaderno. Úsalo SIEMPRE que vayas a escribir, modificar o revisar
  cualquier interfaz del producto — landing, panel, editor, blog público, correos. Define la
  regla de tres colores, el contrato de tokens, los componentes, los estados obligatorios y la
  regla de que las pantallas mandan. Actívalo ante cualquier tarea que toque UI, CSS, Tailwind,
  shadcn, componentes de React o copy de producto.
---

# Cómo escribir código con el Design System de Cuaderno

> Instrucciones para un agente. Léelas enteras **antes** de tocar un archivo de UI.
> Todo el producto y toda la documentación están en **español**.

━━━

## 0. Antes de escribir una sola línea

En este orden, sin saltarte pasos:

1. **Mira la pantalla.** `design-system/ui-ux-panels/` — 9 PNG con su `README.md`. Si la tarea toca
   una pantalla que existe ahí, ábrela.
2. **Lee su UI kit.** `design-system/ui_kits/panel/<pantalla>.md` o
   `design-system/ui_kits/landing/<seccion>.md`. Te dice qué componentes la componen, qué datos
   muestra y sus estados de carga, vacío y error.
3. **Lee la spec de cada componente** que el kit nombre: `design-system/components/<grupo>/<x>.md`.
4. **Comprueba las guidelines** que apliquen: `design-system/guidelines/`.
5. Ahora sí, escribe.

**No re-derives el lenguaje visual de las imágenes.** Ya está destilado en
`ui-ux-panels/README.md` y en las guidelines. Abre el PNG solo si necesitas un detalle que ningún
documento resuelve.

━━━

## 1. LAS PANTALLAS MANDAN

Es la regla que arbitra todas las demás.

> **Donde el código actual y una pantalla no coincidan, gana la pantalla y el código se adapta.**

- Si `admin-topbar.tsx` pinta un título y la pantalla 02 pinta buscador ⌘K, toggle de tema,
  notificaciones y menú de usuario → **se construye el topbar entero**, no se conserva el actual.
- Si el sidebar usa `OrganizationSwitcher` de Clerk y la pantalla muestra un selector de blog
  propio → **se construye el selector**.
- Si una decisión visual no se puede rastrear a una de las 9 imágenes, a un token o a una regla
  escrita en `guidelines/` → **no es una decisión, es una invención**. No la implementes.

Cuando la pantalla no cubre algo (secciones bajo el pliegue de la landing, pantallas derivadas como
Etiquetas o Comentarios), **deriva del sistema, no inventes**: reutiliza los componentes y los
patrones que ya existen. Los UI kits ya hacen esa derivación y la dejan documentada.

━━━

## 2. Tokens por nombre. Cero hexadecimales.

**Ningún valor de color, espacio, radio, sombra, duración o tamaño de letra se escribe a mano.**
Los tokens viven en `design-system/tokens/` y entran por `design-system/styles.css`.

```css
/* ✅ correcto */
.tarjeta {
  background: var(--surface);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-card);
  padding: var(--sp-5);
  box-shadow: var(--shadow-rest);
}

/* ❌ prohibido */
.tarjeta { background: #FFFFFF; border: 1px solid #EAEAE8; border-radius: 14px; padding: 20px; }
```

**Cero hexadecimales fuera de `design-system/tokens/`.** Ni en CSS, ni en clases arbitrarias de
Tailwind (`bg-[#FAFAF9]`), ni en props de estilo en línea, ni en configuraciones de librerías de
gráficos: ahí se pasa `var(--accent)` o se lee el token computado.

### Los nombres exactos

```
--bg-page --bg-sidebar --surface --surface-sunken
--border-hairline --border-strong
--text-primary --text-secondary --text-tertiary --text-on-dark
--action --action-hover --action-pressed
--accent --accent-hover --accent-pressed --accent-tint --accent-border
--perf --perf-strong --perf-tint
--warn --warn-tint --danger --danger-tint --neutral --neutral-tint
--cat-1 … --cat-8
--focus-ring
--radius-card --radius-control --radius-input --radius-thumb --radius-pill
--shadow-rest --shadow-float
--sp-1 --sp-2 --sp-3 --sp-4 --sp-5 --sp-6 --sp-8 --sp-10 --sp-12 --sp-16
--sidebar-w --topbar-h --content-max --touch-target
--font-sans
--fs-display --fs-h1 --fs-h2 --fs-h3 --fs-body --fs-sm --fs-label
--dur-fast --dur-base --ease-out
```

**Si necesitas un valor que no está en la lista, el valor está mal.** No añadas un token para
resolver un caso; usa el escalón más cercano. `18px` no existe: es `--sp-4` (16) o `--sp-5` (20).

━━━

## 3. La regla de color — tres colores, tres significados

| Color | Token | Significa |
|---|---|---|
| Negro `#111111` | `--action` | **La acción del usuario.** Todo CTA primario |
| Índigo `#6366F1` | `--accent` | **El producto pensando, y la navegación** |
| Verde `#10B981` | `--perf` | **Rendimiento y éxito** |

**La prueba de que está mal puesto:** índigo donde no hay navegación ni IA, o verde donde no se mide
rendimiento.

Chequeos que debes hacer en cada pantalla que escribas:

- [ ] **¿Hay más de un botón negro?** Si sí, uno de los dos no era primario.
- [ ] ¿El índigo está en: sidebar activo, `Ver todas →`, badge `Programado`, tab activo, IA,
      línea del gráfico, paginación activa? Si está en otro sitio, quítalo.
- [ ] ¿El verde está en: anillo de score, badge `Publicado`, delta positivo, check de factor?
      Si está en otro sitio, quítalo.
- [ ] ¿`Guardado` está en verde? **Está mal**: va en `--text-secondary`.
- [ ] ¿El anillo de un análisis en curso está en verde? **Está mal**: en curso es índigo.
- [ ] ¿Algún color es el único portador de un significado? Añade la palabra.

━━━

## 4. Adopta shadcn y restílalo. No lo reescribas.

`components/ui/` ya tiene ~35 componentes sobre **Base UI** (`@base-ui/react`). La instrucción es:

1. **Conserva la API pública** de cada componente. No renombres props ni exports.
2. **Cambia solo la piel**: sustituye los valores por tokens del sistema.
3. **Elimina lo que el sistema no tiene**: variantes de color inventadas, sombras de más, radios
   fuera de escala.
4. **Añade lo que falta** según la spec del componente (`size`, `tone`, `density`, estados).

Cada spec de `components/` abre con una sección **«0. Adopción (no reescribir)»** que dice
exactamente qué se conserva y qué cambia. Léela antes de tocar el archivo.

**Un componente, un archivo, un uso.** Si dos pantallas pintan una tabla parecida, es la **misma**
`data-table` con distinta configuración, no dos tablas. Hoy hay deuda real de este tipo en el repo:
dos `post-editor.tsx` y dos `settings-form.tsx`. No la aumentes.

━━━

## 5. Los cuatro estados son parte del componente

**Un componente que no define sus cuatro estados no está terminado y no entra a `main`.**

1. **Carga** — cómo se ve mientras llega el dato.
2. **Vacío** — distinguiendo *nunca hubo* de *el filtro no encontró nada*.
3. **Error** — qué falló y qué puede hacer el usuario.
4. **Con dato** — el que muestran las pantallas.
5. **En curso (solo IA)** — cancelable, con señal de vida a los 5 s.

Reglas que se te van a olvidar y no debes olvidar:

- **Lo estático se pinta de inmediato.** Labels, iconos, cabeceras de tabla, ejes del gráfico y
  títulos de tarjeta no dependen del servidor: aparecen ya. Solo el dato lleva skeleton.
- **Cero cambio de alto.** El skeleton ocupa exactamente el espacio del contenido final.
- **Retardo de 150 ms** antes de pintar un skeleton; una vez pintado, mínimo 300 ms.
- **Nunca un spinner a pantalla completa** en la carga inicial.
- **Al paginar o filtrar no se vuelve al skeleton**: la tabla baja a `opacity: .6` conservando su
  altura.
- **`—`, nunca `0`,** cuando lo que falta es el dato. Nunca `NaN`, `null` ni `undefined` en pantalla.
- **Si ya había datos, un error no los borra**: banda `--warn-tint` sobre el contenido antiguo.
- **Toda acción reversible** (mover a la papelera, moderar) va con toast + `Deshacer`, **sin
  diálogo**. El diálogo se reserva a lo irreversible.
- **Ninguna llamada de IA se dispara al montar una pantalla.** Siempre la inicia el usuario, siempre
  es cancelable, siempre da señal de vida a los 5 s, siempre tiene timeout a 30 s.
- **Nunca se muestran tokens, modelos ni coste al usuario.** Eso es telemetría interna.

Detalle completo en `guidelines/estados.md`.

━━━

## 6. Mobile-first, siempre

Escribe el layout de móvil primero y añade complejidad hacia arriba con `min-width`.

Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

- **Ni un solo scroll horizontal en `<body>`, en ningún ancho.** Lo que no cabe scrollea dentro de
  su propio contenedor con `overflow-x: auto`.
- **Las tablas de gestión se convierten en tarjetas apiladas en `<768`**, nunca en scroll horizontal.
- `minmax(0, 1fr)` en toda columna de grid que contenga una tabla o un gráfico. Sin él, el contenido
  ancho revienta la columna.
- `--touch-target: 44px` como mínimo real en toda fila, botón de icono, casilla y enlace de nav.
- El rail derecho **baja** en `1024–1279`; el sidebar **se vuelve drawer** en `768–1023`.
- Zoom al 200 % sin pérdida de contenido: nada se posiciona con alturas fijas que recorten texto.
- `prefers-reduced-motion`: se anulan entradas de drawer, shimmer y animación del anillo; se
  conservan los cambios de color en `--dur-fast`.

━━━

## 7. Modo claro y oscuro desde el primer commit

El sistema **nace con los dos temas**: las pantallas muestran el toggle en el sidebar y en el topbar.

```css
:root { /* paleta clara completa */ }
:root:not([data-theme="light"]) { @media (prefers-color-scheme: dark) { /* solo overrides */ } }
:root[data-theme="dark"] { /* los mismos overrides, para que el toggle gane */ }
```

**Nunca definas un color solo dentro del bloque oscuro.** Todo token existe primero en `:root`.
El atributo es `data-theme` — configúralo así en `next-themes` (`attribute="data-theme"`), porque es
el que leen todos los bloques del sistema. Hoy `next-themes` está instalado pero **no hay
`ThemeProvider` montado**: montarlo es parte del trabajo.

━━━

## 8. Iconos, tipografía y copy

- **Lucide, trazo 1.5px, `absoluteStrokeWidth`, `currentColor`.** Tamaños 16, 20 o 24. Nada de 18.
  Importa uno a uno (`import { House } from 'lucide-react'`), nunca `import * as Icons`.
- **Todo botón de solo icono lleva `aria-label`.** Sin excepción.
- **Cero emoji en la UI.** El destello ✦ es `sparkles`; el logo es `book-open`.
- **Plus Jakarta Sans** vía `next/font`. Siete tamaños y ni uno más. Monoespaciada solo dentro de
  bloques de código; los slugs y dominios van en la sans.
- **`font-variant-numeric: tabular-nums`** en toda métrica y toda tabla.
- **Copy en español**, segunda persona, frases cortas. **Sin signos de exclamación, sin
  superlativos, sin nombrar competidores.** La sigla es **`IA`**, nunca `AI`.
- El producto en prosa es `Cuaderno`; el wordmark, `cuaderno` en minúsculas; el plan,
  `Cuaderno Pro`.

━━━

## 9. Rutas del producto — en español

El panel es un producto en español y sus rutas también:

| Hoy | Debe ser |
|---|---|
| `app/panel/posts/` | `app/panel/entradas/` |
| `app/panel/taxonomias/` | `app/panel/categorias/` + `app/panel/etiquetas/` |
| `app/panel/configuracion/` | `app/panel/ajustes/` |
| `app/panel/disenador/` | `app/panel/diseno/` (+ `/diseno/estudio`) |
| — | `app/panel/paginas/`, `app/panel/seo/`, `app/panel/analiticas/` (por crear) |

Todo renombrado deja **redirección permanente** desde la ruta antigua.

━━━

## 10. Antes de dar por terminado

- [ ] ¿Puedo rastrear cada decisión visual a una pantalla, a un token o a una regla escrita?
- [ ] ¿Hay algún hexadecimal fuera de `tokens/`? ¿Alguna clase arbitraria de Tailwind con un valor?
- [ ] ¿Hay más de un botón negro en la misma zona de decisión?
- [ ] ¿El índigo y el verde están donde deben, y solo ahí?
- [ ] ¿Están los cuatro estados —y el quinto si hay IA?
- [ ] ¿El skeleton ocupa el alto final? ¿Layout shift cero?
- [ ] ¿Se distingue *nunca hubo dato* de *el filtro no encontró nada*?
- [ ] ¿Cada error deja una salida (`Reintentar`, `Limpiar filtros`, `Volver`)?
- [ ] ¿Funciona en claro **y** en oscuro? ¿Ningún color definido solo en oscuro?
- [ ] ¿Funciona a 375px sin scroll horizontal en `<body>`?
- [ ] ¿Todo botón de icono tiene `aria-label`? ¿Ningún color es el único portador de significado?
- [ ] ¿Todas las cifras en `tabular-nums`?
- [ ] ¿Reutilicé un componente existente en vez de escribir uno parecido?
- [ ] ¿El copy está en español, sin exclamaciones, sin `AI`, sin nombrar competidores?

━━━

## 11. Mapa rápido

```
design-system/
├── readme.md              ← qué es el sistema, la regla de color, el índice completo
├── SKILL.md               ← este archivo
├── styles.css             ← importa los cinco archivos de tokens, en orden
├── _ds_manifest.json      ← inventario de todos los archivos, con categoría
├── ui-ux-panels/          ← LAS 9 PANTALLAS · fuente oficial · mandan
├── tokens/                ← el contrato: fonts, colors, typography, spacing, effects
├── guidelines/            ← color, tipografía, layout, estados, iconografía, marca, landing
├── components/            ← core · layout · navigation · data-display · feedback · forms
└── ui_kits/
    ├── landing/           ← una sección por archivo
    └── panel/             ← una pantalla por archivo
```

**Si tienes una duda que este sistema no resuelve, no la resuelvas inventando.** Pregunta, o
documenta la decisión en el archivo que corresponda antes de implementarla.
