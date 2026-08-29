# Avatar — retrato de persona

> Identifica a una persona en una fila, en un menú o en un formulario. **Siempre acompañado de un
> nombre en texto salvo en el topbar**, donde el nombre va al lado y el avatar es el ancla del menú
> de usuario.
> Referencias: `02` y `09` (topbar, «María Torres»), `03` y `05` (columna Autor de la tabla),
> `09` (Imagen de perfil en Ajustes → Usuario), `04` (autor de la entrada).

Ruta destino: `components/ui/avatar.tsx` — **ya existe**.

━━━

## 0. Adopción (no reescribir)

`components/ui/avatar.tsx` ya envuelve `Avatar` de `@base-ui/react/avatar` y trae `AvatarImage`,
`AvatarFallback`, `AvatarBadge`, `AvatarGroup` y `AvatarGroupCount`. **Se conserva todo.** Cambios:

1. Ampliar `size` de tres (`sm` 24 · `default` 32 · `lg` 40) a cuatro escalones (§1): se añade `xl`
   de 48px para la Imagen de perfil de `09`.
2. Restilar el anillo: el archivo actual usa `after:border-border` con `mix-blend-darken`. Se
   sustituye por `after:border-[var(--border-hairline)]` **sin `mix-blend`** — la mezcla es una
   solución para paletas de contraste alto y en este sistema oscurece el hairline hasta romperlo.
3. `AvatarFallback`: `bg-muted` → `--surface-sunken`, `text-muted-foreground` → `--text-secondary`.
4. `AvatarBadge`: `bg-primary` → depende del significado del punto (§2.3); no siempre es negro.

Alias implicados: `--border` → `--border-hairline`, `--muted` → `--surface-sunken`,
`--muted-foreground` → `--text-secondary`, `--background` → `--bg-page`. Ver `core/button.md` §0.

━━━

## 1. Anatomía

```
     ╭───────────╮
     │  ▒▒▒▒▒▒▒  │ ●          1 · imagen (o iniciales)
     │  ▒▒▒▒▒▒▒  │             2 · anillo hairline de 1px
     ╰───────────╯             3 · punto de estado (opcional)
```

| # | Parte | Regla |
|---|---|---|
| 1 | **Imagen** | `object-fit: cover`, `aspect-ratio: 1`, `border-radius: var(--radius-pill)`. Siempre circular en personas. Una miniatura cuadrada de contenido **no es un avatar** — es un `thumbnail` con `--radius-thumb`. |
| 2 | **Anillo** | `1px solid var(--border-hairline)` dibujado con `::after` **por dentro** del borde, no con `border`: así el tamaño del avatar no cambia. Existe siempre, incluso sobre fondo blanco: una foto clara sin anillo se derrite en la superficie. |
| 3 | **Punto de estado** *(opcional)* | 8px en `md`, 10px en `lg`/`xl`. Abajo a la derecha, con `ring: 2px solid var(--surface)` para separarlo de la foto. |
| 4 | **Iniciales** *(fallback)* | Máximo 2 caracteres, de las dos primeras palabras del nombre. Mayúsculas, peso 600, color `--text-secondary`, fondo `--surface-sunken`. |

### Tamaños

| `size` | Diámetro | Tipografía de iniciales | Dónde |
|---|---|---|---|
| `xs` | 24px | `--fs-label` (12), peso 600 | Celda de tabla: columna Autor de `03` y `05` |
| `sm` | 32px | `--fs-sm` (13), peso 600 | Listas densas, menús, comentarios |
| `md` *(por defecto)* | 40px | `--fs-body` (14), peso 600 | Topbar (`02`, `09`), cabecera de tarjeta |
| `xl` | 48px | `--fs-h3` (16), peso 600 | Imagen de perfil en Ajustes (`09`) |

No hay un tamaño mayor a 48px: por encima de eso ya no es un avatar, es una foto de perfil y va en
un contenedor propio con `--radius-card`.

━━━

## 2. Variantes

### 2.1 Contenido (en orden de caída, automático)

