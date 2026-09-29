import type { QueryCtx } from "@/convex/_generated/server"
import {
  getEditorialByAuthorIdHandler,
  getEditorialByIdHandler,
  getEditorialByOrganizationHandler,
  getPublishedByAuthorIdHandler,
  getPublishedByIdHandler,
  getPublishedBySlugHandler,
  getPublishedByTenantHandler,
  listPublishedHandler
} from "@/convex/posts"
import { getCommentsForPostHandler } from "@/convex/comments"
import { getNarrationForPostHandler } from "@/convex/narrations"

type FixtureTable = "posts" | "users" | "categories" | "comments" | "postNarrations"
type FixtureDoc = Record<string, unknown> & {
  _id: string
  _creationTime: number
}
type IndexBuilder = { eq(field: string, value: unknown): IndexBuilder }

function post(input: {
  id: string
  legacyId?: string
  authorId: string
  authorDocId?: string
  tenantId?: string
  organizationId?: string
  status: "draft" | "published" | "scheduled"
  slug?: string
}): FixtureDoc {
  return {
    _id: input.id,
    _creationTime: 1,
    legacyId: input.legacyId,
    authorId: input.authorId,
    authorDocId: input.authorDocId,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    categoryId: "category-1",
    title: input.id,
    slug: input.slug ?? input.id,
    excerpt: "excerpt",
    content: "body",
    coverUrl: "https://example.test/cover.png",
    tags: ["tag"],
    status: input.status,
    publishedAt: input.status === "published" ? "2026-09-20" : undefined,
    updatedAt: "2026-09-21",
    scheduledFor: input.status === "scheduled" ? "2026-10-01" : undefined,
    readingTimeMinutes: 2,
    views: 3,
    likes: 4,
    comments: 5,
    featured: false,
    designData: "private-editor-data"
  }
}

function user(input: { id: string; legacyId: string; clerkUserId: string; username: string }): FixtureDoc {
  return {
    _id: input.id,
    _creationTime: 1,
    legacyId: input.legacyId,
    clerkUserId: input.clerkUserId,
    tokenIdentifier: `issuer|${input.clerkUserId}`,
    username: input.username,
    name: `Autor ${input.username}`,
    email: `${input.username}-private@example.test`,
    avatarUrl: `https://example.test/${input.username}.png`,
    coverUrl: `https://example.test/${input.username}-cover.png`,
    bio: `Bio ${input.username}`,
    tagline: `Notas de ${input.username}`,
    location: "San Salvador",
    socials: { website: `https://${input.username}.example.test` },
    role: "owner",
    joinedAt: "2026-01-01",
    postCount: 3,
    followerCount: 7,
    subdomainEnabled: true,
    customDomain: `${input.username}.example.test`,
  }
}

function context(
  identity: null | { userId: string; organizationId?: string },
  docs: Record<FixtureTable, FixtureDoc[]>
) {
  const db = {
    query(table: FixtureTable) {
      return {
        withIndex(_index: string, build: (q: IndexBuilder) => IndexBuilder) {
          const filters: Array<[string, unknown]> = []
          const builder: IndexBuilder = {
            eq(field, value) {
              filters.push([field, value])
              return builder
            }
          }
          build(builder)
          const matches = () => docs[table].filter((doc) => filters.every(([field, value]) => doc[field] === value))
          return {
            collect: async () => matches(),
            first: async () => matches()[0] ?? null
          }
        }
      }
    },
    normalizeId(table: FixtureTable, id: string) {
      return docs[table].some((doc) => doc._id === id) ? id : null
    },
    async get(id: string) {
      return (
        Object.values(docs)
          .flat()
          .find((doc) => doc._id === id) ?? null
      )
    }
  }

  return {
    db,
    auth: {
      async getUserIdentity() {
        if (!identity) return null
        return {
          tokenIdentifier: `clerk|${identity.userId}`,
          issuer: "https://clerk.example.test",
          subject: identity.userId,
          ...(identity.organizationId ? { org_id: identity.organizationId } : {})
        }
      }
    },
    storage: {
      async getUrl(id: string) {
        return `https://storage.example.test/${id}`
      }
    }
  } as unknown as QueryCtx
}

