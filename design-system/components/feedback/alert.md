# Alert — aviso persistente en línea

> Lo que el `toast` **no** es: un mensaje que se queda. El alert vive dentro del flujo de la página,
> junto a lo que describe, y no desaparece solo.
>
> En las pantallas se manifiesta sobre todo en `09-panel-ajustes` (zona de peligro con
> `Eliminar mi sitio`), y es el componente correcto para el error de carga de una tabla o de un
> gráfico, para el aviso de límite de plan y para el estado de una entrada con conflicto de edición.

Ruta destino: `components/ui/alert.tsx` (shadcn, ya existe) + variantes de dominio.

━━━

## 1. Anatomía

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠   No pudimos cargar tus analíticas                          ✕  │ ← icono + título + cerrar
│     El servicio de métricas no respondió. Tus datos están        │ ← descripción
│     a salvo; solo falló la lectura.                              │
│                                                                  │
│     [ Reintentar ]   Ver estado del servicio                     │ ← acciones
└──────────────────────────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Contenedor** | Fondo tinte del canal, **borde 1px del canal** (`--accent-border` para `info`; para el resto, el sólido del canal al 24% — declarado en el contrato como `--<canal>-border`), `--radius-card`, padding `--sp-4`. **Sin barra lateral gruesa**: el sistema separa con hairline, no con franjas |
| 2 | **Icono** | 18px, `stroke-width: 2`, color sólido del canal, alineado a la primera línea del título. `aria-hidden` |
| 3 | **Título** | `--fs-body` (14), peso 600, `--text-primary`. Opcional en alerts de una sola línea |
| 4 | **Descripción** | `--fs-sm` (13/1.5), `--text-secondary`. Admite enlaces en `--accent` con subrayado |
| 5 | **Acciones** | 0–2. La primaria es un botón de 32px de alto: `--surface` con borde `--border-strong` en `info`/`atencion`; **sólido `--danger`** solo en la zona de peligro. La secundaria es un enlace de texto |
| 6 | **Cerrar ✕** | Solo si el alert es descartable (§2.2). 16px `--text-tertiary` |

**Ancho**: el del contenedor padre. **Nunca** centrado ni con ancho máximo propio: es parte del
flujo, no una tarjeta flotante.

━━━

## 2. Variantes

### 2.1 Canal

| Canal | Icono | Tinte / borde / icono | Uso |
|---|---|---|---|
| `info` | `Info` | `--accent-tint` / `--accent-border` / `--accent` | El producto explica algo: `Tu blog todavía no es público`, `Los datos se actualizan cada 24 horas` |
| `exito` | `CheckCircle2` | `--perf-tint` / `--perf` al 24% / `--perf` | Confirmación que debe quedarse a la vista: `Dominio verificado correctamente` |
| `atencion` | `AlertTriangle` | `--warn-tint` / `--warn` al 24% / `--warn` | Algo requiere decisión pero nada está roto: `Tu plan está al 92% de su límite` |
| `destructivo` | `AlertCircle` | `--danger-tint` / `--danger` al 24% / `--danger` | Error real o zona de peligro: `No pudimos cargar tus analíticas`, `Eliminar mi sitio` |

### 2.2 Forma

| Variante | Uso | Diferencias |
|---|---|---|
| `bloque` *(def.)* | Error de carga, aviso de plan | Icono + título + descripción + acciones. No descartable si describe un problema activo |
| `linea` | Aviso corto sobre un formulario | Una sola línea, sin título, padding `--sp-3`, icono 16px |
| `descartable` | Informativo, no bloqueante | Añade ✕. El descarte se **persiste** por usuario (`localStorage: cuaderno:alert:<id>:descartado`); si vuelve a aparecer en cada recarga, es spam |
| `zona-de-peligro` | `09-panel-ajustes` | Tarjeta completa: título `Zona de peligro` en `--danger`, descripción del efecto irreversible y botón sólido `--danger`. Va **al final** de la página de ajustes, separada por `--sp-10` de la sección anterior. Su botón abre siempre un `confirm-dialog` (ver `confirm-dialog.md` §2, nivel 2) |
| `en-campo` | Validación de formulario | **No es este componente.** Usa el mensaje de error del campo (`components/ui/field.tsx`), 13px en `--danger` bajo el input. Un alert por campo inválido es desproporcionado |

━━━

## 3. Alert vs. toast — cuál usar

