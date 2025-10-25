/**
 * Native animations using React Spring
 * Respects reduced motion preferences via AccessibilityInfo
 */

import { AccessibilityInfo } from "react-native"
import { useState, useEffect } from "react"

// Helper to convert px to rem (same as web for consistency)
export const toRem = (value: number): string => `${value / 16}rem`

// Native reduced motion hook using AccessibilityInfo
export const useReducedMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    // Check if reduce motion is enabled
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled)
    })

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    )

    return () => {
      subscription.remove()
    }
  }, [])

  return reduceMotion
}

// Common animation configs
export const animationConfigs = {
  fast: { duration: 150 },
  normal: { duration: 250 },
  slow: { duration: 400 },
  spring: { tension: 280, friction: 60 },
}

// Animation presets (matching SCSS animations)
export type AnimationPreset =
  | "fade"
  | "fadeIn"
  | "fadeOut"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scale"
  | "scaleIn"
  | "blink"
  | "pulse"
  | "float"
  | "wiggle"
  | "none"

export const getAnimationConfig = (
  preset: AnimationPreset,
  isActive: boolean,
  reduceMotion: boolean | null,
) => {
  const immediate = reduceMotion || false

  switch (preset) {
    case "fade":
      return {
        opacity: isActive ? 1 : 0,
        immediate,
        config: animationConfigs.normal,
      }

    case "slideUp":
      return {
        opacity: isActive ? 1 : 0,
        translateY: isActive ? 0 : 30,
        immediate,
        config: { tension: 180, friction: 20 },
      }

    case "slideDown":
      return {
        opacity: isActive ? 1 : 0,
        translateY: isActive ? 0 : -30,
        immediate,
        config: { tension: 180, friction: 20 },
      }

    case "slideLeft":
      return {
        opacity: isActive ? 1 : 0,
        translateX: isActive ? 0 : 30,
        immediate,
        config: { tension: 180, friction: 20 },
      }

    case "slideRight":
      return {
        opacity: isActive ? 1 : 0,
        translateX: isActive ? 0 : -30,
        immediate,
        config: { tension: 180, friction: 20 },
      }

    case "scale":
    case "scaleIn":
      return {
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.5,
        immediate,
        config: { tension: 200, friction: 15 },
      }

    case "fadeIn":
      return {
        opacity: isActive ? 1 : 0,
        immediate,
        config: animationConfigs.normal,
      }

    case "fadeOut":
      return {
        opacity: isActive ? 0 : 1,
        immediate,
        config: animationConfigs.normal,
      }

    case "blink":
      return {
        opacity: isActive ? 1 : 0,
        immediate,
        config: animationConfigs.fast,
      }

    case "pulse":
      return {
        scale: isActive ? 1 : 0.7,
        opacity: isActive ? 1 : 0.5,
        immediate,
        config: { tension: 150, friction: 10 },
      }

    case "float":
      return {
        translateY: isActive ? 0 : -15,
        opacity: isActive ? 1 : 0.8,
        immediate,
        config: { tension: 120, friction: 14 },
      }

    case "wiggle":
      return {
        rotate: isActive ? "0deg" : "-15deg",
        opacity: isActive ? 1 : 0,
        immediate,
        config: { tension: 300, friction: 10 },
      }

    case "none":
    default:
      return {
        opacity: 1,
        immediate: true,
      }
  }
}

// Legacy configs for backward compatibility
export const fadeInConfig = (reduceMotion: boolean) =>
  getAnimationConfig("fade", true, reduceMotion)

export const slideInConfig = (reduceMotion: boolean, distance = -20) => ({
  from: reduceMotion
    ? { opacity: 1, transform: "translateX(0)" }
    : { opacity: 0, transform: `translateX(${toRem(distance)})` },
  to: { opacity: 1, transform: "translateX(0)" },
  immediate: reduceMotion,
  config: animationConfigs.normal,
})

export const scaleConfig = (reduceMotion: boolean) =>
  getAnimationConfig("scale", true, reduceMotion)
