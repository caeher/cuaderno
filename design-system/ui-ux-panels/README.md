# Pantallas oficiales de Cuaderno — fuente de verdad del diseño

Estas 9 pantallas son la **fuente oficial** del rediseño. Todo componente, token y pantalla del producto se deriva de acá. Si una decisión visual no se puede rastrear a una de estas imágenes o a los tokens que salen de ellas, no es una decisión — es una invención.

## Índice

| Archivo | Qué muestra | Ruta destino |
|---|---|---|
| `01-landing-home.png` | **Landing de marketing.** Nav con Funciones/Precios/Plantillas/Recursos/Blog, hero "Escribe. Optimiza. Destaca.", CTA negro + "Ver demo", 3 micro-features, captura del producto en tarjeta, grilla "Un blog, infinitas posibilidades" | **No existe todavía** — hay que construirla |
| `02-panel-resumen.png` | Dashboard: 4 stat cards, tabla de entradas recientes, panel derecho con SEO Analyzer, Sugerencia de IA y Publicaciones programadas, gráfico de rendimiento, acciones rápidas | `app/panel/` |
| `03-panel-entradas.png` | Lista de entradas: tabs por estado con contador, buscador, tabla con thumbnail, autor, categorías, estado, fecha y anillo de SEO Score, paginación | `app/panel/posts/` → renombrar a `entradas` |
| `04-panel-editor-de-entrada.png` | Editor: título, enlace permanente, barra de TipTap con "Escribir con IA", contador de palabras y tiempo de lectura; sidebar de publicación con Estado/Visibilidad, Categorías, Etiquetas, Imagen destacada, Extracto | `app/panel/posts/[id]/` |
| `05-panel-paginas.png` | Lista de páginas: 4 stat cards (total/publicadas/borradores/privadas), tabla con slug, estado, fecha, autor y handle de arrastre | **No existe todavía** |
| `06-panel-categorias.png` | Categorías: stat cards, tabla con punto de color por categoría, descripción y conteo de entradas, acciones editar/eliminar | `app/panel/taxonomias/` → separar en `categorias` |
| `07-panel-seo-analyzer.png` | SEO Analyzer: tabs, input de análisis de URL, 4 métricas, lista de problemas y oportunidades con severidad, panel derecho con score, factores evaluados y siguiente paso | **No existe todavía** |
| `08-panel-analiticas.png` | Analíticas: selector de rango, tabs, 5 métricas, gráfico de líneas comparativo, donut de fuentes de tráfico, entradas populares, barras por dispositivo | **No existe todavía** |
| `09-panel-ajustes.png` | Ajustes: navegación secundaria vertical de 12 secciones, formularios de sitio/usuario/lectura/publicación, panel derecho con Cuenta, Tu plan, Exportar/Importar y zona de peligro | `app/panel/configuracion/` → renombrar a `ajustes` |

## El lenguaje visual, leído de las pantallas

**La regla de color que gobierna todo — tres colores con tres significados distintos:**

- **Negro `#111111` = la acción del usuario.** Todo CTA primario: "Nueva entrada", "Publicar", "Analizar", "Guardar cambios", "Comenzar gratis".
- **Índigo `#6366F1` = el producto pensando y la navegación.** Item activo del sidebar (fondo `#EEF0FE` + texto índigo), tarjeta "Cuaderno Pro", el destello ✦, enlaces "Ver todas", badge "Programado", subrayado de tab activo, línea del gráfico, paginación activa.
- **Verde `#10B981` = rendimiento y éxito.** Anillos de SEO Score, badge "Publicado", deltas positivos ↑, checks de factores en orden.

Si el índigo aparece donde no hay navegación ni IA, o el verde donde no se está midiendo rendimiento, está mal puesto.

**Superficies.** Papel `#FAFAF9` de fondo, blanco `#FFFFFF` en sidebar y tarjetas, hairline `#EAEAE8` de 1px siempre visible. Sombras casi inexistentes: el sistema se sostiene con borde y aire.

**Estados como color semántico**, separados del acento: `Publicado` verde sobre `#DCFCE7` · `Borrador` ámbar `#F59E0B` sobre `#FEF3C7` · `Programado` índigo sobre `#EEF0FE` · `Privada` gris. Destructivo `#EF4444` ("Mover a la papelera", "Eliminar mi sitio").

**Chrome del panel.** Sidebar de ~260px con el logo (libro abierto + wordmark `cuaderno` en minúsculas), un grupo de navegación de contenido, un divisor, un segundo grupo de herramientas de IA (IA Writer, SEO Analyzer, Analíticas), el selector de blog, la tarjeta Cuaderno Pro y el toggle de tema. Topbar con buscador ⌘K, toggle de tema, notificaciones con punto y menú de usuario.

**Patrones repetidos** que deben existir como componentes y no reimplementarse por pantalla: stat card con icono en cuadro tintado + delta, tabla con thumbnail y badges y menú ⋮, handle de arrastre `⠿` en listas reordenables, tabs con subrayado, anillo de score, gráfico de líneas con área, donut con leyenda, barras de progreso horizontales, paginación, y el par header-de-página (H1 + subtítulo + acciones a la derecha).

**Tipografía.** Sans geométrica humanista. Landing con display apretado y de gran tamaño; panel con jerarquía tranquila. Números tabulares en toda métrica.

**Modo claro y oscuro.** Las pantallas muestran el toggle en el sidebar y en el topbar — el sistema nace con los dos temas, no con uno.
