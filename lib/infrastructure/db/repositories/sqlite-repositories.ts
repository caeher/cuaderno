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
  UserRepository,
} from "@/lib/domain/repositories"
import { ensureDatabaseInitialized } from "../auto-init"
import { getSqliteDb } from "../client"
import { categoriesTable, commentsTable, postsTable, tagsTable, usersTable } from "../schema/sqlite"

function rowToUser(row: typeof usersTable.$inferSelect): User {
  let socials = {}
  try {
    socials = typeof row.socials === "string" ? JSON.parse(row.socials) : (row.socials ?? {})
  } catch {
    socials = {}
  }

  let legalSettings = {}
  try {
    legalSettings = typeof row.legalSettings === "string" ? JSON.parse(row.legalSettings) : (row.legalSettings ?? {})
  } catch {
    legalSettings = {}
  }

  let seoSettings = {}
  try {
    seoSettings = typeof row.seoSettings === "string" ? JSON.parse(row.seoSettings) : (row.seoSettings ?? {})
  } catch {
    seoSettings = {}
  }

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
    socials,
    role: (row.role as "owner" | "admin") || "owner",
    joinedAt: row.joinedAt,
    postCount: row.postCount,
    followerCount: row.followerCount,
    timezone: row.timezone ?? "UTC",
    subdomainEnabled: row.subdomainEnabled ?? true,
    customDomain: row.customDomain ?? undefined,
    legalSettings,
    seoSettings,
  }
}

function rowToCategory(row: typeof categoriesTable.$inferSelect): Category {
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

function rowToPost(row: typeof postsTable.$inferSelect): Post {
  let tags: string[] = []
  try {
    tags = typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags ?? [])
  } catch {
    tags = []
  }

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
    tags,
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

function rowToTag(row: typeof tagsTable.$inferSelect): Tag {
  return {
    id: row.id,
    organizationId: row.organizationId ?? undefined,
    authorId: row.authorId ?? undefined,
    slug: row.slug,
    name: row.name,
    color: row.color ?? "#64748b",
  }
}

function rowToComment(row: typeof commentsTable.$inferSelect): Comment {
  return {
    id: row.id,
    postId: row.postId,
    authorName: row.authorName,
    authorAvatarUrl: row.authorAvatarUrl,
    content: row.content,
    createdAt: row.createdAt,
  }
}

export class SqliteUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(usersTable)
    return rows.map(rowToUser)
  }

  async findById(id: string): Promise<User | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async findByUsername(username: string): Promise<User | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1)
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async create(user: User): Promise<User> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    await db.insert(usersTable).values({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      tagline: user.tagline,
      location: user.location,
      socials: JSON.stringify(user.socials ?? {}),
      role: user.role,
      joinedAt: user.joinedAt,
      postCount: user.postCount,
      followerCount: user.followerCount,
      timezone: user.timezone ?? "UTC",
      subdomainEnabled: user.subdomainEnabled ?? true,
      customDomain: user.customDomain ?? null,
      legalSettings: JSON.stringify(user.legalSettings ?? {}),
      seoSettings: JSON.stringify(user.seoSettings ?? {}),
    })
    return user
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const updates: Partial<typeof usersTable.$inferInsert> = {}

    if (input.name !== undefined) updates.name = input.name
    if (input.username !== undefined) updates.username = input.username
    if (input.email !== undefined) updates.email = input.email
    if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl
    if (input.coverUrl !== undefined) updates.coverUrl = input.coverUrl
    if (input.bio !== undefined) updates.bio = input.bio
    if (input.tagline !== undefined) updates.tagline = input.tagline
    if (input.location !== undefined) updates.location = input.location
    if (input.socials !== undefined) updates.socials = JSON.stringify(input.socials)
    if (input.timezone !== undefined) updates.timezone = input.timezone
    if (input.subdomainEnabled !== undefined) updates.subdomainEnabled = input.subdomainEnabled
    if (input.customDomain !== undefined) updates.customDomain = input.customDomain
    if (input.legalSettings !== undefined) updates.legalSettings = JSON.stringify(input.legalSettings)
    if (input.seoSettings !== undefined) updates.seoSettings = JSON.stringify(input.seoSettings)

    await db.update(usersTable).set(updates).where(eq(usersTable.id, id))
    return this.findById(id)
  }
}

