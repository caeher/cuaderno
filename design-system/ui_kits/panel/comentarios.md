# Panel · Comentarios

> **Fuente:** ninguna de las 9 pantallas dibuja esta vista. El sidebar sí la lista
> (`message-square` Comentarios, grupo de contenido) y `09-panel-ajustes.png` incluye una sección
> `Comentarios` en la nav secundaria. Esta pantalla se **deriva** del sistema.
> **Ruta:** `app/panel/comentarios/` — **existe**, con `components/admin/comments/admin-comments-list.tsx`.
> **Las pantallas mandan:** si una pantalla futura dibuja Comentarios, manda ella.

━━━

## 1. Composición

Forma **B — ancho completo**, con tabs de estado. La diferencia con Entradas: aquí **la fila no es
una tabla, es una lista de conversación**. Un comentario es texto que hay que leer, no un registro
que hay que escanear.

```
page-header:  Comentarios · «Modera lo que se dice en tu blog»          (sin acción primaria)
──────────────────────────────────────────────────────────────────────────────
tabs:  Todos (128)   Pendientes (4)   Aprobados (120)   Spam (3)   Papelera (1)
──────────────────────────────────────────────────────────────────────────────
barra de lista:  [ 🔍 Buscar en comentarios… ]        [ Más recientes ▾ ]
┌───────────────────────────────────────────────────────────────────────────┐
│ ☐ │ 👤 Ana Ruiz · ana@correo.com · hace 2 h            [Pendiente]     ⋯ │
│   │ «Muy buen artículo. ¿Tenéis algo sobre Convex y multi-tenant?»        │
│   │ en → Cómo escribir con IA                                            │
│   │ [ Aprobar ]  [ Responder ]  [ Spam ]  [ Papelera ]                   │
└───────────────────────────────────────────────────────────────────────────┘
Mostrando 1 a 10 de 128 comentarios                          ‹ 1 2 3 … 13 ›
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` **sin acción primaria** — el usuario no crea comentarios |
| Tabs | `navigation/tabs.md` con contador. `Pendientes` lleva su contador en `--accent` cuando es > 0 |
| Barra de lista | `forms/search-input.md` · `core/dropdown-menu.md` (orden) |
| Lista | `data-display/data-table.md` en **`density="conversación"`** — filas de alto variable, sin columnas, con el hairline como único separador |
| Fila | `core/avatar.md` 32 · `core/badge.md` (estado) · `core/button.md` `size="sm"` × 4 · `core/dropdown-menu.md` |
| Acciones en lote | Barra `--accent-tint` que sustituye a la barra de lista |
| Pie | `navigation/pagination.md` |
| Responder | `forms/textarea.md` desplegable en línea |

### La fila de comentario

Padding `--sp-5`, hairline inferior, hover `--surface-sunken`. Cuatro bandas verticales:

| Banda | Contenido |
|---|---|
| **1 · Identidad** | Checkbox 40px · avatar 32 · nombre `--fs-body`/600 · correo `--fs-sm`/`--text-tertiary` · `·` · fecha relativa `--fs-sm`/`--text-tertiary` con `title` de fecha absoluta. A la derecha: `core/badge.md` de estado + `ellipsis` |
| **2 · Contenido** | `--sp-3` de separación. Texto `--fs-body`/1.6/`--text-primary`, `max-width: 76ch`, **truncado a 4 líneas** con `Ver más` en `--accent` si excede |
| **3 · Contexto** | `--sp-3`. `en →` + título de la entrada, `--fs-sm`, enlace a la entrada. Truncado a una línea |
| **4 · Acciones** | `--sp-4`. Cuatro botones `sm` de 32 de alto: `Aprobar` (secundario), `Responder` (secundario), `Spam` (fantasma), `Papelera` (fantasma en `--danger` al hover). Las acciones **se muestran siempre**, no solo en hover: en móvil no hay hover, y esconderlas rompe la pantalla entera |

Las acciones cambian según el estado: un comentario aprobado muestra `No aprobar` en lugar de
`Aprobar`; uno en spam muestra `No es spam`.

### Estados del comentario — vocabulario cerrado

Extiende el vocabulario de `core/badge.md` con una familia propia, con la misma gramática:

