# Category Dot — punto de color de categoría

> El punto de color que identifica una categoría. Aparece en `06-panel-categorias` (columna
> `Nombre`, un punto por fila con 8 colores distintos), en `05-panel-paginas` (punto de estado en
> las stat cards `Publicadas` / `Borradores` / `Privadas`) y, en su forma *chip*, en la columna
> `Categorías` de `03-panel-entradas`.
>
> Es el componente más pequeño del sistema y el que más fácil se usa mal: **un punto de color nunca
> lleva significado por sí solo**.

Ruta destino: `components/admin/category-dot.tsx`

━━━

## 1. Anatomía

```
●  Inteligencia Artificial          ← punto (8px) + nombre, gap --sp-3
⬭  Inteligencia Artificial          ← variante chip: fondo tinte + texto del color
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Punto** | Círculo `--radius-pill`. Tamaños: `sm` 6px (dentro de un chip), `md` 8px *(def.)*, `lg` 10px (stat card de `05`). `flex-shrink: 0` |
| 2 | **Nombre** | **Obligatorio y siempre visible.** `--fs-body` (14), peso 500 en tabla, `--text-primary`. Ver §5 |
| 3 | **Conteo** (opcional) | `(23)` en `--text-tertiary`, `tabular-nums` |

━━━

## 2. Asignación de color

La categoría **no elige libremente un hex**: elige una **ranura** de la rampa `--cat-1 … --cat-8`.
Así el sistema garantiza contraste, coherencia y modo oscuro sin auditar cada categoría nueva.

| Ranura | Token | Nombre interno |
|---|---|---|
| 1 | `--cat-1` | Índigo |
| 2 | `--cat-2` | Azul |
| 3 | `--cat-3` | Verde |
| 4 | `--cat-4` | Naranja |
| 5 | `--cat-5` | Rosa |
| 6 | `--cat-6` | Teal |
| 7 | `--cat-7` | Amarillo |
| 8 | `--cat-8` | Gris |

**Reglas de asignación**

- Al crear una categoría se ofrece la ranura libre de menor índice; el usuario puede cambiarla en el
  selector de 8 muestras del formulario de categoría.
- Con más de 8 categorías, la ranura se **reutiliza cíclicamente** (`indice % 8`). Es aceptable
  porque el color aquí es una ayuda de escaneo, no un identificador: el nombre siempre está.
- `--cat-8` (gris) es la ranura por defecto de `Sin categoría` y del bucket `Otros` en gráficos.
- El color se **persiste** en el registro de la categoría (`colorSlot: 1..8`), no se recalcula por
  índice de render: si cambia el orden alfabético, el color de una categoría no debe cambiar.

> **La rampa `--cat-*` no es la paleta semántica.** Que `--cat-1` sea índigo y `--cat-3` verde no
> convierte a una categoría en "navegación" ni en "rendimiento". La ley de color rige `--accent`,
> `--perf`, `--action`, `--warn` y `--danger`; la rampa categórica es una familia aparte y **nunca
> debe mezclarse**: un punto de categoría jamás usa `var(--accent)`, aunque coincida en hex.

━━━

## 3. Variantes

| Variante | Uso | Composición |
|---|---|---|
| `punto` *(def.)* | `06` — tabla de categorías | Punto `md` + nombre en `--text-primary` |
| `chip` | `03` — columna `Categorías`; editor (`04`) | Píldora: fondo = color de ranura al 12%, texto = color de ranura, `--radius-pill`, padding `3px 10px`, `--fs-label` (12), peso 500. **Sin punto interior**: el propio fondo tintado es la señal. Con `removible`, añade `✕` 12px a la derecha |
| `estado` | `05` — stat cards | Punto `lg` + label. El color **no** sale de la rampa: sale del canal semántico del estado (`--perf` publicado, `--warn` borrador, `--neutral` privada). Es la excepción y está justificada: ahí el punto sí significa un estado, no una categoría |
| `leyenda` | Gráficos | Punto `md` + nombre + valor. Ver `donut-chart.md` §1 |
| `selector` | Formulario de categoría | 8 muestras de 24px en fila; la activa lleva `--focus-ring` permanente y un check blanco al centro |

### 3.1 ⚠️ Conflicto conocido con `core/chip.md`

`core/chip.md` describe su variante `categoria` como **fondo neutro + punto `--cat-N` a la
izquierda**; esta spec describe el chip como **fondo tintado del color de la ranura, sin punto**.

Lo que muestra `03-panel-entradas`: los chips de la columna `Categorías` tienen **fondo tintado y
texto del color de la categoría, sin punto interior** (`Inteligencia Artificial` sobre índigo claro,
`SEO` sobre azul claro, `Productividad` sobre ámbar claro, `Estrategia` sobre verde claro). Por la
regla «las pantallas mandan», la lectura correcta es la de este archivo.

**Resolución propuesta** (una línea de cambio, no dos componentes): `core/chip.md` mantiene la
variante `categoria` como envoltorio de forma y comportamiento (alto, radio, botón `✕`, estados), y
**delega el color a este archivo** — fondo `--cat-N-tint`, texto `--cat-N`, sin punto. El punto de
color queda reservado a la variante `punto` (tabla de `06`) y a las leyendas. Decidir antes de
implementar; hoy los dos documentos no pueden ser ciertos a la vez.

### 3.2 Chip: tinte del fondo

El chip necesita un tinte por ranura. Se declara **una vez** en el contrato de tokens como
`--cat-1-tint … --cat-8-tint` (cada uno = su `--cat-N` al 12% sobre `--surface`, con su equivalente
propio en el bloque oscuro). **Prohibido** calcularlo en el componente con `color-mix()` o alfa
suelto: un tinte a 12% de alfa sobre fondo oscuro no da el mismo resultado y rompería el tema.

━━━

## 4. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Punto + nombre |
| **Hover** (si enlaza a la categoría) | El nombre pasa a `--accent`; el punto no cambia |
| **Foco** | `--focus-ring` en el enlace/chip completo |
| **Chip removible — hover del ✕** | El ✕ pasa de `--text-tertiary` al color de la ranura; fondo del ✕ sube al 20% |
| **Seleccionado** (selector) | Muestra con check blanco al centro + `--focus-ring` |
| **Deshabilitado** | `opacity: .5`, `cursor: not-allowed`; el punto conserva su color (atenuarlo lo haría confundible con `--cat-8`) |
| **Sin categoría** | `--cat-8` + texto `Sin categoría` en `--text-tertiary`, cursiva **no** |
| **Cargando** | Círculo skeleton del mismo diámetro + barra de texto de 96px |

━━━

## 5. Tokens

| Rol | Token |
|---|---|
| Punto | `--cat-1` … `--cat-8`, `--radius-pill` |
| Nombre | `--fs-body`, `--text-primary` (`--text-tertiary` si es `Sin categoría`) |
| Conteo | `--fs-body`, `--text-tertiary`, `tabular-nums` |
| Chip — fondo | `--cat-N-tint` |
| Chip — texto | `--cat-N` |
| Chip — forma | `--radius-pill`, `--fs-label` |
| Punto de estado (`05`) | `--perf` / `--warn` / `--neutral` |
| Nombre en hover | `--accent` |
| Foco | `--focus-ring` |
| Gap punto ↔ nombre | `--sp-3` (`--sp-2` en `sm`) |

━━━

## 6. Accesibilidad

> **Regla absoluta: el punto es decorativo.** Lleva `aria-hidden="true"` en todos los casos. La
> información viaja siempre en el texto adyacente.

- **Nunca un punto sin nombre.** Prohibido usar el punto como única marca en una celda, una leyenda o
  un filtro. Si el espacio no da para el nombre, el componente correcto es otro (un badge con texto).
- **Ocho colores no son ocho significados.** El color de categoría no comunica estado, prioridad ni
  calidad; solo ayuda a reencontrar visualmente una categoría ya conocida. Por eso reutilizar
  ranuras a partir de la novena categoría es seguro.
- **Contraste del chip**: `--cat-N` sobre `--cat-N-tint` debe alcanzar **4.5:1** (es texto de 12px).
  Los pares más apretados son `--cat-7` (amarillo) y `--cat-8` (gris): sus tokens de texto en el
  contrato usan una versión oscurecida del tono, no el hex de la rampa. Esto se valida en el
  contrato de tokens, no en el componente.
- **El punto no necesita 3:1** porque no porta información (WCAG 1.4.11 aplica a elementos gráficos
  informativos). Aun así, un punto de 8px sobre `--surface` debe verse: por eso `--cat-8` es
  `#9CA3AF` y no un gris más claro.
