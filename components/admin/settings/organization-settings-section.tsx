"use client"

import * as React from "react"
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

export function OrganizationSettingsSection() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const { organization, isLoaded: isOrgLoaded, membership } = useOrganization()
  const { userMemberships, isLoaded: isOrgListLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

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
