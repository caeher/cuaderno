"use client"

import * as React from "react"
import Link from "next/link"
import {
  Eye,
  ExternalLink,
  Globe,
  Sparkles,
  UserCheck,
  User as UserIcon,
  Building2,
  Share2,
  Shield,
  Clock,
  Network,
  Scale,
  Search,
  AudioLines,
} from "lucide-react"
import { toast } from "sonner"
import type { TenantLegalSettings, TenantSeoSettings, User } from "@/lib/domain/entities"
import { updateUserProfileAction } from "@/app/actions/blog-actions"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LoadingSubmitButton } from "@/components/forms/loading-submit-button"
import { ProfileSettingsSection } from "@/components/admin/settings/profile-settings-section"
import { DomainSettingsSection } from "@/components/admin/settings/domain-settings-section"
import { LegalSettingsSection } from "@/components/admin/settings/legal-settings-section"
import { SeoSettingsSection } from "@/components/admin/settings/seo-settings-section"
import { SocialSettingsSection } from "@/components/admin/settings/social-settings-section"
import { AccountSettingsSection } from "@/components/admin/settings/account-settings-section"
import { TimezoneSettingsSection } from "@/components/admin/settings/timezone-settings-section"
import { OrganizationSettingsSection } from "@/components/admin/settings/organization-settings-section"
import { IntegrationsSettingsSection } from "@/components/admin/settings/integrations-settings-section"
import { getInitials } from "@/lib/format"

