/**
 * Cross-platform animation utilities
 *
 * Platform-specific implementations:
 * - animation.web.ts: Motion/Framer Motion (web builds)
 * - animation.native.ts: Moti (React Native builds)
 *
 * This file serves as the default export for web builds.
 */

export * from "./animation.web"
