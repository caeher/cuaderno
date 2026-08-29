# Arquitectura de Datos e Índices en Convex

Este documento describe formalmente el modelo de datos, la estrategia de indexación, el diseño de relaciones sin `JOIN`, la política de migración `legacyId`, el análisis de tamaño de documentos y las normas de aislamiento multi-tenant en **Convex**, reemplazando los esquemas SQL de Drizzle (SQLite/PostgreSQL).

---

## 1. Visión General del Modelo

El modelo de persistencia en Convex se basa en colecciones documentales tipadas mediante validadores explícitos (`defineTable`, `v`). Se eliminan las cadenas de texto JSON serializadas (`JSON.stringify` / `JSON.parse`) del esquema heredado en favor de estructuras nativas (objetos, arrays y records), aprovechando la reactividad en tiempo real y la validación en tiempo de compilación y ejecución.

```
+--------------------------------------------------------------------------------+
|                               CONVEX DATA MODEL                                |
+--------------------------------------------------------------------------------+
|                                                                                |
|  +--------------------+         1:N         +-------------------------------+  |
|  |       users        | ------------------> |             posts             |  |
|  | (Author / Tenant)  |                     |  - title, slug, content       |  |
|  | - socials (object) |                     |  - tags (native array)        |  |
|  | - legal (object)   |                     |  - status, views, likes       |  |
|  | - seo (object)     |                     |  - contentStorageId (overflow)|  |
|  +--------------------+                     +-------------------------------+  |
|           |                                                 | 1:N              |
|           | 1:1                                             v                  |
|           v                                         +---------------+          |
|  +---------------------------+                      |   comments    |          |
|  |      tenantTemplates      |                      |  - author     |          |
|  | - draftSlots (record)     |                      |  - content    |          |
|  | - publishedSlots (record) |                      |  - postId     |          |
|  | - settings (object)       |                      +---------------+          |
|  +---------------------------+                                                 |
|           | 1:N                                                                |
|           v                                                                    |
|  +---------------------------+       +----------------+     +----------------+ |
|  |  tenantTemplateRevisions  |       |   categories   |     |      tags      | |
|  | - slotsSnapshot (record)  |       | - name, slug   |     | - name, slug   | |
|  | - settingsSnapshot (obj)  |       | - tenantId     |     | - tenantId     | |
|  +---------------------------+       +----------------+     +----------------+ |
+--------------------------------------------------------------------------------+
```

---

## 2. Definición de Colecciones y Tipado Nativo

### 2.1 `users`
Representa autores y tenants individuales (o metadatos de configuración de usuario).
- **Identificadores**: `_id: Id<"users">`, `legacyId?: string`, `clerkUserId?: string`, `tokenIdentifier?: string`.
- **Objetos Nativos Tipados**:
  - `socials`: `{ website?, twitter?, github?, linkedin?, instagram? }`
  - `legalSettings`: `{ companyName?, contactEmail?, taxId?, address?, jurisdiction?, customPrivacyPolicy?, customTerms?, customCookiePolicy?, customLegalNotice?, dpoContact? }`
  - `seoSettings`: `{ metaTitle?, metaDescription?, keywords?: string[], geoCountry?, geoRegion?, geoCity?, geoCoordinates?, allowAiCrawlers?, enableLlmsTxt?, socialSharingImage?, canonicalDomain? }`
- **Métricas desnormalizadas**: `postCount`, `followerCount`.

### 2.2 `categories` y `tags`
Taxonomías asignables a publicaciones por tenant u organización.
- **Campos**: `name`, `slug`, `description?`, `color`, `icon?`, `postCount?`.
- **Tenancy**: `tenantId?: string`, `organizationId?: string`, `authorId?: string`.

### 2.3 `posts`
Artículos y publicaciones del blog.
- **Campos Principales**: `title`, `slug`, `excerpt`, `content`, `coverUrl?`, `tags: string[]`, `status: "draft" | "published" | "scheduled"`, `publishedAt?`, `updatedAt`, `scheduledFor?`.
- **Métricas**: `readingTimeMinutes`, `views`, `likes`, `comments`, `featured`.
- **Compatibilidad y Almacenamiento**: `designData?` (deprecated), `editorMode?` (`"notion" | "elementor"`), `contentStorageId?: Id<"_storage">` (salvaguarda para contenidos >500 KB).

