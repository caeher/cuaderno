# Breadcrumb

> **Fuente:** ninguna de las 9 pantallas dibuja un breadcrumb. `04-panel-editor-de-entrada.png` resuelve
> la vuelta con un **enlace de retorno** (`← Volver a entradas`) en el topbar.
> Este documento define, por tanto, dos cosas: **cuándo NO usar breadcrumb** (casi siempre) y cómo se
> ve cuando la profundidad lo exige.
> **Las pantallas mandan:** si una pantalla futura muestra retorno, se usa retorno, no breadcrumb.

━━━

## 1. Cuándo se usa cada patrón

| Profundidad | Ejemplo | Patrón |
|---|---|---|
| Nivel 1 — sección del sidebar | `Entradas`, `Categorías`, `Analíticas` | **Nada.** El sidebar ya dice dónde estás; el H1 del `page-header` lo confirma |
| Nivel 2 — detalle de una sección | `Entradas › Editar entrada` | **Enlace de retorno** `← Volver a entradas` (topbar en el editor, `page-header` en el resto) |
| Nivel 3 o más | `Ajustes › Usuarios › Editar usuario` | **Breadcrumb** |
| Contenido anidado del blog público | `Blog › Categoría › Entrada` | **Breadcrumb** (y además `BreadcrumbList` de schema.org para SEO) |

La regla en una frase: **el breadcrumb aparece solo cuando hay más de un salto que deshacer.** Con un
solo salto, un enlace de retorno es más rápido de leer y más fácil de pulsar.

## 2. Anatomía

```
Ajustes  ›  Usuarios  ›  Editar usuario
  ↑ enlace    ↑ enlace     ↑ actual, sin enlace
```

| Parte | Especificación |
|---|---|
| Contenedor | `<nav aria-label="Ruta de navegación">` + `<ol>`, `display: flex; flex-wrap: wrap; align-items: center` |
| Gap | `var(--sp-2)` a cada lado del separador |
| Item enlazado | `--fs-sm` (13/1.5), `--text-secondary` |
| Item actual | `--fs-sm`, `500`, `--text-primary` |
| Separador | `chevron-right` `14px`, `--text-tertiary`, `aria-hidden` |
| Alto de fila | `20px`; se sitúa **encima del H1** con `margin-bottom: var(--sp-2)` |
| Raíz opcional | icono `home` `14px` en lugar de la palabra `Panel`, con `aria-label="Panel"` |

El breadcrumb vive **dentro del `page-header`**, sobre el H1 (ver `layout/page-header.md` § 2), nunca en
el topbar: el topbar es de utilidades globales.

## 3. Estados

| Estado | Valor |
|---|---|
| Reposo (enlace) | `--text-secondary`, sin subrayado |
| Hover | `--text-primary` + `text-decoration: underline`, `text-underline-offset: 3px`, `--dur-fast` |
| Foco visible | `box-shadow: var(--focus-ring)` con `var(--radius-input)` y `padding-inline: 2px` para que el anillo no toque el texto vecino |
| Actual | `--text-primary`, `500`, **sin** hover ni foco: no es interactivo |
| Colapsado | botón `…` de `24×24`, `--text-tertiary`, `var(--radius-input)`; hover fondo `--surface-sunken` |

El breadcrumb no usa índigo. Es navegación, sí, pero **estructural y pasiva**: el índigo del sistema
está reservado a la navegación *activa* (item de sidebar, tab, página de paginación). Pintar el
breadcrumb de índigo compite con el H1 y ensucia la regla de color.

## 4. Truncado y colapso

- Ningún item supera `240px`: se trunca con `text-overflow: ellipsis` y `title` con el texto completo.
- Con más de 4 niveles se colapsan los intermedios en un único botón `…` que abre un menú
  (`--surface`, `var(--radius-card)`, `1px --border-hairline`, `--shadow-float`) con los tramos ocultos.
  Se conservan siempre **el primero y los dos últimos**.
- El item actual nunca se colapsa ni se trunca por debajo de 24 caracteres visibles.

