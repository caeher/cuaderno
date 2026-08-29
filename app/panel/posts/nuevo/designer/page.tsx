import { getAllCategories, getAllTags } from "@/lib/application/blog-use-cases"
import { DesignerStudio } from "@/components/designer/designer-studio"

export default async function NewPostDesignerPage() {
  const [tags, categories] = await Promise.all([getAllTags(), getAllCategories()])
  return <DesignerStudio post={null} allTags={tags} allCategories={categories} />
}

