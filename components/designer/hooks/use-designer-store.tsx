"use client"

import * as React from "react"
import type { BlockNode, BlockStyle, BlockType } from "@/lib/domain/block-schema"
import {
  createBlockNode,
  deleteBlockById,
  deserializeBlockTree,
  duplicateBlockById,
  findBlockById,
  insertBlock,
  moveBlock as moveBlockInTree,
  serializeBlockTree,
  updateBlockById,
} from "@/lib/domain/block-schema"
import {
  getDefaultFooterSlotBlocks,
  getDefaultHeaderSlotBlocks,
  getDefaultHomeSlotBlocks,
  getDefaultPostSlotBlocks,
  TEMPLATE_KITS,
} from "@/lib/designer/template-kits"
import { WIDGET_DEFINITIONS } from "@/lib/designer/widget-definitions"
import type {
  SlotBlocksMap,
  TemplateSlotType,
  TenantTemplate,
  TenantTemplateSettings,
} from "@/lib/domain/template-schema"

export type DeviceMode = "desktop" | "tablet" | "mobile"
export type DesignerTab = "widgets" | "inspector" | "navigator" | "templates" | "globals"
export type InspectorSubTab = "content" | "style" | "advanced"

export interface DesignerState {
  activeSlot: TemplateSlotType
  draftSlots: SlotBlocksMap
  settings: TenantTemplateSettings
  blocks: BlockNode[]
  selectedBlockId: string | null
  hoverBlockId: string | null
  activeTab: DesignerTab
  inspectorSubTab: InspectorSubTab
  device: DeviceMode
  isPreviewMode: boolean
  zoom: number
  canUndo: boolean
  canRedo: boolean
}

export interface DesignerActions {
  setActiveSlot: (slot: TemplateSlotType) => void
  setBlocks: (blocks: BlockNode[]) => void
  addBlock: (type: BlockType, targetId?: string, position?: "before" | "after" | "inside") => void
  insertTemplate: (templateId: string, targetId?: string) => void
  updateBlockProps: (id: string, newProps: Record<string, any>) => void
  updateBlockStyle: (id: string, newStyle: Partial<BlockStyle>) => void
  updateBlockName: (id: string, name: string) => void
  deleteBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  moveBlock: (sourceId: string, targetId: string, position?: "before" | "after" | "inside") => void
  selectBlock: (id: string | null) => void
  setHoverBlock: (id: string | null) => void
  setActiveTab: (tab: DesignerTab) => void
  setInspectorSubTab: (subTab: InspectorSubTab) => void
  setDevice: (device: DeviceMode) => void
  setZoom: (zoom: number) => void
  togglePreviewMode: () => void
  undo: () => void
  redo: () => void
  getSelectedBlock: () => BlockNode | null
  updateTemplateSettings: (newSettings: Partial<TenantTemplateSettings>) => void
  resetCurrentSlotToDefault: () => void
  getAllDraftSlots: () => SlotBlocksMap
}

export type DesignerStore = DesignerState & DesignerActions

const DesignerContext = React.createContext<DesignerStore | null>(null)

export interface DesignerProviderProps {
  initialTemplate?: TenantTemplate | null
  initialSlot?: TemplateSlotType
  initialBlocks?: BlockNode[] | string | null // For backwards-compat or isolated previews
  children: React.ReactNode
}

function getSlotFallback(slot: TemplateSlotType): BlockNode[] {
  switch (slot) {
    case "home":
      return getDefaultHomeSlotBlocks()
    case "post":
      return getDefaultPostSlotBlocks()
    case "header":
      return getDefaultHeaderSlotBlocks()
    case "footer":
      return getDefaultFooterSlotBlocks()
  }
}