| Nivel | Se muestra | Cuándo |
|---|---|---|
| 1 | La imagen | `src` presente y cargada |
| 2 | Iniciales | Sin `src`, o la imagen falló, y hay nombre |
| 3 | Icono `User` en `--text-tertiary` | Sin `src` y sin nombre (usuario invitado, autor borrado) |

La caída es responsabilidad de `AvatarFallback` de Base UI y **nunca se hace a mano con
`onError`**: el primitivo ya gestiona el estado de carga y evita el parpadeo de iniciales mientras
la imagen viaja.

### 2.2 `AvatarGroup` — varias personas

Solapamiento de `-8px`, cada avatar con `ring: 2px solid var(--bg-page)` para separarse del de
atrás. Máximo 4 visibles; el resto se resume en `AvatarGroupCount` («+3») con fondo
`--surface-sunken`, texto `--text-secondary` y `tabular-nums`.

### 2.3 `AvatarBadge` — el punto de estado

| Significado | Color | Ejemplo |
|---|---|---|
| En línea / activo | `--perf` | Sesiones activas (`09`) |
| Notificación pendiente | `--accent` | El punto del topbar (`02`) |
| Requiere atención | `--warn` | Invitación sin aceptar |

**No hay un punto negro.** El negro es la acción del usuario, y un punto no es una acción.

━━━

## 3. Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Imagen + anillo. Sin sombra. |
| **Cargando la imagen** | Fondo `--surface-sunken` sólido, **sin shimmer**: el avatar es demasiado pequeño para que un `skeleton` animado se lea como otra cosa que un parpadeo. |
| **Imagen rota** | Cae a iniciales sin salto de layout: el hueco ya tenía el tamaño final. |
| **Interactivo** (ancla de menú o enlace) | Es un `<button>` o un `<a>` que **envuelve** al avatar. Hover: el anillo sube a `--border-strong`. Foco: `box-shadow: var(--focus-ring)` en el contenedor, con `border-radius: var(--radius-pill)` para que el anillo de foco sea redondo. |
| **No interactivo** | Sin hover, sin cursor `pointer`, sin `tabindex`. La mayoría de los avatares del producto son de esta clase. |
| **Deshabilitado** | No existe. Un avatar no se deshabilita; lo que se deshabilita es el control que lo envuelve. |

Transiciones: solo `border-color` y `box-shadow`, `--dur-fast`.

━━━

## 4. Tokens

| Rol | Token |
|---|---|
| Radio | `--radius-pill` (siempre circular) |
| Anillo | `--border-hairline` → `--border-strong` en hover interactivo |
| Fondo del fallback | `--surface-sunken` |
| Texto de las iniciales | `--text-secondary` |
| Icono `User` de último recurso | `--text-tertiary` |
| Separación en grupo | `ring: 2px solid var(--bg-page)` (sobre tarjeta: `--surface`) |
| Punto de estado | `--perf` · `--accent` · `--warn`, con `ring: 2px solid var(--surface)` |
| Contador `+N` | fondo `--surface-sunken`, texto `--text-secondary`, `tabular-nums` |
| Foco | `--focus-ring` |
| Duración / curva | `--dur-fast` / `--ease-out` |
| Sombra | **ninguna** |

**Tinte determinista de iniciales** *(opcional)*: el fondo puede tomar `--cat-N` derivado del id del
usuario (`hash(id) % 8 + 1`) en lugar de `--surface-sunken`. Es legítimo porque `--cat-*` etiqueta
contenido, no marca — el color no dice nada de la persona, solo la hace distinguible en una lista.
Si se activa, se activa en todo el producto: media docena de avatares tintados y media docena grises
en la misma tabla se ve como un error.

**Modo oscuro**: sin reglas propias.

━━━

## 5. Accesibilidad

- **La imagen es decorativa cuando el nombre está al lado**: `alt=""`. En el topbar de `02` el
  nombre «María Torres» ya está en texto — un `alt="María Torres"` haría que el lector de pantalla
  lo diga dos veces.
- **Cuando el avatar va solo** (columna Autor de `03` sin nombre visible), lleva
  `alt="Foto de María Torres"`. Un avatar sin nombre visible y sin `alt` es una fila sin autor para
  quien no ve.
