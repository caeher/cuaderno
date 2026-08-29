import { notFound } from "next/navigation"
import { PostEditor } from "@/components/admin/post-editor"
import { getAllCategories, getAllTags, getPostForEditing } from "@/lib/application/blog-use-cases"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, tags, categories] = await Promise.all([
    getPostForEditing(id),
    getAllTags(),
    getAllCategories(),
  ])

  if (!post) notFound()

  return <PostEditor mode="edit" initialPost={post} allTags={tags} allCategories={categories} />
}

