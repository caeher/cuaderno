import type { Doc } from "../_generated/dataModel"
import type { QueryCtx } from "../_generated/server"
import type { AuthenticatedTenantIdentity } from "./auth"
import { findDocById } from "./helpers"

type PostReadContext = Pick<QueryCtx, "db">

/** Resuelve la propiedad canónica del post; no confía en IDs enviados por el cliente. */
export async function canReadEditorialPost(
  ctx: PostReadContext,
  identity: AuthenticatedTenantIdentity,
  post: Doc<"posts">
): Promise<boolean> {
  if (post.tenantId) return post.tenantId === identity.tenantId
  if (post.organizationId) return post.organizationId === identity.tenantId
  if (identity.tenantType !== "user") return false

  if (post.authorId === identity.userId) return true
  const author = post.authorDocId
    ? await ctx.db.get(post.authorDocId)
    : await findDocById(ctx.db, "users", post.authorId)
  return author?.clerkUserId === identity.userId
}

export async function assertCanReadEditorialPost(
  ctx: PostReadContext,
  identity: AuthenticatedTenantIdentity,
  post: Doc<"posts">
): Promise<void> {
  if (!(await canReadEditorialPost(ctx, identity, post))) {
    throw new Error("Acceso denegado: no puedes consultar esta publicación.")
  }
}
