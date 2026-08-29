import type {
  TemplateRevision,
  TenantTemplate,
  UpdateTemplateDraftInput,
} from "@/lib/domain/template-schema"
import { templateRepository } from "@/lib/infrastructure/repositories"

/**
 * Retrieves the template associated with a tenant (draft + published).
 */
export async function getTenantTemplate(tenantId: string): Promise<TenantTemplate | null> {
  return templateRepository.findByTenantId(tenantId)
}

/**
 * Retrieves or creates a template for the given tenant with initial default structure.
 */
export async function getOrCreateTenantTemplate(
  tenantId: string,
  tenantType: "organization" | "user" = "user"
): Promise<TenantTemplate> {
  const existing = await templateRepository.findByTenantId(tenantId)
  if (existing) {
    return existing
  }

  return templateRepository.create({
    tenantId,
    tenantType,
    name: "Plantilla del Blog",
    draftSlots: {},
    settings: {
      primaryColor: "#3b82f6",
      containerMaxWidth: "1100px",
    },
  })
}

/**
 * Saves draft changes for a tenant's template (without publishing).
 */
export async function saveTenantTemplateDraft(
  tenantId: string,
  input: UpdateTemplateDraftInput
): Promise<TenantTemplate> {
  return templateRepository.saveDraft(tenantId, input)
}

/**
 * Publishes the draft template to production and records a revision.
 */
export async function publishTenantTemplate(
  tenantId: string,
  publishedBy?: string,
  changeSummary?: string
): Promise<TenantTemplate> {
  return templateRepository.publish(tenantId, publishedBy, changeSummary)
}

/**
 * Retrieves the revision history of the tenant's template.
 */
export async function getTenantTemplateRevisions(tenantId: string): Promise<TemplateRevision[]> {
  return templateRepository.getRevisions(tenantId)
}

/**
 * Reverts the template to a historical revision.
 */
export async function rollbackTenantTemplate(
  tenantId: string,
  revisionId: string
): Promise<TenantTemplate | null> {
  return templateRepository.rollback(tenantId, revisionId)
}

/**
 * Gets the active published template for public route rendering.
 * Returns null if no template exists or if it hasn't been published yet.
 */
export async function getPublishedTemplateForTenant(tenantId: string): Promise<TenantTemplate | null> {
  const template = await templateRepository.findByTenantId(tenantId)
  if (!template || !template.isPublished) {
    return null
  }
  return template
}
