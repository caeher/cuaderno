# Estados

> Fuente: las 9 pantallas de `../ui-ux-panels/`. Donde el código y una pantalla no coincidan, gana la pantalla.

━━━

## 0. La regla que gobierna este documento

**El estado de carga no es pulido posterior: es parte del componente.** Un componente que no define sus cuatro estados no está terminado y no entra a `main`.

Los cuatro, para todo patrón:

1. **Carga** — cómo se ve mientras llega el dato.
2. **Vacío** — cómo se ve cuando no hay dato, distinguiendo *nunca hubo* de *el filtro no encontró nada*.
3. **Error** — cómo se ve cuando falla, y qué puede hacer el usuario.
4. **Con dato** — el que ya muestran las pantallas.

Y un quinto para todo lo que toca IA: **en curso, cancelable, con señal de vida**. Las llamadas de IA tardan entre 2 y 20 segundos. Un botón que se queda quieto 12 segundos es un producto roto, aunque el resultado luego sea perfecto.

━━━

## 1. Skeleton — especificación única

Un solo componente `<Skeleton />` para todo el sistema.

- Fondo `--surface-sunken`. Radio: **el del elemento que sustituye** — `--radius-input` para texto y campos, `--radius-thumb` para thumbnails, `50%` para avatares, `--radius-card` para bloques.
- Altura de un skeleton de texto = la interlínea del token que reemplaza (`--fs-body` → 22px; `--fs-h1` → 34px), no una altura arbitraria.
- Shimmer: 1.2s, `--ease-out`, alternando entre `--surface-sunken` y `color-mix(in oklch, var(--surface-sunken) 60%, var(--surface))`. Bajo `prefers-reduced-motion`, sin animación: bloque estático.
- **Retardo de 150ms antes de pintarlo.** Si la respuesta llega antes, no se muestra nada: el parpadeo se percibe como fallo. Una vez pintado, permanece **mínimo 300ms** para no destellar.
- **Cero cambio de alto.** El skeleton ocupa exactamente el espacio del contenido final: la tabla dibuja el mismo número de filas que la página anterior (6 por defecto), la stat card conserva su altura, el gráfico reserva su alto exacto. Layout shift cero.
- **Nunca un spinner a pantalla completa** en la carga inicial. El spinner (`loader-circle`) solo existe dentro de un botón que el usuario acaba de pulsar.
- Accesibilidad: contenedor con `aria-busy="true"`, los skeletons con `aria-hidden="true"`, y un `role="status"` con texto (`Cargando entradas`) para lectores de pantalla.
- **Lo estático se pinta de inmediato.** Labels, iconos, cabeceras de tabla, ejes del gráfico y títulos de tarjeta no dependen del servidor: aparecen ya. Solo el dato lleva skeleton. Esto hace que la pantalla se sienta cargada aunque no lo esté.

━━━

## 2. Vacíos y errores — anatomía común

**Vacío.** Centrado en el área del contenido, con `--sp-12` de aire arriba y abajo:
icono outline 24 dentro de un círculo de 72px `--surface-sunken` en `--text-tertiary` → `--sp-4` → título en `--fs-h3` → `--sp-2` → cuerpo en `--fs-sm`/`--text-secondary`, máximo dos líneas → `--sp-5` → acción.
**Sin ilustraciones de stock, sin escenas generadas, sin mascota.** Un icono, dos frases y un botón.

**Error.** Misma anatomía, con `triangle-alert` en `--warn` o `circle-alert` en `--danger`, título que dice qué falló en lenguaje llano (`No pudimos cargar tus entradas`), una línea de causa si se conoce, y **siempre** un botón secundario `Reintentar`. Nunca se muestra el mensaje crudo del servidor ni un código de error como titular.

**Si ya había datos en pantalla, el error no los borra.** Se muestra un banner sobre el contenido antiguo: fondo `--warn-tint`, hairline, `--fs-sm`, texto `No pudimos actualizar los datos` + `Reintentar`. Contenido obsoleto visible es mejor que una pantalla en blanco.

━━━

## 3. Tabla (03 Entradas, 05 Páginas, 06 Categorías, 02 Entradas recientes)

**Carga.** 6 filas fantasma de 72px con la geometría real: checkbox, thumbnail 56, dos barras de título (100% y 65% de ancho), chip de categoría, badge, fecha en dos líneas, anillo gris y hueco de acciones. Cabecera, tabs, buscador y paginación se pintan ya, con la paginación deshabilitada.

