# Paginación

> **Fuente:** `03-panel-entradas.png` (`Mostrando 1 a 6 de 24 entradas` · `‹ 1 2 3 … 4 ›`),
> `06-panel-categorias.png` (`Mostrando 1 a 8 de 11 categorías` · `‹ 1 2 ›`).
> **Las pantallas mandan.**

━━━

## 1. Propósito

Pie de toda lista larga del panel. Siempre en **dos bloques enfrentados**: el resumen textual a la
izquierda y los controles a la derecha, fuera de la tarjeta de la tabla, sobre el lienzo `--bg-page`.

La página activa es **índigo `--accent`** porque indica posición dentro de una navegación. No es un
CTA: nunca se pinta negra.

## 2. Anatomía

```
Mostrando 1 a 6 de 24 entradas                    ┌─────────────┐     ┌───┐ ┌───┐
                                                  │ ‹ │ 1 │ 2 │ 3 │  …  │ 4 │ │ › │
                                                  └─────────────┘     └───┘ └───┘
 ↑ resumen --fs-sm / --text-secondary               ↑ segmento         ↑ segmentos sueltos
```

Detalle clave leído de `03`: **la elipsis parte la fila en segmentos**. Los controles contiguos se
agrupan en un contenedor segmentado con borde `--border-hairline` y radio `var(--radius-control)`; el
`…` no tiene caja; la última página y la flecha siguiente quedan como celdas independientes con su
propio borde.

| Parte | Especificación |
|---|---|
| Fila | `display: flex; justify-content: space-between; align-items: center`, `margin-top: var(--sp-6)` |
| Resumen | `Mostrando {desde} a {hasta} de {total} {sustantivo}` · `--fs-sm`, `--text-secondary`, `tabular-nums` |
| Segmento | borde `1px solid var(--border-hairline)`, `var(--radius-control)`, fondo `--surface`, `overflow: hidden` |
| Celda | `40×40`, `--fs-sm`, `500`, `tabular-nums`, `display: grid; place-items: center` |
| Separación entre celdas del mismo segmento | ninguna — comparten borde; sin hairline interno vertical |
| Gap entre segmentos y elipsis | `var(--sp-3)` |
| Elipsis | `…` (`more-horizontal` de 16px o el glifo), `--text-tertiary`, sin borde, sin fondo, ancho `24px` |
| Flechas | `chevron-left` / `chevron-right` `16px`, `--text-secondary` |

El sustantivo del resumen es el de la entidad listada, en español y en plural:
`entradas`, `páginas`, `categorías`, `etiquetas`, `comentarios`.

## 3. Estados de la celda

| Estado | Fondo | Texto |
|---|---|---|
| Reposo | transparente | `--text-primary` |
| Hover | `--surface-sunken` | `--text-primary` |
| Pressed | `--neutral-tint` | `--text-primary` |
| Activa | `--accent-tint` | `--accent` |
| Activa + hover | `--accent-tint` | `--accent-hover` |
| Foco visible | el del estado actual | `box-shadow: var(--focus-ring)`, `z-index: 1` para que el anillo no lo recorte el `overflow: hidden` del segmento |
| Deshabilitada (flecha en el extremo) | transparente | `--text-tertiary`, `cursor: not-allowed`, `aria-disabled="true"` |

La celda activa **no** lleva borde propio ni cambia el borde del segmento: solo el fondo tintado. Su
radio es `var(--radius-control)` incluso en el interior del segmento (así se ve en `03`: el `1`
activo tiene esquinas redondeadas dentro del grupo).

Las flechas de los extremos **nunca desaparecen**: se deshabilitan. Que el control cambie de ancho
entre páginas es peor que una flecha inerte.

## 4. Algoritmo de ventana

Con `total_páginas ≤ 7` se muestran todas, sin elipsis, en un único segmento.
Con más, la ventana es: primera · elipsis condicional · actual−1 · actual · actual+1 · elipsis
condicional · última.

| Situación | Render |
|---|---|
| `1 2 3 4 5 6 7` (≤ 7) | un solo segmento |
| Cerca del inicio | `‹ 1 2 3` · `…` · `12` · `›` |
| En el medio | `‹` · `1` · `…` · `7 8 9` · `…` · `12` · `›` |
| Cerca del final | `‹` · `1` · `…` · `10 11 12` · `›` |

Regla de agrupación: **celdas consecutivas comparten segmento; una elipsis siempre cierra el segmento
anterior y abre uno nuevo.** La flecha anterior se une al primer segmento y la siguiente queda suelta
al final (así aparece en `03`).

