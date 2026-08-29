# Plan integral — Épica #13: Composer

> Plan de ejecución para la épica **#13 — Composer: research conversacional, borradores e imágenes con OpenAI**, que agrupa los issues #14 a #20.
>
> Este documento no reemplaza a los issues: los ordena, fija los contratos entre ellos y deja explícito lo que hay que decidir antes de escribir código.

---

## 1. Qué es Composer y qué NO es

Composer es un asistente conversacional del panel que convierte la intención del usuario en **investigación verificable, un borrador editorial e imágenes listas para revisión**.

La restricción que define todo el diseño: **Composer nunca publica.** Su salida terminal es un post en estado `draft` que el usuario revisa y publica con el flujo que ya existe. Cualquier atajo que lleve contenido generado directo a `published` viola el criterio de aceptación de la épica.

Tres invariantes que no se negocian y que hay que poder demostrar en revisión:

1. **Las claves de OpenAI nunca llegan al navegador.** Toda llamada al proveedor ocurre en Convex actions con `"use node"`.
2. **Toda afirmación investigada se rastrea a su fuente.** Si una frase del borrador no se puede enlazar a una URL consultada, el pipeline está mal.
3. **La selección de modelo es una decisión global de servidor.** El cliente no elige ni sobrescribe modelo, calidad ni esfuerzo de razonamiento.

---

## 2. Dónde encaja en la arquitectura actual

El repo ya tiene la separación que este trabajo necesita: `lib/domain/` (entidades y reglas), `lib/infrastructure/convex/repositories/` (adaptadores) y `convex/` (funciones). Composer se suma respetándola, no en paralelo a ella.

| Capa | Qué vive acá | Qué NO vive acá |
|---|---|---|
| `convex/composer/*.ts` | Queries y mutations de sesiones, jobs y artefactos | Llamadas a OpenAI |
| `convex/composerNode.ts` | Actions `"use node"`: research, escritura, imágenes | Lógica de negocio de posts |
| `convex/lib/ai/` | Cliente de OpenAI, resolución de modelos desde entorno, moderación | Nada que el cliente pueda importar |
| `lib/domain/composer/` | Entidades y máquina de estados, sin dependencias de infraestructura | I/O |
| `components/panel/composer/` | Chat, progreso, revisión | `fetch` a proveedores de IA |

**La regla de frontera:** ningún componente de `components/**` ni ninguna server action de `app/actions/**` habla con OpenAI. Hablan con Convex; Convex habla con OpenAI.

---

## 3. Modelo de datos (issue #15)

Cuatro tablas nuevas en `convex/schema.ts`. Todas llevan `tenantId` y su índice `by_tenant`, como el resto del esquema.

```
composerSessions
  tenantId, authorId, title
  brief: { tema, audiencia, tono, idioma, longitud, seo, restricciones }
  status: collecting | awaiting_confirmation | researching | drafting | imaging
          | awaiting_review | failed | cancelled
  createdAt, updatedAt
  índices: by_tenant, by_tenant_and_status

composerJobs            // una unidad de trabajo asíncrono; sobrevive al cierre del navegador
  sessionId, tenantId
  kind: research | outline | article | image | moderation
  status: queued | running | succeeded | failed | cancelled
  attempt, error, startedAt, finishedAt
  índices: by_session, by_tenant_and_status

composerArtifacts       // toda salida del modelo, versionada
  sessionId, tenantId
  kind: outline | article | excerpt | taxonomy | alt_text | cover
  content (texto) | storageId (imágenes)
  version, supersededBy
  índices: by_session, by_session_and_kind

composerSources         // la trazabilidad de la que depende el criterio de aceptación
  sessionId, tenantId
  url, title, publisher, fetchedAt, snippet
  claims: array de { texto, offsetEnArtefacto }
  índices: by_session
```

**Por qué `composerSources` es una tabla y no un campo JSON:** el criterio de aceptación exige que cada afirmación se pueda rastrear a sus fuentes. Guardarlas embebidas en el artefacto hace imposible consultarlas, deduplicarlas entre sesiones o mostrarlas en la UI sin parsear texto.

**Por qué existe `composerJobs` separada de la sesión:** las llamadas de research y de imagen tardan decenas de segundos. Sin una tabla de jobs, cerrar la pestaña pierde el trabajo y no hay dónde registrar reintentos. Convex da reactividad gratis: la UI se suscribe a los jobs de su sesión y el progreso aparece solo.

---

## 4. Máquina de estados

Los nombres de estado los fija el issue #15 y son los que manda:

