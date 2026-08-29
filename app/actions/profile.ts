"use server"

import { revalidatePath } from "next/cache"
import type { SocialLinks, TenantLegalSettings, TenantSeoSettings } from "@/lib/domain/entities"
import { updateUserProfile } from "@/lib/application"

export async function updateUserProfileAction(
  userId: string,
  data: {
    username?: string
    name: string
    tagline: string
    bio: string
    avatarUrl?: string
    coverUrl?: string
    location?: string
    socials?: SocialLinks
    timezone?: string
    subdomainEnabled?: boolean
    customDomain?: string
    legalSettings?: TenantLegalSettings
    seoSettings?: TenantSeoSettings
  }
) {
  const updated = await updateUserProfile(userId, {
    username: data.username,
    name: data.name,
    tagline: data.tagline,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    coverUrl: data.coverUrl,
    location: data.location,
    socials: data.socials,
    timezone: data.timezone,
    subdomainEnabled: data.subdomainEnabled,
    customDomain: data.customDomain,
    legalSettings: data.legalSettings,
    seoSettings: data.seoSettings,
  })
  revalidatePath("/panel/configuracion")
  revalidatePath("/panel")
  revalidatePath("/")
  if (updated?.username) {
    revalidatePath(`/autor/${updated.username}`)
    revalidatePath(`/${updated.username}`)
    revalidatePath(`/${updated.username}/legal`)
    revalidatePath(`/${updated.username}/llms.txt`)
  }
  return { success: true, user: updated }
}
