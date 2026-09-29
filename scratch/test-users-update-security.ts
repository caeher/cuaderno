import assert from "node:assert/strict"
import type { MutationCtx } from "../convex/_generated/server"
import { syncFromClerkHandler, updateUserHandler } from "../convex/users"

type Profile = {
  _id: string
  _creationTime: number
  legacyId?: string
  clerkUserId?: string
  publicTenantId?: string
  tokenIdentifier?: string
  username: string
  name: string
  email: string
  avatarUrl: string
  coverUrl: string
  bio: string
  tagline: string
  location?: string
  socials: Record<string, string>
  role: "owner" | "admin"
  joinedAt: string
  postCount: number
  followerCount: number
  timezone?: string
  subdomainEnabled?: boolean
  customDomain?: string
  legalSettings?: Record<string, string>
  seoSettings?: Record<string, unknown>
}

type ClerkIdentity = {
  subject: string
  tokenIdentifier: string
  preferredUsername?: string
  org_id?: string
  org_role?: string
}

class FakeDatabase {
  readonly profiles = new Map<string, Profile>()
  patchCount = 0
  insertCount = 0

  constructor(profiles: Profile[]) {
    for (const profile of profiles) this.profiles.set(profile._id, structuredClone(profile))
  }

  normalizeId(_table: string, id: string) {
    return this.profiles.has(id) ? id : null
  }

  async get(id: string) {
    const profile = this.profiles.get(id)
    return profile ? structuredClone(profile) : null
  }

  async patch(id: string, fields: Record<string, unknown>) {
    const profile = this.profiles.get(id)
    if (!profile) throw new Error(`Missing fake profile ${id}`)
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined) delete (profile as unknown as Record<string, unknown>)[field]
      else (profile as unknown as Record<string, unknown>)[field] = value
    }
    this.patchCount += 1
  }

  async insert(_table: string, document: Omit<Profile, "_id" | "_creationTime">) {
    const id = `profile_${this.profiles.size + 1}`
    this.profiles.set(id, { ...structuredClone(document), _id: id, _creationTime: Date.now() })
    this.insertCount += 1
    return id
  }

  query(_table: string) {
    const database = this
    return {
      withIndex(_index: string, buildRange: (query: { eq: (field: string, value: unknown) => unknown }) => unknown) {
        let field = ""
        let value: unknown
        const query = {
          eq(nextField: string, nextValue: unknown) {
            field = nextField
            value = nextValue
            return query
          },
        }
        buildRange(query)
        const matches = () =>
          [...database.profiles.values()].filter(
            (profile) => (profile as unknown as Record<string, unknown>)[field] === value
          )
        return {
          first: async () => {
            const match = matches()[0]
            return match ? structuredClone(match) : null
          },
          collect: async () => structuredClone(matches()),
          take: async (count: number) => structuredClone(matches().slice(0, count)),
        }
      },
    }
  }
}

function profile(
  id: string,
  clerkUserId: string | undefined,
  username: string,
  tokenIdentifier?: string,
  legacyId?: string
): Profile {
  return {
    _id: id,
    _creationTime: 1,
    ...(legacyId ? { legacyId } : {}),
    ...(clerkUserId ? { clerkUserId } : {}),
    ...(tokenIdentifier ? { tokenIdentifier } : {}),
    username,
    name: `Nombre ${username}`,
    email: `${username}@example.com`,
    avatarUrl: "/avatar.png",
    coverUrl: "/cover.png",
    bio: "Bio inicial",
    tagline: "Lema inicial",
    socials: {},
    role: "owner",
    joinedAt: "2026-09-29",
    postCount: 0,
    followerCount: 0,
    timezone: "UTC",
    subdomainEnabled: true,
    customDomain: "blog.example.com",
    legalSettings: { companyName: "Compañía inicial", taxId: "TAX-1" },
  }
}

function identity(
  subject: string,
  options: { organization?: string; role?: string; username?: string } = {}
): ClerkIdentity {
  return {
    subject,
    tokenIdentifier: `https://clerk.example|${subject}`,
    ...(options.organization ? { org_id: options.organization } : {}),
    ...(options.role ? { org_role: options.role } : {}),
    ...(options.username ? { preferredUsername: options.username } : {}),
  }
}

function context(database: FakeDatabase, clerkIdentity: ClerkIdentity | null) {
  return {
    auth: { getUserIdentity: async () => clerkIdentity },
    db: database,
  } as unknown as MutationCtx
}

async function expectDeniedWithoutWrites(
  database: FakeDatabase,
  caller: ClerkIdentity | null,
  args: Parameters<typeof updateUserHandler>[1],
  expectedError = /Acceso denegado|No autenticado/
) {
  const before = structuredClone([...database.profiles.entries()])
  const initialPatchCount = database.patchCount
  await assert.rejects(updateUserHandler(context(database, caller), args), expectedError)
  assert.equal(database.patchCount, initialPatchCount)
  assert.deepEqual([...database.profiles.entries()], before)
}

const legalChange = { companyName: "Compañía editada", taxId: "TAX-2", address: "Calle 1" }

