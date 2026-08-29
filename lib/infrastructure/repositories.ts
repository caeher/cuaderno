/**
 * Infrastructure Layer — Repository Singletons
 *
 * Backend de datos: Convex (https://convex.dev)
 * Todas las operaciones de dominio delegan directamente a ConvexRepository
 * mediante fetchQuery y fetchMutation de convex/nextjs.
 */

import type {
  CategoryRepository,
  CommentRepository,
  ComposerRepository,
  NarrationRepository,
  PostRepository,
  TagRepository,
  TemplateRepository,
  UserRepository,
} from "@/lib/domain/repositories"
import {
  ConvexCategoryRepository,
  ConvexCommentRepository,
  ConvexComposerRepository,
  ConvexNarrationRepository,
  ConvexPostRepository,
  ConvexTagRepository,
  ConvexTemplateRepository,
  ConvexUserRepository,
} from "./convex/repositories"

export interface Repositories {
  userRepository: UserRepository
  categoryRepository: CategoryRepository
  postRepository: PostRepository
  tagRepository: TagRepository
  commentRepository: CommentRepository
  templateRepository: TemplateRepository
  narrationRepository: NarrationRepository
  composerRepository: ComposerRepository
}

export function createRepositories(): Repositories {
  return {
    userRepository: new ConvexUserRepository(),
    categoryRepository: new ConvexCategoryRepository(),
    postRepository: new ConvexPostRepository(),
    tagRepository: new ConvexTagRepository(),
    commentRepository: new ConvexCommentRepository(),
    templateRepository: new ConvexTemplateRepository(),
    narrationRepository: new ConvexNarrationRepository(),
    composerRepository: new ConvexComposerRepository(),
  }
}

const instances = createRepositories()

export const userRepository: UserRepository = instances.userRepository
export const categoryRepository: CategoryRepository = instances.categoryRepository
export const postRepository: PostRepository = instances.postRepository
export const tagRepository: TagRepository = instances.tagRepository
export const commentRepository: CommentRepository = instances.commentRepository
export const templateRepository: TemplateRepository = instances.templateRepository
export const narrationRepository: NarrationRepository = instances.narrationRepository
export const composerRepository: ComposerRepository = instances.composerRepository

