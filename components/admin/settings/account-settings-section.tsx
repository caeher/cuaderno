"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field"
import { ShieldCheck, Calendar, UserCheck } from "lucide-react"

export interface AccountSettingsSectionProps {
  email: string
  username: string
  onUsernameChange?: (val: string) => void
  role?: string
  joinedAt?: string
  postCount?: number
  followerCount?: number
}

export function AccountSettingsSection({
  email,
  username,
  onUsernameChange,
  role = "owner",
  joinedAt,
  postCount = 0,
  followerCount = 0,
}: AccountSettingsSectionProps) {
  return (
    <FieldSet>
      <FieldLegend>Información de la cuenta</FieldLegend>
      <FieldDescription>Detalles de tu cuenta administrativa y URL de autor.</FieldDescription>
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="username">Nombre de usuario (slug de perfil)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => onUsernameChange?.(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                className="pl-7 font-mono text-xs"
              />
            </div>
            <FieldDescription>Tu blog público estará en /autor/{username}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input id="email" type="email" defaultValue={email} disabled className="bg-muted/40 cursor-not-allowed" />
            <FieldDescription>Vinculado a tu sesión activa.</FieldDescription>
          </Field>
        </div>

        {/* Account Info Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Rol: <strong className="text-foreground capitalize">{role}</strong></span>
          </div>
          {joinedAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
              <Calendar className="size-3.5 text-blue-500" />
              <span>Miembro desde: <strong className="text-foreground">{joinedAt}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <UserCheck className="size-3.5 text-violet-500" />
            <span>Seguidores: <strong className="text-foreground">{followerCount}</strong></span>
          </div>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
