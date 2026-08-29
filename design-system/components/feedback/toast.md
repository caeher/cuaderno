# Toast — notificación efímera

> El acuse de recibo del sistema: `Entrada publicada`, `Orden actualizado`, `Movida a la papelera ·
> Deshacer`. Aparece, informa, y se va sin que nadie tenga que ocuparse de él.
>
> Es también la **red de seguridad de las acciones reversibles**: el par toast + `Deshacer` es lo que
> permite que `Mover a la papelera` no necesite un diálogo de confirmación (ver
> `confirm-dialog.md` §2).

Ruta destino: `components/ui/sonner.tsx` (ya existe) + `lib/toast.ts` con la API de dominio.
Librería: **sonner** — ya está en `package.json`, ya está montada. No hay decisión que tomar aquí.

━━━

## 1. Anatomía

```
                                   ┌───────────────────────────────────────┐
                                   │ ✓  Entrada publicada                  │
                                   │    «El futuro del trabajo» ya está     │
                                   │    en tu blog.                        │
                                   │                        Ver entrada  ✕ │
                                   └───────────────────────────────────────┘
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Contenedor** | `--surface`, borde 1px `--border-hairline`, `--radius-card`, `--shadow-float`, padding `--sp-4`. Ancho **380px** (máx. `calc(100vw - var(--sp-8))` en móvil) |
| 2 | **Icono** | 18px, `stroke-width: 2`, en el color del canal, alineado con la primera línea del título. Sin círculo tintado: el toast ya es una superficie pequeña, un círculo dentro lo satura |
| 3 | **Título** | `--fs-body` (14), peso 600, `--text-primary`. Una línea. **En pasado y sin signos de exclamación**: `Entrada publicada`, no `¡Publicado con éxito!` |
| 4 | **Descripción** | Opcional. `--fs-sm` (13), `--text-secondary`, máx. 2 líneas. Nombra el objeto entre comillas angulares |
| 5 | **Acción** | Opcional, máx. **una**. Botón de texto `--fs-sm` peso 600 en `--accent`, alineado a la derecha. `Deshacer`, `Ver entrada`, `Reintentar` |
| 6 | **Cerrar ✕** | 16px `--text-tertiary`, esquina superior derecha. Visible siempre en `error` y en toasts persistentes; en el resto aparece en hover |
| 7 | **Barra de tiempo** | 2px en la base, del color del canal al 40%, que se consume durante la vida del toast. Solo si hay auto-cierre. Se **congela** al pasar el ratón por encima |

**Posición**: esquina **inferior derecha**, offset `--sp-6` (24px). En móvil (<640px): abajo, ancho
completo menos `--sp-4` a cada lado.

> Por qué abajo a la derecha y no arriba al centro: en `04-panel-editor-de-entrada` la zona superior
> la ocupan el título, la barra de TipTap y los botones `Vista previa` / `Publicar`; un toast arriba
> taparía justo el control que el usuario acaba de pulsar. Abajo a la derecha solo compite con el
> contador de palabras, que es informativo y no interactivo.

**Apilado**: máximo **3** visibles, el más nuevo abajo; los anteriores se desplazan hacia arriba con
`translateY` en `--dur-base --ease-out` y escalan a `0.96` con `opacity: .85`. El cuarto entra y el
más viejo sale.

━━━

## 2. Variantes

| Variante | Icono | Canal | Duración | Uso |
|---|---|---|---|---|
| `exito` | `CheckCircle2` | `--perf` | **4 s** | `Entrada publicada`, `Cambios guardados`, `Categoría creada` |
| `error` | `AlertCircle` | `--danger` | **persistente** | `No pudimos publicar la entrada`. Siempre con acción `Reintentar` y con ✕ visible |
| `info` | `Info` | `--neutral` | **5 s** | `Orden actualizado`, `Enlace copiado` |
| `atencion` | `AlertTriangle` | `--warn` | **6 s** | `Tu plan está al 92% de su límite` |
| `ia` | `Sparkles` (destello) | `--accent` | **5 s** | `Sugerencia aplicada`, `Texto generado`. El icono es el mismo destello ✦ del sidebar y del editor |
| `cargando` | `Loader2` girando | `--text-tertiary` | hasta resolverse | `Publicando entrada…`. **Se transforma** en `exito` o `error` en su sitio, sin desaparecer y reaparecer |
| `deshacer` | `Trash2` (u otro del dominio) | `--neutral` | **8 s** | `Movida a la papelera` + acción `Deshacer`. Duración larga a propósito: es la ventana real para arrepentirse |

**El canal del icono es lo único que se colorea.** Fondo, borde y texto son siempre neutros. Un toast
con fondo verde entero es un banner disfrazado y compite con el contenido — el sistema se sostiene
con hairline y aire, también aquí.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Entrada** | `translateY(12px) + opacity 0` → `0 + 1` en `--dur-base --ease-out` |
| **Salida** | `translateX(24px) + opacity 0` en `--dur-base --ease-out` |
| **Hover** | El temporizador **se pausa** y la barra de tiempo se congela. El ✕ aparece |
| **Foco dentro** | El temporizador se pausa mientras haya foco dentro del toast (llegar con teclado a `Deshacer` no debe ser una carrera) |
| **Pestaña oculta** | El temporizador se pausa: un toast no puede expirar mientras nadie lo mira |
| **`cargando` → resuelto** | El icono hace crossfade en `--dur-fast`, el título se sustituye y arranca el temporizador. El toast **no** se mueve de sitio |
| **Acción pulsada** | El toast se cierra inmediatamente, salvo que la acción abra un diálogo (entonces se cierra al abrirse este) |
| **`prefers-reduced-motion`** | Sin desplazamientos: solo `opacity`. La barra de tiempo se sustituye por un contador estático que no anima |

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Contenedor | `--surface`, `--border-hairline`, `--radius-card`, `--shadow-float`, `--sp-4` |
| Título | `--fs-body`, `--text-primary` |
| Descripción | `--fs-sm`, `--text-secondary` |
| Acción | `--fs-sm`, `--accent` → `--accent-hover` |
| Cerrar ✕ | `--text-tertiary` → `--text-secondary` |
| Icono `exito` | `--perf` |
| Icono `error` | `--danger` |
| Icono `atencion` | `--warn` |
| Icono `info` / `deshacer` | `--neutral` |
| Icono `ia` | `--accent` |
| Icono `cargando` | `--text-tertiary` |
| Barra de tiempo | color del canal al 40% de opacidad |
| Offset desde el borde | `--sp-6` |
| Ancho | 380px |
| Foco | `--focus-ring` |
| Movimiento | `--dur-base` (entrada/salida), `--dur-fast` (crossfade), `--ease-out` |

━━━

## 5. Accesibilidad

- **`role` según urgencia**: `exito`, `info`, `ia` y `deshacer` usan `role="status"` +
  `aria-live="polite"` — se anuncian cuando el lector termina lo que está diciendo. `error` y
  `atencion` usan `role="alert"` + `aria-live="assertive"`, que **interrumpe**. Ese privilegio es
  solo para lo que el usuario tiene que saber ya.
- **La región de toasts existe desde el arranque** (un contenedor vacío con `aria-live` en el
  layout). Si se inserta el contenedor y el mensaje a la vez, muchos lectores no anuncian nada.
- **Un toast con acción no puede auto-cerrarse rápido.** `deshacer` dura 8 s justamente porque
  alguien navegando con teclado necesita `Tab` hasta él. Regla: **cualquier toast con acción dura
  ≥ 6 s**, y se pausa con el foco dentro.
- **El toast nunca roba el foco.** Se llega a él con `Tab` (sonner lo inserta en el orden de
  tabulación al final del documento) o con el atajo `F6`.
- **`Esc` cierra el toast enfocado**; nunca cierra todos a la vez.
- **La acción crítica jamás vive solo en el toast.** `Deshacer` debe existir además como camino
  permanente: la entrada está en la papelera y se puede restaurar desde ahí durante 30 días. Un
  usuario que no llega a tiempo al toast no puede perder trabajo.
- **El color no es el mensaje**: el icono cambia de forma con la variante (check / triángulo /
  círculo-i / destello) y el **título dice qué pasó**. Un toast leído en escala de grises informa
  igual.
- **Contraste**: texto y borde son neutros del sistema y cumplen 4.5:1 sobre `--surface`. El icono
  coloreado solo necesita 3:1 y no porta información única.
- **Zona táctil**: ✕ y acción alcanzan `--touch-target` con padding invisible.
- **Nunca más de 3 a la vez.** Cuatro `role="status"` seguidos son un lector de pantalla hablando
  encima de sí mismo. Si una operación masiva genera N resultados, se emite **un** toast agregado:
  `3 entradas movidas a la papelera` con un solo `Deshacer`.

━━━

## 6. Marcado de ejemplo

```tsx
// app/layout.tsx — la región vive desde el arranque
import { Toaster } from "@/components/ui/sonner";

