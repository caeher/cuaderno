# Landing · CTA final — la única inversión de la página

> **Fuente:** la pantalla oficial no dibuja esta sección. Patrón derivado en
> `../../guidelines/landing.md` §5: *banda `--action` a ancho completo, `--text-on-dark`, titular en
> `--fs-h1` y botón **blanco** (`--surface` + `--text-primary`) — es la única inversión de la página*.
> **Estado en el código:** no existe.

━━━

## 1. Anatomía

Banda a **ancho completo del viewport** (rompe `--content-max`; el contenido interior sí se limita
a 1200px centrados). Fondo `--action` `#111111`. Sin radio, sin sombra, sin borde: el cambio de
superficie es el separador.

```
████████████████████████████████████████████████████████████████████████
█                                                                      █
█            Tu blog puede estar en línea hoy.                         █
█            Empieza gratis. Sin tarjeta, sin permanencia.             █
█                                                                      █
█                   [ Comenzar gratis ]   Ver planes →                 █
█                                                                      █
████████████████████████████████████████████████████████████████████████
```

| Propiedad | Valor |
|---|---|
| Fondo | `--action` |
| Padding vertical | `--sp-16` (`--sp-12` en `<768`) |
| Alineación | Centrada en los dos ejes |
| Ancho de contenido | `max-width: 640px` centrado, `padding-inline: var(--sp-8)` |
| Separación con la sección anterior | ninguna: la banda arranca donde termina el hairline de la anterior |

**Contenido, de arriba abajo:**

| # | Pieza | Especificación |
|---|---|---|
| 1 | **Titular (`<h2>`)** | `Tu blog puede estar en línea hoy.` — `--fs-h1`/600/`--text-on-dark`, `text-wrap: balance` |
| 2 | `--sp-3` | |
| 3 | **Bajada** | `Empieza gratis. Sin tarjeta, sin permanencia.` — `--fs-body`/400, `--text-on-dark` al **72 %** de opacidad (`color-mix(in oklch, var(--text-on-dark) 72%, transparent)`) |
| 4 | `--sp-8` | |
| 5 | **Par de acciones** | Fila centrada, gap `--sp-4`. `Comenzar gratis` (**botón blanco**, alto 48, padding-x `--sp-6`) + `Ver planes →` (enlace de texto en `--text-on-dark`, con `arrow-right` 16) |

━━━

## 2. La inversión de color — y por qué es legal

En toda la página, negro significa **acción del usuario**. Aquí la banda entera es negra, así que un
botón negro sería invisible. La solución no es meter índigo ni verde: es **invertir**.

| | En el resto de la página | En esta banda |
|---|---|---|
| Superficie | `--bg-page` / `--surface` | `--action` |
| CTA primario | Fondo `--action`, texto `--text-on-dark` | Fondo `--surface`, texto `--text-primary` |
| CTA secundario | `--surface` + hairline + `--text-primary` | Enlace de texto en `--text-on-dark` |
| Texto | `--text-primary` / `--text-secondary` | `--text-on-dark` y `--text-on-dark` al 72 % |

El botón sigue siendo **el elemento de mayor contraste de su superficie**, que es lo que la regla de
color realmente dice. Se invierte el par, no el significado.

**Esta es la única inversión de la landing.** Ninguna otra sección tiene fondo oscuro. Si aparece una
segunda banda negra, la primera deja de ser el cierre y la página pierde su punto final.

### Estados del botón blanco

| Estado | Fondo | Texto |
|---|---|---|
| Reposo | `--surface` | `--text-primary` |
| Hover | `--surface-sunken` | `--text-primary` |
| Activo | `--border-hairline` | `--text-primary` |
| Foco | `--surface` + anillo `0 0 0 3px rgba(255,255,255,.35)` — **el `--focus-ring` índigo no contrasta sobre negro** | `--text-primary` |
| Ocupado | `--surface` al 70 %, `loader-circle` 16 en `--text-primary`, ancho fijo | `--text-primary` |

El anillo de foco alternativo se declara como override local de la banda, no como token nuevo: es
la misma decisión que ya toma `core/button.md` para el botón sobre fondo oscuro.

━━━

## 3. Jerarquía tipográfica

| Elemento | Token | Weight | Color |
|---|---|---|---|
| Titular (`<h2>`) | `--fs-h1` | 600 | `--text-on-dark` |
| Bajada | `--fs-body` | 400 | `--text-on-dark` @ 72 % |
| Botón | `--fs-body` | 600 | `--text-primary` |
| Enlace secundario | `--fs-body` | 500 | `--text-on-dark` |

**No se usa `--fs-display` aquí.** Es el cierre, no la apertura: el titular del hero manda y este
lo remata sin competir.

━━━

## 4. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Canónico. Acciones en fila centrada. |
| **1024–1279** | Igual, padding vertical `--sp-12`. |
| **768–1023** | Igual; titular a `--fs-h2` si rompe en más de dos líneas. |
| **<768** | Padding vertical `--sp-12`, `padding-inline: var(--sp-5)`. Titular en `--fs-h2`. Acciones **apiladas**: botón blanco a ancho completo arriba, alto 48; enlace `Ver planes →` debajo, centrado, con `--sp-4` de separación y área táctil de 44px. |

━━━

## 5. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Button** | `core/button.md` | CTA blanco — variante sobre fondo oscuro |
| **Icon** | `guidelines/iconografia.md` | `arrow-right` 16 en el enlace secundario |
| **Color** | `guidelines/color.md` | `--action`, `--text-on-dark` y la regla de inversión |

━━━

## 6. Modo oscuro

En modo oscuro, `--bg-page` es `#0C0C0D` y `--surface` es `#151517`. Una banda `--action`
(`#111111`) quedaría **casi indistinguible del fondo** y la sección desaparecería.

**Solución:** en `:root[data-theme="dark"]`, la banda usa `--surface-sunken` como fondo, hairline
arriba y abajo, y el botón vuelve a su forma normal — fondo claro invertido según la definición
oscura de `--action`, texto `--text-on-dark`. Es decir: **en oscuro, esta sección deja de invertir**.
La inversión existe para destacar sobre papel claro; sobre papel oscuro no hace falta.

Se resuelve con tokens locales de la sección, nunca redefiniendo `--action`:

```css
.cta-final { --cta-bg: var(--action); --cta-fg: var(--text-on-dark); }
:root[data-theme="dark"] .cta-final,
:root:not([data-theme="light"]) .cta-final { --cta-bg: var(--surface-sunken); --cta-fg: var(--text-primary); }
```

━━━

## 7. Reglas duras

1. **Una sola banda oscura en toda la landing**, y es esta.
2. El botón es blanco. Nunca índigo, nunca verde, nunca con borde.
3. El anillo de foco sobre negro es blanco al 35 %, no el `--focus-ring` índigo.
4. El titular no usa `--fs-display`.
5. Sin degradado, sin textura, sin patrón de puntos, sin glow detrás del texto.
6. Un solo botón. `Ver planes →` es enlace de texto, no un segundo botón.
7. Sin signos de exclamación, sin cuenta atrás, sin urgencia fabricada.
