# Confirm Dialog — confirmación de acción destructiva

> El diálogo que se interpone entre el usuario y una pérdida. En las pantallas hay dos disparadores
> claros: `Mover a la papelera` (`04-panel-editor-de-entrada`, botón de contorno rojo en el sidebar
> de publicación) y `Eliminar mi sitio` (`09-panel-ajustes`, zona de peligro).
>
> **La tesis del componente: no todo destructivo merece un diálogo.** Un diálogo delante de una
> acción reversible entrena al usuario a pulsar `Confirmar` sin leer — y entonces, el día que
> aparece el diálogo que sí importaba, tampoco lo lee. La fricción se **reserva** para lo irreversible.

Ruta destino: `components/admin/confirm-dialog.tsx` — el primitivo
`components/ui/alert-dialog.tsx` (shadcn) ya existe y es la base.

━━━

## 1. Anatomía

```
                ┌────────────────────────────────────────────────┐
                │  ┌────┐                                        │
                │  │ 🗑 │                                        │ ← icono en cuadro tintado
                │  └────┘                                        │
                │                                                │
                │  ¿Eliminar la categoría «SEO»?                 │ ← título: pregunta con el objeto
                │                                                │
                │  Las 18 entradas de esta categoría quedarán    │ ← consecuencia concreta
                │  sin categorizar. Esta acción no se puede      │
                │  deshacer.                                     │
                │                                                │
                │                    ┌─────────┐ ┌─────────────┐ │
                │                    │ Cancelar│ │  Eliminar   │ │ ← verbo real, no "Aceptar"
                │                    └─────────┘ └─────────────┘ │
                └────────────────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Overlay** | `rgba(10,10,10,.40)` en claro / `.60` en oscuro (token `--overlay` en el contrato). Entra con `opacity` en `--dur-base`. Sin `backdrop-filter`: cuesta caro y el sistema no usa desenfoque en ninguna parte |
| 2 | **Panel** | `--surface`, `--radius-card`, `--shadow-float`, borde 1px `--border-hairline`, padding `--sp-6`, ancho **440px** (`max-width: calc(100vw - var(--sp-8))`) |
| 3 | **Icono** | Cuadro 40×40, `--radius-control`, fondo `--danger-tint`, icono lucide 20px `--danger`. Un icono **del dominio** (`Trash2`, `Archive`, `AlertOctagon`), no un genérico |
| 4 | **Título** | `--fs-h3` (16), peso 600, `--text-primary`. **Pregunta que nombra el objeto**: `¿Mover «El futuro del trabajo» a la papelera?`. Nunca `¿Estás seguro?` — no dice qué se va a perder |
| 5 | **Consecuencia** | `--fs-body` (14/1.55), `--text-secondary`. **Lo más importante del diálogo.** Dice el efecto en números concretos (`Las 18 entradas quedarán sin categorizar`) y si es reversible (`Podrás restaurarla durante 30 días`) o no (`Esta acción no se puede deshacer`) |
| 6 | **Confirmación tipeada** | Solo nivel 2 (§2). Input `--radius-input` con label `Escribe «mi-blog» para confirmar` |
| 7 | **Acciones** | A la derecha, `--sp-3` entre ellas. `Cancelar`: `--surface` + borde `--border-strong` + texto `--text-primary`. Destructiva: sólido `--danger` + `--text-on-dark`. Ambas 40px de alto, `--radius-control` |

**El botón destructivo lleva el verbo real de la acción**: `Mover a la papelera`, `Eliminar mi
sitio`, `Vaciar papelera`. Nunca `Aceptar`, `Confirmar` ni `Continuar`. Alguien que solo lee los dos
botones tiene que poder decidir bien.

━━━

## 2. Los dos niveles — la decisión importante

| | **Nivel 0 — reversible** | **Nivel 1 — costoso** | **Nivel 2 — irreversible** |
|---|---|---|---|
| **Ejemplos** | `Mover a la papelera` (30 días de gracia), reordenar, quitar una etiqueta | Despublicar una entrada con tráfico, eliminar una categoría con 18 entradas, cancelar una programación | `Vaciar la papelera`, `Eliminar mi sitio`, revocar el acceso de un colaborador |
| **Interfaz** | **Sin diálogo.** Se ejecuta con salida optimista + `toast.conDeshacer` de 8 s | Diálogo estándar (§1) | Diálogo + **confirmación tipeada** |
| **Foco inicial** | — | `Cancelar` | Input de confirmación |
| **Cerrar con clic fuera** | — | Sí | **No** |
| **`Esc`** | — | Cancela | Cancela |
| **Botón destructivo** | — | Activo | **Deshabilitado hasta que el texto coincida exactamente** |

### 2.1 `Mover a la papelera` es nivel 0

Las pantallas muestran el botón `Mover a la papelera` en el sidebar del editor con contorno rojo. Es
una acción **reversible**: la entrada va a la pestaña `Papelera` y se puede restaurar. Por tanto
**no lleva diálogo**: se ejecuta, la vista vuelve a la lista de entradas y aparece
`Movida a la papelera · Deshacer` durante 8 s (ver `toast.md` §2).

> Esto no es relajar la seguridad, es concentrarla. Quien mueve algo a la papelera tiene **dos**
> vías de recuperación (el `Deshacer` inmediato y la papelera durante 30 días); quien vacía la
> papelera no tiene ninguna, y por eso ese sí es el momento de frenar. Si `Mover a la papelera`
> tuviera diálogo, el diálogo de `Vaciar papelera` se vería igual y se cerraría con el mismo
> automatismo.

Excepción configurable: si el usuario activa `Pedir confirmación antes de mover a la papelera` en
Ajustes, la acción sube a nivel 1. Es una preferencia, no el comportamiento por defecto.

### 2.2 Nivel 2 — confirmación tipeada

El usuario escribe el **nombre del objeto** (el dominio del blog, el nombre de la categoría) en un
input. Coincidencia exacta, sin distinguir mayúsculas ni espacios sobrantes. Mientras no coincida, el
botón destructivo está `disabled` con `opacity: .5`.

No es burocracia: obliga a **leer el nombre del objeto**, que es exactamente el error que se quiere
evitar (borrar el sitio equivocado desde el blog equivocado).

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Entrada** | Overlay `opacity 0 → 1`; panel `opacity 0 + scale(.98) + translateY(4px)` → normal, en `--dur-base --ease-out` |
| **Salida** | Inverso, en `--dur-fast` (salir debe sentirse más rápido que entrar) |
| **Foco inicial** | Nivel 1: `Cancelar`. Nivel 2: el input. **Jamás el botón destructivo** — un `Enter` reflejo no puede borrar un sitio |
| **Trampa de foco** | El `Tab` circula solo dentro del diálogo mientras está abierto |
| **Ejecutando** | El botón destructivo entra en estado ocupado (spinner + `Eliminando…`), **ancho fijo**; `Cancelar` se deshabilita; `Esc` y el clic fuera dejan de cerrar. Una operación de borrado a medias no se puede abandonar |
| **Éxito** | El diálogo se cierra, la vista se actualiza y aparece un `toast` con el resultado (`Sitio eliminado`, `Papelera vaciada · 12 entradas`) |
| **Error** | El diálogo **permanece abierto** y muestra un `alert` `destructivo` en línea sobre las acciones, con el motivo. Cerrar el diálogo y mostrar un toast de error deja al usuario sin saber si algo se borró a medias |
| **Nivel 2 sin coincidencia** | Botón `disabled`, `opacity: .5`, `cursor: not-allowed`. Sin mensaje de error mientras el usuario escribe: no es un fallo, es un requisito aún no cumplido |
| **`prefers-reduced-motion`** | Sin escala ni desplazamiento; solo `opacity` |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Overlay | `--overlay` (`rgba(10,10,10,.40)` claro / `.60` oscuro — añadir al contrato) |
| Panel | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-float`, `--sp-6` |
| Ancho | 440px |
| Cuadro de icono | `--danger-tint` / icono `--danger`, `--radius-control` |
| Título | `--fs-h3`, `--text-primary` |
| Consecuencia | `--fs-body`, `--text-secondary` |
| Input de confirmación | `--radius-input`, borde `--border-strong`, foco `--focus-ring` |
| Label del input | `--fs-sm`, `--text-secondary` |
| Botón `Cancelar` | `--surface`, borde `--border-strong`, `--text-primary`, `--radius-control` |
| Botón destructivo | `--danger` → hover más oscuro, texto `--text-on-dark`, `--radius-control` |
| Alert de error en línea | Tokens de `alert` `destructivo` |
| Gaps | `--sp-4` (icono ↔ título), `--sp-2` (título ↔ consecuencia), `--sp-6` (texto ↔ acciones), `--sp-3` (entre botones) |
| Foco | `--focus-ring` |
| Movimiento | `--dur-base` (entrada), `--dur-fast` (salida), `--ease-out` |

