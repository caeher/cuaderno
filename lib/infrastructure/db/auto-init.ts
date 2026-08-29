import { MOCK_CATEGORIES, MOCK_COMMENTS, MOCK_POSTS, MOCK_TAGS, MOCK_USERS } from "@/lib/infrastructure/mock-db"
import { getSqliteClient, getSqliteDb, isPostgresDatabase } from "./client"
import { categoriesTable, commentsTable, postsTable, tagsTable, usersTable } from "./schema/sqlite"

let sqliteInitialized = false

export async function ensureDatabaseInitialized(): Promise<void> {
  if (isPostgresDatabase()) {
    // PostgreSQL usually manages its schema via drizzle migrations or db:push
    return
  }

  if (sqliteInitialized) {
    return
  }

  const client = getSqliteClient()
  const db = getSqliteDb()

  try {
    // 1. Create SQLite tables if they do not exist
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatar_url TEXT NOT NULL DEFAULT '',
        cover_url TEXT NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        tagline TEXT NOT NULL DEFAULT '',
        location TEXT,
        socials TEXT NOT NULL DEFAULT '{}',
        role TEXT NOT NULL DEFAULT 'owner',
        joined_at TEXT NOT NULL,
        post_count INTEGER NOT NULL DEFAULT 0,
        follower_count INTEGER NOT NULL DEFAULT 0,
        timezone TEXT NOT NULL DEFAULT 'UTC',
        subdomain_enabled INTEGER NOT NULL DEFAULT 1,
        custom_domain TEXT,
        legal_settings TEXT NOT NULL DEFAULT '{}',
        seo_settings TEXT NOT NULL DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        author_id TEXT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL DEFAULT '#3b82f6',
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        author_id TEXT,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#64748b'
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id TEXT,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        cover_url TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft',
        published_at TEXT,
        updated_at TEXT NOT NULL,
        reading_time_minutes INTEGER NOT NULL DEFAULT 1,
        views INTEGER NOT NULL DEFAULT 0,
        likes INTEGER NOT NULL DEFAULT 0,
        comments INTEGER NOT NULL DEFAULT 0,
        featured INTEGER NOT NULL DEFAULT 0,
        design_data TEXT,
        editor_mode TEXT NOT NULL DEFAULT 'notion'
      );

      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_name TEXT NOT NULL,
        author_avatar_url TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `)

    // Safe migration: Add missing columns if tables already existed previously
    try {
      await client.execute("ALTER TABLE posts ADD COLUMN design_data TEXT")
    } catch {}
    try {
      await client.execute("ALTER TABLE posts ADD COLUMN editor_mode TEXT NOT NULL DEFAULT 'notion'")
    } catch {}
    try {
      await client.execute("ALTER TABLE posts ADD COLUMN organization_id TEXT")
    } catch {}
    try {
      await client.execute("ALTER TABLE posts ADD COLUMN category_id TEXT")
    } catch {}
    try {
      await client.execute("ALTER TABLE tags ADD COLUMN organization_id TEXT")
    } catch {}
    try {
      await client.execute("ALTER TABLE tags ADD COLUMN author_id TEXT")
    } catch {}
    try {
      await client.execute("ALTER TABLE tags ADD COLUMN color TEXT DEFAULT '#64748b'")
    } catch {}
    try {
      await client.execute("ALTER TABLE users ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC'")
    } catch {}
    try {
      await client.execute("ALTER TABLE users ADD COLUMN subdomain_enabled INTEGER NOT NULL DEFAULT 1")
    } catch {}
    try {
      await client.execute("ALTER TABLE users ADD COLUMN custom_domain TEXT")
    } catch {}
    try {
      await client.execute("ALTER TABLE users ADD COLUMN legal_settings TEXT NOT NULL DEFAULT '{}'")
    } catch {}
    try {
      await client.execute("ALTER TABLE users ADD COLUMN seo_settings TEXT NOT NULL DEFAULT '{}'")
    } catch {}

    // 2. Check if categories table is empty and seed
    const checkCategories = await client.execute("SELECT COUNT(*) as count FROM categories")
    const catCount = Number(checkCategories.rows[0]?.count ?? 0)
    if (catCount === 0) {
      for (const cat of MOCK_CATEGORIES) {
        await db.insert(categoriesTable).values({
          id: cat.id,
          organizationId: cat.organizationId ?? null,
          authorId: cat.authorId ?? null,
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? null,
          color: cat.color ?? "#3b82f6",
          icon: cat.icon ?? null,
        }).onConflictDoNothing()
      }
    }

    // 3. Check if users table is empty
    const checkResult = await client.execute("SELECT COUNT(*) as count FROM users")
    const userCount = Number(checkResult.rows[0]?.count ?? 0)

    if (userCount === 0) {
      console.log("🌱 [Database] Seeding initial data into SQLite (.data/blog.db)...")

      // Seed Users
      for (const user of MOCK_USERS) {
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
        }).onConflictDoNothing()
      }

      // Seed Tags
      for (const tag of MOCK_TAGS) {
        await db.insert(tagsTable).values({
          id: tag.id,
          organizationId: tag.organizationId ?? null,
          authorId: tag.authorId ?? null,
          slug: tag.slug,
          name: tag.name,
          color: tag.color ?? "#64748b",
        }).onConflictDoNothing()
      }

      // Seed Posts
      for (const post of MOCK_POSTS) {
        await db.insert(postsTable).values({
          id: post.id,
          authorId: post.authorId,
          organizationId: post.organizationId ?? null,
          categoryId: post.categoryId ?? null,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverUrl: post.coverUrl,
          tags: JSON.stringify(post.tags ?? []),
          status: post.status,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          readingTimeMinutes: post.readingTimeMinutes,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          featured: post.featured,
        }).onConflictDoNothing()
      }

      // Seed Comments
      for (const comment of MOCK_COMMENTS) {
        await db.insert(commentsTable).values({
          id: comment.id,
          postId: comment.postId,
          authorName: comment.authorName,
          authorAvatarUrl: comment.authorAvatarUrl,
          content: comment.content,
          createdAt: comment.createdAt,
        }).onConflictDoNothing()
      }

      console.log("✅ [Database] SQLite database initialized and seeded successfully.")
    }

    sqliteInitialized = true
  } catch (error) {
    console.error("❌ [Database] Failed to auto-initialize SQLite:", error)
  }
}

