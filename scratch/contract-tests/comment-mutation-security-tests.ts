import type { MutationCtx } from "@/convex/_generated/server"
import type { QueryCtx } from "@/convex/_generated/server"
import {
  createCommentHandler,
  getCommentsForPostHandler,
  removeCommentHandler,
  removeOrphanedLegacyInternalHandler,
} from "@/convex/comments"

type FixtureTable = "users" | "posts" | "comments" | "commentRateLimits"
type FixtureDoc = Record<string, unknown> & { _id: string; _creationTime: number }
type IndexBuilder = { eq(field: string, value: unknown): IndexBuilder }
let fixtureIdSequence = 0

function fixturePost(input: {
  id: string
  tenantId: string
  status: "draft" | "scheduled" | "published"
  comments?: number
}): FixtureDoc {
  return {
    _id: input.id,
    _creationTime: 1,
    legacyId: `legacy-${input.id}`,
    authorId: input.tenantId,
    tenantId: input.tenantId,
    status: input.status,
    comments: input.comments ?? 0,
  }
}

function makeContext(userId: string | null, tenantId: string | null, records: Record<FixtureTable, FixtureDoc[]>) {
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
    async insert(table: FixtureTable, value: Record<string, unknown>) {
      fixtureIdSequence++
      const doc = {
        ...value,
        _id: `${table}:generated-${fixtureIdSequence}`,
        _creationTime: fixtureIdSequence,
      } as FixtureDoc
      records[table].push(doc)
      return doc._id
    },
    async patch(id: string, value: Record<string, unknown>) {
      const doc = Object.values(records).flat().find((item) => item._id === id)
      if (!doc) throw new Error(`Fixture document not found: ${id}`)
      Object.assign(doc, value)
    },
    async delete(id: string) {
      for (const table of Object.keys(records) as FixtureTable[]) {
        records[table] = records[table].filter((doc) => doc._id !== id)
      }
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
          name: `Usuario ${userId}`,
          email: `${userId}@example.test`,
          pictureUrl: `https://images.example.test/${userId}.png`,
          ...(tenantId ? { org_id: tenantId } : {}),
        }
      },
    },
  } as unknown as MutationCtx & QueryCtx
}

async function rejectedWith(work: () => Promise<unknown>, expected: string) {
  try {
    await work()
    return false
  } catch (error) {
    return error instanceof Error && error.message.includes(expected)
  }
}

