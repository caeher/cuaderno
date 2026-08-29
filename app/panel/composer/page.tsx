import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/application/users"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { ComposerWorkspace } from "@/components/admin/composer"
import { ShieldAlert } from "lucide-react"

interface ComposerPageProps {
  searchParams: Promise<{ session?: string }>
}

export default async function ComposerPage({ searchParams }: ComposerPageProps) {
  const resolvedParams = await searchParams
  const initialSessionId = resolvedParams.session || null

  const [user, clerkAuth] = await Promise.all([
    getCurrentUser().catch(() => null),
    auth().catch(() => null),
  ])

  if (!user || !clerkAuth?.userId) {
    redirect("/sign-in")
  }

  // Determine active tenant (Organization or personal author blog)
  const orgId = clerkAuth.orgId
  const orgRole = clerkAuth.orgRole
  const orgSlug = clerkAuth.orgSlug

  // Role validation: restricted to owners and admins
  const isOrgAuthorized =
    !orgId || (orgRole && ["org:admin", "admin", "owner"].includes(orgRole))
  const isUserAuthorized = user.role === "owner" || user.role === "admin"

  if (!isOrgAuthorized || !isUserAuthorized) {
    return (
      <div className="flex flex-1 flex-col">
        <AdminTopbar title="Composer" />
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <ShieldAlert className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Acceso restringido a Composer</h2>
          <p className="max-w-md text-xs text-muted-foreground mt-1">
            Solo los propietarios y administradores de la organización tienen permisos para utilizar el asistente de investigación y redacción con IA.
          </p>
        </div>
      </div>
    )
  }

  const tenantDisplayName = orgSlug || user.name || user.username || "Mi Blog"

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      <AdminTopbar title="Composer" />
      <ComposerWorkspace
        tenantName={tenantDisplayName}
        initialSessionId={initialSessionId}
      />
    </div>
  )
}
