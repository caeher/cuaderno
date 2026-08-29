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
    <FieldSet className="rounded-xl border border-border bg-card p-5">
      <FieldLegend className="text-base font-semibold text-foreground">Información de la cuenta</FieldLegend>
      <FieldDescription className="text-sm text-muted-foreground">
        Detalles de tu cuenta administrativa y URL de autor.
      </FieldDescription>
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="username">Nombre de usuario (slug de perfil)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-text-tertiary">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => onUsernameChange?.(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                className="pl-7 font-mono text-sm"
              />
            </div>
            <FieldDescription>Tu blog público estará en /autor/{username}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input id="email" type="email" defaultValue={email} disabled className="cursor-not-allowed bg-surface-sunken text-sm" />
            <FieldDescription>Vinculado a tu sesión activa.</FieldDescription>
          </Field>
        </div>

        {/* Account Info Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-text-tertiary" />
            <span>Rol: <strong className="text-foreground capitalize">{role}</strong></span>
          </div>
          {joinedAt && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-xs text-muted-foreground">
              <Calendar className="size-3.5 text-text-tertiary" />
              <span>Miembro desde: <strong className="text-foreground">{joinedAt}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-xs text-muted-foreground">
            <UserCheck className="size-3.5 text-text-tertiary" />
            <span>Seguidores: <strong className="tabular-nums text-foreground">{followerCount}</strong></span>
          </div>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
