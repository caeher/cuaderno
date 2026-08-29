import { redirect } from "next/navigation"

/**
 * @deprecated Post-level designer is deprecated.
 * Blog design is now managed globally per tenant at /panel/disenador.
 */
export default function NewPostDesignerPage() {
  redirect("/panel/posts/nuevo")
}
