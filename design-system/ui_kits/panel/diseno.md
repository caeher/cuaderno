# Panel · Diseño

> **Fuente:** ninguna de las 9 pantallas dibuja esta vista. El sidebar sí la lista
> (`paintbrush` Diseño, grupo de contenido) y `01-landing-home.png` promete
> `Diseño sin límites · Personaliza tu blog a tu manera, sin código`.
> **Ruta:** `app/panel/disenador/` — **existe**, con `components/designer/` (estudio, lienzo,
> inspector, biblioteca de widgets, revisiones) y `convex/templates.ts`.
> **Las pantallas mandan:** si una pantalla futura dibuja Diseño, manda ella.

━━━

## 1. Dos vistas, no una

El código actual mezcla dos cosas distintas en una sola ruta. El sistema las separa:

| | **Diseño** (índice) | **Estudio** (editor) |
|---|---|---|
| Ruta | `/panel/diseno` | `/panel/diseno/estudio` |
| Chasis | Panel completo: sidebar + topbar + `page-header` | **Sin sidebar**: pantalla completa, como el editor de entrada pero más radical |
| Qué hace | Elegir plantilla, ver la activa, ajustar identidad visual | Componer la plantilla widget a widget |
| Quién entra | Todo usuario | El que quiere tocar la estructura |

Un usuario que solo quiere cambiar el color de acento de su blog **no debe aterrizar en un lienzo
de widgets**. Esa es la promesa de `sin código` de la landing.

━━━

## 2. Composición — vista índice `/panel/diseno`

Forma **A — con rail derecho**: `minmax(0, 1fr) 320px`.

```
page-header:  Diseño · «Cómo se ve tu blog»                    [ Abrir el estudio ]
──────────────────────────────────────────────────────────────────────────────
tabs:  Plantilla   Identidad   Menús   Personalizado
┌──────────────────────────────────────────────┐ ┌──────────────────────┐
│ Plantilla activa                             │ │ Vista previa         │
│ ┌──────────────────┐  Revista                │ │  ┌────────────────┐  │
│ │  16:9 miniatura  │  Publicada · v12        │ │  │  ▭ mini render │  │
│ │                  │  [Personalizar] [Ver]   │ │  └────────────────┘  │
│ └──────────────────┘                         │ │  ☀ / ☾  📱 / 💻      │
├──────────────────────────────────────────────┤ ├──────────────────────┤
│ Cambiar de plantilla          Ver todas →    │ │ Cambios sin publicar │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ │  3 bloques editados  │
│ │ 16:9 │ │ 16:9 │ │ 16:9 │ │ 16:9 │          │ │  [ Publicar cambios ]│
│ └──────┘ └──────┘ └──────┘ └──────┘          │ ├──────────────────────┤
├──────────────────────────────────────────────┤ │ Historial            │
│ Identidad visual                             │ │  v12 · hace 2 h    › │
│  Color de acento · Tipografía · Logotipo     │ │  v11 · ayer        › │
└──────────────────────────────────────────────┘ └──────────────────────┘
```

### Componentes del sistema, por bloque

| Bloque | Componentes |
|---|---|
| Chasis | `layout/panel-shell.md` · `navigation/sidebar.md` · `navigation/topbar.md` |
| Cabecera | `layout/page-header.md` + `core/button.md` **negro** `Abrir el estudio` |
| Tabs | `navigation/tabs.md`, 4 secciones |
| Plantilla activa | Tarjeta + miniatura 16:9 + `core/badge.md` `Publicada` + dos botones secundarios |
| Galería | Grilla de 4 (`layout/content-grid.md`) con las mismas tarjetas que `ui_kits/landing/templates.md` |
| Identidad | `forms/form-field.md`, `forms/select.md`, `forms/file-input.md` + selector de acento |
| Rail | `layout/split-view.md`: `Vista previa` · `Cambios sin publicar` · `Historial` |
| Publicar | `core/button.md` + `feedback/toast.md` |
| Restaurar | `feedback/confirm-dialog.md` |

### Identidad visual — la sección delicada

Aquí el usuario elige colores **de su blog**, que no son los del panel. Dos superficies distintas
con dos gramáticas distintas, y confundirlas rompe el sistema.

- El acento del blog se elige de una **paleta cerrada** de ocho, como las categorías. Sin rueda de
  color, sin campo hexadecimal.
- **La elección del usuario NO afecta al panel.** El panel es siempre negro / índigo / verde. Un
  panel que cambia de color según el blog del usuario deja de ser una herramienta reconocible.
- Las miniaturas y la vista previa sí reflejan la elección: es donde el usuario ve su decisión.
- Tipografía: lista corta y curada de familias, cada una con su muestra renderizada. Ninguna
  cadena libre de Google Fonts: una tipografía mal elegida arruina el CLS del blog del usuario y su
  puntuación de SEO, que es lo que este producto vende.

### El rail

1. **Vista previa** — mini render 16:9 de la portada con el estado sin publicar, más dos
   alternadores: tema (`sun` / `moon`) y dispositivo (`smartphone` / `monitor`). Es el único lugar
   del panel donde se ve el blog con la identidad del usuario.
