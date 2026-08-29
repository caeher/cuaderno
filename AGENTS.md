<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cuaderno — guía para agentes

Plataforma editorial SaaS multi-tenant (producto: **Cuaderno**). Autores y equipos publican blogs con editor TipTap, diseñador visual, narración de audio y un asistente de IA (Composer) que **nunca publica**. UI y copy en español.

## Stack

| Capa | Tecnología |
|---|---|
| App | Next.js 16.3, React 19, TypeScript estricto, pnpm 11 |
| UI | Tailwind 4, shadcn (`base-nova` + Base UI), TipTap, diseñador de widgets |
| Auth | Clerk (`@clerk/nextjs`) + JWT template `convex` (`aud: convex`) |
| Backend | Convex (esquema, queries, mutations, actions, storage, crons) |
| IA | OpenAI solo en Convex actions `"use node"`; Vapi para narraciones |

Gestor: `pnpm`. Alias: `@/*` → raíz del repo.

## Arquitectura (no saltarse capas)

```
app/                  rutas, layouts, Server Actions delgadas
components/           UI. No habla con OpenAI ni Vapi.
lib/domain/           entidades, interfaces de repositorio, validadores. Sin I/O.
lib/application/      casos de uso. Orquesta repos. Sin Convex ni SDKs de UI.
lib/infrastructure/   adaptadores Convex (`createRepositories()`).
convex/               funciones, schema, auth, IA. Fuente de verdad de persistencia.
```

Flujo típico de mutación:

`components` → `app/actions/*.ts` (`"use server"`) → `lib/application/*` → `lib/infrastructure/repositories` → `convexQuery` / `convexMutation` → `convex/*.ts`

- Dominio no importa Convex, Clerk ni React.
- Application no importa `convex/react` ni componentes.
- `components/**` y `app/actions/**` **no** llaman a OpenAI. Hablan con Convex; Convex habla con el proveedor.
- Repositorios: singletons en `lib/infrastructure/repositories.ts`. No instanciar a mano.

## Rutas y multi-tenancy

El middleware vive en `proxy.ts` (Next 16; no hay `middleware.ts`).

| Superficie | Path | Quién |
|---|---|---|
| Plataforma | `app/(site)/` | `/`, `/explorar`, `/post/[slug]`, legal |
| Auth | `app/(auth)/`, `app/sign-in`, `app/sign-up` | Clerk; no reescribir a tenant |
| Panel | `app/panel/**` | Autores. `auth.protect()` |
| Blog de tenant | `app/[tenant]/**` | Rewrite interno. El lector ve `/` en el host del tenant |

Resolución de host (`lib/tenant-utils.ts`, `lib/custom-domain.ts`):

1. Subdominio de plataforma: `acme.localhost:3000` / `acme.tudominio.com`
2. Dominio propio: `blog.empresa.com` (solo si el host **no** es de plataforma)
3. Host de plataforma: sitio raíz, sin rewrite

Headers de request: `x-tenant-slug`, `x-is-subdomain`, `x-tenant-host-mode`.

`tenantId` canónico: `orgId` de Clerk si hay organización activa; si no, `userId` (blog personal). Ver `convex/lib/auth.ts` y `lib/application/tenant/tenant-auth.ts`.

Subdominios reservados: `www`, `api`, `app`, `admin`, `panel`, `auth`, `cdn`, etc. No usarlos como slugs de tenant.

## Auth y aislamiento

- Panel: Clerk en `proxy.ts`.
- Convex público que toca datos de usuario: `requireTenantAuth(ctx)` / `assertCanManageResource`. El cliente puede mandar cualquier ID; validar en servidor.
- Next → Convex: JWT template `convex`, no el session token. Cliente HTTP: `lib/infrastructure/convex/client.ts`. Setup: `pnpm setup:clerk-convex`.
- Toda tabla de negocio lleva `tenantId` (o equivalente) e índice `by_tenant`. Nunca cruzar tenants.

## Convex

