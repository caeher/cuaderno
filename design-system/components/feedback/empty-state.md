# Empty State — estado vacío

> Cuaderno es un producto que **empieza vacío**: un blog recién creado no tiene entradas, ni páginas,
> ni categorías, ni datos de analíticas, ni análisis de SEO. El estado vacío no es un caso borde —
> es la **primera pantalla real** de todo usuario nuevo. Merece el mismo cuidado que el estado lleno.
>
> Las 9 pantallas están todas en estado lleno, así que este componente se deriva del sistema, no de
> un píxel: reutiliza el cuadro de icono tintado de `stat-card`, la tipografía del par
> header-de-página y el CTA negro de `--action`.

Ruta destino: `components/admin/empty-state.tsx` — el primitivo `components/ui/empty.tsx` (shadcn) ya
existe y sirve de base estructural.

━━━

## 1. Anatomía

```
              ┌────────┐
              │   ▣    │        ← cuadro de icono tintado, 48×48
              └────────┘

        Todavía no hay entradas       ← título, --fs-h2

   Escribe tu primera entrada y empieza    ← descripción, máx. 2 líneas
      a construir tu blog.

        ┌──────────────────┐
        │ + Nueva entrada  │            ← CTA primario, negro
        └──────────────────┘
          Importar desde otro blog       ← acción secundaria (enlace índigo)
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Cuadro de icono** | 48×48 (`pagina`) / 40×40 (`tarjeta`), `--radius-control`, fondo tinte del canal, icono lucide 24px / 20px con `stroke-width: 1.5`. Un icono **del dominio** (`FileText`, `Search`, `BarChart3`), nunca una ilustración genérica ni un emoji |
| 2 | **Título** | `--fs-h2` (20/1.3) en `pagina`, `--fs-h3` (16) en `tarjeta`. Peso 600, `--text-primary`. **Enuncia el hecho, no el fallo**: `Todavía no hay entradas`, no `Error: sin resultados` |
| 3 | **Descripción** | `--fs-body` (14/1.55), `--text-secondary`, máximo 2 líneas, `max-width: 40ch`, centrada. **Dice qué pasará al actuar**, no repite el título |
| 4 | **CTA primario** | Botón `--action` (negro), texto `--text-on-dark`, `--radius-control`, alto 40px. Uno solo. Ausente cuando no hay acción posible (analíticas sin datos: el usuario no puede fabricar visitas) |
| 5 | **Acción secundaria** | Enlace `--accent`, `--fs-sm`, peso 500. Opcional. Nunca un segundo botón sólido |
| 6 | **Contenedor** | Centrado, padding vertical `--sp-16` (`pagina`) / `--sp-10` (`tarjeta`), `max-width: 420px`, `margin: 0 auto`, `text-align: center` |

**Espaciado vertical**: `--sp-5` icono→título, `--sp-2` título→descripción, `--sp-6`
descripción→CTA, `--sp-3` CTA→secundaria.

━━━

## 2. Variantes

### 2.1 Por causa (la que decide el copy — es la decisión importante)

| Variante | Cuándo | Icono / canal | Copy |
|---|---|---|---|
| `primera-vez` | El usuario nunca ha creado este tipo de objeto | `--accent-tint` / `--accent` | Título: `Todavía no hay entradas`. Desc: `Escribe tu primera entrada y empieza a construir tu blog.` CTA: `+ Nueva entrada` |
| `sin-resultados` | Hay datos, pero el filtro o la búsqueda no devuelve nada | `--neutral-tint` / `--neutral`, icono `SearchX` | Título: `Ningún resultado para «minimalismo»`. Desc: `Prueba con otras palabras o revisa los filtros activos.` CTA secundario: `Limpiar filtros` |
| `sin-datos` | La sección funciona pero aún no hay medición (analíticas, SEO Score) | `--accent-tint` / `--accent` | Título: `Todavía no hay datos suficientes`. Desc: `Vuelve cuando tu blog haya recibido sus primeras visitas.` **Sin CTA** |
| `todo-en-orden` | El vacío **es** el buen resultado (0 problemas de SEO, 0 comentarios pendientes) | `--perf-tint` / `--perf`, icono `CheckCircle2` | Título: `Todo en orden`. Desc: `No encontramos problemas de SEO en tu blog.` Sin CTA. **Único empty-state con canal verde**, y está justificado: aquí el vacío es rendimiento |
| `papelera-vacia` | Tab `Papelera (0)` | `--neutral-tint` / `--neutral`, icono `Trash2` | Título: `La papelera está vacía`. Desc: `Lo que muevas a la papelera aparecerá aquí durante 30 días.` Sin CTA |
| `sin-permiso` | El rol del usuario no alcanza | `--neutral-tint` / `--neutral`, icono `Lock` | Título: `No tienes acceso a esta sección`. Desc: `Pide al propietario del blog que te dé permiso.` Sin CTA |

> **`sin-resultados` ≠ `primera-vez`.** Confundirlas es el error más caro de este componente: decirle
> `Escribe tu primera entrada` a alguien que tiene 24 entradas y acaba de filtrar mal es tratarlo de
> principiante. La lógica de decisión es: **¿hay filtro o búsqueda activa?** → `sin-resultados`.
> **¿El total sin filtros es 0?** → `primera-vez`.

### 2.2 Por tamaño

| `size` | Dónde | Diferencias |
|---|---|---|
| `pagina` *(def.)* | Ruta completa vacía (`03`, `05`, `06` sin contenido) | Icono 48, título `--fs-h2`, padding `--sp-16` |
| `tarjeta` | Dentro de una tarjeta del dashboard o del contenedor de una tabla | Icono 40, título `--fs-h3`, padding `--sp-10`. **Conserva el header de la tabla** si vive dentro de una |
| `linea` | Dentro de un panel estrecho (sidebar de `02`) | Sin cuadro de icono; icono 16px en línea con el texto, todo alineado a la izquierda, `--fs-sm` |

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Estático. **Sin animación de entrada**: aparecer con fade dice "estoy cargando algo" cuando en realidad no hay nada |
| **Tras cargar** | El empty-state solo se pinta cuando la consulta **terminó** y devolvió cero. Mientras carga se muestra `skeleton`. Mostrar el vacío durante la carga y luego reemplazarlo por datos es el peor parpadeo posible |
| **Transición a lleno** | Cuando llega el primer elemento, el empty-state desaparece sin animación y la lista entra con su animación normal |
| **Hover/foco del CTA** | Los del botón `--action`: hover `--action-hover`, pressed `--action-pressed`, foco `--focus-ring` |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Cuadro de icono — `primera-vez` / `sin-datos` | `--accent-tint` / `--accent` |
| Cuadro de icono — `sin-resultados` / `papelera` / `sin-permiso` | `--neutral-tint` / `--neutral` |
| Cuadro de icono — `todo-en-orden` | `--perf-tint` / `--perf` |
| Cuadro — forma | `--radius-control` |
| Título | `--fs-h2` / `--fs-h3`, `--text-primary` |
| Descripción | `--fs-body`, `--text-secondary` |
| CTA primario | `--action` / `--action-hover` / `--action-pressed`, texto `--text-on-dark`, `--radius-control` |
| Acción secundaria | `--accent` → `--accent-hover`, `--fs-sm` |
| Padding | `--sp-16` (`pagina`) / `--sp-10` (`tarjeta`) |
| Gaps | `--sp-5`, `--sp-2`, `--sp-6`, `--sp-3` |
| Foco | `--focus-ring` |

**Nunca** lleva borde ni fondo propio: vive dentro de una tarjeta que ya los aporta, o sobre
`--bg-page` en la variante `pagina`.

━━━

## 5. Accesibilidad

- **El cuadro de icono es decorativo**: `aria-hidden="true"`. Todo el significado está en el título y
  la descripción.
- **El título es un encabezado real** (`<h2>` en `pagina`, `<h3>` en `tarjeta`) y encaja en la
  jerarquía de la página: nunca un `<div>` con estilo de título. Un lector de pantalla que navega por
  encabezados debe encontrar "Todavía no hay entradas".
- **El vacío se anuncia**: cuando una lista pasa de tener resultados a no tenerlos (al filtrar), el
  cambio se comunica en una región `aria-live="polite"`:
  `Ningún resultado para «minimalismo». 24 entradas ocultas por los filtros.` Sin esto, quien no ve
  la pantalla teclea en el buscador y no recibe ninguna señal.
- **El contenedor lleva `role="status"`** solo en la variante `sin-resultados` (es respuesta a una
  acción del usuario). En `primera-vez` **no**: es el estado inicial, no una novedad que anunciar.
- **El término buscado va entrecomillado y en el texto**, no solo resaltado en negrita — quien usa
  lector de pantalla debe oír qué se buscó.
- **Contraste**: `--text-secondary` sobre `--surface`/`--bg-page` supera 4.5:1. La descripción nunca
  usa `--text-tertiary`: aquí es el texto principal de la pantalla, no apoyo.
- **Foco tras vaciar**: al borrar el último elemento de una lista, el foco pasa al CTA del
  empty-state, nunca al `<body>`.
- **Zona táctil**: el CTA mide 40px de alto visual y alcanza `--touch-target` con padding.
- **`todo-en-orden` no depende del verde**: dice `Todo en orden` con palabras. El verde refuerza.

━━━

## 6. Marcado de ejemplo

```tsx
// components/admin/empty-state.tsx
const CANAL = {
  accent:  "bg-[var(--accent-tint)]  text-[var(--accent)]",
  neutral: "bg-[var(--neutral-tint)] text-[var(--neutral)]",
  perf:    "bg-[var(--perf-tint)]    text-[var(--perf)]",
} as const;