export async function runCommentMutationSecurityTests(): Promise<{
  totalPassed: number
  totalFailed: number
}> {
  let totalPassed = 0
  let totalFailed = 0

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [Comment Mutation Security] PASS: ${message}`)
      totalPassed++
    } else {
      console.error(`  ❌ [Comment Mutation Security] FAIL: ${message}`)
      totalFailed++
    }
  }

  const records: Record<FixtureTable, FixtureDoc[]> = {
    users: [],
    posts: [
      fixturePost({ id: "posts:published-a", tenantId: "tenant-a", status: "published" }),
      fixturePost({ id: "posts:draft-a", tenantId: "tenant-a", status: "draft" }),
      fixturePost({ id: "posts:scheduled-a", tenantId: "tenant-a", status: "scheduled" }),
      fixturePost({ id: "posts:published-b", tenantId: "tenant-b", status: "published" }),
      fixturePost({ id: "posts:race-a", tenantId: "tenant-a", status: "published" }),
    ],
    comments: [
      {
        _id: "comments:legacy-orphan",
        _creationTime: 2,
        postId: "deleted-legacy-post",
        authorName: "Lector legacy",
        content: "Comentario antiguo huérfano",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        _id: "comments:tenant-orphan",
        _creationTime: 3,
        postId: "deleted-post-a",
        tenantId: "tenant-a",
        authorName: "Lector",
        content: "Comentario huérfano con tenant",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ],
    commentRateLimits: [],
  }
  const ownerA = makeContext("user-a", "tenant-a", records)
  const memberA = makeContext("user-race", "tenant-a", records)
  const ownerB = makeContext("user-b", "tenant-b", records)
  const anonymous = makeContext(null, null, records)

  const originalNow = Date.now
  Date.now = () => 1_800_000_000_000
  try {
    const spoofedAuthenticatedInput = {
      postId: "posts:published-a",
      authorName: "Alias permitido",
      content: "  Un comentario válido.  ",
      authorAvatarUrl: "https://spoof.example.test/avatar.png",
      authorUserId: "user-b",
      authorEmail: "user-b@example.test",
      createdAt: "2000-01-01T00:00:00.000Z",
    } as Parameters<typeof createCommentHandler>[1] & Record<string, unknown>
    const publicComment = await createCommentHandler(ownerA, spoofedAuthenticatedInput)
    const stored = records.comments.find((comment) => comment.content === "Un comentario válido.")!
    assert(
      stored.authorUserId === "user-a" &&
        stored.authorEmail === "user-a@example.test" &&
        stored.authorAvatarUrl === "https://images.example.test/user-a.png" &&
        stored.createdAt !== "2000-01-01T00:00:00.000Z" &&
        stored.postDocId === "posts:published-a" &&
        stored.tenantId === "tenant-a",
      "la identidad, avatar, fecha, tenant y post se derivan de datos confiables"
    )
    assert(
      Object.keys(publicComment).sort().join(",") === "authorAvatarUrl,authorName,content,createdAt" &&
        !JSON.stringify(publicComment).includes("user-a@example.test"),
      "la respuesta de creación devuelve únicamente la proyección pública"
    )
    assert(records.posts.find((post) => post._id === "posts:published-a")?.comments === 1, "crear incrementa el contador una vez")

    const countBeforeInvalidPosts = records.comments.length
    const counterBeforeInvalidPosts = records.posts.find((post) => post._id === "posts:draft-a")?.comments
    assert(
      await rejectedWith(
        () => createCommentHandler(anonymous, { postId: "posts:missing", authorName: "Anónimo", content: "No" }),
        "No se encontró la publicación"
      ) &&
        await rejectedWith(
          () => createCommentHandler(anonymous, { postId: "posts:draft-a", authorName: "Anónimo", content: "No" }),
          "publicaciones publicadas"
        ) &&
        await rejectedWith(
          () => createCommentHandler(anonymous, { postId: "posts:scheduled-a", authorName: "Anónimo", content: "No" }),
          "publicaciones publicadas"
        ) &&
        records.comments.length === countBeforeInvalidPosts &&
        records.posts.find((post) => post._id === "posts:draft-a")?.comments === counterBeforeInvalidPosts,
      "un post ausente, draft o scheduled no genera comentarios ni cambia contadores"
    )

    const invalidInputCases = [
      { postId: "posts:published-a", authorName: "Lector", content: "   " },
      { postId: "posts:published-a", authorName: "Lector", content: "x".repeat(5_001) },
      { postId: "posts:published-a", authorName: "n".repeat(81), content: "Texto" },
      { postId: "posts:published-a", authorName: "Lector", content: "Texto", authorAvatarUrl: "javascript:alert(1)" },
      { postId: "posts:published-a", authorName: "Lector", content: "Texto", authorAvatarUrl: `https://${"a".repeat(510)}.test` },
    ]
    const countBeforeInvalidInput = records.comments.length
    const rejectedInputs = await Promise.all(
      invalidInputCases.map((args) => rejectedWith(() => createCommentHandler(anonymous, args), ""))
    )
    assert(rejectedInputs.every(Boolean) && records.comments.length === countBeforeInvalidInput, "rechaza texto vacío, excesivo y perfiles no válidos")

    const spoofedAnonymousInput = {
      postId: "posts:published-b",
      authorName: "Lector anónimo",
      content: "Comentario anónimo",
      authorUserId: "user-a",
      authorEmail: "spoof@example.test",
      createdAt: "2001-01-01T00:00:00.000Z",
    } as Parameters<typeof createCommentHandler>[1] & Record<string, unknown>
    const anonComment = await createCommentHandler(anonymous, spoofedAnonymousInput)
    const storedAnon = records.comments.find((comment) => comment.content === "Comentario anónimo")!
    assert(
      !storedAnon.authorUserId && !storedAnon.authorEmail && storedAnon.tenantId === "tenant-b" &&
        anonComment.authorName === "Lector anónimo",
      "el formulario anónimo se conserva sin aceptar una identidad suplantada"
    )

    const anonymousCreates = []
    for (let index = 0; index < 7; index++) {
      anonymousCreates.push(
        await createCommentHandler(anonymous, {
          postId: "posts:published-b",
          authorName: "Lector anónimo",
          content: `Límite anónimo ${index}`,
        })
      )
    }
    assert(anonymousCreates.length === 7, "las llamadas anónimas directas comparten un límite por tenant")
    assert(
      await rejectedWith(
        () => createCommentHandler(anonymous, { postId: "posts:published-b", authorName: "Lector", content: "Exceso" }),
        "límite de comentarios"
      ),
      "el servidor rechaza comentarios anónimos por encima del límite"
    )

    const tenantBComment = records.comments.find((comment) => comment.content === "Comentario anónimo")!
    const countTenantBBeforeDelete = Number(
      records.posts.find((post) => post._id === "posts:published-b")?.comments ?? 0
    )
    assert(
      await rejectedWith(() => removeCommentHandler(ownerA, { id: tenantBComment._id }), "Acceso denegado") &&
        records.posts.find((post) => post._id === "posts:published-b")?.comments === countTenantBBeforeDelete,
      "un tenant distinto no puede borrar el comentario ni alterar su contador"
    )
    assert(
      await rejectedWith(() => removeCommentHandler(anonymous, { id: tenantBComment._id }), "No autenticado"),
      "un usuario anónimo no puede borrar comentarios"
    )
    await removeCommentHandler(ownerB, { id: tenantBComment._id })
    const tenantBCountAfterDelete = records.posts.find((post) => post._id === "posts:published-b")?.comments
    await removeCommentHandler(ownerB, { id: tenantBComment._id })
    assert(
      tenantBCountAfterDelete === countTenantBBeforeDelete - 1 &&
        records.posts.find((post) => post._id === "posts:published-b")?.comments === tenantBCountAfterDelete,
      "el moderador autorizado borra una vez y un borrado repetido no descuenta de nuevo"
    )

    const tenantOrphan = records.comments.find((comment) => comment._id === "comments:tenant-orphan")!
    assert(
      await rejectedWith(() => removeCommentHandler(ownerB, { id: tenantOrphan._id }), "Acceso denegado") &&
        await rejectedWith(() => removeCommentHandler(anonymous, { id: tenantOrphan._id }), "No autenticado"),
      "ni anónimos ni otro tenant pueden borrar un comentario huérfano con tenant canónico"
    )
    await removeCommentHandler(ownerA, { id: tenantOrphan._id })
    const legacyOrphan = records.comments.find((comment) => comment._id === "comments:legacy-orphan")!
    assert(
      await rejectedWith(() => removeCommentHandler(ownerA, { id: legacyOrphan._id }), "repararse mediante la operación interna"),
      "los comentarios huérfanos legacy sin propiedad demostrable no admiten borrado público"
    )
    await removeOrphanedLegacyInternalHandler(ownerA, { id: legacyOrphan._id })
    assert(!records.comments.some((comment) => comment._id === legacyOrphan._id), "la reparación interna elimina el huérfano legacy")

    const safePublicComments = await getCommentsForPostHandler(anonymous, { postId: "posts:published-a" })
    assert(
      safePublicComments.every((comment) =>
        Object.keys(comment).sort().join(",") === "authorAvatarUrl,authorName,content,createdAt"
      ) && !JSON.stringify(safePublicComments).includes("user-a@example.test"),
      "la lectura pública omite email e identificadores de usuario"
    )

    let transactionTail = Promise.resolve()
    const runSerialized = async <T>(work: () => Promise<T>): Promise<T> => {
      const previous = transactionTail
      let release = () => {}
      transactionTail = new Promise<void>((resolve) => {
        release = resolve
      })
      await previous
      try {
        return await work()
      } finally {
        release()
      }
    }
    await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        runSerialized(() =>
          createCommentHandler(memberA, {
            postId: "posts:race-a",
            authorName: "Lector concurrente",
            content: `Comentario concurrente ${index}`,
          })
        ).catch((error) => error)
      )
    )
    assert(
      records.comments.filter((comment) => comment.postId === "legacy-posts:race-a").length === 5 &&
        records.posts.find((post) => post._id === "posts:race-a")?.comments === 5,
      "creaciones concurrentes conservan el contador y respetan el límite en la transacción"
    )
  } finally {
    Date.now = originalNow
  }

  return { totalPassed, totalFailed }
}
