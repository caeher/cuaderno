import { revalidatePath } from "next/cache"
export { slugify } from "@/lib/utils"

export function revalidateAllPostPaths(slug?: string | null) {
  revalidatePath("/panel/posts")
  revalidatePath("/panel/comentarios")
  revalidatePath("/panel/taxonomias")
  revalidatePath("/panel")
  revalidatePath("/")
  revalidatePath("/explorar")
  if (slug) {
    revalidatePath(`/post/${slug}`)
  }
}
