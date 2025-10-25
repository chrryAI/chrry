/**
 * Generated from Instructions.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const InstructionsStyleDefs = {
  instructionsTextarea: {
    minHeight: 200,
    borderStyle: "dashed",
    fontSize: 15,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginLeft: "auto",
  },
  modal: {
    width: "100%",
    margin: "0 auto !important",
    maxWidth: 600,
  },
  instructionText: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  updateModalDescription: {
    width: "100%",
  },
  video: {
    width: 30,
    height: 30,
    borderRadius: "50%",
  },
  updateModalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  titleField: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    flex: 1,
  },
  footer: {
    marginTop: 10,
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  bottom: {
    display: "flex",
    fontSize: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  tip: {
    color: "var(--shade-8)",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  maxCharCount: {
    color: "var(--accent-4)",
    fontSize: 11,
    fontWeight: "normal",
  },
  maxCharCountOrange: {
    color: "var(--accent-1)",
  },
  maxCharCountRed: {
    color: "var(--accent-0)",
  },
  right: {
    marginLeft: "auto",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  instructionsContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    alignItems: "center",
    gap: 3,
  },
  instructionsButtonContainer: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  instructionsButton: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  instructionsButtonIcon: {
    gap: 0,
  },
  instructions: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  installAppButton: {},
  installAppButtonStandalone: {
    display: "none",
  },
  installButton: {},
  instruction: {
    display: "none",
    alignItems: "center",
    gap: 5,
    color: "var(--shade-7)",
    fontSize: 14,
    textAlign: "center",
    maxWidth: "100%",
  },
  instructionSelected: {
    color: "var(--accent-6)",
  },
  instructionEmoji: {
    flexShrink: 0,
  },
  instructionTitle: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
  },
  filePreview: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    backgroundColor: "var(--shade-0)",
    border: "1px solid var(--shade-2)",
    borderRadius: 12,
    fontSize: 14,
    color: "var(--accent-6)",
  },
  filePreviewArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "var(--shade-1)",
    border: "1px solid var(--shade-2)",
    margin: "12px 0 0 0",
    borderRadius: 16,
  },
  filePreviewImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "var(--shade-2)",
  },
  fileUploader: {
    display: "flex",
    gap: 5,
    marginTop: 10,
  },
  maxFiles: {
    color: "var(--accent-1)",
    fontSize: 12,
  },
  filePreviewIcon: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--shade-2)",
    borderRadius: 4,
    color: "var(--accent-5)",
  },
  filePreviewInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  filePreviewName: {
    fontWeight: 500,
    fontSize: 13,
    maxWidth: 80,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  filePreviewSize: {
    fontSize: 11,
    color: "var(--accent-4)",
  },
  filePreviewClear: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: "50%",
    color: "var(--accent-0)",
    border: "2px solid var(--shade-0)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const InstructionsStyles = createUnifiedStyles(InstructionsStyleDefs)

// Type for the hook return value
type InstructionsStylesHook = {
  [K in keyof typeof InstructionsStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useInstructionsStyles =
  createStyleHook<InstructionsStylesHook>(InstructionsStyles)
