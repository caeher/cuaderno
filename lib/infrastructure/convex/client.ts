import { fetchMutation, fetchQuery } from "convex/nextjs"
import type { FunctionReference, FunctionReturnType } from "convex/server"

/**
 * Obtiene el token JWT de Clerk para Convex si existe una sesión activa en el servidor.
 */
async function getAuthToken(): Promise<string | undefined> {
  try {
    const { auth } = await import("@clerk/nextjs/server")
    const session = await auth()
    const token = await session.getToken({ template: "convex" })
    return token ?? undefined
  } catch {
    // Si no estamos en un contexto de petición web o Clerk no está inicializado
    return undefined
  }
}

/**
 * Ejecuta una consulta de Convex desde el entorno de servidor (Server Components, Route Handlers, Repositorios).
 */
export async function convexQuery<Query extends FunctionReference<"query">>(
  queryRef: Query,
  args?: any
): Promise<FunctionReturnType<Query>> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL
  if (!convexUrl) {
    return null as FunctionReturnType<Query>
  }

  const token = await getAuthToken()
  const options = token ? { token } : undefined

  try {
    return (await fetchQuery(queryRef, (args ?? {}) as any, options)) as FunctionReturnType<Query>
  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[Convex Query Info]:`, error?.message || error)
    }
    return null as FunctionReturnType<Query>
  }
}

/**
 * Ejecuta una mutación de Convex desde el entorno de servidor con autenticación de tenant.
 */
export async function convexMutation<Mutation extends FunctionReference<"mutation">>(
  mutationRef: Mutation,
  args?: any
): Promise<FunctionReturnType<Mutation>> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.")
  }

  const token = await getAuthToken()
  const options = token ? { token } : undefined

  return (await fetchMutation(mutationRef, (args ?? {}) as any, options)) as FunctionReturnType<Mutation>
}