- **Selector de color**: cada muestra es un `<input type="radio">` con
  `aria-label="Color índigo"` — el nombre del color se escribe, no se deduce. El estado marcado se
  refuerza con un **check visible**, no solo con el anillo de foco.
- **Chip removible**: el ✕ es un `<button>` con `aria-label="Quitar la categoría Inteligencia
  Artificial"`, alcanza `--touch-target` con padding invisible, y al quitarlo se anuncia en
  `aria-live="polite"`.
- **`prefers-contrast: more`**: el punto gana un borde de 1px en `--border-strong`, y el chip pasa de
  fondo tintado a fondo `--surface` con borde 1px del color de la ranura.

━━━

## 7. Marcado de ejemplo

```tsx
// components/admin/category-dot.tsx
const SIZES = { sm: "size-1.5", md: "size-2", lg: "size-2.5" } as const;

/** punto + nombre — el punto es decorativo, el nombre es el dato */
export function CategoryDot({ slot, nombre, conteo, size = "md", href }: CategoryDotProps) {
  const Root = href ? "a" : "span";
  return (
    <Root
      {...(href ? { href } : {})}
      className={[
        "inline-flex items-center gap-[var(--sp-3)] rounded-[var(--radius-control)]",
        href && "hover:[&_[data-nombre]]:text-[var(--accent)]",
        href && "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
      ].filter(Boolean).join(" ")}
    >
      <span
        aria-hidden="true"
        style={{ background: `var(--cat-${slot})` }}
        className={`${SIZES[size]} shrink-0 rounded-[var(--radius-pill)]`}
      />
      <span data-nombre className="text-[length:var(--fs-body)] font-medium text-[var(--text-primary)]">
        {nombre}
      </span>
      {conteo !== undefined && (
        <span className="text-[length:var(--fs-body)] text-[var(--text-tertiary)] [font-variant-numeric:tabular-nums]">
          ({conteo})
        </span>
      )}
    </Root>
  );
}

/** variante chip — el fondo tintado sustituye al punto */
export function CategoryChip({ slot, nombre, onQuitar }: CategoryChipProps) {
  return (
    <span
      style={{ background: `var(--cat-${slot}-tint)`, color: `var(--cat-${slot})` }}
      className="inline-flex items-center gap-[var(--sp-2)] rounded-[var(--radius-pill)]
                 px-[10px] py-[3px] text-[length:var(--fs-label)] font-medium"
    >
      {nombre}
      {onQuitar && (
        <button
          onClick={onQuitar}
          aria-label={`Quitar la categoría ${nombre}`}
          className="relative grid place-items-center rounded-[var(--radius-pill)]
                     after:absolute after:inset-[-11px] after:content-['']
                     focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
        >
          <X size={12} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
```

━━━

## 8. Reglas duras

1. **Punto sin nombre = bug.** Sin excepciones.
2. **`aria-hidden` en el punto, siempre.**
3. **Ranura persistida (`colorSlot`), no índice de render.**
4. **Rampa `--cat-*` ≠ canales semánticos.** Un punto de categoría nunca usa `--accent` ni `--perf`.
5. **Los tintes de chip viven en el contrato de tokens**, no se calculan en el componente.
6. **`--cat-8` es gris y es de `Sin categoría` y `Otros`.**