2. **Cambios sin publicar** — `3 bloques editados` + `Publicar cambios` (secundario) y
   `Descartar` (fantasma, `--danger` en hover). Si no hay cambios, la tarjeta muestra
   `Todo publicado` con `circle-check` en `--perf` y **no desaparece**.
3. **Historial** — últimas 5 revisiones: `v12 · hace 2 h` + `chevron-right`. Enlace
   `Ver todo el historial →` en `--accent`.

━━━

## 3. Composición — vista estudio `/panel/diseno/estudio`

Pantalla completa, **sin el sidebar del panel**. Tres zonas más una topbar propia:

```
┌ topbar-estudio ──────────────────────────────────────────────────────────────┐
│ ← Volver a Diseño   Revista · v12    ✓ Guardado   [☀|☾] [📱|💻] [Vista previa] [Publicar ▾] │
├──────────────┬────────────────────────────────────────────┬──────────────────┤
│ Biblioteca   │              LIENZO                        │ Inspector        │
│ 260px        │  (el blog, editable en su sitio)           │ 300px            │
│ ▸ Blog       │                                            │ Contenido        │
│ ▸ Diseño     │                                            │ Estilo           │
│ ▸ Interactivo│                                            │ Avanzado         │
│              │                                            │                  │
│ ── Navegador │                                            │                  │
│ árbol de     │                                            │                  │
│ bloques      │                                            │                  │
└──────────────┴────────────────────────────────────────────┴──────────────────┘
```

| Zona | Componentes |
|---|---|
| Topbar | Variante propia, derivada de `navigation/topbar.md` §6 (editor): retorno + nombre + estado de guardado + alternadores + `Vista previa` + `Publicar` (negro, split) |
| Biblioteca (izq.) | Acordeón de categorías de widget + `forms/search-input.md`. Debajo, **Navegador**: árbol de bloques con `grip-vertical`, misma gramática de arrastre que `data-table.md` §3.3 |
| Lienzo (centro) | Fondo `--surface-sunken` con el render centrado; bloque seleccionado con contorno 2px `--accent` y etiqueta flotante con su nombre |
| Inspector (der.) | `navigation/tabs.md` de 3 (`Contenido` · `Estilo` · `Avanzado`) + campos de formulario |

**El contorno de selección es índigo** porque es navegación dentro del documento —la misma razón
por la que el item activo del sidebar lo es—, y el asa de arrastre sigue la gramática de las tablas
reordenables. El estudio no inventa un lenguaje visual propio: hereda el del panel.

━━━

## 4. Datos que muestra

| Dato | Fuente | Estado |
|---|---|---|
| Plantilla activa | `tenantTemplates.name`, `version`, `isPublished`, `publishedAt` | ✅ |
| Borrador vs. publicado | `tenantTemplates.draftSlots` / `publishedSlots` | ✅ — el diff entre ambos alimenta `Cambios sin publicar` |
| Ajustes de plantilla | `tenantTemplates.settings` | ✅ |
| Historial | `tenantTemplateRevisions` | ✅ (`getRevisions`, `rollback`) |
| Guardar / publicar / revertir | `saveDraft`, `publish`, `rollback` en `convex/templates.ts` | ✅ |
| Galería de plantillas | — | ⚠️ **no existe** un catálogo de plantillas base; hoy solo hay la del tenant |
| Identidad visual | `tenantTemplates.settings` | ⚠️ hay que fijar qué claves guarda: acento, tipografía, logo |
| Miniaturas | — | ⚠️ no existen. Requieren una captura por plantilla, regenerada al publicar |
| `schemaVersion` | `tenantTemplates.schemaVersion` | ✅ — **debe mostrarse** cuando una plantilla queda desactualizada (§5, error) |

━━━

## 5. Estados

### Carga

**Vista índice.** `page-header`, tabs y títulos de tarjeta se pintan ya. La miniatura de la
plantilla activa reserva su 16:9 y muestra skeleton; nombre y versión en barras; la galería, cuatro
tarjetas fantasma; el rail, sus tres títulos visibles y sus cuerpos en skeleton.

**Estudio.** La biblioteca y el inspector se pintan **con sus títulos y sus tabs**, deshabilitados
(`opacity: .5`, `pointer-events: none`), igual que la toolbar del editor de entrada. El lienzo
muestra el esqueleto de la plantilla —cabecera, un par de bloques, pie— con la geometría real, no
un spinner a pantalla completa.

### Vacío

| Causa | Presentación |
|---|---|
| **Sin plantilla activa** (blog nuevo) | `feedback/empty-state.md`: `paintbrush` · `Elige cómo se ve tu blog` · `Empieza con una plantilla y personalízala después.` · botón **negro** `Ver plantillas`. La galería se pinta debajo, completa |
| **Lienzo vacío en el estudio** | Zona punteada `--border-strong` centrada con `plus` y `Arrastra un widget para empezar`, más `Añadir bloque` (secundario). Nunca un lienzo blanco sin instrucción |
| **Sin cambios sin publicar** | `Todo publicado` con `circle-check` en `--perf`. La tarjeta **permanece**: un hueco en el rail se lee como bug |
| **Sin historial** | Línea `Aún no hay versiones publicadas.` en `--fs-sm`/`--text-secondary` |
| **Búsqueda de widget sin resultado** | `search` · `Sin resultados para “galería”` · `Prueba con otro término.` |

