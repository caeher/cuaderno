# Dominios personalizados: verificación y operación

## Estados y routing

`customDomainClaims` conserva el tenant, el perfil propietario, el hostname canónico, el desafío DNS, su versión, caducidad y marcas de tiempo. La reclamación se crea o cambia mediante una mutación transaccional que lee el índice `by_hostname` y escribe en esa misma transacción. Convex vuelve a intentar una mutación si una escritura concurrente invalida su lectura; una reclamación pendiente o verificada bloquea a otros tenants. Un desafío pendiente caducado se puede reasignar. `users.verifiedCustomDomain` es una proyección que solo actualiza esa mutación al verificar o revocar, para que las páginas públicas no necesiten una consulta extra por cada autor.

El proxy resuelve exclusivamente reclamaciones `verified`. Los valores históricos de `users.customDomain` son candidatos de migración y nunca habilitan routing ni se publican como URL activa. Cuando el propietario inicia la reclamación de un dominio heredado, se borra el campo histórico dentro de la mutación.

## Reclamación DNS

1. El propietario inicia sesión y abre **Panel → Configuración → Dominio y URLs**. Para un tenant personal, la sesión debe ser personal. Para una organización, debe estar activa y la persona debe ser `org:admin` o `org:owner`; el perfil público debe estar asociado a esa organización.
2. Cuaderno normaliza el hostname a minúsculas y punycode, elimina un punto final y exige etiquetas DNS válidas. No acepta protocolo, puerto, ruta, query, fragmento ni credenciales. `empresa.com` y `www.empresa.com` son hostnames independientes; se verifica cada uno por separado.
3. Una action de Convex genera un token aleatorio de 256 bits y una mutación registra el desafío con vigencia de 24 horas. La UI muestra el registro TXT completo:
   - **Nombre / host:** `_cuaderno-verification.<hostname>`
   - **Valor:** `cuaderno-domain-verification=<token>`
4. El propietario publica el TXT en su proveedor DNS y pulsa **Verificar registro DNS**. La action Node consulta DNS con un límite de 5 segundos y compara el valor completo después de unir fragmentos TXT. Un TXT ausente o distinto deja la reclamación pendiente; un error de red se muestra y no activa routing.
5. La mutación final vuelve a comprobar tenant, perfil, estado, hostname, versión y valor exacto del desafío, además de su caducidad. Si durante la consulta se cambió el dominio o se generó otro desafío, el resultado anterior se rechaza.
6. Verificar el TXT demuestra control DNS. El propietario todavía debe registrar el hostname en el proveedor de hosting y confirmar allí que el certificado TLS/HTTPS está listo. Cuaderno no consulta el proveedor de hosting ni emite certificados.

Cambiar de dominio revoca el hostname anterior y registra el nuevo desafío en una mutación atómica. Retirar el dominio revoca su reclamación. Ambas operaciones desactivan el routing en Convex de inmediato; la caché local del proxy puede conservar la respuesta positiva hasta 30 segundos. Los hosts sin resultado se cachean 15 segundos y los errores de Convex 5 segundos. La caché vive por instancia y no tiene invalidación remota; las respuestas se actualizan al vencer ese TTL. Si el proveedor añade otra capa de caché HTTP, su purga es una operación aparte.

## Configuración del dominio de plataforma

Las actions rechazan el dominio raíz de Cuaderno y todos sus subdominios. Configura `PLATFORM_ROOT_DOMAIN` en cada entorno de Convex (por ejemplo `localhost:3000` en desarrollo y `cuaderno.example` en producción). Si falta o no se puede normalizar, las reclamaciones fallan cerradas. El sufijo `localhost`, `lvh.me`, `vercel.app`, `now.sh`, `convex.site` y `convex.cloud` también se reserva.

El despliegue de Next conserva `NEXT_PUBLIC_ROOT_DOMAIN` para `proxy.ts`. `PLATFORM_ROOT_DOMAIN` debe reflejar el mismo host raíz, sin protocolo ni ruta.

## Migración de valores existentes

La versión nueva no convierte automáticamente ningún dominio histórico en verificado. Al activar el resolver nuevo, las filas heredadas dejan de enrutar hasta que su propietario complete la comprobación. Para reducir interrupciones:

1. Antes del cambio de routing, consulta `customDomains.legacyDomainInventoryInternal` en páginas de 100 filas hasta que `isDone` sea `true`; la respuesta conserva el cursor para la página siguiente. La consulta es interna y paginada para no hacer un `.collect()` ilimitado.
2. Normaliza el hostname con la misma política, agrupa coincidencias y revisa manualmente dominios duplicados, inválidos, reservados y dominios de la plataforma. No elijas un propietario automáticamente si hay duplicados.
3. Coordina con los propietarios qué hostname desean conservar y pídeles publicar el TXT. El valor histórico aparece como candidato en su panel, pero no se trata como verificado.
4. Cada propietario inicia su propia reclamación en el panel. La regla transaccional deja que un único tenant mantenga la reclamación; las pruebas DNS antiguas o caducadas no pueden completar una reclamación nueva.
5. Confirma con el propietario la configuración del hosting y TLS. Mantén el inventario y el seguimiento manual hasta que los dominios deseados estén verificados; planifica una interrupción temporal para los que aún no lo estén.

No insertes filas `verified` desde una migración ni copies `users.customDomain` a `customDomainClaims` con estado verificado. No uses dominios de terceros en pruebas normales y no consultes el DNS real desde la suite automatizada.

## Verificación local

La suite `pnpm test:custom-domains` simula registros TXT, errores DNS, expiración, rotación de desafío, reasignación, dos tenants que intentan reclamar el mismo hostname y caducidad de caché. El caso concurrente serializa mutaciones simuladas para comprobar la regla de estado; no sustituye una prueba contra un deployment de Convex. No ejecutar `convex deploy` como parte del desarrollo local.
