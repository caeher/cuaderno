# Panel · Ajustes

> **Fuente:** `../../ui-ux-panels/09-panel-ajustes.png`.
> **Ruta:** `app/panel/configuracion/` → **renombrar a `app/panel/ajustes/`** (la pantalla y el
> sidebar dicen `Ajustes`).
> **Las pantallas mandan.**

━━━

## 1. Composición

La **única pantalla de tres columnas** del panel (`guidelines/layout.md` §2):

```css
.pagina-ajustes { display: grid; grid-template-columns: 200px minmax(0, 1fr) 300px; gap: var(--sp-6); align-items: start; }
```

```
page-header:  Ajustes · «Configura tu blog»                          (sin acción primaria)
┌──────────────┬────────────────────────────────────┬──────────────────────┐
│ 🌐 General   │ Información del sitio               │ Cuenta               │
│ ✎ Escritura  │  ┌──────────────┬──────────────┐   │  👤 Perfil        ›  │
│ 📖 Lectura   │  │ Nombre       │ Eslogan      │   │  🛡 Seguridad     ›  │
│ 💬 Comentar. │  ├──────────────┴──────────────┤   │  📱 Sesiones      ›  │
│ 🖼 Medios    │  │ Descripción corta            │   │  ⎋ Cerrar sesión    │
│ 🔗 Enlaces   │  └──────────────────────────────┘   ├──────────────────────┤
│ 🔒 Privacid. │ Usuario                             │ Tu plan       [Pro]  │
│ 👥 Usuarios  │ Lectura                             │  ✓ beneficio         │
│ 🔔 Notific.  │ Publicación                         │  [ Gestionar plan ]  │
│ 🧩 Integrac. │                                     ├──────────────────────┤
│ ⚙ Avanzado  │                    [ Guardar cambios ]│ Exportar e importar │
│              │                                     ├──────────────────────┤
│              │                                     │ ⚠ Eliminar mi sitio  │
└──────────────┴────────────────────────────────────┴──────────────────────┘
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` **sin acción primaria** — `Guardar cambios` vive al pie del formulario |
| Columna 1 | `navigation/settings-nav.md` — 11 secciones, activo en `--accent-tint` |
| Columna 2 | Tarjetas de formulario · `forms/form-field.md`, `input.md`, `textarea.md`, `select.md`, `switch.md`, `file-input.md` |
| Columna 3 | `layout/split-view.md` (aside de **300px**, sticky) con cuatro tarjetas |
| Guardado | `core/button.md` **negro** `Guardar cambios` + `feedback/toast.md` |
| Zona de peligro | `feedback/alert.md` variante `danger` + `feedback/confirm-dialog.md` |

### Las once secciones

`globe` General · `square-pen` Escritura · `book-open` Lectura · `message-square` Comentarios ·
`image` Medios · `link` Enlaces permanentes · `lock` Privacidad · `users` Usuarios ·
`bell` Notificaciones · `puzzle` Integraciones · `settings-2` Avanzado.

`General` es la ruta índice: `/panel/ajustes` la resuelve sin redirección visible.
`Enlaces permanentes` es la etiqueta más larga y **fija el ancho de 200px**: si aparece una sección
con nombre más largo, se acorta el nombre, no se ensancha la columna.

Un item con cambios sin guardar lleva un punto de 6px en `--warn` al final, y su `aria-label` añade
`, con cambios sin guardar`.

### El formulario

Bloques en tarjeta (`--surface`, hairline, `--radius-card`, padding `--sp-5`), gap `--sp-6`, con
título `--fs-h3` y una línea de ayuda en `--fs-sm`/`--text-secondary`.

Dentro de la tarjeta, **dos columnas**: `1fr 1fr`, gap `--sp-5` horizontal y `--sp-4` vertical.
Label `--fs-body`/500 arriba del campo, separado `--sp-2`. Ayuda del campo debajo en
`--fs-sm`/`--text-tertiary`.

**Un campo largo ocupa una columna completa en altura, no las dos.** `Descripción corta` es alto,
no ancho: estirarlo a dos columnas deja un hueco muerto a su lado.

| Sección | Campos (General) |
|---|---|
| **Información del sitio** | `Nombre del sitio` · `Eslogan` · `Descripción corta` (textarea, contador 160) · `Idioma` (select) · `Zona horaria` (select) · `Logotipo` y `Favicon` (file-upload) |
| **Usuario** | `Imagen de perfil` (avatar 64 + `Cambiar imagen` + `trash-2`) · `Nombre` · `Nombre de usuario` · `Correo` · `Biografía` (textarea) |
| **Lectura** | `Entradas por página` (número) · `Mostrar en la portada` (select) · `Feed: contenido completo o extracto` (switch) |
| **Publicación** | `Estado por defecto` (select) · `Permitir comentarios por defecto` (switch) · `Moderar antes de publicar` (switch) |

