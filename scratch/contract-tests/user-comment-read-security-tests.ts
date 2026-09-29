import type { QueryCtx } from "@/convex/_generated/server"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { AuthorBioCard } from "@/components/site/authors/author-bio-card"
import { CommentItem } from "@/components/site/comments/comment-item"
import { PostCard } from "@/components/site/posts/post-card"
import type { PublishedPost } from "@/lib/domain/entities"
import {
  getCurrentHandler,
  getPrivateByIdHandler,
  getPublicByUsernameHandler,
  getPublicLegalSettingsByUsernameHandler,
  getPublicSeoSettingsByUsernameHandler,
  listPublicHandler,
} from "@/convex/users"
import {
  getCommentsForPostHandler,
  getEditorialCommentsForPostHandler,
} from "@/convex/comments"

type FixtureTable = "users" | "posts" | "comments"
type FixtureDoc = Record<string, any> & { _id: string; _creationTime: number }
type IndexBuilder = { eq(field: string, value: unknown): IndexBuilder }

function fixtureUser(input: {
  id: string
  clerkUserId: string
  tokenIdentifier: string
  username: string
  email: string
  legacyId?: string
}) : FixtureDoc {
  return {
    _id: input.id,
    _creationTime: 1,
    legacyId: input.legacyId ?? `legacy-${input.username}-internal`,
    clerkUserId: input.clerkUserId,
    tokenIdentifier: input.tokenIdentifier,
    username: input.username,
    name: `Autor ${input.username}`,
    email: input.email,
    avatarUrl: `https://example.test/${input.username}.png`,
    coverUrl: `https://example.test/${input.username}-cover.png`,
    bio: `Biografía pública ${input.username}`,
    tagline: `Notas de ${input.username}`,
    location: "San Salvador",
    socials: { website: `https://${input.username}.example.test` },
    role: "owner",
    joinedAt: "2026-01-01",
    postCount: 2,
    followerCount: 9,
    timezone: "America/El_Salvador",
    subdomainEnabled: true,
    customDomain: `${input.username}.example.test`,
    legalSettings: {
      companyName: `Empresa ${input.username}`,
      contactEmail: `legal-${input.username}@example.test`,
      taxId: `TAX-${input.username}`,
      address: `Dirección publicada ${input.username}`,
      jurisdiction: "El Salvador",
      dpoContact: `dpo-${input.username}@example.test`,
      customLegalNotice: `Aviso legal ${input.username}`,
      customPrivacyPolicy: `Privacidad ${input.username}`,
      customTerms: `Términos ${input.username}`,
      customCookiePolicy: `Cookies ${input.username}`,
    },
    seoSettings: {
      metaTitle: `Título público ${input.username}`,
      metaDescription: `Descripción pública ${input.username}`,
      keywords: ["editorial", input.username],
      geoCountry: "El Salvador",
      geoRegion: "San Salvador",
      geoCity: "San Salvador",
      geoCoordinates: "13.69,-89.19",
      socialSharingImage: `https://example.test/${input.username}-social.png`,
      allowAiCrawlers: true,
      enableLlmsTxt: true,
      canonicalDomain: `https://${input.username}.internal.example.test`,
    },
  }
}

function makeContext(
  userId: string | null,
  users: FixtureDoc[],
  posts: FixtureDoc[],
  comments: FixtureDoc[]
) {
  const records: Record<FixtureTable, FixtureDoc[]> = { users, posts, comments }
  const db = {
    query(table: FixtureTable) {
      return {
        collect: async () => records[table],
        withIndex(_index: string, build: (q: IndexBuilder) => IndexBuilder) {
          const filters: Array<[string, unknown]> = []
          const builder: IndexBuilder = {
            eq(field, value) {
              filters.push([field, value])
              return builder
            },
          }
          build(builder)
          const matching = () => records[table].filter((doc) => filters.every(([field, value]) => doc[field] === value))
          return {
            collect: async () => matching(),
            first: async () => matching()[0] ?? null,
          }
        },
      }
    },
    normalizeId(table: FixtureTable, id: string) {
      return records[table].some((doc) => doc._id === id) ? id : null
    },
    async get(id: string) {
      return Object.values(records).flat().find((doc) => doc._id === id) ?? null
    },
  }

  return {
    db,
    auth: {
      async getUserIdentity() {
        if (!userId) return null
        return {
          tokenIdentifier: `issuer|${userId}`,
          issuer: "https://clerk.example.test",
          subject: userId,
        }
      },
    },
  } as unknown as QueryCtx
}

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  return Object.keys(value).sort().join(",") === [...expected].sort().join(",")
}

