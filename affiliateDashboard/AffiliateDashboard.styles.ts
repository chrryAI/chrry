/**
 * Generated from AffiliateDashboard.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AffiliateDashboardStyleDefs = {
  affiliate: {
    width: "100%",
    maxWidth: 800,
    margin: "0 auto",
    padding: 5,
    marginBottom: 20,
  },
  loading: {
    textAlign: "center",
    marginTop: 50,
  },
  dashboard: {},
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  h1: {
    marginTop: 5,
    marginBottom: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  status: {},
  statusBadge: {
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 13,
  },
  active: {
    backgroundColor: "var(--accent-4)",
    color: "white",
  },
  inactive: {
    backgroundColor: "var(--shade-2)",
  },
  linkSection: {
    marginBottom: 30,
    backgroundColor: "var(--background-secondary)",
  },
  linkSectionH2: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  linkBox: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    marginBottom: "0.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  linkInput: {
    flex: 1,
  },
  copyButton: {},
  linkHelp: {
    fontSize: "0.9rem",
    marginTop: 5,
    color: "var(--accent-1)",
    textAlign: "center",
  },
  payoutSection: {
    textAlign: "center",
    margin: "20px 0",
    padding: 20,
  },
  payoutNote: {
    marginTop: 10,
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  pendingPayoutInfo: {
    padding: 20,
    backgroundColor: "var(--shade-1)",
    border: "1px dashed var(--shade-3)",
    borderRadius: 20,
  },
  pendingBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "var(--shade-0)",
    borderRadius: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  pendingAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "var(--accent-1)",
  },
  pendingDate: {
    fontSize: 14,
    color: "var(--text-secondary)",
    margin: "5px 0",
  },
  pendingNote: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  statsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  statCard: {
    base: {
      padding: 10,
      borderRadius: 20,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      justifyContent: "center",
      minWidth: 150,
      backgroundColor: "var(--shade-1)",
      border: "1px dashed var(--shade-2)",
    },
    hover: {
      borderStyle: "solid",
      backgroundColor: "var(--shade-1)",
    },
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
    textAlign: "center",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    marginBottom: "0.25rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  referralsSection: {
    marginBottom: "3rem",
  },
  referralsSectionH2: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    textAlign: "center",
    margin: "20px 0",
  },
  referralsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  referralStat: {
    base: {
      padding: 15,
      borderRadius: 20,
      border: "1px dashed var(--shade-2)",
      textAlign: "center",
      minWidth: 130,
    },
    hover: {
      borderStyle: "solid",
      backgroundColor: "var(--shade-1)",
    },
  },
  referralLabel: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    marginBottom: "0.5rem",
  },
  referralValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--primary)",
  },
  info: {
    backgroundColor: "var(--shade-1)",
    padding: 15,
    border: "1px solid var(--shade-2)",
    borderRadius: 20,
  },
  infoH3: {
    fontSize: "1.3rem",
    margin: 0,
  },
  infoUl: {
    padding: 0,
    margin: 0,
    marginTop: 5,
  },
  infoUlLi: {
    lineHeight: 1.8,
  },
  infoUlLiStrong: {
    color: "var(--primary)",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
  },
  logo: {
    color: "var(--foreground)",
  },
  goToDashboard: {
    marginTop: 10,
  },
} as const

import { createStyleHook } from "../styles/createStyleHook"
import { createUnifiedStyles } from "../styles/createUnifiedStyles"

export const AffiliateDashboardStyles = createUnifiedStyles(
  AffiliateDashboardStyleDefs,
)

// Type for the hook return value
type AffiliateDashboardStylesHook = {
  [K in keyof typeof AffiliateDashboardStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useAffiliateDashboardStyles =
  createStyleHook<AffiliateDashboardStylesHook>(AffiliateDashboardStyles)