```
collecting ───────────(usuario confirma brief)──> awaiting_confirmation
awaiting_confirmation ─(se encola research)────> researching
awaiting_confirmation ─(usuario corrige)───────> collecting
researching ──────────(fuentes suficientes)───> awaiting_confirmation  (revisión)
researching ──────────(sin fuentes útiles)────> failed
awaiting_confirmation ─(usuario confirma draft)─> drafting
drafting ─────────────(pidió portada)─────────> imaging
drafting ─────────────(sin portada)───────────> awaiting_review
imaging ──────────────(portada generada)──────> awaiting_review
awaiting_review ──────(usuario acepta)────────> handoff: crea post en `draft`
cualquiera ───────────(usuario cancela)───────> cancelled
```

Transiciones solo por mutation, nunca por action. La action reporta su resultado; la mutation decide si la transición es legal. Eso mantiene la máquina auditable y evita estados imposibles cuando dos jobs terminan a destiempo.

---

## 5. Secuencia de ejecución

El orden del epic es correcto salvo por un ajuste que explico abajo.

| # | Issue | Entrega | Depende de |
|---|---|---|---|
| 1 | **#14** Plataforma IA | Cliente de OpenAI server-only, resolución de modelos por entorno, moderación, registro de uso | — |
| 2 | **#15** Datos y orquestación | Las 4 tablas, la máquina de estados, jobs con reintento | #14 |
| 3 | **#16** Research | Búsqueda, lectura, extracción de fuentes y claims | #15 |
| 4 | **#17** Borrador | Título, outline, artículo, extracto, taxonomías, alt text + handoff a post `draft` | #16 |
| 5 | **#18** Imágenes | Portada opcional, almacenamiento en Convex Storage, opt-in para adicionales | #15 |
| 6 | **#19** Chat y revisión | La experiencia completa en el panel | #17, #18 **y el design system** |
| 7 | **#20** Evals y rollout | Evaluaciones, límites, observabilidad, feature flag | todo lo anterior |

**El ajuste: #18 no depende de #17.** El pipeline de imágenes necesita el modelo de datos y el brief, no el artículo. Puede correr en paralelo con research y escritura, lo que acorta el camino crítico.

**El bloqueo real: #19 depende del rediseño.** Construir el chat de Composer contra el frontend actual significa tirarlo cuando aterrice el design system de las 9 pantallas. #14 a #18 y #20 son backend y pueden avanzar ya; **#19 espera al design system**, y cuando llegue se construye con `ai-thinking.md`, `split-view.md` y los componentes de `feedback/` que el sistema ya especifica.

---

## 6. Selección de modelos (issue #14)

Toda la configuración se resuelve **en el servidor, desde variables de entorno de Convex**. El navegador no puede leerlas ni sobrescribirlas.

| Variable | Para qué | Valor inicial que documenta el epic |
|---|---|---|
| `OPENAI_API_KEY` | Credencial | — |
| `OPENAI_RESEARCH_MODEL` | Modelo de investigación | `gpt-5.6-luna` |
| `OPENAI_WRITING_MODEL` | Modelo de redacción | `gpt-5.6-luna` |
| `OPENAI_IMAGE_MODEL` | Modelo de imágenes | `gpt-image-1-mini` |
| `OPENAI_IMAGE_QUALITY` | Calidad de imagen | por entorno |
| `OPENAI_REASONING_EFFORT` | Esfuerzo de razonamiento | por entorno |
| `COMPOSER_ENABLED` | Feature flag de rollout | `false` |

Los nombres de modelo son **datos de configuración, no constantes de código**: se leen en tiempo de ejecución con un valor por defecto y se validan al arrancar. Cambiar de modelo no debe requerir un deploy de código.

En esta fase **no hay modelos, cuotas ni presupuestos por tenant**. El consumo se registra solo para observabilidad, en una tabla `aiUsage` con `tenantId`, `sessionId`, `kind`, tokens y costo estimado.

---

## 7. Research con trazabilidad (issue #16)

El pipeline en cuatro pasos: **buscar → leer → extraer claims con su fuente → sintetizar**.

Lo que hace que esto cumpla el criterio de aceptación y no solo lo aparente:

- Cada claim extraído guarda la URL, el título, el medio, la fecha de consulta y el fragmento textual que lo respalda.
- El prompt de síntesis recibe **solo** los claims extraídos, no la memoria del modelo. Si un dato no vino de una fuente leída, no puede entrar al artículo.
- El artículo generado marca cada afirmación con el índice de su fuente, y la UI las muestra como citas navegables.
- Fuentes insuficientes es un **fallo explícito** (`failed`), no una invitación a que el modelo rellene con lo que cree saber. Esta es la diferencia entre un asistente de research y un generador de plausibilidad.

Decisión pendiente: qué proveedor de búsqueda. El repo no tiene ninguno. Las opciones razonables son la búsqueda web nativa del proveedor de modelos, o un servicio dedicado.

---

## 8. Seguridad y guardarraíles (issue #20)

