# Runbook — Plataforma de IA (Composer)

> Variables de entorno, procedimiento de despliegue y operación de la capa de IA que consume Composer. Complementa `docs/convex-operations-runbook.md` y `docs/composer-plan.md`.
>
> Corresponde al issue **#14 — Plataforma IA: integrar OpenAI con selección global de modelos por entorno**.

---

## 1. Dónde viven estas variables

**En las variables de entorno de Convex, no en las de Next.** Toda llamada al proveedor ocurre en actions de Convex; el navegador nunca las lee.

```bash
pnpm convex env set OPENAI_API_KEY <valor>
pnpm convex env list          # verifica nombres, no valores
```

**Ninguna de estas variables lleva el prefijo `NEXT_PUBLIC_`.** Ese prefijo las incrusta en el bundle del navegador — sería exactamente la filtración que el criterio de aceptación de #14 prohíbe.

---

## 2. Variables

| Variable | Requerida | Default | Qué controla |
|---|---|---|---|
| `OPENAI_API_KEY` | sí | — | Credencial. El código solo comprueba su presencia; su valor nunca sale de `convex/lib/ai/config.ts` |
| `COMPOSER_ENABLED` | no | `false` | Feature flag de rollout. **Apagado por defecto**: Composer no se enciende por el mero hecho de estar desplegado |
| `OPENAI_RESEARCH_MODEL` | no | `gpt-5.6-luna` | Modelo de la fase de investigación (con Web Search) |
| `OPENAI_WRITING_MODEL` | no | `gpt-5.6-luna` | Modelo de redacción (sin Web Search) |
| `OPENAI_IMAGE_MODEL` | no | `gpt-image-1-mini` | Modelo de imágenes |
| `OPENAI_REASONING_EFFORT` | no | `medium` | `minimal` · `low` · `medium` · `high` |
| `OPENAI_IMAGE_QUALITY` | no | `low` | `low` · `medium` · `high` · `auto` |

Los defaults son los que documenta el epic #13. **Confirmar que esos modelos están disponibles en la cuenta antes de fijarlos**; si no lo están, la variable de entorno es justamente el mecanismo para apuntar a otros sin tocar código.

Los nombres (no los secretos) también están listados en `.env.example` para que un cambio de entorno se documente en el mismo sitio que el resto del despliegue.

---

## 3. Por qué Web Search solo en investigación

`getTextPhaseConfig("research")` devuelve `webSearch: true`; `"writing"` devuelve `false`. No es una optimización de costo: **es lo que sostiene la trazabilidad de la épica.**

El modelo de redacción escribe a partir de las fuentes ya recolectadas y persistidas en `composerSources`. Si pudiera buscar por su cuenta, podría introducir afirmaciones cuya fuente no quedó registrada — y el criterio de aceptación exige que cada afirmación se rastree a su fuente. Habilitar Web Search en redacción rompe la épica en silencio: el resultado se ve mejor y es menos verificable.

---

## 4. Verificar la configuración

Desde el panel, la query `ai.getConfigHealth` (requiere sesión) devuelve:

```json
{
  "ok": true,
  "hasApiKey": true,
  "composerEnabled": false,
  "killSwitchActive": false,
  "availableForCurrentTenant": false,
  "researchModel": "gpt-5.6-luna",
  "writingModel": "gpt-5.6-luna",
  "imageModel": "gpt-image-1-mini",
  "reasoningEffort": "medium",
  "imageQuality": "low",
  "problems": []
}
```

Nunca incluye la clave. `problems` acumula **todos** los fallos en vez de cortar en el primero, para poder arreglarlos de una pasada.

Las actions que gastan dinero llaman a `requireUsableAiConfig()` como primera línea: un despliegue mal configurado falla con un mensaje accionable en vez de con un 401 opaco del proveedor a mitad de un job.

---

## 5. Antes de la primera llamada real

Este orden no es negociable:

1. **Configurar el límite de gasto en el panel de OpenAI.** Antes, no después. Un bucle de research sin control factura en minutos.
2. Cargar `OPENAI_API_KEY` en Convex.
3. Verificar con `ai.getConfigHealth` que `ok: true`.
4. Recién entonces poner `COMPOSER_ENABLED=true`, y solo en el entorno donde se quiere probar.

---

## 6. Rollout y rollback

`COMPOSER_ENABLED` es el interruptor. Apagarlo:

- oculta la UI de Composer,
- hace que las actions rechacen con un mensaje explícito,
- **no toca los datos**: las sesiones, jobs y artefactos existentes quedan intactos.

Por eso el rollback no requiere migración: se apaga la variable y el sistema vuelve al estado anterior. Cualquier cambio futuro que haga que apagar el flag deje datos inconsistentes rompe esta garantía.

---

## 7. Cambiar de modelo en caliente

Cambiar `OPENAI_WRITING_MODEL` afecta a **todas las ejecuciones nuevas** sin deploy de código ni migración de datos. Las ejecuciones en curso terminan con el modelo que tenían: `aiUsageEvents` registra el modelo efectivo por fase, así que siempre se puede saber con cuál se generó cada artefacto.

---

## 8. Observabilidad

Cada fase escribe un registro en `aiUsageEvents` con tenant, sesión, job, modelo efectivo, tokens o imágenes, tool calls, coste estimado y real (si el proveedor lo expone), estado y request ID.

**Es solo observabilidad.** En esta fase no hay cuotas, presupuestos ni límites por tenant — lo dicen explícitamente #14 y #15. El control de gasto vive en el panel del proveedor, no en la aplicación.

---

## 9. Retención, `store` y contenido que no se envía

Ver [ai-data-retention-policy.md](./ai-data-retention-policy.md). Resumen operativo:

- Responses se llama con `store: false`.
- No se envían emails, JWT, claves ni datos de otros tenants.
- Un refusal o un bloqueo de moderación no genera posts ni assets.

---

## 10. Moderación y refusals

1. Texto de usuario → `moderations.create` antes de Responses.
2. Responses lleva `moderation.model = omni-moderation-latest`.
3. Texto o imagen generados se vuelven a moderar antes de persistir.

Tratamiento: job `failed`, `aiUsageEvents.status` = `moderated` | `refused` | `blocked`, sin `recordArtifact` / `recordSources`. La sesión puede ir a `failed` o quedarse recuperable según la fase; #16–#18 deciden la transición. En esta capa el contenido no se publica.

---

## 11. Verificar tras un deploy

```bash
pnpm convex env list
pnpm test:ai
```

1. `ai.getConfigHealth` (sesión Clerk) → `ok: true`, sin `sk-` en el JSON.
2. Con `COMPOSER_ENABLED=true`, `aiNode.runSmokeTest` (autenticada) o `npx convex run aiNode:runIntegrationSmoke` → `{ ok, model, requestId }`.
3. Cambiar `OPENAI_WRITING_MODEL` y repetir el smoke: el modelo efectivo en `aiUsageEvents` debe ser el nuevo. No hace falta migrar datos.

---

## 12. Estado

| Pieza | Estado |
|---|---|
| Resolvedor de configuración (`convex/lib/ai/config.ts`) | implementado |
| Health check (`ai.getConfigHealth`) | implementado |
| Cliente Responses / imágenes (`convex/lib/ai/client.ts`) | implementado |
| Moderación de entrada y salida | implementado |
| Registro de uso desde llamadas reales | implementado (`recordUsage`) |
| Variables en `.env.example` | documentadas (Convex env, no Next) |
