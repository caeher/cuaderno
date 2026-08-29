/**
 * Domain Layer — Repository Interfaces
 *
 * Contracts that the outer (infrastructure) layer must implement.
 * The application layer depends only on these interfaces, never on
 * concrete implementations — this keeps use cases testable and
 * storage-agnostic (mock data today, a real database tomorrow).
 */

export * from "./repositories/index"