- **Las iniciales no se leen.** El bloque de iniciales va con `aria-hidden="true"` y el nombre
  accesible lo aporta el contenedor: «MT» leído en voz alta no es un nombre.
- **El punto de estado necesita texto.** `<span class="sr-only">En línea</span>` junto al punto. El
  color por sí solo no informa.
- **Contraste**: `--text-secondary` sobre `--surface-sunken` ≈ 4.6:1 — cumple para las iniciales a
  partir de `xs` (12px peso 600). Por debajo de 12px no se usan iniciales, se usa el icono.
- **Zona táctil**: `xs` (24px) y `sm` (32px) están por debajo de `--touch-target`. Si son
  interactivos, la zona activa la pone el contenedor (la fila entera, el botón del menú), nunca el
  avatar solo.
- **El anillo de foco es redondo**: un `--focus-ring` cuadrado alrededor de un círculo se lee como
  un fallo de render.

━━━

## 6. Marcado de ejemplo

```tsx
// components/ui/avatar.tsx — el Root restilado (Base UI se conserva intacto)
function Avatar({ className, size = "md", ...props }: AvatarPrimitive.Root.Props & {
  size?: "xs" | "sm" | "md" | "xl"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex shrink-0 select-none rounded-[var(--radius-pill)]",
        // el anillo va por dentro: el diámetro no cambia
        "after:absolute after:inset-0 after:rounded-[var(--radius-pill)]",
        "after:border after:border-[var(--border-hairline)]",
        "data-[size=xs]:size-6 data-[size=sm]:size-8 data-[size=md]:size-10 data-[size=xl]:size-12",
        className,
      )}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      aria-hidden="true"
      className={cn(
        "flex size-full items-center justify-center rounded-[var(--radius-pill)]",
        "bg-[var(--surface-sunken)] font-semibold text-[var(--text-secondary)]",
        "group-data-[size=xs]/avatar:text-[length:var(--fs-label)]",
        "group-data-[size=sm]/avatar:text-[length:var(--fs-sm)]",
        "group-data-[size=md]/avatar:text-[length:var(--fs-body)]",
        "group-data-[size=xl]/avatar:text-[length:var(--fs-h3)]",
        className,
      )}
      {...props}
    />
  )
}
```

```tsx
// 02 · topbar — el avatar ancla el menú de usuario y el nombre ya está en texto
<DropdownMenuTrigger
  render={
    <button
      type="button"
      className="flex items-center gap-[var(--sp-2)] rounded-[var(--radius-pill)] outline-none focus-visible:shadow-[var(--focus-ring)]"
    >
      <Avatar size="md">
        <AvatarImage src={usuario.foto} alt="" />
        <AvatarFallback>{iniciales(usuario.nombre)}</AvatarFallback>
      </Avatar>
      <span className="text-[length:var(--fs-body)] font-medium">{usuario.nombre}</span>
      <ChevronDown size={16} aria-hidden="true" className="text-[var(--text-tertiary)]" />
    </button>
  }
/>

// 03 · columna Autor — el avatar va solo, así que sí describe
<Avatar size="xs">
  <AvatarImage src={autor.foto} alt={`Foto de ${autor.nombre}`} />
  <AvatarFallback>{iniciales(autor.nombre)}</AvatarFallback>
</Avatar>
```

━━━

## 7. Reglas duras

1. **Siempre circular.** Una miniatura cuadrada es un `thumbnail` con `--radius-thumb`, no un
   avatar.
2. **Anillo hairline siempre**, incluso sobre blanco.
3. **El anillo va por dentro** (`::after`), nunca con `border`: el diámetro es sagrado porque las
   filas de una tabla se alinean con él.
4. **`alt=""` cuando el nombre está visible al lado; `alt` descriptivo cuando el avatar va solo.**
5. **Las iniciales son `aria-hidden`.**
6. **Sin sombra y sin punto negro.**
7. **Cuatro tamaños y ni uno más.** Un avatar de 36px «solo para esta pantalla» desalinea la tabla
   entera.
