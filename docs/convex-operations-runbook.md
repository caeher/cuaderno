# Runbook Operativo: Backend de Producción con Convex

Este runbook documenta los flujos de trabajo, comandos operativos, gestión de esquemas, monitoreo y políticas de respaldo para el backend en **Convex**.

---

## 1. Entornos y Configuración

### Variables de Entorno Requeridas (.env.local / Producción)
```env
# Identificador de deployment
CONVEX_DEPLOYMENT=prod:your-project-prod

# URL pública de Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project-prod.convex.cloud

# Dominio Issuer JWT de Clerk
CLERK_JWT_ISSUER_DOMAIN=https://clerk.yourdomain.com
```

---

## 2. Comandos Operativos de Convex

| Comando | Descripción |
|---|---|
| `pnpm convex:dev` | Inicia el servidor de desarrollo local y watch de esquemas |
| `pnpm convex:codegen` | Regenera los tipos TypeScript en `convex/_generated/` |
| `pnpm convex:deploy` | Despliega las funciones y esquema a producción |
| `pnpm convex:export` | Exporta un snapshot completo con almacenamiento de archivos |

---

## 3. Procedimiento de Respaldo Continuo (Backups)

Para realizar copias de seguridad periódicas del estado de Convex:

```bash
# 1. Exportar snapshot completo (datos y archivos)
npx convex export --include-file-storage --path ./backups/convex-snapshot-backup

# 2. Restaurar snapshot en un entorno staging/recuperación si fuera necesario
# npx convex import --table <tabla> <archivo.jsonl>
```

---

## 4. Monitoreo y Telemetría en Producción

Acceder al panel web de Convex: [https://dashboard.convex.dev](https://dashboard.convex.dev)

### Indicadores Clave de Salud (SLIs/SLOs):
1. **Error Rate**: Mantener por debajo del 0.01% en llamadas a funciones.
2. **Execution Time (p95)**: < 100ms para consultas, < 250ms para mutaciones complejas.
3. **OCC (Optimistic Concurrency Control) Retries**: Monitorear mutaciones simultáneas de edición de artículos o recuento de comentarios.
4. **Almacenamiento y Cuotas**: Verificar consumo de base de datos y file storage.

---

## 5. Procedimiento de Despliegue (CI/CD)

En cada push a la rama principal (`main`):
1. `pnpm install`
2. `pnpm convex:codegen`
3. `pnpm convex:deploy` (con variable `CONVEX_DEPLOY_KEY` configurada en CI)
4. `pnpm build`