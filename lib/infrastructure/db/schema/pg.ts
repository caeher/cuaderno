import { boolean, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core"

export const pgUsersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  bio: text("bio").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  location: text("location"),
  socials: jsonb("socials").notNull().default({}),
  role: text("role").notNull().default("owner"),
  joinedAt: text("joined_at").notNull(),
  postCount: integer("post_count").notNull().default(0),
  followerCount: integer("follower_count").notNull().default(0),
  timezone: text("timezone").notNull().default("UTC"),
  subdomainEnabled: boolean("subdomain_enabled").notNull().default(true),
  customDomain: text("custom_domain"),
  legalSettings: jsonb("legal_settings").notNull().default({}),
  seoSettings: jsonb("seo_settings").notNull().default({}),
})

export const pgCategoriesTable = pgTable("categories", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id"),
  authorId: text("author_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3b82f6"),
  icon: text("icon"),
})

export const pgTagsTable = pgTable("tags", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id"),
  authorId: text("author_id"),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  color: text("color").default("#64748b"),
})

export const pgPostsTable = pgTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => pgUsersTable.id, { onDelete: "cascade" }),
  organizationId: text("organization_id"),
  categoryId: text("category_id").references(() => pgCategoriesTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverUrl: text("cover_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  updatedAt: text("updated_at").notNull(),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  // @deprecated - Kept for audit/backwards compatibility only; templates are now tenant-level
  designData: text("design_data"),
  // @deprecated - Kept for audit/backwards compatibility only; posts use standard editor
  editorMode: text("editor_mode").notNull().default("notion"),
})

export const pgCommentsTable = pgTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => pgPostsTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url").notNull().default(""),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
})

export const pgTenantTemplatesTable = pgTable("tenant_templates", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().unique(),
  tenantType: text("tenant_type").notNull().default("user"),
  name: text("name").notNull().default("Plantilla Predeterminada"),
  schemaVersion: text("schema_version").notNull().default("1.0"),
  version: integer("version").notNull().default(1),
  draftSlots: jsonb("draft_slots").notNull().default({}),
  publishedSlots: jsonb("published_slots").notNull().default({}),
  settings: jsonb("settings").notNull().default({}),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const pgTenantTemplateRevisionsTable = pgTable("tenant_template_revisions", {
  id: text("id").primaryKey(),
  templateId: text("template_id").notNull().references(() => pgTenantTemplatesTable.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id").notNull(),
  version: integer("version").notNull(),
  slotsSnapshot: jsonb("slots_snapshot").notNull().default({}),
  settingsSnapshot: jsonb("settings_snapshot").notNull().default({}),
  publishedBy: text("published_by"),
  createdAt: text("created_at").notNull(),
  changeSummary: text("change_summary"),
})

