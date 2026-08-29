/**
 * Tope de consultas web por job de research — issue #16.
 *
 * Vive fuera de `"use node"` para poder probarse sin el SDK de OpenAI.
 */

export function countWebSearchCalls(output: ReadonlyArray<{ type: string }>): number {
  return output.filter((item) => item.type === "web_search_call").length
}

export function assertResearchQueryBudget(
  webSearchCalls: number,
  maxQueries: number
): void {
  if (webSearchCalls > maxQueries) {
    throw new Error(
      `El job de investigación superó el presupuesto de ${maxQueries} consultas web (${webSearchCalls} ejecutadas).`
    )
  }
}
