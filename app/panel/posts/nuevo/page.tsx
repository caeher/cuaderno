import { PostEditor } from "@/components/admin/post-editor"
import { getAllCategories, getAllTags } from "@/lib/application/blog-use-cases"

export default async function NewPostPage() {
  const [tags, categories] = await Promise.all([getAllTags(), getAllCategories()])
  return <PostEditor mode="create" allTags={tags} allCategories={categories} />
}