## 5. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1024px` | ruta completa hasta 4 niveles |
| `768–1023px` | colapso a partir de 3 niveles (`Primero › … › Actual`) |
| `< 768px` | **el breadcrumb se sustituye por el enlace de retorno al nivel padre**: `← Usuarios`. Es un objetivo de `--touch-target` (44px) y ahorra una línea de una pantalla que ya es estrecha |

## 6. Enlace de retorno (patrón hermano)

Es el patrón que sí aparece en las pantallas, así que se especifica aquí para que no se reinvente:

| Parte | Especificación |
|---|---|
| Composición | `arrow-left` `16px` + `Volver a {sección en minúscula}` |
| Tipografía | `--fs-body`, `400`, `--text-secondary` |
| Hover | `--text-primary`; la flecha se desplaza `-2px` en `--dur-fast --ease-out` |
| Foco | `box-shadow: var(--focus-ring)`, `var(--radius-input)`, `padding: 2px var(--sp-2)` |
| Ubicación | topbar en el editor (`04`); primera línea del `page-header` en el resto de detalles |
| Destino | la **lista de la que se vino**, conservando filtros y página vía `router.back()` con respaldo a la ruta canónica si no hay historial |

## 7. Accesibilidad de teclado y foco

- `<nav aria-label="Ruta de navegación">` con `<ol>`; cada tramo en su `<li>`.
- El item actual: `<span aria-current="page">`, **no** un enlace deshabilitado.
- Los separadores son `<li aria-hidden="true">` o pseudo-elementos; jamás se leen.
- Tabulación en orden visual; sin roving tabindex — son enlaces normales y se espera comportamiento de
  enlace.
- El botón de colapso: `aria-label="Mostrar tramos ocultos"`, `aria-expanded`, `aria-haspopup="menu"`;
  `Esc` cierra y devuelve el foco.
- En el blog público se emite además JSON-LD `BreadcrumbList`; el marcado visual no lleva microdatos
  para no ensuciar el DOM.
- Contraste: `--text-secondary` sobre `--bg-page` ≥ 4.5:1. `--text-tertiary` se usa solo en el
  separador, que es decorativo.

## 8. Marcado de referencia

```tsx
<nav aria-label="Ruta de navegación" className="mb-[var(--sp-2)]">
  <ol className="flex flex-wrap items-center gap-[var(--sp-2)] text-[13px]">
    {tramos.map((tramo, i) => {
      const actual = i === tramos.length - 1
      return (
        <li key={tramo.href} className="flex items-center gap-[var(--sp-2)]">
          {i > 0 && (
            <ChevronRightIcon className="size-3.5 text-[var(--text-tertiary)]" aria-hidden />
          )}
          {actual ? (
            <span
              aria-current="page"
              className="max-w-[240px] truncate font-medium text-[var(--text-primary)]"
            >
              {tramo.label}
            </span>
          ) : (
            <Link
              href={tramo.href}
              title={tramo.label}
              className="max-w-[240px] truncate rounded-[var(--radius-input)] px-0.5
                         text-[var(--text-secondary)]
                         transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                         hover:text-[var(--text-primary)] hover:underline hover:underline-offset-[3px]
                         focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
            >
              {tramo.label}
            </Link>
          )}
        </li>
      )
    })}
  </ol>
</nav>
```

## 9. Modo oscuro

Sin redefiniciones propias: consume `--text-secondary`, `--text-primary` y `--text-tertiary`. Único
control: en oscuro el separador `--text-tertiary` no puede caer por debajo de 3:1 contra `--bg-page`,
o la ruta se lee como palabras sueltas sin jerarquía.

## 10. Notas de implementación

- `components/ui/breadcrumb.tsx` ya existe (Base UI) con `Breadcrumb`, `BreadcrumbList`,
  `BreadcrumbItem`, `BreadcrumbSeparator` y `BreadcrumbEllipsis`. Solo hay que ajustar la piel a los
  tokens de arriba: hoy usa `text-muted-foreground` y `gap-1.5`.
- **Antes de añadir un breadcrumb a una pantalla, comprobar la tabla del § 1.** Añadir migas donde
  bastaba un retorno es la forma más común de romper la calma de este panel.
