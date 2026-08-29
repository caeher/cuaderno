# Issue Row — fila de problema u oportunidad

> Las filas de `Problemas y oportunidades detectadas` en `07-panel-seo-analyzer`: icono de severidad
> en círculo tintado, título, descripción, conteo en píldora del mismo canal y chevron de navegación.
>
> Es el componente que convierte un análisis en **trabajo accionable**: cada fila lleva a una lista
> filtrada de las entradas afectadas. Por eso el conteo y el chevron no son adorno.

Ruta destino: `components/admin/issue-row.tsx`

━━━

## 1. Anatomía

```
┌──────────────────────────────────────────────────────────────────────┐
│ Problemas y oportunidades detectadas  ⑫              Ver todas  →   │ ← cabecera
├──────────────────────────────────────────────────────────────────────┤
│  ⊗   Entradas con SEO Score bajo                        ( 5 )    ›   │
│      5 entradas necesitan mejoras importantes.                       │
├──────────────────────────────────────────────────────────────────────┤
│  ⚠   Meta descripciones faltantes                       ( 7 )    ›   │
│      7 entradas no tienen meta descripción.                          │
├──────────────────────────────────────────────────────────────────────┤
│  ⓘ   Imágenes sin texto alternativo                    ( 14 )    ›   │
│      14 imágenes no tienen atributo alt.                             │
├──────────────────────────────────────────────────────────────────────┤
│  ✓   Oportunidades de palabras clave                   ( 21 )    ›   │
│      21 sugerencias de palabras clave disponibles.                   │
├──────────────────────────────────────────────────────────────────────┤
│  🔗  Enlaces internos sugeridos                        ( 15 )    ›   │
│      15 oportunidades para mejorar el enlazado interno.              │
└──────────────────────────────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Cabecera** | Título `--fs-h3` (16) peso 600 `--text-primary` + píldora con el conteo total (`--neutral-tint`, `--text-secondary`, `--fs-label`, `--radius-pill`) + enlace `Ver todas →` en `--accent` a la derecha |
| 2 | **Fila** | Alto mínimo **68px**, padding `--sp-4` vertical / `--sp-5` horizontal. Separador inferior 1px `--border-hairline`; la última fila sin separador. **Toda la fila es un enlace** |
| 3 | **Icono de severidad** | Círculo 28×28 (`--radius-pill`) con fondo tinte del canal + icono lucide 16px del color sólido. Excepción: la severidad `sugerencia` no lleva círculo — icono suelto 20px en `--accent` (así lo pinta `07` en `Enlaces internos sugeridos`) |
| 4 | **Título** | `--fs-body` (14), peso 600, `--text-primary`. Una línea, ellipsis |
| 5 | **Descripción** | `--fs-sm` (13), `--text-secondary`, una línea. **Siempre empieza por el número** (`5 entradas necesitan…`): el conteo se lee aunque la píldora no se vea |
| 6 | **Píldora de conteo** | `--radius-pill`, padding `2px 10px`, `--fs-label` (12), peso 600, `tabular-nums`. Fondo = tinte del canal, texto = color sólido del canal |
| 7 | **Chevron** | `ChevronRight` 16px `--text-tertiary` → `--text-secondary` en hover. Es affordance, no decoración |

━━━

## 2. Severidades

| Severidad | Icono | Color / tinte | Significado |
|---|---|---|---|
| `critico` | `AlertOctagon` | `--danger` / `--danger-tint` | Penaliza activamente el posicionamiento. Hay que arreglarlo |
| `atencion` | `AlertTriangle` | `--warn` / `--warn-tint` | Falta algo recomendable, sin daño inmediato |
| `info` | `Info` | `--accent` / `--accent-tint` | Dato accionable sin juicio de gravedad |
| `oportunidad` | `CheckCircle2` | `--perf` / `--perf-tint` | **No es un problema: es ganancia disponible.** Verde porque mide rendimiento potencial |
| `sugerencia` | `Link2` (u otro icono del dominio) | `--accent`, **sin círculo** | Recomendación del producto. Índigo = el producto pensando |

### 2.1 Nota de token — el círculo azul de `info`

`07` pinta el círculo de `Imágenes sin texto alternativo` en un **azul** (~`#3B82F6`) que en el
contrato de tokens solo existe como `--cat-2`, una ranura de la rampa **categórica**. Como no hay un
canal semántico `info` declarado, esta spec mapea `info` a **`--accent` / `--accent-tint`**: es
coherente con la ley de color (índigo = el producto informando) y no introduce ningún hex suelto.

> **Decisión pendiente para la capa de tokens, no para este componente:** si se quiere el azul
> literal de la pantalla, hay que añadir `--info: #3B82F6` y `--info-tint: #EFF6FF` (con sus
> equivalentes en el bloque oscuro) al contrato, y cambiar aquí una línea. Lo que **no** es
> aceptable es usar `--cat-2` como si fuera semántico, ni escribir el hex en el componente.

### 2.2 Orden de las filas

Por **severidad descendente** (`critico` → `atencion` → `info` → `oportunidad` → `sugerencia`) y,
dentro de cada severidad, por conteo descendente. El orden es un canal de información en sí mismo:
lo primero de la lista es lo más urgente, se vea o no el color.

