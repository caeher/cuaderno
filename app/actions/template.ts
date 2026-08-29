"use server"

import { revalidatePath } from "next/cache"
import type { UpdateTemplateDraftInput } from "@/lib/domain/template-schema"
import {
  getOrCreateTenantTemplate,
  getTenantTemplate,
  getTenantTemplateRevisions,
  publishTenantTemplate,
  rollbackTenantTemplate,
  saveTenantTemplateDraft,
} from "@/lib/application/tenant/template-use-cases"
import { resolveAndAuthorizeTenant } from "@/lib/application/tenant/tenant-auth"

function revalidateTenantPages(tenantSlug?: string) {
  revalidatePath("/")
  revalidatePath("/explorar")
  revalidatePath("/panel/disenador")
  if (tenantSlug) {
    revalidatePath(`/${tenantSlug}`)
    revalidatePath(`/${tenantSlug}/post/[slug]`, "page")
  }
}

export async function getTenantTemplateAction(
  tenantId?: string,
  tenantType?: "organization" | "user"
) {
  try {
    const authContext = await resolveAndAuthorizeTenant(tenantId)
    const effectiveTenantId = tenantId || authContext.tenantId
    const effectiveTenantType = tenantType || authContext.tenantType

    const template = await getOrCreateTenantTemplate(effectiveTenantId, effectiveTenantType)
    return { success: true, template }
  } catch (error: any) {
    console.error("Error loading tenant template:", error)
    return { success: false, error: error?.message || "No se pudo cargar la plantilla del tenant" }
  }
}

export async function saveTenantTemplateDraftAction(
  tenantId: string,
  input: UpdateTemplateDraftInput
) {
  try {
    const authContext = await resolveAndAuthorizeTenant(tenantId)
    const updated = await saveTenantTemplateDraft(authContext.tenantId, input)
    revalidatePath("/panel/disenador")
    return { success: true, template: updated }
  } catch (error: any) {
    console.error("Error saving tenant template draft:", error)
    return { success: false, error: error?.message || "Error al guardar el borrador de la plantilla" }
  }
}

export async function publishTenantTemplateAction(
  tenantId: string,
  changeSummary?: string,
  tenantSlug?: string
) {
  try {
    const authContext = await resolveAndAuthorizeTenant(tenantId)
    const publishedBy = authContext.userName || "Administrador"

    const updated = await publishTenantTemplate(authContext.tenantId, publishedBy, changeSummary)
    revalidateTenantPages(tenantSlug)
    return { success: true, template: updated }
  } catch (error: any) {
    console.error("Error publishing tenant template:", error)
    return { success: false, error: error?.message || "Error al publicar la plantilla" }
  }
}

export async function getTenantTemplateRevisionsAction(tenantId: string) {
  try {
    const authContext = await resolveAndAuthorizeTenant(tenantId)
    const revisions = await getTenantTemplateRevisions(authContext.tenantId)
    return { success: true, revisions }
  } catch (error: any) {
    console.error("Error fetching template revisions:", error)
    return { success: false, error: error?.message || "Error al obtener el historial de revisiones" }
  }
}

export async function rollbackTenantTemplateAction(
  tenantId: string,
  revisionId: string,
  tenantSlug?: string
) {
  try {
    const authContext = await resolveAndAuthorizeTenant(tenantId)
    const updated = await rollbackTenantTemplate(authContext.tenantId, revisionId)
    if (!updated) {
      return { success: false, error: "Revisión no encontrada" }
    }
    revalidateTenantPages(tenantSlug)
    return { success: true, template: updated }
  } catch (error: any) {
    console.error("Error rolling back template revision:", error)
    return { success: false, error: error?.message || "Error al restaurar la versión anterior" }
  }
}