### 2.4 `comments`
Comentarios de lectores asociados a una publicación.
- **Campos**: `postId: string`, `postDocId?: Id<"posts">`, `authorName`, `authorAvatarUrl?`, `authorEmail?`, `authorUserId?`, `content`, `createdAt`.

### 2.5 `tenantTemplates` y `tenantTemplateRevisions`
Plantillas visuales modulares para personalización de páginas por tenant.
- **Estructura AST de Bloques Nativos**: `draftSlots: Record<string, any>`, `publishedSlots: Record<string, any>`, `slotsSnapshot: Record<string, any>`.
- **Ajustes Nativos**: `settings`: `{ primaryColor?, accentColor?, fontHeading?, fontBody?, customCss?, containerMaxWidth? }`.
- **Versionado e Inmutabilidad**: Monotónicamente creciente (`version: number`), con snapshots inmutables en `tenantTemplateRevisions`.

---

## 3. Matriz de Índices vs Patrones de Acceso (Zero Table-Scans)

| Ruta / Caso de Uso | Operación | Colección | Índice Convex Utilizado | Justificación y Filtro |
| :--- | :--- | :--- | :--- | :--- |
| **Página Principal / Feed Público** (`/`, `/explorar`) | `getPublishedFeed` | `posts` | `by_status_and_publishedAt` | Filtra `status == "published"` y ordena por fecha descendente sin escanear borradores. |
| **Posts Destacados** (Home / Widgets) | `getFeaturedPosts` | `posts` | `by_status_and_featured` | Filtra `status == "published"` y `featured == true`. |
| **Lectura de Post** (`/post/[slug]`) | `getPostForReading` | `posts` | `by_slug` | Lookup exacto por slug único (`O(1)`). |
| **Lectura de Post por Tenant** (`/[tenant]/post/[slug]`) | `getPostForReadingByTenant` | `posts` | `by_slug` | Lookup de post y validación de `authorId` contra usuario. |
| **Feed de Tenant** (`/[tenant]`) | `getTenantPosts` | `posts` | `by_tenant_and_status` | Recupera únicamente posts publicados del tenant dado. |
| **Perfil de Autor / Tenant** (`/autor/[username]`) | `getAuthorProfile` | `users` | `by_username` | Búsqueda directa del usuario por su handle (`username`). |
| **Panel: Listado de Posts del Autor** (`/panel/posts`) | `getAuthorPosts` | `posts` | `by_author_and_status` | Filtra por autor y estado, ordenado por `updatedAt`. |
| **Panel: Posts de Organización** (`/panel/posts`) | `getOrgPosts` | `posts` | `by_org_and_status` | Filtra por organización activa y estado. |
| **Comentarios de un Post** (Lectura y Widget) | `getPostComments` | `comments` | `by_post` | Obtiene comentarios para un `postId` ordenados cronológicamente (`createdAt`). |
| **Taxonomías por Organización/Tenant** | `getCategories`, `getTags` | `categories`, `tags` | `by_tenant`, `by_slug_and_tenant` | Recupera categorías/tags asociadas al tenant o slug específico. |
| **Plantilla Activa del Tenant** (Diseñador y SSR) | `getTenantTemplate` | `tenantTemplates` | `by_tenant` | Recupera la plantilla exacta configurada para el tenant (`org_...` o `user_...`). |
| **Historial de Revisiones de Plantilla** | `getTemplateRevisions` | `tenantTemplateRevisions` | `by_tenant_and_version` | Lista el historial ordenado por número de versión descendente. |
| **Importación / Preservación de Enlaces** | `importFromSql` | Todas | `by_legacy_id` | Mapeo instantáneo de IDs relacionales del sistema anterior. |

---

## 4. Estrategia de Identificadores (`_id` vs `legacyId`)

1. **Generación Nativa en Convex**:
   Cada nuevo documento generado en Convex recibe automáticamente su `_id: Id<"table">` (identificador criptográfico inmutable de 64 bits optimizado para índices B-Tree).
2. **Preservación de IDs Heredados (`legacyId`)**:
   Los registros existentes importados desde SQLite/PostgreSQL (con IDs tipo `p_abc123`, `cat_456`, `user_789`, `tpl_001`) conservan su identificador original en el campo opcional `legacyId`.