| Estado | Color | Tinte | Cuándo |
|---|---|---|---|
| `Pendiente` | `--warn` | `--warn-tint` | Esperando moderación |
| `Aprobado` | `--perf` | `--perf-tint` | Visible en el blog |
| `Spam` | `--danger` | `--danger-tint` | Marcado como spam |
| `Papelera` | `--neutral` | `--neutral-tint` | Eliminado, recuperable |

`Aprobado` es verde por la misma razón que `Publicado`: es el estado de *está en línea y funciona*.
`Pendiente` es ámbar por la misma razón que `Borrador`: requiere una acción del usuario.

**Un comentario aprobado no lleva badge visible en la vista `Todos`.** El estado por defecto no
necesita etiqueta; solo se pintan `Pendiente`, `Spam` y `Papelera`. Un muro de badges verdes anula
la señal de los cuatro que sí necesitan atención.

### Responder en línea

`Responder` despliega bajo la fila, con transición de altura en `--dur-base`:
avatar del usuario 32 + `textarea` de 3 líneas con placeholder `Escribe tu respuesta…` +
fila de acciones `Cancelar` (fantasma) y `Responder` (**negro**).

Es el **único botón negro de la pantalla**, y solo existe mientras el compositor está abierto. La
respuesta entra en la lista de forma optimista como comentario anidado, con sangría `--sp-8` y una
línea vertical de 2px `--border-hairline` a la izquierda.

━━━

## 2. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Autor | `comments.authorName`, `comments.authorAvatarUrl`, `comments.authorEmail` | ✅ |
| Contenido | `comments.content` | ✅ |
| Fecha | `comments.createdAt` | ✅ |
| Entrada | `comments.postDocId` → `posts.title`, `posts.slug` | ✅ |
| **Estado** | — | ⚠️ **no existe.** Requiere `comments.status: v.union(v.literal("pending"), v.literal("approved"), v.literal("spam"), v.literal("trashed"))` |
| **Respuestas anidadas** | — | ⚠️ **no existe.** Requiere `comments.parentId: v.optional(v.id("comments"))` |
| Contador del post | `posts.comments` | ⚠️ desnormalizado: debe contar **solo aprobados**, o el blog público mostrará "12 comentarios" y pintará 8 |
| Contadores de tabs | `comments` agrupados por `status` | ⚠️ depende del campo `status` |
| Búsqueda | índice de texto sobre `content` + `authorName` | ⚠️ no hay índice de búsqueda |
| Marca de autor | `comments.authorUserId === users.clerkUserId` | ✅ — permite pintar el chip `Autor` junto al nombre |

### Deuda de datos que esta pantalla exige

```ts
comments: defineTable({
  // …campos actuales…
  status: v.union(v.literal("pending"), v.literal("approved"),
                  v.literal("spam"), v.literal("trashed")),
  parentId: v.optional(v.id("comments")),
  updatedAt: v.optional(v.string()),
})
  .index("by_tenant_and_status", ["tenantId", "status"])
  .index("by_parent", ["parentId", "createdAt"])
```

**Sin `status`, esta pantalla no es una pantalla de moderación: es una lista de lectura.** Es la
deuda de datos más grande del panel después de `posts.seoScore`.

━━━

## 3. Estados

### Carga

- `page-header`, tabs **con sus contadores**, barra de lista y paginación (deshabilitada) se pintan ya.
- Lista: 6 filas fantasma con la geometría real — avatar circular 32, barra de nombre al 30 %,
  barra de correo al 45 %, tres barras de contenido (100 % / 92 % / 60 %), barra de contexto al
  40 % y cuatro rectángulos de botón. El **alto variable** del contenido real se aproxima con tres
  líneas fijas: es la promesa más honesta posible.
- Cambio de tab, de página o de orden: `opacity: .6` conservando la altura. Sin volver al skeleton.

### Vacío

