# Marca

> Fuente: `../ui-ux-panels/01-landing-home.png` (nav) y las 8 pantallas de panel (sidebar).
> Donde el código y una pantalla no coincidan, gana la pantalla.

## 1. Los dos elementos

La marca es **isotipo + wordmark**. No hay tercer elemento: ni tagline en el lockup, ni encuadre, ni fondo propio.

**Isotipo — libro abierto.** Dos páginas abiertas vistas de frente, lomo central visible, esquinas suavizadas. Se dibuja con las mismas reglas que el resto de la iconografía: outline, trazo 1.5px sobre grid de 24px, terminaciones y uniones redondeadas, sin relleno. Es literalmente el icono `book-open` del set del producto, elevado a marca — esa coherencia es intencional y no debe romperse dibujando una versión "especial" con trazo distinto.

**Wordmark — `cuaderno`.** Siempre en minúsculas, incluida la inicial. Se compone en `--font-sans` con weight 600, tracking `-0.02em`, sin alterar el espaciado entre letras más allá de eso. El wordmark no es una imagen: es texto vivo, lo que garantiza que herede el tema claro/oscuro y quede nítido en cualquier densidad.

## 2. Lockups

| Lockup | Composición | Dónde |
|---|---|---|
| **Horizontal** (canónico) | isotipo + gap `--sp-2` + wordmark, alineados por su centro óptico | Sidebar del panel, nav de la landing, footer, emails |
| **Isotipo solo** | isotipo | Favicon, app icon, avatar del sistema, sidebar colapsado en tablet, badge "Hecho con Cuaderno" |
| **Vertical** | isotipo sobre wordmark, gap `--sp-3`, ambos centrados | Solo pantallas de auth (iniciar sesión / registro) y pantallas de carga a pantalla completa |

No existe un lockup con tagline. No existe un lockup con el nombre del blog del usuario: el selector de blog (`Mi blog · miblog.cuaderno.com`) es un componente aparte, en el pie del sidebar, y nunca se fusiona con el logo.

## 3. Proporciones y tamaños mínimos

La altura del wordmark (altura de la x + ascendentes) se ata a la del isotipo: **isotipo = 1.2× el tamaño de fuente del wordmark**.

| Contexto | Isotipo | Wordmark | Ancho total aprox. |
|---|---|---|---|
| Sidebar del panel | 26px | 22px / 600 | ~150px |
| Nav de la landing | 24px | 20px / 600 | ~138px |
| Footer, emails, documentos | 20px | 17px / 600 | ~118px |
| **Mínimo digital** | **18px** | **15px / 600** | **~104px** |
| Isotipo solo, mínimo | **16px** | — | — |

Por debajo de 18px de isotipo el lomo del libro se cierra visualmente: a partir de ahí se usa **solo el isotipo**, nunca un wordmark diminuto. Favicon en 16 / 32 / 180 (apple-touch) / 512 (manifest): a 16px se entrega una versión con el trazo engrosado a 2px, es la única variación de trazo permitida.

**Espacio de respeto:** un margen libre igual a la altura del isotipo dividida entre dos (`isotipo / 2`) en los cuatro lados. Nada — ni texto, ni borde, ni botón — entra en esa zona. En el sidebar eso se traduce en el padding de `--sp-5` que ya usa la cabecera.

## 4. Color de la marca

**El logo no es acción, ni IA, ni rendimiento: es identidad.** Por eso vive en el color del texto y nunca toma un color semántico.

| Fondo | Isotipo y wordmark |
|---|---|
| `--bg-page`, `--surface`, `--bg-sidebar`, `--surface-sunken` | `--text-primary` |
| `--action` (#111111), fondos oscuros de marketing | `--text-on-dark` |
| Modo oscuro (`--bg-page` #0C0C0D, `--surface` #151517) | `--text-primary` (#F5F5F4) |
| Fotografía | `--text-on-dark`, sobre una capa de negro al 60% mínimo |

Prohibido: logo en `--accent`, en `--perf`, en degradado, en dos tonos, con el isotipo de un color y el wordmark de otro. La única concesión: en el favicon monocromo de 16px el isotipo puede ir en `--action` sobre blanco para ganar peso.

## 5. Usos incorrectos

- Escribir el wordmark como `Cuaderno`, `CUADERNO` o `CuadernO` dentro del lockup.
- Sustituir el isotipo por el emoji 📖 o 📓. **Nunca hay emoji en la marca ni en la UI del producto.**
- Rotar, inclinar, estirar en un solo eje, o reescalar isotipo y wordmark de forma independiente.
- Añadir sombra, contorno, bisel, brillo o glow. El sistema se sostiene con borde y aire; el logo también.
- Encerrar el lockup horizontal en un círculo o cuadrado de color. El isotipo solo sí puede ir dentro de un cuadro de `--surface-sunken` con `--radius-control` cuando actúa como avatar del sistema.
- Recomponer el wordmark en otra tipografía, incluida la serif que hoy vive en el código (`Fraunces`). Esa serif desaparece del sistema.
- Usar el isotipo como bullet decorativo o como icono de una función. El libro abierto solo significa "Cuaderno" — la excepción es la sección **Lectura** de Ajustes, donde `book-open` actúa como icono de UI; ahí va a 20px, en `--text-secondary`, sin wordmark al lado, y nunca a menos de `--sp-8` de distancia de un lockup real.

## 6. El nombre escrito

- **Producto en prosa:** `Cuaderno` (mayúscula inicial). "Cuaderno es el blog con IA que te da control total…"
- **Wordmark:** `cuaderno` (minúscula). Solo dentro del lockup.
- **Plan de pago:** `Cuaderno Pro` en Title Case, siempre las dos palabras. En la tarjeta del sidebar y en Ajustes › Tu plan aparece el badge corto `Pro`.
- **Dominio de tenant:** `miblog.cuaderno.com` — el subdominio del usuario primero, `cuaderno.com` como raíz, todo en minúsculas y en `--font-sans`, nunca en monoespaciada.
- Nunca `CUADERNO`, nunca "el Cuaderno", nunca traducir el nombre.

## 7. La marca dentro del producto del usuario

El blog público del tenant es del tenant, no nuestro. Cuaderno aparece ahí una sola vez, en el pie: isotipo 16px + texto `Hecho con Cuaderno` en `--fs-sm` / `--text-tertiary`, enlazado a la landing. En planes de pago ese pie es removible; en el plan gratuito no. No hay marca de agua, ni badge flotante, ni banner.

## 8. Checklist antes de usar el logo

1. ¿El wordmark está en minúsculas y en `--font-sans` 600?
2. ¿El isotipo mide 1.2× el tamaño del wordmark?
3. ¿Hay `isotipo / 2` de aire libre alrededor?
4. ¿El color es `--text-primary` o `--text-on-dark`, y ninguno de los tres colores semánticos?
5. Si el isotipo baja de 18px, ¿se eliminó el wordmark?
