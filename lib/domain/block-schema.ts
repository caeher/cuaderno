/**
 * Domain Layer — Block Schema & Visual Designer Tree Definitions
 *
 * Defines the AST (Abstract Syntax Tree), block types, styles, responsive
 * configurations, and pure immutable tree transformation utilities for the
 * Elementor-style visual block designer.
 */

export type BlockCategory = "layout" | "typography" | "media" | "interactive" | "blog"

export type BlockType =
  // Layout
  | "section"
  | "container"
  | "grid"
  | "spacer"
  | "divider"
  // Typography
  | "heading"
  | "text"
  | "quote"
  | "counter"
  // Media
  | "image"
  | "gallery"
  | "video"
  | "banner"
  | "icon_box"
  // Interactive
  | "button"
  | "accordion"
  | "tabs"
  | "callout"
  // Blog & Dynamic
  | "post_grid"
  | "author_box"
  | "newsletter_box"
  | "social_share"

export interface SpacingValue {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

export interface BorderRadiusValue {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

export interface BlockStyle {
  // Typography
  fontFamily?: string
  fontSize?: string
  fontWeight?: string | number
  lineHeight?: string
  letterSpacing?: string
  color?: string
  textAlign?: "left" | "center" | "right" | "justify"
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"

  // Background
  backgroundColor?: string
  backgroundImage?: string
  backgroundGradient?: string
  backgroundSize?: "cover" | "contain" | "auto"
  backgroundPosition?: string
  backgroundRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y"

  // Spacing & Sizing
  padding?: SpacingValue
  margin?: SpacingValue
  width?: string
  maxWidth?: string
  minHeight?: string

  // Borders & Shadows
  borderRadius?: string | BorderRadiusValue
  borderWidth?: string
  borderColor?: string
  borderStyle?: "none" | "solid" | "dashed" | "dotted" | "double"
  boxShadow?: string
  opacity?: number
  overflow?: "visible" | "hidden" | "clip" | "scroll" | "auto"

  // Layout & Flex/Grid
  display?: "block" | "flex" | "grid"
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse"
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around"
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch"
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  gap?: string
  gridColumns?: number | string