async function run() {
  // Anonymous identity cannot modify a profile or trigger any write.
  {
    const database = new FakeDatabase([profile("profile_b", "user_b", "victima")])
    await expectDeniedWithoutWrites(database, null, {
      id: "profile_b",
      name: "Intruso",
      email: "intruso@example.com",
      username: "intruso",
      legalSettings: legalChange,
    })
  }

  // Neither an organization administrator nor a member can edit another person's profile.
  for (const caller of [
    identity("user_admin_a", { organization: "org_a", role: "org:admin" }),
    identity("user_member_a", { organization: "org_a", role: "org:member" }),
  ]) {
    for (const fields of [
      { name: "Cambio ajeno" },
      { email: "cambio@example.com" },
      { username: "handle-ajeno" },
      { legalSettings: legalChange },
    ]) {
      const database = new FakeDatabase([profile("profile_b", "user_b", "victima")])
      await expectDeniedWithoutWrites(database, caller, { id: "profile_b", ...fields })
    }
  }

  // A username collision or a username supplied as a legacy reference never proves ownership.
  {
    const database = new FakeDatabase([
      profile("profile_a", "user_a", "autor-a"),
      profile("profile_b", "user_b", "handle-compartido", undefined, "legacy-b"),
    ])
    await expectDeniedWithoutWrites(database, identity("user_a", { username: "handle-compartido" }), {
      id: "handle-compartido",
      name: "Cambio ajeno",
    })
    await expectDeniedWithoutWrites(database, identity("user_a"), {
      id: "profile_a",
      name: "Nombre que no debe guardarse",
      email: "nuevo@example.com",
      username: "handle-compartido",
      legalSettings: legalChange,
    }, /nombre de usuario ya está en uso/)
  }

  // A user can update their own profile in a personal session and while an organization is active.
  {
    const database = new FakeDatabase([profile("profile_a", "user_a", "autor-a")])
    const updated = await updateUserHandler(context(database, identity("user_a")), {
      id: "profile_a",
      name: "Nombre actualizado",
      email: "autor-a-nuevo@example.com",
      username: "autor-a-nuevo",
      legalSettings: legalChange,
    })
    assert.equal(updated?.name, "Nombre actualizado")
    assert.equal(updated?.email, "autor-a-nuevo@example.com")
    assert.equal(updated?.username, "autor-a-nuevo")
    assert.equal(updated?.customDomain, undefined)
    assert.equal(updated?.legacyCustomDomain, "blog.example.com")
    assert.equal(database.profiles.get("profile_a")?.customDomain, "blog.example.com")
    assert.deepEqual(updated?.legalSettings, legalChange)

    const orgOwnerUpdate = await updateUserHandler(
      context(database, identity("user_a", { organization: "org_a", role: "org:member" })),
      {
        id: "profile_a",
        name: "Nombre en contexto org",
        email: "autor-a-org@example.com",
        username: "autor-a-org",
        legalSettings: { ...legalChange, taxId: "TAX-3" },
      }
    )
    assert.equal(orgOwnerUpdate?.name, "Nombre en contexto org")
    assert.equal(orgOwnerUpdate?.email, "autor-a-org@example.com")
    assert.equal(orgOwnerUpdate?.username, "autor-a-org")
    assert.equal(orgOwnerUpdate?.legalSettings?.taxId, "TAX-3")
  }

  // A legacy profile is adopted only through the exact authenticated tokenIdentifier, then edits work by subject.
  {
    const legacy = profile("profile_legacy", undefined, "perfil-heredado", identity("user_legacy").tokenIdentifier, "legacy-profile")
    const database = new FakeDatabase([legacy])
    await expectDeniedWithoutWrites(database, identity("user_legacy"), {
      id: "legacy-profile",
      name: "No antes de asociar",
    })

    const adopted = await syncFromClerkHandler(context(database, identity("user_legacy")), {
      clerkUserId: "user_legacy",
      name: "Perfil heredado",
      email: "legacy@example.com",
      username: "perfil-heredado",
    })
    assert.equal(adopted?._id, "profile_legacy")
    assert.equal(adopted?.clerkUserId, "user_legacy")

    const edited = await updateUserHandler(context(database, identity("user_legacy")), {
      id: "profile_legacy",
      name: "Perfil heredado editado",
      legalSettings: legalChange,
    })
    assert.equal(edited?.name, "Perfil heredado editado")
    assert.deepEqual(edited?.legalSettings, legalChange)
  }

  // A legacy username collision does not adopt the other document; sync creates a separate profile.
  {
    const database = new FakeDatabase([profile("profile_b", "user_b", "username-de-user-a")])
    const before = structuredClone(database.profiles.get("profile_b"))
    const created = await syncFromClerkHandler(context(database, identity("user_a")), {
      clerkUserId: "user_a",
      name: "Usuario A",
      email: "a@example.com",
      username: "username-de-user-a",
    })
    assert.notEqual(created?._id, "profile_b")
    assert.equal(created?.clerkUserId, "user_a")
    assert.notEqual(created?.username, "username-de-user-a")
    assert.deepEqual(database.profiles.get("profile_b"), before)
  }

  // A verified legacy association still syncs when Clerk's mutable username belongs to someone else.
  {
    const legacy = profile(
      "profile_legacy",
      undefined,
      "handle-guardado",
      identity("user_legacy").tokenIdentifier,
      "legacy-profile"
    )
    const database = new FakeDatabase([
      legacy,
      profile("profile_b", "user_b", "handle-de-clerk"),
    ])
    const adopted = await syncFromClerkHandler(context(database, identity("user_legacy")), {
      clerkUserId: "user_legacy",
      name: "Perfil sincronizado",
      email: "legacy@example.com",
      username: "handle-de-clerk",
    })
    assert.equal(adopted?._id, "profile_legacy")
    assert.equal(adopted?.clerkUserId, "user_legacy")
    assert.equal(adopted?.username, "handle-guardado")
    assert.equal(adopted?.name, "Perfil sincronizado")
    assert.equal(database.profiles.get("profile_b")?.name, "Nombre handle-de-clerk")
  }

  console.log("users.update security checks passed")
}

void run().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
