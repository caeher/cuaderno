"use server"

import { revalidatePath } from "next/cache"
import {
  claimCustomDomain,
  getCurrentCustomDomainClaim,
  removeCustomDomain,
  verifyCustomDomain,
} from "@/lib/application"

export async function getCustomDomainClaimAction() {
  return await getCurrentCustomDomainClaim()
}

export async function claimCustomDomainAction(hostname: string) {
  const claim = await claimCustomDomain(hostname)
  revalidatePath("/panel/configuracion")
  revalidatePath("/")
  return claim
}

export async function verifyCustomDomainAction() {
  const claim = await verifyCustomDomain()
  revalidatePath("/panel/configuracion")
  revalidatePath("/")
  return claim
}

export async function removeCustomDomainAction() {
  const removed = await removeCustomDomain()
  revalidatePath("/panel/configuracion")
  revalidatePath("/")
  return removed
}
