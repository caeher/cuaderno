# Tabs

> **Fuente:** `03-panel-entradas.png` (tabs con contador), `07-panel-seo-analyzer.png` (6 tabs de sección),
> `08-panel-analiticas.png` (6 tabs de sección), `04-panel-editor-de-entrada.png` (2 tabs dentro del panel derecho).
> **Las pantallas mandan.**

━━━

## 1. Propósito

Filtro o cambio de vista **dentro de una misma página**, siempre bajo el `page-header`. Cambiar de tab
no cambia el H1 ni las acciones de la cabecera: si al cambiar de pestaña cambia el título de la página,
eso no es un tab, es navegación y va al sidebar.

El subrayado activo es **índigo `--accent`** porque es navegación. Es la única forma de tab del sistema:
no existen tabs con fondo tipo píldora ni tabs encapsulados en una caja.

## 2. Anatomía

```
  Todas (24)   Publicadas (20)   Borradores (3)   Programadas (1)   Papelera (0)
  ──────────
  ↑ subrayado 2px --accent
────────────────────────────────────────────────────────────────────────────────  ← hairline de la fila
```

| Parte | Especificación |
|---|---|
| Fila | `display: flex`, gap `var(--sp-6)` (24px), borde inferior `1px solid var(--border-hairline)` a lo ancho del contenido |
| Tab | `padding-block: var(--sp-3)`, sin padding lateral — el gap hace el espaciado, así el subrayado mide exactamente lo que mide el texto |
| Etiqueta | `--fs-body` (14/1.55) |
| Subrayado activo | `2px` sólido `--accent`, pegado al hairline de la fila (`bottom: -1px`), del ancho del tab |
| Contador | ver § 4 |
| Alto total | `48px` |

El hairline de la fila **siempre se dibuja**, incluso si el subrayado activo se apoya sobre él: es lo
que ancla los tabs al contenido y evita que floten.

## 3. Estados

| Estado | Texto | Subrayado |
|---|---|---|
| Reposo | `--text-secondary`, peso `400` | ninguno |
| Hover | `--text-primary` | `2px` `--border-strong` |
| Activo | `--accent`, peso `500` | `2px` `--accent` |
| Activo + hover | `--accent-hover` | `2px` `--accent-hover` |
| Foco visible | el del estado actual | `box-shadow: var(--focus-ring)` con `var(--radius-input)`, aplicado al tab con `outline-offset` interior para no salirse de la fila |
| Deshabilitado | `--text-tertiary` | ninguno; `aria-disabled="true"`, `cursor: not-allowed` |

Transición: solo `color` y `background-color` con `--dur-fast --ease-out`. El subrayado puede animar su
posición con `--dur-base --ease-out` si se implementa como indicador único deslizante; bajo
`prefers-reduced-motion: reduce` el indicador salta sin transición.

## 4. Contador

El contador es **opcional** y, cuando existe, va **entre paréntesis dentro de la propia etiqueta**, con
el mismo color que la etiqueta — así aparece en `03-panel-entradas.png` (`Todas (24)`,
`Publicadas (20)`, `Borradores (3)`, `Programadas (1)`, `Papelera (0)`).

- **No es un badge ni una píldora.** Ningún tab de las pantallas usa fondo tintado para el número.
- Números con `font-variant-numeric: tabular-nums` para que el ancho del tab no baile al recargar datos.
- Un contador en `0` se muestra igual (`Papelera (0)`), no se oculta: comunica que la sección está vacía.
- Mientras cargan los datos se muestra la etiqueta sin paréntesis, nunca `(…)` ni `(0)` provisional.
- Formato: entero hasta 999; a partir de ahí `1,2K` con separador español (`1.2K` no; se usa coma
  decimal: `1,2 K` sin espacio → `1,2K`).

`07` y `08` usan tabs **sin** contador (`Visión general`, `Entradas`, `Páginas`, `Palabras clave`,
`Enlaces internos`, `Rendimiento`); ambas formas conviven sin variante extra de componente.

## 5. Variantes

| Variante | Uso | Diferencias |
|---|---|---|
| `page` (por defecto) | filtro de página bajo el `page-header` — `03`, `07`, `08` | tal cual § 2 |
| `panel` | dentro de una tarjeta o panel lateral — `04`, tabs `Entrada` / `Bloque` | gap `var(--sp-5)`, `padding-block: var(--sp-3)`, el hairline recorre solo el ancho del panel, `--fs-sm` |

No hay más variantes. Cualquier necesidad de "tabs verticales" es en realidad `settings-nav.md`.

