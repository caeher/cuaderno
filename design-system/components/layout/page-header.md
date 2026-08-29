# Page header

> **Fuente:** aparece en 8 de las 9 pantallas — `02` (`Resumen` + `Nueva entrada`),
> `03` (`Entradas` + `Filtros` + `Nueva entrada`), `05`, `06` (`Categorías` + `Nueva categoría`),
> `07` (`SEO Analyzer`, sin acciones), `08` (`Analíticas` + selector de rango), `09` (`Ajustes`, sin
> acciones) y, en variante propia, `04` (editor, donde el par vive en el topbar).
> **Las pantallas mandan.**

━━━

## 1. Propósito

El par **H1 + subtítulo** a la izquierda y **acciones** a la derecha. Es el patrón más repetido del
producto y el que fija la identidad de cada pantalla: quien entra lee primero el H1, luego el
subtítulo, y solo después el CTA negro que cierra la fila por la derecha.

Dos reglas que no se negocian:

1. **El H1 vive aquí, no en el topbar.** El topbar es de utilidades globales (buscador, tema,
   notificaciones, usuario). El código actual pone el título en el topbar: hay que moverlo.
2. **Un solo CTA negro por pantalla.** El `--action` es el destino del gesto principal. Todo lo demás
   (Filtros, selectores de rango, vistas) es secundario y **nunca** negro.

## 2. Anatomía

```
Entradas                                         [ ⚙ Filtros ]  [ + Nueva entrada ⌄ ]
Gestiona y organiza todo tu contenido publicado.
  ↑ H1 --fs-h1 · subtítulo --fs-body/--text-secondary        ↑ secundario   ↑ primario negro
```

| Slot | Contenido | Notas |
|---|---|---|
| (opcional) ruta | breadcrumb o enlace de retorno | solo en nivel ≥ 2 — ver `navigation/breadcrumb.md` § 1 |
| Título | `<h1>` | obligatorio, uno por página |
| Subtítulo | `<p>` | opcional pero presente en 6 de las 8; una sola frase |
| Acciones | 0–3 controles | alineados a la derecha, el primario siempre el último |

| Propiedad | Token / valor |
|---|---|
| Fila | `display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-6)` |
| H1 | `--fs-h1` (30/1.15), `600`, `--text-primary`, `letter-spacing: -0.02em` |
| Subtítulo | `--fs-body` (14/1.55), `--text-secondary`, `margin-top: var(--sp-2)`, `max-width: 60ch` |
| Gap entre acciones | `var(--sp-3)` |
| Alineación vertical | las acciones se alinean con la **primera línea del H1** (`align-items: flex-start` + `margin-top` calculado), no con el centro del bloque |
| Margen inferior | `var(--sp-6)`; con tabs debajo, `var(--sp-5)` — los tabs traen su propio hairline |

El H1 no lleva ni icono ni badge. Si una pantalla necesita señalar estado (borrador, plan Pro), va en el
contenido, no junto al título.

## 3. Acciones

| Tipo | Especificación | Ejemplos en las pantallas |
|---|---|---|
| **Primaria** | fondo `--action`, texto `--text-on-dark`, alto `44px`, `padding-inline: var(--sp-5)`, `var(--radius-control)`, `--fs-body` `500`, `--shadow-rest`; icono `plus` de `16px` a la izquierda con gap `var(--sp-2)`; hover `--action-hover`, pressed `--action-pressed` | `Nueva entrada` (02, 03), `Nueva categoría` (06) |
| **Primaria partida** | igual, más un disparador de `36px` con `chevron-down`, separado por un hairline `rgba(255,255,255,.18)`; abre menú de variantes | `Nueva entrada ⌄` (02, 03) |
| **Secundaria** | fondo `--surface`, borde `1px --border-hairline`, texto `--text-primary`, alto `44px`, `var(--radius-control)`; hover borde `--border-strong` y fondo `--surface-sunken` | `Filtros` (03) |
| **Selector** | control de `44px` con etiqueta + `chevron-down`, borde `--border-hairline`, `--surface`, `var(--radius-control)`; el valor en `--text-primary`, el icono en `--text-tertiary` | rango de fechas `1 May 2024 - 29 May 2024` (08) |

Máximo tres acciones. Si hacen falta más, las terciarias se agrupan en un menú `⋮`.

En `07-panel-seo-analyzer.png` y `09-panel-ajustes.png` la cabecera **no tiene acciones**: la fila es
solo título + subtítulo, y el `Guardar cambios` vive dentro de la tarjeta que edita. Es correcto y
deliberado — guardar es una acción de un formulario concreto, no de la página.

## 4. Textos canónicos

| Pantalla | H1 | Subtítulo |
|---|---|---|
| `02` | Resumen | Aquí tienes el rendimiento de tu blog. |
| `03` | Entradas | Gestiona y organiza todo tu contenido publicado. |
| `06` | Categorías | Organiza tu contenido por temas. |
| `07` | SEO Analyzer | Mejora el posicionamiento de tu contenido con análisis y recomendaciones. |
| `08` | Analíticas | Resumen del rendimiento de tu blog. |
| `09` | Ajustes | Administra la configuración de tu blog y cuenta. |

Estilo del subtítulo: **una frase, en indicativo, terminada en punto.** No es un eslogan ni una
instrucción con imperativo agresivo.

## 5. Variante editor

`04-panel-editor-de-entrada.png` mueve las acciones al topbar (`Vista previa`, `Publicar`) y deja en el
contenido un encabezado más discreto:

