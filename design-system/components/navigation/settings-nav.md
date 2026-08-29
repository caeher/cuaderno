# Settings nav — navegación vertical de Ajustes

> **Fuente:** `09-panel-ajustes.png`, columna izquierda del contenido.
> **Las pantallas mandan:** el índice del README habla de 12 secciones; en la pantalla se leen **11**.
> La lista canónica es la de la pantalla (§ 3) y el componente acepta N secciones sin cambio de piel.

━━━

## 1. Propósito

Segundo nivel de navegación, exclusivo de Ajustes. Es el único caso del panel donde una sección del
sidebar se subdivide, y se resuelve con una **columna vertical dentro del contenido**, no con tabs
horizontales: son 11 destinos y no caben en una fila sin scroll.

Reutiliza literalmente el lenguaje del item de sidebar — icono + etiqueta, pill `--accent-tint` con
texto `--accent` en el activo — porque es la misma clase de gesto: **navegar**. Que se parezcan es
intencional; usar aquí otro tratamiento rompería la regla de color.

## 2. Anatomía

```
┌ 180px ─────────────┐   ┌ contenido de la sección ────────────┐
│ ▣ 🌐 General       │   │ Información del sitio               │
│ ▢ ✎ Escritura      │   │ …                                   │
│ ▢ ▤ Lectura        │   │                                     │
│ ▢ 💬 Comentarios   │   │                                     │
│ ▢ ▣ Medios         │   └─────────────────────────────────────┘
│ ▢ 🔗 Enlaces permanentes
│ ▢ 🔒 Privacidad    │
│ ▢ 👥 Usuarios      │
│ ▢ 🔔 Notificaciones│
│ ▢ ⚙ Integraciones  │
│ ▢ ⚙ Avanzado       │
└────────────────────┘
```

| Propiedad | Token / valor |
|---|---|
| Ancho de la columna | `180px` fijo (`flex: 0 0 180px`) |
| Fondo | transparente sobre `--bg-page` — **no es una tarjeta**: no lleva borde ni superficie propia |
| Posición | `position: sticky; top: calc(var(--topbar-h) + var(--sp-6))` mientras el formulario hace scroll |
| Gap con el contenido | `var(--sp-6)` |
| Item: alto | `40px` |
| Item: pitch | `44px` (alto + `var(--sp-1)`) |
| Item: padding inline | `var(--sp-3)` |
| Item: radio | `var(--radius-control)` |
| Icono | `16×16`, trazo 1.5px, gap `var(--sp-3)` |
| Etiqueta | `--fs-body` (14/1.55), una línea, `text-overflow: ellipsis` |

Los items son **más compactos que los del sidebar** (40px frente a 44px, icono 16 frente a 20): es
navegación secundaria y debe pesar menos visualmente que la primaria, aunque comparta el color.

## 3. Secciones (orden exacto de la pantalla)

| # | Etiqueta | Icono lucide | Ruta |
|---|---|---|---|
| 1 | General | `globe` | `/panel/ajustes` |
| 2 | Escritura | `square-pen` | `/panel/ajustes/escritura` |
| 3 | Lectura | `book-open` | `/panel/ajustes/lectura` |
| 4 | Comentarios | `message-square` | `/panel/ajustes/comentarios` |
| 5 | Medios | `image` | `/panel/ajustes/medios` |
| 6 | Enlaces permanentes | `link` | `/panel/ajustes/enlaces-permanentes` |
| 7 | Privacidad | `lock` | `/panel/ajustes/privacidad` |
| 8 | Usuarios | `users` | `/panel/ajustes/usuarios` |
| 9 | Notificaciones | `bell` | `/panel/ajustes/notificaciones` |
| 10 | Integraciones | `puzzle` | `/panel/ajustes/integraciones` |
| 11 | Avanzado | `settings-2` | `/panel/ajustes/avanzado` |

`General` es la ruta índice: `/panel/ajustes` la resuelve sin redirección visible.
`Enlaces permanentes` es la etiqueta más larga y **fija el ancho de 180px**: si se añade una sección con
un nombre más largo, se acorta el nombre, no se ensancha la columna.

## 4. Estados

| Estado | Fondo | Texto e icono |
|---|---|---|
| Reposo | transparente | `--text-primary` (etiqueta) · `--text-secondary` (icono) |
| Hover | `--surface-sunken` | `--text-primary` · `--text-primary` |
| Activo | `--accent-tint` | `--accent` · `--accent` |
| Activo + hover | `--accent-tint` | `--accent-hover` |
| Foco visible | el del estado actual | `box-shadow: var(--focus-ring)` sobre `var(--radius-control)` |
| Con cambios sin guardar | el del estado actual | punto de `6px` en `--warn` al final del item, `aria-label` añade `, con cambios sin guardar` |