export class SqliteCategoryRepository implements CategoryRepository {
  async findAll(): Promise<Category[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(categoriesTable)
    return rows.map(rowToCategory)
  }

  async findById(id: string): Promise<Category | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1)
    return rows[0] ? rowToCategory(rows[0]) : null
  }

  async findBySlug(slug: string, organizationId?: string): Promise<Category | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const conditions = organizationId
      ? and(eq(categoriesTable.slug, slug), eq(categoriesTable.organizationId, organizationId))
      : eq(categoriesTable.slug, slug)
    const rows = await db.select().from(categoriesTable).where(conditions).limit(1)
    return rows[0] ? rowToCategory(rows[0]) : null
  }

  async findByOrganization(organizationId: string): Promise<Category[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db
      .select()
      .from(categoriesTable)
      .where(or(eq(categoriesTable.organizationId, organizationId), eq(categoriesTable.authorId, organizationId)))
    return rows.map(rowToCategory)
  }

  async create(input: CreateCategoryInput & { id?: string }): Promise<Category> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
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

    await db.insert(categoriesTable).values({
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
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const updates: Partial<typeof categoriesTable.$inferInsert> = {}

    if (input.name !== undefined) updates.name = input.name
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.description !== undefined) updates.description = input.description
    if (input.color !== undefined) updates.color = input.color
    if (input.icon !== undefined) updates.icon = input.icon

    await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id))
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    await db.update(postsTable).set({ categoryId: null }).where(eq(postsTable.categoryId, id))
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id))
    return true
  }
}

export class SqlitePostRepository implements PostRepository {
  async findAll(): Promise<Post[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(postsTable).orderBy(desc(postsTable.updatedAt))
    return rows.map(rowToPost)
  }

  async findById(id: string): Promise<Post | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1)
    return rows[0] ? rowToPost(rows[0]) : null
  }

  async findBySlug(slug: string): Promise<Post | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(postsTable).where(eq(postsTable.slug, slug)).limit(1)
    return rows[0] ? rowToPost(rows[0]) : null
  }

  async findByAuthorId(authorId: string, status?: PostStatus): Promise<Post[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const conditions = status
      ? and(eq(postsTable.authorId, authorId), eq(postsTable.status, status))
      : eq(postsTable.authorId, authorId)
    const rows = await db.select().from(postsTable).where(conditions).orderBy(desc(postsTable.updatedAt))
    return rows.map(rowToPost)
  }

  async findPublished(): Promise<Post[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.status, "published"))
      .orderBy(desc(postsTable.publishedAt))
    return rows.map(rowToPost)
  }

  async findFeatured(): Promise<Post[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.status, "published"), eq(postsTable.featured, true)))
      .orderBy(desc(postsTable.publishedAt))
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
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
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

    await db.insert(postsTable).values({
      id: newPost.id,
      authorId: newPost.authorId,
      organizationId: newPost.organizationId ?? null,
      categoryId: newPost.categoryId ?? null,
      title: newPost.title,
      slug: newPost.slug,
      excerpt: newPost.excerpt,
      content: newPost.content,
      coverUrl: newPost.coverUrl,
      tags: JSON.stringify(newPost.tags),
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
    const author = await db.select().from(usersTable).where(eq(usersTable.id, newPost.authorId)).limit(1)
    if (author[0]) {
      await db.update(usersTable).set({ postCount: (author[0].postCount ?? 0) + 1 }).where(eq(usersTable.id, newPost.authorId))
    }

    return newPost
  }

  async update(id: string, input: UpdatePostInput): Promise<Post | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const now = new Date().toISOString().split("T")[0]
    const updates: Partial<typeof postsTable.$inferInsert> = {
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
    if (input.tags !== undefined) updates.tags = JSON.stringify(input.tags)
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

    await db.update(postsTable).set(updates).where(eq(postsTable.id, id))
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const post = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1)
    if (post[0]) {
      // Delete comments associated with this post
      await db.delete(commentsTable).where(eq(commentsTable.postId, id))
      // Update user post count
      const author = await db.select().from(usersTable).where(eq(usersTable.id, post[0].authorId)).limit(1)
      if (author[0]) {
        await db.update(usersTable).set({ postCount: Math.max(0, (author[0].postCount ?? 1) - 1) }).where(eq(usersTable.id, post[0].authorId))
      }
      await db.delete(postsTable).where(eq(postsTable.id, id))
    }
    return true
  }
}