### Error

- **Carga fallida**: `triangle-alert` en `--warn` · `No pudimos cargar tu diseño` · `Reintentar`.
  El chrome permanece.
- **Guardado fallido en el estudio**: `No se pudo guardar` en `--danger` en la topbar + `Reintentar`.
  **El trabajo nunca se pierde**: queda en borrador local y se reintenta solo cada 15 s — mismo
  contrato que el editor de entrada.
- **Widget que revienta al renderizar**: **el fallo se contiene en su bloque**, no tumba el lienzo.
  El bloque se sustituye por un recuadro `--danger-tint` con `Este bloque no se pudo mostrar` +
  `Quitar bloque` y `Reintentar`. Un error de un widget que deja al usuario con una pantalla en
  blanco y su diseño aparentemente perdido es el peor fallo posible de esta pantalla.
- **`schemaVersion` desactualizada**: `feedback/alert.md` informativo sobre el lienzo —
  `Esta plantilla usa una versión anterior del sistema de bloques.` + `Actualizar`. Nunca se migra
  en silencio.
- **Publicación fallida**: el botón vuelve a su estado normal, el borrador se conserva intacto y el
  toast explica el motivo.

### Publicar y revertir

- **Publicar**: botón con `loader-circle` y ancho fijo → toast `Diseño publicado` con acción
  `Ver blog`. `publishedSlots` pasa a ser el borrador y `Cambios sin publicar` se vacía.
- **Descartar cambios**: es destructivo y **no reversible** → `feedback/confirm-dialog.md`:
  `¿Descartar los cambios sin publicar?` · `Volverás a la versión publicada (v12). Esta acción no se
  puede deshacer.` · `Cancelar` / `Descartar` (`--danger`).
- **Revertir a una revisión**: mismo tratamiento, con el número de versión en el título.

━━━

## 6. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Índice: contenido + rail 320. Estudio: tres columnas 260 / 1fr / 300. |
| **1024–1279** | Índice: el rail baja. Estudio: la biblioteca se **colapsa a rail de iconos** de 56px, expandible al pasar el cursor o al enfocar. |
| **768–1023** | Índice: sidebar → drawer; galería en 2 columnas. Estudio: biblioteca e inspector pasan a **hojas laterales** que se abren desde dos botones de la topbar; el lienzo ocupa todo. |
| **<768** | Índice: todo apilado, galería en 1 columna, `Vista previa` primero (es lo que el usuario quiere ver en móvil). **El estudio no se ofrece en móvil**: en su lugar, `feedback/empty-state.md` con `monitor` · `El estudio necesita una pantalla más grande` · `Ábrelo desde una tableta o un ordenador.` Componer un lienzo con arrastre en 375px es una promesa que no se puede cumplir; decirlo es más honesto que ofrecer una versión rota. |

━━━

## 7. Deuda contra el código actual

| Hoy | Debe ser |
|---|---|
| `app/panel/disenador/` | `app/panel/diseno/` (índice) + `app/panel/diseno/estudio/` |
| `app/panel/posts/[id]/designer/` y `posts/nuevo/designer/` | **Se eliminan.** El diseñador compone la **plantilla**, no una entrada; `posts.designData` y `posts.editorMode` ya están marcados `@deprecated` |
| `components/designer/designer-topbar.tsx` | Variante de `navigation/topbar.md`, no una topbar paralela |
| `components/designer/panels/template-library-panel.tsx` | Biblioteca de widgets + galería de plantillas del índice, separadas |
| `components/designer/panels/template-revisions-modal.tsx` | Tarjeta `Historial` en el rail + diálogo de revertir |
| Sin galería de plantillas base | Catálogo curado, compartido con `ui_kits/landing/templates.md` |
| Sin miniaturas | Captura por plantilla, regenerada al publicar |
| Estudio accesible en móvil | Bloqueado con un vacío explicativo |

━━━

## 8. Reglas duras

1. **Un solo botón negro por vista**: `Abrir el estudio` en el índice, `Publicar` en el estudio.
2. **La identidad visual del blog del usuario nunca tiñe el panel.** El panel es siempre negro,
   índigo y verde.
3. Paleta cerrada de ocho acentos y lista curada de tipografías. Sin rueda de color, sin cadena
   libre de fuentes.
4. El fallo de un widget se contiene en su bloque. El lienzo nunca queda en blanco.
5. `Descartar cambios` y `Revertir` llevan diálogo: no son reversibles.
6. Nunca se migra un `schemaVersion` en silencio.
7. El estudio no se ofrece en móvil, y se dice por qué.
8. El contorno de selección es `--accent`, y el asa de arrastre es la del sistema. El estudio no
   inventa lenguaje visual propio.