## 6. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1024px` | todos los tabs visibles en una línea |
| `768–1023px` | la fila hace **scroll horizontal** (`overflow-x: auto`, `scrollbar-width: none`), nunca wrap. El tab activo se auto-desplaza al centro al montar (`scrollIntoView({ inline: "center", block: "nearest" })`) |
| `< 768px` | igual que arriba, más: gap `var(--sp-5)`, degradados de `24px` en los bordes (de `--bg-page` a transparente) que indican contenido cortado; el área táctil crece a `--touch-target` con `padding-block: var(--sp-3)` |

Los tabs **nunca** colapsan a un `<select>`: se sigue viendo cuántas vistas hay.

## 7. Accesibilidad de teclado y foco

Patrón ARIA de tabs con **activación manual** (el contenido cambia al pulsar, no al mover el foco),
porque cada tab dispara una consulta de datos.

- Contenedor `role="tablist"` con `aria-label` descriptivo (`"Filtrar entradas por estado"`).
- Cada tab: `role="tab"`, `aria-selected`, `aria-controls` apuntando al panel, `id` estable.
- El panel: `role="tabpanel"`, `aria-labelledby` al tab, `tabIndex={0}` para que sea alcanzable cuando
  su contenido no tiene foco propio.
- Roving tabindex: solo el tab seleccionado tiene `tabIndex={0}`; el resto `-1`.
- Teclas: `←`/`→` mueven el foco (con envoltura circular), `Home`/`End` a los extremos,
  `Enter` o `Espacio` activan.
- El contador debe leerse natural: la etiqueta accesible es `Publicadas, 20 entradas`
  (`aria-label` explícito), no `Publicadas paréntesis 20`.
- Cuando los tabs reflejan estado de URL (`?estado=borradores`), el cambio usa `router.replace` con
  `scroll: false` para que el foco no salte al inicio de la página.
- Al cambiar de tab se anuncia el resultado por región `aria-live="polite"`
  (`"3 entradas en Borradores"`), porque el cambio visual ocurre lejos del foco.

## 8. Marcado de referencia

```tsx
<div
  role="tablist"
  aria-label="Filtrar entradas por estado"
  className="flex gap-[var(--sp-6)] overflow-x-auto border-b border-[var(--border-hairline)]
             [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
  {filtros.map((f) => {
    const activo = f.id === actual
    return (
      <button
        key={f.id}
        role="tab"
        id={`tab-${f.id}`}
        aria-selected={activo}
        aria-controls={`panel-${f.id}`}
        aria-label={`${f.label}, ${f.total} entradas`}
        tabIndex={activo ? 0 : -1}
        onClick={() => setActual(f.id)}
        className="relative shrink-0 whitespace-nowrap py-[var(--sp-3)] text-[14px]
                   text-[var(--text-secondary)] tabular-nums
                   transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]
                   hover:text-[var(--text-primary)]
                   focus-visible:rounded-[var(--radius-input)]
                   focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none
                   aria-selected:font-medium aria-selected:text-[var(--accent)]
                   after:absolute after:inset-x-0 after:-bottom-px after:h-0.5
                   after:bg-transparent hover:after:bg-[var(--border-strong)]
                   aria-selected:after:bg-[var(--accent)]"
      >
        {f.label} ({f.total.toLocaleString("es")})
      </button>
    )
  })}
</div>

<div role="tabpanel" id={`panel-${actual}`} aria-labelledby={`tab-${actual}`} tabIndex={0}>
  {/* tabla de entradas */}
</div>
```

## 9. Modo oscuro

Sin redefiniciones propias. Comprobar dos cosas:

1. `--accent` sobre `--bg-page` oscuro debe mantener ≥ 4.5:1 en el texto del tab activo; si el índigo
   oscuro queda apagado, se ajusta el token, **no** este componente.
2. El subrayado de hover usa `--border-strong`, que en oscuro debe seguir siendo perceptible sobre el
   hairline; si no lo es, el hover pierde su señal y el tab parece muerto.

## 10. Notas de implementación

- Base UI ya está en el repo (`components/ui/tabs.tsx` sobre `@base-ui/react/tabs`): aporta el roving
  tabindex y el `role` correcto. Lo que hay que reescribir es la piel — la variante actual no tiene
  subrayado índigo ni hairline de fila.
- Si el tab activo se refleja en la URL, el estado del servidor debe renderizar ya el tab correcto para
  evitar un parpadeo del indicador durante la hidratación.
- El indicador deslizante (un único `<span>` animado) es opcional; con `after:` por tab se consigue el
  mismo resultado sin medir anchos, que es lo recomendado por robustez con fuentes variables.