**Cambio de página o de filtro.** No se vuelve al skeleton completo: la tabla baja a `opacity: .6` con `pointer-events: none` durante `--dur-base` y conserva su altura. Volver al skeleton en cada clic hace que la lista parpadee.

**Vacío por primera vez.** `file-text` · `Aún no tienes entradas` · `Crea tu primera entrada y empieza a publicar.` · botón negro `Nueva entrada`.
Variantes: Páginas → `Aún no tienes páginas` / `Nueva página`. Categorías → `Aún no tienes categorías` / `Organiza tus entradas por temas.` / `Nueva categoría`.

**Vacío por filtro o búsqueda.** `search` · `Sin resultados para “inteligencia”` · `Prueba con otro término o quita los filtros.` · botón **secundario** `Limpiar filtros`. **Aquí nunca va el CTA de creación**: el usuario está buscando, no creando.

**Vacío por tab de estado.** Texto específico y sin dramatismo: `No hay entradas programadas.` / `La papelera está vacía.` Sin icono ni botón: basta una línea en `--fs-sm`/`--text-secondary` con `--sp-8` de aire.

**Error.** Vacío con `triangle-alert` + `Reintentar`. La cabecera, las tabs y los contadores permanecen.

**Fila individual.**
- *Creación optimista*: la fila entra ya con fondo `--accent-tint` que se desvanece en 600ms; si el servidor rechaza, la fila se retira y salta un toast de error con `Reintentar`.
- *Acción en curso en una fila* (publicar, duplicar): la fila baja a `opacity: .6`; el menú `⋯` muestra `loader-circle`.
- *Eliminación*: la fila desaparece de inmediato y aparece un toast `Movido a la papelera · Deshacer` durante 8s. Nada de diálogo de confirmación para acciones reversibles; el diálogo se reserva a lo irreversible.
- *Thumbnail sin imagen*: cuadro `--surface-sunken` con `image` 20 en `--text-tertiary`. Nunca un rectángulo roto ni una imagen genérica.
- *Sin SEO Score*: anillo en `--border-hairline` completo y `—` en `--text-tertiary` (así lo muestran las pantallas 02 y 03 para borradores y programadas).

━━━

## 4. Grilla de tarjetas (toggle lista/grilla de 03, 05, 06)

Misma lógica: 6 tarjetas fantasma con thumbnail 16:9, dos barras de título y una fila de meta. Los textos de vacío y error son idénticos a los de la tabla — **el mensaje no depende de la vista**. Al alternar lista↔grilla no se vuelve a pedir el dato ni se muestra skeleton: es un cambio de presentación.

━━━

## 5. Métrica, anillo y gráfico

**Stat card en carga.** El cuadro de icono y el label se pintan ya. La cifra pasa a barra de 96×34 y el delta a barra de 56×18; la línea de contexto se pinta ya (es texto fijo).

**Sin dato.** Cifra `—` en `--text-tertiary` con tooltip `Sin datos en este rango`. **Nunca `0` cuando lo que falta es el dato**, y nunca `NaN`, `null` ni `undefined` en pantalla. Delta ausente: se oculta la fila del delta entera, no se pinta `0%`.

**Error de una métrica.** No rompe la fila: esa tarjeta muestra `—` con `triangle-alert` 16 en `--warn` junto al label y tooltip con el motivo. Las otras tarjetas siguen con sus datos.

**Anillo de score.**
- Carga: pista `--border-hairline` al 100% y cifra en skeleton.
- Sin analizar: pista gris, `—` en el centro, texto `Sin analizar` debajo y acción `Analizar` (secundaria).
- Con dato: el trazo anima de 0 al valor en `--dur-base` con `--ease-out`; el color sale de las bandas de `color.md` §7. Con `prefers-reduced-motion`, salta al valor final.

**Gráfico de líneas.**
- Carga: ejes, rejilla y etiquetas de eje se dibujan de inmediato en `--text-tertiary`; el área de la serie es un bloque skeleton con la altura final.
- Vacío: mismos ejes + mensaje centrado `Sin datos en este rango` + botón secundario `Ampliar rango`.
- Parcial: línea sólida hasta donde hay datos y **punteada** donde faltan; nunca se interpola inventando.
- Un solo punto: se dibuja el punto, no una línea.
- Rango cambiado: el gráfico conserva su alto y baja a `opacity: .6` mientras recarga.

