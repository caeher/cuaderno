"use server"

import { revalidatePath } from "next/cache"
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  requireCurrentUser,
  updateCategory,
  updateTag,
} from "@/lib/application"
import { slugify } from "./utils"

export async function saveCategoryAction(data: {
  id?: string
  organizationId?: string
  name: string
  slug?: string
  description?: string
  color?: string
  icon?: string
}) {
  const user = await requireCurrentUser()
  const authorId = user.clerkUserId ?? user.legacyId ?? user.id
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name) || `cat-${Date.now()}`

  if (data.id) {
    const updated = await updateCategory(data.id, {
      name: data.name,
      slug: generatedSlug,
      description: data.description,
      color: data.color || "#3b82f6",
      icon: data.icon,
    })
    revalidatePath("/panel/taxonomias")
    revalidatePath("/panel/posts")
    revalidatePath("/panel/posts/nuevo")
    revalidatePath("/explorar")
    return { success: true, category: updated }
  } else {
    const newCat = await createCategory({
      organizationId: data.organizationId,
      authorId,
      name: data.name,
      slug: generatedSlug,
      description: data.description,
      color: data.color || "#3b82f6",
      icon: data.icon,
    })
    revalidatePath("/panel/taxonomias")
    revalidatePath("/panel/posts")
    revalidatePath("/panel/posts/nuevo")
    revalidatePath("/explorar")
    return { success: true, category: newCat }
  }
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id)
  revalidatePath("/panel/taxonomias")
  revalidatePath("/panel/posts")
  revalidatePath("/explorar")
  return { success: true }
}

export async function saveTagAction(data: {
  id?: string
  organizationId?: string
  name: string
  slug?: string
  color?: string
}) {
  const user = await requireCurrentUser()
  const authorId = user.clerkUserId ?? user.legacyId ?? user.id
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name) || `tag-${Date.now()}`

  if (data.id) {
    const updated = await updateTag(data.id, {
      name: data.name,
      slug: generatedSlug,
      color: data.color || "#64748b",
    })
    revalidatePath("/panel/taxonomias")
    revalidatePath("/panel/posts")
    revalidatePath("/explorar")
    return { success: true, tag: updated }
  } else {
    const newTag = await createTag({
      organizationId: data.organizationId,
      authorId,
      name: data.name,
      slug: generatedSlug,
      color: data.color || "#64748b",
    })
    revalidatePath("/panel/taxonomias")
    revalidatePath("/panel/posts")
    revalidatePath("/explorar")
    return { success: true, tag: newTag }
  }
}

export async function deleteTagAction(id: string) {
  await deleteTag(id)
  revalidatePath("/panel/taxonomias")
  revalidatePath("/panel/posts")
  revalidatePath("/explorar")
  return { success: true }
}

export async function quickCreateCategoryAction(name: string, organizationId?: string, color: string = "#3b82f6") {
  const user = await requireCurrentUser()
  const authorId = user.clerkUserId ?? user.legacyId ?? user.id
  const slug = slugify(name) || `cat-${Date.now()}`
  const cat = await createCategory({
    organizationId,
    authorId,
    name,
    slug,
    color,
  })
  revalidatePath("/panel/taxonomias")
  revalidatePath("/panel/posts")
  revalidatePath("/panel/posts/nuevo")
  return { success: true, category: cat }
}

export async function quickCreateTagAction(name: string, organizationId?: string, color: string = "#64748b") {
  const user = await requireCurrentUser()
  const authorId = user.clerkUserId ?? user.legacyId ?? user.id
  const cleanName = name.replace(/^#/, "").trim()
  const slug = slugify(cleanName) || `tag-${Date.now()}`
  const tag = await createTag({
    organizationId,
    authorId,
    name: cleanName,
    slug,
    color,
  })
  revalidatePath("/panel/taxonomias")
  revalidatePath("/panel/posts")
  revalidatePath("/panel/posts/nuevo")
  return { success: true, tag }
}