| Situación | Componente | Por qué |
|---|---|---|
| La acción del usuario tuvo éxito | `toast` | Es un acuse de recibo, no información permanente |
| La acción del usuario falló y se puede reintentar ahí mismo | `toast` `error` | El contexto es la acción, no la página |
| Una sección no pudo cargar | **`alert`** | El problema persiste mientras se mira la sección; un mensaje que se va deja una zona vacía inexplicable |
| Un estado del sitio requiere atención (plan, dominio, verificación) | **`alert`** | No es un evento: es una condición |
| Una acción irreversible está disponible | **`alert` `zona-de-peligro`** | Debe estar visible y contextualizada, nunca escondida en un menú |
| Un campo del formulario es inválido | Mensaje de campo | Proporción |

━━━

## 4. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Estático. **Sin animación de entrada** cuando ya está en la página al cargar |
| **Aparición dinámica** | Si aparece por un cambio de estado (falla una recarga), entra con `height` + `opacity` en `--dur-base --ease-out` |
| **Descarte** | Sale con `opacity` + `height → 0` en `--dur-base`; el foco pasa al siguiente elemento interactivo, nunca al `<body>` |
| **Acción en curso** | El botón entra en estado ocupado (spinner + label `Reintentando…`), **ancho fijo** para que no salte |
| **Resuelto** | El alert desaparece solo cuando la condición desaparece. Nunca por temporizador |
| **`prefers-reduced-motion`** | Aparición y descarte instantáneos |

━━━

## 5. Tokens

| Rol | Token |
|---|---|
| Fondo `info` / `exito` / `atencion` / `destructivo` | `--accent-tint` / `--perf-tint` / `--warn-tint` / `--danger-tint` |
| Borde `info` | `--accent-border` |
| Borde resto | `--perf` / `--warn` / `--danger` al 24% (token `--perf-border`, `--warn-border`, `--danger-border` en el contrato) |
| Icono | `--accent` / `--perf` / `--warn` / `--danger` |
| Título | `--fs-body`, `--text-primary` |
| Descripción | `--fs-sm`, `--text-secondary` |
| Enlace en descripción | `--accent`, subrayado |
| Botón secundario | `--surface`, borde `--border-strong`, texto `--text-primary`, `--radius-control` |
| Botón destructivo | `--danger`, texto `--text-on-dark`, `--radius-control` |
| Cerrar ✕ | `--text-tertiary` → `--text-secondary` |
| Radio / padding | `--radius-card` / `--sp-4` (`--sp-3` en `linea`) |
| Gaps | `--sp-3` (icono ↔ texto), `--sp-1` (título ↔ descripción), `--sp-4` (texto ↔ acciones) |
| Separación de la zona de peligro | `--sp-10` |
| Foco | `--focus-ring` |
| Movimiento | `--dur-base`, `--ease-out` |

━━━

## 6. Accesibilidad

- **`role` según cómo aparece**: si el alert **ya está** en la página al cargar (aviso de plan, zona
  de peligro), es un `<section>` normal **sin** `role="alert"` — no hay nada que interrumpir. Si
  aparece **como consecuencia** de una acción o de un fallo, entonces sí:
  `role="alert"` para `destructivo`, `role="status"` para el resto.
- **Nunca `role="alert"` en un alert estático.** Sería un lector de pantalla gritando un aviso
  permanente en cada carga de página.
- **El icono es decorativo** (`aria-hidden`); el canal se comunica con **el texto**. El título de un
  `destructivo` debe empezar por el problema (`No pudimos cargar…`), no por un adjetivo de color.
- **La forma del icono cambia con el canal** (círculo-i / círculo-check / triángulo / círculo-!), de
  modo que los cuatro canales se distinguen en escala de grises. El tinte de fondo, además, es
  distinto en luminancia entre `--warn-tint` y `--danger-tint`.
- **Contraste**: `--text-primary` y `--text-secondary` sobre los tintes cumplen 4.5:1 en ambos temas.
  El borde del canal solo necesita 3:1 y no porta información única. **Nunca** poner texto en el
  color del canal sobre el tinte del canal a 13px sin verificarlo — el par crítico es `--warn` sobre
  `--warn-tint`, por eso la descripción va en `--text-secondary` y no en el color del canal.
