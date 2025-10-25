/**
 * Generated from Img.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ImgStyleDefs = {
  errorMessage: {
    padding: 0,
    fontSize: 12,
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingPlaceholder: {
    display: "flex",
    minHeight: 200,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    flexGrow: 0,
    flexShrink: 0,
  },
  img: {
    flexGrow: 0,
    flexShrink: 0,
    display: "flex",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const ImgStyles = createUnifiedStyles(ImgStyleDefs)

// Type for the hook return value
type ImgStylesHook = {
  [K in keyof typeof ImgStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useImgStyles = createStyleHook<ImgStylesHook>(ImgStyles)
