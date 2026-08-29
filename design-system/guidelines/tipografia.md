# Tipografía

> Fuente: las 9 pantallas de `../ui-ux-panels/`. Donde el código y una pantalla no coincidan, gana la pantalla.
> El código actual usa `Fraunces` (serif) + `Work Sans` + `JetBrains Mono`. **Ese trío se retira.** Lo que sigue es el objetivo.

━━━

## 1. La familia

**`--font-sans`: Plus Jakarta Sans.** Sans geométrica humanista de Google Fonts: formas circulares con terminaciones humanistas, `a` de doble piso, `g` de un piso, y un display que aguanta el tracking negativo apretado del hero. Cobertura completa de acentos y `¿ ¡` — obligatorio en un producto íntegramente en español.

```ts
// app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-family',
  display: 'swap',
})
```

```css
:root {
  --font-sans: var(--font-sans-family), ui-sans-serif, system-ui,
               -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

`--font-sans-family` es la variable técnica que inyecta `next/font`, no un token del contrato: el único nombre que consume el resto del sistema es **`--font-sans`**.

El fallback es real y ordenado: si la webfont no carga, la página se compone en la sans del sistema con métricas parecidas, no en Times. `display: swap` + `next/font` (que ya inyecta `size-adjust`) mantienen el CLS en cero.

Sustituto aprobado si Plus Jakarta Sans se descarta: **Figtree**. Nada más. No se mezclan dos sans en el sistema.

**Monoespaciada.** Solo dentro de bloques de código del contenido publicado y del editor TipTap (`code`, `pre`). No tiene token propio y no se carga webfont para ella: se declara el stack del sistema directamente en los estilos de prosa.

```css
.prose code, .prose pre {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}
```

Los slugs (`/sobre-mi`), el enlace permanente y el dominio del tenant **no** van en monoespaciada: las pantallas 04, 05 y 09 los componen en la sans. La monoespaciada es para código, no para "cosas técnicas".

━━━

## 2. La escala

Siete niveles. No hay un octavo: si un tamaño no está aquí, no se usa.

| Token | Tamaño / interlínea | Weight | Tracking | Qué es | Dónde aparece |
|---|---|---|---|---|---|
| `--fs-display` | 44px / 1.05 | 700 | −0.03em | Titular de marketing | Hero de la landing. **Solo landing.** |
| `--fs-h1` | 30px / 1.15 | 600 | −0.02em | Título de página y cifra de métrica | `Resumen`, `Entradas`, `Analíticas`, `Ajustes`; el `24.8K` de las stat cards; `Un blog, infinitas posibilidades` |
| `--fs-h2` | 20px / 1.3 | 600 | −0.01em | Título de tarjeta y H2 del contenido | `Entradas recientes`, `SEO Analyzer`, `Fuentes de tráfico`, `Editar entrada`; `Automatización inteligente` dentro del editor |
| `--fs-h3` | 16px / 1.4 | 600 | 0 | Encabezado de bloque y nombre de ítem | `Información del sitio`, `Usuario`, `Lectura`; `Editor con IA` en la landing; título de fila destacada |
| `--fs-body` | 14px / 1.55 | 400 · 500 · 600 | 0 | Texto general | Celdas de tabla, ítems del sidebar, labels de formulario, texto de botón, valores de input, cuerpo del editor |
| `--fs-sm` | 13px / 1.5 | 400 · 500 | 0 | Apoyo y metadatos | Subtítulo de página, `vs. últimos 30 días`, cabeceras de tabla, descripciones de tarjeta, ayuda de campo, badges, leyendas del gráfico |
| `--fs-label` | 12px / 1.4 | 600 | +0.06em, `uppercase` | Etiqueta de contexto | Eyebrow de sección en la landing (`TODO LO QUE NECESITAS`), agrupador del sidebar si se rotula, chip `⌘K` |

**El display no entra al panel.** Ninguna pantalla de producto usa 44px. La landing grita; el panel no.

**Escalado del display.** En viewports anchos el hero crece, pero solo el display:

```css
.hero-title { font-size: clamp(32px, 4.4vw, 60px); line-height: 1.05; letter-spacing: -0.03em; }
```

Por debajo de 640px baja a 32px y el tracking se relaja a −0.02em: apretado y pequeño se vuelve ilegible.

━━━

## 3. Cuándo usar cada nivel

**Un solo `--fs-h1` por pantalla.** Es el título del header de página, y coincide con el único `<h1>` del documento. Las cifras de las stat cards comparten su tamaño pero son `<p>` o `<span>`, nunca encabezados: el orden semántico no se rompe por estética.

**El salto h1 → h2 es de 10px, no de uno.** Entre el título de página (30) y el título de tarjeta (20) no hay nivel intermedio. Si sientes que falta, lo que falta es aire (`--sp-6`), no un tamaño.

**Body en tres pesos, con reglas fijas:**
- 400 — prosa, celdas de datos, valores.
- 500 — items de nav inactivos, cabeceras de tabla, texto de botón secundario, deltas, badges.
- 600 — item de nav activo, texto de botón primario, título de fila de tabla, palabras enfatizadas dentro de un párrafo (`control total` en el hero).

**Nunca 300.** Se rompe a 13px sobre `--bg-page`. **Nunca 800 ni 900**: el sistema no tiene un registro tan alto; la jerarquía la hace el tamaño y el color, no el grosor.

**El subtítulo del header de página siempre es `--fs-sm` / `--text-secondary`**, en una sola línea, en indicativo presente y segunda persona: `Gestiona y organiza todo tu contenido publicado.`, `Organiza tu contenido por temas.`, `Administra la configuración de tu blog y cuenta.`

**Cabeceras de tabla: `--fs-sm`, weight 500, `--text-secondary`, capitalización de frase** — `Título`, `Autor`, `Categorías`, `Estado`, `Fecha`, `SEO Score`. **No van en mayúsculas.** Las pantallas 03, 05 y 06 son explícitas en esto y contradicen la costumbre de los dashboards; se respeta la pantalla.

**`--fs-label` en mayúsculas se reserva a tres sitios:** el eyebrow de sección de la landing, el rótulo de un grupo del sidebar (si algún día se rotula; hoy el divisor basta) y micro-chips de contexto como `⌘K`. Nada más lleva mayúsculas. En español las mayúsculas **conservan la tilde**: `ANALÍTICAS`, `PUBLICACIÓN`, no `ANALITICAS`.

━━━

## 4. Números tabulares

Los números que se comparan verticalmente deben alinearse. Es obligatorio, no una mejora.

```css
.tabular { font-variant-numeric: tabular-nums; }
```

**Obligatorio en:**
- Cifra y delta de toda stat card (`24.8K`, `↑ 18%`, `4:36`, `36.2%`).
- Toda columna numérica de tabla: `Vistas`, `SEO Score`, `Entradas`, conteos de categoría.
- Fechas y horas en tablas (`20 May 2024`, `10:30 AM`) — la columna se lee como bloque.
- Cifra dentro del anillo de score y su `/100`.
- Ejes y tooltips del gráfico; porcentajes y valores de la leyenda del donut (`12.4K (50.0%)`).
- Barras de dispositivos: `12.6K`, `50.6%`.
- Contadores de tabs (`Todas (24)`, `Publicadas (20)`), paginación, `Mostrando 1 a 6 de 24 entradas`.
- Pie del editor: `Palabras: 1246`, `Tiempo de lectura: 6 min`.
- Contadores de severidad de la lista de problemas (`5`, `7`, `14`).

**Prohibido en prosa.** El cuerpo de una entrada, el copy de la landing y las descripciones usan cifras proporcionales: tabular en prosa deja huecos feos.

**Formato de número (locale `es`):** miles con `.` y decimales con `,` cuando el número es exacto (`1.246 palabras`); abreviatura `K`/`M` sin espacio y con un decimal cuando es una métrica (`24.8K`, `1.2M`). Porcentajes con un decimal como máximo. Duraciones en `m:ss` (`4:36`). Ninguna cifra se trunca jamás: si no cabe, se abrevia o se ensancha la columna.

━━━

## 5. Medida, corte y espaciado

- **Prosa:** 60–75 caracteres por línea. La columna de composición del editor mide **máximo 720px** y va centrada dentro de su tarjeta.
- **Párrafo del hero:** máximo 46ch. Se corta con `<br>` manual solo si el diseñador lo decide; nunca por accidente.
- **Título de fila de tabla:** máximo 2 líneas con `-webkit-line-clamp: 2`, `--fs-body` weight 500/600. Las pantallas 02, 03 y 08 muestran títulos partidos en dos líneas: es el comportamiento correcto, no un defecto.
- **Descripción de categoría, slug, extracto en lista:** 1 línea con elipsis.
- **Nunca truncar:** cifras, badges de estado, nombres de columna, el CTA primario.
- `hyphens: none` en titulares. En el cuerpo de la prosa publicada, `hyphens: auto` con `lang="es"`.
- `text-wrap: balance` en `--fs-display` y `--fs-h1`; `text-wrap: pretty` en párrafos, para eliminar viudas.
- `overflow-wrap: anywhere` en URLs y slugs largos (`miblog.cuaderno.com/el-futuro-del-trabajo-ia`).

━━━

## 6. Convenciones de español

- `<html lang="es">`. Sin esto, la separación silábica, el corrector y los lectores de pantalla fallan.
- Comillas tipográficas `“ ”` para citas y para entrecomillar valores del usuario (`Sin resultados para “inteligencia”`). Comillas rectas solo dentro de bloques de código.
- Guion largo `—` para incisos, con espacio a cada lado. Nunca `--` ni el guion corto haciendo de raya.
- Puntos suspensivos como carácter `…`, nunca tres puntos. Aplica a placeholders: `Buscar…`, `Analizar una URL o entrada…`, `Generando…`.
- Apóstrofo tipográfico `’` si aparece en un nombre propio.
- **Sin signos de exclamación en la UI ni en el copy de producto.** Ni en toasts, ni en vacíos, ni en la landing.
- Capitalización de frase en todo: títulos, botones, labels, cabeceras. `Nueva entrada`, no `Nueva Entrada`. Excepciones: nombres propios (`Cuaderno Pro`, `SEO Analyzer`, `IA Writer`, `Google`) y las siglas (`IA`, `SEO`, `RSS`, `URL`).
- Los nombres de las secciones de IA se quedan en su forma tal como aparecen en las pantallas: `IA Writer` y `SEO Analyzer` (mezcla deliberada de español e inglés). No se traducen a `Escritor IA` ni a `Analizador SEO`.

━━━

## 7. Tipografía del contenido publicado

El blog del tenant hereda `--font-sans` y la escala, con dos ajustes: el cuerpo sube a **16px / 1.7** (lectura larga, no interfaz) y la medida se fija en 680px. Los encabezados del artículo mapean así: `H1 → --fs-h1`, `H2 → --fs-h2`, `H3 → --fs-h3`, y por debajo se usa `--fs-body` en weight 600. El editor TipTap muestra exactamente esos estilos: **lo que se ve al escribir es lo que se publica**, sin skin de editor propio.

━━━

## 8. Checklist

1. ¿Hay un solo `--fs-h1` y un solo `<h1>` en la pantalla?
2. ¿Aparece `--fs-display` fuera de la landing? (No debe.)
3. ¿Toda cifra comparable lleva `tabular-nums`?
4. ¿Alguna cabecera de tabla quedó en mayúsculas? (Va en capitalización de frase.)
5. ¿Se usó un weight 300, 800 o 900? (No existen.)
6. ¿Los placeholders y los estados de carga usan `…` y no `...`?
7. ¿Algún tamaño en px fuera de los siete tokens?
