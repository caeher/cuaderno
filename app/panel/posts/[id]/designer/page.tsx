import { redirect } from "next/navigation"

/**
 * @deprecated Post-level designer is deprecated.
 * Blog design is now managed globally per tenant at /panel/disenador.
 */
export default async function PostDesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/panel/posts/${id}`)
}