**Excepción de color deliberada**: es el único lugar del sistema donde un botón sólido **no** es
negro `--action`. El CTA primario de Cuaderno es negro porque representa la acción del usuario; aquí
el rojo advierte de que esa acción destruye. La jerarquía se mantiene: `Cancelar` es la salida
tranquila y visualmente más ligera, el rojo es la que hay que querer pulsar.

━━━

## 5. Accesibilidad

- **`role="alertdialog"`**, no `dialog`: comunica que hay una consecuencia. Con `aria-modal="true"`,
  `aria-labelledby` → id del título y `aria-describedby` → id de la consecuencia. El lector de
  pantalla anuncia **el objeto y el efecto** al abrirse, que es justo lo que hay que saber.
- **El foco entra en el diálogo al abrirse** y **vuelve al elemento disparador al cerrarse**. Si el
  disparador ya no existe (la fila que se borró), el foco pasa a un punto estable: el encabezado de
  la lista o el CTA del `empty-state`. **Nunca al `<body>`.**
- **El foco inicial nunca es el botón destructivo.** Un lector de pantalla que abre el diálogo y
  pulsa `Enter` por reflejo no puede borrar un sitio.
- **`Esc` cancela siempre** (salvo mientras se ejecuta la operación).
- **El clic fuera no cierra en nivel 2.** Un clic accidental fuera no debe ser la vía para escapar de
  un diálogo cuyo `Cancelar` es explícito — y tampoco puede desestimar sin querer una decisión
  importante en la que ya se escribió medio nombre.
