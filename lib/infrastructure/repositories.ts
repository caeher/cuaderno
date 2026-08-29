/**
 * Infrastructure Layer — Repository Singletons
 *
 * Automatically delegates to PostgreSQL repositories if PostgreSQL connection
 * strings are detected in environment variables, or to SQLite repositories
 * (.data/blog.db) with automatic table provisioning and data seeding otherwise.
 */

import type {
  CategoryRepository,
  CommentRepository,
  PostRepository,
  TagRepository,
  TemplateRepository,
  UserRepository,
} from "@/lib/domain/repositories"
import { isPostgresDatabase } from "./db/client"
import {
  PgCategoryRepository,
  PgCommentRepository,
  PgPostRepository,
  PgTagRepository,
  PgTemplateRepository,
  PgUserRepository,
} from "./db/repositories/pg-repositories"
import {
  SqliteCategoryRepository,
  SqliteCommentRepository,
  SqlitePostRepository,
  SqliteTagRepository,
  SqliteTemplateRepository,
  SqliteUserRepository,
} from "./db/repositories/sqlite-repositories"

const isPg = isPostgresDatabase()

export const userRepository: UserRepository = isPg ? new PgUserRepository() : new SqliteUserRepository()
export const categoryRepository: CategoryRepository = isPg ? new PgCategoryRepository() : new SqliteCategoryRepository()
export const postRepository: PostRepository = isPg ? new PgPostRepository() : new SqlitePostRepository()
export const tagRepository: TagRepository = isPg ? new PgTagRepository() : new SqliteTagRepository()
export const commentRepository: CommentRepository = isPg ? new PgCommentRepository() : new SqliteCommentRepository()
export const templateRepository: TemplateRepository = isPg ? new PgTemplateRepository() : new SqliteTemplateRepository()

