/**
 * Domain Layer — Template AST Validator & Normalizer
 *
 * Implements recursive validation, safety checks, property sanitization,
 * depth bounding (max 10 levels), and schema version migrations for block trees.
 */

import {
  type BlockNode,
  type BlockStyle,
  type BlockType,
  generateBlockId,
} from "./block-schema"
import {
  CURRENT_TEMPLATE_SCHEMA_VERSION,
  type SlotBlocksMap,
  type TemplateSlotType,
} from "./template-schema"

export const MAX_BLOCK_TREE_DEPTH = 10
export const ALLOWED_SLOT_TYPES: TemplateSlotType[] = ["home", "post", "header", "footer"]

export const ALLOWED_BLOCK_TYPES: Set<BlockType> = new Set([
  // Layout
  "section",
  "container",
  "grid",
  "spacer",
  "divider",
  // Typography
  "heading",
  "text",
  "quote",
  "counter",
  // Media
  "image",
  "gallery",
  "video",
  "banner",
  "icon_box",
  // Interactive
  "button",
  "accordion",
  "tabs",
  "callout",
  // Blog & Dynamic
  "post_grid",
  "blog_post_grid",
  "author_box",
  "newsletter_box",
  "social_share",
  "post_content",
  "post_title",
  "post_meta",
  "post_cover",
  "post_takeaways",
  "post_action_bar",
  "comments_section",
  "category_filter",
  "site_navbar",
  "site_footer",
])

export interface ValidationResult<T> {
  isValid: boolean
  normalized: T
  errors: string[]
}

/**
 * Sanitizes a URL string to prevent javascript: or data: script injection attacks.
 */
export function sanitizeUrl(url?: string): string {
  if (!url || typeof url !== "string") return ""
  const trimmed = url.trim()
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:text/html")
  ) {
    return ""
  }
  return trimmed
}

/**
 * Sanitizes props dictionary, preventing dangerous protocols in URLs or malicious keys.
 */
export function sanitizeBlockProps(props: Record<string, any> = {}): Record<string, any> {
  if (typeof props !== "object" || props === null || Array.isArray(props)) {
    return {}
  }

  const cleanProps: Record<string, any> = {}
  for (const [key, val] of Object.entries(props)) {
    // Exclude prototype pollution or internal keys
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue
    }

    if (typeof val === "string") {
      if (key.toLowerCase().includes("url") || key.toLowerCase().includes("link") || key.toLowerCase().includes("src") || key.toLowerCase().includes("href")) {
        cleanProps[key] = sanitizeUrl(val)
      } else {
        cleanProps[key] = val
      }
    } else if (typeof val === "number" || typeof val === "boolean" || val === null) {
      cleanProps[key] = val
    } else if (Array.isArray(val)) {
      cleanProps[key] = val.slice(0, 100).map((item) => (typeof item === "string" ? item.slice(0, 500) : item))
    } else if (typeof val === "object") {
      cleanProps[key] = sanitizeBlockProps(val)
    }
  }

  return cleanProps
}

/**
 * Sanitizes block styles to ensure valid CSS values.
 */
export function sanitizeBlockStyle(style: Record<string, any> = {}): BlockStyle {
  if (typeof style !== "object" || style === null || Array.isArray(style)) {
    return {}
  }

  const cleanStyle: Record<string, any> = {}
  for (const [key, val] of Object.entries(style)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue
    }
    if (typeof val === "string") {
      // Prevent javascript expressions in css
      if (!val.toLowerCase().includes("expression(") && !val.toLowerCase().includes("javascript:")) {
        cleanStyle[key] = val.slice(0, 500)
      }
    } else if (typeof val === "number" || typeof val === "boolean") {
      cleanStyle[key] = val
    } else if (typeof val === "object" && val !== null) {
      cleanStyle[key] = sanitizeBlockStyle(val)
    }
  }

  return cleanStyle as BlockStyle
}

/**
 * Recursively validates and normalizes a single BlockNode and its children.
 */
