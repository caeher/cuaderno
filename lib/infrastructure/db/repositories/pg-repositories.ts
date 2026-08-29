import { eq, desc, and, or } from "drizzle-orm"
import type {
  Category,
  Comment,
  CreateCategoryInput,
  CreateCommentInput,
  CreatePostInput,
  CreateTagInput,
  Post,
  PostStatus,
  Tag,
  UpdateCategoryInput,
  UpdatePostInput,
  UpdateTagInput,
  UpdateUserInput,
  User,
} from "@/lib/domain/entities"
import type {
  CategoryRepository,
  CommentRepository,
  PostRepository,
  TagRepository,
  TemplateRepository,
  UserRepository,
} from "@/lib/domain/repositories"
import { CURRENT_TEMPLATE_SCHEMA_VERSION } from "@/lib/domain/template-schema"
import type {
  CreateTemplateInput,
  TemplateRevision,
  TenantTemplate,
  TenantTemplateSettings,
  UpdateTemplateDraftInput,
} from "@/lib/domain/template-schema"
import { validateAndNormalizeSlotMap } from "@/lib/domain/template-validator"
import { getPgDb } from "../client"
import {
  pgCategoriesTable,
  pgCommentsTable,
  pgPostsTable,
  pgTagsTable,
  pgTenantTemplateRevisionsTable,
  pgTenantTemplatesTable,
  pgUsersTable,
} from "../schema/pg"

function rowToUser(row: typeof pgUsersTable.$inferSelect): User {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl,
    coverUrl: row.coverUrl,
    bio: row.bio,
    tagline: row.tagline,
    location: row.location ?? undefined,
    socials: (row.socials as any) ?? {},
    role: (row.role as "owner" | "admin") || "owner",
    joinedAt: row.joinedAt,
    postCount: row.postCount,
    followerCount: row.followerCount,
    timezone: row.timezone ?? "UTC",
    subdomainEnabled: row.subdomainEnabled ?? true,
    customDomain: row.customDomain ?? undefined,
    legalSettings: (row.legalSettings as any) ?? {},
    seoSettings: (row.seoSettings as any) ?? {},
  }
}

function rowToCategory(row: typeof pgCategoriesTable.$inferSelect): Category {
  return {
    id: row.id,
    organizationId: row.organizationId ?? undefined,
    authorId: row.authorId ?? undefined,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    color: row.color ?? "#3b82f6",
    icon: row.icon ?? undefined,
  }
}

function rowToPost(row: typeof pgPostsTable.$inferSelect): Post {
  return {
    id: row.id,
    authorId: row.authorId,
    organizationId: row.organizationId ?? undefined,
    categoryId: row.categoryId ?? null,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverUrl: row.coverUrl ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: (row.status as PostStatus) || "draft",
    publishedAt: row.publishedAt ?? null,
    updatedAt: row.updatedAt,
    readingTimeMinutes: row.readingTimeMinutes,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    featured: Boolean(row.featured),
    designData: row.designData ?? null,
    editorMode: (row.editorMode as "notion" | "elementor") || "notion",
  }
}

function rowToTag(row: typeof pgTagsTable.$inferSelect): Tag {
  return {
    id: row.id,
    organizationId: row.organizationId ?? undefined,
    authorId: row.authorId ?? undefined,
    slug: row.slug,
    name: row.name,
    color: row.color ?? "#64748b",
  }
}

function rowToComment(row: typeof pgCommentsTable.$inferSelect): Comment {
  return {
    id: row.id,
    postId: row.postId,
    authorName: row.authorName,
    authorAvatarUrl: row.authorAvatarUrl,
    content: row.content,
    createdAt: row.createdAt,
  }
}

