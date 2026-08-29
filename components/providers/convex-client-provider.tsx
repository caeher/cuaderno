"use client"

import { ReactNode, useMemo } from "react"
import { ConvexReactClient, ConvexProvider } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/nextjs"

interface ConvexClientProviderProps {
  children: ReactNode
}

/**
 * Proveedor cliente de Convex integrado con Clerk.
 * Sincroniza automáticamente los JWT tokens de Clerk (Template "convex")
 * y el estado de la organización activa con el cliente de Convex.
 */
export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  const convex = useMemo(() => {
    if (!convexUrl) {
      return new ConvexReactClient("https://fallback-offline.convex.cloud")
    }
    return new ConvexReactClient(convexUrl)
  }, [convexUrl])

  if (!convexUrl) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
