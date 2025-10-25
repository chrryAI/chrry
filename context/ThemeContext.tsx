"use client"

/**
 * Cross-platform Theme Context
 * Provides theme colors that work on web (CSS vars) and native (JS values)
 */

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react"
import { usePlatform, useLocalStorage, toast } from "../platform"
import {
  lightTheme,
  darkTheme,
  type Theme,
  resolveCssVar,
  resolveStyleVars,
} from "../styles/theme"
import { session } from "./providers/AuthProvider"
import { useTranslation } from "react-i18next"
import { FRONTEND_URL } from "../utils"

export const COLORS = {
  red: "#ef4444", // red-500
  orange: "#f97316", // orange-500
  blue: "#3b82f6", // blue-500
  green: "#22c55e", // green-500
  violet: "#8b5cf6", // violet-500
  purple: "#a855f7", // purple-500
} as const

export type ColorScheme = keyof typeof COLORS

export type themeType = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  colors: Theme
  colorScheme: string
  reduceMotion: boolean
  setReduceMotion: (reduceMotion: boolean) => void
  setTheme: (theme: themeType) => void
  setColorScheme: (color: string) => void
  enableSound: boolean
  addHapticFeedback: (intensity?: number) => void
  setEnableSound: (enableSound: boolean) => void
  playNotification: () => void
  resolveColor: (cssVar: string) => string
  resolveStyles: (style: Record<string, any>) => Record<string, any>
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  session,
}: {
  children: ReactNode
  session?: session
}) {
  const { isWeb } = usePlatform()
  const { t } = useTranslation()

  // Cross-platform color scheme storage
  const [colorScheme, setColorSchemeInternal] = useLocalStorage<string>(
    "colorScheme",
    session?.app?.themeColor || "orange",
  )

  const setColorScheme = (colorScheme?: string) => {
    if (colorScheme && Object.keys(COLORS).includes(colorScheme)) {
      setColorSchemeInternal(colorScheme)
    }
  }

  // Cross-platform theme (dark/light) storage
  // Default to "dark" if HTML element has "dark" class (from SSR), otherwise "light"
  const getInitialTheme = (): themeType => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light"
    }
    return "dark" // Default to dark for SSR
  }

  const [themeMode, setThemeMode] = useLocalStorage<themeType>(
    "theme",
    getInitialTheme(),
  )

  // Apply color scheme to HTML element (web only)
  useEffect(() => {
    if (isWeb && typeof document !== "undefined") {
      // Remove all color classes
      Object.keys(COLORS).forEach((key) => {
        document.querySelector("html")?.classList.remove(key)
      })
      // Add current color class
      document.querySelector("html")?.classList.add(colorScheme)
    }
  }, [colorScheme, isWeb])

  const playLongPop = async () => {
    if (!enableSound) return
    try {
      console.log("Playing long pop")
      const audio = new Audio()
      audio.src = `${FRONTEND_URL}/sounds/long-pop.wav`
      audio.volume = 0.5

      audio.load()
      await audio.play().catch((error) => {
        console.log("Audio playback failed:", error)
      })
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }

  const playSillyPopCluster = async () => {
    if (!enableSound) return
    try {
      const audio = new Audio()
      audio.src = `${FRONTEND_URL}/sounds/silly-pop-cluster.wav`
      audio.volume = 0.5

      audio.load()
      await audio.play().catch((error) => {
        console.log("Audio playback failed:", error)
      })
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }

  // Apply dark/light mode to HTML element (web only)
  useEffect(() => {
    if (isWeb && typeof document !== "undefined") {
      const html = document.documentElement

      if (themeMode === "dark") {
        html.classList.add("dark")
        html.style.colorScheme = "dark"
      } else {
        html.classList.remove("dark")
        html.style.colorScheme = "light"
      }
    }
  }, [themeMode, isWeb])

  // Detect initial dark mode preference
  const isDark = useMemo(() => {
    return themeMode === "dark"
  }, [themeMode])

  const theme = isDark ? darkTheme : lightTheme

  // Cross-platform setTheme with analytics
  const setTheme = (newTheme: themeType) => {
    setThemeMode(newTheme)
    // Track theme change (if analytics available)
    if (typeof window !== "undefined" && (window as any).track) {
      ;(window as any).track({
        name: newTheme === "dark" ? "dark_mode" : "light_mode",
      })
    }
  }

  const [enableSound, setEnableSound] = useLocalStorage<boolean>(
    "enableSound",
    true,
  )

  // Note: Favicon updates moved to AppProvider to avoid circular dependency
  // ThemeProvider needs to be available before AppProvider in the hierarchy

  const playNotification = async () => {
    if (!enableSound) return
    try {
      const audio = new Audio()
      audio.src = `${FRONTEND_URL}/sounds/message-pop-alert.mp3`
      audio.volume = 0.5

      audio.load()
      await audio.play().catch((error) => {
        console.log("Audio playback failed:", error)
      })
    } catch (error) {
      // captureException(error)
      console.error("Error playing notification sound:", error)
    }
  }

  const { isExtension, isAndroid } = usePlatform()

  const addHapticFeedback = (intensity = 30) => {
    if (isExtension) return
    if ("vibrate" in navigator) {
      isAndroid && navigator.vibrate(intensity)
    }
  }

  const playHardPopClick = async () => {
    if (!enableSound) return
    try {
      console.log("Playing hard pop click")
      const audio = new Audio()
      audio.src = `${FRONTEND_URL}/sounds/hard-pop-click.wav`
      audio.volume = 0.5

      audio.load()
      await audio.play().catch((error) => {
        console.log("Audio playback failed:", error)
      })
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }

  const [reduceMotion, setReduceMotionInternal] = useLocalStorage<boolean>(
    "reduceMotion",
    false,
  )

  const setReduceMotion = (reduceMotion: boolean) => {
    reduceMotion
      ? toast.error(
          t("Motion Off", {
            duration: 30000,
          }),
        )
      : toast.success(
          t("Motion On", {
            duration: 30000,
          }),
        )
    setReduceMotionInternal(reduceMotion)
  }

  // Resolve CSS variable to actual color value
  const resolveColor = (cssVar: string): string => {
    return resolveCssVar(cssVar, theme, isWeb)
  }

  // Resolve all CSS variables in a style object
  const resolveStyles = (style: Record<string, any>): Record<string, any> => {
    return resolveStyleVars(style, theme, isWeb)
  }

  const value: ThemeContextValue = {
    theme,
    isDark,
    colors: theme,
    colorScheme,
    setTheme,
    setColorScheme,
    resolveColor,
    resolveStyles,
    reduceMotion,
    playNotification,
    enableSound,
    setEnableSound,
    setReduceMotion,
    addHapticFeedback,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

// Convenience hook to get a specific color
export function useThemeColor(colorKey: keyof Theme): string {
  const { colors } = useTheme()
  return String(colors[colorKey])
}

// Convenience hook to resolve CSS variable
export function useResolveColor(cssVar: string): string {
  const { resolveColor } = useTheme()
  return resolveColor(cssVar)
}