export interface SettingsFormProps {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [activeTab, setActiveTab] = React.useState<string>("perfil")
  const [name, setName] = React.useState(user.name)
  const [username, setUsername] = React.useState(user.username)
  const [tagline, setTagline] = React.useState(user.tagline)
  const [bio, setBio] = React.useState(user.bio)
  const [location, setLocation] = React.useState(user.location ?? "")
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatarUrl ?? "")
  const [coverUrl, setCoverUrl] = React.useState(user.coverUrl ?? "")
  const [timezone, setTimezone] = React.useState(user.timezone ?? "UTC")
  const [subdomainEnabled, setSubdomainEnabled] = React.useState(user.subdomainEnabled ?? true)
  const [customDomain, setCustomDomain] = React.useState(user.customDomain ?? "")
  const [legalSettings, setLegalSettings] = React.useState<TenantLegalSettings>(user.legalSettings ?? {})
  const [seoSettings, setSeoSettings] = React.useState<TenantSeoSettings>(user.seoSettings ?? {})
  const [website, setWebsite] = React.useState(user.socials.website ?? "")
  const [twitter, setTwitter] = React.useState(user.socials.twitter ?? "")
  const [github, setGithub] = React.useState(user.socials.github ?? "")
  const [linkedin, setLinkedin] = React.useState(user.socials.linkedin ?? "")
  const [isSaving, setIsSaving] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setIsSaving(true)
      const res = await updateUserProfileAction(user.id, {
        username: username.trim() || user.username,
        name: name.trim() || user.name,
        tagline,
        bio,
        location,
        avatarUrl,
        coverUrl,
        timezone,
        subdomainEnabled,
        customDomain: customDomain.trim() || undefined,
        legalSettings,
        seoSettings,
        socials: {
          website: website.trim() || undefined,
          twitter: twitter.trim() || undefined,
          github: github.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
      })
      if (res.success) {
        toast.success("¡Configuración actualizada con éxito!")
      } else {
        toast.error("No se pudo actualizar la configuración")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error al guardar los cambios")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => val && setActiveTab(val as string)} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/60 border border-border/60">
          <TabsTrigger value="perfil" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <UserIcon className="size-3.5" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <Search className="size-3.5 text-amber-500" />
            <span>SEO & GEO</span>
          </TabsTrigger>
          <TabsTrigger value="dominio" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <Network className="size-3.5 text-primary" />
            <span>Dominio & URLs</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <Scale className="size-3.5 text-emerald-500" />
            <span>Páginas Legales</span>
          </TabsTrigger>
          <TabsTrigger value="organizacion" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <Building2 className="size-3.5 text-indigo-500" />
            <span>Organización / Blog</span>
          </TabsTrigger>
          <TabsTrigger value="region" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <Globe className="size-3.5 text-blue-500" />
            <span>Zona Horaria</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <Share2 className="size-3.5" />
            <span>Redes</span>
          </TabsTrigger>
          <TabsTrigger value="integraciones" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <AudioLines className="size-3.5 text-violet-500" />
            <span>Integraciones</span>
          </TabsTrigger>
          <TabsTrigger value="cuenta" className="gap-1.5 text-xs py-2 px-3 cursor-pointer">
            <Shield className="size-3.5" />
            <span>Cuenta</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          {/* TAB 1: PERFIL */}
          <TabsContent value="perfil" className="flex flex-col gap-6">
            {/* Live Preview Card */}
            <Card className="overflow-hidden border-dashed bg-muted/20">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-500" />
                    Vista previa del perfil
                  </CardTitle>
                  <CardDescription className="text-xs">Así se verá tu perfil de autor para los lectores</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-xs cursor-pointer"
                  render={<Link href={`/autor/${username || user.username}`} target="_blank" rel="noreferrer" />}
                >
                  <ExternalLink className="size-3" />
                  Ver página pública
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
                  {coverUrl ? (
                    <div className="h-20 w-full overflow-hidden bg-muted">
                      <img src={coverUrl} alt="Portada" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-14 w-full bg-gradient-to-r from-primary/10 via-secondary to-muted" />
                  )}
                  <div className="p-4 pt-0">
                    <div className="flex items-end justify-between -mt-7 mb-3">
                      <Avatar className="size-14 border-2 border-background shadow-xs">
                        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                      </Avatar>
                      {location && (
                        <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          📍 {location}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-lg font-semibold text-foreground">{name || "Tu Nombre"}</h4>
                    <p className="text-xs text-primary font-medium mt-0.5">@{username || user.username}</p>
                    {tagline && <p className="text-xs text-muted-foreground font-medium mt-1">{tagline}</p>}
                    {bio && <p className="text-xs text-foreground/80 mt-2 line-clamp-2">{bio}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <ProfileSettingsSection
              name={name}
              onNameChange={setName}
              tagline={tagline}
              onTaglineChange={setTagline}
              bio={bio}
              onBioChange={setBio}
              location={location}
              onLocationChange={setLocation}
              avatarUrl={avatarUrl}
              onAvatarUrlChange={setAvatarUrl}
              coverUrl={coverUrl}
              onCoverUrlChange={setCoverUrl}
            />
          </TabsContent>

          {/* TAB: SEO & GEO (GENERATIVE ENGINE OPTIMIZATION) */}
          <TabsContent value="seo" className="flex flex-col gap-6">
            <SeoSettingsSection
              authorName={name || user.name}
              username={username || user.username}
              defaultBio={bio || user.bio}
              defaultLocation={location || user.location}
              seoSettings={seoSettings}
              onSeoSettingsChange={setSeoSettings}
            />
          </TabsContent>

          {/* TAB 2: DOMINIO & URLS (MULTI-TENANCY) */}
          <TabsContent value="dominio" className="flex flex-col gap-6">
            <DomainSettingsSection
              username={username}
              subdomainEnabled={subdomainEnabled}
              customDomain={customDomain}
              onSubdomainEnabledChange={setSubdomainEnabled}
              onCustomDomainChange={setCustomDomain}
            />
          </TabsContent>

          {/* TAB 3: PÁGINAS LEGALES DEL BLOG */}
          <TabsContent value="legal" className="flex flex-col gap-6">
            <LegalSettingsSection
              username={username}
              subdomainEnabled={subdomainEnabled}
              legalSettings={legalSettings}
              onLegalSettingsChange={setLegalSettings}
            />
          </TabsContent>

          {/* TAB 4: ORGANIZACIÓN / BLOG (CLERK) */}
          <TabsContent value="organizacion" className="flex flex-col gap-6">
            <OrganizationSettingsSection />
          </TabsContent>

          {/* TAB 3: ZONA HORARIA Y REGIÓN */}
          <TabsContent value="region" className="flex flex-col gap-6">
            <TimezoneSettingsSection
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          </TabsContent>

          {/* TAB 4: REDES SOCIALES */}
          <TabsContent value="social" className="flex flex-col gap-6">
            <SocialSettingsSection
              website={website}
              onWebsiteChange={setWebsite}
              twitter={twitter}
              onTwitterChange={setTwitter}
              github={github}
              onGithubChange={setGithub}
              linkedin={linkedin}
              onLinkedinChange={setLinkedin}
            />
          </TabsContent>

          <TabsContent value="integraciones" className="flex flex-col gap-6">
            <IntegrationsSettingsSection />
          </TabsContent>

          {/* TAB 5: INFORMACIÓN DE CUENTA */}
          <TabsContent value="cuenta" className="flex flex-col gap-6">
            <AccountSettingsSection
              email={user.email}
              username={username}
              onUsernameChange={setUsername}
              role={user.role}
              joinedAt={user.joinedAt}
              postCount={user.postCount}
              followerCount={user.followerCount}
            />
          </TabsContent>

          {/* Floating Save Button Bar (not strictly necessary on organization tab since Clerk handles its own save, but available globally) */}
          {activeTab !== "organizacion" && activeTab !== "integraciones" && (
            <div className="flex justify-end sticky bottom-4 z-10 bg-background/90 backdrop-blur-md p-3 rounded-lg border border-border/80 shadow-md">
              <LoadingSubmitButton isLoading={isSaving} loadingText="Guardando cambios...">
                Guardar cambios
              </LoadingSubmitButton>
            </div>
          )}
        </form>
      </Tabs>
    </div>
  )
}
