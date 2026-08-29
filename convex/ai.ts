/**
 * Superficie pública de la plataforma de IA — issue #14.
 *
 * Por ahora solo expone el health check de configuración. Las llamadas al proveedor
 * viven en actions `"use node"` que llegan con #16 a #18.
 */

import { query } from "./_generated/server"
import { requireTenantAuth } from "./lib/auth"
import { validateAiConfig } from "./lib/ai/config"

/**
 * Reporta si la plataforma de IA está bien configurada.
 *
 * Requiere sesión: la lista de modelos efectivos y el estado del despliegue no son
 * información pública. Nunca devuelve la clave — `validateAiConfig` solo informa si
 * existe.
 *
 * Sirve para que el panel muestre "Composer no disponible: falta configurar X" en vez
 * de dejar que el usuario arranque una sesión que va a morir a mitad de un job.
 */
export const getConfigHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireTenantAuth(ctx)
    return validateAiConfig()
  },
})
