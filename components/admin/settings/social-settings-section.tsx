"use client"

import * as React from "react"
import { Globe, AtSign, Link2, Share2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"

export interface SocialSettingsSectionProps {
  website: string
  onWebsiteChange: (val: string) => void
  twitter: string
  onTwitterChange: (val: string) => void
  github: string
  onGithubChange: (val: string) => void
  linkedin: string
  onLinkedinChange: (val: string) => void
}

export function SocialSettingsSection({
  website,
  onWebsiteChange,
  twitter,
  onTwitterChange,
  github,
  onGithubChange,
  linkedin,
  onLinkedinChange,
}: SocialSettingsSectionProps) {
  return (
    <FieldSet>
      <FieldLegend>Redes sociales y enlaces</FieldLegend>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="website">Sitio web</FieldLabel>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="website"
              value={website}
              onChange={(e) => onWebsiteChange(e.target.value)}
              placeholder="https://tu-sitio.com"
              className="pl-9"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="twitter">X / Twitter</FieldLabel>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => onTwitterChange(e.target.value)}
              placeholder="usuario"
              className="pl-9"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="github">GitHub</FieldLabel>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="github"
              value={github}
              onChange={(e) => onGithubChange(e.target.value)}
              placeholder="usuario"
              className="pl-9"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="linkedin">LinkedIn</FieldLabel>
          <div className="relative">
            <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="linkedin"
              value={linkedin}
              onChange={(e) => onLinkedinChange(e.target.value)}
              placeholder="nombre-usuario"
              className="pl-9"
            />
          </div>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