- Desarrollo: `npx convex dev` / `pnpm dev`. **Nunca** `convex deploy` salvo producción.
- Queries deterministas: nada de `Date.now()` / `new Date()` dentro de `query`.
- Índices (`.withIndex`), no `.filter()` sobre la tabla. Listas grandes: paginar, no `.collect()` unbounded.
- Await de todo promise (`insert`, `patch`, `scheduler`).
- Funciones públicas: `args` + `returns` + auth.
- Scheduler: solo `internal.*`, nunca `api.*`.
- Node/SDK externos: archivo `"use node"` **solo** con `action` / `internalAction` (`convex/aiNode.ts`, no mezclar queries/mutations).
- Schema plano y relacional: `convex/schema.ts`. Detalle: `docs/convex-schema-architecture.md`.
- Tipos: `Doc<"tabla">`, `Id<"tabla">`. Evitar `any`.

## Composer (IA) — invariantes

Épica #13. Plan: `docs/composer-plan.md`. Runbook: `docs/ai-platform-runbook.md`. Retención: `docs/ai-data-retention-policy.md`.

1. **Nunca publica.** Salida terminal: post `draft`. Publicar es el flujo existente del panel.
2. **Claves de OpenAI solo en env de Convex.** Cero `NEXT_PUBLIC_` en variables de IA. Cero `fetch` a OpenAI desde el cliente o Server Actions.
3. **Toda afirmación investigada rastrea a una URL** en `composerSources`. Web Search solo en fase `research`, nunca en `writing`.
4. **El cliente no elige modelo.** Resolución en `convex/lib/ai/config.ts` desde env.
5. Transiciones de sesión en `convex/lib/composerState.ts`, validadas en **mutation**, no en action.
6. `COMPOSER_ENABLED` default `false`. Health: `ai.getConfigHealth` (nunca expone la API key).
7. Llamadas Responses: `store: false`. No enviar email, JWT ni datos de otro tenant al proveedor.

Estados: `collecting → awaiting_confirmation → researching → drafting → imaging → awaiting_review` (`failed` / `cancelled`). `imaging` se omite si no hay portada.

## Narraciones (Vapi)

Orquestación en servidor (`lib/server/*`, `app/actions/narrations.ts`). Kill switch: `AUDIO_NARRATION_KILL_SWITCH` / `ENABLE_VAPI_NARRATIONS`. Audio en Convex Storage. Ver `docs/vapi-narration-operations-guide.md`.

## UI

- Primitivos: `components/ui/` (shadcn). No editar a mano salvo que el cambio sea del design system.
- Panel: `components/admin/`. Sitio público: `components/site/`. Diseñador: `components/designer/`.
- Formularios reutilizables: `components/forms/`.
- Tema: `app/globals.css`, fuentes Fraunces / Work Sans / JetBrains Mono.
- Copy, rutas amigables y toasts en español (`/iniciar-sesion`, `/panel/taxonomias`, etc.).

## Comandos

```bash
pnpm dev                 # convex dev --start "next dev"
pnpm lint
pnpm convex:dev          # solo backend
pnpm convex:codegen
pnpm setup:clerk-convex
pnpm test:contracts
pnpm test:ai
pnpm test:narration
```

Verificación ad hoc: `scratch/*.ts` vía `tsx`. No es la carpeta de producto.

## Docs de dominio (leer antes de tocar el área)

| Área | Documento |
|---|---|
| Composer / OpenAI | `docs/composer-plan.md`, `docs/ai-platform-runbook.md`, `docs/ai-data-retention-policy.md` |
| Schema e índices | `docs/convex-schema-architecture.md` |
| Ops Convex | `docs/convex-operations-runbook.md` |
| Narración | `docs/vapi-narration-operations-guide.md`, `docs/vapi-narration-privacy-and-retention-policy.md` |
| Migración legacy | `docs/migration-runbook.md` |
| Env | `.env.example` |

## Qué no hacer

- No quitar el bloque `BEGIN:nextjs-agent-rules` / `END:nextjs-agent-rules`.
- No introducir Drizzle/SQL ni `JSON.stringify` de documentos de dominio; el backend es Convex nativo.
- No usar `lib/infrastructure/mock-db.ts` para features nuevas (legado).
- No publicar desde Composer ni saltarse moderación.
- No commitear `.env.local` ni secretos.
- No `convex deploy` en desarrollo.
- No mezclar `query`/`mutation` en un archivo `"use node"`.
- No reescribir rutas de auth (`/sign-in`, `/iniciar-sesion`, `/__clerk`) bajo un slug de tenant.
