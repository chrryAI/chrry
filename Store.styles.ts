/**
 * Generated from Store.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const StoreStyleDefs = {
  lifeOS: {
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    marginTop: 10,
    marginBottom: 30,
    padding: 5,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    gap: 10,
    margin: 0,
    marginBottom: 5,
    flex: 1,
    textAlign: "center",
  },
  intro: {
    textAlign: "center",
    fontSize: 14,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  createAgent: {
    display: "flex",
    justifyContent: "center",
    position: "relative",
    bottom: 10,
  },
  apps: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    justifyContent: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },
  tryItNow: {
    marginLeft: "auto",
    fontSize: 14,
  },
  appTitle: {
    display: "flex",
    margin: "0 0 10px 0",
    fontSize: 20,
  },
  titleText: {
    gap: 5,
    textAlign: "center",
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  headerIcons: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  app: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    gap: 10,
    outline: "1px dashed var(--shade-2)",
    padding: 10,
    paddingTop: 13,
    borderRadius: 20,
    minWidth: "initial",
    flex: 1,
  },
  appImage: {
    maxWidth: 80,
    maxHeight: 80,
  },
  appSelected: {
    outline: "3px solid var(--accent-5)",
    backgroundColor: "var(--shade-1)",
  },
  appLarge: {
    flex: "inherit",
    minWidth: 130,
  },
  appLast: {
    alignSelf: "flex-start",
    flex: 1,
  },
  appInfo: {
    flexDirection: "column",
    gap: 2,
    display: "none",
  },
  appName: {
    fontSize: 15,
    fontWeight: 600,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--shade-7)",
  },
  appSubtitle: {
    fontSize: 12,
    color: "var(--shade-5)",
    textAlign: "center",
    fontWeight: 400,
    maxWidth: 115,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  badge: {
    bottom: 1,
    right: 1,
    backgroundColor: "var(--accent-1)",
    color: "var(--shade-8)",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 10,
    display: "none",
  },
  badgeInProgress: {
    backgroundColor: "var(--accent-5)",
  },
  badgePlanned: {
    backgroundColor: "var(--shade-3)",
  },
  footer: {
    padding: 15,
    backgroundColor: "var(--shade-1)",
    borderRadius: 20,
    border: "1px dashed var(--shade-2)",
  },
  appDetails: {
    margin: "0 0 10px 0",
    fontSize: 24,
    fontWeight: 600,
  },
  subtitle: {
    margin: "0 0 5px 0",
    color: "var(--accent-1)",
    fontWeight: 500,
    fontSize: 16,
  },
  description: {
    margin: "0 0 20px 0",
    lineHeight: 1.6,
    color: "var(--shade-7)",
    fontSize: 15,
  },
  featuresUl: {
    display: "flex",
    gap: 10,
    margin: 0,
    padding: 0,
  },
  featuresH4: {
    margin: "0 0 10px 0",
    fontSize: 16,
    fontWeight: 600,
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  tetris: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
    flexDirection: "column",
    fontSize: 12,
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const StoreStyles = createUnifiedStyles(StoreStyleDefs)

// Type for the hook return value
type StoreStylesHook = {
  [K in keyof typeof StoreStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useStoreStyles = createStyleHook<StoreStylesHook>(StoreStyles)