## 5. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1024px` | tal cual § 2 |
| `768–1023px` | ventana reducida a `actual−1 · actual · actual+1`; se mantienen primera y última |
| `< 768px` | la fila se apila: primero los controles centrados, debajo el resumen centrado con `margin-top: var(--sp-3)`. Los números intermedios desaparecen y queda `‹ · Página 2 de 4 · ›` como un único segmento de `44px` de alto (`--touch-target`), con el indicador en `--fs-sm` / `--text-secondary` y padding inline `var(--sp-4)` |

## 6. Accesibilidad de teclado y foco

- Contenedor `<nav aria-label="Paginación">` con una `<ul>` de items; cada control es `<a>` si la
  paginación cambia la URL, `<button>` si es cliente.
- La página actual lleva `aria-current="page"`; el resto no lleva nada.
- Etiquetas accesibles explícitas: `aria-label="Página 3"`, `aria-label="Página anterior"`,
  `aria-label="Página siguiente"`. La elipsis es `aria-hidden` y no es focalizable.
- El resumen textual va **antes** de los controles en el DOM aunque visualmente estén a la misma altura,
  y actúa como contexto: se le pone `aria-live="polite"` para que al cambiar de página se anuncie
  `Mostrando 7 a 12 de 24 entradas`.
- Al navegar, el foco se mueve al encabezado de la tabla (`tabIndex={-1}` + `focus()`), no al inicio de
  la página: el usuario de teclado no debe volver a atravesar el sidebar.
- Anillo de foco `var(--focus-ring)` con `z-index: 1`; el segmento usa `overflow: hidden` y sin ese
  `z-index` el anillo se corta.
- Contraste: `--accent` sobre `--accent-tint` ≥ 4.5:1; `--text-tertiary` solo para estados
  deshabilitados, nunca para texto operativo.

## 7. Marcado de referencia

```tsx
<div className="mt-[var(--sp-6)] flex flex-col items-center gap-[var(--sp-3)]
                md:flex-row md:justify-between">
  <p aria-live="polite" className="text-[13px] tabular-nums text-[var(--text-secondary)]">
    Mostrando {desde} a {hasta} de {total} entradas
  </p>

  <nav aria-label="Paginación" className="flex items-center gap-[var(--sp-3)]">
    {segmentos.map((segmento, i) =>
      segmento.tipo === "elipsis" ? (
        <span key={i} aria-hidden className="w-6 text-center text-[var(--text-tertiary)]">…</span>
      ) : (
        <ul
          key={i}
          className="flex overflow-hidden rounded-[var(--radius-control)]
                     border border-[var(--border-hairline)] bg-[var(--surface)]"
        >
          {segmento.celdas.map((celda) => (
            <li key={celda.id}>
              <Link
                href={celda.href}
                aria-label={celda.etiqueta}
                aria-current={celda.activa ? "page" : undefined}
                aria-disabled={celda.deshabilitada || undefined}
                className="grid size-10 place-items-center rounded-[var(--radius-control)]
                           text-[13px] font-medium tabular-nums text-[var(--text-primary)]
                           transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                           hover:bg-[var(--surface-sunken)]
                           focus-visible:z-10 focus-visible:shadow-[var(--focus-ring)]
                           focus-visible:outline-none
                           aria-[current=page]:bg-[var(--accent-tint)]
                           aria-[current=page]:text-[var(--accent)]
                           aria-disabled:cursor-not-allowed aria-disabled:text-[var(--text-tertiary)]
                           aria-disabled:hover:bg-transparent"
              >
                {celda.contenido}
              </Link>
            </li>
          ))}
        </ul>
      )
    )}
  </nav>
</div>
```

## 8. Modo oscuro

Sin redefiniciones propias. Verificar que `--surface` del segmento se distinga de `--bg-page` en
oscuro; si no, el borde `--border-hairline` es lo único que sostiene la forma del control y no puede
suavizarse.

## 9. Notas de implementación

- `components/ui/pagination.tsx` (shadcn/Base UI) ya existe pero pinta botones sueltos con estilo
  `outline`; hay que reemplazar la piel por el modelo segmentado de las pantallas.
- El tamaño de página por defecto lo fija Ajustes → Lectura (`Entradas por página`, valor 10 en
  `09-panel-ajustes.png`); las pantallas `03` y `06` muestran 6 y 8 porque son renders — **el número no
  se fija en el componente**.
- Números siempre con `toLocaleString("es")` y `tabular-nums`: `1.240`, no `1,240`.
- Si la lista tiene menos elementos que una página, la paginación se oculta entera **pero el resumen
  se mantiene** (`Mostrando 1 a 4 de 4 entradas`): confirma al usuario que no falta nada.
