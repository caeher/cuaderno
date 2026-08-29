# Runbook Operativo: Migración de Datos a Convex y Retención de Backups SQL (Completado)

Este documento registra el procedimiento ejecutado para la migración integral a **Convex**, la política de retención y custodia de los respaldos históricos de las bases de datos SQL (SQLite / PostgreSQL) y el procedimiento de rollback / auditoría.

---

## 1. Estado de la Migración

- **Estado Actual**: ✅ **MIGRACIÓN COMPLETADA & VERIFICADA**
- **Backend Exclusivo**: **Convex** (`NEXT_PUBLIC_CONVEX_URL` / `CONVEX_DEPLOYMENT`).
- **Infraestructura SQL**: Retirada y desmantelada (dependencias `drizzle-orm`, `drizzle-kit`, `pg`, `@libsql/client` y esquemas eliminados).
- **Epic**: #5 (Cerrado).

---

## 2. Política de Retención y Custodia de Backups SQL

Antes de la desincorporación física de las bases de datos relacionales, se generaron respaldos completos e inmutables:

### 2.1 Snapshots Generados
1. **PostgreSQL (Producción)**:
   ```bash
   pg_dump -Fc "$DATABASE_URL" > ./backups/final-pg-backup.dump
   ```
2. **SQLite (Local / Staging)**:
   ```bash
   cp .data/blog.db ./backups/final-sqlite-backup.db
   ```

### 2.2 Política de Custodia
- **Custodio / Responsable Técnico**: Lead DevOps & Database Administrator.
- **Periodo de Retención**: **90 días naturales** desde el cutover productivo.
- **Almacenamiento**: Bucket S3 / R2 con cifrado en reposo (AES-256 / KMS) y política de retención inmutable (WORM/Object Lock).
- **Destrucción Segura**: Transcurridos los 90 días sin incidentes de reconciliación, se autoriza la terminación y purga definitiva de las instancias PostgreSQL en proveedores externos.

---

## 3. Registro Histórico de Reconciliación y Auditoría

Los reportes de reconciliación de datos generados por el pipeline de migración se encuentran preservados en:
- `docs/reports/migration-report-*.md`

Todos los recuentos de entidades (Usuarios, Artículos, Categorías, Etiquetas, Comentarios y Plantillas) fueron reconciliados con **0 discrepancias** y estado `PASSED`.

---

## 4. Operación Continua y Nuevos Procedimientos

Para las operaciones del día a día, desarrollo y respaldos de Convex, consultar el documento:
👉 **[docs/convex-operations-runbook.md](./convex-operations-runbook.md)**

