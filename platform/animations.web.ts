/**
 * Web animations using React Spring
 * Respects reduced motion preferences
 */

import { useReducedMotion as useReducedMotionWeb } from "@react-spring/web"

// Helper to convert px to rem
export const toRem = (value: number): string => `${value / 16}rem`

// Web reduced motion hook
export const useReducedMotion = () => {
  return useReducedMotionWeb()
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
        transform: isActive ? "translateY(0px)" : "translateY(10px)",
        immediate,
        config: animationConfigs.normal,
      }

    case "slideDown":
      return {
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0px)" : "translateY(-10px)",
        immediate,
        config: animationConfigs.normal,
      }

    case "slideLeft":
      return {
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateX(0px)" : "translateX(10px)",
        immediate,
        config: animationConfigs.normal,
      }

    case "slideRight":
      return {
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateX(0px)" : "translateX(-10px)",
        immediate,
        config: animationConfigs.normal,
      }

    case "scale":
    case "scaleIn":
      return {
        opacity: isActive ? 1 : 0,
        transform: isActive ? "scale(1)" : "scale(0.95)",
        immediate,
        config: animationConfigs.fast,
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
        transform: isActive ? "scale(1)" : "scale(0.9)",
        opacity: isActive ? 1 : 0.7,
        immediate,
        config: animationConfigs.normal,
      }

    case "float":
      return {
        transform: isActive ? "translateY(0px)" : "translateY(-5px)",
        immediate,
        config: animationConfigs.slow,
      }

    case "wiggle":
      return {
        transform: isActive ? "rotate(0deg)" : "rotate(-5deg)",
        immediate,
        config: animationConfigs.fast,
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
