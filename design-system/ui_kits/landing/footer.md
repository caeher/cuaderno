# Landing · Footer — cierre y mapa del sitio

> **Fuente:** la pantalla oficial no dibuja esta sección. Patrón derivado en
> `../../guidelines/landing.md` §5: *hairline superior, cuatro columnas de enlaces
> (`--fs-sm`/`--text-secondary`), lockup + una línea descriptiva a la izquierda, y una fila inferior
> con copyright, legales y selector de idioma*.
> **Estado en el código:** existen las páginas legales bajo `app/(site)/legal/` — el footer las enlaza.

━━━

## 1. Anatomía

Elemento `<footer>` sobre `--bg-page`, hairline superior `--border-hairline`, padding vertical
`--sp-16` arriba y `--sp-8` abajo. Contenido a 1200px centrados.

Dos bloques: **cuerpo** (marca + cuatro columnas) y **fila inferior**, separados por `--sp-12` y un
hairline de ancho completo.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [book-open] cuaderno    Producto      Plantillas     Recursos     Empresa    │
│ Escribe, optimiza       Funciones     Diario         Documentación  Sobre    │
│ y destaca.              Precios       Revista        Guías          Blog     │
│                         SEO Analyzer  Portafolio     Novedades      Contacto │
│ [x] [in] [gh]           Analíticas    Ver todas →    Soporte        Estado   │
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│ © 2026 Cuaderno   Términos · Privacidad · Cookies · Aviso legal   [Español ▾] │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Bloque de marca (columna izquierda, ~28 %)

| # | Pieza | Especificación |
|---|---|---|
| 1 | **Lockup** | Isotipo `book-open` 20 + wordmark `cuaderno` 17/600, `--text-primary`. Tamaño de footer según `marca.md` §3 |
| 2 | `--sp-3` | |
| 3 | **Línea descriptiva** | `Escribe, optimiza y destaca.` — `--fs-sm`/400/`--text-secondary`, `max-width: 30ch`. Una línea, no un párrafo de misión |
| 4 | `--sp-5` | |
| 5 | **Redes** | Tres botones de icono 36×36, `--radius-control`, icono 20 en `--text-tertiary` → hover `--text-primary` y fondo `--surface-sunken`. Cada uno con `aria-label` explícito |

### Cuatro columnas de enlaces (~72 %)

`repeat(4, minmax(0, 1fr))`, gap `--sp-8`, alineadas arriba con el lockup.

Cada columna: título en `--fs-label`/600/mayúsculas/`+0.06em`/`--text-tertiary` → `--sp-4` →
lista `<ul>` con gap `--sp-3`, enlaces en `--fs-sm`/400/`--text-secondary` → hover `--text-primary`.
Alto de zona táctil 32px en escritorio, **44px en `<768`**.

| Producto | Plantillas | Recursos | Empresa |
|---|---|---|---|
| Funciones | Diario | Documentación | Sobre Cuaderno |
| Precios | Revista | Guías | Blog |
| SEO Analyzer | Portafolio | Novedades | Contacto |
| Analíticas | Ver todas → | Soporte | Estado del servicio |

`Ver todas →` va en `--accent` (navegación) y es el **único color** del cuerpo del footer.

### Fila inferior

Tres zonas (`display: flex; justify-content: space-between; align-items: center`), alto 40,
hairline superior, separación `--sp-6` arriba.

| Zona | Contenido |
|---|---|
| Izquierda | `© 2026 Cuaderno` — `--fs-sm`/`--text-tertiary`. El año se calcula, no se escribe a mano |
| Centro | `Términos` · `Privacidad` · `Cookies` · `Aviso legal` · `Propiedad intelectual` — `--fs-sm`/`--text-tertiary` → hover `--text-secondary`, separados por punto medio `·` |
| Derecha | Selector de idioma: `globe` 16 + `Español` + `chevron-down` 16, alto 32, `--radius-control`, hairline, `--fs-sm`/`--text-secondary` |

Los legales apuntan a las rutas que ya existen: `/legal/terminos`, `/legal/privacidad`,
`/legal/cookies`, `/legal/aviso-legal`, `/legal/propiedad-intelectual`.

