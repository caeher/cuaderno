# Guía de Soporte y Operaciones — Composer

> Manual operativo para soporte técnico, operadores y administradores de la plataforma **Cuaderno**.
> Corresponde al issue **#20 — Validación, métricas, guardarraíles y rollout de Composer (Cierre de Épica #13)**.

---

## 1. Arquitectura y Gobernanza de Composer

Composer es el asistente editorial de investigación, redacción e imágenes de Cuaderno. Su funcionamiento está regido por tres invariantes no negociables:

1. **Composer NUNCA publica**: Su salida final es siempre un post en estado `draft` en la tabla `posts`. La publicación requiere revisión humana explícita en el panel.
2. **Trazabilidad 1:1 de fuentes**: Toda afirmación fáctica está respaldada por una URL consultada y registrada en `composerSources`. Cero enlaces alucinados.
3. **Control centralizado en servidor**: El navegador nunca elige modelos ni tiene acceso a las credenciales de OpenAI.

---

## 2. Investigación y Triage de Jobs

Cuando un usuario reporta un problema con una sesión o un trabajo atascado/fallido, sigue este procedimiento de diagnóstico:

### 2.1 Identificar la Sesión y sus Jobs
Desde la consola de Convex o invocando las queries internas:
```bash
# Consultar estado de la sesión
npx convex run composer:getSessionInternal '{ "sessionId": "<SESSION_ID>" }'

# Consultar historial de jobs de la sesión
npx convex run composer:getSessionJobs '{ "sessionId": "<SESSION_ID>" }'
```

### 2.2 Diagnosticar la Causa Raíz
Revisa el campo `status` y `error` en `composerJobs`, así como los eventos en `aiUsageEvents`:

| Estado / Error | Causa habitual | Acción recomendada |
|---|---|---|
| `status: "failed"` con error `429 Rate limit` | Límite de peticiones por minuto alcanzado en OpenAI | Esperar 1-2 minutos y pedir al usuario que reintente la acción en el chat. |
| `status: "failed"` con error `insufficient_quota` | Saldo agotado en la cuenta de OpenAI | Recargar saldo en el panel de facturación de OpenAI. No requiere cambios de código. |
| `status: "failed"` con `El brief requiere aclaración` | Detección de ambigüedad en el tema | El asistente ya habrá dejado una pregunta en el chat pidiendo detalles al usuario. |
| `status: "failed"` con `moderated` | Contenido bloqueado por categorías de moderación | Explicar al usuario que el tema infringe las políticas de contenido seguro. |
| `status: "cancelled"` | El usuario canceló la sesión en curso | Comportamiento esperado. Los jobs en cola se abortaron para evitar costes. |

---

## 3. Borrado de Datos y Purga de Assets (GDPR / Derecho al Olvido)

Si un usuario solicita la eliminación de sus datos de Composer o se requiere purgar una investigación:

### 3.1 Purga Manual Inmediata de una Sesión
Al eliminar o purgar una sesión, se deben borrar en cascada:
1. Mensajes del chat (`composerMessages`).
2. Trabajos de ejecución (`composerJobs`).
3. Fuentes y claims (`composerSources`).
4. Artefactos y binarios de imágenes en Convex Storage (`composerArtifacts` y `_storage`).
5. El documento de la sesión (`composerSessions`).

> [!NOTE]
> El post que la sesión haya generado en la tabla `posts` **no se borra automáticamente**, ya que pertenece al blog del autor. Si el usuario también solicita borrar el post, se elimina desde el panel de publicaciones o la mutation `posts.deletePost`.

### 3.2 Purga Automatizada (Retención de 90 Días)
Convex ejecuta un cron programado (`purgeExpiredSessions`) que elimina automáticamente las sesiones terminales (`awaiting_review`, `failed`, `cancelled`) cuya antigüedad supera los 90 días, liberando el almacenamiento de blobs asociado.

---

## 4. Gestión de Reclamaciones de Fuentes y Derechos de Autor

Si un tercero o un autor reclama sobre una fuente citada en un borrador:

### 4.1 Auditar la Trazabilidad
1. Consulta las fuentes registradas para la sesión:
   ```bash
   npx convex run composer:getSessionSourcesInternal '{ "sessionId": "<SESSION_ID>" }'
   ```
2. Cada registro en `composerSources` contiene:
   - `url`: URL canónica consultada.
   - `title` y `publisher`: Nombre del medio y titular.
   - `fetchedAt`: Fecha y hora exacta de la consulta.
   - `claims`: Lista de afirmaciones extraídas con su clasificación (`confirmed`, `inferred`).

### 4.2 Excluir o Bloquear Dominios Problemáticos
- **A nivel de sesión**: El usuario o soporte puede marcar una fuente como excluida llamando a `toggleSourceExclusion(sessionId, sourceId, isExcluded: true)`.
- **A nivel de brief global**: Añadir el dominio a `excludedDomains` en el brief de la sesión para evitar que el buscador web lo consulte.

---

## 5. Control de Emergencia y Desactivación (Kill Switch)

En caso de incidentes graves de coste, fallos del proveedor o mantenimiento urgente, un operador puede desactivar Composer sin desplegar código nuevo:

### 5.1 Kill Switch Global Instantáneo
Apaga todas las operaciones de Composer inmediatamente en producción:
```bash
pnpm convex env set COMPOSER_KILL_SWITCH true
```
*Efecto*: Toda invocación de Composer es rechazada con un error descriptivo de mantenimiento de emergencia. Las sesiones y datos existentes quedan 100% protegidos.

Para restaurar el servicio:
```bash
pnpm convex env set COMPOSER_KILL_SWITCH false
```

### 5.2 Deshabilitar Composer en un Entorno
Para apagar Composer de manera estándar (oculta la UI y desactiva llamadas):
```bash
pnpm convex env set COMPOSER_ENABLED false
```

### 5.3 Control de Acceso Canary por Tenant
Para limitar Composer exclusivamente a un grupo de tenants de prueba:
```bash
pnpm convex env set COMPOSER_ALLOWED_TENANTS "org_tenant_1,org_tenant_2,user_beta_tester"
```
Para permitir acceso general a todos los tenants:
```bash
pnpm convex env set COMPOSER_ALLOWED_TENANTS "*"
```

---

## 6. Criterios de Aprobación para Rollout Progresivo

Antes de expandir el acceso a Composer a nuevos clientes o habilitar la fase general, el equipo debe verificar la siguiente lista de control:

- [x] **Seguridad**: Todas las suites de `pnpm test:ai` pasan en verde.
- [x] **Aislamiento**: Pruebas multi-tenant verifican que ningún tenant puede leer datos de otro.
- [x] **Presupuesto**: Límite de gasto duro configurado en la consola de OpenAI antes del encendido.
- [x] **Trazabilidad**: Todo artículo redactado enlaza al 100% con URLs reales registradas en `composerSources`.
- [x] **Invariante editorial**: Se comprueba que ningún flujo publica de forma autónoma (salida terminal estricta en `status: "draft"`).
- [x] **Métricas operativas**: Dashboard de telemetría (`aiMetrics`) disponible para auditoría de costes en USD y uso de tokens por tenant y sesión.
