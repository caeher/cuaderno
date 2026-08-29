import * as React from "react"
import type { BlockStyle, SpacingValue } from "@/lib/domain/block-schema"

export function formatSpacing(spacing?: SpacingValue): string | undefined {
  if (!spacing) return undefined
  const t = spacing.top || "0px"
  const r = spacing.right || "0px"
  const b = spacing.bottom || "0px"
  const l = spacing.left || "0px"
  return `${t} ${r} ${b} ${l}`
}

export function blockStyleToCss(style?: BlockStyle): React.CSSProperties {
  if (!style) return {}

  const css: React.CSSProperties = {}

  if (style.fontFamily) css.fontFamily = style.fontFamily
  if (style.fontSize) css.fontSize = style.fontSize
  if (style.fontWeight) css.fontWeight = style.fontWeight
  if (style.lineHeight) css.lineHeight = style.lineHeight
  if (style.letterSpacing) css.letterSpacing = style.letterSpacing
  if (style.color) css.color = style.color
  if (style.textAlign) css.textAlign = style.textAlign
  if (style.textTransform) css.textTransform = style.textTransform

  if (style.backgroundColor) css.backgroundColor = style.backgroundColor
  if (style.backgroundImage) css.backgroundImage = `url(${style.backgroundImage})`
  if (style.backgroundGradient) css.backgroundImage = style.backgroundGradient
  if (style.backgroundSize) css.backgroundSize = style.backgroundSize
  if (style.backgroundPosition) css.backgroundPosition = style.backgroundPosition

  if (style.padding) {
    css.paddingTop = style.padding.top
    css.paddingRight = style.padding.right
    css.paddingBottom = style.padding.bottom
    css.paddingLeft = style.padding.left
  }

  if (style.margin) {
    css.marginTop = style.margin.top
    css.marginRight = style.margin.right
    css.marginBottom = style.margin.bottom
    css.marginLeft = style.margin.left
  }

  if (style.width) css.width = style.width
  if (style.maxWidth) css.maxWidth = style.maxWidth
  if (style.minHeight) css.minHeight = style.minHeight

  if (style.borderRadius) {
    if (typeof style.borderRadius === "string") {
      css.borderRadius = style.borderRadius
    } else {
      css.borderTopLeftRadius = style.borderRadius.top
      css.borderTopRightRadius = style.borderRadius.right
      css.borderBottomRightRadius = style.borderRadius.bottom
      css.borderBottomLeftRadius = style.borderRadius.left
    }
  }

  if (style.borderWidth) css.borderWidth = style.borderWidth
  if (style.borderColor) css.borderColor = style.borderColor
  if (style.borderStyle) css.borderStyle = style.borderStyle
  if (style.boxShadow) css.boxShadow = style.boxShadow
  if (typeof style.opacity === "number") css.opacity = style.opacity
  if (style.overflow) css.overflow = style.overflow

  if (style.display) css.display = style.display
  if (style.flexDirection) css.flexDirection = style.flexDirection
  if (style.justifyContent) css.justifyContent = style.justifyContent
  if (style.alignItems) css.alignItems = style.alignItems
  if (style.flexWrap) css.flexWrap = style.flexWrap
  if (style.gap) css.gap = style.gap

  if (style.gridColumns) {
    css.gridTemplateColumns =
      typeof style.gridColumns === "number" ? `repeat(${style.gridColumns}, minmax(0, 1fr))` : style.gridColumns
  }

  return css
}
