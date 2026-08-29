"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie, Check, X, Shield, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const COOKIE_STORAGE_KEY = "cuaderno_cookie_consent"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  updatedAt: string
}

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY)
      if (!saved) {
        // No consent recorded yet, show the banner after a short delay
        const timer = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(timer)
      } else {
        const parsed = JSON.parse(saved) as CookiePreferences
        setAnalyticsAllowed(parsed.analytics ?? false)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowModal(true)
    }

    window.addEventListener("open-cookie-settings", handleOpenSettings)
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings)
  }, [])

  const saveConsent = (analytics: boolean) => {
    const pref: CookiePreferences = {
      necessary: true,
      analytics,
      updatedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(pref))
    } catch (e) {
      console.error("Error saving cookie consent:", e)
    }
    setAnalyticsAllowed(analytics)
    setVisible(false)
    setShowModal(false)
  }

  if (!mounted) return null

  return (
    <>
      {/* Banner inferior flotante */}
      {visible && !showModal && (
        <div
          role="region"
          aria-label="Aviso de cookies"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-300 sm:bottom-6 sm:left-6 sm:right-6"
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ia-tint text-ia">
                  <Cookie className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                    Control de privacidad y cookies en Cuaderno
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Utilizamos cookies técnicas para mantener tu sesión segura y, con tu consentimiento, cookies analíticas anónimas para que los autores conozcan el alcance de sus lecturas.{" "}
                    <Link
                      href="/legal/cookies"
                      className="font-medium text-ia underline underline-offset-2 transition-colors hover:text-ia-hover"
                    >
                      Leer política de cookies
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 sm:shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="h-9 cursor-pointer rounded-lg border-border px-3 text-xs font-medium"
                >
                  <Sliders className="mr-1.5 size-3.5" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveConsent(false)}
                  className="h-9 cursor-pointer rounded-lg border-border px-3 text-xs font-medium"
                >
                  Rechazar no esenciales
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveConsent(true)}
                  className="h-9 cursor-pointer rounded-lg px-4 text-xs font-semibold"
                >
                  <Check className="mr-1.5 size-3.5" />
                  Aceptar todas
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal interactivo de configuración de preferencias */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-ia-tint text-ia">
                  <Shield className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
                    Configuración de Cookies
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Elige qué categorías de cookies deseas autorizar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer rounded-lg p-1 text-text-tertiary transition-colors hover:bg-surface-sunken hover:text-foreground"
                aria-label="Cerrar modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Cookies Esenciales */}
              <div className="rounded-xl border border-border bg-surface-sunken p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground">
                      Cookies Técnicas y Esenciales
                    </span>
                    <span className="ml-2 rounded bg-ia-tint px-1.5 py-0.5 font-mono text-[10px] font-medium text-ia">
                      Siempre activas
                    </span>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Garantizan la autenticación segura mediante Clerk, la navegación protegida y la prevención contra ataques informáticos. No se pueden desactivar.
                </p>
              </div>

              {/* Cookies Analíticas */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Cookies de Rendimiento y Análisis
                  </span>
                  <Switch
                    checked={analyticsAllowed}
                    onCheckedChange={setAnalyticsAllowed}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Permiten recopilar estadísticas agregadas y completamente anónimas sobre el número de visitas para ayudar a los autores a conocer el impacto de sus publicaciones.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Link
                href="/legal/cookies"
                onClick={() => setShowModal(false)}
                className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Ver tabla técnica completa
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveConsent(false)}
                  className="h-9 cursor-pointer rounded-lg border-border px-3 text-xs font-medium"
                >
                  Solo necesarias
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveConsent(analyticsAllowed)}
                  className="h-9 cursor-pointer rounded-lg px-4 text-xs font-semibold"
                >
                  Guardar selección
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
