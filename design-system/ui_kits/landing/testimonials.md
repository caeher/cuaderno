# Landing · Testimonials — prueba social

> **Fuente:** la pantalla oficial no dibuja esta sección. Patrón derivado en
> `../../guidelines/landing.md` §5: *banda de `--surface-sunken`, logos en `--text-tertiary` a una
> sola tinta, o tres cifras en `--fs-h1` `tabular-nums` con label `--fs-sm`*.
> **Estado en el código:** no existe.

━━━

## 1. Las dos formas de la sección

El sistema define **dos formas**, y se elige una según lo que el producto pueda demostrar hoy.
No se usan las dos a la vez: dos bloques de prueba social seguidos leen como inseguridad.

### Forma A — Banda de cifras *(la que se usa mientras no haya clientes citables)*

Banda sobre `--surface-sunken`, sin radio, hairline arriba y abajo, padding vertical `--sp-12`.
Tres cifras en fila, separadas por hairlines verticales de altura completa.

```
┌───────────────────┬───────────────────┬───────────────────┐
│      1 240        │       38 %        │      4,2 min      │
│  blogs publicados │  más tráfico      │  para publicar    │
│                   │  orgánico         │  tu primera       │
│                   │  a los 90 días    │  entrada          │
└───────────────────┴───────────────────┴───────────────────┘
```

| Elemento | Especificación |
|---|---|
| Cifra | `--fs-h1`/600/`tabular-nums`/`--text-primary` |
| Label | `--fs-sm`/400/`--text-secondary`, máximo tres líneas, centrado |
| Separación cifra → label | `--sp-2` |
| Columnas | `repeat(3, minmax(0, 1fr))`, hairline vertical entre ellas |

**Las cifras de resultado pueden ir en `--perf`** — es rendimiento medido, que es exactamente lo
que significa el verde. Las cifras de volumen (`1 240 blogs publicados`) van en `--text-primary`:
no miden rendimiento, cuentan inventario. Esa distinción es la regla de color aplicada, no un capricho.

**Ninguna cifra se publica sin dato real detrás.** Una métrica inventada en la página que vende
analíticas es una contradicción del producto.

### Forma B — Tarjetas de testimonio *(cuando haya clientes que citar)*

Sección sobre `--bg-page`, hairline superior, padding vertical `--sp-16`.
Cabecera centrada (eyebrow `QUIÉN LO USA` + `<h2>`), `--sp-10`, y tres tarjetas en columnas iguales.

**La tarjeta de testimonio:**

| Propiedad | Valor |
|---|---|
| Contenedor | `--surface`, borde 1px `--border-hairline`, `--radius-card`, padding `--sp-6` |
| Sombra | ninguna |
| Cita | `--fs-body`/400/1.6/`--text-primary`, entre comillas latinas `«…»`, máximo 4 líneas |
| Separación | `--sp-5` |
| Firma | Avatar 40 circular + dos líneas: nombre `--fs-body`/600/`--text-primary` y rol + blog en `--fs-sm`/`--text-secondary` |
| Métrica opcional | Píldora bajo la firma: `+62 % de tráfico en 3 meses`, `--fs-label`/600, `--perf-tint`/`--perf-strong`, `--radius-pill`, alto 24 |

Sin comilla decorativa gigante de fondo, sin estrellas, sin logo del cliente dentro de la tarjeta.
La cita, la cara y el nombre. Nada más.

**Banda de logos** (opcional, bajo las tarjetas, separada `--sp-12` con hairline superior):
logos a **una sola tinta** en `--text-tertiary`, alto uniforme de 24px, `opacity: 1` — la tinta ya
los apaga, no hace falta bajar la opacidad. Gap `--sp-10`, centrados, con una línea encima:
`Escriben en Cuaderno` en `--fs-sm`/`--text-tertiary`.

━━━

## 2. Jerarquía tipográfica

| Elemento | Token | Weight | Color |
|---|---|---|---|
| Eyebrow | `--fs-label` | 600 | `--text-tertiary` |
| Título de sección (`<h2>`) | `--fs-h1` | 600 | `--text-primary` |
| Cifra (forma A) | `--fs-h1` | 600 | `--text-primary` o `--perf` si es resultado |
| Label de cifra | `--fs-sm` | 400 | `--text-secondary` |
| Cita | `--fs-body` / 1.6 | 400 | `--text-primary` |
| Nombre de quien cita | `--fs-body` | 600 | `--text-primary` |
| Rol y blog | `--fs-sm` | 400 | `--text-secondary` |
| Píldora de métrica | `--fs-label` | 600 | `--perf-strong` |
| Línea de logos | `--fs-sm` | 400 | `--text-tertiary` |

La cita va en `--text-primary` y **no en cursiva**: la cursiva en una sans geométrica a 14px pierde
legibilidad y no aporta jerarquía que las comillas no den ya.

━━━

## 3. Responsive

| Ancho | Comportamiento |
|---|---|
| **≥1280** | Forma A: tres cifras en fila con hairlines verticales. Forma B: tres tarjetas. |
| **1024–1279** | Igual, gap a `--sp-4`. |
| **768–1023** | Forma A: tres cifras en fila, label a dos líneas. Forma B: **2 columnas**, la tercera tarjeta a ancho completo debajo. |
| **<768** | Forma A: **una columna**, cifras apiladas con hairline **horizontal** entre ellas (el separador rota con el eje), padding vertical `--sp-6` por cifra. Forma B: una columna, gap `--sp-4`. Banda de logos en dos filas de tres, gap `--sp-6`. |

━━━

## 4. Componentes del sistema que consume

| Componente | Ruta | Uso |
|---|---|---|
| **Avatar** | `core/avatar.md` | Firma del testimonio, 40px, con `AvatarFallback` de iniciales |
| **Badge** | `core/badge.md` | Píldora de métrica, variante neutra sobre `--perf-tint` |
| **Content grid** | `layout/content-grid.md` | Grilla de tres columnas |
| **Card** | `core/card.md` | Tarjeta de testimonio |

**No consume `Stat Card`** en la forma A: la stat card lleva cuadro de icono tintado, delta y línea
de contexto, y aquí sobran los tres. Es una cifra desnuda con su label.

━━━

## 5. Reglas duras

1. **Una forma o la otra, nunca las dos.**
2. Ninguna cifra sin dato real detrás, y ninguna cita sin permiso escrito de quien la firma.
3. Verde solo en cifras de **resultado**. El volumen va en `--text-primary`.
4. Sin estrellas, sin puntuaciones de 5/5, sin logos de sitios de reseñas.
5. Logos a una sola tinta `--text-tertiary`, altura uniforme. Nunca a color.
6. Cero CTA en esta sección: es prueba, no venta.
7. Avatares reales o iniciales. Nunca retratos de banco de imágenes ni caras generadas.