export function validateAndNormalizeNode(
  rawNode: any,
  depth = 1,
  errors: string[] = []
): BlockNode | null {
  if (depth > MAX_BLOCK_TREE_DEPTH) {
    errors.push(`Profundidad máxima del árbol excedida (${MAX_BLOCK_TREE_DEPTH} niveles) en el nodo`)
    return null
  }

  if (typeof rawNode !== "object" || rawNode === null) {
    errors.push("Nodo de bloque inválido (no es un objeto)")
    return null
  }

  const rawType = rawNode.type
  if (!rawType || !ALLOWED_BLOCK_TYPES.has(rawType as BlockType)) {
    errors.push(`Tipo de bloque no permitido o desconocido: "${rawType}"`)
    return null
  }

  const nodeType = rawType as BlockType
  const id = typeof rawNode.id === "string" && rawNode.id.trim() ? rawNode.id.trim() : generateBlockId(nodeType.substring(0, 3))
  const name = typeof rawNode.name === "string" ? rawNode.name.slice(0, 100) : undefined
  const props = sanitizeBlockProps(rawNode.props)
  const style = sanitizeBlockStyle(rawNode.style)

  let responsiveStyles: BlockNode["responsiveStyles"]
  if (rawNode.responsiveStyles && typeof rawNode.responsiveStyles === "object") {
    responsiveStyles = {
      tablet: rawNode.responsiveStyles.tablet ? sanitizeBlockStyle(rawNode.responsiveStyles.tablet) : undefined,
      mobile: rawNode.responsiveStyles.mobile ? sanitizeBlockStyle(rawNode.responsiveStyles.mobile) : undefined,
    }
  }

  const children: BlockNode[] = []
  if (Array.isArray(rawNode.children)) {
    for (const rawChild of rawNode.children) {
      const normalizedChild = validateAndNormalizeNode(rawChild, depth + 1, errors)
      if (normalizedChild) {
        children.push(normalizedChild)
      }
    }
  }

  return {
    id,
    type: nodeType,
    name,
    props,
    style,
    responsiveStyles,
    children,
    locked: Boolean(rawNode.locked),
  }
}

/**
 * Validates and normalizes an array of BlockNodes representing a block tree.
 */
export function validateAndNormalizeBlockTree(
  rawNodes: unknown,
  depth = 1
): ValidationResult<BlockNode[]> {
  const errors: string[] = []

  if (!Array.isArray(rawNodes)) {
    return {
      isValid: false,
      normalized: [],
      errors: ["El árbol de bloques debe ser un arreglo de nodos"],
    }
  }

  const normalized: BlockNode[] = []
  for (const rawNode of rawNodes) {
    const validNode = validateAndNormalizeNode(rawNode, depth, errors)
    if (validNode) {
      normalized.push(validNode)
    }
  }

  return {
    isValid: errors.length === 0,
    normalized,
    errors,
  }
}

/**
 * Validates and normalizes a SlotBlocksMap containing slots ('home', 'post', 'header', 'footer').
 */
export function validateAndNormalizeSlotMap(
  rawSlots: unknown
): ValidationResult<SlotBlocksMap> {
  const errors: string[] = []
  const normalized: SlotBlocksMap = {}

  if (typeof rawSlots !== "object" || rawSlots === null || Array.isArray(rawSlots)) {
    return {
      isValid: false,
      normalized: {},
      errors: ["El mapa de slots debe ser un objeto"],
    }
  }

  const entries = Object.entries(rawSlots)
  for (const [slotKey, rawBlocks] of entries) {
    if (!ALLOWED_SLOT_TYPES.includes(slotKey as TemplateSlotType)) {
      errors.push(`Slot no reconocido: "${slotKey}". Slots admitidos: ${ALLOWED_SLOT_TYPES.join(", ")}`)
      continue
    }

    const slotType = slotKey as TemplateSlotType
    const result = validateAndNormalizeBlockTree(rawBlocks, 1)
    normalized[slotType] = result.normalized

    if (!result.isValid) {
      errors.push(...result.errors.map((err) => `[Slot ${slotType}]: ${err}`))
    }
  }

  return {
    isValid: errors.length === 0,
    normalized,
    errors,
  }
}

/**
 * Migration pipeline for template schema versions.
 * Evolves older AST versions into CURRENT_TEMPLATE_SCHEMA_VERSION ("1.0").
 */
export function migrateTemplateSchema(
  raw: unknown,
  fromVersion?: string
): SlotBlocksMap {
  const currentVersion = fromVersion || CURRENT_TEMPLATE_SCHEMA_VERSION
  if (currentVersion === CURRENT_TEMPLATE_SCHEMA_VERSION) {
    const { normalized } = validateAndNormalizeSlotMap(raw)
    return normalized
  }

  // Future migrations can be placed here (e.g., if fromVersion === "0.9")
  const { normalized } = validateAndNormalizeSlotMap(raw)
  return normalized
}
