import type { GenericDatabaseReader } from "convex/server"
import type { DataModel, Id } from "../_generated/dataModel"

export type TableNames = keyof DataModel & string

/**
 * Busca un documento por su ID nativo de Convex (_id) o por su identificador heredado (legacyId).
 */
export async function findDocById<TableName extends TableNames>(
  db: GenericDatabaseReader<DataModel>,
  tableName: TableName,
  id: string
): Promise<DataModel[TableName]["document"] | null> {
  if (!id) return null

  // 1. Intentar normalizar como Id nativo de Convex
  const normalizedId = db.normalizeId(tableName, id) as Id<TableName> | null
  if (normalizedId) {
    const doc = await db.get(normalizedId)
    if (doc) return doc
  }

  // 2. Intentar buscar por índice legacyId si la tabla lo soporta
  try {
    const doc = await (db.query(tableName) as any)
      .withIndex("by_legacy_id", (q: any) => q.eq("legacyId", id))
      .first()
    if (doc) return doc
  } catch {
    // La tabla puede no tener índice by_legacy_id
  }

  // 3. Casos especiales para usuarios y categorías
  if (tableName === "users") {
    // Buscar por clerkUserId
    const userByClerk = await (db.query("users") as any)
      .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", id))
      .first()
    if (userByClerk) return userByClerk

    // Buscar por username
    const userByUsername = await (db.query("users") as any)
      .withIndex("by_username", (q: any) => q.eq("username", id))
      .first()
    if (userByUsername) return userByUsername
  }

  if (tableName === "categories") {
    try {
      const catBySlug = await (db.query("categories") as any)
        .withIndex("by_slug", (q: any) => q.eq("slug", id))
        .first()
      if (catBySlug) return catBySlug
    } catch {
      // Ignorar si no existe el índice
    }
  }

  return null
}

/**
 * Calcula el tiempo estimado de lectura en minutos a partir del contenido de texto.
 */
export function calculateReadingTime(content: string): number {
  if (!content || !content.trim()) return 1
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Retorna la fecha actual en formato ISO (YYYY-MM-DD o ISO completo).
 */
export function getCurrentIsoDate(): string {
  return new Date().toISOString().split("T")[0]
}

export function getCurrentIsoTimestamp(): string {
  return new Date().toISOString()
}