- **Descartable**: el ✕ es un `<button>` con `aria-label="Descartar aviso: Tu plan está al 92%"` —
  nunca solo `Cerrar`, porque puede haber varios alerts en la misma página.
- **Zona de peligro**: su título es un encabezado real (`<h2>`/`<h3>`), y el botón destructivo
  describe el efecto (`Eliminar mi sitio`), nunca `Continuar`.
- **Orden de lectura**: el alert va **antes** del contenido que describe en el DOM. Un error de tabla
  puesto después de la tabla se lee cuando ya es tarde.
- **`prefers-contrast: more`**: el borde sube a 2px y el tinte de fondo se sustituye por `--surface`.

━━━

## 7. Marcado de ejemplo

```tsx
// components/admin/alert.tsx
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

const CANAL = {
  info:        { icono: Info,          clases: "bg-[var(--accent-tint)] border-[var(--accent-border)]",
                 iconoColor: "text-[var(--accent)]" },
  exito:       { icono: CheckCircle2,  clases: "bg-[var(--perf-tint)] border-[var(--perf-border)]",
                 iconoColor: "text-[var(--perf)]" },
  atencion:    { icono: AlertTriangle, clases: "bg-[var(--warn-tint)] border-[var(--warn-border)]",
                 iconoColor: "text-[var(--warn)]" },
  destructivo: { icono: AlertCircle,   clases: "bg-[var(--danger-tint)] border-[var(--danger-border)]",
                 iconoColor: "text-[var(--danger)]" },
} as const;

export function Alert({
  canal = "info", titulo, children, acciones, onDescartar, dinamico = false,
}: AlertProps) {
  const c = CANAL[canal];
  const Icono = c.icono;

  // role solo si aparece por un cambio de estado; nunca en un alert estático
  const rol = !dinamico ? undefined : canal === "destructivo" ? "alert" : "status";

  return (
    <section
      role={rol}
      className={`flex gap-[var(--sp-3)] rounded-[var(--radius-card)] border p-[var(--sp-4)] ${c.clases}`}
    >
      <Icono size={18} strokeWidth={2} aria-hidden="true" className={`mt-[2px] shrink-0 ${c.iconoColor}`} />

      <div className="min-w-0 flex-1">
        {titulo && (
          <h3 className="text-[length:var(--fs-body)] font-semibold text-[var(--text-primary)]">
            {titulo}
          </h3>
        )}
        <div className="mt-[var(--sp-1)] text-[length:var(--fs-sm)] leading-[1.5] text-[var(--text-secondary)]">
          {children}
        </div>

        {acciones && (
          <div className="mt-[var(--sp-4)] flex items-center gap-[var(--sp-4)]">
            {acciones}
          </div>
        )}
      </div>

      {onDescartar && (
        <button
          onClick={onDescartar}
          aria-label={`Descartar aviso: ${titulo}`}
          className="relative -mt-[2px] shrink-0 text-[var(--text-tertiary)]
                     after:absolute after:inset-[-13px] after:content-['']
                     hover:text-[var(--text-secondary)]
                     focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]
                     rounded-[var(--radius-input)]"
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
```

Zona de peligro de `09-panel-ajustes`:

```tsx
<Alert canal="destructivo" titulo="Zona de peligro">
  <p>
    Al eliminar tu sitio se borran de forma permanente todas tus entradas, páginas, categorías y
    estadísticas. Esta acción no se puede deshacer.
  </p>
  <div className="mt-[var(--sp-4)]">
    <button
      onClick={abrirConfirmacion}
      className="inline-flex h-8 items-center rounded-[var(--radius-control)] bg-[var(--danger)]
                 px-[var(--sp-4)] text-[length:var(--fs-sm)] font-medium text-[var(--text-on-dark)]
                 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
    >
      Eliminar mi sitio
    </button>
  </div>
</Alert>
```

━━━

## 8. Reglas duras

1. **El alert se queda; el toast se va.** Si el mensaje describe una condición, es alert.
2. **`role="alert"` solo cuando aparece dinámicamente.**
3. **Va antes en el DOM que el contenido que describe.**
4. **Sin barra lateral gruesa.** Tinte + hairline del canal.
5. **La descripción va en `--text-secondary`**, nunca en el color del canal.
6. **Un alert descartable recuerda que lo descartaron.**
7. **La zona de peligro siempre desemboca en un `confirm-dialog` de nivel 2.**
8. **Un campo inválido no es un alert.**
