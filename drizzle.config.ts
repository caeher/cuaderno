import { defineConfig } from "drizzle-kit"

const isPostgres = Boolean(
  process.env.DATABASE_URL?.startsWith("postgres://") ||
  process.env.DATABASE_URL?.startsWith("postgresql://") ||
  process.env.POSTGRES_URL?.startsWith("postgres://") ||
  process.env.POSTGRES_URL?.startsWith("postgresql://")
)

export default isPostgres
  ? defineConfig({
      schema: "./lib/infrastructure/db/schema/pg.ts",
      out: "./drizzle/pg",
      dialect: "postgresql",
      dbCredentials: {
        url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
      },
    })
  : defineConfig({
      schema: "./lib/infrastructure/db/schema/sqlite.ts",
      out: "./drizzle/sqlite",
      dialect: "sqlite",
      dbCredentials: {
        url: "./.data/blog.db",
      },
    })