━━━

## 2. Jerarquía tipográfica

| Elemento | Token | Weight | Color |
|---|---|---|---|
| Wordmark | 17px (atado al isotipo, ver `marca.md` §3) | 600 | `--text-primary` |
| Línea descriptiva | `--fs-sm` | 400 | `--text-secondary` |
| Título de columna | `--fs-label` | 600 | `--text-tertiary` |
| Enlace de columna | `--fs-sm` | 400 | `--text-secondary` |
| `Ver todas →` | `--fs-sm` | 500 | `--accent` |
| Copyright | `--fs-sm` | 400 | `--text-tertiary` |
| Legales | `--fs-sm` | 400 | `--text-tertiary` |
| Selector de idioma | `--fs-sm` | 500 | `--text-secondary` |

**El footer no usa ningún token por encima de `--fs-sm`** salvo el wordmark. Es el pie: informa,
no argumenta. Un `<h2>` en el footer compite con el CTA final que lo precede.

━━━

## 3. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico: marca 28 % + cuatro columnas 72 %. |
| **1024–1279** | Igual, gap de columnas a `--sp-6`. |
| **768–1023** | Marca a ancho completo arriba; las cuatro columnas debajo en **2 × 2**, gap `--sp-8`. Fila inferior conservada en tres zonas. |
| **<768** | Todo apilado: marca → cuatro columnas **en una sola columna**, cada título con su lista debajo, gap `--sp-8` entre grupos. Fila inferior en tres líneas centradas: copyright, legales (que envuelven con `flex-wrap`) y selector de idioma. `--touch-target: 44px` real en cada enlace. |

Las columnas del footer **no se convierten en acordeón** en móvil: son cuatro listas cortas, y un
acordeón añade un clic para ver cuatro enlaces.

━━━

## 4. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Icon Button** | `core/icon-button.md` | Botones de redes, con `aria-label` obligatorio |
| **Icon** | `guidelines/iconografia.md` | `book-open`, `globe`, `chevron-down`, `arrow-right` |
| **Dropdown Menu** | `core/dropdown-menu.md` | Selector de idioma |
| **Marca** | `guidelines/marca.md` | Lockup horizontal en tamaño de footer |

━━━

## 5. Accesibilidad y SEO

- `<footer>` con `role="contentinfo"` implícito; cada bloque de enlaces en un `<nav>` con
  `aria-label` propio (`aria-label="Producto"`, `aria-label="Legal"`).
- Los iconos de redes llevan `aria-label` con destino explícito
  (`aria-label="Cuaderno en LinkedIn"`), y el icono va `aria-hidden`.
- El selector de idioma es un menú real que cambia la ruta y el `lang` del documento, no un
  desplegable decorativo. Si solo hay español, **no se pinta**: un selector con una sola opción es ruido.
- El footer es el mapa del sitio para los rastreadores: enlaces reales en HTML, sin `onClick`
  navegando por JavaScript.
- El año del copyright se calcula en servidor para no desincronizar el HTML estático.

━━━

## 6. El footer del blog del tenant es otro

Este footer es el de **cuaderno.com**. El blog público del usuario tiene el suyo, y Cuaderno aparece
ahí una sola vez: isotipo 16 + `Hecho con Cuaderno` en `--fs-sm`/`--text-tertiary`, enlazado a la
landing. Removible en planes de pago. Ver `guidelines/marca.md` §7.

**Nunca se reutiliza este componente en el sitio del tenant.** Sus enlaces son nuestros, no suyos.

━━━

## 7. Reglas duras

1. **Cero botón negro en el footer.** El CTA ya se agotó en `cta-final.md`.
2. Índigo solo en `Ver todas →`. Ningún otro enlace del footer se colorea.
3. Sin formulario de newsletter aquí: si el producto lo necesita, es una sección propia sobre el
   footer, con su hairline y su propio bloque.
4. Sin logos de pago, sin insignias de confianza, sin sellos.
5. Las columnas no colapsan en acordeón en móvil.
6. El selector de idioma desaparece si solo hay un idioma.