### El rail derecho — cuatro tarjetas

Padding `--sp-4` (más apretado que las tarjetas del contenido, que van a `--sp-5`).

1. **Cuenta** — filas con icono 20 + etiqueta + `chevron-right`: `user` Perfil ·
   `shield-check` Seguridad · `monitor-smartphone` Sesiones activas. Al pie,
   `log-out` `Cerrar sesión` en `--danger`.
2. **Tu plan** — badge `Pro` en `--accent-tint`/`--accent` junto al título; lista de beneficios con
   `circle-check` en `--perf-strong`; barra de cuota (`progress-bar.md`) si el plan tiene límites;
   botón secundario `Gestionar plan`.
3. **Exportar e importar** — `upload` `Exportar contenido` y `download` `Importar contenido`, dos
   botones secundarios a ancho completo, con una línea de ayuda debajo.
4. **Zona de peligro** — tarjeta con borde `1px --danger`, título `--danger`, cuerpo explicando la
   consecuencia y botón `Eliminar mi sitio` (destructivo). El fondo `--danger-tint` aparece **solo
   en el hover del botón**, no en reposo: una tarjeta roja permanente en el rail grita cuando no
   pasa nada.

**El rail no contiene el CTA primario.** `Guardar cambios` vive al pie del formulario.

━━━

## 2. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Nombre, eslogan, descripción del sitio | `users.name`, `users.tagline`, `users.bio` | ⚠️ hoy son campos **del usuario**, no del sitio. Un tenant con varios usuarios necesita ajustes propios del sitio |
| Zona horaria | `users.timezone` | ✅ |
| Dominio | `users.subdomainEnabled`, `users.customDomain` | ✅ |
| SEO por defecto | `users.seoSettings` | ✅ |
| Legales | `users.legalSettings` | ✅ |
| Imagen de perfil | `users.avatarUrl` | ✅ |
| Portada | `users.coverUrl` | ✅ |
| Redes | `users.socials` | ✅ |
| Rol | `users.role` (`owner` · `admin`) | ✅ — alimenta la sección `Usuarios` |
| Sesión, seguridad | Clerk | ✅ `@clerk/nextjs` |
| **Plan** | — | ⚠️ **no existe.** Requiere `subscription` (plan, estado, periodo, cuotas) |
| **Ajustes del sitio** | — | ⚠️ **no existe.** Requiere tabla `siteSettings` por tenant |
| Logotipo, favicon | — | ⚠️ no existen campos |
| Idioma | — | ⚠️ no existe |
| Entradas por página, portada, feed | — | ⚠️ no existen |
| Comentarios: moderación, por defecto | — | ⚠️ no existen (ver `comentarios.md`) |

### La decisión de fondo: ajustes de usuario ≠ ajustes de sitio

Hoy todo cuelga de `users`. Esta pantalla los separa visualmente (`Información del sitio` vs
`Usuario`) y esa separación debe existir también en los datos:

```ts
siteSettings: defineTable({
  tenantId: v.string(),
  name: v.string(), tagline: v.string(), description: v.string(),
  language: v.string(), timezone: v.string(),
  logoUrl: v.optional(v.string()), faviconUrl: v.optional(v.string()),
  postsPerPage: v.number(), homepageMode: v.string(), feedFullContent: v.boolean(),
  defaultPostStatus: v.string(), commentsEnabled: v.boolean(), commentsModerated: v.boolean(),
  permalinkPattern: v.string(),
}).index("by_tenant", ["tenantId"])
```

Sin esta separación, `Usuarios` (sección 8) no puede funcionar: dos administradores del mismo blog
compartirían biografía y avatar.

━━━

## 3. Estados

### Carga

- **La nav secundaria y los títulos de bloque aparecen ya.** Solo el valor lleva skeleton.
- **Los inputs se pintan con su borde y su label reales; el skeleton va DENTRO del campo, no lo
  sustituye.** Un formulario que aparece de golpe salta; uno que se rellena, no.
- Rail: los cuatro títulos de tarjeta visibles; filas de `Cuenta` ya pintadas (son estáticas);
  beneficios del plan en skeleton; `Gestionar plan` deshabilitado.
- `Guardar cambios` **deshabilitado** hasta que llegue el dato y haya un cambio.

### Vacío

Esta pantalla **no tiene estado vacío de lista**: siempre hay campos. Sus vacíos son de valor:

- Campo opcional vacío → su `placeholder` en `--text-tertiary`, nunca un `—`.
- Sin logotipo / sin favicon → zona punteada `--border-strong` con `image` y `Subir imagen`, más el
  límite en `--fs-sm` (`PNG o SVG · máximo 1 MB`).
