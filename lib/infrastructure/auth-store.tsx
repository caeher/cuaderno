"use client"

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react"
import type { User } from "@/lib/domain/entities"
import { MOCK_USERS } from "@/lib/infrastructure/mock-db"

const CURRENT_USER = MOCK_USERS[0]

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string) => void
  logout: () => void
  register: (name: string, email: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Mock, client-side auth session for demo purposes.
 * Not persisted; resets on reload. Swap for a real auth provider
 * (e.g. Better Auth on Neon) when real persistence is added.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((_email: string) => {
    setUser(CURRENT_USER)
  }, [])

  const register = useCallback((name: string, _email: string) => {
    setUser({ ...CURRENT_USER, name })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout, register }),
    [user, login, logout, register],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
