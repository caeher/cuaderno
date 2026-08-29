import type {
  CreateTemplateInput,
  TemplateRevision,
  TenantTemplate,
  UpdateTemplateDraftInput,
} from "../template-schema"

export interface TemplateRepository {
  findByTenantId(tenantId: string): Promise<TenantTemplate | null>
  create(input: CreateTemplateInput): Promise<TenantTemplate>
  saveDraft(tenantId: string, input: UpdateTemplateDraftInput): Promise<TenantTemplate>
  publish(tenantId: string, publishedBy?: string, changeSummary?: string): Promise<TenantTemplate>
  getRevisions(tenantId: string): Promise<TemplateRevision[]>
  rollback(tenantId: string, revisionId: string): Promise<TenantTemplate | null>
}
