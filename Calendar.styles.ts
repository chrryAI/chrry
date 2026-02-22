/**
 * Generated from Calendar.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const CalendarStyleDefs = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100dvh",
  },
  loading: {
    position: "relative",
    bottom: 100,
  },
  dateButton: {
    base: {
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      width: 24,
      height: 24,
      border: "none",
      fontSize: 14,
      fontFamily: "var(--font-mono)",
      fontWeight: 500,
    },
    hover: {
      backgroundColor: "var(--accent-6)",
    },
  },
  dateHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    alignItems: "space-between",
    justifyContent: "space-between",
    padding: "0 0 0 5px",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  toolbarSection: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  toolbarLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rbcAgendaDateCell: {
    backgroundColor: "var(--background-secondary)",
    borderRight: "1px solid var(--border)",
    padding: 12,
    fontWeight: 600,
  },
  rbcAgendaTimeCell: {
    backgroundColor: "var(--background-secondary)",
    borderRight: "1px solid var(--border)",
    padding: 12,
    fontSize: 12,
  },
  rbcAgendaEventCell: {
    padding: 12,
    borderBottom: "1px solid var(--shade-2)",
  },
  rbcAddonsDndDragPreview: {
    backgroundColor: "var(--primary)",
    border: "2px solid var(--primary-dark)",
    borderRadius: 4,
    opacity: 0.8,
    transform: "rotate(5deg)",
  },
  rbcAddonsDndOver: {
    backgroundColor: "var(--primary-light)",
    border: "2px dashed var(--primary) !important",
  },
  rbcAddonsDndDragRow: {
    borderLeft: "4px solid var(--primary)",
    backgroundColor: "var(--primary-light)",
  },
  rbcAddonsDndResizeNsAnchor: {
    backgroundColor: "var(--primary)",
    border: "1px solid var(--primary-dark)",
  },
  rbcAddonsDndResizeEwAnchor: {
    backgroundColor: "var(--primary)",
    border: "1px solid var(--primary-dark)",
  },
  calendarPurple: {
    backgroundColor: "#863dcf",
  },
  calendarRed: {
    backgroundColor: "#dd2f2f",
  },
  calendarOrange: {
    backgroundColor: "#f5a623",
  },
  calendarBlue: {
    backgroundColor: "#197ef4",
  },
  calendarGreen: {
    backgroundColor: "#58aa11",
  },
  calendarViolet: {
    backgroundColor: "#f832e7",
  },
  calendarRbcOffRange: {
    backgroundColor: "var(--background-disabled)",
    color: "var(--text-disabled)",
  },
  calendarLoading: {
    opacity: 0.6,
  },
  viewButtons: {
    display: "flex",
    gap: 4,
  },
  viewButtonsActive: {
    backgroundColor: "var(--primary)",
    color: "white",
    borderColor: "var(--primary)",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const CalendarStyles = createUnifiedStyles(CalendarStyleDefs)

// Type for the hook return value
type CalendarStylesHook = {
  [K in keyof typeof CalendarStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useCalendarStyles =
  createStyleHook<CalendarStylesHook>(CalendarStyles)
