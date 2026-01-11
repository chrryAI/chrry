"use client"

import React, { createContext, useContext, ReactNode, useMemo } from "react"
import { AppStyleDefs } from "../App.styles"
import { StoreStyleDefs } from "../Store.styles"
import { UtilsStyleDefs } from "../utils.styles"
import { SkeletonStyleDefs } from "../Skeleton.styles"

// Style object that can be spread directly into style prop
// Also has className property for CSS classes and style property for inline styles
type StyleObject = {
  style: Record<string, any>
  className: string
}

// Automatically derive type from AppStyleDefs
type AppStylesType = {
  [K in keyof typeof AppStyleDefs]: StyleObject
}

// Automatically derive type from UtilsStyleDefs
type UtilitiesType = {
  [K in keyof typeof UtilsStyleDefs]: StyleObject
}

type StoreStylesType = {
  [K in keyof typeof StoreStyleDefs]: StyleObject
}

// Automatically derive type from SkeletonStyleDefs
type SkeletonStylesType = {
  [K in keyof typeof SkeletonStyleDefs]: StyleObject
}

type StylesContextType = {
  appStyles: AppStylesType
  utilities: UtilitiesType
  skeletonStyles: SkeletonStylesType
  storeStyles: StoreStylesType
}

const StylesContext = createContext<StylesContextType | null>(null)

export const StylesProvider = ({ children }: { children: ReactNode }) => {
  // Dynamically create styles that can be spread directly
  const appStyles = useMemo(() => {
    const styles: any = {}
    for (const [key, styleDef] of Object.entries(AppStyleDefs)) {
      const hasInteractive = typeof styleDef === "object" && "base" in styleDef
      const baseStyle = hasInteractive ? (styleDef as any).base : styleDef

      // Create a style object with both style and className properties
      styles[key] = {
        style: baseStyle,
        className: key,
      }
    }
    return styles as AppStylesType
  }, [])

  // Dynamically create utilities that can be spread directly
  const utilities = useMemo(() => {
    const styles: any = {}
    for (const [key, styleDef] of Object.entries(UtilsStyleDefs)) {
      const hasInteractive = typeof styleDef === "object" && "base" in styleDef
      const baseStyle = hasInteractive ? (styleDef as any).base : styleDef

      // Create a style object with both style and className properties
      styles[key] = {
        style: baseStyle,
        className: key,
      }
    }
    return styles as UtilitiesType
  }, [])

  // Dynamically create skeleton styles that can be spread directly
  const skeletonStyles = useMemo(() => {
    const styles: any = {}
    for (const [key, styleDef] of Object.entries(SkeletonStyleDefs)) {
      const hasInteractive = typeof styleDef === "object" && "base" in styleDef
      const baseStyle = hasInteractive ? (styleDef as any).base : styleDef

      // Create a style object with both style and className properties
      styles[key] = {
        style: baseStyle,
        className: key,
      }
    }
    return styles as SkeletonStylesType
  }, [])

  // Dynamically create store styles that can be spread directly
  const storeStyles = useMemo(() => {
    const styles: any = {}
    for (const [key, styleDef] of Object.entries(StoreStyleDefs)) {
      const hasInteractive = typeof styleDef === "object" && "base" in styleDef
      const baseStyle = hasInteractive ? (styleDef as any).base : styleDef

      // Create a style object with both style and className properties
      styles[key] = {
        style: baseStyle,
        className: key,
      }
    }
    return styles as StoreStylesType
  }, [])

  return (
    <StylesContext.Provider
      value={{ appStyles, utilities, skeletonStyles, storeStyles }}
    >
      {children}
    </StylesContext.Provider>
  )
}

export const useStyles = () => {
  const context = useContext(StylesContext)
  if (!context) {
    throw new Error("useStyles must be used within StylesProvider")
  }
  return context
}
