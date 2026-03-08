/**
 * Generated from Weather.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const WeatherStyleDefs = {
  weather: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 13,
    gap: 5,
    padding: "8px 3px",
    color: "var(--shade-8)",
  },
  location: {
    base: {
      padding: 0,
      margin: 0,
      color: "var(--accent-6)",
      fontSize: 14,
    },
    hover: {
      color: "var(--accent-5)",
    },
  },
  info: {
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const WeatherStyles = createUnifiedStyles(WeatherStyleDefs)

// Type for the hook return value
type WeatherStylesHook = {
  [K in keyof typeof WeatherStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useWeatherStyles =
  createStyleHook<WeatherStylesHook>(WeatherStyles)
