# Migración de tenantId y slugs públicos de posts

## Comportamiento de lectura

- `/{tenant}/post/{slug}` resuelve primero un perfil público por `users.username`. Si no existe, devuelve no encontrado sin buscar un post global.
- Para un blog organizacional, una persona administradora puede vincular su perfil público a la organización activa desde **Panel → Configuración → Organización / Blog**. Convex guarda la relación `users.publicTenantId`; un perfil solo puede representar un tenant y la asociación no se cambia desde la UI. Mientras no exista la asociación, los posts con `organizationId` no se atribuyen a un perfil por similitud de nombre, autor o slug.
- La query pública usa `posts.by_tenant_and_slug` y solo devuelve `published`. Si quedan dos posts publicados con el mismo tenant y slug, devuelve no encontrado hasta que se resuelva la colisión.
- Los posts sin `tenantId` pueden leerse temporalmente por el tenant solo cuando `authorDocId` y `authorId` llevan al mismo perfil. Si las referencias discrepan o el autor no existe, no se atribuyen a ningún blog.
- Un `username` duplicado no identifica un tenant público válido; sus rutas devuelven no encontrado hasta resolver la duplicidad.
- `/post/{slug}` y su alias `/posts/{slug}` son URLs legacy de plataforma. Se conservan solo cuando hay exactamente un post publicado con ese slug en toda la plataforma. Si el slug aparece en varios tenants, devuelven no encontrado.
- Los enlaces públicos nuevos incluyen el tenant. Las páginas de posts generan canonical y JSON-LD desde el dominio configurado para ese tenant: dominio propio, subdominio o ruta amigable.
- Las plantillas públicas usan el mismo `publicTenantId` del perfil organizacional para que el diseño, canonical y JSON-LD correspondan al mismo blog.

## Ejecución por lotes

`convex/postTenantMigration.ts` exporta la mutation interna `normalizePostTenantBatch`. Ejecutarla en el entorno Convex objetivo en lotes de hasta 250 registros:

```bash
npx convex run postTenantMigration:normalizePostTenantBatch '{"cursor":null,"numItems":100}'
```

Copiar el `continueCursor` de la respuesta en la siguiente llamada como `cursor` y repetir hasta `isDone: true`. La mutation es idempotente: se puede volver a ejecutar desde el cursor inicial para confirmar el estado. No se despliega ni se ejecuta automáticamente con la aplicación.

La función y los índices deben estar disponibles en el deployment seleccionado antes de ejecutar los lotes. `convex run` usa el deployment de desarrollo por defecto; para otro entorno, especificar `--deployment <deployment>` de forma explícita. La implementación no ejecutó esta mutation ni desplegó código.

Cada lote informa:

- `normalized`: cantidad de filas a las que se asignó un `tenantId`.
- `ambiguous`: posts que no se tocaron porque no se encontró el autor, `tenantId` y `organizationId` discrepan, dos referencias apuntan a perfiles distintos o un identificador coincide con más de un perfil entre los campos nativo, Clerk, legacy o username.
- `collisions`: grupos publicados o privados con el mismo `tenantId` y `slug`, con todos sus IDs.

Si existe `organizationId` y falta `tenantId`, se usa ese ID explícito. En posts personales, el tenant se deriva del perfil de autor resuelto, con prioridad `clerkUserId`, `legacyId` y `_id`. No se infiere el propietario desde un post global, no se borran filas y los registros ambiguos quedan sin cambios.

## Revisión de resultados

1. Ejecutar todos los lotes y guardar las respuestas como evidencia de operación.
2. Resolver manualmente cada elemento de `ambiguous` con la fuente de propiedad correspondiente. No asignar un tenant por similitud de slug o contenido.
3. Para cada colisión, acordar un slug distinto con el propietario del tenant. Las mutations de creación y actualización ya impiden crear nuevas colisiones dentro del mismo tenant; la migración no cambia slugs existentes.
4. Volver a ejecutar la migración y comprobar que `normalized` sea cero y que no queden ambigüedades ni colisiones abiertas.
5. Verificar rutas tenant para slugs compartidos entre blogs y comprobar que las URLs legacy globales ambiguas den no encontrado.

Los datos que siguen sin `tenantId` por ambigüedad no aparecen en la ruta pública tenant hasta que se resuelvan. Las URLs legacy globales de slugs únicos siguen disponibles durante la transición.