━━━

## 3. Variantes

| Variante | Uso | Diferencias |
|---|---|---|
| `completa` *(def.)* | `07` — panel principal | Icono + título + descripción + conteo + chevron |
| `compacta` | Panel lateral o dashboard | Sin descripción; alto 48px; título + conteo + chevron |
| `con-accion` | Cuando el problema se resuelve en un clic | Sustituye el chevron por un botón secundario (`Corregir todo`) de 32px de alto. El botón **no** es negro: la acción masiva automática no es un CTA primario, va en `--surface` con borde `--border-strong` |
| `agrupada` | Lista larga | Encabezados de grupo (`Críticos`, `Oportunidades`) en `--fs-label` `--text-tertiary` sobre `--surface-sunken`, alto 32px |

━━━

## 4. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Como se describe |
| **Hover** | Fondo `--surface-sunken`; el chevron se desplaza 2px a la derecha en `--dur-fast --ease-out`; el título pasa a `--accent` |
| **Foco** | `--focus-ring` en la fila completa, `border-radius: var(--radius-control)` |
| **Activo** | Fondo `--surface-sunken`, sin desplazamiento adicional |
| **Resuelto** | La fila sale con `opacity → 0` + `height → 0` en `--dur-base --ease-out` y aparece un `toast` `Problema resuelto` con acción `Ver cambios`. El contador de la cabecera baja |
| **Cargando** | `skeleton`: círculo 28px + barra de título 60% + barra de descripción 80% + píldora 32px, 5 filas |
| **Vacío (sin problemas)** | `empty-state` compacto **positivo**: icono `CheckCircle2` en cuadro `--perf-tint`, `Todo en orden`, subtexto `No encontramos problemas de SEO en tu blog.` Es el único empty-state del sistema con canal verde, y está justificado: aquí el vacío **es** el buen resultado |
| **Analizando** | Cabecera con `Analizando tu blog…` y `ai-thinking` en variante `linea` sobre la lista; las filas ya resueltas se van insertando arriba con fade |
| **`prefers-reduced-motion`** | Sin desplazamiento del chevron ni colapso animado al resolver |

━━━

## 5. Tokens

| Rol | Token |
|---|---|
| Tarjeta contenedora | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-rest` |
| Título de cabecera | `--fs-h3`, `--text-primary` |
| Píldora del total | `--neutral-tint`, `--text-secondary`, `--fs-label`, `--radius-pill` |
| Enlace `Ver todas →` | `--fs-sm`, `--accent` → `--accent-hover` |
| Separador de fila | `--border-hairline` |
| Fila hover / activa | `--surface-sunken` |
| Círculo `critico` | `--danger-tint` / icono `--danger` |
| Círculo `atencion` | `--warn-tint` / icono `--warn` |
| Círculo `info` | `--accent-tint` / icono `--accent` |
| Círculo `oportunidad` | `--perf-tint` / icono `--perf` |
| Icono `sugerencia` (sin círculo) | `--accent` |
| Título de fila | `--fs-body`, `--text-primary` → `--accent` en hover |
| Descripción | `--fs-sm`, `--text-secondary` |
| Píldora de conteo | tinte + sólido del canal de la severidad, `--fs-label`, `--radius-pill`, `tabular-nums` |
| Chevron | `--text-tertiary` → `--text-secondary` |
| Encabezado de grupo | `--fs-label`, `--text-tertiary`, fondo `--surface-sunken` |
| Foco | `--focus-ring` |
| Gaps | `--sp-4` (icono ↔ texto), `--sp-3` (título ↔ descripción: `--sp-1`), `--sp-5` (padding horizontal) |
| Movimiento | `--dur-fast` (hover), `--dur-base` (resolver) |

━━━

## 6. Accesibilidad

- **Cuatro canales por fila, y el color es el cuarto**: (1) la **forma del icono** — octógono,
  triángulo, círculo-i, círculo-check, enlace —; (2) el **título**, que nombra el problema; (3) la
  **descripción**, que empieza por el número; (4) el **orden**, que pone lo grave arriba. La lista se
  entiende íntegra en escala de grises.
- **La severidad se nombra en el `aria-label`**, porque el icono es `aria-hidden`:
  `aria-label="Crítico: Entradas con SEO Score bajo. 5 entradas necesitan mejoras importantes. Ver las 5 entradas afectadas"`.
  Nunca se confía en que el usuario "vea" que el círculo es rojo.
- **La lista es una `<ul>`** con `aria-label="Problemas y oportunidades detectadas, 12 en total"`.
  Cada fila es un `<li>` que contiene **un solo** `<a>` — la fila entera. Nada de un enlace en el
  título y otro en el chevron: duplicaría las paradas de tabulación por fila.
- **El conteo aparece dos veces a propósito**: en la píldora (visual, escaneable) y al inicio de la
  descripción (textual, siempre legible). No es redundancia perezosa; es el segundo canal.
- **Contraste**: `--danger`, `--warn`, `--accent` y `--perf` sobre sus tintes respectivos cumplen
  4.5:1 en la píldora (texto de 12px en peso 600). El icono dentro del círculo solo necesita 3:1.
- **`oportunidad` en verde no debe leerse como "hecho"**: por eso su título dice
  `Oportunidades de palabras clave` y su descripción `21 sugerencias disponibles`, en modo
  invitación. Un check verde con copy ambiguo haría creer que ya está resuelto.
- **Al resolver una fila**, se anuncia en `aria-live="polite"`:
  `Meta descripciones faltantes resuelto. Quedan 11 problemas.` Y el foco pasa a la fila siguiente,
  nunca se pierde en el `<body>`.
- **Zona táctil**: la fila entera supera con holgura `--touch-target`. En la variante `con-accion`,
  el botón mantiene 44px de alto táctil aunque su caja visual sea de 32px.
- **`prefers-contrast: more`**: el círculo de severidad gana un borde 1px del color sólido del canal
  y la píldora de conteo cambia tinte por borde.

━━━

## 7. Marcado de ejemplo

```tsx
// components/admin/issue-row.tsx
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, Link2, ChevronRight } from "lucide-react";