export class PgUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const db = getPgDb()
    const rows = await db.select().from(pgUsersTable)
    return rows.map(rowToUser)
  }

  async findById(id: string): Promise<User | null> {
    const db = getPgDb()
    const rows = await db.select().from(pgUsersTable).where(eq(pgUsersTable.id, id)).limit(1)
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async findByUsername(username: string): Promise<User | null> {
    const db = getPgDb()
    const rows = await db.select().from(pgUsersTable).where(eq(pgUsersTable.username, username)).limit(1)
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async create(user: User): Promise<User> {
    const db = getPgDb()
    await db.insert(pgUsersTable).values({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      tagline: user.tagline,
      location: user.location,
      socials: user.socials ?? {},
      role: user.role,
      joinedAt: user.joinedAt,
      postCount: user.postCount,
      followerCount: user.followerCount,
      timezone: user.timezone ?? "UTC",
      subdomainEnabled: user.subdomainEnabled ?? true,
      customDomain: user.customDomain ?? null,
      legalSettings: user.legalSettings ?? {},
      seoSettings: user.seoSettings ?? {},
    })
    return user
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const db = getPgDb()
    const updates: Partial<typeof pgUsersTable.$inferInsert> = {}

    if (input.username !== undefined) updates.username = input.username
    if (input.email !== undefined) updates.email = input.email
    if (input.name !== undefined) updates.name = input.name
    if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl
    if (input.coverUrl !== undefined) updates.coverUrl = input.coverUrl
    if (input.bio !== undefined) updates.bio = input.bio
    if (input.tagline !== undefined) updates.tagline = input.tagline
    if (input.location !== undefined) updates.location = input.location
    if (input.socials !== undefined) updates.socials = input.socials
    if (input.timezone !== undefined) updates.timezone = input.timezone
    if (input.subdomainEnabled !== undefined) updates.subdomainEnabled = input.subdomainEnabled
    if (input.customDomain !== undefined) updates.customDomain = input.customDomain
    if (input.legalSettings !== undefined) updates.legalSettings = input.legalSettings
    if (input.seoSettings !== undefined) updates.seoSettings = input.seoSettings

    await db.update(pgUsersTable).set(updates).where(eq(pgUsersTable.id, id))
    return this.findById(id)
  }
}

export class PgCategoryRepository implements CategoryRepository {
  async findAll(): Promise<Category[]> {
    const db = getPgDb()
    const rows = await db.select().from(pgCategoriesTable)
    return rows.map(rowToCategory)
  }

  async findById(id: string): Promise<Category | null> {
    const db = getPgDb()
    const rows = await db.select().from(pgCategoriesTable).where(eq(pgCategoriesTable.id, id)).limit(1)
    return rows[0] ? rowToCategory(rows[0]) : null
  }

  async findBySlug(slug: string, organizationId?: string): Promise<Category | null> {
    const db = getPgDb()
    const conditions = organizationId
      ? and(eq(pgCategoriesTable.slug, slug), eq(pgCategoriesTable.organizationId, organizationId))
      : eq(pgCategoriesTable.slug, slug)
    const rows = await db.select().from(pgCategoriesTable).where(conditions).limit(1)
    return rows[0] ? rowToCategory(rows[0]) : null
  }

  async findByOrganization(organizationId: string): Promise<Category[]> {
    const db = getPgDb()
    const rows = await db
      .select()
      .from(pgCategoriesTable)
      .where(or(eq(pgCategoriesTable.organizationId, organizationId), eq(pgCategoriesTable.authorId, organizationId)))
    return rows.map(rowToCategory)
  }

  async create(input: CreateCategoryInput & { id?: string }): Promise<Category> {
    const db = getPgDb()
    const id = input.id || "cat_" + Math.random().toString(36).substring(2, 9)
    const category: Category = {
      id,
      organizationId: input.organizationId,
      authorId: input.authorId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      color: input.color || "#3b82f6",
      icon: input.icon,
    }

    await db.insert(pgCategoriesTable).values({
      id: category.id,
      organizationId: category.organizationId ?? null,
      authorId: category.authorId ?? null,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      color: category.color ?? "#3b82f6",
      icon: category.icon ?? null,
    })

    return category
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const db = getPgDb()
    const updates: Partial<typeof pgCategoriesTable.$inferInsert> = {}

    if (input.name !== undefined) updates.name = input.name
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.description !== undefined) updates.description = input.description
    if (input.color !== undefined) updates.color = input.color
    if (input.icon !== undefined) updates.icon = input.icon

    await db.update(pgCategoriesTable).set(updates).where(eq(pgCategoriesTable.id, id))
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const db = getPgDb()
    await db.update(pgPostsTable).set({ categoryId: null }).where(eq(pgPostsTable.categoryId, id))
    await db.delete(pgCategoriesTable).where(eq(pgCategoriesTable.id, id))
    return true
  }
}