- **Claves solo en variables de entorno de Convex.** Nunca en `NEXT_PUBLIC_*`, nunca en un componente, nunca en una API route de Next.
- **Aislamiento por tenant en toda query y mutation.** Un usuario no puede leer la sesión de otro; el `tenantId` sale de la identidad de Clerk verificada, nunca del body.
- **El texto del usuario es dato, no instrucción.** El brief va delimitado en el prompt, con instrucción explícita de no obedecer instrucciones que aparezcan dentro. El contenido de las páginas leídas en research recibe el mismo tratamiento: es la superficie de inyección más grande de todo el sistema.
- **Moderación antes de persistir**, sobre la entrada del usuario y sobre la salida del modelo.
- **Límite de gasto configurado en OpenAI antes de la primera llamada**, no después. Un bucle de research sin control factura en minutos.
- **Feature flag `COMPOSER_ENABLED`** con rollout progresivo y un plan de rollback que no requiera migración de datos: apagar el flag oculta la UI y rechaza las actions; las sesiones existentes quedan intactas.
- **Validación del JSON del modelo antes de insertarlo en Convex.** Nunca `JSON.parse` directo a la base.

---

## 9. Decisiones que hay que tomar antes de empezar

Estas no las puede resolver quien implemente; son de producto o de cuenta.

1. **Proveedor de búsqueda web** para el research de #16. No hay ninguno en el repo.
2. **Presupuesto mensual** y el límite duro a configurar en OpenAI.
3. ~~**Qué pasa con un artículo generado que el usuario abandona**~~ → **DECIDIDO:** retención de 90 días, y la purga borra **solo sesiones en estado terminal**. Una sesión activa no se borra sola por vieja que sea. El post generado no se toca: es del usuario y vive por su cuenta. Implementado en `purgeExpiredSessions` + `convex/crons.ts`.
4. **Idiomas soportados** en la primera versión. El producto es español; el research útil suele ser en inglés.
5. **`gpt-5.6-luna` y `gpt-image-1-mini`** son los valores que documenta el epic. Confirmar que están disponibles en la cuenta antes de fijarlos como default.

---

## 10. Riesgos

| Riesgo | Por qué importa | Mitigación |
|---|---|---|
| Inyección de prompt desde páginas leídas en research | Es contenido de terceros entrando a un prompt con permisos | Delimitar como dato, instrucción explícita, moderación de salida |
| Costo descontrolado | Un bucle de research factura rápido | Límite en el proveedor **antes** de programar, `aiUsage` desde el primer día |
| Fuentes alucinadas | Rompe el criterio de aceptación central de la épica | Solo claims con URL consultada; sin fuentes, `failed` |
| Construir #19 antes del design system | Se tira y se rehace | #19 espera; el resto avanza |
| Imágenes que ocupan storage sin límite | Convex Storage tiene costo | Portada por defecto, adicionales con opt-in explícito, política de retención |

---

## 11. Estado

El camino feliz está orquestado en mutations (`enqueueJob` + `advanceSessionForJob` + `transitionSession`). Tras research la sesión vuelve a `awaiting_confirmation` para revisar fuentes; «Comenzar redacción» avanza a `drafting`. Composer se oculta en el panel cuando el tenant no está habilitado.

- **#14**: SDK de OpenAI en servidor, modelos por entorno, `store: false`, moderación y `aiUsageEvents`.
- **#15**: 6 tablas con `tenantId` e índice `by_tenant`, máquina de estados validada en mutations, jobs idempotentes/cancelables, retención 90 días.
- **#16**: Web Search solo en research, `max_tool_calls` = `OPENAI_MAX_RESEARCH_QUERIES`, fuentes con URL canónica y claims; 0 fuentes → `failed`.
- **#17**: Redacción sin Web Search, validación TipTap, citas 1:1 contra `composerSources` en runtime, handoff `draft` idempotente.
- **#18**: Portada opcional (`wantsCoverImage !== false` por defecto), Convex Storage, alt WCAG &lt;125. El post solo tiene `coverUrl` (no hay campo de alt en `posts`). Imágenes adicionales (`wantsExtraImages`) quedan fuera de esta versión.
- **#19**: Panel `/panel/composer` con brief, timeline, revisión y handoff. La entrada de nav y la página se ocultan/bloquean si `COMPOSER_ENABLED` o el kill switch lo apagan.
- **#20**: `pnpm test:ai`, kill switch, canary, `aiMetrics.ts`, [composer-support-guide.md](./composer-support-guide.md).

**Épica #13 implementada en local.** El rollout sigue dependiendo de `COMPOSER_ENABLED=true` en Convex y de confirmar modelos/presupuesto en la cuenta OpenAI. El epic en GitHub permanece abierto hasta esa activación operativa.