const docs: Record<FixtureTable, FixtureDoc[]> = {
  users: [
    user({
      id: "users:author-a",
      legacyId: "legacy-author-a",
      clerkUserId: "user-a",
      username: "a"
    }),
    user({
      id: "users:author-b",
      legacyId: "legacy-author-b",
      clerkUserId: "user-b",
      username: "b"
    }),
    user({
      id: "users:member-a",
      legacyId: "legacy-member-a",
      clerkUserId: "member-a",
      username: "member-a"
    }),
    user({
      id: "users:member-b",
      legacyId: "legacy-member-b",
      clerkUserId: "member-b",
      username: "member-b"
    })
  ],
  posts: [
    post({
      id: "posts:a-draft",
      authorId: "user-a",
      tenantId: "user-a",
      status: "draft",
      slug: "same-slug"
    }),
    post({
      id: "posts:a-scheduled",
      legacyId: "legacy-post-a-scheduled",
      authorId: "legacy-author-a",
      authorDocId: "users:author-a",
      status: "scheduled"
    }),
    post({
      id: "posts:a-published",
      legacyId: "legacy-post-a-published",
      authorId: "legacy-author-a",
      authorDocId: "users:author-a",
      status: "published",
      slug: "same-slug"
    }),
    post({
      id: "posts:b-draft",
      authorId: "user-b",
      tenantId: "user-b",
      status: "draft"
    }),
    post({
      id: "posts:b-published",
      authorId: "user-b",
      tenantId: "user-b",
      status: "published",
      slug: "same-slug"
    }),
    post({
      id: "posts:org-a-draft",
      authorId: "member-a",
      tenantId: "org-a",
      organizationId: "org-a",
      status: "draft"
    }),
    post({
      id: "posts:org-a-scheduled",
      legacyId: "legacy-org-a-scheduled",
      authorId: "member-a",
      organizationId: "org-a",
      status: "scheduled"
    }),
    post({
      id: "posts:org-a-published",
      authorId: "member-a",
      tenantId: "org-a",
      organizationId: "org-a",
      status: "published"
    }),
    post({
      id: "posts:org-b-draft",
      authorId: "member-b",
      tenantId: "org-b",
      organizationId: "org-b",
      status: "draft"
    }),
    post({
      id: "posts:org-b-published",
      authorId: "member-b",
      tenantId: "org-b",
      organizationId: "org-b",
      status: "published"
    })
  ],
  categories: [],
  comments: [
    {
      _id: "comments:a-draft-comment",
      _creationTime: 1,
      postId: "posts:a-draft",
      postDocId: "posts:a-draft",
      authorName: "Lector",
      authorAvatarUrl: "https://example.test/avatar.png",
      authorEmail: "private@example.test",
      content: "Comentario en borrador",
      createdAt: "2026-09-22"
    }
  ],
  postNarrations: [
    {
      _id: "narrations:a-draft",
      _creationTime: 1,
      postId: "posts:a-draft",
      postDocId: "posts:a-draft",
      status: "ready",
      authorId: "user-a",
      tenantId: "user-a",
      transcript: "snapshot privado del borrador",
      contentHash: "hash_test",
      language: "es",
      voice: "sarah",
      duration: 10,
      format: "mp3",
      storageId: "storage:a-draft",
      createdAt: "2026-09-22",
      updatedAt: "2026-09-22"
    }
  ]
}