export class PgPostRepository implements PostRepository {
  async findAll(): Promise<Post[]> {
    const db = getPgDb()
    const rows = await db.select().from(pgPostsTable).orderBy(desc(pgPostsTable.updatedAt))
    return rows.map(rowToPost)
  }

  async findById(id: string): Promise<Post | null> {
    const db = getPgDb()
    const rows = await db.select().from(pgPostsTable).where(eq(pgPostsTable.id, id)).limit(1)
    return rows[0] ? rowToPost(rows[0]) : null
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const db = getPgDb()
    const rows = await db.select().from(pgPostsTable).where(eq(pgPostsTable.slug, slug)).limit(1)
    return rows[0] ? rowToPost(rows[0]) : null
  }

  async findByAuthorId(authorId: string, status?: PostStatus): Promise<Post[]> {
    const db = getPgDb()
    const conditions = status
      ? and(eq(pgPostsTable.authorId, authorId), eq(pgPostsTable.status, status))
      : eq(pgPostsTable.authorId, authorId)
    const rows = await db.select().from(pgPostsTable).where(conditions).orderBy(desc(pgPostsTable.updatedAt))
    return rows.map(rowToPost)
  }

  async findPublished(): Promise<Post[]> {
    const db = getPgDb()
    const rows = await db
      .select()
      .from(pgPostsTable)
      .where(eq(pgPostsTable.status, "published"))
      .orderBy(desc(pgPostsTable.publishedAt))
    return rows.map(rowToPost)
  }

  async findFeatured(): Promise<Post[]> {
    const db = getPgDb()
    const rows = await db
      .select()
      .from(pgPostsTable)
      .where(and(eq(pgPostsTable.status, "published"), eq(pgPostsTable.featured, true)))
      .orderBy(desc(pgPostsTable.publishedAt))
    return rows.map(rowToPost)
  }

  async findByTag(tagSlug: string): Promise<Post[]> {
    const published = await this.findPublished()
    return published.filter((p) => p.tags.includes(tagSlug))
  }

  async findByCategory(categoryIdOrSlug: string): Promise<Post[]> {
    const published = await this.findPublished()
    return published.filter((p) => p.categoryId === categoryIdOrSlug)
  }

  async create(input: CreatePostInput): Promise<Post> {
    const db = getPgDb()
    const now = new Date().toISOString().split("T")[0]
    const id = "p_" + Math.random().toString(36).substring(2, 9)

    const newPost: Post = {
      id,
      authorId: input.authorId,
      organizationId: input.organizationId,
      categoryId: input.categoryId ?? null,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      coverUrl: input.coverUrl ?? null,
      tags: input.tags,
      status: input.status,
      publishedAt: input.status === "published" ? now : null,
      updatedAt: now,
      readingTimeMinutes: input.readingTimeMinutes ?? Math.max(1, Math.ceil(input.content.split(/\s+/).length / 200)),
      views: 0,
      likes: 0,
      comments: 0,
      featured: input.featured ?? false,
      designData: input.designData ?? null,
      editorMode: input.editorMode ?? "notion",
    }

    await db.insert(pgPostsTable).values({
      id: newPost.id,
      authorId: newPost.authorId,
      organizationId: newPost.organizationId ?? null,
      categoryId: newPost.categoryId ?? null,
      title: newPost.title,
      slug: newPost.slug,
      excerpt: newPost.excerpt,
      content: newPost.content,
      coverUrl: newPost.coverUrl,
      tags: newPost.tags,
      status: newPost.status,
      publishedAt: newPost.publishedAt,
      updatedAt: newPost.updatedAt,
      readingTimeMinutes: newPost.readingTimeMinutes,
      views: newPost.views,
      likes: newPost.likes,
      comments: newPost.comments,
      featured: newPost.featured,
      designData: newPost.designData,
      editorMode: newPost.editorMode,
    })

    // Update user's post count
    const author = await db.select().from(pgUsersTable).where(eq(pgUsersTable.id, newPost.authorId)).limit(1)
    if (author[0]) {
      await db.update(pgUsersTable).set({ postCount: (author[0].postCount ?? 0) + 1 }).where(eq(pgUsersTable.id, newPost.authorId))
    }

    return newPost
  }