| Causa | Presentación |
|---|---|
| **Nunca hubo** | `feedback/empty-state.md`: `message-square` · **`Aún no hay comentarios`** · `Cuando alguien comente en tus entradas, aparecerá aquí.` · **sin botón**. No hay nada que el usuario pueda crear |
| **Tab `Pendientes` vacío** | `circle-check` en `--perf` · `No hay nada por moderar` · `Estás al día.` · sin botón. Es el **mejor estado posible** de esta pantalla y merece decirlo |
| **Tab `Spam` vacío** | Línea `No hay comentarios marcados como spam.` en `--fs-sm`/`--text-secondary` con `--sp-8` de aire |
| **Búsqueda** | `search` · `Sin resultados para “convex”` · `Prueba con otro término.` · botón secundario `Limpiar búsqueda` |
| **Comentarios desactivados** | `feedback/alert.md` informativo sobre la lista: `Los comentarios están desactivados en Ajustes › Comentarios.` + enlace `Activar` en `--accent`. La lista histórica **sigue visible** debajo |

### Error

- Lista caída: `triangle-alert` en `--warn` · `No pudimos cargar los comentarios` · `Reintentar`.
  Cabecera, tabs y contadores permanecen.
- Datos previos sobreviven: banda `--warn-tint` sobre la lista.
- **Acción de moderación fallida**: la fila revierte su estado visual con transición en `--dur-base`
  y salta toast de error con `Reintentar`. El comentario **nunca** queda en un estado que no es el
  del servidor.

### Fila

- **Moderación optimista**: al pulsar `Aprobar`, el badge cambia de inmediato, la fila baja a
  `opacity: .6` mientras confirma, y sube el toast `Comentario aprobado · Deshacer` (8 s). Si el
  tab activo es `Pendientes`, la fila **sale de la lista con una transición de salida** de
  `--dur-base` y el contador del tab baja en el acto.
- **Spam y papelera**: mismo patrón, con `Deshacer`. **Sin diálogo de confirmación**: las cuatro
  acciones de moderación son reversibles.
- **Eliminar definitivamente** (solo dentro del tab `Papelera`): esto **sí** es irreversible y
  **sí** lleva `feedback/confirm-dialog.md`.
- **Enviando respuesta**: el botón `Responder` con `loader-circle` y ancho fijo; el `textarea` no
  se deshabilita, para que el usuario pueda copiar su texto si algo falla.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico. Cuatro botones de acción en fila. |
| **1024–1279** | Igual, `max-width` del contenido a 68ch. |
| **768–1023** | Sidebar → drawer. Tabs con scroll horizontal. El correo del autor baja a la segunda línea, bajo el nombre. |
| **<768** | Fila apilada: avatar + nombre + badge arriba; correo y fecha en la segunda línea; contenido; contexto; **acciones en dos filas de dos botones a ancho completo**, alto 44. `Spam` y `Papelera` pasan al menú `⋯` si el ancho no da para cuatro. Barra de acciones en lote anclada abajo con `--shadow-float`. |

━━━

## 5. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| `components/admin/comments/admin-comments-list.tsx` | `data-table.md` en `density="conversación"` |
| `components/admin/dashboard/recent-comments-widget.tsx` | **Se elimina**: el rail de Resumen no lleva comentarios (pantalla 02) |
| Sin `comments.status` | Los cuatro estados + índice `by_tenant_and_status` |
| Sin `comments.parentId` | Respuestas anidadas |
| Sin tabs | `navigation/tabs.md` con contadores por estado |
| Sin moderación | Aprobar · Responder · Spam · Papelera, todas optimistas y con `Deshacer` |
| `posts.comments` cuenta todo | Debe contar **solo aprobados** |

━━━

## 6. Reglas duras

1. **La pantalla no tiene acción primaria en el header.** El único negro es `Responder`, y solo
   mientras el compositor está abierto.
2. `Aprobado` no se pinta con badge en la vista `Todos`. Solo lo excepcional lleva etiqueta.
3. Las acciones de fila se muestran siempre, nunca solo en hover.
4. Las cuatro acciones de moderación son reversibles: toast con `Deshacer`, sin diálogo. Solo
   `Eliminar definitivamente` lleva confirmación.
5. El contenido del comentario se trunca a 4 líneas con `Ver más`. Nunca se recorta a mitad de
   palabra sin salida.
6. El correo del autor es dato sensible: se muestra al propietario del blog, **nunca** en el blog
   público, y no se copia a portapapeles con un clic accidental.
7. El contador de comentarios de una entrada cuenta aprobados. Cualquier otra cosa miente.