<Toaster
  position="bottom-right"
  offset={24}
  gap={12}
  visibleToasts={3}
  toastOptions={{
    unstyled: true,
    classNames: {
      toast: `flex w-[380px] max-w-[calc(100vw-var(--sp-8))] items-start gap-[var(--sp-3)]
              rounded-[var(--radius-card)] border border-[var(--border-hairline)]
              bg-[var(--surface)] p-[var(--sp-4)] shadow-[var(--shadow-float)]`,
      title: "text-[length:var(--fs-body)] font-semibold text-[var(--text-primary)]",
      description: "mt-[var(--sp-1)] text-[length:var(--fs-sm)] text-[var(--text-secondary)]",
      actionButton: `ml-auto rounded-[var(--radius-input)] text-[length:var(--fs-sm)] font-semibold
                     text-[var(--accent)] hover:text-[var(--accent-hover)]
                     focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]`,
      closeButton: "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
    },
  }}
/>
```

```ts
// lib/toast.ts — API de dominio: las pantallas no llaman a sonner directamente
import { toast as sonner } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Sparkles, Trash2 } from "lucide-react";

export const toast = {
  exito: (titulo: string, o?: Opciones) =>
    sonner.custom((id) => <Toast id={id} icono={CheckCircle2} canal="--perf" titulo={titulo} {...o} />,
      { duration: o?.accion ? 6000 : 4000 }),

  error: (titulo: string, o?: Opciones) =>
    sonner.custom((id) => <Toast id={id} icono={AlertCircle} canal="--danger" titulo={titulo}
                                 role="alert" cerrarVisible {...o} />,
      { duration: Infinity }),

  ia: (titulo: string, o?: Opciones) =>
    sonner.custom((id) => <Toast id={id} icono={Sparkles} canal="--accent" titulo={titulo} {...o} />,
      { duration: 5000 }),

  /** el par que sustituye al diálogo de confirmación en acciones reversibles */
  conDeshacer: (titulo: string, deshacer: () => void, o?: Opciones) =>
    sonner.custom((id) => (
      <Toast id={id} icono={Trash2} canal="--neutral" titulo={titulo}
             accion={{ texto: "Deshacer", onClick: deshacer }} {...o} />
    ), { duration: 8000 }),
};
```

Uso desde la tabla — la acción se ejecuta ya, con salida optimista, y el toast da la marcha atrás:

```tsx
async function moverAPapelera(entrada: Entrada) {
  await api.entradas.papelera(entrada.id);           // reversible durante 30 días
  toast.conDeshacer(
    "Movida a la papelera",
    () => api.entradas.restaurar(entrada.id),
    { descripcion: `«${entrada.titulo}» se puede restaurar desde la papelera.` },
  );
}
```

━━━

## 7. Reglas duras

1. **Superficie neutra, icono con canal.** Nunca un toast con fondo de color entero.
2. **Máximo 3 visibles; operaciones masivas emiten un toast agregado.**
3. **Con acción → mínimo 6 s y pausa con el foco dentro.**
4. **`error` es persistente y siempre trae `Reintentar`.**
5. **Nunca roba el foco.**
6. **`Deshacer` en el toast nunca es la única salida.**
7. **Copy en pasado, sin exclamaciones, nombrando el objeto.**
