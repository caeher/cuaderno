import fs from "node:fs"
import path from "node:path"
import { createClient, type Client } from "@libsql/client"
import { drizzle as drizzleLibsql, type LibSQLDatabase } from "drizzle-orm/libsql"
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as pgSchema from "./schema/pg"
import * as sqliteSchema from "./schema/sqlite"

export type DatabaseType = "postgres" | "sqlite"

interface DatabaseConfig {
  type: DatabaseType
  url: string
}

function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || ""
  const isPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://")

  if (isPostgres) {
    return {
      type: "postgres",
      url,
    }
  }

  // Fallback to SQLite
  const dataDir = path.join(process.cwd(), ".data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const sqlitePath = path.join(dataDir, "blog.db")
  // Format for libsql: file:path
  const fileUrl = process.platform === "win32" 
    ? `file:${sqlitePath.replace(/\\/g, "/")}`
    : `file:${sqlitePath}`

  return {
    type: "sqlite",
    url: fileUrl,
  }
}

// Global cache for database clients in Next.js development (survives HMR)
declare global {
  // eslint-disable-next-line no-var
  var __globalDbConfig: DatabaseConfig | undefined
  // eslint-disable-next-line no-var
  var __globalSqliteClient: Client | undefined
  // eslint-disable-next-line no-var
  var __globalSqliteDb: LibSQLDatabase<typeof sqliteSchema> | undefined
  // eslint-disable-next-line no-var
  var __globalPgPool: Pool | undefined
  // eslint-disable-next-line no-var
  var __globalPgDb: NodePgDatabase<typeof pgSchema> | undefined
}

export const dbConfig = globalThis.__globalDbConfig ?? getDatabaseConfig()
if (process.env.NODE_ENV !== "production") {
  globalThis.__globalDbConfig = dbConfig
}

export function isPostgresDatabase(): boolean {
  return dbConfig.type === "postgres"
}

// SQLite Drizzle Instance
export function getSqliteDb(): LibSQLDatabase<typeof sqliteSchema> {
  if (globalThis.__globalSqliteDb) {
    return globalThis.__globalSqliteDb
  }

  const client = globalThis.__globalSqliteClient ?? createClient({ url: dbConfig.url })
  const db = drizzleLibsql(client, { schema: sqliteSchema })

  if (process.env.NODE_ENV !== "production") {
    globalThis.__globalSqliteClient = client
    globalThis.__globalSqliteDb = db
  }

  return db
}

export function getSqliteClient(): Client {
  if (globalThis.__globalSqliteClient) {
    return globalThis.__globalSqliteClient
  }
  const client = createClient({ url: dbConfig.url })
  if (process.env.NODE_ENV !== "production") {
    globalThis.__globalSqliteClient = client
  }
  return client
}

// PostgreSQL Drizzle Instance
export function getPgDb(): NodePgDatabase<typeof pgSchema> {
  if (globalThis.__globalPgDb) {
    return globalThis.__globalPgDb
  }

  const pool =
    globalThis.__globalPgPool ??
    new Pool({
      connectionString: dbConfig.url,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    })

  const db = drizzlePg(pool, { schema: pgSchema })

  if (process.env.NODE_ENV !== "production") {
    globalThis.__globalPgPool = pool
    globalThis.__globalPgDb = db
  }

  return db
}
