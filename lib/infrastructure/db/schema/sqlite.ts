import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  bio: text("bio").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  location: text("location"),
  socials: text("socials").notNull().default("{}"), // JSON string
  role: text("role").notNull().default("owner"),
  joinedAt: text("joined_at").notNull(),
  postCount: integer("post_count").notNull().default(0),
  followerCount: integer("follower_count").notNull().default(0),
  timezone: text("timezone").notNull().default("UTC"),
  subdomainEnabled: integer("subdomain_enabled", { mode: "boolean" }).notNull().default(true),
  customDomain: text("custom_domain"),
  legalSettings: text("legal_settings").notNull().default("{}"), // JSON string
  seoSettings: text("seo_settings").notNull().default("{}"), // JSON string
})

export const categoriesTable = sqliteTable("categories", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id"),
  authorId: text("author_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3b82f6"),
  icon: text("icon"),
})

export const tagsTable = sqliteTable("tags", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id"),
  authorId: text("author_id"),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  color: text("color").default("#64748b"),
})

export const postsTable = sqliteTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  organizationId: text("organization_id"),
  categoryId: text("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverUrl: text("cover_url"),
  tags: text("tags").notNull().default("[]"), // JSON string array of slugs
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  updatedAt: text("updated_at").notNull(),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  designData: text("design_data"),
  editorMode: text("editor_mode").notNull().default("notion"),
})

export const commentsTable = sqliteTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url").notNull().default(""),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
})

export const tenantTemplatesTable = sqliteTable("tenant_templates", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().unique(),
  tenantType: text("tenant_type").notNull().default("user"),
  name: text("name").notNull().default("Plantilla Predeterminada"),
  schemaVersion: text("schema_version").notNull().default("1.0"),
  version: integer("version").notNull().default(1),
  draftSlots: text("draft_slots").notNull().default("{}"), // JSON string
  publishedSlots: text("published_slots").notNull().default("{}"), // JSON string
  settings: text("settings").notNull().default("{}"), // JSON string
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const tenantTemplateRevisionsTable = sqliteTable("tenant_template_revisions", {
  id: text("id").primaryKey(),
  templateId: text("template_id").notNull().references(() => tenantTemplatesTable.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id").notNull(),
  version: integer("version").notNull(),
  slotsSnapshot: text("slots_snapshot").notNull().default("{}"), // JSON string
  settingsSnapshot: text("settings_snapshot").notNull().default("{}"), // JSON string
  publishedBy: text("published_by"),
  createdAt: text("created_at").notNull(),
  changeSummary: text("change_summary"),
})