- Sin plan de pago → la tarjeta `Tu plan` muestra `Plan Gratis`, la lista de lo que incluye Pro y
  el botón `Ver planes` en lugar de `Gestionar plan`.
- Sección `Usuarios` con un solo usuario → fila del propietario + `feedback/empty-state.md` reducido:
  `Aún no has invitado a nadie` + botón secundario `Invitar usuario`.

### Guardando

- `Guardar cambios` con `loader-circle` y **ancho fijo**. **El formulario no se deshabilita entero;
  solo el botón.**
- **Éxito**: toast neutro `Cambios guardados` y el botón vuelve a estar **deshabilitado hasta que
  haya un cambio nuevo**. Un botón activo sin nada que guardar es ruido.
- El punto `--warn` del item de la nav secundaria desaparece al guardar.

### Error

| Caso | Presentación |
|---|---|
| **Error de campo** | Borde `--danger`, mensaje en `--fs-sm`/`--danger` bajo el campo, `aria-invalid` y `aria-describedby`. **El foco salta al primer campo con error** |
| **Error global** | `feedback/alert.md` en `--danger-tint` con hairline, **encima** del formulario, con el detalle y `Reintentar` |
| **Carga fallida** | La sección muestra `triangle-alert` en `--warn` · `No pudimos cargar tus ajustes` · `Reintentar`. La nav secundaria y el rail permanecen |
| **Cambios sin guardar al navegar** | Diálogo `Tienes cambios sin guardar` con `Descartar` (secundario) y `Guardar` (negro). Se dispara al cambiar de sección **y** al salir del panel |
| **Subida fallida** | Recuadro `--danger-tint` bajo el campo: `El archivo supera 1 MB` + `Elegir otro` |

### Zona de peligro

`Eliminar mi sitio` abre un diálogo que **exige escribir el nombre del sitio**; el botón destructivo
permanece deshabilitado hasta que coincide **exactamente**.
**Sin cuenta atrás, sin doble confirmación teatral.** El diálogo enumera en texto plano lo que se
pierde (entradas, páginas, comentarios, dominio) y ofrece `Exportar contenido antes` como enlace
secundario. Esa salida vale más que cualquier fricción añadida.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Tres columnas: 200 / 1fr / 300. Nav y rail sticky. |
| **1024–1279** | El **rail baja** bajo el formulario, con sus cuatro tarjetas en `repeat(auto-fit, minmax(280px, 1fr))`. La nav secundaria se mantiene a la izquierda. |
| **768–1023** | Sidebar → drawer. **La nav secundaria pasa de columna a fila de chips con scroll horizontal**, encima del formulario, con el activo en `--accent-tint`. **Formularios a una sola columna.** |
| **<768** | Todo apilado. Chips de sección con scroll horizontal, sin cortar el activo. Formularios en una columna. **`Guardar cambios` anclado abajo** (`position: sticky; bottom: 0`) sobre `--surface` con hairline superior y `--shadow-float`, a ancho completo y alto 48: el botón de guardar nunca debe quedar fuera de alcance al final de un formulario largo. |

━━━

## 5. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| `app/panel/configuracion/` | `app/panel/ajustes/` + 11 subrutas, con redirección desde la antigua |
| `components/admin/settings-form.tsx` **y** `components/admin/settings/settings-form.tsx` | Un solo formulario. Dos archivos con el mismo nombre son deuda activa |
| 8 secciones sueltas (`account`, `domain`, `legal`, `organization`, `profile`, `seo`, `social`, `timezone`) | Redistribuidas en las **11 secciones de la pantalla** |
| Sin nav secundaria | `navigation/settings-nav.md` |
| Sin rail | `layout/split-view.md` con las cuatro tarjetas |
| Todo cuelga de `users` | Separar `siteSettings` (sitio) de `users` (persona) |
| Sin plan | Tabla `subscription` + tarjeta `Tu plan` |
| `OrganizationSwitcher` de Clerk en el sidebar | Selector de blog propio (`navigation/sidebar.md` §2.4) |

━━━

## 6. Reglas duras

1. **Un solo botón negro**: `Guardar cambios`, al pie del formulario. Nunca en el `page-header`,
   nunca en el rail.
2. `Guardar cambios` está deshabilitado mientras no haya cambios.
3. El skeleton va **dentro** del campo; el campo, su borde y su label se pintan desde el principio.
4. El formulario nunca se deshabilita entero al guardar.
5. La zona de peligro no tiene fondo rojo en reposo. Solo el hover del botón.
6. Eliminar el sitio exige escribir su nombre exacto, y ofrece exportar antes.
7. Índigo solo en la sección activa de la nav y en el badge `Pro`. Verde solo en los checks de
   beneficios del plan. Rojo solo en `Cerrar sesión` y en la zona de peligro.
8. En móvil, `Guardar cambios` va anclado abajo.