export function EmptyState({
  icono: Icono, titulo, descripcion, canal = "accent", size = "pagina",
  cta, secundaria, esRespuesta = false,
}: EmptyStateProps) {
  const Titulo = size === "pagina" ? "h2" : "h3";

  return (
    <div
      {...(esRespuesta ? { role: "status" } : {})}
      className={`mx-auto flex max-w-[420px] flex-col items-center text-center
                  ${size === "pagina" ? "py-[var(--sp-16)]" : "py-[var(--sp-10)]"}`}
    >
      <span
        aria-hidden="true"
        className={`grid place-items-center rounded-[var(--radius-control)] ${CANAL[canal]}
                    ${size === "pagina" ? "size-12" : "size-10"}`}
      >
        <Icono size={size === "pagina" ? 24 : 20} strokeWidth={1.5} />
      </span>

      <Titulo className={`mt-[var(--sp-5)] font-semibold text-[var(--text-primary)]
                          ${size === "pagina"
                            ? "text-[length:var(--fs-h2)] leading-[1.3]"
                            : "text-[length:var(--fs-h3)] leading-[1.4]"}`}>
        {titulo}
      </Titulo>

      <p className="mt-[var(--sp-2)] max-w-[40ch] text-[length:var(--fs-body)] leading-[1.55]
                    text-[var(--text-secondary)]">
        {descripcion}
      </p>

      {cta && (
        <a href={cta.href}
           className="mt-[var(--sp-6)] inline-flex h-10 items-center gap-[var(--sp-2)]
                      rounded-[var(--radius-control)] bg-[var(--action)] px-[var(--sp-4)]
                      text-[length:var(--fs-body)] font-medium text-[var(--text-on-dark)]
                      hover:bg-[var(--action-hover)] active:bg-[var(--action-pressed)]
                      focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">
          {cta.icono && <cta.icono size={16} strokeWidth={2} aria-hidden="true" />}
          {cta.texto}
        </a>
      )}

      {secundaria && (
        <button onClick={secundaria.onClick}
                className="mt-[var(--sp-3)] text-[length:var(--fs-sm)] font-medium text-[var(--accent)]
                           hover:text-[var(--accent-hover)]
                           focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]
                           rounded-[var(--radius-input)]">
          {secundaria.texto}
        </button>
      )}
    </div>
  );
}
```

Uso — **la decisión de variante es la parte importante**:

```tsx
{cargando ? (
  <SkeletonTabla filas={6} />
) : entradas.length === 0 && hayFiltrosActivos ? (
  <EmptyState
    esRespuesta
    icono={SearchX} canal="neutral"
    titulo={`Ningún resultado para «${busqueda}»`}
    descripcion="Prueba con otras palabras o revisa los filtros activos."
    secundaria={{ texto: "Limpiar filtros", onClick: limpiar }}
  />
) : entradas.length === 0 ? (
  <EmptyState
    icono={FileText} canal="accent"
    titulo="Todavía no hay entradas"
    descripcion="Escribe tu primera entrada y empieza a construir tu blog."
    cta={{ texto: "Nueva entrada", href: "/panel/entradas/nueva", icono: Plus }}
  />
) : (
  <TablaEntradas entradas={entradas} />
)}
```

━━━

## 7. Reglas duras

1. **Nunca mostrar el vacío mientras carga.** Skeleton primero, vacío después de confirmar el cero.
2. **`sin-resultados` y `primera-vez` son copys distintos.** Elegir mal insulta al usuario.
3. **Un solo CTA sólido**, y solo si el usuario puede hacer algo.
4. **El título es un encabezado real.**
5. **Sin ilustraciones ni emoji.** Un icono del dominio en un cuadro tintado, como en toda la app.
6. **Verde solo en `todo-en-orden`.**
7. **El cambio a vacío por filtro se anuncia** en `aria-live`.