- **El botón dice el verbo**: `aria-label` no hace falta si el texto visible ya es
  `Eliminar mi sitio`. El antipatrón es un botón `Aceptar` con `aria-label="Eliminar sitio"`: lo que
  se ve y lo que se oye deben coincidir.
- **La consecuencia va en números**: `Las 18 entradas de esta categoría quedarán sin categorizar`.
  Quien navega con lector de pantalla no puede mirar la tabla de fondo para estimar el daño.
- **La reversibilidad se dice explícitamente**, en una frase final: `Podrás restaurarla durante 30
  días` o `Esta acción no se puede deshacer`. Es la información que decide.
- **El input de nivel 2** tiene `<label>` visible asociado, `autocomplete="off"`,
  `spellcheck="false"` y **no** `autofocus` en móvil (el teclado tapando el diálogo desorienta; se
  enfoca tras la animación de entrada).
- **El estado deshabilitado del botón se explica**: `aria-describedby` apunta al label del input, de
  modo que el lector diga por qué no se puede pulsar todavía.
- **Contraste**: `--text-on-dark` sobre `--danger` supera 4.5:1; el borde `--border-strong` de
  `Cancelar` supera 3:1. El cuadro de icono es decorativo (`aria-hidden`).
- **Zona táctil**: ambos botones miden 40px de alto y alcanzan `--touch-target` en móvil, donde el
  diálogo pasa a ancho completo con las acciones **apiladas** — `Cancelar` **abajo**, para que el
  pulgar no encuentre primero el botón destructivo.
- **`prefers-reduced-motion`**: solo `opacity`.

━━━

## 6. Marcado de ejemplo

