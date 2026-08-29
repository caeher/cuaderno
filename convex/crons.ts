/**
 * Trabajos programados de Convex.
 *
 * Por ahora solo la purga de retención de Composer (issue #15). Corre de madrugada
 * y en lotes acotados: una purga que intente borrar todo de una vez puede exceder el
 * límite de una transacción, y este trabajo puede esperar al día siguiente.
 */

import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

crons.daily(
  "purgar sesiones de Composer vencidas",
  { hourUTC: 4, minuteUTC: 0 },
  internal.composer.purgeExpiredSessions,
  { limit: 50 }
)

export default crons
