"use client"

import * as React from "react"
import { toast } from "sonner"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Building2,
  Users,
  Shield,
  PlusCircle,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react"
import {
  OrganizationProfile,
  OrganizationSwitcher,
  OrganizationList,
  useOrganization,
  useOrganizationList,
  useUser,
} from "@clerk/nextjs"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConvexAuthStatus } from "@/components/admin/convex-auth-status"
import { Button } from "@/components/ui/button"

export function OrganizationSettingsSection() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const { organization, isLoaded: isOrgLoaded, membership } = useOrganization()
  const publicTenantStatus = useQuery(api.users.getPublicTenantOrganizationStatus)
  const linkPublicTenant = useMutation(api.users.setPublicTenantOrganization)
  const [isLinkingPublicTenant, setIsLinkingPublicTenant] = React.useState(false)
  const { userMemberships, isLoaded: isOrgListLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  const canManagePublicTenant = membership?.role === "org:admin" || membership?.role === "org:owner"

  async function handleLinkPublicTenant() {
    setIsLinkingPublicTenant(true)
    try {
      const result = await linkPublicTenant({})
      if (!result) {
        toast.error("No se encontró un perfil público único para tu cuenta.")
        return
      }
      toast.success(`El perfil @${result.username} ya representa esta organización.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo vincular el perfil público.")
    } finally {
      setIsLinkingPublicTenant(false)
    }
  }

  // In case Clerk is not configured in env
  if (!isUserLoaded) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Cargando configuración de Clerk...
      </div>
    )
  }

  return (
    <FieldSet>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <FieldLegend className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Organización del Blog
          </FieldLegend>
          <FieldDescription>
            Gestiona la organización de Clerk asociada a este blog, administra colaboradores y roles de equipo.
          </FieldDescription>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <OrganizationSwitcher
              hidePersonal={false}
              afterCreateOrganizationUrl="/panel/configuracion"
              afterSelectOrganizationUrl="/panel/configuracion"
              afterLeaveOrganizationUrl="/panel/configuracion"
            />
          </div>
        )}
      </div>

      <FieldGroup className="gap-6">
        {/* Active Organization Info Banner */}
        {organization ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {organization.imageUrl ? (
                    <img
                      src={organization.imageUrl}
                      alt={organization.name}
                      className="size-10 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                      {organization.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      {organization.name}
                      <Badge variant="outline" className="text-xs capitalize font-normal">
                        {membership?.role?.replace("org:", "") || "Miembro"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      Slug: {organization.slug || "sin-slug"} · ID: {organization.id}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Organización activa</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              <p>
                Los cambios que realices a continuación se aplicarán a todos los autores y miembros de este blog.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-border/60 bg-background p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Perfil público del blog</p>
                  {publicTenantStatus === undefined ? (
                    <p>Comprobando la asociación del perfil...</p>
                  ) : publicTenantStatus === null ? (
                    <p>No se encontró un perfil público único para tu cuenta.</p>
                  ) : publicTenantStatus.isMappedToCurrentOrganization ? (
                    <p>El perfil @{publicTenantStatus.username} está vinculado a esta organización.</p>
                  ) : publicTenantStatus.mappedElsewhere ? (
                    <p>El perfil @{publicTenantStatus.username} ya está vinculado a otra organización.</p>
                  ) : (
                    <p>Vincula el perfil @{publicTenantStatus.username} para publicar aquí los artículos del equipo.</p>
                  )}
                </div>
                {canManagePublicTenant && publicTenantStatus &&
                !publicTenantStatus.isMappedToCurrentOrganization &&
                !publicTenantStatus.mappedElsewhere ? (
                  <Button size="sm" onClick={handleLinkPublicTenant} disabled={isLinkingPublicTenant}>
                    {isLinkingPublicTenant ? "Vinculando…" : "Vincular perfil"}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Personal Workspace Info / Prompt to create Org */
          <Card className="border-dashed bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="size-4 text-blue-500" />
                Espacio de Trabajo Personal Activo
              </CardTitle>
              <CardDescription className="text-xs">
                Actualmente estás en tu espacio personal. Para gestionar un blog con múltiples autores, editores o colaboradores, crea o selecciona una Organización en Clerk.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <OrganizationSwitcher
                  hidePersonal={false}
                  afterCreateOrganizationUrl="/panel/configuracion"
                  afterSelectOrganizationUrl="/panel/configuracion"
                  afterLeaveOrganizationUrl="/panel/configuracion"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3 pt-2">
                <div className="rounded-md border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Building2 className="size-3.5 text-primary" />
                    Un blog, una organización
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Cada organización en Clerk puede actuar como un blog o publicación independiente.
                  </p>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Users className="size-3.5 text-primary" />
                    Equipo y Redactores
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Invita a redactores, editores y administradores con control de acceso granular.
                  </p>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Shield className="size-3.5 text-primary" />
                    Roles y Permisos
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Configura quién puede publicar, editar borradores o administrar el blog.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Embedded Clerk Organization Profile Component */}
        <div className="rounded-lg border border-border bg-card p-4 overflow-hidden shadow-xs">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground">
              {organization ? "Configuración y Miembros de la Organización" : "Crear o Unirse a una Organización"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {organization
                ? "Actualiza el nombre, logo, miembros y permisos de la organización según el blog."
                : "Crea una nueva organización para este blog o selecciona una existente."}
            </p>
          </div>

          {organization ? (
            <div className="w-full clerk-org-profile-wrapper">
              <OrganizationProfile routing="hash" />
            </div>
          ) : (
            <div className="w-full clerk-org-list-wrapper flex justify-center py-4">
              <OrganizationList
                hidePersonal={false}
                afterCreateOrganizationUrl="/panel/configuracion"
                afterSelectOrganizationUrl="/panel/configuracion"
              />
            </div>
          )}
        </div>

        {/* Convex Backend & Clerk Auth Diagnostic Card */}
        <ConvexAuthStatus />
      </FieldGroup>
    </FieldSet>
  )
}
