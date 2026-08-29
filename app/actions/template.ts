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
import { getCurrentUser } from "@/lib/application/users"

function revalidateTenantPages(tenantSlug?: string) {
  revalidatePath("/")
  revalidatePath("/explorar")
  revalidatePath("/panel/disenador")
  if (tenantSlug) {
    revalidatePath(`/${tenantSlug}`)
    revalidatePath(`/${tenantSlug}/post/[slug]`, "page")
  }
}

export async function getTenantTemplateAction(tenantId: string, tenantType: "organization" | "user" = "user") {
  try {
    const template = await getOrCreateTenantTemplate(tenantId, tenantType)
    return { success: true, template }
  } catch (error) {
    console.error("Error loading tenant template:", error)
    return { success: false, error: "No se pudo cargar la plantilla del tenant" }
  }
}

export async function saveTenantTemplateDraftAction(
  tenantId: string,
  input: UpdateTemplateDraftInput
) {
  try {
    const updated = await saveTenantTemplateDraft(tenantId, input)
    return { success: true, template: updated }
  } catch (error) {
    console.error("Error saving tenant template draft:", error)
    return { success: false, error: "Error al guardar el borrador de la plantilla" }
  }
}

export async function publishTenantTemplateAction(
  tenantId: string,
  changeSummary?: string,
  tenantSlug?: string
) {
  try {
    const currentUser = await getCurrentUser().catch(() => null)
    const publishedBy = currentUser?.name || currentUser?.username || "Administrador"

    const updated = await publishTenantTemplate(tenantId, publishedBy, changeSummary)
    revalidateTenantPages(tenantSlug)
    return { success: true, template: updated }
  } catch (error) {
    console.error("Error publishing tenant template:", error)
    return { success: false, error: "Error al publicar la plantilla" }
  }
}

export async function getTenantTemplateRevisionsAction(tenantId: string) {
  try {
    const revisions = await getTenantTemplateRevisions(tenantId)
    return { success: true, revisions }
  } catch (error) {
    console.error("Error fetching template revisions:", error)
    return { success: false, error: "Error al obtener el historial de revisiones" }
  }
}

export async function rollbackTenantTemplateAction(
  tenantId: string,
  revisionId: string,
  tenantSlug?: string
) {
  try {
    const updated = await rollbackTenantTemplate(tenantId, revisionId)
    if (!updated) {
      return { success: false, error: "Revisión no encontrada" }
    }
    revalidateTenantPages(tenantSlug)
    return { success: true, template: updated }
  } catch (error) {
    console.error("Error rolling back template revision:", error)
    return { success: false, error: "Error al restaurar la versión anterior" }
  }
}
