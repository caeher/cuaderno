import { fetchMutation, fetchQuery } from "convex/nextjs"
import type { FunctionReference, FunctionReturnType } from "convex/server"

type AuthTokenResult = {
  token: string | undefined
  userId: string | null
}

type ClerkAuthSession = {
  getToken: (options?: { template?: string; skipCache?: boolean }) => Promise<string | null>
  sessionClaims?: Record<string, unknown> | null
}

/**
 * Obtiene un JWT de Clerk válido para Convex.
 * Replica la lógica de ConvexProviderWithClerk: con integración nativa (aud === "convex")
 * usa el session token; si no, intenta el template "convex" y luego el session token.
 */
async function tryGetClerkJwt(session: ClerkAuthSession): Promise<string | undefined> {
  const useNativeConvexToken = session.sessionClaims?.aud === "convex"

  const attempts: Array<() => Promise<string | null>> = useNativeConvexToken
    ? [() => session.getToken(), () => session.getToken({ template: "convex" })]
    : [() => session.getToken({ template: "convex" }), () => session.getToken()]

  for (const attempt of attempts) {
    try {
      const token = await attempt()
      if (token) {
        return token
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (process.env.NODE_ENV !== "production" && message !== "Not Found") {
        console.warn(`[Convex Auth] getToken attempt failed: ${message}`)
      }
    }
  }

  return undefined
}

/**
 * Obtiene el token JWT de Clerk para Convex si existe una sesión activa en el servidor.
 */
async function getAuthTokenResult(): Promise<AuthTokenResult> {
  try {
    const { auth } = await import("@clerk/nextjs/server")
    const session = await auth()
    const userId = session.userId ?? null

    if (!userId) {
      return { token: undefined, userId: null }
    }

    const token = await tryGetClerkJwt(session)

    if (!token && process.env.NODE_ENV !== "production") {
      console.warn(
        "[Convex Auth] Clerk session exists but no JWT was returned. Enable the Convex integration in Clerk Dashboard or create JWT template 'convex'."
      )
    }

    return { token, userId }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[Convex Auth] Failed to resolve Clerk session: ${message}`)
    }
    return { token: undefined, userId: null }
  }
}

async function getAuthToken(): Promise<string | undefined> {
  const { token } = await getAuthTokenResult()
  return token
}

async function requireAuthTokenForMutation(): Promise<string | undefined> {
  const { token, userId } = await getAuthTokenResult()

  if (userId && !token) {
    throw new Error(
      "Falta JWT de Clerk para Convex. Activa la integración Convex en Clerk o crea el template JWT \"convex\", y verifica CLERK_JWT_ISSUER_DOMAIN."
    )
  }

  return token
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

  const token = await requireAuthTokenForMutation()
  const options = token ? { token } : undefined

  return (await fetchMutation(mutationRef, (args ?? {}) as any, options)) as FunctionReturnType<Mutation>
}