  async update(id: string, input: UpdatePostInput): Promise<Post | null> {
    const db = getPgDb()
    const now = new Date().toISOString().split("T")[0]
    const updates: Partial<typeof pgPostsTable.$inferInsert> = {
      updatedAt: now,
    }

    if (input.title !== undefined) updates.title = input.title
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.excerpt !== undefined) updates.excerpt = input.excerpt
    if (input.content !== undefined) {
      updates.content = input.content
      updates.readingTimeMinutes = Math.max(1, Math.ceil(input.content.split(/\s+/).length / 200))
    }
    if (input.coverUrl !== undefined) updates.coverUrl = input.coverUrl
    if (input.categoryId !== undefined) updates.categoryId = input.categoryId
    if (input.organizationId !== undefined) updates.organizationId = input.organizationId
    if (input.tags !== undefined) updates.tags = input.tags
    if (input.status !== undefined) {
      updates.status = input.status
      if (input.status === "published") {
        updates.publishedAt = now
      }
    }
    if (input.readingTimeMinutes !== undefined) updates.readingTimeMinutes = input.readingTimeMinutes
    if (input.featured !== undefined) updates.featured = input.featured
    if (input.views !== undefined) updates.views = input.views
    if (input.likes !== undefined) updates.likes = input.likes
    if (input.comments !== undefined) updates.comments = input.comments
    if (input.designData !== undefined) updates.designData = input.designData
    if (input.editorMode !== undefined) updates.editorMode = input.editorMode

    await db.update(pgPostsTable).set(updates).where(eq(pgPostsTable.id, id))
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const db = getPgDb()
    const post = await db.select().from(pgPostsTable).where(eq(pgPostsTable.id, id)).limit(1)
    if (post[0]) {
      // Delete comments associated with this post
      await db.delete(pgCommentsTable).where(eq(pgCommentsTable.postId, id))
      // Update user post count
      const author = await db.select().from(pgUsersTable).where(eq(pgUsersTable.id, post[0].authorId)).limit(1)
      if (author[0]) {
        await db.update(pgUsersTable).set({ postCount: Math.max(0, (author[0].postCount ?? 1) - 1) }).where(eq(pgUsersTable.id, post[0].authorId))
      }
      await db.delete(pgPostsTable).where(eq(pgPostsTable.id, id))
    }
    return true
  }
}

export class PgTagRepository implements TagRepository {
  async findAll(): Promise<Tag[]> {
    const db = getPgDb()
    const rows = await db.select().from(pgTagsTable)
    return rows.map(rowToTag)
  }

  async findById(id: string): Promise<Tag | null> {
    const db = getPgDb()
    const rows = await db.select().from(pgTagsTable).where(eq(pgTagsTable.id, id)).limit(1)
    return rows[0] ? rowToTag(rows[0]) : null
  }

  async findBySlug(slug: string, organizationId?: string): Promise<Tag | null> {
    const db = getPgDb()
    const conditions = organizationId
      ? and(eq(pgTagsTable.slug, slug), eq(pgTagsTable.organizationId, organizationId))
      : eq(pgTagsTable.slug, slug)
    const rows = await db.select().from(pgTagsTable).where(conditions).limit(1)
    return rows[0] ? rowToTag(rows[0]) : null
  }

  async findByOrganization(organizationId: string): Promise<Tag[]> {
    const db = getPgDb()
    const rows = await db
      .select()
      .from(pgTagsTable)
      .where(or(eq(pgTagsTable.organizationId, organizationId), eq(pgTagsTable.authorId, organizationId)))
    return rows.map(rowToTag)
  }

  async create(input: CreateTagInput & { id?: string }): Promise<Tag> {
    const db = getPgDb()
    const id = input.id || "t_" + Math.random().toString(36).substring(2, 9)
    const tag: Tag = {
      id,
      organizationId: input.organizationId,
      authorId: input.authorId,
      name: input.name,
      slug: input.slug,
      color: input.color || "#64748b",
    }

    await db.insert(pgTagsTable).values({
      id: tag.id,
      organizationId: tag.organizationId ?? null,
      authorId: tag.authorId ?? null,
      slug: tag.slug,
      name: tag.name,
      color: tag.color ?? "#64748b",
    })
    return tag
  }

