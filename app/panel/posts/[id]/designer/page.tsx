import { notFound } from "next/navigation"
import { getAllCategories, getAllTags, getPostForEditing } from "@/lib/application/blog-use-cases"
import { DesignerStudio } from "@/components/designer/designer-studio"

export default async function PostDesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, tags, categories] = await Promise.all([
    getPostForEditing(id),
    getAllTags(),
    getAllCategories(),
  ])

  if (!post) notFound()

  return <DesignerStudio post={post} allTags={tags} allCategories={categories} />
}

