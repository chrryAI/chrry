/**
 * Generated from EventModal.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const EventModalStyleDefs = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    backgroundColor: "var(--background)",
    border: "1px solid var(--shade-2)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    width: "100%",
    maxWidth: 500,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid var(--shade-2)",
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    color: "var(--text-primary)",
  },
  closeButton: {
    base: {
      backgroundColor: "none",
      border: "none",
      color: "var(--text-secondary)",
      padding: 4,
      borderRadius: "var(--radius)",
    },
    hover: {
      backgroundColor: "var(--shade-1)",
      color: "var(--text-primary)",
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  fieldIcon: {
    color: "var(--text-secondary)",
    flexShrink: 0,
  },
  titleInput: {
    flex: 1,
    width: "100%",
  },
  input: {
    flex: 1,
    backgroundColor: "var(--shade-1)",
    border: "1px solid var(--shade-2)",
    borderRadius: "var(--radius)",
    padding: "12px 16px",
    fontSize: 14,
    color: "var(--text-primary)",
  },
  descriptionEdit: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
    width: "100%",
  },
  descriptionEditButton: {
    alignSelf: "flex-start",
  },
  textarea: {
    minHeight: 120,
    width: "100%",
  },
  descriptionView: {
    width: "100%",
    minHeight: 80,
    color: "var(--text)",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  allDayToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    width: 16,
    height: 16,
    fontSize: 14,
    color: "var(--text-primary)",
  },
  dateTimeSectionField: {
    alignItems: "center",
  },
  dateTimeGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-secondary)",
  },
  dateTimeInput: {
    marginLeft: "auto",
    fontFamily: "var(--font-mono)",
    fontSize: 14,
  },
  error: {
    color: "var(--accent-0)",
    fontSize: 12,
  },
  fieldWrapperError: {
    textAlign: "right",
    marginTop: 5,
  },
  colorSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  colorLabel: {
    fontSize: 14,
    color: "var(--text-primary)",
    minWidth: 40,
  },
  colorOptions: {
    display: "flex",
  },
  colorOption: {
    base: {},
    hover: {
      transform: "scale(1.15)",
    },
  },
  colorOptionSelected: {
    borderColor: "var(--foreground)",
    transform: "scale(1.3)",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 10,
    borderTop: "1px solid var(--shade-2)",
    flexWrap: "wrap",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const EventModalStyles = createUnifiedStyles(EventModalStyleDefs)

// Type for the hook return value
type EventModalStylesHook = {
  [K in keyof typeof EventModalStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useEventModalStyles =
  createStyleHook<EventModalStylesHook>(EventModalStyles)
