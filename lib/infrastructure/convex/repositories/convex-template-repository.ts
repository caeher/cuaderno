import { api } from "@/convex/_generated/api"
import type { TemplateRepository } from "@/lib/domain/repositories"
import type {
  CreateTemplateInput,
  PublicTenantTemplate,
  TemplateRevision,
  TenantTemplate,
  UpdateTemplateDraftInput,
} from "@/lib/domain/template-schema"
import { validateAndNormalizeSlotMap } from "@/lib/domain/template-validator"
import { convexMutation, convexQuery } from "../client"
import { convexDocToTemplateRevision, convexDocToTenantTemplate } from "../mappers"

export class ConvexTemplateRepository implements TemplateRepository {
  async findByTenantId(tenantId: string): Promise<TenantTemplate | null> {
    const doc = await convexQuery(api.templates.getByTenantId, { tenantId })
    return doc ? convexDocToTenantTemplate(doc) : null
  }

  async findPublishedByTenantSlug(tenantSlug: string): Promise<PublicTenantTemplate | null> {
    const doc = await convexQuery(api.templates.getPublishedForTenantSlug, { username: tenantSlug })
    if (!doc) return null
    return {
      name: doc.name,
      version: doc.version,
      publishedSlots: doc.publishedSlots,
      settings: doc.settings,
      isPublished: doc.isPublished,
    }
  }

  async create(input: CreateTemplateInput): Promise<TenantTemplate> {
    const normalizedDraftSlots = input.draftSlots
      ? validateAndNormalizeSlotMap(input.draftSlots).normalized
      : {}

    const doc = await convexMutation(api.templates.create, {
      tenantId: input.tenantId,
      tenantType: input.tenantType,
      name: input.name,
      draftSlots: normalizedDraftSlots,
      settings: input.settings,
    })
    return convexDocToTenantTemplate(doc)
  }

  async saveDraft(
    tenantId: string,
    input: UpdateTemplateDraftInput
  ): Promise<TenantTemplate> {
    const normalizedDraftSlots = input.draftSlots
      ? validateAndNormalizeSlotMap(input.draftSlots).normalized
      : undefined

    const doc = await convexMutation(api.templates.saveDraft, {
      tenantId,
      name: input.name,
      draftSlots: normalizedDraftSlots,
      settings: input.settings,
    })
    return convexDocToTenantTemplate(doc)
  }

  async publish(
    tenantId: string,
    publishedBy?: string,
    changeSummary?: string
  ): Promise<TenantTemplate> {
    const doc = await convexMutation(api.templates.publish, {
      tenantId,
      publishedBy,
      changeSummary,
    })
    return convexDocToTenantTemplate(doc)
  }

  async getRevisions(tenantId: string): Promise<TemplateRevision[]> {
    const docs = await convexQuery(api.templates.getRevisions, { tenantId })
    return (docs || []).map(convexDocToTemplateRevision)
  }

  async rollback(tenantId: string, revisionId: string): Promise<TenantTemplate | null> {
    const doc = await convexMutation(api.templates.rollback, {
      tenantId,
      revisionId,
    })
    return doc ? convexDocToTenantTemplate(doc) : null
  }
}
