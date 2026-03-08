/**
 * Generated from MoodReports.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const MoodReportsStyleDefs = {
  moodReports: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minWidth: 320,
    padding: "0 20px 200px 20px",
    margin: "0 auto",
    maxWidth: 500,
    fontSize: 13,
  },
  title: {
    display: "flex",
    flexDirection: "row",
    marginTop: 0,
    marginBottom: 15,
    alignItems: "center",
  },
  close: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 13,
  },
  toggleDemo: {
    fontSize: 12,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 130,
  },
  demo: {
    fontSize: 11,
    position: "relative",
    top: 2,
    left: 4,
  },
  navigation: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    marginTop: 15,
    justifyContent: "flex-end",
    marginRight: 10,
  },
  link: {
    display: "inline-flex",
  },
  cookieConsent: {
    margin: "0px 0 20px 0",
  },
  dailyMoods: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  next: {
    display: "inline-flex",
  },
  previous: {
    display: "inline-flex",
  },
  dayMood: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  dayName: {
    fontSize: 13,
    color: "var(--shade-6)",
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodEmojiWindows: {},
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const MoodReportsStyles = createUnifiedStyles(MoodReportsStyleDefs)

// Type for the hook return value
type MoodReportsStylesHook = {
  [K in keyof typeof MoodReportsStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useMoodReportsStyles =
  createStyleHook<MoodReportsStylesHook>(MoodReportsStyles)
