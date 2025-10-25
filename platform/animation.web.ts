/**
 * Web Animation (Motion)
 */

// Motion utilities for web
export { animate, stagger, scroll, inView } from "motion"

// Re-export common animation utilities
export type { AnimationOptions } from "motion"

// Moti doesn't work on web without react-native-reanimated
// So we don't export Moti components here