export function DesignerProvider({
  initialTemplate,
  initialSlot = "home",
  initialBlocks,
  children,
}: DesignerProviderProps) {
  // Initialize slots map with defaults if missing
  const initialSlotsMap = React.useMemo<SlotBlocksMap>(() => {
    const rawDraft = initialTemplate?.draftSlots || {}

    return {
      home:
        rawDraft.home && rawDraft.home.length > 0
          ? rawDraft.home
          : initialBlocks
          ? typeof initialBlocks === "string"
            ? deserializeBlockTree(initialBlocks)
            : initialBlocks
          : getDefaultHomeSlotBlocks(),
      post:
        rawDraft.post && rawDraft.post.length > 0
          ? rawDraft.post
          : getDefaultPostSlotBlocks(),
      header:
        rawDraft.header && rawDraft.header.length > 0
          ? rawDraft.header
          : getDefaultHeaderSlotBlocks(),
      footer:
        rawDraft.footer && rawDraft.footer.length > 0
          ? rawDraft.footer
          : getDefaultFooterSlotBlocks(),
    }
  }, [initialTemplate, initialBlocks])

  // Active Slot State
  const [activeSlot, setActiveSlotState] = React.useState<TemplateSlotType>(initialSlot)
  const [draftSlots, setDraftSlots] = React.useState<SlotBlocksMap>(initialSlotsMap)
  const [settings, setSettings] = React.useState<TenantTemplateSettings>(
    initialTemplate?.settings || { primaryColor: "#3b82f6", containerMaxWidth: "1100px" }
  )

  // Current slot's active blocks
  const [blocks, setBlocksState] = React.useState<BlockNode[]>(
    initialSlotsMap[initialSlot] || getSlotFallback(initialSlot)
  )

  // Undo/Redo History for the active slot
  const [history, setHistory] = React.useState<BlockNode[][]>([
    initialSlotsMap[initialSlot] || getSlotFallback(initialSlot),
  ])
  const [historyIndex, setHistoryIndex] = React.useState(0)

  // UI Selection & Panels
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null)
  const [hoverBlockId, setHoverBlockId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<DesignerTab>("widgets")
  const [inspectorSubTab, setInspectorSubTab] = React.useState<InspectorSubTab>("content")
  const [device, setDevice] = React.useState<DeviceMode>("desktop")
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)
  const [zoom, setZoom] = React.useState(100)

  // Commit changes to history & sync into draftSlots
  const pushToHistory = React.useCallback(
    (newTree: BlockNode[]) => {
      setBlocksState(newTree)
      setDraftSlots((prev) => ({
        ...prev,
        [activeSlot]: newTree,
      }))
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1)
        return [...next, newTree]
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [activeSlot, historyIndex]
  )

  // Slot Switching
  const setActiveSlot = React.useCallback(
    (slot: TemplateSlotType) => {
      if (slot === activeSlot) return

      // Save current blocks to draftSlots
      setDraftSlots((prev) => ({
        ...prev,
        [activeSlot]: blocks,
      }))

      const nextBlocks = draftSlots[slot] || getSlotFallback(slot)
      setActiveSlotState(slot)
      setBlocksState(nextBlocks)
      setHistory([nextBlocks])
      setHistoryIndex(0)
      setSelectedBlockId(null)
      setActiveTab("widgets")
    },
    [activeSlot, blocks, draftSlots]
  )

  const undo = React.useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      const prevBlocks = history[prevIndex]
      setHistoryIndex(prevIndex)
      setBlocksState(prevBlocks)
      setDraftSlots((prev) => ({
        ...prev,
        [activeSlot]: prevBlocks,
      }))
    }
  }, [activeSlot, history, historyIndex])

  const redo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      const nextBlocks = history[nextIndex]
      setHistoryIndex(nextIndex)
      setBlocksState(nextBlocks)
      setDraftSlots((prev) => ({
        ...prev,
        [activeSlot]: nextBlocks,
      }))
    }
  }, [activeSlot, history, historyIndex])

  const selectBlock = React.useCallback((id: string | null) => {
    setSelectedBlockId(id)
    if (id) {
      setActiveTab("inspector")
    }
  }, [])

  const addBlock = React.useCallback(
    (type: BlockType, targetId?: string, position: "before" | "after" | "inside" = "after") => {
      const widget = WIDGET_DEFINITIONS[type]
      if (!widget) return

      const defaultChildren = widget.defaultChildren ? widget.defaultChildren() : []
      const newBlock = createBlockNode(type, { ...widget.defaultProps }, { ...widget.defaultStyle }, defaultChildren)

      const updated = insertBlock(blocks, newBlock, targetId, position)
      pushToHistory(updated)
      selectBlock(newBlock.id)
    },
    [blocks, pushToHistory, selectBlock]
  )

  const insertTemplate = React.useCallback(
    (templateId: string, targetId?: string) => {
      const template = TEMPLATE_KITS.find((t) => t.id === templateId)
      if (!template) return

      const newBlocks = template.createBlocks()
      let updated = [...blocks]
      for (const block of newBlocks) {
        updated = insertBlock(updated, block, targetId, "after")
      }
      pushToHistory(updated)
      if (newBlocks[0]) {
        selectBlock(newBlocks[0].id)
      }
    },
    [blocks, pushToHistory, selectBlock]
  )

  const updateBlockProps = React.useCallback(
    (id: string, newProps: Record<string, any>) => {
      const updated = updateBlockById(blocks, id, (node) => ({
        ...node,
        props: { ...node.props, ...newProps },
      }))
      pushToHistory(updated)
    },
    [blocks, pushToHistory]
  )

  const updateBlockStyle = React.useCallback(
    (id: string, newStyle: Partial<BlockStyle>) => {
      const updated = updateBlockById(blocks, id, (node) => ({
        ...node,
        style: { ...node.style, ...newStyle },
      }))
      pushToHistory(updated)
    },
    [blocks, pushToHistory]
  )

  const updateBlockName = React.useCallback(
    (id: string, name: string) => {
      const updated = updateBlockById(blocks, id, (node) => ({
        ...node,
        name,
      }))
      pushToHistory(updated)
    },
    [blocks, pushToHistory]
  )

  const deleteBlock = React.useCallback(
    (id: string) => {
      const updated = deleteBlockById(blocks, id)
      pushToHistory(updated)
      if (selectedBlockId === id) {
        setSelectedBlockId(null)
        setActiveTab("widgets")
      }
    },
    [blocks, pushToHistory, selectedBlockId]
  )

  const duplicateBlock = React.useCallback(
    (id: string) => {
      const updated = duplicateBlockById(blocks, id)
      pushToHistory(updated)
    },
    [blocks, pushToHistory]
  )

  const moveBlock = React.useCallback(
    (sourceId: string, targetId: string, position: "before" | "after" | "inside" = "after") => {
      const updated = moveBlockInTree(blocks, sourceId, targetId, position)
      pushToHistory(updated)
    },
    [blocks, pushToHistory]
  )

  const getSelectedBlock = React.useCallback((): BlockNode | null => {
    if (!selectedBlockId) return null
    return findBlockById(blocks, selectedBlockId)
  }, [blocks, selectedBlockId])

  const togglePreviewMode = React.useCallback(() => {
    setIsPreviewMode((prev) => !prev)
  }, [])

  const setBlocks = React.useCallback(
    (newTree: BlockNode[]) => {
      pushToHistory(newTree)
    },
    [pushToHistory]
  )

  const updateTemplateSettings = React.useCallback((newSettings: Partial<TenantTemplateSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const resetCurrentSlotToDefault = React.useCallback(() => {
    const fallback = getSlotFallback(activeSlot)
    pushToHistory(fallback)
  }, [activeSlot, pushToHistory])

  const getAllDraftSlots = React.useCallback((): SlotBlocksMap => {
    return {
      ...draftSlots,
      [activeSlot]: blocks,
    }
  }, [activeSlot, blocks, draftSlots])

  const value: DesignerStore = {
    activeSlot,
    draftSlots,
    settings,
    blocks,
    selectedBlockId,
    hoverBlockId,
    activeTab,
    inspectorSubTab,
    device,
    isPreviewMode,
    zoom,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    setActiveSlot,
    setBlocks,
    addBlock,
    insertTemplate,
    updateBlockProps,
    updateBlockStyle,
    updateBlockName,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    selectBlock,
    setHoverBlock: setHoverBlockId,
    setActiveTab,
    setInspectorSubTab,
    setDevice,
    setZoom,
    togglePreviewMode,
    undo,
    redo,
    getSelectedBlock,
    updateTemplateSettings,
    resetCurrentSlotToDefault,
    getAllDraftSlots,
  }

  return <DesignerContext.Provider value={value}>{children}</DesignerContext.Provider>
}

export function useDesigner(): DesignerStore {
  const context = React.useContext(DesignerContext)
  if (!context) {
    throw new Error("useDesigner must be used within a DesignerProvider")
  }
  return context
}
