/**
 * Generated from Affiliate.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AffiliateStyleDefs = {
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
  hero: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  h1: {
    margin: 0,
    color: "#f87171",
  },
  subtitle: {
    fontSize: 16,
    color: "var(--text-secondary)",
  },
  benefits: {
    margin: "20px 0 10px 0",
  },
  h2: {
    textAlign: "center",
    margin: "0 0 30px 0",
  },
  benefitGrid: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 14,
  },
  benefit: {
    base: {
      flex: 1,
      textAlign: "center",
      borderRadius: 20,
      border: "1px dashed var(--shade-2)",
      backgroundColor: "var(--shade-1)",
      padding: 15,
      minWidth: 150,
      width: "50%",
      color: "var(--text-secondary)",
      marginBottom: "1rem",
    },
    hover: {
      borderStyle: "solid",
    },
  },
  h3: {
    margin: "10px 0",
  },
  earnings: {
    marginBottom: 20,
  },
  earningsh2: {
    textAlign: "center",
    margin: "25px 0",
    fontSize: 28,
  },
  earningsGrid: {
    display: "flex",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
  earningCard: {
    textAlign: "center",
    padding: 20,
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--shade-1)",
    maxWidth: "47%",
  },
  commission: {
    color: "#f5a623",
  },
  price: {},
  detail: {
    opacity: 0.9,
    fontSize: "0.9rem",
  },
  earningCardPlus: {
    border: "2px solid #f87171",
  },
  earningCardPro: {
    border: "2px solid #f5a623",
  },
  earningCardh3: {
    margin: "10px 0",
    fontSize: 22,
  },
  example: {
    textAlign: "center",
    padding: 10,
    marginTop: 10,
    borderRadius: 12,
  },
  strong: {
    color: "var(--primary)",
  },
  howItWorks: {
    textAlign: "center",
    margin: "0 0 20px 0",
    fontSize: 15,
  },
  steps: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  step: {
    textAlign: "center",
    maxWidth: 200,
    fontSize: "1.3rem",
    marginBottom: "0.5rem",
    color: "var(--text-secondary)",
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    backgroundColor: "var(--shade-4)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    margin: "0 auto 1rem",
  },
  cta: {
    textAlign: "center",
    marginTop: 20,
  },
  joinButton: {
    fontWeight: "bold",
  },
  signInNote: {
    marginTop: "1rem",
    color: "var(--text-secondary)",
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

export const AffiliateStyles = createUnifiedStyles(AffiliateStyleDefs)

// Type for the hook return value
type AffiliateStylesHook = {
  [K in keyof typeof AffiliateStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useAffiliateStyles =
  createStyleHook<AffiliateStylesHook>(AffiliateStyles)