| Parte | Especificación |
|---|---|
| Título | `Editar entrada` · `--fs-h1`, `600`, `--text-primary` |
| Chip de atajo | `⌘K` · `--fs-label`, `--text-tertiary`, fondo `--surface-sunken`, `var(--radius-input)`, `padding: 2px var(--sp-2)`, alineado a la línea base del H1 con gap `var(--sp-3)` |
| Metadatos | `ID: 4821 · Creada el 18 May 2024` · `--fs-sm`, `--text-tertiary`, separador `·` con `var(--sp-2)` a cada lado, `tabular-nums` |
| Acciones | **ninguna aquí** — están en el topbar (ver `navigation/topbar.md` § 6) |

## 6. Responsive

| Rango | Comportamiento |
|---|---|
| `≥ 1024px` | fila única: título/subtítulo a la izquierda, acciones a la derecha |
| `768–1023px` | misma fila; el H1 baja a `24px` y las acciones secundarias pasan a icónicas con tooltip (`Filtros` → icono `sliders`) |
| `< 768px` | **se apila**: título, subtítulo y, debajo, las acciones en fila con `margin-top: var(--sp-4)`. El botón primario ocupa el ancho completo (`width: 100%`) y va **primero** en el orden visual; las secundarias quedan debajo o a su lado si caben. Alto `--touch-target`. El H1 baja a `24px` |

En móvil el CTA primario a ancho completo es la única excepción a "el primario cierra la fila por la
derecha": con una sola columna, el borde derecho deja de existir como jerarquía.

## 7. Accesibilidad de teclado y foco

- Un único `<h1>` por página, y es este. El resto de encabezados de la pantalla arrancan en `<h2>`
  (títulos de tarjeta) y `<h3>` (bloques internos). No se saltan niveles.
- El subtítulo es un `<p>` normal; **no** se enlaza con `aria-describedby` al H1 (ruido innecesario en
  cada anuncio de página).
- El `<h1>` lleva `tabIndex={-1}` y recibe el foco tras cada navegación de cliente (ver
  `panel-shell.md` § 7). Su anillo de foco es `var(--focus-ring)` con `var(--radius-input)`.
- Orden de tabulación de las acciones: **el orden del DOM es el visual** (secundarias antes que la
  primaria). En la variante móvil, donde el primario se pinta arriba, se reordena el DOM, no se usa
  `order` de CSS: `order` desincroniza foco y vista.
- El botón partido son **dos botones** en un contenedor `role="group"` con `aria-label` común
  (`Crear entrada`): el cuerpo actúa, el disparador lleva `aria-haspopup="menu"` y `aria-expanded`.
  `↓` sobre el cuerpo abre el menú.
- Los botones icónicos de la variante `md` conservan `aria-label` en español.
- Contraste: `--text-on-dark` sobre `--action` ≥ 15:1; `--text-secondary` del subtítulo sobre
  `--bg-page` ≥ 4.5:1.

## 8. Marcado de referencia

```tsx
export function PageHeader({ titulo, subtitulo, acciones, ruta }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-[var(--sp-4)] md:flex-row md:items-start
                    md:justify-between md:gap-[var(--sp-6)]">
      <div className="min-w-0">
        {ruta}
        <h1
          tabIndex={-1}
          className="text-[24px] font-semibold leading-[1.15] tracking-[-0.02em]
                     text-[var(--text-primary)] outline-none
                     focus-visible:rounded-[var(--radius-input)]
                     focus-visible:shadow-[var(--focus-ring)] md:text-[30px]"
        >
          {titulo}
        </h1>
        {subtitulo && (
          <p className="mt-[var(--sp-2)] max-w-[60ch] text-[14px] leading-[1.55]
                        text-[var(--text-secondary)]">
            {subtitulo}
          </p>
        )}
      </div>

      {acciones && (
        <div className="flex shrink-0 items-center gap-[var(--sp-3)] [&>*]:h-11
                        max-md:[&>*:last-child]:w-full">
          {acciones}
        </div>
      )}
    </div>
  )
}
```

```tsx
// uso en app/panel/entradas/page.tsx
<PageHeader
  titulo="Entradas"
  subtitulo="Gestiona y organiza todo tu contenido publicado."
  acciones={
    <>
      <BotonSecundario icon={SlidersIcon}>Filtros</BotonSecundario>
      <BotonPrimarioPartido icon={PlusIcon} opciones={tiposDeEntrada}>
        Nueva entrada
      </BotonPrimarioPartido>
    </>
  }
/>
```

## 9. Modo oscuro

Sin redefiniciones propias. Un control: `--action` (negro) sobre `--bg-page` oscuro debe seguir
leyéndose como **el** botón de la pantalla. El contrato de tokens resuelve esto en el propio
`--action`; el `page-header` no aplica ningún tratamiento especial ni invierte el botón por su cuenta.

## 10. Deuda contra el código actual

1. `components/admin/layout/panel-page-layout.tsx` pasa `title` al `AdminTopbar`, que lo renderiza como
   `<h1 className="text-sm font-medium">`. Eso son dos errores: el H1 está en el sitio equivocado y con
   tamaño de etiqueta (14px) en vez de `--fs-h1` (30px).
2. No existe subtítulo en el componente actual; 6 de las 8 pantallas lo tienen.
3. `action` es un único `ReactNode` sin distinguir primario/secundario ni el patrón de botón partido.
4. No hay slot de ruta (breadcrumb / retorno) ni traslado de foco al H1.
