"use client"

import * as React from "react"
import { getInitials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field"
import { Image, MapPin, Sparkles } from "lucide-react"

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
]

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop&q=80",
]

export interface ProfileSettingsSectionProps {
  name: string
  onNameChange: (val: string) => void
  tagline: string
  onTaglineChange: (val: string) => void
  bio: string
  onBioChange: (val: string) => void
  location: string
  onLocationChange: (val: string) => void
  avatarUrl: string
  onAvatarUrlChange: (val: string) => void
  coverUrl: string
  onCoverUrlChange: (val: string) => void
}

export function ProfileSettingsSection({
  name,
  onNameChange,
  tagline,
  onTaglineChange,
  bio,
  onBioChange,
  location,
  onLocationChange,
  avatarUrl,
  onAvatarUrlChange,
  coverUrl,
  onCoverUrlChange,
}: ProfileSettingsSectionProps) {
  const [showCustomAvatarInput, setShowCustomAvatarInput] = React.useState(false)
  const [showCustomCoverInput, setShowCustomCoverInput] = React.useState(false)

  return (
    <FieldSet>
      <FieldLegend>Perfil público</FieldLegend>
      <FieldDescription>Esta información se muestra en tu página de autor y en todos tus artículos.</FieldDescription>
      <FieldGroup className="gap-5">
        {/* Avatar Section */}
        <Field>
          <FieldLabel>Foto de perfil</FieldLabel>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="size-16 border-2 border-border shadow-xs shrink-0">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
              <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Elegir preset:</span>
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onAvatarUrlChange(url)}
                    className={`size-7 rounded-full overflow-hidden border transition-all cursor-pointer ${
                      avatarUrl === url ? "ring-2 ring-primary border-primary scale-110" : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Avatar preset ${i}`} className="size-full object-cover" />
                  </button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                >
                  URL personalizada
                </Button>
              </div>
              {showCustomAvatarInput && (
                <Input
                  value={avatarUrl}
                  onChange={(e) => onAvatarUrlChange(e.target.value)}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className="text-xs h-8"
                />
              )}
            </div>
          </div>
        </Field>

        {/* Cover Photo Section */}
        <Field>
          <FieldLabel>Imagen de portada</FieldLabel>
          <div className="flex flex-col gap-3">
            {coverUrl && (
              <div className="relative h-24 w-full overflow-hidden rounded-md border border-border">
                <img src={coverUrl} alt="Portada" className="size-full object-cover" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Elegir portada:</span>
              {PRESET_COVERS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onCoverUrlChange(url)}
                  className={`h-7 w-12 rounded overflow-hidden border transition-all cursor-pointer ${
                    coverUrl === url ? "ring-2 ring-primary border-primary scale-105" : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Cover preset ${i}`} className="size-full object-cover" />
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setShowCustomCoverInput(!showCustomCoverInput)}
              >
                URL personalizada
              </Button>
            </div>
            {showCustomCoverInput && (
              <Input
                value={coverUrl}
                onChange={(e) => onCoverUrlChange(e.target.value)}
                placeholder="https://ejemplo.com/portada.jpg"
                className="text-xs h-8"
              />
            )}
          </div>
        </Field>

        {/* Name */}
        <Field>
          <FieldLabel htmlFor="name">Nombre público</FieldLabel>
          <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} />
        </Field>

        {/* Tagline */}
        <Field>
          <FieldLabel htmlFor="tagline">Titular / Frase destacada</FieldLabel>
          <Input id="tagline" value={tagline} onChange={(e) => onTaglineChange(e.target.value)} />
          <FieldDescription>Una frase corta y memorable que resume de qué trata tu blog.</FieldDescription>
        </Field>

        {/* Location */}
        <Field>
          <FieldLabel htmlFor="location">Ubicación</FieldLabel>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Ej. Madrid, España / Remoto"
              className="pl-9"
            />
          </div>
        </Field>

        {/* Bio */}
        <Field>
          <FieldLabel htmlFor="bio">Biografía</FieldLabel>
          <Textarea id="bio" rows={4} value={bio} onChange={(e) => onBioChange(e.target.value)} />
          <FieldDescription>Cuéntale a tus lectores quién eres y sobre qué escribes.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