const SEVERIDAD = {
  critico:     { icono: AlertOctagon,  circulo: "bg-[var(--danger-tint)] text-[var(--danger)]",
                 pildora: "bg-[var(--danger-tint)] text-[var(--danger)]", etiqueta: "Crítico" },
  atencion:    { icono: AlertTriangle, circulo: "bg-[var(--warn-tint)] text-[var(--warn)]",
                 pildora: "bg-[var(--warn-tint)] text-[var(--warn)]",     etiqueta: "Atención" },
  // el contrato de tokens no declara un canal `info`; se mapea a --accent (ver §2.1)
  info:        { icono: Info,          circulo: "bg-[var(--accent-tint)] text-[var(--accent)]",
                 pildora: "bg-[var(--accent-tint)] text-[var(--accent)]", etiqueta: "Información" },
  oportunidad: { icono: CheckCircle2,  circulo: "bg-[var(--perf-tint)] text-[var(--perf)]",
                 pildora: "bg-[var(--perf-tint)] text-[var(--perf)]",     etiqueta: "Oportunidad" },
  sugerencia:  { icono: Link2,         circulo: null, // sin círculo, icono suelto en índigo
                 pildora: "bg-[var(--accent-tint)] text-[var(--accent)]", etiqueta: "Sugerencia" },
} as const;

export function IssueRow({ severidad, titulo, descripcion, conteo, href, accionTexto }: IssueRowProps) {
  const s = SEVERIDAD[severidad];
  const Icono = s.icono;

  return (
    <li className="border-b border-[var(--border-hairline)] last:border-0">
      <a
        href={href}
        aria-label={`${s.etiqueta}: ${titulo}. ${descripcion} ${accionTexto ?? `Ver los ${conteo} elementos afectados`}`}
        className="group flex min-h-[68px] items-center gap-[var(--sp-4)] rounded-[var(--radius-control)]
                   px-[var(--sp-5)] py-[var(--sp-4)]
                   transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                   hover:bg-[var(--surface-sunken)]
                   focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
      >
        {s.circulo ? (
          <span aria-hidden="true"
                className={`grid size-7 shrink-0 place-items-center rounded-[var(--radius-pill)] ${s.circulo}`}>
            <Icono size={16} strokeWidth={2} />
          </span>
        ) : (
          <Icono size={20} strokeWidth={1.75} aria-hidden="true"
                 className="shrink-0 text-[var(--accent)]" />
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[length:var(--fs-body)] font-semibold text-[var(--text-primary)]
                           group-hover:text-[var(--accent)]">
            {titulo}
          </span>
          {/* la descripción empieza por el número: el conteo se lee sin ver la píldora */}
          <span className="mt-[var(--sp-1)] block truncate text-[length:var(--fs-sm)] text-[var(--text-secondary)]">
            {descripcion}
          </span>
        </span>

        <span aria-hidden="true"
              className={`shrink-0 rounded-[var(--radius-pill)] px-[10px] py-[2px]
                          text-[length:var(--fs-label)] font-semibold
                          [font-variant-numeric:tabular-nums] ${s.pildora}`}>
          {conteo}
        </span>

        <ChevronRight
          size={16} aria-hidden="true"
          className="shrink-0 text-[var(--text-tertiary)] transition-transform
                     duration-[var(--dur-fast)] ease-[var(--ease-out)]
                     group-hover:translate-x-0.5 group-hover:text-[var(--text-secondary)]
                     motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </a>
    </li>
  );
}
```

━━━

## 8. Reglas duras

1. **Un solo enlace por fila.** La fila entera.
2. **La descripción empieza por el número.**
3. **La severidad se nombra en el `aria-label`.** El color no habla.
4. **Cada severidad tiene forma de icono propia.** Cinco círculos de colores distintos es un fallo.
5. **`oportunidad` es verde e invita**, no informa de algo ya hecho.
6. **`info` usa `--accent` mientras el contrato no declare `--info`.** Ningún hex suelto entra al
   componente por parecerse más a la pantalla.
7. **El vacío es una buena noticia** y se pinta como tal.