```tsx
// components/admin/confirm-dialog.tsx
import * as AlertDialog from "@/components/ui/alert-dialog";

export function ConfirmDialog({
  abierto, onOpenChange, icono: Icono, titulo, consecuencia, reversibilidad,
  verbo, onConfirmar, nivel = 1, textoRequerido,
}: ConfirmDialogProps) {
  const [texto, setTexto] = useState("");
  const [ejecutando, setEjecutando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coincide = nivel === 1 ||
    texto.trim().toLowerCase() === (textoRequerido ?? "").trim().toLowerCase();

  return (
    <AlertDialog.Root
      open={abierto}
      onOpenChange={ejecutando ? undefined : onOpenChange}   // no se abandona a medias
    >
      <AlertDialog.Overlay
        className="fixed inset-0 bg-[var(--overlay)]
                   data-[state=open]:animate-[fundido_var(--dur-base)_var(--ease-out)]" />

      <AlertDialog.Content
        role="alertdialog"
        onPointerDownOutside={(e) => { if (nivel === 2) e.preventDefault(); }}
        className="fixed left-1/2 top-1/2 w-[440px] max-w-[calc(100vw-var(--sp-8))]
                   -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)]
                   border border-[var(--border-hairline)] bg-[var(--surface)]
                   p-[var(--sp-6)] shadow-[var(--shadow-float)]
                   motion-reduce:transition-none"
      >
        <span aria-hidden="true"
              className="grid size-10 place-items-center rounded-[var(--radius-control)]
                         bg-[var(--danger-tint)] text-[var(--danger)]">
          <Icono size={20} strokeWidth={1.75} />
        </span>

        <AlertDialog.Title
          className="mt-[var(--sp-4)] text-[length:var(--fs-h3)] font-semibold text-[var(--text-primary)]">
          {titulo}
        </AlertDialog.Title>

        <AlertDialog.Description
          className="mt-[var(--sp-2)] text-[length:var(--fs-body)] leading-[1.55] text-[var(--text-secondary)]">
          {consecuencia} {reversibilidad}
        </AlertDialog.Description>

        {nivel === 2 && (
          <div className="mt-[var(--sp-5)]">
            <label htmlFor="confirmar-texto" id="confirmar-label"
                   className="block text-[length:var(--fs-sm)] text-[var(--text-secondary)]">
              Escribe «{textoRequerido}» para confirmar
            </label>
            <input
              id="confirmar-texto" value={texto} onChange={(e) => setTexto(e.target.value)}
              autoComplete="off" spellCheck={false}
              className="mt-[var(--sp-2)] h-10 w-full rounded-[var(--radius-input)]
                         border border-[var(--border-strong)] bg-[var(--surface)]
                         px-[var(--sp-3)] text-[length:var(--fs-body)] text-[var(--text-primary)]
                         focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            />
          </div>
        )}

        {/* el error se queda DENTRO del diálogo: cerrarlo dejaría al usuario sin saber qué pasó */}
        {error && <Alert canal="destructivo" dinamico className="mt-[var(--sp-4)]">{error}</Alert>}

        <div className="mt-[var(--sp-6)] flex flex-col-reverse gap-[var(--sp-3)]
                        sm:flex-row sm:justify-end">
          <AlertDialog.Cancel
            disabled={ejecutando}
            className="h-10 rounded-[var(--radius-control)] border border-[var(--border-strong)]
                       bg-[var(--surface)] px-[var(--sp-4)] text-[length:var(--fs-body)]
                       font-medium text-[var(--text-primary)]
                       focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            Cancelar
          </AlertDialog.Cancel>

          <AlertDialog.Action
            disabled={!coincide || ejecutando}
            aria-describedby={nivel === 2 ? "confirmar-label" : undefined}
            onClick={async (e) => {
              e.preventDefault();
              setEjecutando(true); setError(null);
              try { await onConfirmar(); onOpenChange(false); }
              catch (err) { setError(mensajeLlano(err)); }
              finally { setEjecutando(false); }
            }}
            className="h-10 min-w-[160px] rounded-[var(--radius-control)] bg-[var(--danger)]
                       px-[var(--sp-4)] text-[length:var(--fs-body)] font-medium
                       text-[var(--text-on-dark)] disabled:opacity-50
                       focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            {ejecutando ? "Eliminando…" : verbo}
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
```

Nivel 0 — **sin diálogo**, el patrón por defecto de `Mover a la papelera`:

```tsx
async function moverAPapelera(entrada: Entrada) {
  await api.entradas.papelera(entrada.id);
  router.push("/panel/entradas");
  toast.conDeshacer(
    "Movida a la papelera",
    () => api.entradas.restaurar(entrada.id),
    { descripcion: `«${entrada.titulo}» se puede restaurar durante 30 días.` },
  );
}
```

Nivel 2 — `Eliminar mi sitio` desde la zona de peligro de `09-panel-ajustes`:

```tsx
<ConfirmDialog
  nivel={2}
  icono={AlertOctagon}
  titulo="¿Eliminar «Mi blog»?"
  consecuencia="Se borrarán de forma permanente 24 entradas, 8 páginas, 11 categorías y todas tus estadísticas."
  reversibilidad="Esta acción no se puede deshacer."
  textoRequerido="miblog.cuaderno.com"
  verbo="Eliminar mi sitio"
  onConfirmar={() => api.sitio.eliminar()}
/>
```

━━━

## 7. Reglas duras

1. **Reversible → sin diálogo.** Ejecutar + `Deshacer`. La fricción se reserva para lo irreversible.
2. **El título nombra el objeto.** `¿Estás seguro?` está prohibido.
3. **La consecuencia va en números concretos y dice si hay vuelta atrás.**
4. **El botón lleva el verbo real**, nunca `Aceptar`.
5. **El foco inicial nunca es el botón destructivo.**
6. **El error se queda dentro del diálogo.**
7. **En móvil, `Cancelar` va abajo**, lejos del pulgar que busca confirmar.
8. **Nivel 2: sin cierre por clic fuera y con confirmación tipeada.**