export class SqliteTagRepository implements TagRepository {
  async findAll(): Promise<Tag[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(tagsTable)
    return rows.map(rowToTag)
  }

  async findById(id: string): Promise<Tag | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db.select().from(tagsTable).where(eq(tagsTable.id, id)).limit(1)
    return rows[0] ? rowToTag(rows[0]) : null
  }

  async findBySlug(slug: string, organizationId?: string): Promise<Tag | null> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const conditions = organizationId
      ? and(eq(tagsTable.slug, slug), eq(tagsTable.organizationId, organizationId))
      : eq(tagsTable.slug, slug)
    const rows = await db.select().from(tagsTable).where(conditions).limit(1)
    return rows[0] ? rowToTag(rows[0]) : null
  }

  async findByOrganization(organizationId: string): Promise<Tag[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db
      .select()
      .from(tagsTable)
      .where(or(eq(tagsTable.organizationId, organizationId), eq(tagsTable.authorId, organizationId)))
    return rows.map(rowToTag)
  }

  async create(input: CreateTagInput & { id?: string }): Promise<Tag> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const id = input.id || "t_" + Math.random().toString(36).substring(2, 9)
    const tag: Tag = {
      id,
      organizationId: input.organizationId,
      authorId: input.authorId,
      name: input.name,
      slug: input.slug,
      color: input.color || "#64748b",
    }

    await db.insert(tagsTable).values({
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
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const updates: Partial<typeof tagsTable.$inferInsert> = {}

    if (input.name !== undefined) updates.name = input.name
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.color !== undefined) updates.color = input.color

    await db.update(tagsTable).set(updates).where(eq(tagsTable.id, id))
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    await db.delete(tagsTable).where(eq(tagsTable.id, id))
    return true
  }
}


export class SqliteCommentRepository implements CommentRepository {
  async findByPostId(postId: string): Promise<Comment[]> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const rows = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.postId, postId))
      .orderBy(desc(commentsTable.createdAt))
    return rows.map(rowToComment)
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const now = new Date().toISOString().split("T")[0]
    const comment: Comment = {
      id: "c_" + Math.random().toString(36).substring(2, 9),
      postId: input.postId,
      authorName: input.authorName,
      authorAvatarUrl: input.authorAvatarUrl || "/placeholder.svg?height=200&width=200",
      content: input.content,
      createdAt: now,
    }

    await db.insert(commentsTable).values(comment)

    // Update post comments count
    const post = await db.select().from(postsTable).where(eq(postsTable.id, input.postId)).limit(1)
    if (post[0]) {
      await db.update(postsTable).set({ comments: (post[0].comments ?? 0) + 1 }).where(eq(postsTable.id, input.postId))
    }

    return comment
  }

  async delete(id: string): Promise<boolean> {
    await ensureDatabaseInitialized()
    const db = getSqliteDb()
    const found = await db.select().from(commentsTable).where(eq(commentsTable.id, id)).limit(1)
    if (found[0]) {
      await db.delete(commentsTable).where(eq(commentsTable.id, id))
      const post = await db.select().from(postsTable).where(eq(postsTable.id, found[0].postId)).limit(1)
      if (post[0]) {
        await db.update(postsTable).set({ comments: Math.max(0, (post[0].comments ?? 1) - 1) }).where(eq(postsTable.id, found[0].postId))
      }
    }
    return true
  }
}