async function rejects(work: () => Promise<unknown>) {
  try {
    await work()
    return false
  } catch {
    return true
  }
}

export async function runUserCommentReadSecurityTests(): Promise<{
  totalPassed: number
  totalFailed: number
}> {
  let totalPassed = 0
  let totalFailed = 0

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [Public Data Security] PASS: ${message}`)
      totalPassed++
    } else {
      console.error(`  ❌ [Public Data Security] FAIL: ${message}`)
      totalFailed++
    }
  }

  const users = [
    fixtureUser({
      id: "users:author-a-internal-id",
      clerkUserId: "user-a-auth-id",
      tokenIdentifier: "issuer|user-a-auth-id",
      username: "autor-a",
      email: "account-a-private@example.test",
      legacyId: "user-b-auth-id",
    }),
    fixtureUser({
      id: "users:author-b-internal-id",
      clerkUserId: "user-b-auth-id",
      tokenIdentifier: "issuer|user-b-auth-id",
      username: "autor-b",
      email: "account-b-private@example.test",
    }),
  ]
  const posts: FixtureDoc[] = [
    {
      _id: "posts:published-a",
      _creationTime: 2,
      authorId: "user-a-auth-id",
      tenantId: "user-a-auth-id",
      status: "published",
      legacyId: "legacy-post-a",
    },
    {
      _id: "posts:draft-a",
      _creationTime: 3,
      authorId: "user-a-auth-id",
      tenantId: "user-a-auth-id",
      status: "draft",
      legacyId: "legacy-draft-a",
    },
  ]
  const comments: FixtureDoc[] = [
    {
      _id: "comments:private-comment-id",
      _creationTime: 4,
      legacyId: "legacy-comment-id",
      postId: "posts:published-a",
      postDocId: "posts:published-a",
      authorName: "Lector",
      authorAvatarUrl: "https://example.test/reader.png",
      authorEmail: "reader-private@example.test",
      authorUserId: "reader-auth-id",
      content: "Comentario visible",
      createdAt: "2026-09-20T12:00:00.000Z",
    },
    {
      _id: "comments:draft-comment-id",
      _creationTime: 5,
      postId: "posts:draft-a",
      postDocId: "posts:draft-a",
      authorName: "Lector draft",
      authorAvatarUrl: "https://example.test/reader.png",
      authorEmail: "draft-reader-private@example.test",
      authorUserId: "draft-reader-auth-id",
      content: "Comentario de borrador",
      createdAt: "2026-09-21T12:00:00.000Z",
    },
  ]

  const anonymous = makeContext(null, users, posts, comments)
  const owner = makeContext("user-a-auth-id", users, posts, comments)
  const otherTenant = makeContext("user-b-auth-id", users, posts, comments)

  const publicAuthors = await listPublicHandler(anonymous)
  const expectedAuthorKeys = [
    "username", "name", "avatarUrl", "coverUrl", "bio", "tagline", "location", "socials",
    "joinedAt", "postCount", "followerCount", "subdomainEnabled", "customDomain",
  ]
  assert(
    publicAuthors.length === 2 && publicAuthors.every((author) => exactKeys(author, expectedAuthorKeys)),
    "la lista anónima devuelve únicamente las claves permitidas para todos los tenants"
  )

  const publicProfile = await getPublicByUsernameHandler(anonymous, { username: "autor-a" })
  assert(
    publicProfile !== null && exactKeys(publicProfile, expectedAuthorKeys),
    "el perfil por username devuelve exactamente la proyección pública"
  )

  const publicLegal = await getPublicLegalSettingsByUsernameHandler(anonymous, { username: "autor-a" })
  assert(
    publicLegal !== null && exactKeys(publicLegal, [
      "companyName", "contactEmail", "taxId", "address", "jurisdiction", "dpoContact",
      "customLegalNotice", "customPrivacyPolicy", "customTerms", "customCookiePolicy",
    ]),
    "la lectura legal publica solo los campos configurados para documentos legales"
  )

  const publicSeo = await getPublicSeoSettingsByUsernameHandler(anonymous, { username: "autor-a" })
  assert(
    publicSeo !== null && exactKeys(publicSeo, [
      "metaTitle", "metaDescription", "keywords", "geoCountry", "geoRegion", "geoCity",
      "geoCoordinates", "socialSharingImage",
    ]),
    "la metadata pública omite switches y dominios internos de SEO"
  )

  assert(
    await rejects(() => getCurrentHandler(anonymous)),
    "una lectura de perfil privado anónima se rechaza"
  )
  const currentProfile = await getCurrentHandler(owner)
  assert(
    currentProfile?.clerkUserId === "user-a-auth-id",
    "la lectura del perfil actual se limita a la identidad autenticada"
  )
  const ownerProfile = await getPrivateByIdHandler(owner, { id: "users:author-a-internal-id" })
  assert(
    ownerProfile?.email === "account-a-private@example.test" && ownerProfile.tokenIdentifier === "issuer|user-a-auth-id",
    "el propietario autenticado puede leer su perfil privado"
  )
  assert(
    await rejects(() => getPrivateByIdHandler(otherTenant, { id: "users:author-a-internal-id" })),
    "un usuario de otro tenant no puede leer el perfil privado ajeno"
  )

  const publicComments = await getCommentsForPostHandler(anonymous, { postId: "posts:published-a" })
  assert(
    publicComments.length === 1 && exactKeys(publicComments[0]!, ["authorName", "authorAvatarUrl", "content", "createdAt"]),
    "la lectura anónima de comentarios publicados devuelve exactamente claves públicas"
  )
  assert(
    (await getCommentsForPostHandler(owner, { postId: "posts:draft-a" })).length === 0,
    "la lectura pública nunca devuelve comentarios de un borrador, ni al propietario"
  )
  const ownerDraftModeration = await getEditorialCommentsForPostHandler(owner, { postId: "posts:draft-a" })
  assert(
    ownerDraftModeration.length === 1 && ownerDraftModeration[0]?.authorEmail === "draft-reader-private@example.test",
    "la consulta editorial autorizada conserva la moderación de comentarios en borradores"
  )
  const editorialComments = await getEditorialCommentsForPostHandler(owner, { postId: "posts:published-a" })
  assert(
    editorialComments.length === 1 && exactKeys(editorialComments[0]!, [
      "id", "postId", "authorName", "authorAvatarUrl", "authorEmail", "authorUserId", "content", "createdAt",
    ]),
    "el propietario obtiene exactamente las claves de moderación autorizadas"
  )
  assert(
    await rejects(() => getEditorialCommentsForPostHandler(otherTenant, { postId: "posts:published-a" })),
    "otro tenant no puede consultar datos de moderación"
  )
  assert(
    await rejects(() => getEditorialCommentsForPostHandler(anonymous, { postId: "posts:published-a" })),
    "la lectura editorial de comentarios requiere autenticación"
  )

  const publicPagePayload = JSON.stringify({ author: publicProfile, comments: publicComments })
  const publicPost: PublishedPost = {
    id: "posts:public-card-id",
    author: publicProfile!,
    categoryId: null,
    title: "Artículo público",
    slug: "articulo-publico",
    excerpt: "Extracto público",
    content: "Contenido público",
    coverUrl: null,
    tags: [],
    status: "published",
    publishedAt: "2026-09-20",
    updatedAt: "2026-09-20",
    readingTimeMinutes: 2,
    views: 1,
    likes: 0,
    comments: 1,
    featured: false,
  }
  const publicHtml = renderToStaticMarkup(
    createElement(
      "main",
      null,
      createElement(AuthorBioCard, { author: publicProfile! }),
      createElement(PostCard, { post: publicPost, author: publicProfile! }),
      createElement(CommentItem, { comment: publicComments[0]! })
    )
  )
  const privateMarkers = [
    "account-a-private@example.test",
    "account-b-private@example.test",
    "issuer|user-a-auth-id",
    "user-a-auth-id",
    "users:author-a-internal-id",
    "reader-private@example.test",
    "reader-auth-id",
    "comments:private-comment-id",
  ]
  assert(
    privateMarkers.every((marker) => !publicPagePayload.includes(marker) && !publicHtml.includes(marker)),
    "los props serializados y el HTML público de perfil, posts y comentarios omiten emails e identificadores privados de ambos tenants"
  )
  assert(
    publicHtml.includes("Autor autor-a") && publicHtml.includes("Artículo público") && publicHtml.includes("Comentario visible"),
    "el HTML público conserva el autor, el post y el comentario publicados"
  )

  return { totalPassed, totalFailed }
}