  // Advanced & Animations
  customCss?: string
  customClass?: string
  animation?: "none" | "fadeIn" | "slideUp" | "zoomIn" | "bounceIn"
  hideOnDesktop?: boolean
  hideOnTablet?: boolean
  hideOnMobile?: boolean
  zIndex?: number
}

export interface BlockNode {
  id: string
  type: BlockType
  name?: string
  props: Record<string, any>
  style?: BlockStyle
  responsiveStyles?: {
    tablet?: Partial<BlockStyle>
    mobile?: Partial<BlockStyle>
  }
  children?: BlockNode[]
  locked?: boolean
}

export interface WidgetMeta {
  type: BlockType
  name: string
  description: string
  category: BlockCategory
  icon: string
  defaultProps: Record<string, any>
  defaultStyle: BlockStyle
  defaultChildren?: () => BlockNode[]
}

/**
 * Generate a clean unique ID for block elements
 */
export function generateBlockId(prefix = "b"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36).slice(-4)}`
}

/**
 * Create a new BlockNode with default values
 */
export function createBlockNode(
  type: BlockType,
  props: Record<string, any> = {},
  style: BlockStyle = {},
  children?: BlockNode[]
): BlockNode {
  return {
    id: generateBlockId(type.substring(0, 3)),
    type,
    props,
    style,
    children: children ?? [],
  }
}

/**
 * Deep search for a block by ID in a block tree
 */
export function findBlockById(nodes: BlockNode[], id: string): BlockNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children && node.children.length > 0) {
      const found = findBlockById(node.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * Find parent node and index of a target block
 */
export function findParentBlock(
  nodes: BlockNode[],
  id: string,
  parent: BlockNode | null = null
): { parent: BlockNode | null; index: number; siblings: BlockNode[] } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { parent, index: i, siblings: nodes }
    }
    if (nodes[i].children && nodes[i].children!.length > 0) {
      const res = findParentBlock(nodes[i].children!, id, nodes[i])
      if (res) return res
    }
  }
  return null
}

/**
 * Immutably update a block in the tree by ID
 */
export function updateBlockById(
  nodes: BlockNode[],
  id: string,
  updater: (node: BlockNode) => BlockNode
): BlockNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return updater({ ...node })
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateBlockById(node.children, id, updater),
      }
    }
    return node
  })
}

/**
 * Clone a block and generate fresh IDs recursively
 */
export function cloneBlockWithNewIds(node: BlockNode): BlockNode {
  return {
    ...node,
    id: generateBlockId(node.type.substring(0, 3)),
    children: node.children ? node.children.map(cloneBlockWithNewIds) : [],
  }
}

/**
 * Immutably duplicate a block next to itself
 */
export function duplicateBlockById(nodes: BlockNode[], id: string): BlockNode[] {
  const targetInfo = findParentBlock(nodes, id)
  if (!targetInfo) return nodes

  const original = findBlockById(nodes, id)
  if (!original) return nodes

  const duplicated = cloneBlockWithNewIds(original)

  const insertAfter = (list: BlockNode[]): BlockNode[] => {
    const res: BlockNode[] = []
    for (const item of list) {
      res.push(
        item.children && item.children.length > 0
          ? { ...item, children: insertAfter(item.children) }
          : item
      )
      if (item.id === id) {
        res.push(duplicated)
      }
    }
    return res
  }

  return insertAfter(nodes)
}

/**
 * Immutably delete a block from the tree by ID
 */
export function deleteBlockById(nodes: BlockNode[], id: string): BlockNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteBlockById(node.children, id),
        }
      }
      return node
    })
}

/**
 * Immutably move a block to a new position relative to target
 */
export function moveBlock(
  nodes: BlockNode[],
  sourceId: string,
  targetId: string,
  position: "before" | "after" | "inside" = "after"
): BlockNode[] {
  const sourceNode = findBlockById(nodes, sourceId)
  if (!sourceNode || sourceId === targetId) return nodes

  // Remove source first
  const cleanTree = deleteBlockById(nodes, sourceId)

  // Insert into target position
  return insertBlock(cleanTree, sourceNode, targetId, position)
}

/**
 * Insert a block into the tree relative to a target ID or at root level
 */
export function insertBlock(
  nodes: BlockNode[],
  newBlock: BlockNode,
  targetId?: string,
  position: "before" | "after" | "inside" = "after"
): BlockNode[] {
  if (!targetId) {
    return [...nodes, newBlock]
  }

  const insertRecursive = (list: BlockNode[]): BlockNode[] => {
    const result: BlockNode[] = []

    for (const item of list) {
      if (item.id === targetId) {
        if (position === "before") {
          result.push(newBlock)
          result.push(item)
        } else if (position === "after") {
          result.push(item)
          result.push(newBlock)
        } else if (position === "inside") {
          result.push({
            ...item,
            children: [...(item.children || []), newBlock],
          })
        }
      } else {
        if (item.children && item.children.length > 0) {
          result.push({
            ...item,
            children: insertRecursive(item.children),
          })
        } else {
          result.push(item)
        }
      }
    }

    return result
  }

  return insertRecursive(nodes)
}

/**
 * Serialize block tree to JSON string
 */
export function serializeBlockTree(nodes: BlockNode[]): string {
  try {
    return JSON.stringify(nodes, null, 2)
  } catch {
    return "[]"
  }
}

/**
 * Deserialize JSON string to block tree
 */
export function deserializeBlockTree(jsonStr?: string | null): BlockNode[] {
  if (!jsonStr || typeof jsonStr !== "string" || !jsonStr.trim()) {
    return []
  }
  try {
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