**Donut de fuentes.** Vacío: anillo `--border-hairline` completo + `Sin tráfico registrado`. Categorías bajo el 1% se agrupan en `Otros` (`--cat-8`), nunca se dibujan segmentos invisibles.

**Barras de dispositivos.** Vacío: pistas grises al 0% con los tres nombres visibles, para que la forma del bloque no cambie al llegar el dato.

━━━

## 6. Editor (04)

**Carga del documento.** Título en skeleton con la altura de su input real; enlace permanente en skeleton; seis líneas de párrafo con anchos 100 / 96 / 88 / 100 / 72 / 45%. **La toolbar se pinta completa pero deshabilitada** (`opacity: .5`, `pointer-events: none`): si aparece después, la página salta. El rail de publicación monta sus acordeones con los títulos visibles y los campos en skeleton.

**Autoguardado**, en la topbar, `--fs-sm`:

| Estado | Presentación |
|---|---|
| Sin cambios | `Guardado` con `circle-check` — `--text-secondary` / icono `--text-tertiary`. **No es verde** (ver `color.md` §4). |
| Guardando | `Guardando…` con `loader-circle` 14 en `--text-tertiary` |
| Sin conexión | `Sin conexión — se guardará al reconectar` en `--warn`, persistente |
| Falló | `No se pudo guardar` en `--danger` + botón `Reintentar`. El contenido **nunca** se pierde: queda en borrador local y se reintenta solo cada 15s. |

Los tres primeros se anuncian con `role="status"` `aria-live="polite"`; el fallo con `aria-live="assertive"`.

**Publicar.** El botón entra en ocupado (`loader-circle` + `Publicando…`) con **ancho fijo** para que no salte, se deshabilita, y al terminar aparece el toast `Entrada publicada` con acción `Ver entrada`. Si falla, el botón vuelve a su estado normal y el toast explica el motivo — el usuario no pierde el trabajo ni la posición del cursor.

**Imagen destacada.** Subiendo: miniatura en skeleton con barra de progreso de 2px en `--accent` encima. Fallida: recuadro `--danger-tint` con `El archivo supera 5 MB` y `Elegir otra`. Vacía: zona punteada `--border-strong` con `image` y `Añadir imagen destacada`.

**Documento vacío.** El placeholder de TipTap es el de la pantalla: `Escribe “/” para ver las opciones o escribe con IA…`, en `--text-tertiary`.

**Contadores.** `Palabras: 0 · Tiempo de lectura: 0 min` desde el primer render, en `tabular-nums`. Nunca desaparecen ni entran en skeleton: se calculan en cliente.

━━━

## 7. IA — el estado que decide si el producto se siente vivo

Aplica a `Escribir con IA` (04), `Sugerencia de IA` (02), `Siguiente paso recomendado` (07), `IA Writer` y todo análisis del SEO Analyzer.

**Reglas duras.**

1. **Ninguna llamada de IA se dispara al montar una pantalla.** Siempre la inicia el usuario o un análisis explícito. Coste y sorpresa, ambos, se evitan igual.
2. **Nunca se bloquea el editor.** El usuario sigue escribiendo mientras la IA trabaja.
3. **Siempre cancelable.** El botón ocupado ofrece `Detener`; cancelar deja el documento exactamente como estaba.
4. **Señal de vida obligatoria a partir de los 5 segundos.** El botón pasa de `Escribiendo…` a `Escribiendo… 6s` con el contador en `tabular-nums`. Un spinner mudo durante 15s es indistinguible de una caída.
5. **Timeout a 30s** con mensaje explícito (`La generación tardó demasiado`) y `Reintentar`.
6. **El fallo de una llamada de IA nunca invalida la pantalla.** La tarjeta muestra su error y todo lo demás sigue funcionando.
7. **Nunca se muestran tokens, modelos ni coste al usuario.** Eso es telemetría interna.

**Con streaming** (preferido): el texto entra en el documento a medida que llega, con resalte `--accent-tint` que se desvanece en 600ms al cerrar el bloque, y un cursor `▍` índigo al final del texto en curso. El botón permanece en `Detener`.

**Sin streaming**: en el punto de inserción se dibuja un skeleton de párrafo de tres líneas con shimmer teñido de `--accent` — la única vez que un skeleton lleva color, y sirve para distinguir "la IA está escribiendo aquí" de "estamos cargando datos".