Diferencia deliberada con el sidebar: aquí la etiqueta en reposo es `--text-primary`, no
`--text-secondary`. En la pantalla los nombres de sección se leen oscuros; el contraste con el activo
lo hace el fondo tintado, no el color del texto.

## 5. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1280px` | columna `180px` + contenido + panel derecho (ver `layout/split-view.md`) |
| `1024–1279px` | columna `180px` + contenido; el panel derecho baja bajo el formulario |
| `768–1023px` | la columna deja de ser sticky y pasa a **fila horizontal con scroll**, con la piel de `tabs.md` variante `page` (subrayado índigo). Los iconos se conservan a la izquierda de cada etiqueta |
| `< 768px` | **acordeón / selector**: un control de `44px` con la sección actual y `chevron-down` abre un menú a pantalla completa (`--surface`, `--shadow-float`) con las 11 secciones a `--touch-target` cada una |

Regla: por debajo de `768px` **nunca** se apilan 11 items sobre el formulario — el usuario tendría que
recorrer media pantalla antes de ver un campo.

## 6. Accesibilidad de teclado y foco

- `<nav aria-label="Secciones de ajustes">` con `<ul>` y enlaces reales (`<a href>`): cada sección es
  una URL propia, no una pestaña de cliente. Eso hace que funcionen compartir enlace, atrás y recarga.
- La sección actual: `aria-current="page"`.
- Roving tabindex con `↑`/`↓` dentro de la lista, `Home`/`End` a los extremos; `Enter` navega.
  `Tab` sale de la lista al primer campo del formulario, que es lo que el usuario quiere.
- El salto de foco al cambiar de sección va al `<h2>` del panel de contenido (`tabIndex={-1}`), no al
  inicio de la página.
- Si hay cambios sin guardar, la navegación se intercepta con un diálogo de confirmación
  (`role="alertdialog"`, foco inicial en `Cancelar`, `Esc` = cancelar). El punto `--warn` del § 4 es la
  señal previa, no la única.
- Con la variante móvil, el disparador es `aria-haspopup="menu"` + `aria-expanded`, y el menú atrapa el
  foco mientras está abierto.
- Contraste verificado: `--text-primary` sobre `--bg-page`, y `--accent` sobre `--accent-tint`.

## 7. Marcado de referencia

```tsx
<nav
  aria-label="Secciones de ajustes"
  className="hidden shrink-0 basis-[180px] md:block
             lg:sticky lg:top-[calc(var(--topbar-h)+var(--sp-6))] lg:self-start"
>
  <ul className="flex flex-col gap-[var(--sp-1)]">
    {secciones.map((seccion) => (
      <li key={seccion.href}>
        <Link
          href={seccion.href}
          aria-current={esActual(seccion.href) ? "page" : undefined}
          className="group flex h-10 items-center gap-[var(--sp-3)]
                     rounded-[var(--radius-control)] px-[var(--sp-3)]
                     text-[14px] text-[var(--text-primary)]
                     transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                     hover:bg-[var(--surface-sunken)]
                     focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none
                     aria-[current=page]:bg-[var(--accent-tint)]
                     aria-[current=page]:text-[var(--accent)]"
        >
          <seccion.icon
            className="size-4 shrink-0 text-[var(--text-secondary)]
                       group-aria-[current=page]:text-[var(--accent)]"
            aria-hidden
          />
          <span className="truncate">{seccion.label}</span>
          {seccion.sinGuardar && (
            <span aria-hidden className="ml-auto size-1.5 rounded-full bg-[var(--warn)]" />
          )}
        </Link>
      </li>
    ))}
  </ul>
</nav>
```

## 8. Modo oscuro

Sin redefiniciones propias. Un control específico: al no tener superficie propia, esta columna descansa
directamente sobre `--bg-page`; en oscuro el hover `--surface-sunken` debe seguir siendo distinguible
de `--bg-page` o el item parece inerte al pasar el ratón.

## 9. Deuda contra el código actual

- `app/panel/configuracion/` debe pasar a `app/panel/ajustes/` con una subruta por sección
  (`components/admin/settings/` ya agrupa los formularios).
- Hoy no existe navegación secundaria: la configuración vive en una sola página. Partirla en 11 rutas es
  requisito de esta especificación, no un extra.
- La zona de peligro (`Eliminar mi sitio`, en `--danger`) **no** es una sección de esta navegación: vive
  en el panel derecho de `09` (ver `layout/split-view.md`).