  async update(id: string, input: UpdateTagInput): Promise<Tag | null> {
    const db = getPgDb()
    const updates: Partial<typeof pgTagsTable.$inferInsert> = {}

    if (input.name !== undefined) updates.name = input.name
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.color !== undefined) updates.color = input.color

    await db.update(pgTagsTable).set(updates).where(eq(pgTagsTable.id, id))
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const db = getPgDb()
    await db.delete(pgTagsTable).where(eq(pgTagsTable.id, id))
    return true
  }
}


export class PgCommentRepository implements CommentRepository {
  async findByPostId(postId: string): Promise<Comment[]> {
    const db = getPgDb()
    const rows = await db
      .select()
      .from(pgCommentsTable)
      .where(eq(pgCommentsTable.postId, postId))
      .orderBy(desc(pgCommentsTable.createdAt))
    return rows.map(rowToComment)
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const db = getPgDb()
    const now = new Date().toISOString().split("T")[0]
    const comment: Comment = {
      id: "c_" + Math.random().toString(36).substring(2, 9),
      postId: input.postId,
      authorName: input.authorName,
      authorAvatarUrl: input.authorAvatarUrl || "/placeholder.svg?height=200&width=200",
      content: input.content,
      createdAt: now,
    }

    await db.insert(pgCommentsTable).values(comment)

    // Update post comments count
    const post = await db.select().from(pgPostsTable).where(eq(pgPostsTable.id, input.postId)).limit(1)
    if (post[0]) {
      await db.update(pgPostsTable).set({ comments: (post[0].comments ?? 0) + 1 }).where(eq(pgPostsTable.id, input.postId))
    }

    return comment
  }

  async delete(id: string): Promise<boolean> {
    const db = getPgDb()
    const found = await db.select().from(pgCommentsTable).where(eq(pgCommentsTable.id, id)).limit(1)
    if (found[0]) {
      await db.delete(pgCommentsTable).where(eq(pgCommentsTable.id, id))
      const post = await db.select().from(pgPostsTable).where(eq(pgPostsTable.id, found[0].postId)).limit(1)
      if (post[0]) {
        await db.update(pgPostsTable).set({ comments: Math.max(0, (post[0].comments ?? 1) - 1) }).where(eq(pgPostsTable.id, found[0].postId))
      }
    }
    return true
  }
}