3. **Resolución Flexible de Claves Foráneas**:
   Campos relacionales como `postId` en `comments` o `categoryId` en `posts` aceptan tanto el `legacyId` histórico como el `_id` canónico de Convex. Esto garantiza compatibilidad retroactiva durante migraciones incrementales sin cortes de servicio.

---

## 5. Relaciones sin JOIN y Consultas Compuestas

En Convex, las relaciones entre documentos no utilizan sentencias SQL `JOIN`, sino **consultas compuestas en TypeScript del lado del servidor**:

```ts
// Ejemplo de consulta compuesta en Convex con ejecución sub-milisegundo en memoria
export const getPostWithDetails = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post || post.status !== "published") return null;

    const [author, comments, category] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", post.authorId))
        .first()
        .then(async (u) => u || (post.authorDocId ? ctx.db.get(post.authorDocId) : null)),
      ctx.db
        .query("comments")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .collect(),
      post.categoryDocId
        ? ctx.db.get(post.categoryDocId)
        : post.categoryId
        ? ctx.db
            .query("categories")
            .withIndex("by_slug", (q) => q.eq("slug", post.categoryId!))
            .first()
        : null,
    ]);

    return { post, author, comments, category };
  },
});
```

### Reglas de Desnormalización y Consistencia Atómica
- **Contadores Desnormalizados**:
  - `users.postCount`: Mantiene el número total de posts del autor.
  - `posts.comments`: Mantiene la cantidad total de comentarios de la publicación.
- **Atomicidad Transaccional**:
  En Convex, cada mutación se ejecuta dentro de una transacción ACID aislada. Al insertar un comentario (`createComment`), la mutación actualiza el contador `posts.comments` y escribe el documento del comentario simultáneamente. Si una operación falla, toda la transacción se revierte automáticamente sin inconsistencias.

---

## 6. Auditoría de Tamaño de Documentos y Gestión de Almacenamiento Externo

### 6.1 Análisis de Límites
Convex impone un límite estricto de **1 MB (1,048,576 bytes)** por documento individual.

| Tipo de Contenido | Tamaño Típico | Tamaño Máximo Estimado | ¿Apto en Documento? |
| :--- | :--- | :--- | :--- |
| **Post Markdown / HTML** | 5 KB – 40 KB | ~200 KB (artículos extensos) | **Sí** (Margen > 80%) |
| **Árbol de Bloques de Plantilla** (`draftSlots`, `publishedSlots`) | 20 KB – 120 KB | ~350 KB (plantilla muy compleja) | **Sí** (Margen > 65%) |
| **Configuraciones de Usuario / Tenant** (`legal`, `seo`) | 1 KB – 5 KB | ~15 KB | **Sí** (Margen > 98%) |

### 6.2 Política de Desbordamiento a Convex Storage (`_storage`)
Para evitar desbordamientos en casos anómalos (p. ej. inserción masiva de imágenes incrustadas en base64 en lugar de URLs):
1. **Umbral de Seguridad**: Si el contenido serializado de un post o de un árbol de bloques supera los **500 KB**, la mutación almacena el payload en el servicio de archivos de Convex (`ctx.storage.store`) y guarda el `Id<"_storage">` en `contentStorageId` o `storageDraftId` / `storagePublishedId`.
2. **Lectura Transparente**: Las queries inspeccionan si el campo de almacenamiento externo está poblado para resolver el contenido bajo demanda, garantizando escalabilidad ilimitada.

---

## 7. Modelo de Seguridad Multi-Tenant y Reglas de Ownership

El control de acceso se basa en la identidad autenticada mediante **Clerk JWT** resuelta en `convex/lib/auth.ts`:

1. **Lecturas Públicas**:
   - Acceso sin autenticación permitido únicamente para publicaciones con `status: "published"`, categorías/tags activas y plantillas con `isPublished: true`.
2. **Mutaciones y Lecturas Privadas**:
   - `requireTenantAuth(ctx, expectedTenantId)`: Valida la sesión activa de Clerk.
   - **Tenants Personales (`tenantType: "user"`)**:
     `identity.userId === targetTenantId` o `resource.authorId === identity.userId`.
   - **Tenants de Organización (`tenantType: "organization"`)**:
     `identity.orgId === targetTenantId` o `resource.organizationId === identity.orgId`.
   - **Verificación de Roles Organizacionales**: Se permite restringir operaciones administrativas de plantilla a roles con permisos (`identity.orgRole === "org:admin"`).