export async function runPostReadSecurityTests(): Promise<{
  totalPassed: number
  totalFailed: number
}> {
  let totalPassed = 0
  let totalFailed = 0
  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`  ✅ [Post Read Security] PASS: ${message}`)
      totalPassed++
    } else {
      console.error(`  ❌ [Post Read Security] FAIL: ${message}`)
      totalFailed++
    }
  }
  const rejects = async (run: () => Promise<unknown>) => {
    try {
      await run()
      return false
    } catch {
      return true
    }
  }

  console.log("\n▶ [Test] Lecturas públicas directas y aislamiento editorial de posts")
  const anonymous = context(null, docs)
  const anonymousList = await listPublishedHandler(anonymous)
  assert(
    anonymousList.every((item) => item.status === "published"),
    "list anónima solo devuelve publicados"
  )
  assert(
    anonymousList.every((item) => !("tenantId" in item) && !("scheduledFor" in item) && !("designData" in item)),
    "la proyección pública omite tenantId, agenda y datos del editor"
  )
  assert(
    (await getPublishedByIdHandler(anonymous, { id: "posts:a-draft" })) === null,
    "getById anónimo oculta un draft con ID nativo"
  )
  assert(
    (await getPublishedByIdHandler(anonymous, {
      id: "legacy-post-a-scheduled"
    })) === null,
    "getById anónimo oculta un scheduled con ID heredado"
  )
  assert(
    (await getPublishedBySlugHandler(anonymous, { slug: "same-slug" })) !== null,
    "getBySlug anónimo encuentra contenido publicado aunque exista un draft con el mismo slug"
  )
  assert(
    await getPublishedBySlugHandler(anonymous, {
      slug: "same-slug",
      tenantId: "user-a"
    }).then((item) => item?.id === "posts:a-published"),
    "el lookup por slug respeta el tenant entre slugs duplicados"
  )
  assert(
    await getPublishedBySlugHandler(anonymous, {
      slug: "same-slug",
      tenantId: "user-b"
    }).then((item) => item?.id === "posts:b-published"),
    "el lookup por slug devuelve el post del segundo tenant"
  )
  const publicTenantPosts = await getPublishedByTenantHandler(anonymous, { tenantId: "user-a" })
  assert(
    publicTenantPosts.every((item) => item.status === "published" && item.author.username === "a"),
    "el blog del tenant solo recibe publicaciones propias"
  )
  const publicPostKeys = [
    "id", "author", "categoryId", "title", "slug", "excerpt", "content", "coverUrl", "tags",
    "status", "publishedAt", "updatedAt", "readingTimeMinutes", "views", "likes", "comments", "featured",
  ]
  const publicAuthorKeys = [
    "username", "name", "avatarUrl", "coverUrl", "bio", "tagline", "location", "socials",
    "joinedAt", "postCount", "followerCount", "subdomainEnabled", "customDomain",
  ]
  assert(
    publicTenantPosts.every((item) =>
      Object.keys(item).sort().join(",") === [...publicPostKeys].sort().join(",") &&
      Object.keys(item.author).sort().join(",") === [...publicAuthorKeys].sort().join(",")
    ),
    "la respuesta de posts publicados no serializa authorId ni campos privados del autor"
  )

  const anonymousAuthorPosts = await getPublishedByAuthorIdHandler(anonymous, {
    authorId: "user-a"
  })
  assert(
    anonymousAuthorPosts.length === 1 && anonymousAuthorPosts[0]?.status === "published",
    "getByAuthorId nunca mezcla draft ni scheduled, incluso en authorDocId heredado"
  )
  assert(
    anonymousAuthorPosts[0]?.id === "posts:a-published",
    "getByAuthorId resuelve autor por ID nativo, Clerk y legacy"
  )

  assert(
    await rejects(() => getEditorialByIdHandler(anonymous, { id: "posts:a-draft" })),
    "getEditorialById rechaza llamadas anónimas directas"
  )
  assert(
    await rejects(() => getEditorialByAuthorIdHandler(anonymous, { authorId: "user-a" })),
    "getEditorialByAuthorId rechaza llamadas anónimas directas"
  )
  assert(
    await rejects(() => getEditorialByOrganizationHandler(anonymous, { organizationId: "org-a" })),
    "getEditorialByOrganization rechaza llamadas anónimas directas"
  )
  assert(
    (await getCommentsForPostHandler(anonymous, { postId: "posts:a-draft" })).length === 0,
    "la query auxiliar de comentarios no revela comentarios de un draft"
  )
  assert(
    (await getNarrationForPostHandler(anonymous, {
      postId: "posts:a-draft"
    })) === null,
    "la query auxiliar de narración no revela el snapshot de un draft"
  )

  const personalA = context({ userId: "user-a" }, docs)
  const personalAPosts = await getEditorialByAuthorIdHandler(personalA, {
    authorId: "legacy-author-a"
  })
  assert(
    personalAPosts.some((item) => item._id === "posts:a-draft"),
    "el autor personal consulta su draft"
  )
  assert(
    personalAPosts.some((item) => item._id === "posts:a-scheduled"),
    "el autor personal consulta su scheduled heredado"
  )
  assert(
    personalAPosts.every((item) => item.authorId === "user-a" || item.authorId === "legacy-author-a"),
    "la lista editorial personal no agrega posts de otro autor"
  )
  const publishedOnly = await getEditorialByAuthorIdHandler(personalA, {
    authorId: "user-a",
    status: "published"
  })
  assert(
    publishedOnly.length === 1 && publishedOnly[0]?.status === "published",
    "status=published filtra también la rama por authorDocId"
  )
  assert(
    (
      await getEditorialByIdHandler(personalA, {
        id: "legacy-post-a-scheduled"
      })
    )?._id === "posts:a-scheduled",
    "el autor lee un scheduled por ID heredado"
  )
  assert(
    await rejects(() => getEditorialByIdHandler(personalA, { id: "posts:b-draft" })),
    "el autor A no lee el draft de B por ID nativo"
  )
  assert(
    await rejects(() => getEditorialByIdHandler(personalA, { id: "legacy-org-a-scheduled" })),
    "un usuario personal no lee un recurso org heredado por su ID"
  )
  assert(
    await rejects(() => getEditorialByAuthorIdHandler(personalA, { authorId: "legacy-author-b" })),
    "el authorId de B no concede permisos a A"
  )
  const draftComments = await getCommentsForPostHandler(personalA, {
    postId: "posts:a-draft"
  })
  assert(
    draftComments.length === 0,
    "la lectura pública no devuelve comentarios de draft ni al propietario"
  )
  const draftNarration = await getNarrationForPostHandler(personalA, {
    postId: "posts:a-draft"
  })
  assert(
    Boolean(
      draftNarration && "transcript" in draftNarration && draftNarration.transcript === "snapshot privado del borrador"
    ),
    "el propietario conserva acceso a su snapshot de narración privada"
  )

  const orgA = context({ userId: "member-a", organizationId: "org-a" }, docs)
  const orgAPosts = await getEditorialByOrganizationHandler(orgA, {
    organizationId: "org-a"
  })
  assert(
    orgAPosts.some((item) => item._id === "posts:org-a-draft"),
    "el miembro de org A consulta sus drafts"
  )
  assert(
    orgAPosts.some((item) => item._id === "posts:org-a-scheduled"),
    "el miembro de org A consulta scheduled heredados por organización"
  )
  assert(
    orgAPosts.every((item) => item.tenantId === "org-a" || item.organizationId === "org-a"),
    "la lista org no incluye recursos de otras organizaciones"
  )
  assert(
    await rejects(() => getEditorialByOrganizationHandler(orgA, { organizationId: "org-b" })),
    "org A no puede elegir org B como argumento"
  )
  assert(
    await rejects(() => getEditorialByIdHandler(orgA, { id: "posts:org-b-draft" })),
    "org A no puede leer el draft de org B por ID"
  )

  const orgB = context({ userId: "member-b", organizationId: "org-b" }, docs)
  const orgBPosts = await getEditorialByOrganizationHandler(orgB, {
    organizationId: "org-b"
  })
  assert(
    orgBPosts.some((item) => item._id === "posts:org-b-draft"),
    "el miembro de org B consulta sus propios drafts"
  )
  assert(
    await rejects(() => getEditorialByIdHandler(orgB, { id: "posts:org-a-draft" })),
    "org B no puede leer el draft de org A"
  )

  console.log(`  📊 Post read security: ${totalPassed} pasaron | ${totalFailed} fallaron`)
  return { totalPassed, totalFailed }
}