function rowToTenantTemplate(row: typeof pgTenantTemplatesTable.$inferSelect): TenantTemplate {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tenantType: (row.tenantType as "organization" | "user") || "user",
    schemaVersion: "1.0",
    version: row.version ?? 1,
    name: row.name || "Plantilla Predeterminada",
    draftSlots: (row.draftSlots as any) ?? {},
    publishedSlots: (row.publishedSlots as any) ?? {},
    settings: (row.settings as any) ?? {},
    isPublished: Boolean(row.isPublished),
    publishedAt: row.publishedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function rowToTemplateRevision(row: typeof pgTenantTemplateRevisionsTable.$inferSelect): TemplateRevision {
  return {
    id: row.id,
    templateId: row.templateId,
    tenantId: row.tenantId,
    version: row.version,
    slotsSnapshot: (row.slotsSnapshot as any) ?? {},
    settingsSnapshot: (row.settingsSnapshot as any) ?? {},
    publishedBy: row.publishedBy ?? null,
    createdAt: row.createdAt,
    changeSummary: row.changeSummary ?? undefined,
  }
}

export class PgTemplateRepository implements TemplateRepository {
  async findByTenantId(tenantId: string): Promise<TenantTemplate | null> {
    const db = getPgDb()
    const rows = await db
      .select()
      .from(pgTenantTemplatesTable)
      .where(eq(pgTenantTemplatesTable.tenantId, tenantId))
      .limit(1)
    return rows[0] ? rowToTenantTemplate(rows[0]) : null
  }

  async create(input: CreateTemplateInput): Promise<TenantTemplate> {
    const db = getPgDb()
    const now = new Date().toISOString()
    const id = "tpl_" + Math.random().toString(36).substring(2, 9)

    const normalizedDraftSlots = input.draftSlots ? validateAndNormalizeSlotMap(input.draftSlots).normalized : {}

    const template: TenantTemplate = {
      id,
      tenantId: input.tenantId,
      tenantType: input.tenantType,
      schemaVersion: CURRENT_TEMPLATE_SCHEMA_VERSION,
      version: 1,
      name: input.name || "Plantilla Predeterminada",
      draftSlots: normalizedDraftSlots,
      publishedSlots: {},
      settings: input.settings || {},
      isPublished: false,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(pgTenantTemplatesTable).values({
      id: template.id,
      tenantId: template.tenantId,
      tenantType: template.tenantType,
      schemaVersion: template.schemaVersion,
      version: template.version,
      name: template.name,
      draftSlots: template.draftSlots,
      publishedSlots: template.publishedSlots,
      settings: template.settings,
      isPublished: false,
      publishedAt: null,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    })

    return template
  }

  async saveDraft(tenantId: string, input: UpdateTemplateDraftInput): Promise<TenantTemplate> {
    const db = getPgDb()
    const now = new Date().toISOString()

    let current = await this.findByTenantId(tenantId)
    if (!current) {
      const isOrg = tenantId.startsWith("org_")
      current = await this.create({
        tenantId,
        tenantType: isOrg ? "organization" : "user",
        name: input.name,
        draftSlots: input.draftSlots,
        settings: input.settings,
      })
    }

    const updates: Partial<typeof pgTenantTemplatesTable.$inferInsert> = {
      updatedAt: now,
    }

    if (input.name !== undefined) updates.name = input.name
    if (input.draftSlots !== undefined) {
      const { normalized } = validateAndNormalizeSlotMap(input.draftSlots)
      updates.draftSlots = normalized
    }
    if (input.settings !== undefined) updates.settings = input.settings

    await db.update(pgTenantTemplatesTable).set(updates).where(eq(pgTenantTemplatesTable.tenantId, tenantId))
    const updated = await this.findByTenantId(tenantId)
    return updated!
  }

  async publish(tenantId: string, publishedBy?: string, changeSummary?: string): Promise<TenantTemplate> {
    const db = getPgDb()
    const now = new Date().toISOString()

    let current = await this.findByTenantId(tenantId)
    if (!current) {
      const isOrg = tenantId.startsWith("org_")
      current = await this.create({
        tenantId,
        tenantType: isOrg ? "organization" : "user",
      })
    }

    const nextVersion = current.version + 1
    const publishedSlots = { ...current.draftSlots }

    // 1. Update template
    await db
      .update(pgTenantTemplatesTable)
      .set({
        publishedSlots,
        isPublished: true,
        publishedAt: now,
        version: nextVersion,
        updatedAt: now,
      })
      .where(eq(pgTenantTemplatesTable.tenantId, tenantId))

    // 2. Insert revision record
    const revId = "rev_" + Math.random().toString(36).substring(2, 9)
    await db.insert(pgTenantTemplateRevisionsTable).values({
      id: revId,
      templateId: current.id,
      tenantId,
      version: nextVersion,
      slotsSnapshot: publishedSlots,
      settingsSnapshot: current.settings,
      publishedBy: publishedBy || null,
      createdAt: now,
      changeSummary: changeSummary || `Publicación de versión ${nextVersion}`,
    })

    const updated = await this.findByTenantId(tenantId)
    return updated!
  }

  async getRevisions(tenantId: string): Promise<TemplateRevision[]> {
    const db = getPgDb()
    const rows = await db
      .select()
      .from(pgTenantTemplateRevisionsTable)
      .where(eq(pgTenantTemplateRevisionsTable.tenantId, tenantId))
      .orderBy(desc(pgTenantTemplateRevisionsTable.version))

    return rows.map(rowToTemplateRevision)
  }

  async rollback(tenantId: string, revisionId: string): Promise<TenantTemplate | null> {
    const db = getPgDb()
    const revRow = await db
      .select()
      .from(pgTenantTemplateRevisionsTable)
      .where(eq(pgTenantTemplateRevisionsTable.id, revisionId))
      .limit(1)

    if (!revRow[0]) return null
    const rev = rowToTemplateRevision(revRow[0])
    const now = new Date().toISOString()

    await db
      .update(pgTenantTemplatesTable)
      .set({
        draftSlots: rev.slotsSnapshot,
        settings: rev.settingsSnapshot,
        updatedAt: now,
      })
      .where(eq(pgTenantTemplatesTable.tenantId, tenantId))

    return this.findByTenantId(tenantId)
  }
}
