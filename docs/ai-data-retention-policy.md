# Política de retención de datos — Plataforma de IA (Composer)

**Versión:** 1.0.0  
**Ámbito:** Integración OpenAI de Composer (issue #14). Complementa [ai-platform-runbook.md](./ai-platform-runbook.md) y [vapi-narration-privacy-and-retention-policy.md](./vapi-narration-privacy-and-retention-policy.md).

---

## 1. Principios

1. **Mínima exposición.** Solo se envía al proveedor el texto necesario para la fase en curso (brief, instrucciones de la fase, o prompt de imagen). No se envían claves, tokens de sesión, emails de Clerk ni datos de otros tenants.
2. **Sin historial en OpenAI.** Todas las llamadas de Responses usan `store: false`. El contenido no queda recuperable vía API del proveedor.
3. **Soberanía en Convex.** Fuentes, artefactos y eventos de uso viven en tablas del tenant. Las imágenes, cuando existan (#18), se guardan en Convex Storage, no como URL del proveedor.
4. **Composer nunca publica.** Un refusal, un fallo o un contenido moderado no crea posts ni assets publicables.

---

## 2. Qué se envía al proveedor y qué no

| Dato | ¿Se envía a OpenAI? | Destino soberano |
|---|---|---|
| `OPENAI_API_KEY` | Solo como header de autenticación | Variable de entorno de Convex. Nunca logs, bundles ni Server Actions |
| Tema, audiencia, tono, idioma del brief | Sí, en la fase que los necesita | `composerSessions.brief` |
| Mensajes de la conversación | Solo el turno necesario para la fase | `composerMessages` |
| Fuentes investigadas | No se reenvían a Web Search en redacción | `composerSources` |
| Artefactos (outline, artículo, excerpt) | No, salvo reescritura explícita de esa fase | `composerArtifacts` |
| Imágenes generadas | El prompt sí; el binario resultante no se reenvía | Convex Storage (`storageId`) |
| Email, `userId`, `orgId`, JWT | No | Clerk / `requireTenantAuth` |
| Secretos, `.env`, claves internas | No | — |
| Borradores o posts de otro tenant | No | Aislamiento por `tenantId` derivado de Clerk |

**Identificador de abuso:** si se usa `safety_identifier`, debe ser un hash del tenant, nunca el email en claro.

---

## 3. Parámetro `store` y caché de prompts

- `store: false` en toda llamada de Responses. No hay recuperación posterior con `responses.retrieve` y no se construye un historial en la cuenta OpenAI.
- `prompt_cache_key` puede llevar la `idempotencyKey` del job para cachear prefijos similares. No incluye PII.
- `prompt_cache_retention` no se fija: se deja el default de la organización. Si la org tiene Zero Data Retention, el caché queda en memoria.

---

## 4. Retención en Convex

| Recurso | Retención | Purga |
|---|---|---|
| Sesiones terminales (`awaiting_review`, `failed`, `cancelled`) | 90 días (`expiresAt`) | Cron diario `purgeExpiredSessions` a las 04:00 UTC, en lotes de 50 |
| Jobs, mensajes, fuentes y artefactos de una sesión | El de la sesión padre | Cascada al purgar la sesión |
| `aiUsageEvents` | Observabilidad; no se usa para cuotas | No se purga en esta fase (sin PII ni secretos: modelo, tokens, coste, request ID, estado) |
| Imágenes en Convex Storage | Mientras exista el artefacto | `storage.delete` al purgar o al descartar el asset |

Apagar `COMPOSER_ENABLED` **no borra datos**. El rollback no requiere migración.

---

## 5. Moderación y refusals

Antes de continuar o persistir:

1. Entrada del usuario → Moderation API (`omni-moderation-latest`).
2. Llamada Responses con `moderation.model = omni-moderation-latest`.
3. Salida de texto o prompt de imagen → otra pasada de moderación.

Si cualquiera falla o el modelo devuelve `refusal` / `content_filter`:

- no se llama a `recordArtifact` ni `recordSources`
- el job queda `failed` con un mensaje accionable (sin secretos)
- `aiUsageEvents.status` es `blocked`, `refused` o `moderated`
- no se crea un post en `draft` ni un asset publicable

---

## 6. Derecho a borrado

Un autor o admin que elimine una sesión (cuando exista esa mutación) debe:

1. Borrar mensajes, jobs, fuentes y artefactos de esa sesión.
2. Eliminar blobs de Convex Storage asociados.
3. Entender que OpenAI no retiene el contenido (`store: false`), así que no hay un segundo sistema que depurar.

Los eventos de uso pueden anonimizarse o conservarse sin texto: no contienen el contenido generado.

---

## 7. Logs

Está prohibido registrar `OPENAI_API_KEY`, headers `Authorization`, bodies completos de Responses o imágenes en base64. Los errores pasan por `sanitizeOpenAiError` antes de persistirse en `composerJobs.error`.