**Tarjeta `Sugerencia de IA` (02).**
- Carga: título con ✦ ya visible, tres líneas skeleton y el botón `Aplicar sugerencia` deshabilitado.
- Vacío: `Nada que sugerir por ahora` + `Tu contenido está en buen estado.` + botón secundario `Volver a analizar`.
- Error: `No pudimos generar la sugerencia` + `Reintentar`. **La tarjeta nunca desaparece**: un hueco en el rail se lee como bug.
- Aplicada: la tarjeta confirma con `Sugerencia aplicada` durante 3s y luego carga la siguiente.

**SEO Analyzer en análisis (07).**
- Anillo indeterminado (rotación lenta de un arco en `--accent`, no en verde: aún no hay resultado que medir).
- Progreso **textual por fase** bajo el input: `Leyendo la URL…` → `Evaluando encabezados…` → `Comprobando enlaces internos…`. Nada de barra de progreso falsa.
- Lista de factores en skeleton, con los nombres de los factores ya visibles.
- URL inválida: borde `--danger` en el input + mensaje `Introduce una URL válida de tu blog` en `--fs-sm`/`--danger` debajo. **El botón `Analizar` no se deshabilita** — el usuario debe poder reintentar sin adivinar qué está mal.
- Sin problemas detectados: `circle-check` en `--perf` + `No encontramos problemas` + `Tu contenido cumple los factores evaluados.`

━━━

## 8. Formularios (09 Ajustes)

- **Carga**: los inputs se pintan con su borde y su label reales; el skeleton va **dentro** del campo, no lo sustituye. La nav secundaria y los títulos de bloque aparecen ya.
- **Guardando**: `Guardar cambios` con `loader-circle` y ancho fijo. El formulario no se deshabilita entero; solo el botón.
- **Éxito**: toast neutro `Cambios guardados` y el botón vuelve a estar **deshabilitado hasta que haya un cambio nuevo**. El botón activo sin nada que guardar es ruido.
- **Error de campo**: borde `--danger`, mensaje en `--fs-sm`/`--danger` bajo el campo, `aria-invalid` y `aria-describedby`; el foco salta al primer campo con error.
- **Error global**: banner `--danger-tint` con hairline arriba del formulario, con el detalle y `Reintentar`.
- **Cambios sin guardar**: al intentar navegar, diálogo `Tienes cambios sin guardar` con `Descartar` (secundario) y `Guardar` (negro).
- **Zona de peligro**: `Eliminar mi sitio` abre un diálogo que exige escribir el nombre del sitio; el botón destructivo permanece deshabilitado hasta que coincide exactamente. Sin cuenta atrás, sin doble confirmación teatral.

━━━

## 9. Navegación, toasts y desconexión

- Al cambiar de pantalla, **sidebar y topbar no parpadean**: solo el área de contenido entra en carga. El item de nav destino se marca activo de inmediato, antes de que llegue el dato.
- **Toasts** (`sonner`): abajo a la derecha, `--surface`, hairline, `--radius-control`, `--shadow-float`, `--fs-body`. 4s informativo, 8s cuando lleva `Deshacer`. Máximo 3 apilados; el cuarto sustituye al más antiguo. Un toast **nunca** es el único canal de un error que bloquea trabajo — eso va en la pantalla.
- **Sin conexión**: banda de 32px bajo la topbar, `--warn-tint`, `--fs-sm`: `Sin conexión — los cambios se guardarán al reconectar.` Desaparece sola al volver.
- **Sesión expirada**: diálogo modal con `Tu sesión ha expirado` e `Iniciar sesión`, sin expulsar de la pantalla ni perder el borrador local.
- **404 / 403 dentro del panel**: se mantiene el chrome completo (sidebar y topbar) y el área de contenido muestra el vacío correspondiente con `Volver al resumen`. Nunca una página desnuda.

━━━

## 10. Checklist por componente

1. ¿Están definidos los cuatro estados, y el quinto si toca IA?
2. ¿El skeleton ocupa exactamente el alto final? ¿Layout shift cero?
3. ¿Lo estático (labels, iconos, ejes, cabeceras) se pinta antes que el dato?
4. ¿Se distingue *nunca hubo dato* de *el filtro no encontró nada*?
5. ¿El error deja al usuario una salida (`Reintentar`, `Limpiar filtros`, `Volver`)?
6. ¿Toda acción larga es cancelable y da señal de vida a los 5s?
7. ¿Los datos previos sobreviven al error?
8. ¿Hay `aria-busy` y una `role="status"` que anuncie el cambio?
9. ¿Se respeta `prefers-reduced-motion`?
